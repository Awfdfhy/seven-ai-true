# Core UI Viewport Test Matrix

Status: **PLANNED / NOT YET VISUALLY PASSED**

## Mandatory base matrix
Run each width at LTR/English + RTL/Arabic in both Day and Night:

| Width | LTR/EN Day | LTR/EN Night | RTL/AR Day | RTL/AR Night |
|---:|:---:|:---:|:---:|:---:|
| 320 | ⏳ | ⏳ | ⏳ | ⏳ |
| 360 | ⏳ | ⏳ | ⏳ | ⏳ |
| 390 | ⏳ | ⏳ | ⏳ | ⏳ |
| 420 | ⏳ | ⏳ | ⏳ | ⏳ |

## State overlays
Each geometry family must additionally cover:
- keyboard closed / open
- long room title
- long model name
- long assistant response
- Arabic paragraph + mixed Latin/code
- fenced code block
- wide table (internal horizontal scroll allowed)
- attachment menu open
- model picker open
- sidebar open
- send state / stop state
- empty / loading / error

## Visual acceptance rubric
1. Alignment: shared left/start edges and optical centering.
2. Hierarchy: room title > secondary model/workspace metadata.
3. Density: no icon wall; primary touch controls comfortable.
4. Rhythm: consistent vertical spacing between message blocks.
5. Reachability: mobile primary controls within practical thumb zone.
6. Truncation: only low-priority labels truncate; primary action remains visible.
7. State clarity: selected room/model/mode obvious without excessive color.
8. No global horizontal page scroll at 320px.
9. Safe-area and keyboard do not cover composer.
10. Screenshots are reviewed manually; DOM bounds alone do not pass.

## Evidence rule
Do not mark any cell ✅ until an actual screenshot/artifact from that exact state has been reviewed.
