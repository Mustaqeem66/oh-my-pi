#!/usr/bin/env python3
"""One-shot bootstrap for issue #6335 (self-removing; ASCII-only by design).

Applies three anchored edits to packages/stats/src/client/routes/ModelsRoute.tsx:
  A. pass the active TimeRange into buildModelPreferenceSeries at the call site
  B. export the builder and accept the range parameter
  C. pre-fill one dataMap row per range bucket so the x-axis stays uniform

Fail-closed: every anchor must match exactly once or the script aborts
without writing anything.
"""

import sys

PATH = "packages/stats/src/client/routes/ModelsRoute.tsx"

with open(PATH, encoding="utf-8") as f:
    src = f.read()

def replace_once(haystack: str, old: str, new: str) -> str:
    count = haystack.count(old)
    if count != 1:
        print(f"FATAL: segment matched {count} times (expected 1): {old[:80]!r}")
        sys.exit(1)
    return haystack.replace(old, new, 1)

# --- Edit A: call site ----------------------------------------------------------
src = replace_once(
    src,
    "\tconst chartData = useMemo(() => buildModelPreferenceSeries(modelSeries), [modelSeries]);\n",
    "\tconst chartData = useMemo(() => buildModelPreferenceSeries(modelSeries, timeRange), [modelSeries, timeRange]);\n",
)

# --- Edit B: signature (exported for the regression test) ------------------------
src = replace_once(
    src,
    "function buildModelPreferenceSeries(\n"
    "\tpoints: ModelTimeSeriesPoint[],\n"
    "\ttopN = 5,\n"
    "): {\n",
    "export function buildModelPreferenceSeries(\n"
    "\tpoints: ModelTimeSeriesPoint[],\n"
    "\trange: TimeRange,\n"
    "\ttopN = 5,\n"
    "): {\n",
)

# --- Edit C: bucket-grid pre-fill -------------------------------------------------
src = replace_once(
    src,
    "\tconst dataMap = new Map<number, Record<string, number>>();\n"
    "\n"
    "\tfor (const point of points) {\n",
    "\tconst dataMap = new Map<number, Record<string, number>>();\n"
    "\n"
    "\t// #6335: pre-fill one row per range bucket so the x-axis stays uniform\n"
    "\t// even when some buckets saw no requests. Mirrors the gap-fill grid in\n"
    "\t// buildModelPerformanceLookup (../data/view-models). The \"all\" range has\n"
    "\t// no fixed grid (bucketCount 0) and keeps the sparse observed timestamps.\n"
    "\tconst { bucketMs, bucketCount } = rangeMeta(range);\n"
    "\tif (bucketCount > 0) {\n"
    "\t\tconst maxTimestamp = points.reduce((max, point) => Math.max(max, point.timestamp), 0);\n"
    "\t\tconst anchor = maxTimestamp > 0 ? maxTimestamp : Math.floor(Date.now() / bucketMs) * bucketMs;\n"
    "\t\tconst start = anchor - (bucketCount - 1) * bucketMs;\n"
    "\t\tfor (let i = 0; i < bucketCount; i++) {\n"
    "\t\t\tconst timestamp = start + i * bucketMs;\n"
    "\t\t\tdataMap.set(timestamp, { timestamp, total: 0 });\n"
    "\t\t}\n"
    "\t}\n"
    "\n"
    "\tfor (const point of points) {\n",
)

with open(PATH, "w", encoding="utf-8") as f:
    f.write(src)

print("bootstrap-6335: all 3 edits applied")
