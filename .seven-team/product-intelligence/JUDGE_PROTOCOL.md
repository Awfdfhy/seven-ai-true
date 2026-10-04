# Seven Independent Product Judge Protocol

## Goal

Answer one question: **Would a demanding user experience this as a coherent premium AI chat app, or as a collection of features that happen to run?**

## Judge panel

Use independent perspectives:
- J1 Core Chat Judge — chat, composer, streaming, room continuity.
- J2 Visual Craft Judge — hierarchy, spacing, typography, component consistency, motion.
- J3 Mobile/Android Judge — keyboard, back, lifecycle, permissions, touch ergonomics.
- J4 Arabic/RTL Judge — natural Arabic, bidi, RTL layout, mixed technical content.
- J5 Research/Power User Judge — search, citations, files, model/mode controls, deep reasoning.
- J6 First-Time User Judge — discoverability, clutter, terminology, first useful outcome.
- J7 Product Cohesion Red-Team — duplicated systems, glued-together feeling, confusing seams.

The builder may provide evidence but may not be the sole approving judge.

## Inputs

Every judge receives:
1. exact build SHA;
2. relevant functional test output;
3. Seven exact-build screenshots from the visual capture matrix;
4. PRODUCT_QUALITY_RUBRIC.json;
5. relevant sections from PRODUCT_KNOWLEDGE_BASE.md;
6. VISUAL_REFERENCE_CATALOG.json;
7. known limitations.

## Visual comparison method

Do NOT ask "does Seven look identical to ChatGPT/Gemini?"
Ask:
- Is the primary action as obvious?
- Is hierarchy as calm?
- Is the composer as usable?
- Are advanced controls as progressively disclosed?
- Is output as readable?
- Are loading/error states as intentional?
- Does every surface feel authored by the same product team?
- Is mobile density appropriate?
- Does RTL feel first-class?

## Scoring

Score every applicable rubric dimension 0–10 with:
- observed evidence;
- one strongest positive;
- one strongest defect;
- exact screenshot/scenario or test supporting the score.

No unexplained 8/10 scores.

## Consensus

- Any hard fail => CHANGES_REQUIRED.
- Weighted score < 8.2 => CHANGES_REQUIRED.
- 8.2–8.9 => RC only if no judge identifies an unresolved core-flow defect.
- >=9.0 => PREMIUM_CANDIDATE, still subject to functional/security/release gates.
- If two judges independently identify the same defect, it becomes a mandatory next-cycle item.
- If visual evidence is missing, visual quality is UNPROVEN, never assumed PASS.

## Output schema

Each judge must emit:
- verdict
- weighted score
- hard fails
- dimension scores
- evidence
- top 3 improvements
- confidence
- unknowns

Manager synthesis must preserve disagreements rather than averaging them away.
