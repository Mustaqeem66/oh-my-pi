// ============================================================================
// Symbol Presets
// ============================================================================

export type SymbolPreset = "unicode" | "nerd" | "ascii";

/**
 * All available symbol keys organized by category.
 */
export type SymbolKey =
	// Status Indicators
	| "status.success"
	| "status.error"
	| "status.warning"
	| "status.info"
	| "status.pending"
	| "status.disabled"
	| "status.enabled"
	| "status.running"
	| "status.shadowed"
	| "status.aborted"
	| "status.done"
	// Navigation
	| "nav.cursor"
	| "nav.selected"
	| "nav.expand"
	| "nav.collapse"
	| "nav.back"
	// Tree Connectors
	| "tree.branch"
	| "tree.last"
	| "tree.vertical"
	| "tree.horizontal"
	| "tree.hook"
	// Progress Bar
	| "progress.filled"
	| "progress.empty"
	// Context gauge boundaries
	| "context.speculation"
	| "context.compaction"
	// Box Drawing - Rounded
	| "boxRound.topLeft"
	| "boxRound.topRight"
	| "boxRound.bottomLeft"
	| "boxRound.bottomRight"
	| "boxRound.horizontal"
	| "boxRound.vertical"
	// Box Drawing - Sharp
	| "boxSharp.topLeft"
	| "boxSharp.topRight"
	| "boxSharp.bottomLeft"
	| "boxSharp.bottomRight"
	| "boxSharp.horizontal"
	| "boxSharp.vertical"
	| "boxSharp.cross"
	| "boxSharp.teeDown"
	| "boxSharp.teeUp"
	| "boxSharp.teeRight"
	| "boxSharp.teeLeft"
	// Separators
	| "sep.powerline"
	| "sep.powerlineThin"
	| "sep.powerlineLeft"
	| "sep.powerlineRight"
	| "sep.powerlineThinLeft"
	| "sep.powerlineThinRight"
	| "sep.block"
	| "sep.space"
	| "sep.asciiLeft"
	| "sep.asciiRight"
	| "sep.dot"
	| "sep.slash"
	| "sep.pipe"
	// Icons
	| "icon.model"
	| "icon.plan"
	| "icon.prewalk"
	| "icon.goal"
	| "icon.pause"
	| "icon.loop"
	| "icon.folder"
	| "icon.worktree"
	| "icon.search"
	| "icon.scratchFolder"
	| "icon.file"
	| "icon.git"
	| "icon.branch"
	| "icon.pr"
	| "icon.tokens"
	| "icon.context"
	| "icon.cost"
	| "icon.subscription"
	| "icon.advisor"
	| "icon.time"
	| "icon.pi"
	| "icon.ghost"
	| "icon.agents"
	| "icon.job"
	| "icon.cache"
	| "icon.cacheMiss"
	| "icon.input"
	| "icon.output"
	| "icon.throughput"
	| "icon.host"
	| "icon.session"
	| "icon.package"
	| "icon.warning"
	| "icon.rewind"
	| "icon.auto"
	| "icon.fast"
	| "icon.extensionSkill"
	| "icon.extensionTool"
	| "icon.extensionSlashCommand"
	| "icon.extensionMcp"
	| "icon.extensionRule"
	| "icon.extensionHook"
	| "icon.extensionPrompt"
	| "icon.extensionContextFile"
	| "icon.extensionInstruction"
	// STT
	| "icon.mic"
	// Compaction divider
	| "icon.camera"
	// Thinking Levels
	| "thinking.minimal"
	| "thinking.low"
	| "thinking.medium"
	| "thinking.high"
	| "thinking.xhigh"
	| "thinking.max"
	| "thinking.autoPending"
	// Checkboxes
	| "checkbox.checked"
	| "checkbox.unchecked"
	// Radio (single-choice)
	| "radio.selected"
	| "radio.unselected"
	// Text Formatting
	| "format.bullet"
	| "format.dash"
	| "format.bracketLeft"
	| "format.bracketRight"
	// Markdown-specific
	| "md.quoteBorder"
	| "md.hrChar"
	| "md.bullet"
	| "md.colorSwatch"
	// Advisor note rail
	| "advisor.rail"
	// Language/file type icons
	| "lang.default"
	| "lang.typescript"
	| "lang.javascript"
	| "lang.python"
	| "lang.rust"
	| "lang.go"
	| "lang.java"
	| "lang.c"
	| "lang.cpp"
	| "lang.csharp"
	| "lang.ruby"
	| "lang.julia"
	| "lang.php"
	| "lang.swift"
	| "lang.kotlin"
	| "lang.shell"
	| "lang.html"
	| "lang.css"
	| "lang.json"
	| "lang.yaml"
	| "lang.markdown"
	| "lang.sql"
	| "lang.docker"
	| "lang.lua"
	| "lang.text"
	| "lang.env"
	| "lang.toml"
	| "lang.xml"
	| "lang.ini"
	| "lang.conf"
	| "lang.log"
	| "lang.csv"
	| "lang.tsv"
	| "lang.image"
	| "lang.pdf"
	| "lang.archive"
	| "lang.binary"
	// Settings tab icons
	| "tab.appearance"
	| "tab.model"
	| "tab.interaction"
	| "tab.context"
	| "tab.files"
	| "tab.shell"
	| "tab.tools"
	| "tab.memory"
	| "tab.tasks"
	| "tab.providers"
	// Tool identity icons
	| "tool.write"
	| "tool.edit"
	| "tool.bash"
	| "tool.ssh"
	| "tool.lsp"
	| "tool.gh"
	| "tool.webSearch"
	| "tool.exa"
	| "tool.browser"
	| "tool.eval"
	| "tool.debug"
	| "tool.mcp"
	| "tool.job"
	| "tool.launch"
	| "tool.task"
	| "tool.todo"
	| "tool.memory"
	| "tool.ask"
	| "tool.resolve"
	| "tool.review"
	| "tool.inspectImage"
	| "tool.goal"
	| "tool.irc"
	| "tool.delete"
	| "tool.move";

export type SymbolMap = Record<SymbolKey, string>;

const UNICODE_SYMBOLS: SymbolMap = {
	// Status
	"status.success": "\u2714",
	"status.error": "\u2718",
	"status.warning": "\u26A0",
	"status.info": "\u24D8",
	"status.pending": "\u23F3",
	"status.disabled": "\u29B8",
	"status.enabled": "\u25CF",
	"status.running": "\u27F3",
	"status.shadowed": "\u25CB",
	"status.aborted": "\u23F9",
	"status.done": "\u2022",
	// Navigation
	"nav.cursor": "\u276F",
	"nav.selected": "\u27A4",
	"nav.expand": "\u25B8",
	"nav.collapse": "\u25BE",
	"nav.back": "\u27F5",
	// Tree
	"tree.branch": "\u251C\u2500",
	"tree.last": "\u2514\u2500",
	"tree.vertical": "\u2502",
	"tree.horizontal": "\u2500",
	"tree.hook": "\u2514",
	// Progress bar
	"progress.filled": "\u2501",
	"progress.empty": "\u2500",
	// Context gauge boundaries
	"context.speculation": "\u254E",
	"context.compaction": "\u2503",
	// Box (rounded)
	"boxRound.topLeft": "\u256D",
	"boxRound.topRight": "\u256E",
	"boxRound.bottomLeft": "\u2570",
	"boxRound.bottomRight": "\u256F",
	"boxRound.horizontal": "\u2500",
	"boxRound.vertical": "\u2502",
	// Box (sharp)
	"boxSharp.topLeft": "\u250C",
	"boxSharp.topRight": "\u2510",
	"boxSharp.bottomLeft": "\u2514",
	"boxSharp.bottomRight": "\u2518",
	"boxSharp.horizontal": "\u2500",
	"boxSharp.vertical": "\u2502",
	"boxSharp.cross": "\u253C",
	"boxSharp.teeDown": "\u252C",
	"boxSharp.teeUp": "\u2534",
	"boxSharp.teeRight": "\u251C",
	"boxSharp.teeLeft": "\u2524",
	// Separators (powerline-ish, but pure Unicode)
	"sep.powerline": "\u2595",
	"sep.powerlineThin": "\u2506",
	"sep.powerlineLeft": "\u25B6",
	"sep.powerlineRight": "\u25C0",
	"sep.powerlineThinLeft": ">",
	"sep.powerlineThinRight": "<",
	"sep.block": "\u258C",
	"sep.space": " ",
	"sep.asciiLeft": ">",
	"sep.asciiRight": "<",
	"sep.dot": " \u00B7 ",
	"sep.slash": " / ",
	"sep.pipe": " \u2502 ",
	// Icons
	"icon.model": "\u2B22",
	"icon.plan": "\uD83D\uDDFA",
	"icon.prewalk": "\uD83C\uDFC3",
	"icon.goal": "\uD83C\uDFAF",
	"icon.pause": "\u23F8",
	"icon.loop": "\u21BB",
	"icon.folder": "\uD83D\uDCC1",
	"icon.worktree": "\uD83C\uDF33",
	"icon.search": "\uD83D\uDD0D",
	"icon.scratchFolder": "\uD83D\uDDD1",
	"icon.file": "\uD83D\uDCC4",
	"icon.git": "\u2387",
	"icon.branch": "\u2442",
	"icon.pr": "\u2934",
	"icon.tokens": "\uD83E\uDE99",
	"icon.context": "\u25EB",
	"icon.cost": "\uD83D\uDCB2",
	"icon.subscription": "(oauth)",
	"icon.advisor": "\uD83D\uDC41",
	"icon.time": "\u23F1",
	"icon.pi": "\u03C0",
	"icon.ghost": "\uD83D\uDC7B",
	"icon.agents": "\uD83D\uDC65",
	"icon.job": "\u2699",
	"icon.cache": "\uD83D\uDCBE",
	"icon.cacheMiss": "\u2298",
	"icon.input": "\u2935",
	"icon.output": "\u2934",
	"icon.throughput": "\u26A1",
	"icon.host": "\uD83D\uDDA5",
	"icon.session": "\uD83C\uDD94",
	"icon.package": "\uD83D\uDCE6",
	"icon.warning": "\u26A0",
	"icon.rewind": "\u21B6",
	"icon.auto": "\u27F2",
	"icon.fast": "\u26A1",
	"icon.extensionSkill": "\u2726",
	"icon.extensionTool": "\uD83D\uDEE0",
	"icon.extensionSlashCommand": "\u2318",
	"icon.extensionMcp": "\uD83D\uDD0C",
	"icon.extensionRule": "\u2696",
	"icon.extensionHook": "\uD83E\uDE9D",
	"icon.extensionPrompt": "\u270E",
	"icon.extensionContextFile": "\uD83D\uDCCE",
	"icon.extensionInstruction": "\uD83D\uDCD8",
	// STT
	"icon.mic": "\uD83C\uDFA4",
	// Compaction divider
	"icon.camera": "\uD83D\uDCF7",
	// Thinking levels
	"thinking.minimal": "\u25CB min",
	"thinking.low": "\u25D4 low",
	"thinking.medium": "\u25D1 med",
	"thinking.high": "\u25D2 high",
	"thinking.xhigh": "\u25D5 xhigh",
	"thinking.max": "\u25C9 max",
	"thinking.autoPending": "\u27F3",
	// Checkboxes
	"checkbox.checked": "\u2611",
	"checkbox.unchecked": "\u2610",
	// Radio (single-choice)
	"radio.selected": "\u25C9",
	"radio.unselected": "\u25CB",
	// Formatting
	"format.bullet": "\u2022",
	"format.dash": "\u2014",
	"format.bracketLeft": "\u27E6",
	"format.bracketRight": "\u27E7",
	// Markdown
	"md.quoteBorder": "\u258F",
	"md.hrChar": "\u2500",
	"md.bullet": "\u2022",
	"md.colorSwatch": "\u25A0",
	// Advisor note rail (heavier than md.quoteBorder so notes read as a distinct voice)
	"advisor.rail": "\u258E",
	// Language/file icons (emoji-centric, no Nerd Font required)
	"lang.default": "\u2318",
	"lang.typescript": "\uD83D\uDFE6",
	"lang.javascript": "\uD83D\uDFE8",
	"lang.python": "\uD83D\uDC0D",
	"lang.rust": "\uD83E\uDD80",
	"lang.go": "\uD83D\uDC39",
	"lang.java": "\u2615",
	"lang.c": "\u24B8",
	"lang.cpp": "\u2795",
	"lang.csharp": "\u266F",
	"lang.ruby": "\uD83D\uDC8E",
	"lang.julia": "\u24BF",
	"lang.php": "\uD83D\uDC18",
	"lang.swift": "\uD83D\uDD4A",
	"lang.kotlin": "\uD83C\uDD7A",
	"lang.shell": "\uD83D\uDCBB",
	"lang.html": "\uD83C\uDF10",
	"lang.css": "\uD83C\uDFA8",
	"lang.json": "\uD83E\uDDFE",
	"lang.yaml": "\uD83D\uDCCB",
	"lang.markdown": "\uD83D\uDCDD",
	"lang.sql": "\uD83D\uDDC4",
	"lang.docker": "\uD83D\uDC33",
	"lang.lua": "\uD83C\uDF19",
	"lang.text": "\uD83D\uDDD2",
	"lang.env": "\uD83D\uDD27",
	"lang.toml": "\uD83E\uDDFE",
	"lang.xml": "\u27E8\u27E9",
	"lang.ini": "\u2699",
	"lang.conf": "\u2699",
	"lang.log": "\uD83D\uDCDC",
	"lang.csv": "\uD83D\uDCD1",
	"lang.tsv": "\uD83D\uDCD1",
	"lang.image": "\uD83D\uDDBC",
	"lang.pdf": "\uD83D\uDCD5",
	"lang.archive": "\uD83D\uDDDC",
	"lang.binary": "\u2699",
	// Settings tabs
	"tab.appearance": "\uD83C\uDFA8",
	"tab.model": "\uD83E\uDD16",
	"tab.interaction": "\u2328",
	"tab.context": "\uD83D\uDCCB",
	"tab.files": "\uD83D\uDCC1",
	"tab.shell": "\uD83D\uDCBB",
	"tab.tools": "\uD83D\uDD27",
	"tab.memory": "\uD83E\uDDE0",
	"tab.tasks": "\uD83D\uDCE6",
	"tab.providers": "\uD83C\uDF10",
	// Tool identity icons (per-tool signature glyph on the success header)
	"tool.write": "\u270E",
	"tool.edit": "\u270E",
	"tool.bash": "\u276F",
	"tool.ssh": "\u21C4",
	"tool.lsp": "\uD83D\uDCA1",
	"tool.gh": "\u2387",
	"tool.webSearch": "\u2315",
	"tool.exa": "\uD83D\uDD2D",
	"tool.browser": "\uD83C\uDF10",
	"tool.eval": "\u25B6",
	"tool.debug": "\uD83D\uDC1E",
	"tool.mcp": "\uD83D\uDD0C",
	"tool.job": "\u2699",
	"tool.launch": "\uD83D\uDE80",
	"tool.task": "\u21F6",
	"tool.todo": "\u2611",
	"tool.memory": "\uD83E\uDDE0",
	"tool.ask": "?",
	"tool.resolve": "\u2713",
	"tool.review": "\u25C9",
	"tool.inspectImage": "\uD83D\uDDBC",
	"tool.goal": "\u25CE",
	"tool.irc": "\u2709",
	"tool.delete": "\uD83D\uDDD1",
	"tool.move": "\u279C",
};

const NERD_SYMBOLS: SymbolMap = {
	// Status Indicators
	// pick: \uF00C | alt: \uF058 \uF14A \uF046
	"status.success": "\\uf00c",
	// pick: \uF00D | alt: \uF057 \uF05E \uF04D
	"status.error": "\\uf00d",
	// pick: \uF12A | alt: \uF071 \uF06A
	"status.warning": "\\uf12a",
	// pick: \uF129 | alt: \uF05A
	"status.info": "\\uf129",
	// pick: \uF254 | alt: \uF017 \uF110 \uF021
	"status.pending": "\\uf254",
	// pick: \uF05E | alt: \uF10C \uF192
	"status.disabled": "\\uf05e",
	// pick: \uF111 | alt: \uF192 \uF10C
	"status.enabled": "\\uf111",
	// pick: \uF110 | alt: \uF021 \uF013 \uF0E7
	"status.running": "\\uf110",
	// pick:  (nf-fa-circle_o, pairs with status.enabled's nf-fa-circle) | alt: \u25D0 \u25D1
	"status.shadowed": "\\uf10c",
	// pick: \uF04D | alt: \uF00D \uF05E
	"status.aborted": "\\uf04d",
	// pick: \u2022 | alt: \u25CF \u00B7
	"status.done": "\u2022",
	// Navigation
	// pick: \uF054 | alt: \uF105 \uF0DA
	"nav.cursor": "\\uf054",
	// pick: \uF178 | alt: \uF061 \uF105
	"nav.selected": "\\uf178",
	// pick: \uF0DA | alt: \uF054 \uF105
	"nav.expand": "\\uf0da",
	// pick: \uF0D7 | alt: \uF078 \uF107
	"nav.collapse": "\\uf0d7",
	// pick: \uF060 | alt: \uF053 \uF104
	"nav.back": "\\uf060",
	// Tree Connectors (same as unicode)
	// pick: \u251C\u2500 | alt: \u251C\u2574 \u251C\u254C \u2560\u2550 \u2523\u2501
	"tree.branch": "\u251C\u2500",
	// pick: \u2514\u2500 | alt: \u2514\u2574 \u2514\u254C \u255A\u2550 \u2517\u2501
	"tree.last": "\u2514\u2500",
	// pick: \u2502 | alt: \u2503 \u2551 \u258F \u2595
	"tree.vertical": "\u2502",
	// pick: \u2500 | alt: \u2501 \u2550 \u254C \u2504
	"tree.horizontal": "\u2500",
	// pick: \u2514 | alt: \u2570 \u23BF \u21B3
	"tree.hook": "\u2514",
	// Progress Bar (same as unicode)
	// pick: \u2501 | alt: \u25B0 \u25AE \u25A0
	"progress.filled": "\u2501",
	// pick: \u2500 | alt: \u25B1 \u25AF \u254C
	"progress.empty": "\u2500",
	// Context gauge boundaries \u2014 vector intersection starts async speculation; auto-fix applies compaction.
	"context.speculation": "\\u{f055d}",
	"context.compaction": "\\u{f0068}",
	// Box Drawing - Rounded (same as unicode)
	// pick: \u256D | alt: \u250C \u250F \u2554
	"boxRound.topLeft": "\u256D",
	// pick: \u256E | alt: \u2510 \u2513 \u2557
	"boxRound.topRight": "\u256E",
	// pick: \u2570 | alt: \u2514 \u2517 \u255A
	"boxRound.bottomLeft": "\u2570",
	// pick: \u256F | alt: \u2518 \u251B \u255D
	"boxRound.bottomRight": "\u256F",
	// pick: \u2500 | alt: \u2501 \u2550 \u254C
	"boxRound.horizontal": "\u2500",
	// pick: \u2502 | alt: \u2503 \u2551 \u258F
	"boxRound.vertical": "\u2502",
	// Box Drawing - Sharp (same as unicode)
	// pick: \u250C | alt: \u250F \u256D \u2554
	"boxSharp.topLeft": "\u250C",
	// pick: \u2510 | alt: \u2513 \u256E \u2557
	"boxSharp.topRight": "\u2510",
	// pick: \u2514 | alt: \u2517 \u2570 \u255A
	"boxSharp.bottomLeft": "\u2514",
	// pick: \u2518 | alt: \u251B \u256F \u255D
	"boxSharp.bottomRight": "\u2518",
	// pick: \u2500 | alt: \u2501 \u2550 \u254C
	"boxSharp.horizontal": "\u2500",
	// pick: \u2502 | alt: \u2503 \u2551 \u258F
	"boxSharp.vertical": "\u2502",
	// pick: \u253C | alt: \u254B \u256C \u253F
	"boxSharp.cross": "\u253C",
	// pick: \u252C | alt: \u2566 \u252F \u2533
	"boxSharp.teeDown": "\u252C",
	// pick: \u2534 | alt: \u2569 \u2537 \u253B
	"boxSharp.teeUp": "\u2534",
	// pick: \u251C | alt: \u2560 \u251D \u2523
	"boxSharp.teeRight": "\u251C",
	// pick: \u2524 | alt: \u2563 \u2525 \u252B
	"boxSharp.teeLeft": "\u2524",
	// Separators - Nerd Font specific
	// pick: \uE0B0 | alt: \uE0B2 \uE0B1 \uE0B3
	"sep.powerline": "\\ue0b0",
	// pick: \uE0B1 | alt: \uE0B3 \uE0B0
	"sep.powerlineThin": "\\ue0b1",
	// pick: \uE0B0 | alt: \uE0B1 \uE0B2
	"sep.powerlineLeft": "\\ue0b0",
	// pick: \uE0B2 | alt: \uE0B3 \uE0B0
	"sep.powerlineRight": "\\ue0b2",
	// pick: \uE0B1 | alt: \uE0B3
	"sep.powerlineThinLeft": "\\ue0b1",
	// pick: \uE0B3 | alt: \uE0B1
	"sep.powerlineThinRight": "\\ue0b3",
	// pick: \u2588 | alt: \u2593 \u2592 \u2591 \u2589 \u258C
	"sep.block": "\u2588",
	// pick: space | alt: \u2420 \u00B7
	"sep.space": " ",
	// pick: > | alt: \u203A \u00BB \u25B8
	"sep.asciiLeft": ">",
	// pick: < | alt: \u2039 \u00AB \u25C2
	"sep.asciiRight": "<",
	// pick: \u00B7 | alt: \u2022 \u22C5
	"sep.dot": " \u00B7 ",
	// pick: \uE0BB | alt: / \u2215 \u2044
	"sep.slash": "\\ue0bb",
	// pick: \uE0B3 | alt: \u2502 \u2503 |
	"sep.pipe": "\\ue0b3",
	// Icons - Nerd Font specific
	// pick: \uEC19 | alt: \uF120 \uF0E7 \u25C6
	"icon.model": "\\uec19",
	// pick: \uF2D2 | alt: \uF0F6 \uF022
	"icon.plan": "\\uf2d2",
	"icon.prewalk": "\\uf29d",
	// pick:  (nf-fa-bullseye) | alt:  (nf-md-target) \u25CE \u2316
	"icon.goal": "\\uf140",
	// pick:  (nf-fa-pause) | alt: \u23F8 ||
	"icon.pause": "\\uf04c",
	// pick: \u21BB | alt: \u27F3
	"icon.loop": "\\uf021",
	// pick: \uF115 | alt: \uF07B \uF07C
	"icon.folder": "\\uf115",
	"icon.search": "\\uf002",
	// pick:  | alt:
	"icon.scratchFolder": "\\uf014",
	// pick: nf-fa-sitemap | alt: nf-cod-list_tree
	"icon.worktree": "\\uf0e8",
	// pick: \uF15B | alt: \uF016 \uF0F6
	"icon.file": "\\uf15b",
	// pick: \uF1D3 | alt: \uF126 \u2387
	"icon.git": "\\uf1d3",
	// pick: \uF126 | alt: \uF1D3 \u2387
	"icon.branch": "\\uf126",
	// pick: \uEA64 (nf-cod-git_pull_request) | alt:  (nf-oct-git_pull_request)
	"icon.pr": "\\uea64",
	// pick: \uE26B | alt: \u229B \u25CD \uF192
	"icon.tokens": "\\ue26b",
	// pick: \uE70F | alt: \u25EB \u25A6
	"icon.context": "\\ue70f",
	// pick: \uF155 | alt: $ \u00A2
	"icon.cost": "\\uf155",
	// pick: \uDB81\uDE7A (nf-md-currency_usd_off)
	"icon.subscription": "\\u{f067a}",
	// pick: \uEA70 (nf-cod-eye)
	"icon.advisor": "\\uea70",
	// pick: \uF017 | alt: \u25F7 \u25F4
	"icon.time": "\\uf017",
	// pick: \uE22C | alt: \u03C0 \u220F \u2211
	"icon.pi": "\\ue22c",
	// pick: \uDB80\uDEA0 (nf-md-ghost) | alt: \uD83D\uDC7B
	"icon.ghost": "\\u{f02a0}",
	// pick: \uF0C0 | alt: \uF007
	"icon.agents": "\\uf0c0",
	// pick:  (nf-fa-gear) | alt:  \u2699
	"icon.job": "\\uf013",
	// pick: \uF1C0 | alt: \uF0A0 \uF0C7
	"icon.cache": "\\uf1c0",
	// pick:  (fa-ban) | alt: \u2298
	"icon.cacheMiss": "\\uf05e",
	// pick: \uF090 | alt: \uF061 \u2192
	"icon.input": "\\uf090",
	// pick: \uF08B | alt: \uF061 \u2192
	"icon.output": "\\uf08b",
	// pick:  (nf-fa-tachometer) | alt:  \u26A1 \u21AC
	"icon.throughput": "\\uf0e4",
	// pick: \uF109 | alt: \uF108 \uF120
	"icon.host": "\\uf109",
	// pick: \uDB80\uDC51 (nf-md-arrow_left_bold_hexagon_outline) | alt: \uF017 \uF0A0
	"icon.session": "\\u{f0051}",
	// pick: \uF487 | alt: \uF1B3
	"icon.package": "\\uf487",
	// pick: \uF071 | alt: \uF12A \uF06A
	"icon.warning": "\\uf071",
	// pick: \uF0E2 | alt: \uF01E \u21BA
	"icon.rewind": "\\uf0e2",
	// pick: \uDB80\uDC68 | alt: \uF0E7 \uF013 \uF110
	"icon.auto": "\\u{f0068}",
	"icon.fast": "\\uf0e7",
	"icon.extensionSkill": "\\uf0eb",
	// pick: \uF0AD | alt: \uF013 \uF0E7
	"icon.extensionTool": "\\uf0ad",
	// pick: \uF120 | alt: \uF121
	"icon.extensionSlashCommand": "\\uf120",
	// pick: \uF1E6 | alt: \uF0C1 \uF1D3
	"icon.extensionMcp": "\\uf1e6",
	// pick: \uF0E3 | alt: \uF0A3 \uF05A
	"icon.extensionRule": "\\uf0e3",
	// pick: \uF0C1 | alt: \uF13D
	"icon.extensionHook": "\\uf0c1",
	// pick: \uF075 | alt: \uF120 \uF121
	"icon.extensionPrompt": "\\uf075",
	// pick: \uF0F6 | alt: \uF15B \uF016
	"icon.extensionContextFile": "\\uf0f6",
	// pick: \uF02D | alt: \uF0F6 \uF05A
	"icon.extensionInstruction": "\\uf02d",
	// STT - fa-microphone
	"icon.mic": "\\uf130",
	// Compaction divider - fa-camera-retro
	"icon.camera": "\\uf083",
	// Thinking levels \u2014 increasing circle slices, with fire reserved for max.
	"thinking.minimal": "\\u{F0A9E} min",
	"thinking.low": "\\u{F0A9F} low",
	"thinking.medium": "\\u{F0AA1} med",
	"thinking.high": "\\u{F0AA3} high",
	"thinking.xhigh": "\\u{F0AA5} xhi",
	"thinking.max": "\\u{F06D} max",
	// Auto mode uses shuffle until the model resolves its thinking level.
	"thinking.autoPending": "\\u{F074}",
	// Checkboxes
	// pick: \uF14A | alt: \uF046 \uF00C
	"checkbox.checked": "\\uf14a",
	// pick: \uF096 | alt: \uF10C
	"checkbox.unchecked": "\\uf096",
	// Radio (single-choice)
	// pick:  (fa-dot-circle-o) | alt:  \u25C9
	"radio.selected": "\\uf192",
	// pick:  (fa-circle-o) | alt:  \u25CB
	"radio.unselected": "\\uf10c",
	// pick: \uF111 | alt: \uF192 \uF10C \u2022
	"format.bullet": "\\uf111",
	// pick: \u2013 | alt: \u2014 \u2015 -
	"format.dash": "\u2013",
	// pick: \u27E8 | alt: [ \u27E6
	"format.bracketLeft": "\u27E8",
	// pick: \u27E9 | alt: ] \u27E7
	"format.bracketRight": "\u27E9",
	// Markdown-specific
	// pick: \u2502 | alt: \u2503 \u2551
	"md.quoteBorder": "\u2502",
	// pick: \u2500 | alt: \u2501 \u2550
	"md.hrChar": "\u2500",
	// pick: \uF111 | alt: \uF192 \u2022
	"md.bullet": "\\uf111",
	// pick: \u25A0 | alt:  (U+F096)
	"md.colorSwatch": "\u25A0",
	// pick: \u258E | alt: \u2503 \u2502
	"advisor.rail": "\u258E",
	// Language icons (nerd font devicons)
	"lang.default": "",
	"lang.typescript": "\\u{E628}",
	"lang.javascript": "\\u{E60C}",
	"lang.python": "\\u{E606}",
	"lang.rust": "\\u{E7A8}",
	"lang.go": "\\u{E627}",
	"lang.java": "\\u{E738}",
	"lang.c": "\\u{E61E}",
	"lang.cpp": "\\u{E61D}",
	"lang.csharp": "\\u{E7BC}",
	"lang.ruby": "\\u{E791}",
	"lang.julia": "\\u{E624}",
	"lang.php": "\\u{E608}",
	"lang.swift": "\\u{E755}",
	"lang.kotlin": "\\u{E634}",
	"lang.shell": "\\u{E795}",
	"lang.html": "\\u{E736}",
	"lang.css": "\\u{E749}",
	"lang.json": "\\u{E60B}",
	"lang.yaml": "\\u{E615}",
	"lang.markdown": "\\u{E609}",
	"lang.sql": "\\u{E706}",
	"lang.docker": "\\u{E7B0}",
	"lang.lua": "\\u{E620}",
	"lang.text": "\\u{E612}",
	"lang.env": "\\u{E615}",
	"lang.toml": "\\u{E615}",
	"lang.xml": "\\u{F05C0}",
	"lang.ini": "\\u{E615}",
	"lang.conf": "\\u{E615}",
	"lang.log": "\\u{F0331}",
	"lang.csv": "\\u{F021B}",
	"lang.tsv": "\\u{F021B}",
	"lang.image": "\\u{F021F}",
	"lang.pdf": "\\u{F0226}",
	"lang.archive": "\\u{F187}",
	"lang.binary": "\\u{F019A}",
	// Settings tab icons
	"tab.appearance": "\uDB80\uDCE3",
	"tab.model": "\uDB81\uDEA9",
	"tab.interaction": "\uDB80\uDF0C",
	"tab.context": "\uDB81\uDE38",
	"tab.files": "\uDB80\uDE14",
	"tab.shell": "\uDB80\uDD8D",
	"tab.tools": "\uDB82\uDC2D",
	"tab.memory": "\uDB82\uDDD1",
	"tab.tasks": "\uDB81\uDC31",
	"tab.providers": "\uDB81\uDD9F",
	// Tool identity icons (per-tool signature glyph on the success header)
	"tool.write": "\\uEA7F",
	"tool.edit": "\\uEA73",
	"tool.bash": "\\uEBCA",
	"tool.ssh": "\\uEB3A",
	"tool.lsp": "\\uEA61",
	"tool.gh": "\\uEA84",
	"tool.webSearch": "\\uEB01",
	"tool.exa": "\\uEB68",
	"tool.browser": "\\uEAAE",
	"tool.eval": "\\uEBAF",
	"tool.debug": "\\uEAD8",
	"tool.mcp": "\\uEB2D",
	"tool.job": "\\uEBA2",
	"tool.launch": "\\uF135",
	"tool.task": "\\uf4a0",
	"tool.todo": "\\uEAB3",
	"tool.memory": "\\uEACE",
	"tool.ask": "\\uEAC7",
	"tool.resolve": "\\uEBB1",
	"tool.review": "\\uEA70",
	"tool.inspectImage": "\\uEAEA",
	"tool.goal": "\\uEBF8",
	"tool.irc": "\\uF086",
	"tool.delete": "\\uf12d",
	"tool.move": "\\uf061",
};

const ASCII_SYMBOLS: SymbolMap = {
	// Status Indicators
	"status.success": "[ok]",
	"status.error": "[!!]",
	"status.warning": "[!]",
	"status.info": "[i]",
	"status.pending": "[*]",
	"status.disabled": "[ ]",
	"status.enabled": "[x]",
	"status.running": "[~]",
	"status.shadowed": "[/]",
	"status.aborted": "[-]",
	"status.done": "*",
	// Navigation
	"nav.cursor": ">",
	"nav.selected": "->",
	"nav.expand": "+",
	"nav.collapse": "-",
	"nav.back": "<-",
	// Tree Connectors
	"tree.branch": "|--",
	"tree.last": "'--",
	"tree.vertical": "|",
	"tree.horizontal": "-",
	"tree.hook": "`-",
	// Progress Bar
	"progress.filled": "=",
	"progress.empty": "-",
	// Context gauge boundaries
	"context.speculation": ":",
	"context.compaction": "|",
	// Box Drawing - Rounded (ASCII fallback)
	"boxRound.topLeft": "+",
	"boxRound.topRight": "+",
	"boxRound.bottomLeft": "+",
	"boxRound.bottomRight": "+",
	"boxRound.horizontal": "-",
	"boxRound.vertical": "|",
	// Box Drawing - Sharp (ASCII fallback)
	"boxSharp.topLeft": "+",
	"boxSharp.topRight": "+",
	"boxSharp.bottomLeft": "+",
	"boxSharp.bottomRight": "+",
	"boxSharp.horizontal": "-",
	"boxSharp.vertical": "|",
	"boxSharp.cross": "+",
	"boxSharp.teeDown": "+",
	"boxSharp.teeUp": "+",
	"boxSharp.teeRight": "+",
	"boxSharp.teeLeft": "+",
	// Separators
	"sep.powerline": ">",
	"sep.powerlineThin": ">",
	"sep.powerlineLeft": ">",
	"sep.powerlineRight": "<",
	"sep.powerlineThinLeft": ">",
	"sep.powerlineThinRight": "<",
	"sep.block": "#",
	"sep.space": " ",
	"sep.asciiLeft": ">",
	"sep.asciiRight": "<",
	"sep.dot": " - ",
	"sep.slash": " / ",
	"sep.pipe": " | ",
	// Icons
	"icon.model": "[M]",
	"icon.plan": "plan",
	"icon.prewalk": "prewalk",
	"icon.goal": "goal",
	"icon.pause": "||",
	"icon.loop": "loop",
	"icon.folder": "[D]",
	"icon.worktree": "[wt]",
	"icon.search": "[/]",
	"icon.scratchFolder": "[T]",
	"icon.file": "[F]",
	"icon.git": "git:",
	"icon.branch": "@",
	"icon.pr": "PR",
	"icon.tokens": "tok:",
	"icon.context": "ctx:",
	"icon.cost": "$",
	"icon.subscription": "(oauth)",
	"icon.advisor": "(adv)",
	"icon.time": "t:",
	"icon.pi": "pi",
	"icon.ghost": "@",
	"icon.agents": "AG",
	"icon.job": "bg",
	"icon.output": "out:",
	"icon.throughput": "tok/s:",
	"icon.cache": "cache",
	"icon.cacheMiss": "!",
	"icon.input": "in:",
	"icon.host": "host",
	"icon.session": "id",
	"icon.package": "[P]",
	"icon.warning": "[!]",
	"icon.rewind": "<-",
	"icon.auto": "[A]",
	"icon.fast": ">>",
	"icon.extensionSkill": "SK",
	"icon.extensionTool": "TL",
	"icon.extensionSlashCommand": "/",
	"icon.extensionMcp": "MCP",
	"icon.extensionRule": "RL",
	"icon.extensionHook": "HK",
	"icon.extensionPrompt": "PR",
	"icon.extensionContextFile": "CF",
	"icon.extensionInstruction": "IN",
	// STT
	"icon.mic": "MIC",
	// Compaction divider
	"icon.camera": "[o]",
	// Thinking Levels
	"thinking.minimal": "[min]",
	"thinking.low": "[low]",
	"thinking.medium": "[med]",
	"thinking.high": "[high]",
	"thinking.xhigh": "[xhi]",
	"thinking.max": "[max]",
	"thinking.autoPending": "[~]",
	// Checkboxes
	"checkbox.checked": "[x]",
	"checkbox.unchecked": "[ ]",
	"radio.selected": "(o)",
	"radio.unselected": "( )",
	"format.bullet": "*",
	"format.dash": "-",
	"format.bracketLeft": "[",
	"format.bracketRight": "]",
	// Markdown-specific
	"md.quoteBorder": "|",
	"md.hrChar": "-",
	"md.bullet": "*",
	"md.colorSwatch": "[]",
	"advisor.rail": "|",
	// Language icons (ASCII uses abbreviations)
	"lang.default": "code",
	"lang.typescript": "ts",
	"lang.javascript": "js",
	"lang.python": "py",
	"lang.rust": "rs",
	"lang.go": "go",
	"lang.java": "java",
	"lang.c": "c",
	"lang.cpp": "cpp",
	"lang.csharp": "cs",
	"lang.ruby": "rb",
	"lang.julia": "jl",
	"lang.php": "php",
	"lang.swift": "swift",
	"lang.kotlin": "kt",
	"lang.shell": "sh",
	"lang.html": "html",
	"lang.css": "css",
	"lang.json": "json",
	"lang.yaml": "yaml",
	"lang.markdown": "md",
	"lang.sql": "sql",
	"lang.docker": "docker",
	"lang.lua": "lua",
	"lang.text": "txt",
	"lang.env": "env",
	"lang.toml": "toml",
	"lang.xml": "xml",
	"lang.ini": "ini",
	"lang.conf": "conf",
	"lang.log": "log",
	"lang.csv": "csv",
	"lang.tsv": "tsv",
	"lang.image": "img",
	"lang.pdf": "pdf",
	"lang.archive": "zip",
	"lang.binary": "bin",
	// Settings tab icons
	"tab.appearance": "[A]",
	"tab.model": "[M]",
	"tab.interaction": "[I]",
	"tab.context": "[X]",
	"tab.files": "[F]",
	"tab.shell": "[S]",
	"tab.tools": "[T]",
	"tab.memory": "[Y]",
	"tab.tasks": "[K]",
	"tab.providers": "[P]",
	// Tool identity icons (per-tool signature glyph on the success header)
	"tool.write": "+f",
	"tool.edit": "~",
	"tool.bash": "$",
	"tool.ssh": "ssh",
	"tool.lsp": "lsp",
	"tool.gh": "gh",
	"tool.webSearch": "web",
	"tool.exa": "exa",
	"tool.browser": "[w]",
	"tool.eval": ">_",
	"tool.debug": "dbg",
	"tool.mcp": "<>",
	"tool.job": "job",
	"tool.launch": "run",
	"tool.task": ">>>",
	"tool.todo": "[x]",
	"tool.memory": "mem",
	"tool.ask": "[?]",
	"tool.resolve": "[v]",
	"tool.review": "rev",
	"tool.inspectImage": "[i]",
	"tool.goal": "(o)",
	"tool.irc": "irc",
	"tool.delete": "rm",
	"tool.move": "mv",
};

export const SYMBOL_PRESETS: Record<SymbolPreset, SymbolMap> = {
	unicode: UNICODE_SYMBOLS,
	nerd: NERD_SYMBOLS,
	ascii: ASCII_SYMBOLS,
};

export type SpinnerType = "status" | "activity";

export const SPINNER_FRAMES: Record<SymbolPreset, Record<SpinnerType, string[]>> = {
	unicode: {
		status: ["\u28FE", "\u28FD", "\u28FB", "\u28BF", "\u287F", "\u28DF", "\u28EF", "\u28F7"],
		activity: ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834", "\u2826", "\u2827", "\u2807", "\u280F"],
	},
	nerd: {
		status: ["\uDB85\uDC56", "\uDB85\uDC4B", "\uDB85\uDC4C", "\uDB85\uDC4D", "\uDB85\uDC4E", "\uDB85\uDC4F", "\uDB85\uDC50", "\uDB85\uDC51", "\uDB85\uDC52", "\uDB85\uDC53", "\uDB85\uDC54", "\uDB85\uDC55"],
		activity: ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834", "\u2826", "\u2827", "\u2807", "\u280F"],
	},
	ascii: {
		status: ["|", "/", "-", "\\"],
		activity: ["-", "\\", "|", "/"],
	},
};

/**
 * Shape accepted by `themeJson.symbols.spinnerFrames`. A flat array applies to
 * both spinner types; an object lets a theme override `status` and/or
 * `activity` independently. Anything not specified falls back to the symbol
 * preset's default frames.
 */
export type SpinnerFramesOverride = string[] | { status?: string[]; activity?: string[] };

export function normalizeSpinnerFramesOverride(
	value: SpinnerFramesOverride | undefined,
): Partial<Record<SpinnerType, string[]>> {
	if (value === undefined) return {};
	if (Array.isArray(value)) return { status: value, activity: value };
	const result: Partial<Record<SpinnerType, string[]>> = {};
	if (value.status) result.status = value.status;
	if (value.activity) result.activity = value.activity;
	return result;
}

/**
 * Get available symbol presets.
 */
export function getAvailableSymbolPresets(): SymbolPreset[] {
	return ["unicode", "nerd", "ascii"];
}

/**
 * Check if a string is a valid symbol preset.
 */
export function isValidSymbolPreset(preset: string): preset is SymbolPreset {
	return preset === "unicode" || preset === "nerd" || preset === "ascii";
}
