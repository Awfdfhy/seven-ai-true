const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const {vendorPdf}=require('./vendor-pdf.cjs');

const ROOT=path.resolve(__dirname,'..');
const SOURCE=path.join(ROOT,'seven_ai-final.html');
const DIST_DIR=path.join(ROOT,'dist');
const OUTPUT=path.join(DIST_DIR,'seven_ai-release.html');
const MARK='SEVEN_FINAL_RELEASE_LAYER_V1';

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
  if(html.includes(MARK))throw new Error('release layer already present in source; refuse double injection');
  const pdf=vendorPdf();
  html=replaceRequired(html,'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs',pdf.module,'PDF module URL');
  html=replaceRequired(html,'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs',pdf.worker,'PDF worker URL');
  html=replaceRequired(html,'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/cmaps/',pdf.cmaps,'PDF CMap URL');
  const css=read('seven-final.css');
  const canon=read('canon-simulator.js').replace(/<\/script/gi,'<\\/script');
  const performance=read('performance-runtime.js').replace(/<\/script/gi,'<\\/script');
  const motion=read('motion-runtime.js').replace(/<\/script/gi,'<\\/script');
  const fingerprint=digest(css+canon+performance+motion+pdf.version);
  const head=`\n<!-- ${MARK}:${fingerprint} -->\n<meta name="theme-color" content="#121026">\n<style id="seven-final-style">${css}</style>\n`;
  const body=`\n<script id="seven-canon-runtime">${canon}</script>\n<script id="seven-performance-runtime">${performance}</script>\n<script id="seven-motion-runtime">${motion}</script>\n<!-- /${MARK}:${fingerprint} -->\n`;
  html=injectBeforeLast(html,'</head>',head);
  html=injectBeforeLast(html,'</body>',body);
  fs.mkdirSync(DIST_DIR,{recursive:true});
  fs.writeFileSync(OUTPUT,html);
  const result={output:OUTPUT,bytes:Buffer.byteLength(html),sourceBytes:fs.statSync(SOURCE).size,fingerprint,pdf};
  fs.writeFileSync(path.join(DIST_DIR,'release-manifest.json'),JSON.stringify({format:'seven-release-manifest',version:2,builtAt:new Date().toISOString(),...result},null,2));
  return result;
}

if(require.main===module){const r=build();console.log(`release build: PASS (${r.bytes} bytes, ${r.fingerprint}, local PDF ${r.pdf.bytes} bytes)`);}
module.exports={build,OUTPUT,MARK,injectBeforeLast};
