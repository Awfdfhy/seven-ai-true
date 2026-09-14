# Seven Tool Fabric 2.0 — Wave 01 Maximum Effort Command

> Status: ACTIVE RESEARCH CONTRACT
> Scope: First deep discovery wave for new tools and enabling technologies.
> Implementation status: Research only. No permanent integration is authorized by this document.

## SEVEN MAXIMUM EFFORT — TOOL FABRIC 2.0 / WAVE 01

Goal: discover and evaluate the strongest practical additions to Seven's Tool Fabric across high-leverage capability domains, prioritizing real capability gain, reliability, verifiability, Android suitability, low overhead, and architectural fit over raw tool count.

Use the maximum practical depth of research, comparison, adversarial analysis, and engineering judgment relevant to tool discovery. Search broadly before narrowing. Prioritize primary/official documentation, upstream repositories, current release information, technical specifications, benchmarks, and substantive engineering reports. Include credible lesser-known alternatives where they can materially improve capability, cost, reliability, or mobile suitability.

Do not assume the most popular tool is the best. Do not count wrappers, libraries, providers, protocols, models, and runtime components as the same type of object. Classify every candidate accurately and state how it would enter Seven's architecture.

For every serious candidate evaluate:
- actual capabilities and limitations
- project health and maintenance status
- license
- free/open status and operational limits
- self-hosting feasibility
- Android/on-device feasibility
- dependency and binary weight
- RAM / CPU / battery / storage / network costs
- latency and offline behavior
- privacy and security
- API/ABI stability
- integration complexity
- maintenance burden
- cancellation / timeout / retry behavior
- idempotency implications
- permissions and side effects
- result verification strategy
- provenance / lineage support
- observability hooks
- overlap with existing Seven capabilities
- fallback value

Actively search for failure evidence, not only marketing claims. Challenge top candidates with alternatives. Preserve uncertainty when evidence is incomplete.

Epistemic labels:
- VERIFIED FACT
- INFERENCE
- PROPOSAL
- UNKNOWN
- CONFLICT

Candidate classifications:
- CORE
- SPECIALIST
- FALLBACK
- EXPERIMENTAL
- REJECTED

Do not permanently adopt candidates in this wave. Produce a ranked candidate architecture and a shortlist worth individual Deep Polish. Rejected candidates and negative findings must be preserved with reasons.

Wave 01 emphasis:
1. web/search/retrieval
2. browser automation and page interaction
3. code/project understanding
4. structured extraction and document ingestion
5. tool protocol/interoperability
6. execution/sandbox foundations
7. observability and verification enablers
8. local data/query utilities

Android-first constraints are mandatory. Heavy server-only systems may still qualify as remote SPECIALIST/FALLBACK components, but must not be represented as on-device suitable without evidence.

Research should continue until practical saturation for this wave, not until an arbitrary candidate count is reached. Record source coverage and unresolved gaps.

Before declaring Wave 01 complete:
- compare strongest competing candidates
- identify duplication
- define likely architecture roles
- mark what deserves Deep Polish next
- preserve the research report in GitHub Project Memory
- do not claim PASS unless the evidence and saved report support it

Project safety:
- do not modify `seven_ai-final.html`
- do not delete project files
- do not merge protected branches
- do not implement candidate tools during discovery
