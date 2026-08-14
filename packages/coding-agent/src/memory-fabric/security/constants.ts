/**
 * Security & resilience — shared constants.
 *
 * Split out of the type module so that `types.ts` can stay purely declarative
 * (import-type-only under `verbatimModuleSyntax`) while consumers that only
 * need the guard identity do not have to import the engine.
 */

/** Stable identity for the security guard, emitted on every telemetry event. */
export const SECURITY_GUARD_NAME = "memory-fabric.security-guard";

/** Bumped whenever the outcome shape or a decision rule changes. */
export const SECURITY_GUARD_VERSION = 1;

/**
 * Substituted when even the conservative fallback redactor cannot produce a
 * value we are willing to hand onwards.
 */
export const UNSAFE_PLACEHOLDER = "[REDACTED:UNSAFE]";

/** Minimum length of a token run before the entropy heuristic considers it. */
export const HIGH_ENTROPY_RUN = 20;
