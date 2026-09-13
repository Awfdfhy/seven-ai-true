# Seven AI — Velocity Fabric

> **Status:** Canonical cross-cutting performance and smoothness architecture for Seven AI.
> **Scope:** Every core capability, Tool Fabric 2.0 family, workspace, provider path, local runtime, UI surface, background task, persistence path, and Android integration.
> **Objective:** Make Seven feel and remain as fast, responsive, fluid, efficient, and stable as practical without sacrificing correctness, authority, verification, safety, recoverability, or meaningful capability.

---

# 1. Prime Law

**No capability may make Seven globally slower merely by existing.**

A heavy capability that is unused should impose approximately zero work on startup and the ordinary hot path. Capabilities should be discovered, initialized, loaded, warmed, and executed only when justified.

Performance is not merely raw completion time. Seven optimizes:
- cold startup latency
- warm startup latency
- time to interactive
- interaction/input latency
- time to first visible feedback
- time to first streamed output
- end-to-end task latency
- sustained throughput
- frame/render smoothness
- cancellation latency
- recovery latency
- perceived latency
- RAM footprint
- CPU work
- battery cost
- thermal cost
- storage I/O
- network cost

Correctness and safety constraints remain dominant. Seven must never fabricate completion or skip required verification merely to appear faster.

# 2. Critical-Path Architecture

Every important user flow should have an observable critical path. Seven should identify which stages actually block useful progress and optimize those first.

Principles:
- remove unnecessary serial dependencies
- parallelize independent work
- begin useful work before optional work
- move non-critical work off the blocking path
- avoid repeated parsing, retrieval, compilation, initialization, and serialization
- avoid global initialization when local/on-demand initialization is sufficient
- expose truthful incremental progress instead of waiting for the entire pipeline

# 3. Fast Paths

Provide explicit fast paths for simple/common operations. A trivial task must not traverse the maximum research, memory, reasoning, tool, verification, or model pipeline.

Fast paths may use:
- lightweight intent/capability classification
- direct deterministic utilities
- local indexes
- cached validated state
- small context assembly
- cheaper/faster eligible models
- direct tool invocation when planning is unnecessary

Escalate progressively only when evidence shows that more compute is useful.

# 4. Lazy Capability Loading

Heavy systems should be lazy by default:
- model runtimes
- OCR
- speech
- embeddings/reranking
- document engines
- media engines
- maps/geospatial
- scientific compute
- browser automation
- large connector catalogues
- advanced verification specialists
- optional UI workspaces

Support unloading/reclamation where practical.

# 5. Adaptive Concurrency

Parallel execution is permitted only when dependencies, authority, side effects, resource pressure, and provider limits make it safe.

The Resource Governor controls concurrency using:
- RAM pressure
- CPU pressure
- thermal state/headroom
- battery state
- network state
- foreground/background state
- provider health/rate state
- task priority

Use bounded queues and backpressure. Never create unbounded fan-out.

# 6. Streaming & Incremental Work

Where semantics permit:
- stream model output
- stream tool progress
- incrementally parse large results
- incrementally render long content
- incrementally index/import large artifacts
- incrementally update typed UI
- progressively reveal research evidence

Streaming must preserve cancellation, reconciliation, and final-state correctness.

# 7. Cache Architecture

Use typed, scoped, validity-aware caches rather than generic permanent caches.

Every important cache entry should know when relevant:
- source identity
- source version/hash
- principal/account scope
- freshness/TTL
- transformation version
- model/tool/provider version
- invalidation relation
- approximate resource cost

Potential layers:
- in-memory hot cache
- persistent local cache
- retrieval/index cache
- extraction cache
- capability discovery cache
- provider/model metadata cache
- compiled/parsed representation cache

Never allow cache state to silently become canonical authority.

# 8. Deduplication & Coalescing

Avoid duplicated simultaneous or repeated work through:
- request coalescing
- retrieval deduplication
- duplicate tool-call detection
- shared immutable intermediate results
- repeated-context detection
- extraction/index reuse
- content-addressed artifacts where useful

Side-effecting requests require idempotency/authority rules and must never be blindly coalesced.

# 9. Safe Speculation & Prefetch

Speculative work is allowed only when:
- it has no unsafe side effect
- it is cheap enough to discard
- confidence of usefulness is sufficient
- resource pressure permits it
- cancellation is cheap

Prefer conservative prefetch. Never prefetch large models or expensive media systems merely because they might be used.

# 10. Scheduling & Priority

Use explicit priorities for:
- user input/interaction
- visible foreground work
- cancellation
- safety/authority checks
- task-critical tools
- streaming/render work
- background indexing
- maintenance/cleanup

Background work must yield to interactive work.

# 11. UI Smoothness Runtime

Protect the UI thread/main rendering path.

Principles:
- incremental rendering
- list/message virtualization when justified
- bounded DOM/view complexity
- avoid unnecessary layout/reflow/repaint
- batch safe visual updates
- avoid heavy synchronous parsing/rendering
- offload eligible CPU-heavy work
- throttle/debounce appropriate high-frequency events
- lightweight skeleton/progress states
- interruptible animations
- no decorative infinite loops
- reduced-motion compliance
- performance-tier-aware effects

Long terminal output, chats, file trees, research results, timelines, charts, and RPG history should remain usable at scale.

# 12. Perceived Performance

Seven should acknowledge input quickly and expose truthful state transitions such as preparing, searching, running tools, verifying, recovering, or waiting on a provider.

Never use fake progress percentages or fake completion. Perceived performance comes from immediate interaction response, early useful output, continuity, and honest progress visibility.

# 13. Resource Governor Integration

Velocity Fabric and Resource Governor operate together.

Under pressure Seven may:
- reduce concurrency
- defer background work
- reclaim caches
- unload optional local models
- reduce optional animation/effects
- reduce speculative work
- reduce optional verification depth only where safety/correctness contracts permit
- prefer remote/local execution according to measured cost
- choose lighter retrieval/model paths

Use hysteresis to avoid rapid tier oscillation.

# 14. Adaptive Compute Integration

Adaptive Compute chooses the minimum sufficient amount of:
- reasoning
- retrieval
- context
- model strength
- tools
- verification

Velocity Fabric supplies latency/resource evidence to those decisions. Performance cannot override required truth, permission, or side-effect guarantees.

# 15. Network Efficiency

Optimize remote work through:
- request reuse where valid
- connection/session reuse where platform/provider permits
- payload minimization
- selective fields/ranges
- compression where beneficial
- cancellation
- bounded retries with jitter/backoff
- avoiding duplicate downloads
- offline/local fallbacks where appropriate
- network-aware scheduling for non-urgent heavy transfers

# 16. Storage & Persistence Efficiency

Avoid full-state rewrites when incremental/transactional updates suffice. Use appropriate indexing, batching, compaction, checkpointing, and migration strategies while preserving crash safety and integrity.

Large histories, memory ledgers, research evidence, projects, and generated artifacts should not make normal interactions progressively slower without bound.

# 17. Performance Budgets

Each major Seven capability must define relevant budgets rather than relying on vague "fast" claims.

Possible budgets include:
- initialization cost
- hot-path latency
- memory overhead when idle
- memory overhead when active
- storage growth
- network transfer
- background CPU
- thermal/battery impact
- UI frame/render cost
- cancellation response

Budgets may vary by Full/Balanced/Lite tier and device evidence class.

# 18. Instrumentation

Measure before optimizing. Observability should support:
- critical-path spans
- stage timings
- queue wait
- provider latency
- tool latency
- retrieval latency
- context compilation latency
- time to first output
- rendering latency/jank indicators
- cache hit/miss
- duplicate work avoided
- cancellation latency
- RAM/CPU/thermal evidence
- startup phases

Telemetry must respect privacy/redaction boundaries.

# 19. Regression Gates

Performance is a release/evolution constraint. Evals should detect regressions in:
- startup
- interaction responsiveness
- first output
- total latency
- memory
- battery/thermal proxies
- network use
- long-session degradation
- large-project degradation
- scrolling/rendering smoothness
- cancellation

A feature that materially regresses global performance must be optimized, isolated/lazy-loaded, degraded by tier, or rejected unless its value clearly justifies the measured cost.

# 20. Graceful Degradation

When resources are constrained, preserve core correctness and user control first. Degrade decoration and optional intelligence before essential functionality, authority checks, safe cancellation, persistence integrity, or required verification.

# 21. Velocity Polish Requirement

Every capability undergoing Ultimate Polish must receive a dedicated Velocity & Smoothness Assault covering:
1. cold-path cost
2. hot-path cost
3. idle cost
4. dependency critical path
5. opportunities for parallelism
6. lazy loading/unloading
7. caching/reuse
8. streaming/incremental execution
9. cancellation responsiveness
10. UI smoothness
11. Android resource behavior
12. network/storage efficiency
13. performance budgets
14. instrumentation
15. regression tests

The resulting polish record must state what was made faster, what tradeoffs were accepted, and what cannot safely be accelerated.

# 22. Velocity Invariants

1. Unused heavy capabilities should impose approximately zero ordinary-path work.
2. User interaction outranks background optimization.
3. Independent work may parallelize; dependent or unsafe work must not.
4. No unbounded concurrency or queue growth.
5. Caches are derived and validity-scoped, never silent authority.
6. Cancellation should propagate rapidly through compatible work.
7. Expensive capability discovery/loading is progressive.
8. Long sessions/projects must not degrade without bound.
9. Smoothness is measured, not inferred from animation.
10. Performance optimizations cannot bypass truth, permission, security, or required verification.
11. Every major performance optimization must be measurable and regression-testable.
12. Complexity introduced solely for speed must prove its benefit.

---

# Campaign Position

For each capability/family the campaign order is:

**Ultimate Polish Pass A -> Velocity & Smoothness Assault -> Ultimate Polish Pass B -> Velocity Regression Assault -> Reconciliation Gate -> Final Freeze Candidate**

After individual systems are complete, repeat performance analysis across cross-system critical paths and then perform a whole-Seven velocity/red-team pass.
