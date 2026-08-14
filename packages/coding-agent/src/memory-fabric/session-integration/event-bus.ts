/**
 * In-process session lifecycle bus.
 *
 * Fans lifecycle events out to subscribed listeners. Two properties matter:
 *
 *   - **It cannot recurse into itself.** Events deeper than `maxDepth` are
 *     dropped, and any event that originates from the memory layer itself
 *     (`origin === "memory-guardian"`) is dropped as soon as it is nested at
 *     all. Memory work that provokes more memory work therefore terminates
 *     instead of amplifying.
 *   - **It is fail-open.** Listeners run under `Promise.allSettled`, so one
 *     listener throwing can neither cancel its siblings nor propagate into the
 *     agent turn that emitted the event. Failures are reported, not raised.
 */

import type { MemoryLifecycleEvent } from "./types";

export type MemoryEventListener = (event: MemoryLifecycleEvent) => Promise<void>;

export interface SessionEventBus {
	emit(event: MemoryLifecycleEvent): Promise<void>;
	subscribe(listener: MemoryEventListener): () => void;
	listenerCount(): number;
}

export class InProcessSessionEventBus implements SessionEventBus {
	readonly #listeners = new Set<MemoryEventListener>();
	readonly #maxDepth: number;
	#sequence = 0;

	constructor(maxDepth = 4) {
		this.#maxDepth = maxDepth;
	}

	/** Register a listener. Returns an idempotent unsubscribe handle. */
	subscribe(listener: MemoryEventListener): () => void {
		this.#listeners.add(listener);
		return () => {
			this.#listeners.delete(listener);
		};
	}

	listenerCount(): number {
		return this.#listeners.size;
	}

	/** Monotonic per-bus sequence, so emitted events can be totally ordered. */
	nextSequence(): number {
		return ++this.#sequence;
	}

	async emit(event: MemoryLifecycleEvent): Promise<void> {
		if (event.metadata.depth > this.#maxDepth) return;
		if (event.metadata.origin === "memory-guardian" && event.metadata.depth > 0) return;
		const results = await Promise.allSettled([...this.#listeners].map(listener => listener(event)));
		for (const result of results) {
			if (result.status === "rejected") {
				console.warn("[memory-fabric] lifecycle listener failed", result.reason);
			}
		}
	}
}
