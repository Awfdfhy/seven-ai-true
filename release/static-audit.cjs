const fs=require('fs');
const path=require('path');
const assert=require('assert/strict');
const {build}=require('./build-release.cjs');
const ROOT=path.resolve(__dirname,'..');
const sourceHtml=fs.readFileSync(path.join(ROOT,'seven_ai-final.html'),'utf8');
const built=build();
const html=fs.readFileSync(built.output,'utf8');
// Only hot release-layer assets belong in this startup audit. Canon + World are RPG-only
// lazy workspace runtimes; the universal attachment parser/UX is also lazy behind a tiny hot loader.
const assetNames=['seven-final.css','beta-ui.css','research-runtime.js','performance-runtime.js','control-runtime.js','control-bridge.js','execution-bridge.js','pdf-runtime.js','motion-runtime.js','ui-runtime.js','attachment-loader.js','beta-ui-runtime.js'];
const assets=assetNames.map(name=>({name,bytes:fs.statSync(path.join(__dirname,name)).size}));
const workspaceAssets=(built.workspaceFiles||[]).map(x=>({...x,text:fs.readFileSync(path.join(ROOT,'dist',x.path),'utf8')}));
const issues=[];const warnings=[];const apkBlockers=[];
function issue(code,detail){issues.push({code,detail});}
function warn(code,detail){warnings.push({code,detail});}
function apkBlocker(code,detail){apkBlockers.push({code,detail});}

if(/\bgsk_[A-Za-z0-9_-]{16,}\b/.test(sourceHtml))issue('embedded-groq-key','source contains a value shaped like a Groq secret');
if(/\bsk-[A-Za-z0-9_-]{20,}\b/.test(sourceHtml))issue('embedded-api-key','source contains a value shaped like an API secret');
if(/(^|[^\w$])eval\s*\(/m.test(sourceHtml))issue('unsafe-dynamic-code','eval()');
if(/(^|[^\w$])new\s+Function\s*\(/m.test(sourceHtml))issue('unsafe-dynamic-code','new Function()');
if(/\bdocument\.write\s*\(/m.test(sourceHtml))issue('unsafe-dynamic-code','document.write()');
for(const a of workspaceAssets){if(/(^|[^\w$])eval\s*\(|(^|[^\w$])new\s+Function\s*\(|\bdocument\.write\s*\(/m.test(a.text))issue('unsafe-workspace-code',a.path);const remote=[...a.text.matchAll(/https?:\/\/[^\s"')]+/g)].map(m=>m[0]);if(remote.length)apkBlocker('remote-workspace-dependency',{path:a.path,urls:remote});}
const ids=[...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(m=>m[1]);
const seen=new Set(),dupes=new Set();for(const id of ids){if(seen.has(id))dupes.add(id);seen.add(id);}if(dupes.size)issue('duplicate-static-id',Array.from(dupes));
const remoteScripts=[...html.matchAll(/<script[^>]+src\s*=\s*["'](https?:\/\/[^"']+)/gi)].map(m=>m[1]);
const remoteStyles=[...html.matchAll(/<link[^>]+href\s*=\s*["'](https?:\/\/[^"']+)/gi)].map(m=>m[1]);
const remoteImports=[...html.matchAll(/\bimport\s+(?:[^;]*?\s+from\s+)?["'](https?:\/\/[^"']+)["']/gi)].map(m=>m[1]);
const allRemoteUrls=[...html.matchAll(/["'](https?:\/\/[^"']+)["']/gi)].map(m=>m[1]);
const remoteRuntimeUrls=[...new Set(allRemoteUrls.filter(url=>/pdf\.js|pdf\.worker|\/cmaps\//i.test(url)))];
if(remoteScripts.length)apkBlocker('remote-script-dependency',remoteScripts);
if(remoteImports.length)apkBlocker('remote-module-import',remoteImports);
if(remoteRuntimeUrls.length)apkBlocker('remote-pdf-runtime-assets',remoteRuntimeUrls);
if(remoteStyles.length)warn('remote-style-dependency',remoteStyles);
const intervalCount=(sourceHtml.match(/\bsetInterval\s*\(/g)||[]).length;if(intervalCount)warn('intervals-present',intervalCount);
const transitionAll=(sourceHtml.match(/transition\s*:\s*all\b/gi)||[]).length;if(transitionAll)warn('transition-all-present',transitionAll);
const layerBytes=assets.reduce((s,x)=>s+x.bytes,0)+built.themeBootBytes;if(layerBytes>100000)issue('release-layer-too-heavy',layerBytes);
for(const a of assets)if(a.bytes>50000)issue('oversized-release-asset',a);
const lazyWorkspaceBudgetBytes=160000;if(built.workspaceBytes>lazyWorkspaceBudgetBytes)issue('lazy-workspaces-too-heavy',{bytes:built.workspaceBytes,budget:lazyWorkspaceBudgetBytes});
const staticPackageBytes=built.bytes+built.pdf.bytes+built.workspaceBytes+built.attachmentRuntimeBytes;
const apkStaticBudgetBytes=8*1024*1024;
if(staticPackageBytes>apkStaticBudgetBytes)issue('apk-static-asset-budget-exceeded',{staticPackageBytes,apkStaticBudgetBytes});
if(fs.statSync(path.join(ROOT,'seven_ai-final.html')).size>900000)warn('monolith-size-high',fs.statSync(path.join(ROOT,'seven_ai-final.html')).size);
if(built.pdfLoadMode!=='lazy-local')issue('pdf-load-mode-not-lazy-local',built.pdfLoadMode);
if(built.attachmentLoadMode!=='lazy-local')issue('attachment-load-mode-not-lazy-local',built.attachmentLoadMode);
if(built.workspaceLoadMode!=='lazy-local')issue('workspace-load-mode-not-lazy-local',built.workspaceLoadMode);
const report={format:'seven-static-audit',version:15,sourceBytes:Buffer.byteLength(sourceHtml),builtHtmlBytes:built.bytes,releaseLayerBytes:layerBytes,themeBootBytes:built.themeBootBytes,pdfVendorBytes:built.pdf.bytes,pdfLoadMode:built.pdfLoadMode,attachmentRuntimeBytes:built.attachmentRuntimeBytes,attachmentLoadMode:built.attachmentLoadMode,lazyWorkspaceBytes:built.workspaceBytes,lazyWorkspaceBudgetBytes,workspaceLoadMode:built.workspaceLoadMode,workspaceFiles:workspaceAssets.map(({text,...x})=>x),staticPackageBytes,apkStaticBudgetBytes,assets,issues,warnings,apkReadiness:{ready:apkBlockers.length===0,blockers:apkBlockers}};
fs.mkdirSync(path.join(ROOT,'dist'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'dist','static-audit.json'),JSON.stringify(report,null,2));
if(warnings.length)for(const w of warnings)console.log('AUDIT WARN',w.code,JSON.stringify(w.detail));
if(apkBlockers.length)for(const b of apkBlockers)console.log('APK BLOCKER',b.code,JSON.stringify(b.detail));
assert.deepEqual(issues,[],`static audit failed: ${JSON.stringify(issues)}`);
assert.equal(apkBlockers.length,0,`APK packaging blockers remain: ${JSON.stringify(apkBlockers)}`);
console.log(`static audit: PASS (${layerBytes} hot release-layer bytes, ${built.attachmentRuntimeBytes} lazy attachment bytes, ${built.workspaceBytes} lazy workspace bytes, ${staticPackageBytes}/${apkStaticBudgetBytes} static APK bytes, lazy-local PDF/attachments/workspaces, ${warnings.length} warnings)`);