# Chat 6 component mapping and deletion/migration order
| Legacy surface | Canonical target | Migration contract | Approval |
|---|---|---|---|
| seven-ws-shell/head | Existing workspace frame | No second shell | B07/I01 |
| seven-ws-card | Card | Keep DOM hooks stable | Chat 6 isolated only |
| seven-ws-row | ListRow | Retain selected path click handler | Chat 6 isolated only |
| seven-ws-pill | Chip | Label + icon for status | Chat 6 isolated only |
| seven-ws-empty | EmptyState | Real action only | Chat 6 isolated only |
| seven-ws-code | InspectorPanel/code scroll | pre dir=ltr and read-only | Chat 6 isolated only |
| seven-ws-task | Field/task input | Preserve sendMessage bridge | Chat 6 isolated only |
| seven-gh-backdrop/panel | Dialog | Focus trap/return and native Back | I01 lease required |
| seven-gh-card/row | Card/ListRow | Preserve exact events/options | Chat 6 isolated only |
| seven-gh-log | details disclosure | Preserve log entries and ordering | Chat 6 isolated only |
| seven-gh-code | Field/code display | dir=ltr + copy affordance if permitted | Chat 6 isolated only |

## Required deletion strategy
Phase 0: collect actual selectors, computed CSS dependencies and screenshots.
Phase 1: replace visual markup locally without touching runtime calls.
Phase 2: have I01 wire shared overlay and stylesheet changes on stable candidate only.
Phase 3: regression prove every original action including failure.
Phase 4: remove obsolete seven-ws and seven-gh rules only once no call sites remain.
Never add another !important cascade or increase release-layer budget to hide debt.

## Gate and screenshots
Viewport 320/360/390/420 x RTL/LTR x day/night x 100%/200% text, Android 14+16, open keyboard, long branch/path/error, scroll/focus and reduced motion. Save pre/post images with exact SHA, device API and viewport metadata. Independent V01/V02/V03 judge final release gate.
