# Feature Catalog Seed

All entries begin as PLANNED; no feature is asserted to exist. Add owner, dependencies, risk, tests, and commit evidence as each dossier is refined.

| ID | Feature | Priority | Acceptance summary | Initial status |
|---|---|---|---|---|
| CORE-001 | World creation and isolation | P0 | Create multiple worlds; reads/writes never cross world IDs | PLANNED |
| CORE-002 | Player character creation | P0 | Persist identity and validated initial state | PLANNED |
| CORE-003 | Scene entry and player action | P0 | Action has unique ID and is validated against current revision | PLANNED |
| CORE-004 | Domain commands/events | P0 | Invalid commands do not mutate state; duplicate events are idempotent | PLANNED |
| SAVE-001 | Versioned save/load | P0 | Save survives force-stop/reopen and restores equivalent state | PLANNED |
| SAVE-002 | Migration and recovery | P0 | Corrupt/unknown schema fails safely with recoverable backup path | PLANNED |
| AI-001 | Provider interface and deterministic mock | P0 | Mock conforms to versioned contract; test suite needs no network | PLANNED |
| AI-002 | Structured narrative proposal validation | P0 | Malformed and unauthorized proposals are rejected without mutation | PLANNED |
| AI-003 | Cancellation and stale-response handling | P0 | Cancelled/late results cannot override newer state | PLANNED |
| CANON-001 | Canon and event history separation | P1 | Generated suggestions do not become facts automatically | PLANNED |
| MEM-001 | Character knowledge boundaries | P1 | Retrieval respects world and character knowledge permissions | PLANNED |
| RPG-001 | Character sheet and attributes | P1 | Rules validate derived values and persist deterministically | PLANNED |
| RPG-002 | Inventory and equipment | P1 | Ownership, capacity, and legal transfers are enforced | PLANNED |
| RPG-003 | Checks, skills, and progression | P1 | Outcomes derive from explicit rules and auditable inputs | PLANNED |
| RPG-004 | Turn-based combat | P1 | Turn order, action cost, damage, status, and defeat are deterministic | PLANNED |
| RPG-005 | Quests, relationships, and factions | P1 | Progression is event-driven and survives reload | PLANNED |
| UI-001 | Shared design system and navigation | P0 | Consistent responsive layouts and complete async states | PLANNED |
| UI-002 | Arabic RTL and English LTR | P0 | Layout, text entry, mixed-direction values, and navigation work | PLANNED |
| AND-001 | Android lifecycle and storage | P0 | Save, export/import, permission, force-stop/reopen pass on target APIs | PLANNED |
| SEC-001 | Secret and data protection | P0 | No secrets in source/bundles/logs; import data validated | PLANNED |

Add stable IDs rather than renumbering existing IDs. A feature is DONE only with acceptance evidence tied to a commit SHA.
