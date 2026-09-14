const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const {vendorPdf}=require('./vendor-pdf.cjs');

const ROOT=path.resolve(__dirname,'..');
const SOURCE=path.join(ROOT,'seven_ai-final.html');
const DIST_DIR=path.join(ROOT,'dist');
const OUTPUT=path.join(DIST_DIR,'seven_ai-release.html');
const WORKSPACE_DIR=path.join(__dirname,'workspaces');
const MARK='SEVEN_FINAL_RELEASE_LAYER_V1';
const THEME_BOOT=`<script id="seven-theme-boot">!function(){var h=document.documentElement,p='auto',n=(new Date).getHours();try{p=localStorage.getItem('theme')||'auto'}catch(e){}p=p==='light'?'day':p==='dark'?'night':p;var t=p==='day'||p==='night'?p:n>=6&&n<18?'day':'night';h.dataset.sevenTheme=t;h.dataset.sevenThemePreference=p;h.classList.add('seven-beta-ui');var m=document.getElementById('seven-theme-color');if(m)m.content=t==='day'?'#f7f6fb':'#0f0d1d'}()</script>`;

function read(name){return fs.readFileSync(path.join(__dirname,name),'utf8');}
function digest(value){return crypto.createHash('sha256').update(value).digest('hex').slice(0,16);}
function injectBeforeLast(html,needle,payload){
  const index=html.toLowerCase().lastIndexOf(needle.toLowerCase());
  if(index<0)throw new Error('source HTML missing '+needle);
  return html.slice(0,index)+payload+html.slice(index);
}
function replaceRequired(html,from,to,label){
  if(!html.includes(from))throw new Error('release packaging could not find '+label);
  return html.split(from).join(to);
}
function copyDir(src,dst){
  if(!fs.existsSync(src))return [];
  fs.mkdirSync(dst,{recursive:true});const out=[];
  for(const e of fs.readdirSync(src,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
    const a=path.join(src,e.name),b=path.join(dst,e.name);
    if(e.isDirectory())out.push(...copyDir(a,b));else{fs.copyFileSync(a,b);out.push({path:path.relative(DIST_DIR,b).replace(/\\/g,'/'),bytes:fs.statSync(a).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(a)).digest('hex')});}
  }
  return out;
}
function build(){
  let html=fs.readFileSync(SOURCE,'utf8');
  if(html.includes(MARK))throw new Error('release layer already present in source; refuse double injection');
  const pdf=vendorPdf();
  html=replaceRequired(html,'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs',pdf.module,'PDF module URL');
  html=replaceRequired(html,'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs',pdf.worker,'PDF worker URL');
  html=replaceRequired(html,'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/cmaps/',pdf.cmaps,'PDF CMap URL');
  const autoPdf=/<script\s+type=["']module["']>\s*import\s+\*\s+as\s+pdfjsLib\s+from\s+["']\.\/vendor\/pdfjs\/pdf\.min\.mjs["'];\s*pdfjsLib\.GlobalWorkerOptions\.workerSrc\s*=\s*["']\.\/vendor\/pdfjs\/pdf\.worker\.min\.mjs["'];\s*window\.pdfjsLib\s*=\s*pdfjsLib;\s*<\/script>/m;
  if(!autoPdf.test(html))throw new Error('release packaging could not isolate automatic PDF module bootstrap');
  html=html.replace(autoPdf,'');
  const pdfGuard=/if\s*\(!window\.pdfjsLib\)\s*\{\s*throw\s+new\s+Error\(["']PDF reader is still loading — try again in a moment\.["']\);\s*\}/m;
  if(!pdfGuard.test(html))throw new Error('release packaging could not find PDF lazy-load guard');
  html=html.replace(pdfGuard,`if (!window.pdfjsLib && window.SevenPdf && typeof window.SevenPdf.load === "function") {\n                await window.SevenPdf.load();\n            }\n            if (!window.pdfjsLib) {\n                throw new Error("PDF reader could not be loaded.");\n            }`);
  const css=read('seven-final.css');
  const betaCss=read('beta-ui.css');
  const canon=read('canon-simulator.js').replace(/<\/script/gi,'<\\/script');
  const world=read('world-runtime.js').replace(/<\/script/gi,'<\\/script');
  const research=read('research-runtime.js').replace(/<\/script/gi,'<\\/script');
  const performance=read('performance-runtime.js').replace(/<\/script/gi,'<\\/script');
  const control=read('control-runtime.js').replace(/<\/script/gi,'<\\/script');
  const bridge=read('control-bridge.js').replace(/<\/script/gi,'<\\/script');
  const execution=read('execution-bridge.js').replace(/<\/script/gi,'<\\/script');
  const pdfRuntime=read('pdf-runtime.js').replace(/<\/script/gi,'<\\/script');
  const motion=read('motion-runtime.js').replace(/<\/script/gi,'<\\/script');
  const ui=read('ui-runtime.js').replace(/<\/script/gi,'<\\/script');
  const betaUi=read('beta-ui-runtime.js').replace(/<\/script/gi,'<\\/script');
  const workspaceSource=fs.existsSync(WORKSPACE_DIR)?fs.readdirSync(WORKSPACE_DIR).sort().map(name=>fs.readFileSync(path.join(WORKSPACE_DIR,name))).join(''):'';
  const workspaceDigest=digest(workspaceSource);
  const fingerprint=digest(css+betaCss+canon+world+research+performance+control+bridge+execution+pdfRuntime+motion+ui+betaUi+THEME_BOOT+pdf.version+workspaceDigest);
  const head=`\n<!-- ${MARK}:${fingerprint} -->\n<meta id="seven-theme-color" name="theme-color" content="#0f0d1d">\n${THEME_BOOT}\n<style id="seven-final-style">${css}</style>\n<style id="seven-beta-ui-style">${betaCss}</style>\n`;
  const body=`\n<script id="seven-canon-runtime">${canon}</script>\n<script id="seven-world-runtime">${world}</script>\n<script id="seven-research-runtime">${research}</script>\n<script id="seven-performance-runtime">${performance}</script>\n<script id="seven-control-runtime">${control}</script>\n<script id="seven-control-bridge">${bridge}</script>\n<script id="seven-execution-bridge">${execution}</script>\n<script id="seven-pdf-runtime">${pdfRuntime}</script>\n<script id="seven-motion-runtime">${motion}</script>\n<script id="seven-ui-runtime">${ui}</script>\n<script id="seven-beta-ui-runtime">${betaUi}</script>\n<!-- /${MARK}:${fingerprint} -->\n`;
  html=injectBeforeLast(html,'</head>',head);
  html=injectBeforeLast(html,'</body>',body);
  fs.mkdirSync(DIST_DIR,{recursive:true});
  fs.writeFileSync(OUTPUT,html);
  const workspaceOut=path.join(DIST_DIR,'workspaces');fs.rmSync(workspaceOut,{recursive:true,force:true});
  const workspaceFiles=copyDir(WORKSPACE_DIR,workspaceOut),workspaceBytes=workspaceFiles.reduce((n,x)=>n+x.bytes,0);
  const result={output:OUTPUT,bytes:Buffer.byteLength(html),sourceBytes:fs.statSync(SOURCE).size,fingerprint,pdf,pdfLoadMode:'lazy-local',themeBootBytes:Buffer.byteLength(THEME_BOOT),workspaceLoadMode:'lazy-local',workspaceDigest,workspaceBytes,workspaceFiles};
  fs.writeFileSync(path.join(DIST_DIR,'release-manifest.json'),JSON.stringify({format:'seven-release-manifest',version:12,builtAt:new Date().toISOString(),...result},null,2));
  return result;
}

if(require.main===module){const r=build();console.log(`release build: PASS (${r.bytes} bytes, ${r.fingerprint}, local lazy PDF ${r.pdf.bytes} bytes, lazy workspaces ${r.workspaceBytes} bytes, theme boot ${r.themeBootBytes} bytes)`);}
module.exports={build,OUTPUT,MARK,THEME_BOOT,injectBeforeLast};
