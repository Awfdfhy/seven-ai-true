# D17_PERFORMANCE_CONCURRENCY — Performance / Concurrency / Long Chat / Races

Research audit: READY

DOMAIN_ID=D17_PERFORMANCE_CONCURRENCY
SOURCE_ANALYSIS=Harvested 12 (primary=7): Android Core App Quality guidelines, web.dev “long tasks” (diagnose costly tasks delaying TTI), MDN Streams API. Emphasizes responsiveness, smoothness, avoiding long tasks on main thread, efficient streaming. Streams enable processing without buffering entire payloads. Android quality focuses on stability/performance. Limitations: no explicit agent task cancellation race taxonomy but principles apply.

CURRENT=TaskManager implementation shows: Map of MutableTask, Set of listeners, completedOrder cleanup, exclusiveOwners. Lifecycle states include cancelling; sealCancellation/sealDeadline prevent double effects; requestCancel sets status to cancelling then aborts controller; finish() clears timeout, sets finishedAt, emits, prunes completedOrder up to maxRetainedCompleted. Error mapping produces sanitized public messages; listener exceptions swallowed. Tests: success, cancel-once (abortEvents==1), owner isolation, timeout->deadline.

GAPS (stress/races relevant to B09): taskId generation not shown (could collide? probably UUID). Executor throws synchronously before signal registration? run() does Promise.resolve().then(executor)… so throws become rejection; cleanup called. cancel() called immediately after run() returns (before running state) – requestCancel checks states (starting/running/cancelling) so can move to cancelling; abort() called. Signal listener added once. Seal logic: cancellationSealed prevents further external cancel effects in some paths; deadline seal also. multi-owner conflicts: exclusiveOwners blocks if reserved or any active tasks for owner – matches “duplicate actions/multi-owner conflicts”. Stale writes: not directly handled (persistence separate). Rapid start/cancel race: state machine uses status checks. maxRetainedCompleted eviction: while loop shifts oldest; if oldest removed from tasks? yes deletes. Listeners copied before emit.

IMPROVEMENTS: add concurrency stress tests (many tasks, rapid cancel, overlapping listeners), ensure taskId uniqueness, document memory visibility, consider AbortSignal reason propagation consistency, test executor throwing before/after abort, deadline fired after cancellation (sealDeadline clears timeout). Also “duplicate actions” at spec level (same owner+kind running)? exclusiveOwners prevents reservation but allows multiple different owners; same owner active allowed unless reserved – design choice. Cancellation reason: stored as string (user reason or "deadline") – good.

TARGET=Hardened TaskManager for stress: eliminate data races, deterministic cancellation, bounded retention, non-blocking emit, robust cleanup. Meet Android/core quality (no long-blocking work in emit/listeners), web.dev guidance (tasks short). Support Streams for large results without blocking.

NOW=Add stress tests: 100 rapid start/cancel per owner, concurrent subscribe/unsubscribe, listener throws many times, maxRetainedCompleted boundary under churn, deadline vs cancel race, executor synchronous throw. Verify abortEvents==1 invariant holds. Add invariant checks.

NEXT=Make emit async-safe (microtask) if needed, but current copies listeners. Consider WeakSet? no listeners owned externally. Improve error context safety. Add metrics (active count, completed). Streams API integration: TaskRun can return ReadableStream with cancellation propagation.

LATER=Static analysis for race conditions, model checking states, performance benchmarks (throughput). Android Jank-free guarantees.

TESTS=Stress: race conditions, churn, memory bounds. Deterministic: state transitions. Adversarial: malformed specs, overflow timeout.

RISKS=Memory leaks if listeners not unsubscribed (unsubscribe exists), timer leaks (cleanup present), uncoordinated state changes. Performance degradation under high churn.

FIRST_SLICE=Add targeted stress tests covering rapid cancel/start, deadline-after-cancel, listener churn, maxRetainedCompleted eviction – proves current invariants hold and exposes any gaps.

KNOWN_UNKNOWNS=None major from code; taskId generation source. Integration points with UI long tasks.

DOMAIN_VERDICT=READY_FOR_PLAN
