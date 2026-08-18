/**
 * Tests for the capability orchestration core.
 */

import { describe, expect, it } from "bun:test";
import type { CapabilityDescriptor } from "@oh-my-pi/pi-coding-agent/memory-fabric/capability-orchestration";
import { CapabilityCache, CapabilityPlanner } from "@oh-my-pi/pi-coding-agent/memory-fabric/capability-orchestration";

function descriptor(id: string, overrides: Partial<CapabilityDescriptor> = {}): CapabilityDescriptor {
	return {
		id,
		kind: "tool",
		name: id,
		description: "",
		tags: [],
		version: 1,
		enabled: true,
		...overrides,
	};
}

describe("CapabilityCache", () => {
	it("keeps the declared version on first insert and bumps on re-register", () => {
		const cache = new CapabilityCache();
		cache.registerCapability(descriptor("a", { version: 3 }));
		expect(cache.getCapability("a")?.version).toBe(3);
		cache.registerCapability(descriptor("a", { version: 3 }));
		expect(cache.getCapability("a")?.version).toBe(4);
	});

	it("coerces invalid declared versions to 1", () => {
		const cache = new CapabilityCache();
		cache.registerCapability(descriptor("a", { version: Number.NaN }));
		expect(cache.getCapability("a")?.version).toBe(1);
		cache.registerCapability(descriptor("b", { version: -5 }));
		expect(cache.getCapability("b")?.version).toBe(1);
	});

	it("hides disabled capabilities from lookup, matching, and listing", () => {
		const cache = new CapabilityCache();
		cache.registerCapability(descriptor("off", { enabled: false, description: "deploy things" }));
		expect(cache.getCapability("off")).toBeNull();
		expect(cache.matchCapabilities("deploy")).toEqual([]);
		expect(cache.listCapabilities()).toEqual([]);
	});

	it("ranks matches by raw term-hit ratio and filters by kind", () => {
		const cache = new CapabilityCache();
		cache.registerCapability(descriptor("both", { description: "build deploy" }));
		cache.registerCapability(descriptor("one", { description: "deploy only" }));
		cache.registerCapability(descriptor("sub", { kind: "subagent", description: "build deploy" }));

		const matches = cache.matchCapabilities("build deploy");
		expect(matches[0].descriptor.id).toBe("both");
		expect(matches[0].matchScore).toBe(1);

		const tools = cache.matchCapabilities("build deploy", { kind: "subagent" });
		expect(tools.map(m => m.descriptor.id)).toEqual(["sub"]);
	});

	it("resolves fail-open to the fallback list on zero matches", () => {
		const cache = new CapabilityCache();
		const fallback = [descriptor("fb")];
		expect(cache.resolveCapabilitiesFailOpen("nothing matches", fallback)).toEqual(fallback);
	});

	it("invalidate removes one id or clears everything, bumping the cache version", () => {
		const cache = new CapabilityCache();
		cache.registerCapability(descriptor("a"));
		cache.registerCapability(descriptor("b"));
		const v = cache.getCacheVersion();
		cache.invalidate("a");
		expect(cache.getCapability("a")).toBeNull();
		expect(cache.getCapability("b")).not.toBeNull();
		cache.invalidate();
		expect(cache.listCapabilities()).toEqual([]);
		expect(cache.getCacheVersion()).toBe(v + 2);
	});
});

describe("CapabilityPlanner", () => {
	it("produces an empty plan when rollout mode is off", () => {
		const cache = new CapabilityCache();
		cache.registerCapability(descriptor("a", { description: "deploy" }));
		const planner = new CapabilityPlanner(cache, { rolloutMode: "off" });
		const plan = planner.createExecutionPlan("deploy");
		expect(plan.steps).toEqual([]);
		expect(plan.rolloutMode).toBe("off");
	});

	it("generates deterministic monotonic plan ids by default", () => {
		const planner = new CapabilityPlanner(new CapabilityCache());
		expect(planner.createExecutionPlan("x").planId).toBe("plan-1");
		expect(planner.createExecutionPlan("y").planId).toBe("plan-2");
	});

	it("marks steps approvalRequired from the descriptor flag", () => {
		const cache = new CapabilityCache();
		cache.registerCapability(descriptor("guarded", { description: "deploy", requiresApproval: true }));
		const planner = new CapabilityPlanner(cache);
		const plan = planner.createExecutionPlan("deploy");
		expect(plan.steps[0].approvalRequired).toBe(true);
	});

	it("evaluatePlan pauses every step in suggest mode", () => {
		const cache = new CapabilityCache();
		cache.registerCapability(descriptor("a", { description: "deploy" }));
		const planner = new CapabilityPlanner(cache, { rolloutMode: "suggest" });
		const plan = planner.createExecutionPlan("deploy");
		const decisions = planner.evaluatePlan(plan);
		expect(decisions.every(d => d.approved === false)).toBe(true);
	});

	it("only autonomous mode auto-approves approval-required steps", () => {
		const cache = new CapabilityCache();
		cache.registerCapability(descriptor("guarded", { description: "deploy", requiresApproval: true }));
		const planner = new CapabilityPlanner(cache, { rolloutMode: "active" });
		const plan = planner.createExecutionPlan("deploy");
		expect(planner.evaluatePlan(plan)[0].approved).toBe(false);
		planner.setRolloutMode("autonomous");
		expect(planner.evaluatePlan(plan)[0].approved).toBe(true);
	});
});
