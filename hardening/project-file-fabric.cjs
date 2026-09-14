"use strict";

const crypto = require("crypto");

const TX_STATES = Object.freeze([
  "CREATED", "BASELINE_CAPTURED", "STAGING", "STAGED", "VALIDATING", "AUTHORIZED",
  "COMMITTING", "COMMITTED", "VERIFYING", "VERIFIED", "CONFLICTED", "ROLLING_BACK",
  "ROLLED_BACK", "UNCERTAIN", "FAILED"
]);
const MUTATION_OPS = Object.freeze(["CREATE", "PATCH", "REPLACE", "DELETE", "RENAME"]);
const WRITE_ACTIONS = Object.freeze(["CREATE", "PATCH", "REPLACE", "DELETE", "RENAME"]);

function text(v){ return typeof v === "string" ? v.trim() : ""; }
function stable(v){
  if(Array.isArray(v)) return v.map(stable);
  if(v && typeof v === "object"){
    const out = {};
    for(const k of Object.keys(v).sort()) if(v[k] !== undefined) out[k] = stable(v[k]);
    return out;
  }
  return v;
}
function hash(v){ return crypto.createHash("sha256").update(typeof v === "string" ? v : JSON.stringify(stable(v))).digest("hex"); }
function uniq(v){ return [...new Set((Array.isArray(v) ? v : []).map(text).filter(Boolean))].sort(); }
function freeze(v){ return Object.freeze(v); }
function clone(v){ return v == null ? v : JSON.parse(JSON.stringify(v)); }
function nowMs(v){ if(v == null) return Date.now(); const n = typeof v === "number" ? v : Date.parse(v); if(!Number.isFinite(n)) throw new Error("invalid time"); return n; }

function normalizeProjectPath(input,{allowRoot=false,caseSensitive=true,unicodeNormalization="NFC"}={}){
  if(typeof input !== "string") throw new Error("path must be string");
  if(input.includes("\0")) throw new Error("path contains NUL");
  let p = input.normalize(unicodeNormalization || "NFC").replace(/\\/g,"/").trim();
  if(/^([a-zA-Z]:\/|\/|[a-zA-Z][a-zA-Z0-9+.-]*:\/\/)/.test(p)) throw new Error("absolute or external path forbidden");
  const out=[];
  for(const seg of p.split("/")){
    if(!seg || seg === ".") continue;
    if(seg === "..") throw new Error("path escapes project root");
    if(seg.includes("\0")) throw new Error("invalid path segment");
    out.push(seg);
  }
  p=out.join("/");
  if(!p && !allowRoot) throw new Error("empty file path");
  return caseSensitive ? p : p.toLocaleLowerCase("en-US");
}

function createBackendCapabilityProfile(input={}){
  const backendId=text(input.backendId); if(!backendId) throw new Error("backendId required");
  const body={schemaVersion:1,backendId,backendKind:text(input.backendKind)||"GENERIC",readOnly:input.readOnly===true,
    rangeRead:input.rangeRead!==false,atomicSingleWrite:input.atomicSingleWrite!==false,atomicMultiWrite:input.atomicMultiWrite===true,
    atomicRename:input.atomicRename===true,trash:input.trash===true,checkpoints:input.checkpoints===true,
    nativeVersionTokens:input.nativeVersionTokens===true,symlinkPolicy:String(input.symlinkPolicy||"DENY").toUpperCase()};
  return freeze({...body,id:`backend-${hash(body).slice(0,24)}`});
}

function createProjectRoot(input={}){
  const rootId=text(input.rootId),backendId=text(input.backendId); if(!rootId||!backendId) throw new Error("rootId/backendId required");
  const body={schemaVersion:1,rootId,backendId,backendRootRef:text(input.backendRootRef)||rootId,
    caseSensitive:input.caseSensitive!==false,unicodeNormalization:text(input.unicodeNormalization)||"NFC",
    policyHash:text(input.policyHash)||null,grantEpoch:Number.isInteger(input.grantEpoch)?input.grantEpoch:0};
  return freeze({...body,id:`project-root-${hash(body).slice(0,24)}`});
}

function normalizePrefixes(prefixes,root){
  const rows=(Array.isArray(prefixes)&&prefixes.length?prefixes:[""]).map(p=>normalizeProjectPath(String(p),{allowRoot:true,caseSensitive:root.caseSensitive,unicodeNormalization:root.unicodeNormalization}));
  return [...new Set(rows)].sort();
}
function createProjectGrant(input={}){
  const grantId=text(input.grantId),principalId=text(input.principalId),projectRootId=text(input.projectRootId);
  if(!grantId||!principalId||!projectRootId) throw new Error("grant identity incomplete");
  const actions=uniq(input.actions).map(x=>x.toUpperCase()); if(!actions.length) throw new Error("grant actions required");
  for(const a of actions) if(!["READ","LIST","CREATE","PATCH","REPLACE","DELETE","RENAME","EXECUTE"].includes(a)) throw new Error(`unknown grant action:${a}`);
  const prefixes=uniq(input.prefixes && input.prefixes.length ? input.prefixes : [""]);
  const body={schemaVersion:1,grantId,principalId,projectRootId,actions,prefixes,epoch:Number.isInteger(input.epoch)?input.epoch:0,
    policyEpoch:Number.isInteger(input.policyEpoch)?input.policyEpoch:0,expiresAt:input.expiresAt==null?null:nowMs(input.expiresAt),revoked:input.revoked===true,
    sourceEventId:text(input.sourceEventId)||null};
  if(!body.sourceEventId) throw new Error("grant authoritative source event required");
  return freeze({...body,id:`project-grant-${hash(body).slice(0,24)}`});
}
function pathWithinPrefix(path,prefix){ return prefix==="" || path===prefix || path.startsWith(prefix+"/"); }
function grantAllows({grant,root,principalId,action,path,now=Date.now(),currentGrantEpoch=null,currentPolicyEpoch=null}={}){
  const reasons=[];
  if(!grant||!root) return {allowed:false,reasons:["grant-or-root-missing"]};
  if(grant.revoked) reasons.push("grant-revoked");
  if(grant.projectRootId!==root.id && grant.projectRootId!==root.rootId) reasons.push("grant-root-mismatch");
  if(grant.principalId!==principalId) reasons.push("grant-principal-mismatch");
  if(grant.expiresAt!=null && now>grant.expiresAt) reasons.push("grant-expired");
  if(currentGrantEpoch!=null && grant.epoch!==currentGrantEpoch) reasons.push("grant-epoch-stale");
  if(currentPolicyEpoch!=null && grant.policyEpoch!==currentPolicyEpoch) reasons.push("policy-epoch-stale");
  const a=String(action||"").toUpperCase(); if(!grant.actions.includes(a)) reasons.push(`action-not-granted:${a}`);
  let p; try{ p=normalizeProjectPath(path,{allowRoot:a==="LIST",caseSensitive:root.caseSensitive,unicodeNormalization:root.unicodeNormalization}); }catch(e){ reasons.push(`path-invalid:${e.message}`); }
  if(p!=null){
    let prefixes=[]; try{ prefixes=normalizePrefixes(grant.prefixes,root); }catch(e){ reasons.push("grant-prefix-invalid"); }
    if(!prefixes.some(prefix=>pathWithinPrefix(p,prefix))) reasons.push("path-outside-grant");
  }
  return {allowed:reasons.length===0,reasons,path:p};
}

function createFileRef({root,path,backendObjectId=null}={}){
  if(!root||!root.id) throw new Error("project root required");
  const canonicalPath=normalizeProjectPath(path,{caseSensitive:root.caseSensitive,unicodeNormalization:root.unicodeNormalization});
  const body={schemaVersion:1,projectRootId:root.id,backendId:root.backendId,path:canonicalPath,backendObjectId:text(backendObjectId)||null};
  return freeze({...body,id:`file-ref-${hash(body).slice(0,24)}`});
}
function createFileVersionToken({fileRef,contentHash,size,backendVersion=null,modifiedAt=null}={}){
  if(!fileRef||!fileRef.id||!text(contentHash)) throw new Error("fileRef/contentHash required");
  const n=Number(size); if(!Number.isInteger(n)||n<0) throw new Error("invalid file size");
  const body={schemaVersion:1,fileRefId:fileRef.id,path:fileRef.path,contentHash:text(contentHash),size:n,
    backendVersion:text(backendVersion)||null,modifiedAt:modifiedAt==null?null:nowMs(modifiedAt)};
  return freeze({...body,id:`file-version-${hash(body).slice(0,24)}`});
}
function createFileSnapshot({fileRef,versionToken,encoding="utf-8",eol="LF",byteRange=null,contentHash=null}={}){
  if(!fileRef||!versionToken||versionToken.fileRefId!==fileRef.id) throw new Error("snapshot file/version mismatch");
  const body={schemaVersion:1,fileRefId:fileRef.id,versionTokenId:versionToken.id,encoding:text(encoding)||"utf-8",eol:String(eol||"LF").toUpperCase(),
    byteRange:byteRange?{start:Number(byteRange.start),end:Number(byteRange.end)}:null,contentHash:text(contentHash)||versionToken.contentHash};
  if(body.byteRange && (!Number.isInteger(body.byteRange.start)||!Number.isInteger(body.byteRange.end)||body.byteRange.start<0||body.byteRange.end<body.byteRange.start)) throw new Error("invalid byte range");
  return freeze({...body,id:`file-snapshot-${hash(body).slice(0,24)}`});
}

function createProtectedPathPolicy({root,policyId,revision,protectedPrefixes=[],allowedActions=["READ","LIST"],policyHash=null}={}){
  if(!root||!text(policyId)||!text(revision)) throw new Error("protected policy identity incomplete");
  const body={schemaVersion:1,policyId:text(policyId),revision:text(revision),projectRootId:root.id,
    protectedPrefixes:normalizePrefixes(protectedPrefixes,root),allowedActions:uniq(allowedActions).map(x=>x.toUpperCase()),policyHash:text(policyHash)||null};
  return freeze({...body,id:`protected-policy-${hash(body).slice(0,24)}`});
}
function protectedPathDecision({policy,root,action,path}={}){
  if(!policy) return {allowed:true,reasons:[]};
  const p=normalizeProjectPath(path,{caseSensitive:root.caseSensitive,unicodeNormalization:root.unicodeNormalization}),a=String(action||"").toUpperCase();
  const protectedHit=policy.protectedPrefixes.some(prefix=>pathWithinPrefix(p,prefix));
  if(!protectedHit) return {allowed:true,reasons:[]};
  return {allowed:policy.allowedActions.includes(a),reasons:policy.allowedActions.includes(a)?[]:[`protected-path:${p}`]};
}

function createProjectMap({root,manifestHash,entries=[],generatedAt=null}={}){
  if(!root||!text(manifestHash)) throw new Error("root/manifestHash required");
  const normalized=(entries||[]).map(e=>({path:normalizeProjectPath(e.path,{caseSensitive:root.caseSensitive,unicodeNormalization:root.unicodeNormalization}),kind:text(e.kind)||"file",versionTokenId:text(e.versionTokenId)||null})).sort((a,b)=>a.path.localeCompare(b.path));
  const body={schemaVersion:1,projectRootId:root.id,manifestHash:text(manifestHash),entries:normalized,generatedAt:generatedAt==null?null:nowMs(generatedAt)};
  return freeze({...body,id:`project-map-${hash(body).slice(0,24)}`});
}
function validateProjectMapForMutation({projectMap,currentManifestHash}={}){
  if(!projectMap||!text(currentManifestHash)) return {valid:false,reasons:["project-map-or-current-manifest-missing"]};
  return projectMap.manifestHash===currentManifestHash?{valid:true,reasons:[]}:{valid:false,reasons:["project-map-stale"]};
}

function createMutation(input={}){
  const op=String(input.op||"").toUpperCase(); if(!MUTATION_OPS.includes(op)) throw new Error("invalid mutation op");
  const path=text(input.path); if(!path) throw new Error("mutation path required");
  const body={schemaVersion:1,op,path,newPath:text(input.newPath)||null,expectedVersionTokenId:text(input.expectedVersionTokenId)||null,
    contentHash:text(input.contentHash)||null,patchHash:text(input.patchHash)||null,encoding:text(input.encoding)||null,eol:text(input.eol)||null,reason:text(input.reason)||null};
  if(op==="CREATE" && !body.contentHash) throw new Error("CREATE contentHash required");
  if(["PATCH","REPLACE"].includes(op) && !(body.patchHash||body.contentHash)) throw new Error(`${op} patch/content hash required`);
  if(["PATCH","REPLACE","DELETE","RENAME"].includes(op) && !body.expectedVersionTokenId) throw new Error(`${op} expected version required`);
  if(op==="RENAME" && !body.newPath) throw new Error("RENAME destination required");
  return freeze({...body,id:`mutation-${hash(body).slice(0,24)}`});
}

function canonicalizeMutation(m,root){
  const path=normalizeProjectPath(m.path,{caseSensitive:root.caseSensitive,unicodeNormalization:root.unicodeNormalization});
  const newPath=m.newPath?normalizeProjectPath(m.newPath,{caseSensitive:root.caseSensitive,unicodeNormalization:root.unicodeNormalization}):null;
  const body={...m,path,newPath}; delete body.id;
  return freeze({...body,id:`mutation-${hash(body).slice(0,24)}`});
}
function createProjectTransaction({root,grant,principalId,baselineManifestHash,intentId,projectMapId=null,mutations=[]}={}){
  if(!root||!grant||!text(principalId)||!text(baselineManifestHash)||!text(intentId)) throw new Error("transaction identity incomplete");
  const rows=mutations.map(m=>canonicalizeMutation(m.id?m:createMutation(m),root));
  const body={schemaVersion:1,projectRootId:root.id,grantId:grant.id,principalId:text(principalId),baselineManifestHash:text(baselineManifestHash),intentId:text(intentId),projectMapId:text(projectMapId)||null,mutations:rows,state:"CREATED",validationReceipt:null,authorizationReceipt:null,commitReceipt:null,verificationReceipt:null,rollbackReceipt:null,history:["CREATED"]};
  return freeze({...body,id:`project-tx-${hash({...body,history:undefined}).slice(0,24)}`});
}
function transition(tx,next,patch={}){
  if(!TX_STATES.includes(next)) throw new Error("invalid transaction state");
  const legal={CREATED:["BASELINE_CAPTURED","FAILED"],BASELINE_CAPTURED:["STAGING","FAILED"],STAGING:["STAGED","FAILED"],STAGED:["VALIDATING","FAILED"],VALIDATING:["AUTHORIZED","CONFLICTED","FAILED"],AUTHORIZED:["COMMITTING","FAILED"],COMMITTING:["COMMITTED","UNCERTAIN","FAILED"],COMMITTED:["VERIFYING","ROLLING_BACK","UNCERTAIN"],VERIFYING:["VERIFIED","ROLLING_BACK","UNCERTAIN","FAILED"],ROLLING_BACK:["ROLLED_BACK","UNCERTAIN","FAILED"]};
  if(!(legal[tx.state]||[]).includes(next)) throw new Error(`illegal transaction transition:${tx.state}->${next}`);
  return freeze({...tx,...clone(patch),state:next,history:[...tx.history,next]});
}
function captureBaseline(tx,proof={}){ if(text(proof.manifestHash)!==tx.baselineManifestHash) throw new Error("baseline manifest mismatch"); return transition(tx,"BASELINE_CAPTURED",{baselineProofHash:text(proof.proofHash)||hash(proof)}); }
function beginStaging(tx){ return transition(tx,"STAGING"); }
function finishStaging(tx){ if(!tx.mutations.length) throw new Error("empty transaction"); return transition(tx,"STAGED",{stagedHash:hash(tx.mutations)}); }

function mutationAction(op){ return op; }
function validateTransaction(tx,{root,grant,principalId,currentManifestHash,currentVersions={},existingPaths=[],protectedPolicy=null,projectMap=null,now=Date.now(),currentGrantEpoch=null,currentPolicyEpoch=null}={}){
  if(tx.state!=="STAGED") throw new Error("transaction must be STAGED");
  let validating=transition(tx,"VALIDATING"),errors=[];
  if(!root||root.id!==tx.projectRootId) errors.push("project-root-mismatch");
  if(!grant||grant.id!==tx.grantId) errors.push("project-grant-mismatch");
  if(text(principalId)!==tx.principalId) errors.push("principal-mismatch");
  if(text(currentManifestHash)!==tx.baselineManifestHash) errors.push("baseline-manifest-stale");
  if(projectMap){ const mapCheck=validateProjectMapForMutation({projectMap,currentManifestHash}); if(!mapCheck.valid) errors.push(...mapCheck.reasons); if(tx.projectMapId&&projectMap.id!==tx.projectMapId) errors.push("project-map-identity-mismatch"); }
  const existing=new Set([...existingPaths].map(p=>normalizeProjectPath(p,{caseSensitive:root.caseSensitive,unicodeNormalization:root.unicodeNormalization})));
  const seenDest=new Set();
  for(const m of tx.mutations){
    const action=mutationAction(m.op);
    const gd=grantAllows({grant,root,principalId:tx.principalId,action,path:m.path,now,currentGrantEpoch,currentPolicyEpoch}); if(!gd.allowed) errors.push(...gd.reasons.map(x=>`${m.path}:${x}`));
    const pd=protectedPathDecision({policy:protectedPolicy,root,action,path:m.path}); if(!pd.allowed) errors.push(...pd.reasons);
    if(m.op==="CREATE"){
      if(existing.has(m.path)) errors.push(`destination-exists:${m.path}`);
    } else {
      const current=currentVersions[m.path]; if(!current) errors.push(`current-version-missing:${m.path}`); else if((current.id||current)!==m.expectedVersionTokenId) errors.push(`stale-version:${m.path}`);
    }
    if(m.op==="RENAME"){
      const gd2=grantAllows({grant,root,principalId:tx.principalId,action:"CREATE",path:m.newPath,now,currentGrantEpoch,currentPolicyEpoch}); if(!gd2.allowed) errors.push(...gd2.reasons.map(x=>`${m.newPath}:${x}`));
      const pd2=protectedPathDecision({policy:protectedPolicy,root,action:"CREATE",path:m.newPath}); if(!pd2.allowed) errors.push(...pd2.reasons);
      if(existing.has(m.newPath)&&m.newPath!==m.path) errors.push(`destination-exists:${m.newPath}`);
      if(seenDest.has(m.newPath)) errors.push(`duplicate-destination:${m.newPath}`); seenDest.add(m.newPath);
    } else {
      if(seenDest.has(m.path)) errors.push(`duplicate-destination:${m.path}`); if(m.op!=="DELETE") seenDest.add(m.path);
    }
  }
  errors=[...new Set(errors)];
  const receiptBody={transactionId:tx.id,stagedHash:tx.stagedHash,currentManifestHash:text(currentManifestHash),errors};
  const validationReceipt=freeze({...receiptBody,id:`file-validate-${hash(receiptBody).slice(0,24)}`,pass:errors.length===0});
  if(errors.length) return {ok:false,transaction:transition(validating,"CONFLICTED",{validationReceipt}),validationReceipt,errors};
  return {ok:true,transaction:validating,validationReceipt,errors:[]};
}
function authorizeTransaction(tx,validationReceipt,authorizationReceipt){
  if(tx.state!=="VALIDATING") throw new Error("transaction must be VALIDATING");
  if(!validationReceipt?.pass||validationReceipt.transactionId!==tx.id) throw new Error("valid validation receipt required");
  if(!authorizationReceipt||!text(authorizationReceipt.id)) throw new Error("authorization receipt required");
  if(authorizationReceipt.projectRootId&&authorizationReceipt.projectRootId!==tx.projectRootId) throw new Error("authorization root mismatch");
  if(authorizationReceipt.principalId&&authorizationReceipt.principalId!==tx.principalId) throw new Error("authorization principal mismatch");
  if(authorizationReceipt.transactionId&&authorizationReceipt.transactionId!==tx.id) throw new Error("authorization transaction mismatch");
  const receiptHash=hash(authorizationReceipt);
  return transition(tx,"AUTHORIZED",{validationReceipt,authorizationReceipt:{id:authorizationReceipt.id,hash:receiptHash}});
}
function beginCommit(tx){ return transition(tx,"COMMITTING"); }
function markCommitUncertain(tx,reason){ if(tx.state!=="COMMITTING") throw new Error("commit not in progress"); if(!text(reason)) throw new Error("uncertainty reason required"); return transition(tx,"UNCERTAIN",{uncertaintyReason:text(reason)}); }
function markCommitted(tx,{effectKey,backendReceiptHash,resultManifestHash}={}){
  if(tx.state!=="COMMITTING") throw new Error("commit not in progress");
  if(!text(effectKey)||!text(backendReceiptHash)||!text(resultManifestHash)) throw new Error("commit evidence incomplete");
  const body={transactionId:tx.id,effectKey:text(effectKey),backendReceiptHash:text(backendReceiptHash),resultManifestHash:text(resultManifestHash)};
  return transition(tx,"COMMITTED",{commitReceipt:freeze({...body,id:`file-commit-${hash(body).slice(0,24)}`})});
}
function beginVerification(tx){ return transition(tx,"VERIFYING"); }
function expectedPostcondition(m){ if(m.op==="DELETE") return {path:m.path,exists:false}; if(m.op==="RENAME") return {path:m.newPath,exists:true,sourceAbsent:m.path}; return {path:m.path,exists:true,contentHash:m.contentHash||null,patchHash:m.patchHash||null}; }
function verifyCommittedTransaction(tx,{observedManifestHash,observedFiles={}}={}){
  if(tx.state!=="VERIFYING") throw new Error("transaction must be VERIFYING");
  const failures=[];
  if(text(observedManifestHash)!==tx.commitReceipt?.resultManifestHash) failures.push("result-manifest-mismatch");
  for(const m of tx.mutations){
    const e=expectedPostcondition(m),row=observedFiles[e.path];
    if(e.exists===false){ if(row&&row.exists!==false) failures.push(`delete-not-observed:${e.path}`); continue; }
    if(!row||row.exists!==true){ failures.push(`result-missing:${e.path}`); continue; }
    if(e.contentHash&&row.contentHash!==e.contentHash) failures.push(`content-hash-mismatch:${e.path}`);
    if(e.sourceAbsent){ const src=observedFiles[e.sourceAbsent]; if(src&&src.exists!==false) failures.push(`rename-source-still-present:${e.sourceAbsent}`); }
  }
  const body={transactionId:tx.id,observedManifestHash:text(observedManifestHash),failures:[...new Set(failures)]};
  const receipt=freeze({...body,id:`file-verify-${hash(body).slice(0,24)}`,pass:body.failures.length===0});
  if(body.failures.length) return {ok:false,transaction:transition(tx,"ROLLING_BACK",{verificationReceipt:receipt}),verificationReceipt:receipt,failures:body.failures};
  return {ok:true,transaction:transition(tx,"VERIFIED",{verificationReceipt:receipt}),verificationReceipt:receipt,failures:[]};
}
function finishRollback(tx,{rollbackReceiptHash,restoredManifestHash,expectedManifestHash,certainty="VERIFIED"}={}){
  if(tx.state!=="ROLLING_BACK") throw new Error("transaction must be ROLLING_BACK");
  if(!text(rollbackReceiptHash)||!text(restoredManifestHash)) throw new Error("rollback evidence incomplete");
  if(String(certainty).toUpperCase()!=="VERIFIED" || (expectedManifestHash&&restoredManifestHash!==expectedManifestHash)) return transition(tx,"UNCERTAIN",{rollbackReceipt:{rollbackReceiptHash,restoredManifestHash,certainty:String(certainty).toUpperCase()}});
  return transition(tx,"ROLLED_BACK",{rollbackReceipt:{rollbackReceiptHash,restoredManifestHash,certainty:"VERIFIED"}});
}
function snapshotTransaction(tx){ const body=clone(tx); return freeze({body,hash:hash(body)}); }
function restoreTransaction(snapshot){ if(!snapshot||!snapshot.body||snapshot.hash!==hash(snapshot.body)) throw new Error("transaction snapshot tampered"); if(!TX_STATES.includes(snapshot.body.state)) throw new Error("invalid restored state"); return freeze(snapshot.body); }

module.exports={TX_STATES,MUTATION_OPS,WRITE_ACTIONS,hash,normalizeProjectPath,createBackendCapabilityProfile,createProjectRoot,createProjectGrant,grantAllows,createFileRef,createFileVersionToken,createFileSnapshot,createProtectedPathPolicy,protectedPathDecision,createProjectMap,validateProjectMapForMutation,createMutation,createProjectTransaction,captureBaseline,beginStaging,finishStaging,validateTransaction,authorizeTransaction,beginCommit,markCommitUncertain,markCommitted,beginVerification,verifyCommittedTransaction,finishRollback,snapshotTransaction,restoreTransaction};
