# Seven v3 Architecture

Seven v3 is a clean architecture track built beside the verified Seven 2.4.3 RC. It does not replace the stable app until migration gates prove parity.

## Design rule

LibreChat is a reference/foundation for mature backend concerns, not the Seven product surface.

Seven-owned layers remain authoritative for:
- RPG / canon / persistent world
- Seven Memory semantics
- Coding workspace UX
- Self-Development safety and protected paths
- Deep Think and Seven routing policy
- Arabic / RTL behavior
- Android platform bridge and persistence
- Seven visual identity

The platform layer may adopt or reimplement LibreChat-class patterns for:
- provider initialization and custom endpoints
- agent execution
- subagents
- MCP/tools
- files/RAG
- streaming
- authentication and server-side persistence

## Dependency direction

UI -> Seven application services -> Seven domain systems -> platform interfaces -> provider/tool/storage adapters.

Domain code must not import provider SDKs directly.

## Milestone 0: provider boundary

The first implemented slice is `v3/core/providers`.

It provides:
1. a provider descriptor contract;
2. a provider adapter contract;
3. a case-insensitive registry with explicit aliases;
4. a bridge from Seven 2.x `provider::model` selections;
5. dependency-free Node tests.

This deliberately mirrors the architectural separation seen in LibreChat provider initialization without copying its application-specific runtime.

## Migration invariant

Seven 2.4.3 remains the production reference until a v3 slice passes:
- functional parity;
- persistence migration tests;
- Arabic/RTL tests where applicable;
- Android integration when applicable;
- rollback evidence.

No v3 migration may weaken Self-Development safety, canon authority, protected paths, or release acceptance gates.
