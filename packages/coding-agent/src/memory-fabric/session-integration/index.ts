/**
 * Memory Fabric — session integration barrel.
 *
 * The lifecycle seam: event vocabulary, an in-process bus, a deadline guard, a
 * context renderer, the no-op participant, the guardian participant that
 * translates lifecycle events into guardian ones, the resolver that decides
 * which of the two a session gets, the composite that fans a single lifecycle
 * out to several participants, and the bridge that drives all of it from a
 * session.
 *
 * Like `context-hygiene/`, this is deliberately NOT re-exported from
 * `memory-fabric/index.ts`. Nothing here subscribes itself or installs itself
 * into a session; a caller must construct a bus and register participants
 * explicitly, so the layer stays off the hot path until it is adopted on
 * purpose.
 */

export * from "./bridge";
export * from "./composite-participant";
export * from "./context-injection";
export * from "./create-participant";
export * from "./deadline";
export * from "./event-bus";
export * from "./guardian-participant";
export * from "./noop-participant";
export * from "./types";
