"use strict";
const crypto=require("crypto");
const VERSION="1.0.0";
const REQUIRED_CANONICAL=["--seven-g-canvas","--seven-g-surface","--seven-g-surface-raised","--seven-g-text","--seven-g-muted","--seven-g-brand","--seven-g-brand-alt"];
const REQUIRED_SURFACES=["navigation","topbar","conversation","composer"];
const REQUIRED_PRIMITIVES=["sevenOrbitThread","sevenEvidenceRail","sevenFocusHalo","sevenStateNode"];
function arr(v){return Array.isArray(v)?v:[]}
function stable(v){if(Array.isArray(v))return v.map(stable);if(v&&typeof v==="object"){const o={};for(const k of Object.keys(v).sort())if(v[k]!==undefined)o[k]=stable(v[k]);return o}return v}
function hash(v){return crypto.createHash("sha256").update(JSON.stringify(stable(v))).digest("hex")}
function shaText(v){return crypto.createHash("sha256").update(String(v)).digest("hex")}
function req(v,n){const s=String(v??"").trim();if(!s)throw new Error(`${n} required`);return s}
function source(path,content){path=req(path,"source.path");if(path.startsWith("/")||path.includes(".."))throw new Error("unsafe source path");content=String(content??"");return Object.freeze({path,bytes:Buffer.byteLength(content),sha256:shaText(content)})}
function audit({css="",betaRuntime="",uiRuntime=""}={}){
  const fail=[],warn=[],info=[];const need=(ok,id)=>(ok?info:fail).push(id);
  for(const t of REQUIRED_CANONICAL)need(css.includes(t),`token:${t}`);
  need(/\.room-item\.active:(?::)?before/.test(css)&&/inset-inline-start/.test(css),"primitive:seven-cut-logical");
  need(/\.topbar:(?::)?after/.test(css),"primitive:orbit-thread");
  need(/message\.assistant[^\n]*:(?::)?before/.test(css),"primitive:evidence-rail");
  need(/\.composer:focus-within/.test(css),"primitive:focus-halo");
  need(/\.seven-beta-status i/.test(css),"primitive:state-node");
  need(/min-width:44px/.test(css)&&/min-height:44px/.test(css),"touch:hard-44");
  need(/button\.send[^\n]*min-width:48px/.test(css)&&/button\.send[^\n]*min-height:48px/.test(css),"touch:primary-48");
  need(/prefers-reduced-motion:reduce/.test(css),"motion:reduced");
  need(/seven-tier-lite/.test(css),"performance:lite-tier");
  need(/max-width:720px/.test(css)&&/max-width:390px/.test(css),"responsive:mobile-breakpoints");
  need(!/transition\s*:\s*all\b/i.test(css),"motion:no-transition-all");
  need(!/https?:\/\//i.test(css+betaRuntime+uiRuntime),"network:no-external-ui-assets");
  need(betaRuntime.includes("sevenGlobalUi='v1'")||betaRuntime.includes('sevenGlobalUi="v1"')||betaRuntime.includes("sevenGlobalUi='v1'"),"runtime:global-ui-marker");
  for(const s of REQUIRED_SURFACES)need(betaRuntime.includes(`'${s}'`),`surface:${s}`);
  for(const p of REQUIRED_PRIMITIVES)need(betaRuntime.includes(p),`runtime:${p}`);
  need(betaRuntime.includes("Q('Seven navigation','التنقل')")&&betaRuntime.includes("Q('Message composer','رسالة')"),"a11y:landmark-labels");
  need(betaRuntime.includes("Open workspaces"),"zero-manual:workspace-discovery");
  if(/\bleft\s*:/.test(css))warn.push("physical-left-remains");
  if(/\bright\s*:/.test(css))warn.push("physical-right-remains");
  const result={schema:"seven.global-ui-audit.v1",version:VERSION,status:fail.length?"FAIL":warn.length?"WARN":"PASS",fail:[...new Set(fail)].sort(),warn:[...new Set(warn)].sort(),info:[...new Set(info)].sort()};return Object.freeze({...result,auditHash:hash(result)});
}
function verifyAudit(a){if(!a?.auditHash||a.schema!=="seven.global-ui-audit.v1")return false;const body={...a};delete body.auditHash;return a.auditHash===hash(body)}
function createManifest(input={}){
  const branch=req(input.branch,"branch"),commitSha=req(input.commitSha,"commitSha");if(!/^[0-9a-f]{40}$/i.test(commitSha))throw new Error("commitSha invalid");
  const seen=new Set(),sources=[];for(const x of arr(input.sources)){const s=source(x.path,x.content);if(seen.has(s.path))throw new Error("duplicate source path");seen.add(s.path);sources.push(s)}
  if(!sources.length)throw new Error("sources required");const a=input.audit;if(!verifyAudit(a))throw new Error("verified audit required");
  const body={schema:"seven.global-ui-manifest.v1",version:VERSION,branch,commitSha:commitSha.toLowerCase(),sources:sources.sort((a,b)=>a.path.localeCompare(b.path)),auditHash:a.auditHash,status:a.status};return Object.freeze({...body,manifestHash:hash(body)});
}
function verifyManifest(m){if(!m?.manifestHash||m.schema!=="seven.global-ui-manifest.v1")return false;const body={...m};delete body.manifestHash;return m.manifestHash===hash(body)}
function createFoundationReceipt(input={}){
  const manifest=input.manifest;if(!verifyManifest(manifest))throw new Error("verified manifest required");if(manifest.status==="FAIL")throw new Error("failing global UI cannot promote");
  const startupBytes=Number(input.startupBytes),startupCap=Number(input.startupCap??100000);if(!Number.isFinite(startupBytes)||!Number.isFinite(startupCap)||startupBytes>startupCap)throw new Error("startup budget exceeded");
  const protectedBlob=req(input.protectedBlob,"protectedBlob");if(!/^[0-9a-f]{40}$/i.test(protectedBlob))throw new Error("protectedBlob invalid");
  const visual={scenarios:Number(input.visual?.scenarios??0),pass:Number(input.visual?.pass??0),warn:Number(input.visual?.warn??0),fail:Number(input.visual?.fail??0),tier:req(input.visual?.tier,"visual.tier"),mode:req(input.visual?.mode,"visual.mode")};
  if(visual.scenarios<1||visual.pass!==visual.scenarios||visual.warn||visual.fail)throw new Error("visual host matrix must be all-pass");if(visual.tier!=="HOST")throw new Error("foundation requires HOST evidence, not relabeled tier");
  const body={schema:"seven.global-ui-foundation-receipt.v1",version:VERSION,manifestHash:manifest.manifestHash,branch:manifest.branch,commitSha:manifest.commitSha,startupBytes,startupCap,protectedBlob:protectedBlob.toLowerCase(),visual,claim:"HOST_FOUNDATION_ONLY"};return Object.freeze({...body,receiptHash:hash(body)});
}
function verifyFoundationReceipt(r){if(!r?.receiptHash||r.schema!=="seven.global-ui-foundation-receipt.v1")return false;const body={...r};delete body.receiptHash;return r.receiptHash===hash(body)&&r.claim==="HOST_FOUNDATION_ONLY"&&r.visual?.tier==="HOST"}
module.exports=Object.freeze({VERSION,REQUIRED_CANONICAL,REQUIRED_SURFACES,REQUIRED_PRIMITIVES,hash,shaText,source,audit,verifyAudit,createManifest,verifyManifest,createFoundationReceipt,verifyFoundationReceipt});
