import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { EventJournal } from "@oh-my-pi/pi-coding-agent/memory-fabric/persistence/event-journal";
import type { PersistenceScope } from "@oh-my-pi/pi-coding-agent/memory-fabric/persistence/types";

const SCOPE: PersistenceScope = { projectId: "proj-a" };

describe("EventJournal", () => {
	let dir: string;
	let journal: EventJournal;

	beforeEach(() => {
		dir = fs.mkdtempSync(path.join(os.tmpdir(), "omp-journal-"));
		journal = new EventJournal({ directory: dir, scope: SCOPE });
	});

	afterEach(() => {
		journal.close();
		fs.rmSync(dir, { recursive: true, force: true });
	});

	it("assigns monotonically increasing sequence numbers", () => {
		const first = journal.append({ type: "record-created", payload: { a: 1 } });
		const second = journal.append({ type: "record-created", payload: { a: 2 } });
		expect(first.seq).toBe(1);
		expect(second.seq).toBe(2);
	});

	it("reads an event back by seq via the index", () => {
		journal.append({ type: "noise", payload: {} });
		const target = journal.append({ type: "record-created", recordId: "rec-1", payload: { detail: "yes" } });
		journal.append({ type: "noise", payload: {} });

		const read = journal.read(target.seq);
		expect(read).not.toBeNull();
		expect(read?.type).toBe("record-created");
		expect(read?.recordId).toBe("rec-1");
		expect(read?.payload).toEqual({ detail: "yes" });
	});

	it("returns null for an unknown seq", () => {
		expect(journal.read(999)).toBeNull();
	});

	it("round-trips non-ASCII payloads through byte-offset reads", () => {
		journal.append({ type: "pad", payload: { text: "héllo wörld — ünïcode 日本語 🎯" } });
		const target = journal.append({ type: "target", payload: { text: "après ça, 中文 test ✓" } });

		const read = journal.read(target.seq);
		expect(read?.payload).toEqual({ text: "après ça, 中文 test ✓" });
	});

	it("queries by type and recordId, newest first", () => {
		journal.append({ type: "a", recordId: "rec-1", payload: {} });
		journal.append({ type: "b", recordId: "rec-1", payload: {} });
		journal.append({ type: "a", recordId: "rec-2", payload: {} });

		const byType = journal.query({ type: "a" });
		expect(byType.map(event => event.seq)).toEqual([3, 1]);

		const byRecord = journal.query({ recordId: "rec-1" });
		expect(byRecord.map(event => event.type)).toEqual(["b", "a"]);

		const both = journal.query({ type: "a", recordId: "rec-1" });
		expect(both).toHaveLength(1);
	});

	it("expresses retraction as a tombstone instead of deleting history", () => {
		journal.append({ type: "record-created", recordId: "rec-1", payload: {} });
		const tombstone = journal.tombstone("rec-1", "user requested forget");

		expect(tombstone.type).toBe("tombstone");
		expect(journal.query({ recordId: "rec-1" })).toHaveLength(2);
		expect(journal.read(tombstone.seq)?.payload).toEqual({ reason: "user requested forget" });
	});

	it("recovers the index from the journal after the index is lost", () => {
		journal.append({ type: "a", payload: { n: 1 } });
		journal.append({ type: "b", recordId: "rec-1", payload: { n: 2 } });
		journal.append({ type: "c", payload: { text: "ünïcode 🎯" } });
		journal.close();

		fs.rmSync(path.join(dir, "proj-a_journal_index.sqlite"));
		journal = new EventJournal({ directory: dir, scope: SCOPE });

		expect(journal.read(2)?.recordId).toBe("rec-1");
		expect(journal.read(3)?.payload).toEqual({ text: "ünïcode 🎯" });

		const next = journal.append({ type: "d", payload: {} });
		expect(next.seq).toBe(4);
	});

	it("continues sequence numbers across reopen", () => {
		journal.append({ type: "a", payload: {} });
		journal.append({ type: "b", payload: {} });
		journal.close();

		journal = new EventJournal({ directory: dir, scope: SCOPE });
		expect(journal.append({ type: "c", payload: {} }).seq).toBe(3);
	});

	it("skips a truncated trailing line and keeps appending after it", () => {
		journal.append({ type: "a", payload: {} });
		journal.close();

		fs.appendFileSync(path.join(dir, "proj-a_journal.jsonl"), '{"seq":2,"type":"torn', "utf8");
		journal = new EventJournal({ directory: dir, scope: SCOPE });

		const next = journal.append({ type: "b", payload: {} });
		expect(next.seq).toBe(2);
		expect(journal.read(next.seq)?.type).toBe("b");
	});
});
