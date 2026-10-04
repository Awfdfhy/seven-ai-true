# A09 — Performance / Concurrency

Status: ACTIVE KNOWLEDGE PACK

## Mission

Keep Seven responsive on midrange Android hardware under long chats, streaming, storage/network pressure and concurrent tasks.

## Deep knowledge

Main-thread budget; rendering/jank; incremental/virtualized long chat; scheduling; cancellation; backpressure; task ownership; race detection; stale writes; network latency decomposition; storage hot paths; startup; lazy loading; memory pressure; performance tiers.

## Failure patterns

• synchronous large localStorage writes.
• rerender whole transcript per token.
• duplicate requests after retry.
• stream completion writes stale room.
• expensive visual effects during heavy work.
• background task blocks composer.

## Required tests

500+ message room; concurrent send/switch/stop; slow network; repeated reconnect; storage pressure; background/foreground; CPU-throttled browser; Android frame/jank evidence; startup cold/warm.

## Metrics

Time to first useful paint; input latency; send→first token; streaming frame time; long-task count; memory use; room-switch latency; cancellation latency; duplicate action rate.

## References

Android Core App Quality performance targets, MDN storage/streams, OpenTelemetry semantics for traces/metrics.

## Evidence

### Evidence hierarchy
1. Exact installed APK journey on Android.
2. Deterministic integration/E2E evidence.
3. Browser/runtime evidence tied to exact SHA.
4. Source inspection.
5. Agent inference.
6. Aesthetic opinion.

Every material claim should identify which level supports it. Missing evidence is UNPROVEN, not PASS.

## Quality

### Quality rule
Do not optimize for feature count. Optimize for a coherent user outcome. A change is incomplete when it works technically but creates duplicated controls, unexplained states, inconsistent visual language, fragile recovery, or a worse core chat experience.
