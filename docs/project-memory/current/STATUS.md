# Seven AI — Current Status

## Active Development Branch
`ultimate-polish-v1`

## Ultimate Polish Execution
**Counter:** `5 / ~20–25`

- Mega-Wave 01 — Speed + Smoothness Foundation → `PASS_FOUNDATION` ✅
- Mega-Wave 02 — Cognitive Runtime + Truth/Epistemic Foundation → `PASS_FOUNDATION` ✅
- Mega-Wave 03 — Memory Fabric + Context Workspace Foundation → `PASS_FOUNDATION` ✅
- Mega-Wave 04 — Model Fabric + Adaptive Compute Foundation → `PASS_FOUNDATION` ✅
- Mega-Wave 05 — Tool Fabric + Tool Security + Side-Effect Recovery Foundation → `PASS_FOUNDATION` ✅

Detailed durable evidence: `ULTIMATE_POLISH_PROGRESS.md`.

## Wave 05 verified truth
Tool execution now has a protected-source-safe governed foundation outside the release startup hot path. Canonical `CapabilitySpec`, `BindingRevision` and `ToolCatalogSnapshot` identities separate capability meaning from concrete adapters; security-relevant catalogue metadata participates in snapshot identity; external hints cannot lower Seven's effect/idempotency classification; discovery never equals activation; stale/forged binding metadata and schema drift fail closed; retrieval is cheap Unicode lexical first, bounded, schema-cold and supports large catalogues; full schemas are exposed only for shortlisted bindings; and `ToolCallContract` binds the exact snapshot, binding revision, schema fingerprint, validated arguments, authorization receipt, task and idempotency semantics.

Tool Security now requires authoritative source events for grants, nonempty action scope, principal/task/project/resource/destination boundaries, explicit read-vs-release separation, policy/revocation epochs, exact binding/schema identity, payload-bound effectful authorization, origin-taint-bound fingerprints, narrowing authority leases/subleases and exact confirmation receipts. Model/tool/memory/summary content cannot mint permission.

Side-Effect Ledger 3.0 keeps logical Effect identity separate from attempts and separates dispatch certainty from real effect certainty. Transport success never becomes effect truth automatically; possible post-dispatch effects do not blind-retry; KEYED_REPEAT requires actual idempotency evidence; reconciliation is source-bound and bounded; cancellation preserves uncertainty; restart can attach refreshed authorization/contract lineage to the same logical Effect; concurrent duplicate attempts are blocked; compensation remains a separate linked Effect and cannot erase uncertainty about the original action.

Final Wave 05 implementation HEAD: `20071a7673e88c7d4949fc96dedb8ea8584f7a73`. GitHub Actions run `34862645886` / #1433: **success**. Evidence: `PASS (43 suites)`, Tool/Security/Effect `PASS (54 assertions)`, Model/Compute `36`, Memory/Context `15`, Cognitive Boost `23`, Cognitive Gate `7`, Cognitive Planner `4`, Runtime Smoke `28`, Performance `11`, execution-bridge security/recovery PASS, release verification PASS, six screenshots PASS and artifact upload PASS. Static audit remained `99794 / 100000` startup bytes, `34881` lazy workspace bytes, `3689584 / 8388608` static APK bytes and `0 warnings`. Protected source remained exactly `658133` bytes / blob `3e8dfa8e7da7124e16504140eb9631c10cabf053`.

## Protected Source
`seven_ai-final.html`

Integrity reference: `658133` bytes, Git blob `3e8dfa8e7da7124e16504140eb9631c10cabf053`.
Do not modify it without explicit user authorization.

## Major implementation truth
- **Performance:** Wave 01 foundation verified; real-phone battery/RAM/thermal/frame evidence remains.
- **Cognitive + Truth:** Wave 02 foundation verified; full CR3/ClaimGraph/retraction projection remains later work.
- **Memory + Context:** Wave 03 foundation verified; scalable persistence/optional semantic indexes/complete derived invalidation remain later work.
- **Model Fabric + Adaptive Compute:** Wave 04 foundation verified; live-provider/adapters and real-device tuning remain later work.
- **Tool Fabric + Security + Effects:** Wave 05 foundation verified. The strongest contracts live in host/hardening runtime to preserve the `99794` startup boundary; migration of every browser/specialist dispatch path, durable on-device effect persistence, real external reconciliation and full adapter/MCP qualification remain integration work.
- **Verification / Evals:** existing promotion/eval foundations are strong but the general Judge + Benchmark Fabric is the active Wave 06 boundary.
- **Research:** verification/citation foundation exists; acquisition orchestration remains partial.
- **Coding:** repo/patch/evolution foundations exist; final platform file/shell bridge remains partial.
- **RPG / Real Works:** canon/world/title runtime foundations exist; full chat orchestration and final specialist UI remain partial.
- **Story Fabric:** architecture-polished in `STORY_FABRIC_ULTIMATE_POLISH.md`; executable runtime/benchmarks remain for the RPG/Real Works specialist campaign.
- **Visual Intelligence:** V1.4 architecture is `ARCHITECTURE_SATURATED_2_OF_2`; final visual implementation remains later.
- **Android:** packaging/emulator foundations exist; real-device certification, SAF/Keystore and live-provider/device evidence remain incomplete.

## Explicit open issues
- remaining Ultimate Polish Mega-Waves after `5 / ~20–25`;
- real Android startup/RAM/battery/thermal/frame and long-session evidence;
- durable on-device effect journal/recovery after real process death and live external side-effect reconciliation;
- full external adapter/MCP qualification and circuit-breaker persistence;
- full long-horizon benchmark/competitor evaluation;
- Story Fabric implementation and long-horizon narrative evaluation;
- final visual implementation, Android visual certification and Visual Red Team;
- dependency install currently reports `7` audit findings (`3 moderate`, `3 high`, `1 critical`) plus deprecated transitive packages and GitHub Action Node deprecation warnings. These are not hidden by subsystem PASS labels.

## Immediate Next Work
**Mega-Wave 06 — Verification / Judge + Seven Evals / Benchmark Foundation.** Build evidence-bound layered adjudication, immutable benchmark/task/run identity, hard safety/correctness gates independent of aggregate scores, matched-budget comparisons, repeated-run uncertainty, anti-gaming/contamination checks, product-level scenario scoring and promotion/release receipts while keeping benchmark-heavy work off the Android hot path.

## Development Philosophy
Use the largest safe coherent pass, verify it, repair failures in the same turn when practical, preserve evidence in GitHub and continue. Do not manufacture complexity or completion claims.
