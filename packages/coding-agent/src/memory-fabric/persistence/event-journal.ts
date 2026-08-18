/**
 * Event journal — the append-only record of what happened.
 *
 * Two files, one truth:
 *
 * - `<project>_journal.jsonl` is the canonical log: one JSON event per line,
 *   only ever appended to. Deleting history is not an operation the journal
 *   has; retraction is expressed by appending a `"tombstone"` event, so the
 *   record of the retraction is itself on the record.
 * - `<project>_journal_index.sqlite` is a derived index mapping each event's
 *   sequence number to its byte offset and length in the JSONL file, which
 *   makes {@link EventJournal.read} a single `O(1)` positioned read instead
 *   of a scan of the whole file.
 *
 * Because the index is derived it may lag the journal (crash between the
 * append and the index insert). {@link EventJournal.recover} closes that gap
 * by scanning only the un-indexed tail — from the end of the last indexed
 * event, not from zero — and it runs automatically on open. The offset stored
 * for an event is always captured *before* the line is appended; recovery
 * likewise computes each offset from its predecessor's end rather than from
 * whatever the file size happens to be mid-recovery.
 *
 * Sequence numbers are owned by this class, initialised from `MAX(seq)` in
 * the index after recovery. Letting SQLite `AUTOINCREMENT` race an in-memory
 * counter is how the same seq gets issued twice.
 */

import { Database } from "bun:sqlite";
import * as fs from "node:fs";
import * as path from "node:path";
import type { JournalEvent, JournalEventInput, PersistenceScope } from "./types";
import { asString } from "./types";

export interface EventJournalOptions {
	/** Directory that receives the JSONL journal and its SQLite index. */
	directory: string;
	scope: PersistenceScope;
}

export interface JournalQuery {
	type?: string;
	recordId?: string;
	limit?: number;
}

const DEFAULT_QUERY_LIMIT = 100;

const SCHEMA = `
	CREATE TABLE IF NOT EXISTS event_index (
		seq INTEGER PRIMARY KEY,
		type TEXT NOT NULL,
		record_id TEXT,
		timestamp TEXT NOT NULL,
		offset INTEGER NOT NULL,
		length INTEGER NOT NULL
	);
	CREATE INDEX IF NOT EXISTS idx_event_type ON event_index(type, seq);
	CREATE INDEX IF NOT EXISTS idx_event_record ON event_index(record_id, seq);
`;

export class EventJournal {
	readonly #db: Database;
	readonly #journalPath: string;
	#seq = 0;
	/** Byte length of the journal file; the next append lands at this offset. */
	#size = 0;

	constructor(options: EventJournalOptions) {
		fs.mkdirSync(options.directory, { recursive: true });
		this.#journalPath = path.join(options.directory, `${options.scope.projectId}_journal.jsonl`);
		if (!fs.existsSync(this.#journalPath)) fs.writeFileSync(this.#journalPath, "", "utf8");
		this.#db = new Database(path.join(options.directory, `${options.scope.projectId}_journal_index.sqlite`), {
			create: true,
		});
		this.#db.exec("PRAGMA journal_mode = WAL;");
		this.#db.exec("PRAGMA busy_timeout = 5000;");
		this.#db.exec(SCHEMA);
		this.recover();
	}

	/** Append one event; returns it with its assigned seq and timestamp. */
	append(input: JournalEventInput): JournalEvent {
		const event: JournalEvent = {
			...input,
			seq: this.#seq + 1,
			timestamp: new Date().toISOString(),
		};
		const line = `${JSON.stringify(event)}\n`;
		const length = Buffer.byteLength(line, "utf8");
		// The event's offset is where the file ends *now* — before the append.
		const offset = this.#size;

		fs.appendFileSync(this.#journalPath, line, "utf8");
		this.#size = offset + length;
		this.#seq = event.seq;

		this.#db
			.query(`
			INSERT INTO event_index (seq, type, record_id, timestamp, offset, length)
			VALUES (?, ?, ?, ?, ?, ?)
		`)
			.run(event.seq, event.type, event.recordId ?? null, event.timestamp, offset, length);

		return event;
	}

	/** Retract a record by appending a tombstone; the history itself stays. */
	tombstone(recordId: string, reason: string): JournalEvent {
		return this.append({ type: "tombstone", recordId, payload: { reason } });
	}

	/** One positioned read: index row → byte range → parsed event. */
	read(seq: number): JournalEvent | null {
		const row = this.#db
			.query("SELECT offset, length FROM event_index WHERE seq = ?")
			.get(seq) as Record<string, unknown> | null;
		if (!row || typeof row.offset !== "number" || typeof row.length !== "number") return null;
		return this.#readAt(row.offset, row.length);
	}

	/** Query the index, newest first, then read each matching event. */
	query(filter: JournalQuery = {}): JournalEvent[] {
		const clauses: string[] = [];
		const args: Array<string | number> = [];
		if (filter.type !== undefined) {
			clauses.push("type = ?");
			args.push(filter.type);
		}
		if (filter.recordId !== undefined) {
			clauses.push("record_id = ?");
			args.push(filter.recordId);
		}
		const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
		const rows = this.#db
			.query(`SELECT offset, length FROM event_index ${where} ORDER BY seq DESC LIMIT ?`)
			.all(...args, filter.limit ?? DEFAULT_QUERY_LIMIT) as Array<Record<string, unknown>>;
		const events: JournalEvent[] = [];
		for (const row of rows) {
			if (typeof row.offset !== "number" || typeof row.length !== "number") continue;
			const event = this.#readAt(row.offset, row.length);
			if (event) events.push(event);
		}
		return events;
	}

	/**
	 * Re-index the journal tail that the index does not know about yet.
	 *
	 * Starts at the byte where the last indexed event ends (offset + length),
	 * never at zero and never at the current file size: the whole point is
	 * that the file and the index disagree, so the file position of each
	 * recovered event must be derived from its predecessor's end.
	 *
	 * A trailing partial line — a crash mid-append — is left un-indexed; the
	 * next successful append lands after it, and recovery skips it again.
	 *
	 * @returns how many events were added to the index
	 */
	recover(): number {
		const row = this.#db
			.query("SELECT MAX(offset + length) AS tail, MAX(seq) AS seq FROM event_index")
			.get() as Record<string, unknown> | null;
		const indexedEnd = typeof row?.tail === "number" ? row.tail : 0;
		this.#seq = typeof row?.seq === "number" ? row.seq : 0;

		const buffer = fs.readFileSync(this.#journalPath);
		this.#size = buffer.byteLength;
		if (indexedEnd >= buffer.byteLength) return 0;

		let recovered = 0;
		let offset = indexedEnd;
		const insert = this.#db.query(`
			INSERT OR IGNORE INTO event_index (seq, type, record_id, timestamp, offset, length)
			VALUES (?, ?, ?, ?, ?, ?)
		`);
		while (offset < buffer.byteLength) {
			const newline = buffer.indexOf(0x0a, offset);
			if (newline === -1) break; // Partial trailing line: not yet an event.
			const length = newline - offset + 1;
			const event = parseEvent(buffer.subarray(offset, newline).toString("utf8"));
			if (event) {
				insert.run(event.seq, event.type, event.recordId ?? null, event.timestamp, offset, length);
				if (event.seq > this.#seq) this.#seq = event.seq;
				recovered += 1;
			}
			offset += length;
		}
		return recovered;
	}

	close(): void {
		this.#db.close();
	}

	#readAt(offset: number, length: number): JournalEvent | null {
		const descriptor = fs.openSync(this.#journalPath, "r");
		try {
			const buffer = Buffer.alloc(length);
			const bytesRead = fs.readSync(descriptor, buffer, 0, length, offset);
			return parseEvent(buffer.subarray(0, bytesRead).toString("utf8"));
		} finally {
			fs.closeSync(descriptor);
		}
	}
}

/** Parse one journal line; anything malformed is `null`, never a throw. */
function parseEvent(line: string): JournalEvent | null {
	try {
		const parsed: unknown = JSON.parse(line);
		if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return null;
		const record = parsed as Record<string, unknown>;
		if (typeof record.seq !== "number" || typeof record.type !== "string") return null;
		const payload =
			record.payload !== null && typeof record.payload === "object" && !Array.isArray(record.payload)
				? (record.payload as Record<string, unknown>)
				: {};
		const event: JournalEvent = {
			seq: record.seq,
			type: record.type,
			timestamp: asString(record.timestamp),
			payload,
		};
		if (typeof record.recordId === "string") event.recordId = record.recordId;
		return event;
	} catch {
		return null;
	}
}
