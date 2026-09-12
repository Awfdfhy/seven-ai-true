# Seven AI — Free-Max Professional Execution Plan

## الهدف

بناء Seven AI كأقوى نظام Chat RPG مجاني يمكن الوصول إليه عمليًا، مع بقاء وظائف المشاريع والبرمجة والبحث والملفات جزءًا من النظام. نريد أعلى جودة ممكنة دون اشتراك ثابت أو اعتماد على مزود واحد.

Seven يتبع سياسة **Unlimited-by-design**: لا حد يوميًا للرسائل، ولا حد لعدد المحادثات أو الشخصيات أو العوالم أو الفروع أو حجم الذاكرة أو المشاريع أو الملفات/المرفقات الذي يفرضه التطبيق. القيود الوحيدة هي السعة الفعلية للجهاز، ومساحة التخزين، وحجم الملف، ونافذة السياق، وحدود مزودي API، وتوفر النماذج. عندما ينفد مورد خارجي، يبدّل النظام إلى مورد مؤهل أو تشغيل محلي أو مسار مؤجل، ويعرض الحالة بوضوح. لا نحاول تجاوز حدود المزود أو تدوير الحسابات.

Seven ليس نموذجًا جديدًا في البداية. هو Cognitive Runtime يختار النموذج المناسب، يجهّز السياق، يستعمل الأدوات، يتحقق من النتيجة، ويحفظ الحالة بمصدرها. قيمة النظام تأتي من تنسيق هذه الطبقات معًا.

الهدف الخاص بالـChat RPG هو محاكاة عالم حي قابل للاستمرار، لا مجرد ردود جميلة. يجب أن يحافظ Seven على هوية الشخصية، قوانين العالم، الذاكرة الطويلة، حالة المشهد، وكالة اللاعب، تطور العلاقات والمهام، وتسلسل الأحداث عبر جلسات وفروع كثيرة.

## ما تؤكده المصادر

- Google Colab يوفّر موارد GPU/TPU مجانًا، لكن الموارد غير مضمونة، والحدود ونوع العتاد يتغيران، والجلسة المجانية قد تصل إلى 12 ساعة حسب التوفر والاستخدام. لذلك يصلح لتجارب التدريب، لا لاستضافة Seven دائمًا. [Colab FAQ](https://research.google.com/colaboratory/faq.html)
- حدود Gemini API يجب قراءتها من AI Studio للحساب الحالي؛ Google تصفها بأنها حدود متغيرة حسب النموذج والحساب. [Gemini rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- Groq يوفّر جدولًا لحدود الخطط المجانية والمدفوعة، ويطلب الرجوع إلى صفحة Limits للحساب لمعرفة القيمة الفعلية. [Groq rate limits](https://console.groq.com/docs/rate-limits)
- Cloudflare Workers AI يذكر تخصيصًا مجانيًا قدره 10,000 Neurons يوميًا، ثم يحتاج الاستخدام الأعلى إلى خطة مدفوعة. [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- مستخدم Hugging Face المجاني يحصل على رصيد شهري صغير للتجربة مع Inference Providers، وليس استضافة مجانية غير محدودة. [Hugging Face pricing](https://huggingface.co/docs/inference-providers/pricing)
- GitHub Models لم يعد خيارًا نعتمد عليه؛ توثيق GitHub يذكر أنه أُحيل للتقاعد في 30 يوليو 2026. [GitHub Models](https://docs.github.com/github-models)
- Transformers.js يشغّل نماذج داخل المتصفح عبر ONNX Runtime، مع WASM أو WebGPU ونماذج مكمّمة؛ WebGPU تجريبي على بعض البيئات. [Transformers.js](https://huggingface.co/docs/transformers.js/index)
- WebLLM يوفّر تشغيل LLM داخل المتصفح عبر WebGPU مع streaming وfunction calling وواجهة متوافقة مع OpenAI. [WebLLM](https://webllm.mlc.ai/)
- llama.cpp هو المسار المحلي الرئيسي المرشح لـAndroid، مع دعم نماذج GGUF وتعدد الخلفيات. [llama.cpp](https://github.com/ggml-org/llama.cpp)
- LoRA/QLoRA تقللان تكلفة تخصيص النموذج، وUnsloth يوفر أدوات تدريب وتصدير ودمج نماذج محلية، لكن التدريب يحتاج بيانات واختبارًا مستقلًا. [PEFT LoRA](https://huggingface.co/docs/peft/main/en/conceptual_guides/lora)، [PEFT quantization](https://huggingface.co/docs/peft/main/en/developer_guides/quantization)، [Unsloth](https://github.com/unslothai/unsloth)
- SWE-bench Verified يوفّر مجموعة بشرية التحقق لتقييم إصلاح مشكلات مستودعات حقيقية، وPromptfoo يختبر النماذج والوكلاء وRAG. [SWE-bench Verified](https://www.swebench.com/)، [Promptfoo](https://github.com/promptfoo/promptfoo)
- OWASP يضع مخاطر خاصة بتطبيقات LLM والوكلاء، بينما يقدّم NIST AI RMF إطارًا لإدارة المخاطر والتقييم. [OWASP GenAI](https://genai.owasp.org/)، [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework)

## التصميم النهائي

```text
User Request
  → Trust Boundary + Privacy Filter
  → Intent / Risk / Modality Classifier
  → Free-First Provider Router
  → Memory + Project Retrieval
  → Context Compiler with Evidence Lock
  → Tool Planner and Permission Gate
  → Model Call or Local Model
  → Result Validation + Critic + Retry/Replan
  → Provenance, Run Ledger, Outcome Learning
  → Response and User-visible Trace
```

### طبقة Chat RPG

هذه طبقة أساسية وليست إضافة تجميلية:

- **Character Core:** شخصية، صوت، قيم، حدود معرفة، عادات، أهداف، مخاوف، وتغيرات مستمرة.
- **World Bible / Lorebook:** تاريخ العالم، الأماكن، الفصائل، القوانين، المصطلحات، والأحداث المرجعية مع مفاتيح استدعاء.
- **Scene State:** المكان والوقت والطقس والحالة الجسدية والعناصر الموجودة وما يمكن للشخصيات معرفته في تلك اللحظة.
- **Cast Director:** إدارة NPCs، دخولهم وخروجهم، أدوارهم، وجهات نظرهم، ومبادرتهم دون سرقة وكالة اللاعب.
- **Relationship and Quest Graph:** علاقات، ثقة، ديون، تحالفات، مهام، تبعات، وعُقد زمنية مرتبطة بمصادرها.
- **Narrative Controller:** إيقاع، توتر، كشف معلومات، استمرارية، ومنع التكرار؛ يخطط داخليًا ويعرض للمستخدم السرد والحوار فقط.
- **Player Agency Lock:** Seven لا يقرر أفعال شخصية اللاعب أو مشاعره الجوهرية دون إدخال اللاعب، ويطلب القرار عند نقطة الاختيار.
- **Canon Lock:** لا يغيّر حدثًا مثبتًا أو شخصية مثبتة من أجل رد لاحق؛ التغيير يكون فرعًا أو Retcon معلنًا.
- **Save / Branch / Rewind:** حفظ نقطة، إنشاء فرع، مقارنة فرعين، والعودة دون إتلاف العالم الأصلي.
- **Group Chat Scheduler:** ترتيب أدوار الشخصيات، منع رد الشخصية على نفسها بلا سبب، واختيار المتحدث بناءً على السياق.
- **RPG Rules Engine:** نظام اختياري للقواعد والإحصاءات والمهام والنرد، منفصل عن السرد حتى لا يختلق النموذج نتيجة عشوائية.
- **Style and Safety Controls:** إعداد نبرة وعمر مناسب وحدود محتوى، مع استمرار الشخصيات داخل الإطار المسموح.

نستفيد من أفكار مجرّبة مثل Personas وWorld Info وGroup Chats في SillyTavern، ثم نبنيها داخل Seven مع lineage ونسخ احتياطي واختبارات. [Personas](https://docs.sillytavern.app/usage/core-concepts/personas/)، [World Info](https://docs.sillytavern.app/usage/core-concepts/worldinfo/)، [Group Chats](https://docs.sillytavern.app/usage/core-concepts/groupchats/)

القواعد غير القابلة للتفاوض:

1. الحالة الأصلية هي المرجع؛ الملخص والتضمين والكاش لا يكتسبون سلطة.
2. كل معلومة مشتقة تحمل مصدرها وتحويلها.
3. لا يتحول نص الذاكرة أو نتيجة أداة إلى إذن تنفيذي.
4. لا تُرسل الأسرار إلى نموذج أو بحث إلا بإذن واضح.
5. لا نعلن PASS دون دليل تنفيذ، ولا نخلط INCONCLUSIVE مع النجاح.
6. لا نستعمل كل النماذج أو كل الأدوات في كل طلب؛ الاختيار مشروط بالفائدة والموارد.

## خطة التنفيذ المرحلية

### المرحلة 0 — خط أساس وقياس

**الإضافة:** مجموعة مهام عربية ثابتة تمثل المحادثة، Seven، البرمجة، الملفات، البحث، الصور، والتعامل مع الأخطاء. لكل مهمة إجابة متوقعة ومعايير نجاح.

**المخرجات:** `eval/tasks.jsonl`، تقرير مقارنة، عداد latency/tokens/failures، ونسخة baseline مجمدة.

**بوابة النجاح:** تشغيل نفس المهام على كل نموذج وكل نسخة من Seven، مع فصل جودة النموذج عن جودة النظام.

### المرحلة 1 — بوابة النماذج المجانية

**الإضافة:** Provider Adapter موحّد يدعم Groq وGemini API وCloudflare Workers AI وOpenRouter المجاني عند توفره، مع نموذج محلي كخطة احتياط.

**السلوك:**

- فحص free-proof وhealth وquota قبل الطلب.
- ترتيب حسب ملاءمة المهمة، الجودة السابقة، السرعة، الحصة، ووجود الرؤية أو tool calling.
- backoff وtimeout وAbortController.
- التبديل عند 429 أو انقطاع أو فشل schema.
- لا نخزن مفتاحًا مشتركًا داخل APK؛ مفاتيح المستخدم تبقى في Keystore عند تغليف Android.

**بوابة النجاح:** لا يوجد مزود واحد إلزامي؛ عند تعطله يستمر Seven في مسار معلن أو يعطي BLOCKED واضحًا.

### المرحلة 2 — الذكاء المحلي الرخيص

**الإضافة:**

- MiniSearch أو SQLite FTS للبحث النصي المحلي.
- نموذج embedding صغير مكمّم عبر Transformers.js للبحث الدلالي عند توفر الذاكرة.
- WebLLM/WebGPU للتجارب داخل المتصفح.
- llama.cpp/GGUF لاحقًا داخل Android للمهام الصغيرة.
- مصنف محلي للغة، نوع المهمة، الحساسية، والحاجة إلى بحث أو أداة.

**قاعدة الجهاز:** نبدأ بنموذج صغير ومكمّم، ونقيس زمن أول رد، RAM، الحرارة، البطارية، وحجم التنزيل على Tecno Pova 5. لا نعد بتشغيل نموذج كبير قبل القياس.

**بوابة النجاح:** تنفيذ التصنيف والتضمين والبحث محليًا، مع fallback سحابي واضح عند تجاوز القدرة.

### المرحلة 3 — Memory Fabric وRAG احترافي

**الإضافة:**

- IndexedDB/Dexie للحالة الأصلية.
- سجل أحداث append-only.
- فهارس lexical وvector وtemporal وcausal منفصلة.
- استرجاع هرمي: scope → lexical/vector candidates → fusion → reranking → evidence expansion.
- اكتشاف التعارض، supersession، versioning، وقرار الحفظ.
- sqlite-vec أو بديل WASM إذا أثبت استقرارًا وحجمًا مناسبًا.

**النتيجة المطلوبة:** Seven يسترجع المقطع الصحيح مع مصدره، ويعرف متى تكون المعلومات قديمة أو متعارضة.

**بوابة النجاح:** اختبارات Recall@K وMRR وfaithfulness على بيانات Seven العربية، مع قياس حجم السياق والزمن. نستخدم مبادئ تقييم RAG المنشورة في هذا المسح البحثي. [RAG evaluation survey](https://arxiv.org/html/2504.14891v1)

### المرحلة 4 — Context Workspace

**الإضافة:** select/rank/dedupe/pin/compress/expand/evict/reconstruct مع ميزانيات مستقلة للفئات: تعليمات، ذاكرة، ملفات، أدلة، أدوات، وتاريخ.

**السلوك:** لا يُختصر المصدر دون الاحتفاظ بالأصل؛ لا يدخل أي دليل إلى السياق دون lineage؛ لا تتجاوز الحزمة نافذة النموذج.

**بوابة النجاح:** نفس المهمة تنجح بسياق أقل، مع عدم فقدان معلومة مرجعية أو خلط مشروعين.

### المرحلة 5 — Chat RPG Engine

هذه طبقة أساسية وليست إضافة تجميلية. هدفها محاكاة عالم حي قابل للاستمرار، لا مجرد ردود جميلة:

- **Character Core:** شخصية، صوت، قيم، حدود معرفة، عادات، أهداف، مخاوف، وتغيرات مستمرة.
- **World Bible / Lorebook:** تاريخ العالم، الأماكن، الفصائل، القوانين، المصطلحات، والأحداث المرجعية مع مفاتيح استدعاء.
- **Scene State:** المكان والوقت والطقس والحالة والعناصر الموجودة وما تعرفه كل شخصية في تلك اللحظة.
- **Cast Director:** إدارة NPCs، دخولهم وخروجهم، أدوارهم، وجهات نظرهم، ومبادرتهم دون سرقة وكالة اللاعب.
- **Relationship and Quest Graph:** علاقات، ثقة، ديون، تحالفات، مهام، تبعات، وعُقد زمنية مرتبطة بمصادرها.
- **Narrative Controller:** الإيقاع، التوتر، كشف المعلومات، الاستمرارية، ومنع التكرار.
- **Player Agency Lock:** Seven لا يقرر أفعال شخصية اللاعب أو مشاعرها الجوهرية دون إدخال اللاعب.
- **Canon Lock:** لا يغيّر حدثًا مثبتًا أو شخصية مثبتة من أجل رد لاحق؛ التغيير يكون فرعًا أو Retcon معلنًا.
- **Save / Branch / Rewind:** حفظ نقطة، إنشاء فرع، مقارنة الفروع، والعودة دون إتلاف العالم الأصلي.
- **Group Chat Scheduler:** ترتيب أدوار الشخصيات واختيار المتحدث بناءً على السياق.
- **RPG Rules Engine:** إحصاءات ومهام ونرد اختياري، منفصل عن السرد حتى لا يختلق النموذج النتائج.

**دورة الدور:** يقرأ قرارات اللاعب والحالة الكانونية، يحدد من يستطيع الاستجابة، يولد الحوار والوصف، يفحص الاستمرارية والوكالة والمعرفة، ثم يحفظ الحدث وآثاره ومصدره.

**اختبارات Chat RPG:** ثبات الشخصية عبر 50–100 دور، ثبات قوانين العالم بعد ضغط السياق، منع المعرفة غير المكتسبة، احترام وكالة اللاعب، حفظ آثار القرار عبر الفروع، توازن الشخصيات في المجموعة، وتقليل التكرار.

نستفيد من مفاهيم Personas وWorld Info وGroup Chats الموجودة في SillyTavern، ثم ننفذها داخل Seven مع lineage ونسخ احتياطي واختبارات. [Personas](https://docs.sillytavern.app/usage/core-concepts/personas/)، [World Info](https://docs.sillytavern.app/usage/core-concepts/worldinfo/)، [Group Chats](https://docs.sillytavern.app/usage/core-concepts/groupchats/)

### المرحلة 6 — Tool Fabric وAgent Loop

**الإضافة:** capability normalization، aliases، capability graph، schema/result validation، idempotency، side-effect uncertainty، pinning/hashes، وخطة تعتمد على الاحتياج التدريجي للأدوات.

**حلقة التنفيذ:** Understand → Inspect → Plan → Read → Modify → Test → Inspect Diff → Fix → Verify → Report.

**بوابة النجاح:** كل تعديل يذكر الملفات، diff، الاختبار، والنتيجة. يفشل بأمان عند صلاحية ناقصة أو مسار خطير أو نتيجة غير صالحة.

### المرحلة 7 — Research Runtime

**الإضافة:** طبقات Search → Fetch → Extract → Evidence → Compare → Verify → Synthesize → Cite، مع freshness search وcontradiction search وgap search وclaim-evidence matrix.

**المصادر:** نبدأ بواجهات مجانية أو يدوية لا تتطلب تجاوز قيود المواقع. SearXNG خيار خدمة ذاتية إذا توفر خادم؛ لا نضعه كاعتماد إلزامي لتطبيق الهاتف.

**بوابة النجاح:** كل ادعاء حساس يملك مصدرًا، وكل مصدر يُعرض للمستخدم، والنتيجة تقول صراحة إذا تعذر التحقق.

### المرحلة 8 — Coding Runtime احترافي

**الإضافة:** repo map، قراءة أقل عدد من الملفات، sandbox command policy، auto-repair بعد فشل الاختبار، واستعادة snapshot قبل التعديل.

**التقييم:** مهام Seven الواقعية أولًا، ثم subset صغير من SWE-bench أو SWE-bench Lite عند توفر البيئة. لا نستخدم benchmark واحدًا كدليل شامل.

**بوابة النجاح:** إصلاح قابل لإعادة التشغيل، diff صغير، اختبار ناجح، وعدم الكتابة خارج مساحة المشروع.

### المرحلة 9 — تخصيص نموذج مجاني

**الإضافة:** جمع أمثلة عالية الجودة من مهام Seven، ثم QLoRA/SFT لنموذج مفتوح صغير على Colab أو جهاز متاح. ندرّبه على tool selection، JSON contracts، تلخيص مشاريع، ورفض التخمين.

**ما لا نفعله:** لا ندرب من الصفر، ولا ندرب على محادثات عشوائية، ولا نخلط بيانات الاختبار بالتدريب.

**بوابة النجاح:** مقارنة blind على مجموعة لم يرها النموذج، مع تحسن في المهمة المستهدفة دون تدهور اللغة أو السلامة أو المهام العامة. إذا لم يتحسن، نحذف adapter ونحتفظ بالنموذج الأصلي.

### المرحلة 10 — الصوت والصورة والمستندات

**الإضافة:**

- نموذج رؤية سحابي عند توفره، مع منع إرسال الصورة تلقائيًا.
- Tesseract.js للـOCR المحلي الأولي. [Tesseract.js](https://github.com/naptha/tesseract.js)
- whisper.cpp للصوت المحلي عندما يثبت الأداء. [whisper.cpp](https://github.com/ggml-org/whisper.cpp)
- Docling لخدمة خارجية اختيارية للمستندات المعقدة. [Docling](https://github.com/docling-project/docling)

**بوابة النجاح:** استرجاع نص PDF والصورة مع رقم الصفحة أو موضع المصدر، وإبلاغ المستخدم عندما تكون القراءة غير مؤكدة.

### المرحلة 11 — Android وPlay Store

**الإضافة:** Capacitor، Storage Access Framework، Keystore، offline state، migration/versioning، crash reporting اختياري دون محتوى افتراضيًا، وواجهة عربية كاملة.

**اختبارات:** تثبيت، تحديث، إيقاف قسري، انقطاع إنترنت، استعادة نسخة، ملف كبير، لوحة مفاتيح، دوران الشاشة، واستهلاك البطارية على الهاتف الحقيقي.

**متطلبات النشر:** سياسة خصوصية داخل التطبيق وفي رابط عام، Data Safety دقيقة، آلية الإبلاغ عن المحتوى المسيء إذا كان التطبيق يعرض محتوى مولدًا للمستخدمين، ووصف لا يوحي بقدرات غير موجودة. [Google Play User Data](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en)، [UGC policy](https://support.google.com/googleplay/android-developer/answer/9876937?hl=en)

## استراتيجية النماذج

لا نختار «أفضل نموذج» بالاسم فقط. نحتفظ بجدول حي لكل نموذج:

| الحقل | مثال القرار |
|---|---|
| capability | chat / vision / coding / JSON / tool calling |
| free proof | مجاني حاليًا، مصدر الحد، وقت التحقق، TTL |
| quality slices | عربي، كود، بحث، تلخيص، رؤية |
| resource profile | latency، tokens، حجم محلي، RAM |
| reliability | timeout، 429، schema failure، retry rate |
| privacy | ما الذي يرسل للمزود وكيف يحذف |
| fallback | المزود التالي أو local/deferred path |

الراوتر لا يشغل ثلاثة نماذج تلقائيًا. يختار نموذجًا واحدًا، ويصعّد فقط عندما تكون المهمة عالية المخاطر أو فشل التحقق أو تعارض الأدلة يستحق ذلك.

## استراتيجية التدريب

1. اجمع 300–1,000 مثالًا نظيفًا قبل التفكير في التدريب، موزعة على مهام Seven.
2. افصل train/dev/test، ولا تحفظ أسرارًا أو بيانات شخصية في dataset.
3. ابدأ SFT/QLoRA لنموذج صغير، لا full pretraining.
4. قيّم exact tool arguments، صحة JSON، دقة الاسترجاع، ورفض الاختلاق.
5. جرّب adapter منفصلًا؛ لا تستبدل النموذج الأصلي قبل المقارنة.
6. انشر adapter فقط إذا كان حجمه وأداؤه مناسبين للتشغيل المحلي أو الاستضافة المتاحة.

## بوابات الجودة النهائية

| البوابة | شرط الاعتماد |
|---|---|
| الحالة | لا فساد صامت، ونسخ احتياطي قابل للاستعادة |
| الذاكرة | مصدر، scope، version، تعارض، وحذف قابل للتدقيق |
| RAG | تحسن مثبت في Recall/faithfulness وليس نصًا أطول فقط |
| الأدوات | schema، صلاحية، idempotency، نتيجة قابلة للتحقق |
| البرمجة | diff + test + report، مع sandbox |
| البحث | claim-evidence-citation lock |
| النموذج | مقارنة blind على نفس المهام |
| الهاتف | قياس RAM/latency/battery على Pova 5 |
| الأمان | اختبار prompt injection، تسريب أسرار، excessive agency، وسلسلة التوريد |
| النشر | Privacy/Data Safety/UGC ومتطلبات Play مكتملة |

## ترتيب التنفيذ العملي

1. تثبيت المرحلة 0 وإنشاء benchmark خاص بSeven وChat RPG.
2. تنفيذ Provider Gateway وquota/health/fallback دون حد استخدام داخل التطبيق.
3. تنفيذ lexical + semantic retrieval محليًا.
4. ربط Context Workspace بالطلب الحقيقي.
5. بناء Chat RPG Engine واختبارات الاتساق والوكالة والفروع.
6. إكمال Tool/Coding loop داخل بيئة آمنة.
7. إضافة Research evidence lock.
8. قياس الهاتف ثم تجربة llama.cpp/WebLLM.
9. جمع dataset وتنفيذ QLoRA فقط إذا كشفت القياسات حاجة واضحة.
10. دمج الصوت والصورة بعد ثبات النص والملفات.
11. تغليف Android، اختبار ميداني محدود، ثم تجهيز Play Store.

## تعريف «الأقوى مجانيًا»

نعتبر Seven مرشحًا قويًا فقط إذا حقق تحسنًا موثقًا في مجموعة مهام حقيقية على سبعة محاور: جودة الإجابة، إنجاز المهمة، صحة الذاكرة، موثوقية الأدوات، جودة Chat RPG، استمرارية العالم ووكالة اللاعب، والموارد. لا يكفي أن يملك ميزات أكثر أو اسم نموذج أكبر.

الهدف النهائي هو: **أقوى نظام Chat RPG مجاني يمكن الوصول إليه عمليًا، مع مساعد عربي شخصي للمشاريع يعمل بلا حدود اصطناعية داخل التطبيق، يعرف حدود موارده الخارجية، ويحافظ على بيانات المستخدم ويثبت ما أنجزه.**
