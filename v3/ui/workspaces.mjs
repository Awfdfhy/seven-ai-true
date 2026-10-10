const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const isAr=()=>String(globalThis.document?.documentElement?.lang||"").toLowerCase().startsWith("ar");
const T=(en,ar)=>isAr()?ar:en;
const wrap=(title,kicker,desc,body,actions="")=>`<section class="s7-workspace"><div class="s7-workspace-inner"><header class="s7-workspace-head"><div><div class="s7-kicker">${esc(kicker)}</div><h1>${esc(title)}</h1><p>${esc(desc)}</p></div><div class="s7-actions">${actions}</div></header>${body}</div></section>`;

export function renderSettingsSurface(){
 return wrap(T("Settings","الإعدادات"),T("Seven · System","Seven · النظام"),T("One place for appearance, models, privacy and runtime behavior.","مكان واحد للمظهر والنماذج والخصوصية وسلوك التشغيل."),`
 <div class="s7-settings">
  <nav class="s7-card s7-card-body s7-settings-nav"><button data-active="true">${T("General","عام")}</button><button>${T("Models","النماذج")}</button><button>${T("Memory","الذاكرة")}</button><button>${T("Privacy","الخصوصية")}</button><button>${T("Advanced","متقدم")}</button></nav>
  <section class="s7-card"><div class="s7-card-head"><strong>${T("General","عام")}</strong><span class="s7-status" data-state="ok">${T("SAVED","محفوظ")}</span></div><div class="s7-card-body">
   <div class="s7-setting-row"><div><strong>${T("Dark appearance","المظهر الداكن")}</strong><p>${T("Follow Seven's dark theme across all workspaces.","استخدم المظهر الداكن في جميع مساحات Seven.")}</p></div><button class="s7-switch" data-on="true" aria-label="${T("Dark appearance","المظهر الداكن")}"></button></div>
   <div class="s7-setting-row"><div><strong>${T("Arabic interface","الواجهة العربية")}</strong><p>${T("Use RTL layout and Arabic presentation where available.","استخدم التخطيط من اليمين لليسار والعرض العربي.")}</p></div><button class="s7-switch" data-on="false" aria-label="${T("Arabic interface","الواجهة العربية")}"></button></div>
   <div class="s7-setting-row"><div><strong>${T("Memory","الذاكرة")}</strong><p>${T("Allow Seven to use durable conversation memory.","اسمح لـSeven باستخدام ذاكرة المحادثة الدائمة.")}</p></div><button class="s7-switch" data-on="true" aria-label="${T("Memory","الذاكرة")}"></button></div>
   <div class="s7-setting-row"><div><strong>${T("Reasoning","الاستدلال")}</strong><p>${T("Default reasoning effort for supported models.","مستوى الاستدلال الافتراضي للنماذج المدعومة.")}</p></div><select class="s7-field"><option>${T("Medium","متوسط")}</option><option>${T("High","عالٍ")}</option></select></div>
  </div></section>
 </div>`);
}

export function renderCodingSurface(){
 return wrap(T("Coding","البرمجة"),T("Seven · Coding","Seven · البرمجة"),T("Inspect the project, run the task, then verify the result.","افحص المشروع، شغّل المهمة، ثم تحقق من النتيجة."),`
 <section class="s7-taskbox"><textarea placeholder="${T("Describe what you want Seven to inspect, build, debug, or explain…","صف ما تريد من Seven فحصه أو بناؤه أو تصحيحه أو شرحه…")}"></textarea><div class="s7-actions"><button class="s7-btn">${T("Stop","إيقاف")}</button><button class="s7-btn">${T("Retry","إعادة")}</button><button class="s7-btn" data-primary="true">${T("Run through Seven","تشغيل عبر Seven")}</button></div></section>
 <div class="s7-grid">
  <section class="s7-card"><div class="s7-card-head"><strong>${T("Project","المشروع")}</strong><span class="s7-muted">${T("3 files","3 ملفات")}</span></div><div class="s7-card-body s7-list">
   <div class="s7-list-row" data-active="true"><span>JS</span><code>src/runtime.js</code></div>
   <div class="s7-list-row"><span>CSS</span><code>src/ui.css</code></div>
   <div class="s7-list-row"><span>MD</span><code>README.md</code></div>
  </div></section>
  <section class="s7-card"><div class="s7-card-head"><strong>${T("Preview","المعاينة")}</strong><span class="s7-status">${T("READ ONLY","قراءة فقط")}</span></div><div class="s7-card-body"><pre class="s7-code">export async function runTask(task) {
  const plan = await createPlan(task);
  const result = await execute(plan);
  return verify(result);
}</pre></div></section>
  <section class="s7-card"><div class="s7-card-head"><strong>${T("Execution / Verify","التنفيذ / التحقق")}</strong><span class="s7-status" data-state="ok">${T("PASS","ناجح")}</span></div><div class="s7-card-body s7-list"><div class="s7-list-row">${T("Plan created","تم إنشاء الخطة")}</div><div class="s7-list-row">${T("2 files inspected","تم فحص ملفين")}</div><div class="s7-list-row">${T("Tests passed","نجحت الاختبارات")}</div><div class="s7-list-row">${T("Result ready","النتيجة جاهزة")}</div></div></section>
 </div>`,`<button class="s7-btn">${T("Import files","استيراد ملفات")}</button><button class="s7-btn">${T("Use as context","استخدام كسياق")}</button>`);
}

export function renderSelfDevSurface(){
 return wrap(T("Self-Development","التطوير الذاتي"),T("Seven · Guarded engineering","Seven · هندسة محمية"),T("Changes are isolated, verified, and committed only after acceptance gates pass.","التغييرات معزولة ومتحقق منها ولا تُثبت إلا بعد نجاح بوابات القبول."),`
 <div class="s7-flow"><div class="s7-flow-step" data-state="done">${T("Task","المهمة")}</div><div class="s7-flow-step" data-state="done">${T("Plan","الخطة")}</div><div class="s7-flow-step" data-state="done">${T("Changes","التغييرات")}</div><div class="s7-flow-step" data-state="active">${T("Verify","التحقق")}</div><div class="s7-flow-step">${T("Commit","التثبيت")}</div><div class="s7-flow-step">${T("Result","النتيجة")}</div></div>
 <section class="s7-taskbox" style="margin-block-start:12px"><textarea>${T("Improve long-context memory retrieval without weakening tests.","حسّن استرجاع الذاكرة طويلة السياق دون إضعاف الاختبارات.")}</textarea><div class="s7-actions"><span class="s7-status" data-state="ok">${T("GitHub connected","GitHub متصل")}</span><button class="s7-btn" data-primary="true">${T("Continue verification","متابعة التحقق")}</button></div></section>
 <div class="s7-grid">
  <section class="s7-card"><div class="s7-card-head"><strong>${T("Safety","الأمان")}</strong><span class="s7-status" data-state="ok">${T("LOCKED","مقفل")}</span></div><div class="s7-card-body s7-list"><div class="s7-list-row">${T("Protected paths enabled","المسارات المحمية مفعلة")}</div><div class="s7-list-row">${T("Acceptance gates immutable","بوابات القبول غير قابلة للتجاوز")}</div><div class="s7-list-row">${T("Atomic commits only","تثبيتات ذرية فقط")}</div></div></section>
  <section class="s7-card"><div class="s7-card-head"><strong>${T("Changes","التغييرات")}</strong><span class="s7-muted">branch: selfdev/run-184</span></div><div class="s7-card-body"><div class="s7-list-row" data-active="true">memory/retrieval.js <span class="s7-status" data-state="ok">+24 −7</span></div><div class="s7-list-row">memory/retrieval.test.js <span class="s7-status">+31</span></div></div></section>
  <section class="s7-card"><div class="s7-card-head"><strong>${T("Technical activity","النشاط التقني")}</strong><span class="s7-status" data-state="warn">${T("VERIFYING","جارٍ التحقق")}</span></div><div class="s7-card-body s7-log"><div>✓ static safety audit</div><div>✓ memory regression suite</div><div>→ long-context benchmark</div></div></section>
 </div>`);
}

export function renderResearchSurface(){
 return wrap(T("Research","البحث"),T("Seven · Research","Seven · البحث"),T("Build claims from evidence, surface conflicts, and keep citations inspectable.","ابنِ الادعاءات من الأدلة، أظهر التعارضات، واجعل الاستشهادات قابلة للفحص."),`
 <section class="s7-taskbox"><textarea>${T("Compare the strongest approaches to persistent memory for agentic assistants.","قارن أقوى أساليب الذاكرة الدائمة للمساعدين الوكلاء.")}</textarea><div class="s7-actions"><button class="s7-btn">${T("Clear","مسح")}</button><button class="s7-btn" data-primary="true">${T("Research","بحث")}</button></div></section>
 <div class="s7-research-grid">
  <section class="s7-card"><div class="s7-card-head"><strong>${T("Claims","الادعاءات")}</strong><span class="s7-status" data-state="ok">${T("4 verified","4 متحقق")}</span></div><div class="s7-card-body s7-list">
   <article class="s7-claim"><strong>${T("Hybrid memory outperforms a single store","الذاكرة الهجينة تتفوق على مخزن واحد")}</strong><p class="s7-muted">${T("Durable facts and retrieval context solve different failure modes.","الحقائق الدائمة وسياق الاسترجاع يعالجان أنواعًا مختلفة من الفشل.")}</p></article>
   <article class="s7-claim" data-state="conflict"><strong>${T("Long context does not replace memory","السياق الطويل لا يستبدل الذاكرة")}</strong><p class="s7-muted">${T("Sources disagree on the point at which retrieval remains beneficial.","تختلف المصادر حول النقطة التي يبقى عندها الاسترجاع مفيدًا.")}</p></article>
   <article class="s7-claim" data-state="gap"><strong>${T("Open question: forgetting policy","سؤال مفتوح: سياسة النسيان")}</strong><p class="s7-muted">${T("More evidence is required before recommending automatic deletion.","نحتاج أدلة أكثر قبل التوصية بالحذف التلقائي.")}</p></article>
  </div></section>
  <aside class="s7-card"><div class="s7-card-head"><strong>${T("Evidence","الأدلة")}</strong><span class="s7-muted">${T("6 sources","6 مصادر")}</span></div><div class="s7-card-body s7-list"><div class="s7-list-row" data-active="true">${T("Provider docs · primary","توثيق المزود · أساسي")}</div><div class="s7-list-row">${T("Architecture paper · primary","ورقة معمارية · أساسية")}</div><div class="s7-list-row">${T("Benchmark · supporting","اختبار معياري · داعم")}</div></div></aside>
 </div>`);
}

export function renderRpgSurface(){
 return wrap(T("RPG","RPG"),T("Seven · Living world","Seven · عالم حي"),T("Narrative first. Canon, character knowledge and world state stay persistent.","السرد أولاً. الكانون ومعرفة الشخصيات وحالة العالم تبقى دائمة."),`
 <div class="s7-research-grid">
  <section class="s7-card s7-rpg-hero"><div class="s7-kicker">${T("Episode 34","الحلقة 34")}</div><div class="s7-rpg-title">${T("The Hall Before Dawn","القاعة قبل الفجر")}</div><p class="s7-muted">${T("Royal One gathers while the capital wakes under a quiet storm warning.","تجتمع Royal One بينما تستيقظ العاصمة على إنذار عاصفة هادئ.")}</p><div class="s7-rpg-meta"><span class="s7-status">Valen</span><span class="s7-status" data-state="ok">${T("Canon stable","الكانون مستقر")}</span><span class="s7-status">${T("Ali POV locked","منظور علي مقفل")}</span></div></section>
  <aside class="s7-card"><div class="s7-card-head"><strong>${T("Scene state","حالة المشهد")}</strong><span class="s7-status" data-state="ok">${T("LIVE","مباشر")}</span></div><div class="s7-card-body s7-list"><div class="s7-list-row">${T("Location: Royal Academy","الموقع: الأكاديمية الملكية")}</div><div class="s7-list-row">${T("Time: 06:42","الوقت: 06:42")}</div><div class="s7-list-row">${T("Characters: 8 present","الشخصيات: 8 حاضرة")}</div></div></aside>
 </div>
 <div class="s7-grid" style="margin-block-start:12px">
  <section class="s7-card"><div class="s7-card-head"><strong>${T("Cast","الشخصيات")}</strong><span class="s7-muted">${T("room knowledge","معرفة الغرفة")}</span></div><div class="s7-card-body s7-list"><div class="s7-list-row" data-active="true">Aria</div><div class="s7-list-row">Selene Marr</div><div class="s7-list-row">Lyra</div><div class="s7-list-row">Ren</div></div></section>
  <section class="s7-card"><div class="s7-card-head"><strong>${T("Story","القصة")}</strong><span class="s7-muted">${T("narrator","الراوي")}</span></div><div class="s7-card-body"><p>${T("Rain pressed softly against the eastern glass. No one in Royal One spoke above a murmur.","ضغط المطر بلطف على الزجاج الشرقي. لم يرفع أحد في Royal One صوته فوق الهمس.")}</p><p>${T("Across the hall, the academy wards flickered once—then steadied.","عبر القاعة، ومضت حواجز الأكاديمية مرة واحدة ثم استقرت.")}</p></div></section>
  <section class="s7-card"><div class="s7-card-head"><strong>${T("World state","حالة العالم")}</strong><span class="s7-status" data-state="warn">${T("1 change","تغيير واحد")}</span></div><div class="s7-card-body s7-list"><div class="s7-rpg-event">${T("Storm warning raised","تم رفع إنذار العاصفة")}<small class="s7-muted">${T("Valen capital","عاصمة Valen")}</small></div><div class="s7-rpg-event">${T("Royal One assembled","اجتمعت Royal One")}<small class="s7-muted">${T("18 students","18 طالبًا")}</small></div></div></section>
 </div>`);
}

export function renderSurface(name){
 switch(name){
  case "settings":return renderSettingsSurface();
  case "coding":return renderCodingSurface();
  case "selfdev":return renderSelfDevSurface();
  case "research":return renderResearchSurface();
  case "rpg":return renderRpgSurface();
  default:return "";
 }
}
