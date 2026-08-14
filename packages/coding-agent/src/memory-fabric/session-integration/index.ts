/**
 * Memory Fabric — session integration barrel.
 *
 * The lifecycle seam: event vocabulary, an in-process bus, a deadline guard, a
 * context renderer, the no-op participant and the composite that fans a single
 * lifecycle out to several participants.
 *
 * Like `context-hygiene/`, this is deliberately NOT re-exported from
 * `memory-fabric/index.ts`. Nothing here subscribes itself or installs itself
 * into a session; a caller must construct a bus and register participants
 * explicitly, so the layer stays off the hot path until it is adopted on
 * purpose.
 */

export * from "./composite-participant";
export * from "./context-injection";
export * from "./deadline";
export * from "./event-bus";
export * from "./noop-participant";
export * from "./types";
