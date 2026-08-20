# Memory Fabric

Memory Fabric is an opt-in, flag-gated subsystem that gives the coding agent durable, budget-aware memory: it persists working state across sessions, retrieves only the most relevant prior context under an explicit token budget, and degrades context *gracefully* (progressive fidelity) instead of dropping it abruptly at compaction time.

Everything lives under `packages/coding-agent/src/memory-fabric/` (~52 source modules: 46 flat lanes + 8 subsystems) with a matching per-lane test suite under `test/memory-fabric/`. The subsystem is **off by default** and contributes nothing to the default execution path: `activateMemoryFabric` (in `session-integration/activation.ts`) returns `null` unless the feature flag is enabled.

## The problem it solves

Today the agent's memory of a session is bounded by the context window plus lossy compaction:

1. **Context loss is abrupt.** When compaction triggers, detail is summarized away wholesale. There is no intermediate state between "full text in context" and "gone".
2. **Nothing durable survives the process.** Objectives, decisions, and hard-won discoveries from one session are invisible to the next unless the user re-explains them.
3. **Context selection is not budget-aware.** There is no mechanism that asks "given N tokens of headroom, which memories/artifacts maximize usefulness for *this* task?"
4. **No feedback loop.** The agent never learns which retrieved context actually helped.

Memory Fabric addresses all four with deterministic, pure, fail-open modules.

## Architecture (layer by layer)

### Retrieval

`rrf-fusion`, `tiered-retrieval-{types,broker}`, `spiking-retrieval-gate`, `lane-selection`, `lane-adapters`, and the `capability-*` family (discovery, graph, ranking, retrieval gate, retriever, seed fusion, conflict resolution, cycle analysis, bundling, fidelity, orchestration, planner adapter, policy).

Multiple retrieval lanes (recency, semantic, lexical, capability graph, git signals) are fused with Reciprocal Rank Fusion; a gate decides *whether* retrieval is worth spending tokens on at all, so quiet turns pay nothing.

### Context shaping

`progressive-context`, `context-composer`, `contextual-coverage`, `coverage-expansion-builder`, `response-density`, `solution-minimality`, `output-distillation`, `context-hygiene/`.

Selected material is composed into the prompt at graduated fidelity levels (full text -> distilled -> handle-only), with coverage analysis to detect gaps and expansion builders to fill them on demand.

### Budgets & fidelity

`budget-profiles`, `token-breakdown`, `activation-sparsity`, `expansion-thresholds`, `hybrid-fidelity-router`, `capability-fidelity`, `adaptive-fidelity/`, `token-accounting/`.

Every byte that enters the prompt is accounted against an explicit budget. The adaptive-fidelity engine demotes items through fidelity stages as pressure rises and re-expands them (by handle) when they become relevant again -- the graceful alternative to compaction cliff-drops.

### Events

`event-gateway`, `event-timeline`, `event-agent-tree` -- a typed event layer that projects session activity into a timeline and an agent tree, feeding both retrieval and observability.

### Durability & safety

`persistence/` (SQLite-backed checkpoint store, append-only event journal with monotonic sequence ordering, single-row working-state register), `guardian/`, `security/`, `redaction`, `scoping`, `retention`.

Checkpoints capture resumable working state; the journal is replayable; redaction strips secrets before anything is persisted; scoping keeps memories partitioned; retention prunes deterministically.

### Behavioral intelligence

`git-intelligence` (co-change analysis: which files historically change together, so the agent can anticipate related edits) and `calibration` (confidence calibration for retrieval scores).

### Observability & benchmarking

`observability-report` -- pure composition of the timeline / agent-tree / token projections into a single report with text renderers. `git-intelligence-benchmark` -- an honest held-out co-change benchmark: no train/test leakage, exact per-sample means, explicit skip counts. (The private predecessor benchmark was rejected during the port for fabricating metrics; it was rewritten from scratch.)

### Quality & rollout

`quality-auditing`, `usefulness-feedback` (closes the loop: was retrieved context actually used?), `utilization`, `release-manifest`, `rollout/` (staged-rollout gating).

### Lifecycle integration & composition root

`session-integration/` owns the single runtime entry point (`activateMemoryFabric`). `index.ts` is a deliberately thin barrel (re-exports `types.ts` only); in-package callers import file subpaths directly, matching this repo's alias resolution.

## What this gives the omp CLI

- **Cross-session continuity.** Resume tomorrow with today's objectives, decisions, and discoveries intact -- checkpointed, journaled, and retrievable, not re-explained.
- **Cheaper long sessions.** Budget-aware selection + progressive fidelity means the prompt carries distilled handles instead of full transcripts; expansion is on-demand and paid for only when needed.
- **A graceful degradation curve.** Fidelity stages replace the compaction cliff: context fades through summaries and handles rather than vanishing.
- **Better multi-file awareness.** Git co-change intelligence surfaces "files that historically move together" at exactly the moment the agent edits one of them.
- **Secrets never persist.** Redaction runs before any write; scoping and retention bound what is kept and for how long.
- **Everything is inspectable.** One observability report answers "what did the fabric retrieve, at what fidelity, and what did it cost?" -- and the benchmark quantifies retrieval quality honestly.
- **Zero cost when disabled.** Off by default; the default path is untouched.

## Design principles

1. **Pure, deterministic, fail-open.** Modules are pure functions or small stores; failures disable the fabric rather than the session. No `Math.random()` identifiers, no wall-clock nondeterminism in logic paths (ordering ties break on monotonic rowid/seq, never on random-suffix ids).
2. **Flag-gated, additive-only.** Not a single existing file is modified; the PR is purely additive. Nothing activates without the flag.
3. **Audited, not transcribed.** Every private-lane predecessor was audited (each carried 3-17 hard defects) and rewritten to this repo's conventions; defective modules were excluded outright and the exclusions are documented in the PR description.
4. **Tested per lane.** Every lane ships with its own test file; tests exercise builders/fixtures and never mutate source behavior to pass.

## Why this should be merged

- **It is purely additive and flag-gated off.** 162 files, all under `{src,test}/memory-fabric/`, zero deletions, zero edits to existing code. Merged-but-disabled, it is inert: no runtime, startup, or bundle-behavior change for any user until the flag is turned on. The risk profile of merging is effectively the risk of adding dormant, fully-tested code.
- **CI is green at the current tip**, including the memory-fabric native/unit buckets, lint, and type-checks across the workspace.
- **It unlocks staged experimentation.** With the code in-tree, persistent memory and adaptive context can be evaluated behind the flag (and the included `rollout/` gating) on real workloads, instead of bit-rotting on a fork that must chase upstream churn.
- **Review cost is bounded.** The subsystem is self-contained with one entry point (`session-integration/activation.ts`); reviewing that seam is sufficient to verify the "inert when disabled" guarantee. Everything else can be reviewed incrementally post-merge if preferred.
- **The quality bar matches the repo.** Deterministic modules, honest benchmarking, documented exclusions of every low-quality private predecessor, and per-lane tests -- written to biome/tsgo conventions used here.

## Known follow-ups (maintainer's call)

1. **Feature-flag convention.** Activation currently gates on the `OMP_MEMORY_FABRIC` environment variable; the repo's native convention is a Settings key (`settings.get("memory.backend")`-style). This can be migrated on the PR branch or as a small post-merge follow-up.
2. **Deeper wiring.** The fabric currently integrates at the session-activation seam only. Optional deeper hooks (compaction interplay, TUI surfacing of the observability report) are intentionally deferred until the core is reviewed.

## Enabling it

Set the feature flag (currently `OMP_MEMORY_FABRIC`; see follow-up #1) and the session-integration layer activates the fabric at session start. With the flag unset, `activateMemoryFabric` returns `null` and the agent behaves exactly as before.
