# Seven AI 2.4.3 Zero-Key Final — Bug Hunt Target

This wave audits the user-uploaded APK: `Seven-AI-2.4.3-Zero-Key-Final(1).apk`.

## Artifact identity
- APK size observed locally: about 6.0 MiB.
- Capacitor appId: `ai.seven.v243`
- appName: `Seven 2.4.3`
- Web payload marker: `Seven 2.4.3 Zero-Key + UI Cleanup`
- Core extracted web payload contains `index.html`, `native-bridge.js`, `github-self-dev.js`, attachment runtime and all workspace JS/CSS.
- PDF.js vendor cmap payload is intentionally excluded from this audit identity because it is third-party data, not Seven application logic.

## Exact extracted SHA-256 identities
- index.html: `a5abf9d9f8fc6b9f07fc72f26011cd76da29c1e3d116f092602d2480e183bef1`
- native-bridge.js: `44ae55c944c91d5ebeb1ca2374e831d7920d1af6464faef8f0001a96252109bc`
- attachment-runtime.js: `aa2ac0a100a61dfff85b5b324ab54d1c16428162c3f1f2eb1afc885214975dcc`
- github-self-dev.js: `f94033572efdb2ae828668ecc39fe070e44ca8b56435895b1b5e36e9352f226d`
- workspaces/intelligence.js: `f2babd8bcd77cd9a42b6eec26a929a9bb5cc320482a3d13b389d4092a184b340`
- workspaces/research-v2.js: `0144e9f1dcd0df2f96f43fa852bbbe0152d22450957557ab5759974ea78e1c49`
- workspaces/rpg.js: `0021d2daa23f23e3b4cf4db26f2d107005fabf0a059dfcc51f7ebf38566ada96`
- workspaces/remake.js: `f46fc539b21a4256de0c554b21628bdee1e4e884e932a1f207f7de0b46b671bf`
- workspaces/remake.css: `734f1f55e3c50dd09731f23b5b8c72e1b6ab976cb29696e7af2f51bb1800f252`
- workspaces/seven-shell-final.js: `9098a251126367f6d984f6220e6a96941525ca01fcba7e6d9a6a3fed9b38efd0`
- workspaces/world-runtime.js: `c057bcf55fb801e092f5dee81fe8c070eb12e88e37a4a4b5dbd4cd5c069c91ac`
- workspaces/canon-simulator.js: `73bf29f13c02139f63d06e9ccefc1d96641960521950836fef865c30efab4938`

## Local static extraction facts
- extracted index.html: 943,978 bytes / ~13,769 lines
- 58 HTML ids, 0 duplicate ids in static markup
- 15 inline script tags; 7 inline style tags
- 85 `localStorage` references; 0 `sessionStorage` references
- 6 direct `fetch(` references
- 7 `MutationObserver` references
- 19 `setTimeout` references
- 17 direct `.innerHTML =` assignments
- 30 occurrences of API-key terminology
- no static `eval(` or `new Function(` hits
- release verification in the repository checks the same 2.4.3 marker and Zero-Key wiring.

## Audit source rule
The APK itself is the target. Inspect the repository production/release sources that generate this APK, especially `seven_ai-final.html`, `release/`, `apk/`, `cloudflare/`, and workspace runtimes. When the repository cannot prove exact runtime equivalence, label the finding `NEEDS_RUNTIME_TEST` rather than pretending it is verified.

Do not fix production code in this wave.
