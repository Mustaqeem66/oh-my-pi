import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "bun:test";
import * as path from "node:path";
import { scheduler } from "node:timers/promises";
import { Agent } from "@oh-my-pi/pi-agent-core";
import { createMockModel } from "@oh-my-pi/pi-ai/providers/mock";
import { getBundledModel } from "@oh-my-pi/pi-catalog/models";
import { ModelRegistry } from "@oh-my-pi/pi-coding-agent/config/model-registry";
import { Settings } from "@oh-my-pi/pi-coding-agent/config/settings";
import { initTheme } from "@oh-my-pi/pi-coding-agent/modes/theme/theme";
import { AgentSession, type AgentSessionEvent } from "@oh-my-pi/pi-coding-agent/session/agent-session";
import { AuthStorage } from "@oh-my-pi/pi-coding-agent/session/auth-storage";
import { SessionManager } from "@oh-my-pi/pi-coding-agent/session/session-manager";
import { TempDir } from "@oh-my-pi/pi-utils";

type AutoRetryStartEvent = Extract<AgentSessionEvent, { type: "auto_retry_start" }>;

// Bun surfaces a dropped socket with this exact wording, and it is what the
// reporter of issue #9165 saw while switching proxies mid-turn. It carries no
// HTTP status: nothing on the far side ever answered.
const LOCAL_SOCKET_CLOSE_ERROR = "The socket connection was closed unexpectedly";
// A provider that answered — the fault is route-specific, so an instant model
// switch stays correct.
const PROVIDER_OVERLOAD_ERROR = "overloaded_error: provider returned error 503";

describe("AgentSession retry fallback backoff on network failures", () => {
	let tempDir: TempDir;
	let authStorage: AuthStorage;
	let sharedRegistry: ModelRegistry;
	let modelRegistry: ModelRegistry;
	let session: AgentSession | undefined;

	beforeAll(async () => {
		tempDir = TempDir.createSync("@pi-retry-network-fallback-");
		await initTheme();
		authStorage = await AuthStorage.create(path.join(tempDir.path(), "testauth.db"));
		authStorage.setRuntimeApiKey("anthropic", "anthropic-test-key");
		authStorage.setRuntimeApiKey("openai", "openai-test-key");
		sharedRegistry = new ModelRegistry(authStorage, path.join(tempDir.path(), "models.yml"));
	});

	afterAll(() => {
		authStorage.close();
		tempDir.removeSync();
	});

	beforeEach(() => {
		modelRegistry = sharedRegistry;
		modelRegistry.clearSuppressedSelectors();
	});

	afterEach(async () => {
		if (session) {
			await session.dispose();
			session = undefined;
		}
		vi.restoreAllMocks();
	});

	/**
	 * Builds a session whose primary model always fails with `failure` and whose
	 * last chain entry recovers, so the fallback chain is walked end to end.
	 */
	function createChainSession(failure: string): {
		retryStartEvents: AutoRetryStartEvent[];
		requestedModels: string[];
	} {
		const primaryModel = getBundledModel("anthropic", "claude-sonnet-4-5");
		const firstFallback = getBundledModel("openai", "gpt-4o-mini");
		const secondFallback = getBundledModel("openai", "gpt-4o");
		if (!primaryModel || !firstFallback || !secondFallback) {
			throw new Error("Expected bundled test models to exist");
		}

		const requestedModels: string[] = [];
		const mock = createMockModel();
		const agent = new Agent({
			getApiKey: model => `${model.provider}-test-key`,
			initialState: {
				model: primaryModel,
				systemPrompt: ["Test"],
				tools: [],
				messages: [],
			},
			streamFn: (model, context, options) => {
				requestedModels.push(`${model.provider}/${model.id}`);
				if (model.provider === secondFallback.provider && model.id === secondFallback.id) {
					mock.push({ content: ["Recovered on second fallback"] });
				} else {
					mock.push({ throw: failure });
				}
				return mock.stream(model, context, options);
			},
		});

		const settings = Settings.isolated({
			"compaction.enabled": false,
			"retry.baseDelayMs": 400,
			"retry.maxRetries": 3,
			"retry.fallbackChains": {
				default: [
					`${firstFallback.provider}/${firstFallback.id}`,
					`${secondFallback.provider}/${secondFallback.id}`,
				],
			},
		});
		settings.setModelRole("default", `${primaryModel.provider}/${primaryModel.id}`);

		session = new AgentSession({
			agent,
			sessionManager: SessionManager.inMemory(),
			settings,
			modelRegistry,
		});

		const retryStartEvents: AutoRetryStartEvent[] = [];
		session.subscribe(event => {
			if (event.type === "auto_retry_start") retryStartEvents.push(event);
		});
		return { retryStartEvents, requestedModels };
	}

	it("keeps the configured backoff when model fallback follows a local transport failure", async () => {
		// Regression: issue #9165. A dropped socket is not a model fault — every
		// entry in `fallbackChains` dials the same dead network. Zeroing the delay
		// on the model switch burned the whole chain within milliseconds and ended
		// the turn without ever honoring `retry.baseDelayMs`.
		const waitSpy = vi.spyOn(scheduler, "wait").mockResolvedValue(undefined);
		const { retryStartEvents, requestedModels } = createChainSession(LOCAL_SOCKET_CLOSE_ERROR);

		await session?.prompt("Recover from a proxy switch");
		await session?.waitForIdle();

		// The chain is still walked — this fix changes the pacing, not the routing.
		expect(requestedModels).toHaveLength(3);
		expect(retryStartEvents).toHaveLength(2);
		for (const event of retryStartEvents) {
			expect(event.errorMessage).toBe(LOCAL_SOCKET_CLOSE_ERROR);
			expect(event.delayMs).toBeGreaterThan(0);
		}
		// And the backoff is actually slept on, not merely reported.
		for (const call of waitSpy.mock.calls) {
			expect(call[0]).toBeGreaterThan(0);
		}
		expect(waitSpy).toHaveBeenCalled();
	});

	it("still switches models without delay for a provider-side transient rejection", async () => {
		// Control for the case above: a 503 proves the provider was reachable, so
		// the failure is route-specific and another model can serve immediately.
		vi.spyOn(scheduler, "wait").mockResolvedValue(undefined);
		const { retryStartEvents, requestedModels } = createChainSession(PROVIDER_OVERLOAD_ERROR);

		await session?.prompt("Recover from provider overload");
		await session?.waitForIdle();

		expect(requestedModels).toHaveLength(3);
		expect(retryStartEvents.map(event => event.delayMs)).toEqual([0, 0]);
	});
});
