# D15_PERSISTENCE_RECOVERY — Persistence / Migration / Corruption / Recovery

Research audit: READY

DOMAIN_ID=D15_PERSISTENCE_RECOVERY
SOURCE_ANALYSIS=Harvested 11 (primary=11): MDN IndexedDB API, Web Storage API, Android architecture recommendations. IndexedDB is transactional, suitable for structured data but prone to version/schema migration issues and corruption under crashes. Web Storage synchronous, limited. Android arch recommends layered design, ViewModel/lifecycle, data models, testing, DI. Core themes: durability, migration, corruption detection/recovery, lifecycle awareness. Limitations: stress/concurrency under cancellation not deeply covered.

CURRENT=TaskManager has retention (maxRetainedCompleted), cleanup on finish/cancel/deadline, listener safety. No persistence layer inspected except core; no recovery/migration/corruption handling logic.

TARGET=Resilient persistence: transactional writes with rollback, versioned schemas, corruption detection, crash recovery, and cancellation-aware transactions (abort early). Align with Android lifecycle (background constraints). Prevent stale writes post-cancel/seal.

NOW=Persistence abstraction (TaskStore) with TaskContext signal: transactions listen to abort and rollback. Versioned snapshots. Write-after-seal returns deterministic error or drops per policy. Basic corruption check (checksum/version).

NEXT=IndexedDB migrations with backward compatibility; recovery journal (WAL) for crash recovery; retry with backoff for transient errors (map to SevenError retryable). Eviction consistent with maxRetainedCompleted.

LATER=Full Android architecture alignment (data layer), Web Storage fallback none; integrity verification, automated recovery tests.

TESTS=Deterministic: cancelled transaction rolls back, no partial state; migration success/failure; corruption detected -> recovery path. Adversarial: crash mid-transaction, rapid writes/cancels. Android: background kill/restart.

RISKS=Stale writes, data corruption, migration failures blocking startup, transaction leaks, privacy of persisted task data.

FIRST_SLICE=TaskStore interface with in-memory transactional impl respecting AbortSignal + rollback on cancel; versioned writes. Proves recovery semantics without full IndexedDB.

KNOWN_UNKNOWNS=Concrete persistence targets (which stores), schema ownership, retention policy alignment across subsystems.

DOMAIN_VERDICT=READY_FOR_PLAN
