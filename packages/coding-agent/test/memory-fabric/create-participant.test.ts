import { describe, expect, it } from "bun:test";
import { SessionEventBus } from "@oh-my-pi/pi-coding-agent/memory-fabric/guardian/event-bus";
import type { GuardianPendingInjection } from "@oh-my-pi/pi-coding-agent/memory-fabric/guardian/integration";
import { NoopSessionMemoryParticipant } from "@oh-my-pi/pi-coding-agent/memory-fabric/session-integration";
import {
	type CreateParticipantOptions,
	createSessionMemoryParticipant,
} from "@oh-my-pi/pi-coding-agent/memory-fabric/session-integration/create-participant";
import {
	type GuardianInjectionSource,
	GuardianSessionParticipant,
	type GuardianSessionParticipantOptions,
} from "@oh-my-pi/pi-coding-agent/memory-fabric/session-integration/guardian-participant";

const injections: GuardianInjectionSource = {
	whenIdle: async () => {},
	takeInjection: (): GuardianPendingInjection | null => null,
	peekInjection: (): GuardianPendingInjection | null => null,
};

function guardianOptions(): GuardianSessionParticipantOptions {
	return { bus: new SessionEventBus(), injections };
}

/**
 * Options whose first read throws, which is the only way construction can fail
 * from the outside — the constructor itself only reads its arguments.
 */
function explodingOptions(): GuardianSessionParticipantOptions {
	return {
		get bus(): SessionEventBus {
			throw new Error("boom");
		},
		injections,
	};
}

describe("createSessionMemoryParticipant", () => {
	it("returns the no-op when given nothing at all", () => {
		expect(createSessionMemoryParticipant()).toBeInstanceOf(NoopSessionMemoryParticipant);
	});

	it("prefers an explicitly supplied participant over every other rung", () => {
		const supplied = new NoopSessionMemoryParticipant();
		const options: CreateParticipantOptions = {
			testParticipant: supplied,
			disabled: true,
			guardian: guardianOptions(),
		};

		expect(createSessionMemoryParticipant(options)).toBe(supplied);
	});

	it("returns the no-op when memory is switched off, even with a guardian configured", () => {
		const participant = createSessionMemoryParticipant({ disabled: true, guardian: guardianOptions() });

		expect(participant).toBeInstanceOf(NoopSessionMemoryParticipant);
	});

	it("treats absent guardian configuration as off rather than as an error", () => {
		expect(createSessionMemoryParticipant({})).toBeInstanceOf(NoopSessionMemoryParticipant);
	});

	it("builds the guardian participant when there is something to build it from", () => {
		const participant = createSessionMemoryParticipant({ guardian: guardianOptions() });

		expect(participant).toBeInstanceOf(GuardianSessionParticipant);
	});

	it("degrades to the no-op when construction throws", () => {
		const errors: unknown[] = [];

		const participant = createSessionMemoryParticipant({
			guardian: explodingOptions(),
			onError: error => errors.push(error),
		});

		expect(participant).toBeInstanceOf(NoopSessionMemoryParticipant);
		expect(errors).toHaveLength(1);
		expect((errors[0] as Error).message).toBe("boom");
	});

	it("reports the failure it degraded from rather than swallowing it", () => {
		let reported: unknown = null;

		createSessionMemoryParticipant({
			guardian: explodingOptions(),
			failOpen: true,
			onError: error => {
				reported = error;
			},
		});

		expect(reported).toBeInstanceOf(Error);
	});

	it("refuses to start when the caller opted out of failing open", () => {
		expect(() => createSessionMemoryParticipant({ guardian: explodingOptions(), failOpen: false })).toThrow("boom");
	});
});
