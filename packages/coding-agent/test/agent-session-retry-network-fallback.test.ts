import { describe, expect, it } from "bun:test";
import * as AIError from "@oh-my-pi/pi-ai/error";
import {
	LOCAL_TRANSPORT_FAILURE_RE,
	isLocalTransportFailure,
} from "@oh-my-pi/pi-coding-agent/session/retry-transport-failure";

// Classified error ids as `AIError.classifyMessage` produces them. The reporter
// of issue #9165 attached 135168 (Class|Transient) and 397312
// (Class|Transient|Timeout) to their session log.
const TRANSIENT = AIError.create(AIError.Flag.Transient);
const TRANSIENT_TIMEOUT = AIError.create(AIError.Flag.Transient, AIError.Flag.Timeout);
const TRANSIENT_USAGE_LIMIT = AIError.create(AIError.Flag.Transient, AIError.Flag.UsageLimit);
const CONTEXT_OVERFLOW = AIError.create(AIError.Flag.ContextOverflow);

// Bun's exact wording for a dropped socket, and what the reporter saw while
// switching proxies mid-turn. Nothing on the far side ever answered.
const SOCKET_CLOSED = "The socket connection was closed unexpectedly";
const CONNECTION_REFUSED = "fetch failed: connect ECONNREFUSED 127.0.0.1:8787";
const DNS_FAILURE = "fetch failed: getaddrinfo EAI_AGAIN api.anthropic.com";
const FIRST_EVENT_TIMEOUT = "Timed out waiting for the first event";
const SOCKET_HANG_UP = "socket hang up";

const PROVIDER_OVERLOADED = "overloaded_error: provider returned error 503";
const PROVIDER_RATE_LIMITED = "rate_limit_error: too many requests";
const TRANSPORT_WORDING_WITH_STATUS = "fetch failed with status 503";
const NOT_A_TRANSPORT_FAULT = "thought-only response without final output";

describe("isLocalTransportFailure", () => {
	it("pins the reporter's error ids to the documented flag combinations", () => {
		// Guards the premise of issue #9165: these are the exact ids the
		// reporter saw, so the predicate must key off the flags producing them.
		expect(TRANSIENT).toBe(135168);
		expect(TRANSIENT_TIMEOUT).toBe(397312);
	});

	describe("local transport faults keep the backoff", () => {
		it("treats an unexpectedly closed socket as local", () => {
			expect(isLocalTransportFailure(TRANSIENT, SOCKET_CLOSED, undefined)).toBe(true);
		});

		it("treats a refused connection as local", () => {
			expect(isLocalTransportFailure(TRANSIENT, CONNECTION_REFUSED, undefined)).toBe(true);
		});

		it("treats a DNS failure as local", () => {
			expect(isLocalTransportFailure(TRANSIENT, DNS_FAILURE, undefined)).toBe(true);
		});

		it("treats a stream with no first event as local", () => {
			expect(isLocalTransportFailure(TRANSIENT_TIMEOUT, FIRST_EVENT_TIMEOUT, undefined)).toBe(true);
		});

		it("treats a socket hang up as local", () => {
			expect(isLocalTransportFailure(TRANSIENT, SOCKET_HANG_UP, undefined)).toBe(true);
		});
	});

	describe("route-specific rejections keep the instant model switch", () => {
		it("rejects an overloaded provider that answered with 503", () => {
			expect(isLocalTransportFailure(TRANSIENT, PROVIDER_OVERLOADED, 503)).toBe(false);
		});

		it("rejects a rate limit that answered with 429", () => {
			expect(isLocalTransportFailure(TRANSIENT, PROVIDER_RATE_LIMITED, 429)).toBe(false);
		});

		it("rejects transport wording that still carries a parsed status", () => {
			// `fetch failed` matches the local pattern, but a status means the
			// far side answered. The discriminator is the absence of a status,
			// not the wording.
			expect(isLocalTransportFailure(TRANSIENT, TRANSPORT_WORDING_WITH_STATUS, undefined)).toBe(false);
		});

		it("rejects a connection error that answered with 500", () => {
			expect(isLocalTransportFailure(TRANSIENT, "connection error", 500)).toBe(false);
		});

		it("rejects an account-scoped usage cap", () => {
			// Rotating to another model is the right instant recovery here.
			expect(isLocalTransportFailure(TRANSIENT_USAGE_LIMIT, SOCKET_HANG_UP, undefined)).toBe(false);
		});
	});

	describe("non-retryable and malformed inputs", () => {
		it("rejects an error that is neither transient nor a timeout", () => {
			expect(isLocalTransportFailure(CONTEXT_OVERFLOW, "fetch failed", undefined)).toBe(false);
		});

		it("rejects an undefined error id", () => {
			expect(isLocalTransportFailure(undefined, "fetch failed", undefined)).toBe(false);
		});

		it("rejects a transient error with no message to classify", () => {
			expect(isLocalTransportFailure(TRANSIENT, undefined, undefined)).toBe(false);
		});

		it("rejects transient wording that is not a transport fault", () => {
			expect(isLocalTransportFailure(TRANSIENT, NOT_A_TRANSPORT_FAULT, undefined)).toBe(false);
		});
	});
});

describe("LOCAL_TRANSPORT_FAILURE_RE", () => {
	it("stays narrower than the generic transient-transport wording", () => {
		// If this ever matches, the predicate would swallow route-specific
		// provider rejections and stall a fallback that should switch instantly.
		expect(LOCAL_TRANSPORT_FAILURE_RE.test("overloaded_error")).toBe(false);
		expect(LOCAL_TRANSPORT_FAILURE_RE.test("rate_limit_error")).toBe(false);
		expect(LOCAL_TRANSPORT_FAILURE_RE.test("server_error")).toBe(false);
	});
});
