# Seven Home UI — Detailed Design Workflow

Status: APPROVED DESIGN WORKFLOW
Branch: `ultimate-polish-v1`
Scope: how the final Seven Home UI will be designed and frozen

## Core rule
The final Home UI will **not** be designed or approved from one poster/screenshot.

A screenshot is only a visual representation of one state. Home is a system of components, interactions, runtime states, responsive variants and accessibility/performance behaviors.

The approved workflow is:

`Component-by-component -> State-by-state -> Interaction flows -> Integrated screens -> Final specification`

The existing Home posters remain visual-direction/atlas references only. They are not the final Home specification.

## Component decomposition
Home will be decomposed and designed in detail rather than treated as one static screen.

| Component / area | Required design coverage |
|---|---|
| App Header | default, scrolled, notification, account, offline, RTL |
| Seven / Aurora | approved Aurora states and transitions |
| Universal Composer | empty, typing, attachment, voice, tools, modes, Deep, loading, cancel |
| Mode controls | Auto, Fast, Deep, Research, Code, World and contextual modes |
| Continue | Chat, Project, Research, Coding, RPG, completed/failed variants |
| Active Tasks | one task, multiple tasks, progress, permission, blocked, background |
| Suggestions | personalized, contextual and empty variants |
| Spaces / Projects | recent, pinned, create and resume |
| Bottom Navigation | selection states, badges, center Seven control and RTL |
| Seven Orb | tap, hold, active, listening and running states |
| Sheets / Overlays | add/attach, tools, models, files, create and task details |
| System States | first launch, empty, offline, error, low-resource and permissions |
| Global variants | Night, Day, RTL, Lite, Reduced Motion, large text, small/large Android screens |

This table is the minimum design scope, not a claim that every row must become a permanent visible Home section.

## Interaction design is part of Home
Components cannot be approved only as isolated artwork. Important transitions and flows must also be designed.

Example flow:

`Home -> + -> Files -> File attached -> Research selected -> Send -> Active Research -> Complete`

Other flows include:
- Home -> Composer -> voice/listening -> send/cancel;
- Home -> model/compute intent -> Auto/Fast/Balanced/Deep -> return;
- Home -> active task -> expanded task details;
- task -> permission required -> permission decision -> resume/block;
- task -> cancellation -> confirmed/uncertain cancellation state;
- Continue -> resume Chat/Coding/Research/RPG/Project;
- Seven Orb -> global new-task/command action;
- Home -> offline/limited -> recovery;
- Home -> multiple running tasks -> task switcher/detail.

## Three visual artifact levels
### 1. Component Boards
Large focused boards for one component and its variants.

Examples:
- Universal Composer board;
- Header board;
- Continue card board;
- Active Task board;
- Bottom Navigation + Seven Orb board.

The purpose is to inspect hierarchy, spacing, controls and state differences without poster-scale compression.

### 2. Interaction Flows
Sequences showing how UI changes through a user action or runtime transition.

These establish what happens before, during and after interaction, including permission, cancellation, loading and error branches.

### 3. Final Integrated Screens
Clean phone-size screens representing important complete Home states after their components have already been approved.

Examples may include:
- normal ready Home;
- active Research;
- active Coding;
- RPG/World active;
- permission required;
- multiple tasks;
- offline;
- Day;
- Night;
- Arabic RTL;
- Lite / Reduced Motion.

A single integrated screen can never substitute for missing component/state specifications.

## Expected artifact scale
Home may naturally require roughly 20–40 focused visual designs/screens/boards depending on how many state differences can be represented cleanly together. This is a planning estimate, not a quota.

The goal is completeness without generating redundant images.

## Final Home specification
After visual approval, GitHub must contain a final Home specification covering at least:
- component anatomy;
- dimensions and layout rules;
- spacing/grid;
- typography;
- semantic colors/tokens;
- icon rules;
- interaction behavior;
- component states;
- runtime-state mapping;
- motion and timing rules;
- Aurora integration;
- sheets/overlays;
- navigation behavior;
- RTL/bidi behavior;
- accessibility;
- touch targets;
- Day/Night behavior;
- Full/Balanced/Lite behavior;
- Reduced Motion;
- responsive/adaptive behavior;
- performance constraints;
- implementation truth boundaries.

Visual references and written specification together define the intended UI. Neither should silently override product truth or runtime authority.

## Freeze rule
Home is not `FINAL` merely because a visually impressive full-screen mockup exists.

Final Home freeze requires:
1. key components reviewed;
2. key states reviewed;
3. important interaction flows resolved;
4. integrated screens reconciled;
5. Day/Night and Arabic RTL covered;
6. accessibility/performance variants defined;
7. final written specification recorded.

Device/build verification is a separate implementation/release concern and must not be fabricated by design approval.

## Approved design sequence
The next design target after Aurora is the **Universal Composer**.

Planned sequence:
`Home Foundation -> Universal Composer -> Header/Aurora integration -> Continue -> Active Tasks -> Suggestions -> Spaces/Projects exposure -> Bottom Navigation + Seven Orb -> Sheets/Overlays -> System States -> Responsive/RTL/Accessibility/Performance variants -> Integrated Home screens -> Final Home Specification`

The sequence may be adjusted when interaction dependencies make another order more efficient, but the component/state/flow completeness rule remains.

## Immediate next step
Design the **Universal Composer as its own detailed component**, including its important states and interaction entry points, rather than generating another all-in-one Home poster.