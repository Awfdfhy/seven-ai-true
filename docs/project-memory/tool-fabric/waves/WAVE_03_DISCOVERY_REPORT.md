# Seven Tool Fabric 2.0 — Wave 03 Discovery Report

Date: 2026-09-13
Status: DISCOVERY COMPLETE FOR WAVE 03. No candidate integrated/frozen.
Governing command: `WAVE_03_MAXIMUM_EFFORT_COMMAND.md`

## Executive result

Seven's Local Intelligence Plane should be layered, not a bundled mega-runtime:

1. `VisionCapture` — Android platform camera/document acquisition.
2. `OCRBroker` — platform/light OCR first, optional stronger OCR pack second, remote/VLM fallback last.
3. `SpeechBroker` — local VAD/STT/TTS with downloadable model packs and remote fallback.
4. `PortableInferenceRuntime` — small-model inference through a common local runtime where justified.
5. `EmbeddingEngine` — local embeddings as derived indexes, lazy/model-pack based.
6. `RerankEngine` — optional local reranker only when retrieval evals justify its cost.
7. `VectorIndex` — SQLite-aligned vector retrieval preferred before adding another database.
8. `LocalModelBackend` — optional LLM backend behind Model Fabric, never cognitive authority.
9. `HybridRetriever` — lexical + metadata + temporal/causal + vector retrieval, rather than vector-only memory.

## Candidate registry

| Candidate | Kind | Preliminary class | Deployment posture | Priority |
|---|---|---|---|---|
| ML Kit Text Recognition | Android platform SDK | CORE PLATFORM CANDIDATE | dynamic/on-device | P0 |
| ML Kit Document Scanner | Android platform SDK | CORE PLATFORM CANDIDATE | dynamically delivered UI/models | P1 |
| PaddleOCR v6 Android/ORT | OCR models/SDK | SPECIALIST LOCAL | optional model pack | P1 |
| Tesseract.js | browser OCR/Wasm | FALLBACK | lazy browser worker | P2 |
| sherpa-onnx | speech runtime suite | CORE/SPECIALIST CANDIDATE | optional Android local pack | P0 |
| whisper.cpp | ASR runtime | SPECIALIST/FALLBACK | native Android model pack | P1 |
| ONNX Runtime Mobile | inference runtime | CORE CANDIDATE | custom/minimal Android build | P0 |
| Transformers.js | model pipeline library | SPECIALIST | lazy WebView/WebGPU/Wasm | P1 |
| llama.cpp | local LLM runtime | SPECIALIST LOCAL BACKEND | optional downloaded model | P1 |
| MLC LLM Android | local LLM runtime/compiler | EXPERIMENTAL/SPECIALIST | capable-device optional pack | P2 |
| WebLLM | browser LLM runtime | EXPERIMENTAL | WebGPU capable devices only | P2 |
| SQLite Vec1 | SQLite vector extension | EXPERIMENTAL CORE-ALIGNED | future SQLite integration | P1 |
| sqlite-vec | SQLite vector extension | EXPERIMENTAL/FALLBACK | Wasm/native possible, pre-v1 | P2 |
| DuckDB-Wasm vector/data path | analytics runtime | SPECIALIST | lazy data tasks | P2 |
| CozoDB | graph/vector database | REJECT FOR CORE NOW | extra DB/runtime | reconsider only if graph eval proves need |
| Kùzu | graph DB | REJECTED NEW DEPENDENCY | archived upstream | rejected |

## Vision/OCR findings

### ML Kit Text Recognition
Official Android docs provide on-device recognition with two delivery styles: a bundled model or a smaller app dependency whose model is dynamically downloaded through Google Play Services. The dynamic path has roughly hundreds of KB app-size impact per script while bundled models add multiple MB per script. Recognition quality depends strongly on input quality.

Seven decision proposal:
- preferred `ocr.text_recognize` Android adapter for common scripts supported by ML Kit
- choose dynamic/unbundled delivery by default to protect APK size
- record model-availability state and never return empty pre-download recognition as a successful OCR result
- recognition text is derived evidence, not authoritative source text

Source:
- https://developers.google.com/ml-kit/vision/text-recognition/v2/android

### ML Kit Document Scanner
Official scanner dynamically downloads scanner logic/models/UI and has a small direct APK impact; it also has minimum device/RAM requirements.

Seven role:
- user-facing acquisition/scanning tool, not OCR truth engine
- use for cropping/rotation/multi-page capture where available
- fall back to standard file/image picker/camera when unsupported

Source:
- https://developers.google.com/ml-kit/vision/doc-scanner/android

### PaddleOCR Android
Current PP-OCRv6 Android demo uses ONNX Runtime, provides an independently integrable SDK module and supports tiny/mobile model variants.

Seven role:
- optional stronger/local OCR specialist when ML Kit script/quality coverage is insufficient
- downloaded model pack, not normal APK payload
- benchmark on Seven's target phone before admission

Source:
- https://github.com/PaddlePaddle/PaddleOCR/blob/main/docs/version3.x/inference_deployment/cross_platform/android_deployment.en.md

### Tesseract.js
Wasm port of Tesseract usable in browser/Node workers.

Seven role:
- browser/desktop fallback where Android-native OCR is unavailable
- not preferred Android path because a platform-native mobile OCR path is cheaper and better integrated

Source:
- https://github.com/naptha/tesseract.js/blob/master/README.md

## Speech/audio findings

### sherpa-onnx
Current official Android support covers local/offline STT, TTS, VAD and additional speech tasks, with prebuilt Android libraries available.

Seven proposal:
- highest-priority unified local speech runtime candidate
- expose VAD, streaming/non-streaming ASR and TTS as separate Seven capabilities despite shared runtime
- model packs individually downloadable/removable
- never load speech models until voice feature is activated
- ResourceGovernor controls threads and long-running recognition

Canonical contracts:
- `audio.vad`
- `speech.transcribe_stream`
- `speech.transcribe_file`
- `speech.synthesize`

Sources:
- https://k2-fsa.github.io/sherpa/onnx/android/build-sherpa-onnx.html
- https://github.com/k2-fsa/sherpa/blob/master/docs/source/onnx/android/index.rst

### whisper.cpp
Native C/C++ Whisper runtime supports Android, quantization, CPU execution and VAD.

Seven role:
- specialist/fallback ASR backend, especially if Whisper model compatibility is strategically useful
- compare actual target-phone accuracy/latency/model size against sherpa-onnx before choosing default

Source:
- https://github.com/ggml-org/whisper.cpp

## Portable local inference

### ONNX Runtime Mobile
Official mobile support covers Android and multiple execution providers. Android can use CPU, XNNPACK and NNAPI. Official optimization guidance explicitly recommends measuring application binary size, model size, latency and power, and documents custom/minimal builds that can substantially shrink the runtime for known model operator sets.

Seven proposal:
- strongest general local-small-model runtime candidate
- use a custom/minimal build only after the final local model set is known
- CPU/XNNPACK baseline; NNAPI is evaluated per model/device rather than assumed faster
- central `LocalInferenceRuntime` adapter records model hash, runtime version, execution provider and dtype

Sources:
- https://onnxruntime.ai/docs/get-started/with-mobile.html
- https://onnxruntime.ai/docs/tutorials/mobile/
- https://onnxruntime.ai/docs/execution-providers/NNAPI-ExecutionProvider.html
- https://onnxruntime.ai/docs/execution-providers/Xnnpack-ExecutionProvider.html

## Embeddings/classification/reranking

### Transformers.js
Supports local browser pipelines including feature extraction, text classification and sentence similarity, and can use quantized models plus WebGPU where available.

Seven role:
- useful lazy WebView/desktop path for embeddings/classification and experiments
- model-specific cost dominates, so library support does not authorize any particular model
- WebGPU is an optimization path, never a compatibility assumption

Sources:
- https://huggingface.co/docs/transformers.js/en/pipelines
- https://huggingface.co/docs/transformers.js/guides/webgpu
- https://huggingface.co/docs/transformers.js/guides/dtypes

### EmbeddingEngine contract
Input metadata must include:
- model id + immutable revision/hash
- normalization/pooling configuration
- dimensionality
- dtype/quantization
- source object id + source version

Embeddings are always derived indexes. Re-embedding produces a new derived index generation; it never modifies authoritative memories/files/events.

### RerankEngine
Do not add a default cross-encoder merely because it improves benchmark quality. Admit a local reranker only if Seven retrieval evals show meaningful precision improvement after latency/RAM/battery cost.

Retrieval pipeline proposal:
`lexical/entity/time/causal filters → vector candidates → optional rerank → evidence/context compiler`

## Vector index findings

### SQLite Vec1
SQLite's own Vec1 extension now provides ANN vector search with portable C and ARM NEON support. Current official docs describe version 0.7 and still note insufficient testing/optimization work on the road to 1.0.

Seven proposal:
- strategically preferred future direction because Seven is already evaluating SQLite as the local durable data plane
- EXPERIMENTAL until stability/testing and Seven Android/Wasm benchmarks pass
- keep an abstraction so index implementation can change without changing Memory Fabric

Sources:
- https://sqlite.org/vec1/doc/trunk/doc/vec1.md
- https://sqlite.org/forum/info/6a0861b82349eacf87b7bfd948a8eb13e4c86264ee4571137a0bdbc569d8a63b

### sqlite-vec
Small dependency-free SQLite extension that runs in native and Wasm environments but its upstream explicitly labels it pre-v1 with breaking-change risk.

Seven role:
- fallback/benchmark against Vec1 while Vec1 matures
- no authoritative format lock-in

Source:
- https://github.com/asg017/sqlite-vec

## Local LLM backends

### llama.cpp
Current upstream includes Android binding/build guidance, GGUF loading, Kotlin Flow token output and runtime CPU-feature selection; context size has direct memory impact.

Seven role:
- preferred P1 local-LLM backend candidate because it is direct, model-format-flexible and Android-aware
- model weights are never bundled by default
- downloadable model packs with storage/RAM eligibility checks
- cap context according to ResourceGovernor/device state
- local model output remains ordinary model output subject to Truth Fabric and verification

Sources:
- https://github.com/ggml-org/llama.cpp/blob/master/docs/android.md
- https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md

### MLC LLM
Provides Android GPU-oriented deployment and compiled model/runtime workflow. Official docs expose VRAM estimates and note device-specific issues, including a known Adreno prefill/UI-freeze issue for some model layouts.

Seven role:
- experimental performance backend for capable devices, not universal Android default
- compare against llama.cpp on actual target classes before admission

Source:
- https://llm.mlc.ai/docs/deploy/android

### WebLLM
Provides in-browser local LLM execution through WebGPU and model caching.

Seven role:
- experimental browser/WebView backend only when WebGPU capability is positively detected
- never fallback silently to multi-GB model downloads

Source:
- https://webllm.mlc.ai/docs/user/get_started.html

## Knowledge graph decision

Before adding a second graph database, Seven should represent authoritative entities/relations/events in SQLite tables plus explicit temporal/causal indexes and derive graph views as needed.

### Kùzu
Rejected as a new Seven dependency because its official repository was archived and made read-only on 2025-10-10.

Source:
- https://github.com/kuzudb/kuzu

### CozoDB
Technically supports graph/vector/embedded mobile/Wasm use, but current maintenance uncertainty plus architectural duplication means no core adoption now.

Seven decision:
- retain concepts/Datalog patterns as research inspiration only
- add a second graph DB only if future graph-query evals prove SQLite-derived views inadequate

Sources:
- https://github.com/cozodb/cozo
- current issue tracker maintenance status questions

## Seven canonical capabilities proposed

Vision:
- `vision.image.inspect`
- `vision.document.scan`
- `ocr.text_recognize`
- `ocr.document_recognize`

Speech:
- `audio.vad`
- `speech.transcribe_stream`
- `speech.transcribe_file`
- `speech.synthesize`

Local intelligence:
- `local.embed`
- `local.classify`
- `local.rerank`
- `local.model.generate`
- `retrieval.vector_search`
- `retrieval.hybrid_search`

Model-pack lifecycle:
- `modelpack.list`
- `modelpack.download`
- `modelpack.verify`
- `modelpack.load`
- `modelpack.unload`
- `modelpack.remove`

## Android deployment tiers

### Base APK
Only small bridge/runtime glue required for platform functions. No large OCR/speech/LLM weights.

### Dynamic platform capability
Google Play-delivered ML Kit modules/models where available.

### Optional Seven model packs
Speech models, advanced OCR, embeddings/rerankers, local LLM weights. Downloaded only after explicit user choice/feature need and eligibility check.

### Host/remote specialists
Huge vision/document models and GPU-heavy workloads stay external unless device capability proves worthwhile.

## Model-pack integrity rules

Every downloaded local model should record:
- source/repository
- immutable revision
- license metadata
- content hash
- expected size
- runtime compatibility
- minimum memory/storage class
- model task/capabilities
- quantization
- installed timestamp

Hash before loading. Do not trust filename/model card alone.

## Rejections / limits

- no mandatory local LLM in base APK
- no vector-only Memory Fabric
- no second graph database without measured need
- no WebGPU assumption on Android/WebView
- no model auto-download measured in hundreds of MB/GB without explicit user action
- no OCR/STT text promoted directly to FACT
- Kùzu rejected as a new dependency because upstream is archived

## Deep Polish queue

`ONNX Runtime Mobile → sherpa-onnx SpeechBroker → ML Kit OCRBroker → EmbeddingEngine + HybridRetriever → SQLite VectorIndex → llama.cpp LocalModelBackend → PaddleOCR specialist → Transformers.js/WebGPU path → MLC/WebLLM experimental backends`

## Open gaps

- exact Arabic OCR quality across candidate OCR engines
- Arabic/local-language STT/TTS model quality and size
- target Tecno-class device benchmark for ORT/llama.cpp/sherpa
- WebView WebGPU availability/driver reliability across target devices
- local embedding/reranking model selection after retrieval eval dataset exists
- thermal/battery throttling policy for long local inference
- model pack update/rollback mechanism

No production integration occurred in this wave.
