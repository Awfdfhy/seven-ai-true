const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const {vendorPdf}=require('./vendor-pdf.cjs');

const ROOT=path.resolve(__dirname,'..');
const SOURCE=path.join(ROOT,'seven_ai-final.html');
const DIST_DIR=path.join(ROOT,'dist');
const OUTPUT=path.join(DIST_DIR,'seven_ai-release.html');
const WORKSPACE_DIR=path.join(__dirname,'workspaces');
const BRAND_DIR=path.join(__dirname,'brand');
const MARK='SEVEN_FINAL_RELEASE_LAYER_V1';
const THEME_BOOT=`<script id="seven-theme-boot">!function(){var h=document.documentElement,p='auto',n=(new Date).getHours();try{p=localStorage.getItem('theme')||'auto'}catch(e){}p=p==='light'?'day':p==='dark'?'night':p;var t=p==='day'||p==='night'?p:n>=6&&n<18?'day':'night';h.dataset.sevenTheme=t;h.dataset.sevenThemePreference=p;h.classList.add('seven-beta-ui');var m=document.getElementById('seven-theme-color');if(m)m.content=t==='day'?'#f7f6fb':'#0f0d1d'}()</script>`;

function read(name){return fs.readFileSync(path.join(__dirname,name),'utf8');}
function digest(value){return crypto.createHash('sha256').update(value).digest('hex').slice(0,16);}
function compactJs(value){
  value=String(value);let inTemplate=false;
  return value.split(/\r?\n/).map(line=>{
    let escaped=false,quotes='',ticks=0;
    for(let i=0;i<line.length;i++){
      const c=line[i];
      if(escaped){escaped=false;continue;}
      if(c==='\\'){escaped=true;continue;}
      if(!inTemplate&&(c==='"'||c==="'")){if(!quotes)quotes=c;else if(quotes===c)quotes='';continue;}
      if(!quotes&&c==='`'){ticks++;inTemplate=!inTemplate;}
    }
    return (inTemplate||ticks%2===1)?line:line.trim();
  }).filter(line=>inTemplate||line.length>0).join('\n');
}
function compactCss(value){
  value=String(value);let out='',quote='',comment=false,space=false;
  const tight='{}:;,>+~';
  for(let i=0;i<value.length;i++){
    const c=value[i],n=value[i+1];
    if(comment){if(c==='*'&&n==='/'){comment=false;i++;}continue;}
    if(quote){out+=c;if(c==='\\'&&i+1<value.length){out+=value[++i];continue;}if(c===quote)quote='';continue;}
    if(c==='/'&&n==='*'){comment=true;i++;continue;}
    if(c==='"'||c==="'"){if(space&&out&&tight.indexOf(out[out.length-1])<0)out+=' ';space=false;quote=c;out+=c;continue;}
    if(/\s/.test(c)){space=true;continue;}
    if(tight.indexOf(c)>=0){if(out.endsWith(' '))out=out.slice(0,-1);space=false;out+=c;continue;}
    if(space&&out&&tight.indexOf(out[out.length-1])<0)out+=' ';
    space=false;out+=c;
  }
  return out.trim();
}
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
    if(e.isDirectory())out.push(...copyDir(a,b));else{
      let data=fs.readFileSync(a);
      if(e.name.endsWith('.css'))data=Buffer.from(compactCss(data.toString('utf8')));
      else if(e.name.endsWith('.js'))data=Buffer.from(compactJs(data.toString('utf8')));
      fs.writeFileSync(b,data);
      out.push({path:path.relative(DIST_DIR,b).replace(/\\/g,'/'),bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')});
    }
  }
  return out;
}
function writeLazyRuntime(dst,name,source){
  const data=Buffer.from(compactJs(source));
  const file=path.join(dst,name);fs.writeFileSync(file,data);
  return {path:path.relative(DIST_DIR,file).replace(/\\/g,'/'),bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')};
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
  html=replaceRequired(html,'title="Add a .txt or .pdf file to the AI\'s knowledge" aria-label="Attach a file"','title="Attach photos or files" aria-label="Attach photos or files"','attachment button label');
  html=replaceRequired(html,'accept=".txt,.pdf" multiple','accept="*/*" multiple','universal attachment accept');
  html=replaceRequired(html,'<label>Knowledge files (.txt or .pdf — no page limit)</label>','<label>Attachments and knowledge files</label>','attachment settings label');
  const oldExtraction=`const text = lowerName.endsWith(".pdf")\n                        ? await extractPdfText(file)\n                        : await readTextFile(file);\n                    const artifact = createKnowledgeArtifact(file, text, targetRoomId, {\n                        method: lowerName.endsWith(".pdf") ? "pdfjs_text" : "text_file"\n                    });`;
  const newExtraction=`const attachmentExtraction = window.SevenAttachments && typeof window.SevenAttachments.extractForKnowledge === "function"\n                        ? await window.SevenAttachments.extractForKnowledge(file, extractPdfText, readTextFile)\n                        : { text: lowerName.endsWith(".pdf") ? await extractPdfText(file) : await readTextFile(file), method: lowerName.endsWith(".pdf") ? "pdfjs_text" : "text_file" };\n                    const text = attachmentExtraction.text;\n                    const artifact = createKnowledgeArtifact(file, text, targetRoomId, {\n                        method: attachmentExtraction.method\n                    });`;
  html=replaceRequired(html,oldExtraction,newExtraction,'attachment extraction bridge');
  const css=compactCss(read('seven-final.css'));
  const betaCss=compactCss(read('beta-ui.css'));
  const canon=compactJs(read('canon-simulator.js'));
  const world=compactJs(read('world-runtime.js'));
  const research=compactJs(read('research-runtime.js')).replace(/<\/script/gi,'<\\/script');
  const performance=compactJs(read('performance-runtime.js')).replace(/<\/script/gi,'<\\/script');
  const control=compactJs(read('control-runtime.js')).replace(/<\/script/gi,'<\\/script');
  const bridge=compactJs(read('control-bridge.js')).replace(/<\/script/gi,'<\\/script');
  const execution=compactJs(read('execution-bridge.js')).replace(/<\/script/gi,'<\\/script');
  const pdfRuntime=compactJs(read('pdf-runtime.js')).replace(/<\/script/gi,'<\\/script');
  const motion=compactJs(read('motion-runtime.js')).replace(/<\/script/gi,'<\\/script');
  const ui=compactJs(read('ui-runtime.js')).replace(/<\/script/gi,'<\\/script');
  const attachments=compactJs(read('attachment-runtime.js')).replace(/<\/script/gi,'<\\/script');
  const betaUi=compactJs(read('beta-ui-runtime.js')).replace(/<\/script/gi,'<\\/script');
  const workspaceSource=fs.existsSync(WORKSPACE_DIR)?fs.readdirSync(WORKSPACE_DIR).sort().map(name=>fs.readFileSync(path.join(WORKSPACE_DIR,name))).join(''):'';
  const workspaceDigest=digest(workspaceSource+canon+world);
  const brandSource=fs.existsSync(BRAND_DIR)?fs.readdirSync(BRAND_DIR).sort().map(name=>fs.readFileSync(path.join(BRAND_DIR,name))).join(''):'';
  const brandDigest=digest(brandSource);
  const fingerprint=digest(css+betaCss+research+performance+control+bridge+execution+pdfRuntime+motion+ui+attachments+betaUi+THEME_BOOT+pdf.version+workspaceDigest+brandDigest);
  const startupBytes=[css,betaCss,research,performance,control,bridge,execution,pdfRuntime,motion,ui,betaUi].reduce((n,x)=>n+Buffer.byteLength(x),0)+Buffer.byteLength(THEME_BOOT);
  const head=`\n<!-- ${MARK}:${fingerprint} -->\n<meta id="seven-theme-color" name="theme-color" content="#0f0d1d">\n${THEME_BOOT}\n<style id="seven-final-style">${css}</style>\n<style id="seven-beta-ui-style">${betaCss}</style>\n`;
  const body=`\n<script id="seven-research-runtime">${research}</script>\n<script id="seven-performance-runtime">${performance}</script>\n<script id="seven-control-runtime">${control}</script>\n<script id="seven-control-bridge">${bridge}</script>\n<script id="seven-execution-bridge">${execution}</script>\n<script id="seven-pdf-runtime">${pdfRuntime}</script>\n<script id="seven-motion-runtime">${motion}</script>\n<script id="seven-ui-runtime">${ui}</script>\n<script id="seven-attachment-runtime">${attachments}</script>\n<script id="seven-beta-ui-runtime">${betaUi}</script>\n<script id="seven-brand-runtime" src="./brand/runtime.js"></script>\n<!-- /${MARK}:${fingerprint} -->\n`;
  html=injectBeforeLast(html,'</head>',head);
  html=injectBeforeLast(html,'</body>',body);
  fs.mkdirSync(DIST_DIR,{recursive:true});
  fs.writeFileSync(OUTPUT,html);
  const workspaceOut=path.join(DIST_DIR,'workspaces');fs.rmSync(workspaceOut,{recursive:true,force:true});
  const workspaceFiles=copyDir(WORKSPACE_DIR,workspaceOut);
  workspaceFiles.push(writeLazyRuntime(workspaceOut,'canon-simulator.js',canon));
  workspaceFiles.push(writeLazyRuntime(workspaceOut,'world-runtime.js',world));
  const workspaceBytes=workspaceFiles.reduce((n,x)=>n+x.bytes,0);
  const byName=Object.fromEntries(workspaceFiles.map(x=>[path.basename(x.path),x.bytes]));
  const base=(byName['hub.js']||0)+(byName['hub.css']||0)+(byName['rtl.css']||0);
  const paths=[base+(byName['coding.js']||0),base+(byName['research.js']||0),base+(byName['rpg.js']||0)+(byName['canon-simulator.js']||0)+(byName['world-runtime.js']||0),base+(byName['generated-ui.js']||0)+(byName['generated-ui.css']||0)];
  const workspacePathBytes=Math.max.apply(null,paths);
  const brandOut=path.join(DIST_DIR,'brand');fs.rmSync(brandOut,{recursive:true,force:true});
  const brandFiles=copyDir(BRAND_DIR,brandOut),brandBytes=brandFiles.reduce((n,x)=>n+x.bytes,0);
  const result={output:OUTPUT,bytes:Buffer.byteLength(html),sourceBytes:fs.statSync(SOURCE).size,fingerprint,pdf,pdfLoadMode:'lazy-local',themeBootBytes:Buffer.byteLength(THEME_BOOT),startupBytes,workspaceLoadMode:'lazy-local',workspaceDigest,workspaceBytes,workspacePathBytes,workspaceFiles,brandDigest,brandBytes,brandFiles};
  fs.writeFileSync(path.join(DIST_DIR,'release-manifest.json'),JSON.stringify({format:'seven-release-manifest',version:15,builtAt:new Date().toISOString(),...result},null,2));
  return result;
}

if(require.main===module){const r=build();console.log(`release build: PASS (${r.bytes} bytes, ${r.fingerprint}, startup ${r.startupBytes} bytes, local lazy PDF ${r.pdf.bytes} bytes, lazy workspace path ${r.workspacePathBytes} bytes, all workspace assets ${r.workspaceBytes} bytes, brand ${r.brandBytes} bytes, theme boot ${r.themeBootBytes} bytes)`);}
module.exports={build,OUTPUT,MARK,THEME_BOOT,injectBeforeLast,compactCss,compactJs};
