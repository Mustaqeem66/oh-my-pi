"""One-shot patcher for issue #10164 / #10124.

Runs in CI because the two target files are too large to push through the
GitHub contents API from the authoring environment. Every edit is anchored,
fail-loud (exactly one match required) and verified against a pre-computed
git blob SHA, so a drifted base aborts instead of committing garbage.
"""

import hashlib
import io
import os
import sys

ROOT = os.getcwd()


def blob(data):
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\x00" + data).hexdigest()


def patch(path, old, new, expect):
    full = os.path.join(ROOT, path)
    src = io.open(full, encoding="utf-8", newline="").read()
    n = src.count(old)
    if n != 1:
        sys.exit("FATAL: anchor matched %d times (want 1) in %s" % (n, path))
    src = src.replace(old, new)
    io.open(full, "w", encoding="utf-8", newline="").write(src)
    got = blob(src.encode("utf-8"))
    if got != expect:
        sys.exit("FATAL: %s blob %s != expected %s" % (path, got, expect))
    print("OK  %s  %s" % (path, got))


# --------------------------------------------------------------------------
# 1. executor.ts - stop hardcoding yolo when the opt-in setting is enabled.
# --------------------------------------------------------------------------
EXEC_OLD = (
    "\t\t\t// Subagents run headless \u2014 there is no UI to confirm prompts against, so\n"
    "\t\t\t// the parent task approval is the authorization boundary. Use yolo mode\n"
    "\t\t\t// to preserve unattended subagent execution. User `tools.approval` policies still apply.\n"
    '\t\t\t"tools.approvalMode": "yolo",\n'
)
EXEC_NEW = (
    "\t\t\t// Subagents run headless \u2014 there is no UI to confirm prompts against, so\n"
    "\t\t\t// the parent task approval is the authorization boundary. By default they\n"
    "\t\t\t// run in yolo mode to preserve unattended subagent execution.\n"
    "\t\t\t// Opt in to `task.inheritApprovalMode` to keep the parent's mode instead:\n"
    "\t\t\t// the snapshot above already carries it, so we simply skip the override,\n"
    "\t\t\t// and any subagent call that would prompt fails closed for want of a UI.\n"
    "\t\t\t// User `tools.approval` policies still apply in both cases.\n"
    '\t\t\t...(baseSettings.get("task.inheritApprovalMode") === true\n'
    "\t\t\t\t? undefined\n"
    '\t\t\t\t: { "tools.approvalMode": "yolo" as const }),\n'
)
patch(
    "packages/coding-agent/src/task/executor.ts",
    EXEC_OLD,
    EXEC_NEW,
    "3a00498f10a10ba58f97ccfe253151d5dadb5ee7",
)

# --------------------------------------------------------------------------
# 2. settings-schema.ts - declare the new opt-in boolean next to task.enableLsp.
# --------------------------------------------------------------------------
SCHEMA_ANCHOR = (
    '\t"task.enableLsp": {\n'
    '\t\ttype: "boolean",\n'
    "\t\tdefault: false,\n"
    "\t\tui: {\n"
    '\t\t\ttab: "tasks",\n'
    '\t\t\tgroup: "Subagents",\n'
    '\t\t\tlabel: "LSP in Subagents",\n'
    "\t\t\tdescription:\n"
    '\t\t\t\t"Allow subagents spawned via the task tool to use the lsp tool. Off by default to keep subagents cheap; enable when LSP-aware delegation is worth the extra tokens.",\n'
    "\t\t},\n"
    "\t},\n"
)
SCHEMA_NEW = (
    '\n\t"task.inheritApprovalMode": {\n'
    '\t\ttype: "boolean",\n'
    "\t\tdefault: false,\n"
    "\t\tui: {\n"
    '\t\t\ttab: "tasks",\n'
    '\t\t\tgroup: "Subagents",\n'
    '\t\t\tlabel: "Inherit Approval Mode",\n'
    "\t\t\tdescription:\n"
    "\t\t\t\t\"Propagate the parent session's tool approval mode to subagents instead of running them in yolo mode. Off by default so unattended delegation keeps working; when on, a subagent tool call that needs confirmation fails closed because subagents have no interactive UI to prompt against.\",\n"
    "\t\t},\n"
    "\t},\n"
)
patch(
    "packages/coding-agent/src/config/settings-schema.ts",
    SCHEMA_ANCHOR,
    SCHEMA_ANCHOR + SCHEMA_NEW,
    "9ae8761ee86f96bbe92311b0f9c11fbadb4eb5d7",
)

# --------------------------------------------------------------------------
# 3. docs/approval-mode.md - document the opt-in under the Subagents section.
# --------------------------------------------------------------------------
DOC_OLD = (
    "Subagents run headless with `tools.approvalMode: yolo` so ordinary tier-based prompts do not"
    " stall them. The parent `task` approval is the authorization boundary. User"
    " `tools.approval.<tool>` settings remain authoritative: `deny` blocks the tool, `allow` permits"
    " it, and `prompt` cannot be satisfied in a headless subagent and rejects the call.\n"
)
DOC_NEW = DOC_OLD + (
    "\n"
    "### Inheriting the parent mode\n"
    "\n"
    "Set `task.inheritApprovalMode: true` to propagate the parent session's `tools.approvalMode` to\n"
    "subagents instead of forcing `yolo`:\n"
    "\n"
    "```yaml\n"
    "task:\n"
    "  inheritApprovalMode: true\n"
    "tools:\n"
    "  approvalMode: write\n"
    "```\n"
    "\n"
    'This is off by default because it changes subagents from "never blocked" to "blocked whenever the\n'
    'inherited mode would prompt". A subagent is headless, so there is nothing to prompt against: a call\n'
    "above the inherited mode's auto-approve tier fails closed with `requires approval but no interactive\n"
    "UI available` rather than pausing for input. With `write`, for example, a subagent may still read and\n"
    "edit, but an `exec` tool call such as `bash` is rejected.\n"
    "\n"
    "Use it when a subagent must not exceed the tier the user granted the parent session, and prefer\n"
    "per-tool `tools.approval.<tool>` policies when you only need to fence off specific tools. A per-spawn\n"
    "`tools.approvalMode` override passed by the `task` tool still wins over both.\n"
)
patch(
    "docs/approval-mode.md",
    DOC_OLD,
    DOC_NEW,
    "00e1ceac2ab50f9013bf147b55b91a5dd06caa5e",
)

print("bootstrap-10164: all patches applied and verified")
