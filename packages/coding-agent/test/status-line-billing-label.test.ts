import { describe, expect, test } from "bun:test";
import { renderSegment } from "../src/modes/components/status-line/segments";
import type { SegmentContext } from "../src/modes/components/status-line/types";
import { SYMBOL_PRESETS } from "../src/modes/theme/symbols";
import { theme } from "../src/modes/theme/theme";

/** Issue #5112: OAuth-billed models used to render a "(sub)" badge, which users
 *  read as "subagent" and mistook for the session being stuck in subagent mode.
 *  The badge means "subscription billing"; it now reads "(oauth)" so it cannot
 *  be confused with subagent state. */
describe("status line billing label (#5112)", () => {
	test("no symbol preset uses the ambiguous (sub) marker", () => {
		for (const symbols of Object.values(SYMBOL_PRESETS)) {
			expect(symbols["icon.subscription"]).not.toBe("(sub)");
		}
		expect(SYMBOL_PRESETS.unicode["icon.subscription"]).toBe("(oauth)");
		expect(SYMBOL_PRESETS.ascii["icon.subscription"]).toBe("(oauth)");
	});

	test("cost segment renders (oauth), never (sub), for OAuth-billed model with no accrued cost", () => {
		const ctx = {
			usageStats: {
				input: 0,
				output: 0,
				cacheRead: 0,
				cacheWrite: 0,
				orchestrationInput: 0,
				orchestrationOutput: 0,
				cost: 0,
				premiumRequests: 0,
				tokensPerSecond: 0,
			},
			session: {
				state: { model: { id: "test-model" } },
				modelRegistry: { isUsingOAuth: () => true },
				getAdvisorCost: () => 0,
				isAdvisorUsingSubscription: () => false,
			},
			options: {},
		} as unknown as SegmentContext;

		const rendered = renderSegment("cost", ctx);
		expect(rendered.visible).toBe(true);
		expect(rendered.content).not.toContain("(sub)");
		if (theme.getSymbolPreset() !== "nerd") {
			expect(rendered.content).toContain("(oauth)");
		}
	});
});
