import { describe, expect, it } from "bun:test";
import { formatResumeClock, formatRetryCapFailure } from "@oh-my-pi/pi-coding-agent/session/retry-cap-message";

/**
 * Contract: when the auto-retry cap fires, the terminal message must be
 * legible. Anthropic answers a 429 with `retry-after-ms` values up to
 * 19,100,000; rendering that as a bare millisecond count is why these stalls
 * get reported as the agent hanging instead of as a rate limit.
 *
 * See https://github.com/can1357/oh-my-pi/issues/8829
 */
describe("formatResumeClock", () => {
	const now = new Date(2026, 7, 23, 9, 15, 0).getTime();

	it("renders HH:MM for an instant later the same day", () => {
		const at = new Date(2026, 7, 23, 14, 33, 0).getTime();
		expect(formatResumeClock(at, now)).toBe("14:33");
	});

	it("zero-pads hours and minutes", () => {
		const at = new Date(2026, 7, 23, 9, 5, 0).getTime();
		expect(formatResumeClock(at, now)).toBe("09:05");
	});

	it("prefixes MM-DD once the wait crosses midnight", () => {
		const at = new Date(2026, 7, 26, 11, 15, 0).getTime();
		expect(formatResumeClock(at, now)).toBe("08-26 11:15");
	});

	it("degrades to 'unknown' instead of throwing on a non-finite instant", () => {
		expect(formatResumeClock(Number.NaN, now)).toBe("unknown");
		expect(formatResumeClock(Number.POSITIVE_INFINITY, now)).toBe("unknown");
	});
});

describe("formatRetryCapFailure", () => {
	const now = new Date(2026, 7, 23, 9, 15, 0).getTime();

	it("pairs the raw milliseconds with a human duration and a resume clock", () => {
		// 19,100,000ms is the largest retry-after-ms observed in #8829.
		const message = formatRetryCapFailure({
			delayMs: 19_100_000,
			maxDelayMs: 300_000,
			errorMessage: "429 rate_limit_error",
			now,
		});

		expect(message).toBe(
			"Provider requested a 5h18m wait (19100000ms), resuming ~14:33; exceeds retry.maxDelayMs (5m). Original error: 429 rate_limit_error",
		);
	});

	it("keeps the raw millisecond count so existing log greps still match", () => {
		const message = formatRetryCapFailure({
			delayMs: 11_180_000,
			maxDelayMs: 100,
			errorMessage: "boom",
			now,
		});

		// Assertions mirrored from the agent-session integration test.
		expect(message).toContain("exceeds retry.maxDelayMs");
		expect(message).toContain("11180000");
		expect(message).toContain("3h6m");
	});

	it("dates the resume clock when the window closes on a later day", () => {
		const message = formatRetryCapFailure({
			delayMs: 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
			maxDelayMs: 300_000,
			errorMessage: "boom",
			now,
		});

		expect(message).toContain("a 3d2h wait");
		expect(message).toContain("resuming ~08-26 11:15");
	});

	it("preserves the original provider error verbatim", () => {
		const errorMessage = '429 {"type":"error","error":{"type":"rate_limit_error"}} retry-after-ms=19100000';
		const message = formatRetryCapFailure({ delayMs: 19_100_000, maxDelayMs: 300_000, errorMessage, now });
		expect(message).toEndWith(`Original error: ${errorMessage}`);
	});
});
