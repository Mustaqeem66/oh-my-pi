#!/usr/bin/env python3
"""One-shot anchored patcher for the #10124 session_init approval provenance change.

The three target files are too large to round-trip through the contents API
without corruption, so the edits are applied here instead. Every edit is
fail-closed: the anchor must appear exactly once or the script aborts. The
workflow that runs this file deletes both it and itself in the same commit, so
nothing is left behind in the tree.
"""
import io
import sys

ROOT = "packages/coding-agent/"

ENTRIES_ANCHOR = (
    '\t/** Effective advisor for this subagent: `"on"` = advisor-role model, else an explicit model pattern; absent = unadvised. */\n'
    "\tadvisor?: string;\n"
)
ENTRIES_ADD = (
    "\t/**\n"
    "\t * Effective `tools.approvalMode` the subagent ran under. Recorded for\n"
    "\t * provenance only; revival re-reads live settings and never restores this.\n"
    "\t */\n"
    "\tapprovalMode?: string;\n"
    "\t/**\n"
    "\t * Effective `tools.approval` per-tool policy map the subagent ran under.\n"
    "\t * Provenance only, same as `approvalMode`.\n"
    "\t */\n"
    "\tapproval?: Record<string, unknown>;\n"
    "\t/** Whether an interactive UI was attached and able to serve approval prompts. */\n"
    "\thasUI?: boolean;\n"
)

MANAGER_ANCHOR = (
    "\t\tspawns?: string;\n"
    "\t\treadSummarize?: boolean;\n"
    "\t\tadvisor?: string;\n"
)
MANAGER_ADD = (
    "\t\tapprovalMode?: string;\n"
    "\t\tapproval?: Record<string, unknown>;\n"
    "\t\thasUI?: boolean;\n"
)

EXECUTOR_ANCHOR = (
    "\t\t\t\toutputSchema,\n"
    "\t\t\t\toutputSchemaMode: options.outputSchemaMode,\n"
    "\t\t\t\trestrictToolNames: restrictToolNames || undefined,\n"
)
EXECUTOR_ADD = (
    "\t\t\t\t// Approval provenance: subagents run headless, so a transcript is the only\n"
    "\t\t\t\t// place these can be recovered from after the fact.\n"
    '\t\t\t\tapprovalMode: (subagentSettings.get("tools.approvalMode") ?? "yolo") as string,\n'
    '\t\t\t\tapproval: subagentSettings.get("tools.approval") as Record<string, unknown> | undefined,\n'
    "\t\t\t\thasUI: false,\n"
)

EDITS = [
    (ROOT + "src/session/session-entries.ts", ENTRIES_ANCHOR, ENTRIES_ADD),
    (ROOT + "src/session/session-manager.ts", MANAGER_ANCHOR, MANAGER_ADD),
    (ROOT + "src/task/executor.ts", EXECUTOR_ANCHOR, EXECUTOR_ADD),
]

failed = False
for path, anchor, addition in EDITS:
    text = io.open(path, encoding="utf-8", newline="").read()
    if addition in text:
        print("ALREADY APPLIED: " + path)
        continue
    hits = text.count(anchor)
    if hits != 1:
        print("ANCHOR MISMATCH in " + path + ": expected 1 occurrence, found " + str(hits))
        failed = True
        continue
    patched = text.replace(anchor, anchor + addition)
    if patched.count(addition) != 1:
        print("POST-CHECK FAILED for " + path)
        failed = True
        continue
    io.open(path, "w", encoding="utf-8", newline="").write(patched)
    print("PATCHED: " + path)

if failed:
    sys.exit(1)
print("All edits applied.")
