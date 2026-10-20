# D17_PERFORMANCE_CONCURRENCY — Performance / Concurrency / Long Chat / Races

Research audit: READY

DOMAIN_ID=D17_PERFORMANCE_CONCURRENCY
SOURCE_ANALYSIS=Harvested evidence is READY for D17 with 12 sources (7 primary). Android core app quality, web.dev long tasks, and MDN Streams provide performance/responsiveness guidance. Disagreement: web performance guidance is generic; Android exact-build behavior remains unproven. Limitation: no Seven profiling data.
CURRENT=Seven code has concurrency tests (`memory-concurrency.test.ts`), diagnostics buffer with bounded capacity, model router attempt tokens, and Deep Think streaming. No dedicated performance profiling module found. Evidence level: code + tests, no measurements.
TARGET=Performance budgets for startup/render/long chat, cancellation deadlines, non-blocking streaming, and stress tests for long conversations.
NOW=Define budgets and add regression probes for long-task durations, memory growth, and cancellation latency in tests.
NEXT=Add long-chat stress harness and UI virtualization review.
LATER=Android-specific profiling and performance regression gates.
TESTS=Stress tests for long chats, concurrent requests, cancellation deadlines, storage pressure; browser profiling where available.
RISKS=UI thread blocking; unbounded history; storage pressure; race conditions.
FIRST_SLICE=Performance budget document + deterministic stress probes.
KNOWN_UNKNOWNS=No profiling measurements; no Android runtime evidence.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
