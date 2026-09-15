# Seven Universal Composer — Finalization Plan

Status: APPROVED DESIGN PLAN
Branch: `ultimate-polish-v1`
Scope: the remaining visual design work required to close the Universal Composer without redundant exploration.

## Decision
The Composer does **not** need to reach an arbitrary 20 images. The current work already covers enough of the broad foundation that continuing to 20 by force would create repetition.

The remaining work is now explicitly limited to six high-value design targets. These six artifacts are intended to close the Composer system with useful implementation coverage rather than filler.

## Remaining six design artifacts

### 1. Context + Memory inside the Composer
Resolve how Seven shows and manages what enters the active task context without making the Composer feel overloaded.

Must cover:
- what is included in current context;
- what is excluded;
- pin / unpin;
- exclude / restore;
- source/origin of each context item;
- freshness/age where relevant;
- conflicts and ambiguous memories;
- Memory versus Context as distinct concepts;
- compact summary in Composer;
- expanded inspector when the user wants detail;
- lineage/provenance presentation where useful;
- no implication that summaries or memories are automatically authoritative truth.

### 2. Task states + permissions + cancel/retry inside the Composer
Resolve the operational states a user can encounter while a task is running or blocked.

Must cover:
- preparing / running / waiting;
- tool permission required;
- file/account/network permission prompts;
- blocked state;
- recoverable error;
- retry;
- stop/cancel;
- real cancellation when possible;
- uncertain cancellation / side-effect uncertainty when applicable;
- resume/continue;
- concise state communication without turning the Composer into a dashboard.

### 3. Research / Coding / RPG contextual Composer behavior
Resolve how the same Universal Composer adapts to major task domains without becoming three separate unrelated interfaces.

Must cover:
- shared core anatomy that stays constant;
- Research-specific context/tool affordances;
- Coding-specific project/file/test affordances;
- RPG/World-specific world/character/canon affordances;
- domain-specific active chips or state cues;
- domain-specific Aurora bias where appropriate;
- contextual suggestions;
- keeping advanced controls progressively disclosed;
- preserving the feeling of one Seven intelligence.

### 4. Arabic RTL + accessibility + large text
Resolve the Composer as a first-class Arabic and accessible surface, not a translated afterthought.

Must cover:
- true RTL mirroring;
- Arabic typography;
- mixed Arabic/English/code/bidi-safe content;
- icon placement rules in RTL;
- large-text / font-scale behavior;
- touch targets;
- screen-reader-friendly labels and meaningful state announcements;
- high contrast;
- color-independent state communication;
- long Arabic prompts and multiline input;
- accessibility without losing Seven identity.

### 5. Small phones + Lite + Reduced Motion + adaptive layouts
Resolve the Composer across device and performance constraints.

Must cover:
- narrow Android phones;
- regular phones;
- larger phones/tablets where relevant;
- compact control prioritization;
- what collapses into sheets/menus;
- Lite presentation;
- Reduced Motion presentation;
- Full/Balanced/Lite identity consistency;
- no expensive decorative loops;
- no loss of function when effects are reduced;
- large-text collision handling;
- keyboard/inset behavior where relevant.

### 6. Final Integration Board
No new concept exploration is allowed here. This artifact reconciles all approved Composer decisions into one final coherent system.

Must include:
- final Composer anatomy;
- final icon language;
- final attachment behavior;
- final voice/multimodal behavior;
- final mode/compute controls;
- final long-form behavior;
- final context/memory behavior;
- final task/permission states;
- domain adaptation rules;
- Day/Night;
- Arabic RTL;
- accessibility;
- adaptive and Lite behavior;
- implementation notes/constraints where useful.

The Final Integration Board exists to prove coherence, not to introduce new experiments.

## Completion rule
The Universal Composer can be considered visually closed when these six targets are reviewed and reconciled into the final integration board and written specification.

Do not continue generating Composer images after closure unless a real design problem is discovered or the user explicitly requests a new variant.

## Anti-repetition rule
Every remaining image must solve a **new, previously unresolved design question**.

Do not repeat:
- basic Core states already covered;
- icon language already covered;
- attachments already covered;
- PDF reader flow already covered;
- voice/multimodal foundation already covered;
- mode/intelligence controls already covered;
- expanded/long-form foundation already covered.

If a generation accidentally repeats earlier territory, it does not count toward the remaining six.

## Final goal
Close the Universal Composer as an implementation-grade UI system, then move to the next Home component rather than endlessly polishing the same surface.