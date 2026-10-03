"use strict";
const fs=require("fs");
const path=require("path");
const zlib=require("zlib");
const crypto=require("crypto");
const ROOT=path.resolve(__dirname);
const SOURCE=path.join(ROOT,"remake-source");
const OUT=path.join(ROOT,"workspaces");
const FILES=Object.freeze({
  "remake.css":"c2d78d4aeea97e2c54af3b2c3a4767fbda01c39bcd6b5b3f2b3063189af88ea3",
  "remake.js":"c0aeb663870be9230e846e386a12a55670be1dbbb2b9471847d604a775da685c",
  "intelligence.js":"1722898990b11364d225bb80a50bebb3acdd919437f411321644496ecadfe647",
  "research-v2.js":"54762228cc8d7ef19f92d57ac7b39e6457d11d7e46b04e1d2b70c68390fbb3f8"
});
function sha(b){return crypto.createHash("sha256").update(b).digest("hex");}
function applyCompatibilityFixes(name,raw){
  let text=Buffer.isBuffer(raw)?raw.toString("utf8"):String(raw);
  if(name==="remake.css"){
    if(!text.includes('#seven-app body'))throw new Error("Seven UI Remake body-scope anchor missing");
    text=text.split('#seven-app body').join('#seven-app');
    const hardening=fs.readFileSync(path.join(ROOT,"ui-hardening.css"),"utf8");
    if(!hardening.includes("Seven 2.4.2 UI Hardening"))throw new Error("Seven UI hardening marker missing");
    if(!text.includes("Seven 2.4.2 UI Hardening"))text+="\n"+hardening;
  }
  if(name==="remake.js"){
    const bootAnchor="d.documentElement.lang=language;d.documentElement.dir=language==='ar'?'rtl':'ltr';r.SevenRemake={version:'2.0.0',update,openWorkspace,searchSettings,depthDialog,modeDialog,closeDialog,welcome,t:T};";
    const bootFixed="d.documentElement.lang=language;d.documentElement.dir=language==='ar'?'rtl':'ltr';const appRoot=d.getElementById('seven-app');if(appRoot){appRoot.lang=language;appRoot.dir=d.documentElement.dir;appRoot.dataset.sevenTheme=r.SevenTheme?.getResolvedTheme?.()||d.documentElement.dataset.sevenTheme||'day';}r.SevenRemake={version:'2.0.1',update,openWorkspace,searchSettings,depthDialog,modeDialog,closeDialog,welcome,t:T};";
    if(!text.includes(bootAnchor))throw new Error("Seven UI Remake root-state boot anchor missing");
    text=text.replace(bootAnchor,bootFixed);
    const searchOption='<option value="brave">Brave Search</option>';
    if(!text.includes(searchOption))throw new Error("Seven UI Remake Brave option anchor missing");
    text=text.replace(searchOption,'');
    const braveField='<label class="s-field" id="s-brave-field">Brave API key<input type="password" id="s-brave-key" autocomplete="off"></label>';
    if(!text.includes(braveField))throw new Error("Seven UI Remake Brave key field anchor missing");
    text=text.replace(braveField,'');
    const fieldsOld="function fields(){box.querySelector('#s-brave-field').hidden=engine.value!=='brave';box.querySelector('#s-endpoint-field').hidden=engine.value!=='searxng';box.querySelector('#s-search-freshness').disabled=!['brave','searxng'].includes(engine.value);box.querySelector('#s-search-help').textContent=engine.value==='auto'?T('General search depends on network access. Wikipedia is used when it is unavailable; coverage is shown in the result.','البحث العام يعتمد على اتصال الموقع. عند تعذره تُستخدم Wikipedia وتظهر حدود التغطية.'):engine.value==='brave'?T('Uses your Brave subscription. On Android the key is kept in native secure storage; in a browser it lasts for this session.','يستخدم اشتراك Brave الخاص بك. يُحفظ المفتاح في التخزين الآمن على Android؛ وفي المتصفح يبقى لهذه الجلسة.'):engine.value==='searxng'?T('Use a public HTTPS instance with JSON enabled. Availability depends on your server.','استخدم خادم HTTPS عامًا يدعم JSON. التوافر يعتمد على الخادم.'):T('Encyclopedia coverage, not a current-news search engine.','تغطية موسوعية؛ ليست محركًا لأحدث الأخبار.');}";
    const fieldsNew="function fields(){box.querySelector('#s-endpoint-field').hidden=engine.value!=='searxng';box.querySelector('#s-search-freshness').disabled=engine.value!=='searxng';box.querySelector('#s-search-help').textContent=engine.value==='auto'?T('Automatic zero-key search uses DuckDuckGo and Wikipedia when available; coverage limits are shown in the result.','البحث التلقائي بدون مفتاح يستخدم DuckDuckGo وWikipedia عند توفرهما، وتظهر حدود التغطية في النتيجة.'):engine.value==='searxng'?T('Use a public HTTPS instance with JSON enabled. No API key is required by Seven.','استخدم خادم HTTPS عامًا يدعم JSON. لا يتطلب Seven مفتاح API.'):T('Encyclopedia coverage, not a current-news search engine.','تغطية موسوعية؛ ليست محركًا لأحدث الأخبار.');}";
    if(!text.includes(fieldsOld))throw new Error("Seven UI Remake search fields anchor missing");
    text=text.replace(fieldsOld,fieldsNew);
    const loadKeyOld="engine.onchange=fields;fields();A.loadKey().then(()=>{if(box.isConnected)box.querySelector('#s-brave-key').placeholder=A.hasBraveKey()?T('Saved · leave blank to keep','محفوظ · اتركه فارغًا للإبقاء عليه'):T('Enter API key','أدخل المفتاح')}).catch(()=>{});";
    if(!text.includes(loadKeyOld))throw new Error("Seven UI Remake load-key anchor missing");
    text=text.replace(loadKeyOld,"engine.onchange=fields;fields();");
    const saveOld="box.querySelector('#s-save-search').onclick=async()=>{const btn=box.querySelector('#s-save-search'),result=box.querySelector('#s-save-result');btn.disabled=true;try{const key=box.querySelector('#s-brave-key').value.trim();if(key)await A.setBraveKey(key);A.configure({engine:engine.value,endpoint:box.querySelector('#s-search-endpoint').value,maxQueries:Number(box.querySelector('#s-search-budget').value),freshness:box.querySelector('#s-search-freshness').value,readPages:box.querySelector('#s-read-pages').checked});closeDialog();update()}catch(e){result.textContent=e.message}finally{btn.disabled=false}};";
    const saveNew="box.querySelector('#s-save-search').onclick=async()=>{const btn=box.querySelector('#s-save-search'),result=box.querySelector('#s-save-result');btn.disabled=true;try{A.configure({engine:engine.value,endpoint:box.querySelector('#s-search-endpoint').value,maxQueries:Number(box.querySelector('#s-search-budget').value),freshness:box.querySelector('#s-search-freshness').value,readPages:box.querySelector('#s-read-pages').checked});closeDialog();update()}catch(e){result.textContent=e.message}finally{btn.disabled=false}};";
    if(!text.includes(saveOld))throw new Error("Seven UI Remake save-key anchor missing");
    text=text.replace(saveOld,saveNew);

    const appInertOn="d.body.appendChild(modal);$('.app').inert=true;modal.querySelector('button').focus();return modal";
    const appInertOnFixed="d.body.appendChild(modal);const inertRoot=d.getElementById('seven-app')||d.body;inertRoot.inert=true;modal.querySelector('button').focus();return modal";
    if(!text.includes(appInertOn))throw new Error("Seven UI Remake dialog inert-on anchor missing");
    text=text.replace(appInertOn,appInertOnFixed);
    const appInertOff="function closeDialog(){if(!modal)return;modal.remove();modal=null;$('.app').inert=false;opener?.isConnected&&opener.focus();opener=null}";
    const appInertOffFixed="function closeDialog(){if(!modal)return;modal.remove();modal=null;const inertRoot=d.getElementById('seven-app')||d.body;inertRoot.inert=false;opener?.isConnected&&opener.focus();opener=null}";
    if(!text.includes(appInertOff))throw new Error("Seven UI Remake dialog inert-off anchor missing");
    text=text.replace(appInertOff,appInertOffFixed);

    const eventAnchor="d.addEventListener('seven:workspacechange',()=>{update();localizeWorkspace()});d.addEventListener('seven:runprogress',()=>{update()});d.addEventListener('seven:intelligenceconfig',update);";
    const eventFixed="d.addEventListener('seven:workspacechange',()=>{update();localizeWorkspace()});d.addEventListener('seven:runprogress',()=>{update()});d.addEventListener('seven:intelligenceconfig',update);d.addEventListener('seven:themechange',e=>{const root=d.getElementById('seven-app');if(root)root.dataset.sevenTheme=e?.detail?.theme||r.SevenTheme?.getResolvedTheme?.()||d.documentElement.dataset.sevenTheme||'day';update()});";
    if(!text.includes(eventAnchor))throw new Error("Seven UI Remake theme event anchor missing");
    text=text.replace(eventAnchor,eventFixed);
  }
  return Buffer.from(text);
}
function materializeRemakeAssets(){
  fs.mkdirSync(OUT,{recursive:true});
  const result=[];
  for(const [name,expected] of Object.entries(FILES)){
    const source=path.join(SOURCE,name+".gz");
    if(!fs.existsSync(source))throw new Error("Seven UI Remake source missing: "+source);
    const raw=zlib.gunzipSync(fs.readFileSync(source));
    const actual=sha(raw);
    if(actual!==expected)throw new Error("Seven UI Remake integrity mismatch for "+name);
    const materialized=applyCompatibilityFixes(name,raw);
    fs.writeFileSync(path.join(OUT,name),materialized);
    result.push({name,bytes:materialized.length,sha256:sha(materialized),sourceSha256:actual});
  }
  return result;
}
if(require.main===module){
  const out=materializeRemakeAssets();
  console.log("Seven UI Remake materialization: PASS ("+out.map(x=>x.name+":"+x.bytes).join(", ")+")");
}
// Seven 2.4.1 root-state bridge verified by release/browser + Android device gates.
module.exports=Object.freeze({FILES,materializeRemakeAssets,applyCompatibilityFixes});
