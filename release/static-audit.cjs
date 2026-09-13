const fs=require('fs');
const path=require('path');
const assert=require('assert/strict');
const ROOT=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(ROOT,'seven_ai-final.html'),'utf8');
const assetNames=['seven-final.css','canon-simulator.js','performance-runtime.js','motion-runtime.js'];
const assets=assetNames.map(name=>({name,bytes:fs.statSync(path.join(__dirname,name)).size}));
const issues=[];const warnings=[];const apkBlockers=[];
function issue(code,detail){issues.push({code,detail});}
function warn(code,detail){warnings.push({code,detail});}
function apkBlocker(code,detail){apkBlockers.push({code,detail});}

if(/\bgsk_[A-Za-z0-9_-]{16,}\b/.test(html))issue('embedded-groq-key','source contains a value shaped like a Groq secret');
if(/\bsk-[A-Za-z0-9_-]{20,}\b/.test(html))issue('embedded-api-key','source contains a value shaped like an API secret');
if(/(^|[^\w$])eval\s*\(/m.test(html))issue('unsafe-dynamic-code','eval()');
if(/(^|[^\w$])new\s+Function\s*\(/m.test(html))issue('unsafe-dynamic-code','new Function()');
if(/\bdocument\.write\s*\(/m.test(html))issue('unsafe-dynamic-code','document.write()');
const ids=[...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(m=>m[1]);
const seen=new Set(),dupes=new Set();for(const id of ids){if(seen.has(id))dupes.add(id);seen.add(id);}if(dupes.size)issue('duplicate-static-id',Array.from(dupes));
const remoteScripts=[...html.matchAll(/<script[^>]+src\s*=\s*["'](https?:\/\/[^"']+)/gi)].map(m=>m[1]);
const remoteStyles=[...html.matchAll(/<link[^>]+href\s*=\s*["'](https?:\/\/[^"']+)/gi)].map(m=>m[1]);
const remoteImports=[...html.matchAll(/\bimport\s+(?:[^;]*?\s+from\s+)?["'](https?:\/\/[^"']+)["']/gi)].map(m=>m[1]);
const allRemoteUrls=[...html.matchAll(/["'](https?:\/\/[^"']+)["']/gi)].map(m=>m[1]);
const remoteRuntimeUrls=[...new Set(allRemoteUrls.filter(url=>/pdf\.js|pdf\.worker|\/cmaps\//i.test(url)))];
if(remoteScripts.length)apkBlocker('remote-script-dependency',remoteScripts);
if(remoteStyles.length)warn('remote-style-dependency',remoteStyles);
if(remoteImports.length)apkBlocker('remote-module-import',remoteImports);
if(remoteRuntimeUrls.length)apkBlocker('remote-pdf-runtime-assets',remoteRuntimeUrls);
const intervalCount=(html.match(/\bsetInterval\s*\(/g)||[]).length;if(intervalCount)warn('intervals-present',intervalCount);
const transitionAll=(html.match(/transition\s*:\s*all\b/gi)||[]).length;if(transitionAll)warn('transition-all-present',transitionAll);
const layerBytes=assets.reduce((s,x)=>s+x.bytes,0);if(layerBytes>100000)issue('release-layer-too-heavy',layerBytes);
for(const a of assets)if(a.bytes>50000)issue('oversized-release-asset',a);
if(fs.statSync(path.join(ROOT,'seven_ai-final.html')).size>900000)warn('monolith-size-high',fs.statSync(path.join(ROOT,'seven_ai-final.html')).size);
const report={format:'seven-static-audit',version:2,sourceBytes:Buffer.byteLength(html),releaseLayerBytes:layerBytes,assets,issues,warnings,apkReadiness:{ready:apkBlockers.length===0,blockers:apkBlockers}};
fs.mkdirSync(path.join(ROOT,'dist'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'dist','static-audit.json'),JSON.stringify(report,null,2));
if(warnings.length)for(const w of warnings)console.log('AUDIT WARN',w.code,JSON.stringify(w.detail));
if(apkBlockers.length)for(const b of apkBlockers)console.log('APK BLOCKER',b.code,JSON.stringify(b.detail));
assert.deepEqual(issues,[],`static audit failed: ${JSON.stringify(issues)}`);
console.log(`static audit: PASS (${layerBytes} release bytes, ${warnings.length} warnings, ${apkBlockers.length} APK blockers)`);
