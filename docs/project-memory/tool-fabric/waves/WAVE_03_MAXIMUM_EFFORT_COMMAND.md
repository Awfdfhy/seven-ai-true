# Seven Tool Fabric 2.0 — Wave 03 Maximum Effort Command

Date: 2026-09-13
Status: ACTIVE RESEARCH CONTRACT
Scope: vision/OCR, speech/audio, embeddings/reranking/vector retrieval, and local model/inference runtimes.

## SEVEN MAXIMUM EFFORT — TOOL FABRIC 2.0 / WAVE 03

Goal: discover the strongest practical sensory and local-intelligence foundations for Seven while preserving Android-first startup, RAM, battery, storage and APK constraints. Separate platform APIs, local runtimes, models, libraries, remote providers and Seven-owned canonical tools.

Research broadly using current official documentation, upstream repositories, model/runtime documentation, release notes and reliable technical evidence. Prefer candidates that are modular, lazy-loadable, hardware-aware, quantization-friendly, verifiable and replaceable.

Research at minimum:
- mobile OCR and document scanning
- browser/Wasm OCR fallbacks
- image preprocessing and metadata extraction
- speech-to-text
- voice activity detection
- text-to-speech
- audio decoding/resampling where required
- ONNX and portable inference runtimes
- local LLM runtimes
- browser/WebGPU inference
- embeddings
- reranking
- vector indexes/search
- hybrid lexical/vector retrieval
- local intent/classification utilities
- knowledge-graph/local structured retrieval foundations

For each serious candidate evaluate:
- exact role: Tool / Library / Runtime / Model / Platform API / Provider
- license and model-license separation
- active maintenance
- Android support and minimum requirements
- WebView/browser support where relevant
- CPU/GPU/NPU/WebGPU acceleration
- RAM/storage/model-download cost
- quantization and model-size options
- offline behavior
- warm/cold latency
- battery/thermal impact
- streaming/cancellation
- worker/thread support
- privacy implications
- model provenance and integrity
- failure modes
- device capability detection
- fallback strategy
- overlap with Seven's existing vision/model/retrieval architecture

Do not assume “runs on Android” means suitable for Seven's normal phone path. Distinguish:
- bundled tiny component
- lazy downloaded component
- optional local model pack
- host/desktop specialist
- remote fallback

Do not bundle large models merely to claim offline AI. Local models must justify their disk/RAM/battery cost with a concrete Seven capability.

For OCR and speech, separate acquisition/scanning from recognition. Preserve raw input provenance and recognition confidence where available. Never treat OCR/STT text as guaranteed truth.

For embeddings/reranking, benchmark retrieval quality as well as speed and memory. Prefer hybrid retrieval when lexical identity matters. Keep embeddings as derived indexes, never authoritative memory.

For local LLM runtimes, evaluate them as execution backends, not as Seven's cognitive authority. They must remain replaceable through Model Fabric.

For knowledge graphs, first evaluate whether Seven's existing authoritative event/entity model plus SQLite/indexes can satisfy the need before adding another database/runtime.

Output:
1. candidate registry
2. evidence ledger
3. classification/rejections
4. Seven-owned canonical tool contracts
5. Android deployment tiers
6. retrieval/local-intelligence architecture
7. unresolved gaps
8. Deep Polish queue

Preserve all material results in GitHub. No production integration during discovery. Do not modify `seven_ai-final.html`, delete files or merge protected branches.
