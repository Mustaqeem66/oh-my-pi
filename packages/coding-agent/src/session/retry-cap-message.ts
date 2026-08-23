import { formatDuration } from "@oh-my-pi/pi-utils";

/**
 * Local wall-clock `HH:MM` for a future instant, prefixed with `MM-DD` when it
 * lands on a different calendar day than `nowMs`.
 *
 * @param atMs - Absolute epoch milliseconds of the instant to render.
 * @param nowMs - Reference "now" used to decide whether the date is needed.
 */
export function formatResumeClock(atMs: number, nowMs: number): string {
	const at = new Date(atMs);
	const now = new Date(nowMs);
	if (Number.isNaN(at.getTime()) || Number.isNaN(now.getTime())) return "unknown";
	const pad = (value: number) => String(value).padStart(2, "0");
	const clock = `${pad(at.getHours())}:${pad(at.getMinutes())}`;
	const sameDay =
		at.getFullYear() === now.getFullYear() && at.getMonth() === now.getMonth() && at.getDate() === now.getDate();
	return sameDay ? clock : `${pad(at.getMonth() + 1)}-${pad(at.getDate())} ${clock}`;
}

/** Inputs for {@link formatRetryCapFailure}. */
export interface RetryCapFailureInfo {
	/** Wait the provider asked for, in milliseconds. */
	delayMs: number;
	/** Configured `retry.maxDelayMs` ceiling that the wait exceeded. */
	maxDelayMs: number;
	/** Original provider error, preserved verbatim. */
	errorMessage: string;
	/** Reference "now"; injectable so the rendering is deterministic in tests. */
	now?: number;
}

/**
 * Terminal message for the auto-retry fail-fast cap.
 *
 * Providers report rate-limit windows in raw milliseconds — Anthropic sends
 * `retry-after-ms` values as large as 19,100,000 (~5h18m). A bare millisecond
 * count is not readable at a glance, so users report these stalls as the agent
 * hanging rather than as a rate limit. Pair the raw value with a human duration
 * and the wall-clock time the window clears; the raw milliseconds stay in the
 * string so existing log greps and machine parsing keep working.
 */
export function formatRetryCapFailure(info: RetryCapFailureInfo): string {
	const { delayMs, maxDelayMs, errorMessage } = info;
	const now = info.now ?? Date.now();
	const resumeAt = formatResumeClock(now + delayMs, now);
	return `Provider requested a ${formatDuration(delayMs)} wait (${delayMs}ms), resuming ~${resumeAt}; exceeds retry.maxDelayMs (${formatDuration(maxDelayMs)}). Original error: ${errorMessage}`;
}
