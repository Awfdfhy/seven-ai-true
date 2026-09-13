const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const {vendorPdf}=require('./vendor-pdf.cjs');

const ROOT=path.resolve(__dirname,'..');
const SOURCE=path.join(ROOT,'seven_ai-final.html');
const DIST_DIR=path.join(ROOT,'dist');
const OUTPUT=path.join(DIST_DIR,'seven_ai-release.html');
const MARK='SEVEN_FINAL_RELEASE_LAYER_V2';

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
function build(){
  let html=fs.readFileSync(SOURCE,'utf8');
  if(html.includes('SEVEN_FINAL_RELEASE_LAYER_'))throw new Error('release layer already present in source; refuse double injection');

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

  const legacyCss=read('seven-final.css');
  const visualCss=read('visual-shell.css');
  const brandMark=read('seven-mark.svg').trim();
  const iconData='data:image/svg+xml;base64,'+Buffer.from(brandMark).toString('base64');
  html=html.replace(/<link\s+rel=["']icon["'][^>]*>/i,`<link rel="icon" type="image/svg+xml" href="${iconData}">`);

  const canon=read('canon-simulator.js').replace(/<\/script/gi,'<\\/script');
  const performance=read('performance-runtime.js').replace(/<\/script/gi,'<\\/script');
  const pdfRuntime=read('pdf-runtime.js').replace(/<\/script/gi,'<\\/script');
  const motion=read('motion-runtime.js').replace(/<\/script/gi,'<\\/script');
  const visualShell=read('visual-shell.js')
    .replace('/*__SEVEN_MARK__*/',JSON.stringify(brandMark))
    .replace(/<\/script/gi,'<\\/script');

  const fingerprint=digest(legacyCss+visualCss+brandMark+canon+performance+pdfRuntime+motion+visualShell+pdf.version);
  const head=`\n<!-- ${MARK}:${fingerprint} -->\n<meta name="theme-color" content="#080910">\n<meta name="color-scheme" content="dark light">\n<style id="seven-final-style">${legacyCss}</style>\n<style id="seven-visual-shell-style">${visualCss}</style>\n`;
  const body=`\n<script id="seven-canon-runtime">${canon}</script>\n<script id="seven-performance-runtime">${performance}</script>\n<script id="seven-pdf-runtime">${pdfRuntime}</script>\n<script id="seven-motion-runtime">${motion}</script>\n<script id="seven-visual-shell-runtime">${visualShell}</script>\n<!-- /${MARK}:${fingerprint} -->\n`;

  html=injectBeforeLast(html,'</head>',head);
  html=injectBeforeLast(html,'</body>',body);
  fs.mkdirSync(DIST_DIR,{recursive:true});
  fs.writeFileSync(OUTPUT,html);
  const result={
    output:OUTPUT,
    bytes:Buffer.byteLength(html),
    sourceBytes:fs.statSync(SOURCE).size,
    fingerprint,
    brand:{visualShell:'brand-os-v1',mark:'celestial-seven-v1'},
    pdf,
    pdfLoadMode:'lazy-local'
  };
  fs.writeFileSync(path.join(DIST_DIR,'release-manifest.json'),JSON.stringify({format:'seven-release-manifest',version:4,builtAt:new Date().toISOString(),...result},null,2));
  return result;
}

if(require.main===module){
  const r=build();
  console.log(`release build: PASS (${r.bytes} bytes, ${r.fingerprint}, ${r.brand.visualShell}, local lazy PDF ${r.pdf.bytes} bytes)`);
}
module.exports={build,OUTPUT,MARK,injectBeforeLast};
