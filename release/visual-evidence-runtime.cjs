"use strict";

const crypto=require("crypto");

const VERSION="1.0.0";
const VERDICT=Object.freeze({PASS:"PASS",WARN:"WARN",FAIL:"FAIL",INCONCLUSIVE:"INCONCLUSIVE"});
const EVIDENCE_TIER=Object.freeze({SIMULATED:"SIMULATED",HOST:"HOST",EMULATOR:"EMULATOR",PHYSICAL_DEVICE:"PHYSICAL_DEVICE",REPRESENTATIVE_DEVICE:"REPRESENTATIVE_DEVICE",RELEASE_BUILD_DEVICE:"RELEASE_BUILD_DEVICE"});

function arr(v){return Array.isArray(v)?v:[]}
function req(v,name){const s=String(v??"").trim();if(!s)throw new Error(`${name} required`);return s}
function finite(v,name){const n=Number(v);if(!Number.isFinite(n))throw new Error(`${name} must be finite`);return n}
function stable(v){if(Array.isArray(v))return v.map(stable);if(v&&typeof v==="object"){const o={};for(const k of Object.keys(v).sort())if(v[k]!==undefined)o[k]=stable(v[k]);return o}return v}
function hash(v){return crypto.createHash("sha256").update(JSON.stringify(stable(v))).digest("hex")}
function freeze(v){return Object.freeze(v)}
function clone(v){return v==null?v:JSON.parse(JSON.stringify(v))}
function uniqueStrings(v){return [...new Set(arr(v).map(x=>String(x).trim()).filter(Boolean))].sort()}

function scenarioBody(s){return {id:s.id,surface:s.surface,journey:s.journey,state:s.state,viewport:s.viewport,density:s.density,fontScale:s.fontScale,locale:s.locale,direction:s.direction,theme:s.theme,performanceTier:s.performanceTier,reducedMotion:s.reducedMotion,captureMethod:s.captureMethod,expectedSelectors:s.expectedSelectors,criticalSelectors:s.criticalSelectors,tags:s.tags}}
function createScenario(input={}){
  const viewport={width:finite(input.viewport?.width,"viewport.width"),height:finite(input.viewport?.height,"viewport.height")};
  if(viewport.width<240||viewport.height<320)throw new Error("viewport too small for supported visual evidence scenario");
  const direction=String(input.direction||"ltr").toLowerCase();if(!["ltr","rtl"].includes(direction))throw new Error("direction invalid");
  const theme=String(input.theme||"night").toLowerCase();if(!["day","night","system"].includes(theme))throw new Error("theme invalid");
  const s={version:VERSION,id:req(input.id,"scenario.id"),surface:req(input.surface,"scenario.surface"),journey:String(input.journey||"default"),state:String(input.state||"idle"),viewport,density:finite(input.density??1,"density"),fontScale:finite(input.fontScale??1,"fontScale"),locale:String(input.locale||"en"),direction,theme,performanceTier:String(input.performanceTier||"standard"),reducedMotion:input.reducedMotion===true,captureMethod:String(input.captureMethod||"playwright-host"),expectedSelectors:uniqueStrings(input.expectedSelectors),criticalSelectors:uniqueStrings(input.criticalSelectors),tags:uniqueStrings(input.tags)};
  return freeze({...s,scenarioHash:hash(scenarioBody(s))});
}
function verifyScenario(s){try{return !!s?.scenarioHash&&s.scenarioHash===hash(scenarioBody(s))}catch{return false}}

function createArtifact(scenario,input={}){
  if(!verifyScenario(scenario))throw new Error("valid scenario required");
  const sha=req(input.sha256,"artifact.sha256").toLowerCase();if(!/^[0-9a-f]{64}$/.test(sha))throw new Error("artifact sha256 invalid");
  const a={scenarioId:scenario.id,scenarioHash:scenario.scenarioHash,path:req(input.path,"artifact.path"),sha256:sha,byteSize:finite(input.byteSize,"artifact.byteSize"),width:finite(input.width??scenario.viewport.width,"artifact.width"),height:finite(input.height??scenario.viewport.height,"artifact.height"),captureMethod:String(input.captureMethod||scenario.captureMethod),sourceRef:String(input.sourceRef||"")};
  if(a.byteSize<=0||a.width<=0||a.height<=0)throw new Error("artifact dimensions/size invalid");
  return freeze({...a,artifactHash:hash(a)});
}
function verifyArtifact(a,scenario){if(!a?.artifactHash||!verifyScenario(scenario)||a.scenarioHash!==scenario.scenarioHash)return false;const body={...a};delete body.artifactHash;return a.artifactHash===hash(body)}

function result(kind,status,issues=[],metrics={}){return freeze({kind,status,issues:uniqueStrings(issues),metrics:clone(metrics),auditHash:hash({kind,status,issues:uniqueStrings(issues),metrics:clone(metrics)})})}
function auditViewport(input={}){
  const scrollWidth=finite(input.scrollWidth,"scrollWidth"),clientWidth=finite(input.clientWidth,"clientWidth"),scrollHeight=finite(input.scrollHeight??0,"scrollHeight"),clientHeight=finite(input.clientHeight??0,"clientHeight");
  const overflow=Math.max(0,scrollWidth-clientWidth),issues=[];if(overflow>2)issues.push(`horizontal-overflow:${overflow.toFixed(2)}`);
  return result("VIEWPORT",issues.length?VERDICT.FAIL:VERDICT.PASS,issues,{scrollWidth,clientWidth,scrollHeight,clientHeight,horizontalOverflow:overflow});
}
function auditTouchTargets(targets,opts={}){
  const preferred=finite(opts.preferredMin??44,"preferredMin"),hard=finite(opts.hardMin??24,"hardMin");if(hard>preferred)throw new Error("hardMin cannot exceed preferredMin");
  const hardIssues=[],warnIssues=[];let checked=0;
  for(const t of arr(targets)){if(t?.visible===false||t?.disabled===true)continue;const w=Number(t?.width),h=Number(t?.height);if(!Number.isFinite(w)||!Number.isFinite(h))continue;checked++;const id=String(t.selector||t.id||`target-${checked}`);if(w<hard||h<hard)hardIssues.push(`touch-target-hard:${id}:${w.toFixed(1)}x${h.toFixed(1)}`);else if(w<preferred||h<preferred)warnIssues.push(`touch-target-preferred:${id}:${w.toFixed(1)}x${h.toFixed(1)}`)}
  const status=hardIssues.length?VERDICT.FAIL:warnIssues.length?VERDICT.WARN:VERDICT.PASS;return result("TOUCH_TARGETS",status,[...hardIssues,...warnIssues],{checked,preferredMin:preferred,hardMin:hard,hardFailures:hardIssues.length,warnings:warnIssues.length});
}
function auditAccessibility(targets){const issues=[];let checked=0;for(const t of arr(targets)){if(t?.visible===false||t?.disabled===true)continue;checked++;const id=String(t.selector||t.id||`target-${checked}`);if(t.interactive!==false&&!String(t.accessibleName||"").trim())issues.push(`missing-accessible-name:${id}`);if(t.interactive!==false&&t.focusable===false)issues.push(`not-focusable:${id}`)}return result("ACCESSIBILITY",issues.length?VERDICT.FAIL:VERDICT.PASS,issues,{checked,issues:issues.length})}
function color(v){const s=String(v||"").trim().toLowerCase();let m=s.match(/^#([0-9a-f]{6})$/);if(m)return [0,2,4].map(i=>parseInt(m[1].slice(i,i+2),16));m=s.match(/^rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)(?:\s*,\s*([\d.]+))?\s*\)$/);if(m){if(m[4]!=null&&Number(m[4])<0.999)throw new Error("translucent colors require resolved composited color");return [Number(m[1]),Number(m[2]),Number(m[3])]}throw new Error(`unsupported color:${s}`)}
function lum(v){return color(v).map(c=>{const x=c/255;return x<=0.04045?x/12.92:Math.pow((x+0.055)/1.055,2.4)}).reduce((a,c,i)=>a+c*[0.2126,0.7152,0.0722][i],0)}
function contrastRatio(fg,bg){const a=lum(fg),b=lum(bg);return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05)}
function auditContrast(samples){const issues=[],rows=[];for(const s of arr(samples)){const ratio=contrastRatio(s.fg,s.bg),min=Number(s.min??4.5),id=String(s.id||`sample-${rows.length+1}`);rows.push({id,ratio,min});if(ratio+1e-9<min)issues.push(`contrast:${id}:${ratio.toFixed(2)}<${min}`)}return result("CONTRAST",issues.length?VERDICT.FAIL:VERDICT.PASS,issues,{samples:rows})}
function auditState(scenario,input={}){if(!verifyScenario(scenario))throw new Error("valid scenario required");const present=new Set(uniqueStrings(input.presentSelectors)),issues=[];for(const x of scenario.criticalSelectors)if(!present.has(x))issues.push(`critical-selector-missing:${x}`);if(String(input.direction||scenario.direction)!==scenario.direction)issues.push(`direction-mismatch:${input.direction}`);if(input.reducedMotion!=null&&Boolean(input.reducedMotion)!==scenario.reducedMotion)issues.push("reduced-motion-mismatch");return result("STATE",issues.length?VERDICT.FAIL:VERDICT.PASS,issues,{presentSelectors:[...present].sort(),direction:String(input.direction||scenario.direction),reducedMotion:Boolean(input.reducedMotion??scenario.reducedMotion)})}
function verdict(audits){const a=arr(audits);if(!a.length)return VERDICT.INCONCLUSIVE;if(a.some(x=>x.status===VERDICT.FAIL))return VERDICT.FAIL;if(a.some(x=>x.status===VERDICT.WARN||x.status===VERDICT.INCONCLUSIVE))return VERDICT.WARN;return VERDICT.PASS}
function createEvidence(scenario,artifact,input={}){if(!verifyScenario(scenario)||!verifyArtifact(artifact,scenario))throw new Error("verified scenario/artifact required");const audits=arr(input.audits).map(clone),status=verdict(audits),e={schema:"seven.visual-evidence.v1",tier:String(input.tier||EVIDENCE_TIER.HOST),scenarioId:scenario.id,scenarioHash:scenario.scenarioHash,artifactHash:artifact.artifactHash,artifactSha256:artifact.sha256,commitSha:req(input.commitSha,"evidence.commitSha"),branch:req(input.branch,"evidence.branch"),audits,status,policy:String(input.policy||"OBSERVE"),notes:uniqueStrings(input.notes)};return freeze({...e,evidenceHash:hash(e)})}
function verifyEvidence(e,scenario,artifact){if(!e?.evidenceHash||!verifyScenario(scenario)||!verifyArtifact(artifact,scenario)||e.scenarioHash!==scenario.scenarioHash||e.artifactHash!==artifact.artifactHash)return false;const body={...e};delete body.evidenceHash;return e.evidenceHash===hash(body)&&e.status===verdict(e.audits)}

function createBaselineRegistry(input={}){const r={schema:"seven.visual-baselines.v1",id:String(input.id||"default"),revision:0,entries:{},history:[]};return freeze({...r,registryHash:hash(r)})}
function verifyRegistry(r){if(!r?.registryHash)return false;const body={...r};delete body.registryHash;return r.registryHash===hash(body)}
function approveBaseline(registry,scenario,artifact,evidence,approval={}){if(!verifyRegistry(registry)||!verifyEvidence(evidence,scenario,artifact))throw new Error("verified registry/evidence required");if(evidence.status===VERDICT.FAIL)throw new Error("failing evidence cannot become baseline");const reviewer=req(approval.reviewer,"approval.reviewer"),reason=req(approval.reason,"approval.reason"),approvalRef=req(approval.approvalRef,"approval.approvalRef");const entry={scenarioId:scenario.id,scenarioHash:scenario.scenarioHash,artifactHash:artifact.artifactHash,artifactSha256:artifact.sha256,evidenceHash:evidence.evidenceHash,reviewer,reason,approvalRef};const entries={...registry.entries,[scenario.id]:entry},history=[...registry.history,{revision:registry.revision+1,...entry}],body={schema:registry.schema,id:registry.id,revision:registry.revision+1,entries,history};return freeze({...body,registryHash:hash(body)})}
function compareBaseline(registry,scenario,artifact){if(!verifyRegistry(registry)||!verifyScenario(scenario)||!verifyArtifact(artifact,scenario))throw new Error("verified inputs required");const b=registry.entries[scenario.id];if(!b)return freeze({status:"NO_BASELINE",reviewRequired:true});if(b.scenarioHash!==scenario.scenarioHash)return freeze({status:"SCENARIO_CHANGED",reviewRequired:true,baseline:b});if(b.artifactSha256===artifact.sha256)return freeze({status:"MATCH",reviewRequired:false,baseline:b});return freeze({status:"CHANGED",reviewRequired:true,baseline:b,candidateSha256:artifact.sha256})}

function createManifest(input={}){const scenarios=arr(input.scenarios),artifacts=arr(input.artifacts),evidence=arr(input.evidence);for(const s of scenarios)if(!verifyScenario(s))throw new Error("invalid scenario in manifest");const sm=new Map(scenarios.map(s=>[s.id,s]));for(const a of artifacts){const s=sm.get(a.scenarioId);if(!s||!verifyArtifact(a,s))throw new Error("invalid artifact in manifest")}const am=new Map(artifacts.map(a=>[a.artifactHash,a]));for(const e of evidence){const s=sm.get(e.scenarioId),a=am.get(e.artifactHash);if(!s||!a||!verifyEvidence(e,s,a))throw new Error("invalid evidence in manifest")}const m={schema:"seven.visual-evidence-manifest.v1",runtimeVersion:VERSION,branch:req(input.branch,"manifest.branch"),commitSha:req(input.commitSha,"manifest.commitSha"),mode:String(input.mode||"OBSERVE"),scenarios:scenarios.map(clone),artifacts:artifacts.map(clone),evidence:evidence.map(clone),summary:{count:evidence.length,pass:evidence.filter(x=>x.status===VERDICT.PASS).length,warn:evidence.filter(x=>x.status===VERDICT.WARN).length,fail:evidence.filter(x=>x.status===VERDICT.FAIL).length,inconclusive:evidence.filter(x=>x.status===VERDICT.INCONCLUSIVE).length}};return freeze({...m,manifestHash:hash(m)})}
function verifyManifest(m){try{if(!m?.manifestHash)return false;const body={...m};delete body.manifestHash;if(m.manifestHash!==hash(body))return false;return createManifest(body).manifestHash===m.manifestHash}catch{return false}}

module.exports=Object.freeze({VERSION,VERDICT,EVIDENCE_TIER,hash,createScenario,verifyScenario,createArtifact,verifyArtifact,auditViewport,auditTouchTargets,auditAccessibility,contrastRatio,auditContrast,auditState,verdict,createEvidence,verifyEvidence,createBaselineRegistry,verifyRegistry,approveBaseline,compareBaseline,createManifest,verifyManifest});
