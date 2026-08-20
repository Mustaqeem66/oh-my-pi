#!/usr/bin/env python3
# Temporary bootstrap for oh-my-pi #2394 (chat.transparent).
# Applies three small anchored insertions to files too large to transit
# reliably through the API tooling used to prepare this branch. The CI
# workflow that runs this deletes both this script and itself afterwards.
import sys

def patch(path, old, new):
	with open(path, "r", encoding="utf-8") as f:
		src = f.read()
	if new in src:
		print("SKIP " + path + ": already applied")
		return
	n = src.count(old)
	if n != 1:
		print("FAIL " + path + ": anchor found " + str(n) + " times, expected 1", file=sys.stderr)
		sys.exit(1)
	with open(path, "w", encoding="utf-8") as f:
		f.write(src.replace(old, new))
	print("OK   " + path)

# 1) main.ts: pass chat.transparent into initTheme at startup.
MAIN = "packages/coding-agent/src/main.ts"
old_main = "\t\tsettingsInstance.get(\"theme.dark\"),\n\t\tsettingsInstance.get(\"theme.light\"),\n\t);"
new_main = "\t\tsettingsInstance.get(\"theme.dark\"),\n\t\tsettingsInstance.get(\"theme.light\"),\n\t\tsettingsInstance.get(\"chat.transparent\"),\n\t);"
patch(MAIN, old_main, new_main)

# 2) selector-controller.ts: import setChatTransparent (Biome sort order).
SEL = "packages/coding-agent/src/modes/controllers/selector-controller.ts"
old_imp = "\tpreviewTheme,\n\tsetColorBlindMode,"
new_imp = "\tpreviewTheme,\n\tsetChatTransparent,\n\tsetColorBlindMode,"
patch(SEL, old_imp, new_imp)

# 3) selector-controller.ts: live-apply case for the new setting.
old_case = (
	"\t\t\tcase \"colorBlindMode\": {\n"
	"\t\t\t\tsetColorBlindMode(value === \"true\" || value === true).then(() => {\n"
	"\t\t\t\t\tthis.ctx.ui.invalidate();\n"
	"\t\t\t\t});\n"
	"\t\t\t\tbreak;\n"
	"\t\t\t}\n"
)
new_case = old_case + (
	"\t\t\tcase \"chat.transparent\": {\n"
	"\t\t\t\tsetChatTransparent(value === \"true\" || value === true).then(() => {\n"
	"\t\t\t\t\tthis.ctx.ui.invalidate();\n"
	"\t\t\t\t});\n"
	"\t\t\t\tbreak;\n"
	"\t\t\t}\n"
)
patch(SEL, old_case, new_case)

# 4) settings-schema.ts: register chat.transparent before statusLine.compactThinkingLevel.
SCHEMA = "packages/coding-agent/src/config/settings-schema.ts"
old_schema = "\t\"statusLine.compactThinkingLevel\": {"
new_schema = (
	"\t\"chat.transparent\": {\n"
	"\t\ttype: \"boolean\",\n"
	"\t\tdefault: false,\n"
	"\t\tui: {\n"
	"\t\t\ttab: \"appearance\",\n"
	"\t\t\tgroup: \"Theme\",\n"
	"\t\t\tlabel: \"Transparent Chat Surfaces\",\n"
	"\t\t\tdescription:\n"
	"\t\t\t\t\"Use the terminal's default background for chat bubbles and tool panels (user messages, custom messages, tool output) instead of the theme's opaque fills. Fixes themes whose panel fills clash with the terminal background (e.g. Ghostty).\",\n"
	"\t\t},\n"
	"\t},\n"
	"\t\"statusLine.compactThinkingLevel\": {"
)
patch(SCHEMA, old_schema, new_schema)
print("bootstrap complete")
