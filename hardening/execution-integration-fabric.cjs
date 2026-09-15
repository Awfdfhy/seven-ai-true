"use strict";

const native=require("./native-execution-fabric-final.cjs");
const durable=require("./durable-fabric-state.cjs");
const effects=require("./side-effect-ledger.cjs");
const files=require("./project-file-fabric-passb.cjs");
const HASH64=/^[0-9a-f]{64}$/i;

function arr(v){return Array.isArray(v)?v:[]}
function req(v,n){const s=String(v??"").trim();if(!s)throw new Error(`${n} required`);return s}
function clone(v){return v==null?v:JSON.parse(JSON.stringify(v))}
function stable(v){if(Array.isArray(v))return v.map(stable);if(v&&typeof v==="object"){const o={};for(const k of Object.keys(v).sort())if(v[k]!==undefined)o[k]=stable(v[k]);return o}return v}
function seal(body){return Object.freeze({...body,seal:native.sha(body)})}
function verifySealed(x,schema){if(!x||x.schema!==schema||!HASH64.test(String(x.seal||"")))return false;const {seal:s,...body}=x;return s===native.sha(body)}
function iso(v,n){const s=req(v,n),t=Date.parse(s);if(!Number.isFinite(t))throw new Error(`${n} invalid`);return new Date(t).toISOString()}
function exactPrefix(prefix,full){if(prefix.length>full.length)return false;for(let i=0;i<prefix.length;i++)if(JSON.stringify(stable(prefix[i]))!==JSON.stringify(stable(full[i])))return false;return true}
function restoreEffectSnapshot(snapshot){try{return effects.restoreEffectLedger(snapshot)}catch{return null}}
function validateEffectBaseline(contract,snapshot,expectedHash){
  if(contract.effectClass==="READ_ONLY"){if(snapshot!=null)throw new Error("read-only envelope cannot bind effect ledger");if(expectedHash!=null)throw new Error("read-only preflight cannot bind effect journal");return null}
  const ledger=restoreEffectSnapshot(snapshot);if(!ledger)throw new Error("verified effect ledger baseline required");const snap=ledger.snapshot();if(snap.journalHash!==expectedHash)throw new Error("effect journal baseline drift");const record=ledger.get(contract.effectKey);if(!record)throw new Error("effect key absent from baseline journal");if(record.plan?.principalId!==contract.principalId||record.plan?.taskId!==contract.taskId)throw new Error("effect record lineage mismatch");return snap
}

function createExecutionEnvelope(input={}){
  const {contract,profile,preflight,attestation,preCheckpoint}=input,preparedAt=iso(input.preparedAt||new Date().toISOString(),"preparedAt");
  if(!native.verifyCommandContract(contract,profile))throw new Error("verified command/profile required");
  if(!native.verifyAdapterAttestation(attestation,profile,Date.parse(preparedAt)))throw new Error("fresh adapter attestation required");
  if(!native.verifyExecutionPreflight(preflight,{contract,profile,attestation,now:Date.parse(preparedAt)}))throw new Error("fresh exact execution preflight required");
  if(!durable.verifyFabricCheckpoint(preCheckpoint))throw new Error("verified durable pre-checkpoint required");
  if(preCheckpoint.principalId!==contract.principalId||preCheckpoint.scopeId!==contract.projectRootId)throw new Error("durable checkpoint principal/scope mismatch");
  const currentHeads=stable(input.currentHeads||{}),fresh=durable.assessCheckpointFreshness(preCheckpoint,currentHeads);if(fresh.status!=="FRESH")throw new Error(`durable checkpoint stale:${fresh.reasons.join(",")}`);
  if(req(currentHeads.projectManifestHash,"currentHeads.projectManifestHash")!==preflight.projectManifestHash)throw new Error("preflight/current project manifest drift");
  if(preCheckpoint.dependencyHeads?.projectManifestHash!==preflight.projectManifestHash)throw new Error("durable checkpoint does not bind exact project manifest");
  const effectBaseline=validateEffectBaseline(contract,input.effectLedgerSnapshot,preflight.effectJournalHead);
  const retryLedger=input.retryLedger;if(!native.verifyRetryLedger(retryLedger)||retryLedger.commandSeal!==contract.seal||retryLedger.revision!==0)throw new Error("fresh exact retry ledger required");
  const body={schema:"seven.execution-envelope.v1",runId:req(input.runId,"runId"),taskId:contract.taskId,principalId:contract.principalId,projectRootId:contract.projectRootId,commandSeal:contract.seal,executorProfileSeal:profile.seal,preflightSeal:preflight.seal,adapterAttestationSeal:attestation.seal,preCheckpointSeal:preCheckpoint.seal,preCheckpointRevision:preCheckpoint.revision,preCheckpointKeyId:preCheckpoint.keyId,dependencyFingerprint:preCheckpoint.dependencyFingerprint,projectManifestHash:preflight.projectManifestHash,effectClass:contract.effectClass,effectKey:contract.effectKey,effectJournalBaselineHash:effectBaseline?.journalHash||null,effectJournalBaselineLength:effectBaseline?.journal?.length||0,retryLedgerSeal:retryLedger.seal,preparedAt,phase:"PREPARED",grantsAuthority:false};return seal(body)
}
function verifyExecutionEnvelope(x){return verifySealed(x,"seven.execution-envelope.v1")&&x.phase==="PREPARED"&&x.grantsAuthority===false&&HASH64.test(String(x.commandSeal||""))&&HASH64.test(String(x.preCheckpointSeal||""))&&HASH64.test(String(x.retryLedgerSeal||""))}

function recordObservedExecution(input={}){
  const {envelope,contract,profile,preflight,attestation,executionReceipt,observedReceipt}=input;if(!verifyExecutionEnvelope(envelope))throw new Error("verified execution envelope required");
  if(envelope.commandSeal!==contract?.seal||envelope.preflightSeal!==preflight?.seal||envelope.adapterAttestationSeal!==attestation?.seal)throw new Error("execution envelope dependency drift");
  if(!native.verifyExecutionReceipt(executionReceipt,contract,profile))throw new Error("verified execution receipt required");if(!native.verifyObservedExecutionReceipt(observedReceipt,{contract,executionReceipt,preflight,attestation}))throw new Error("verified observed execution receipt required");
  if(Date.parse(executionReceipt.startedAt)<Date.parse(envelope.preparedAt))throw new Error("execution predates prepared envelope");
  return seal({schema:"seven.execution-observation.v1",envelopeSeal:envelope.seal,commandSeal:contract.seal,executionReceiptSeal:executionReceipt.seal,observedReceiptSeal:observedReceipt.seal,transportStatus:executionReceipt.transportStatus,exitCode:executionReceipt.exitCode,observedVerdict:observedReceipt.verdict,endedAt:executionReceipt.endedAt,phase:"OBSERVED",grantsAuthority:false})
}
function verifyExecutionObservation(x,envelope=null){return verifySealed(x,"seven.execution-observation.v1")&&x.phase==="OBSERVED"&&x.grantsAuthority===false&&(!envelope||x.envelopeSeal===envelope.seal)}

function validateEffectFinal({envelope,contract,baselineEffectLedgerSnapshot,finalEffectLedgerSnapshot}){
  if(contract.effectClass==="READ_ONLY"){if(baselineEffectLedgerSnapshot!=null||finalEffectLedgerSnapshot!=null)throw new Error("read-only outcome cannot bind effect ledger");return {record:null,finalHash:null}}
  const baseline=restoreEffectSnapshot(baselineEffectLedgerSnapshot),finalLedger=restoreEffectSnapshot(finalEffectLedgerSnapshot);if(!baseline||!finalLedger)throw new Error("verified baseline/final effect snapshots required");const b=baseline.snapshot(),f=finalLedger.snapshot();if(b.journalHash!==envelope.effectJournalBaselineHash||b.journal.length!==envelope.effectJournalBaselineLength)throw new Error("effect baseline does not match envelope");if(!exactPrefix(b.journal,f.journal))throw new Error("effect journal history was rewritten");const record=finalLedger.get(contract.effectKey);if(!record)throw new Error("effect record missing from final ledger");return {record,finalHash:f.journalHash}}
}
function verifyProjectTransactionSnapshot(snapshot,contract,verification){
  let tx;try{tx=files.restoreTransaction(snapshot)}catch{throw new Error("verified project transaction snapshot required")}
  if(tx.state!=="VERIFIED")throw new Error("project transaction is not VERIFIED");if(contract.transactionRef!==tx.id)throw new Error("command/transaction identity mismatch");
  if(!tx.verificationReceipt?.pass)throw new Error("project transaction verification receipt missing");const expected=native.sha(tx.verificationReceipt);if(verification.reconciliation?.postconditionHash!==expected)throw new Error("execution reconciliation is not bound to transaction verification receipt");return tx
}

function createExecutionOutcome(input={}){
  const {envelope,observation,contract,profile,preflight,attestation,executionReceipt,observedReceipt,verification}=input;if(!verifyExecutionEnvelope(envelope)||!verifyExecutionObservation(observation,envelope))throw new Error("verified envelope/observation required");
  if(observation.executionReceiptSeal!==executionReceipt?.seal||observation.observedReceiptSeal!==observedReceipt?.seal)throw new Error("observation receipt drift");
  const decision=native.successDecisionFinal({contract,executionReceipt,verification,observedReceipt,preflight,attestation}),reasons=[...decision.reasons];let effectFinalHash=null,resultManifestHash=null;
  const effect=validateEffectFinal({envelope,contract,baselineEffectLedgerSnapshot:input.baselineEffectLedgerSnapshot,finalEffectLedgerSnapshot:input.finalEffectLedgerSnapshot});effectFinalHash=effect.finalHash;
  if(contract.effectClass!=="READ_ONLY"&&decision.success){if(effect.record.effectCertainty!=="PRESENT_VERIFIED"||effect.record.lifecycle!=="CLOSED")reasons.push("effect-not-present-verified-closed");}
  if(contract.effectClass==="PROJECT_MUTATION"&&decision.success){const tx=verifyProjectTransactionSnapshot(input.projectTransactionSnapshot,contract,verification);resultManifestHash=tx.verificationReceipt.observedManifestHash||tx.commitReceipt?.resultManifestHash||null;if(!resultManifestHash)reasons.push("verified-project-result-manifest-missing")}
  if(contract.effectClass==="EXTERNAL_EFFECT"&&decision.success){const expected=native.sha(effect.record.evidence||[]);if(verification.reconciliation?.evidenceHash!==expected)reasons.push("external-effect-reconciliation-evidence-drift")}
  const verdict=observation.observedVerdict!=="PASS"?"BLOCKED":reasons.length?"RECOVERY_REQUIRED":"SUCCESS";
  return seal({schema:"seven.execution-outcome.v1",envelopeSeal:envelope.seal,observationSeal:observation.seal,commandSeal:contract.seal,executionReceiptSeal:executionReceipt.seal,verificationSeal:verification?.seal||null,effectClass:contract.effectClass,effectKey:contract.effectKey,effectJournalFinalHash:effectFinalHash,resultManifestHash,verdict,reasons:[...new Set(reasons)].sort(),completedAt:iso(input.completedAt||verification?.checkedAt||executionReceipt.endedAt,"completedAt"),grantsAuthority:false})
}
function verifyExecutionOutcome(x,envelope=null,observation=null){return verifySealed(x,"seven.execution-outcome.v1")&&["SUCCESS","RECOVERY_REQUIRED","BLOCKED"].includes(x.verdict)&&x.grantsAuthority===false&&(!envelope||x.envelopeSeal===envelope.seal)&&(!observation||x.observationSeal===observation.seal)}

function closeExecutionRun(input={}){
  const {envelope,outcome,preCheckpoint,postCheckpoint}=input;if(!verifyExecutionEnvelope(envelope)||!verifyExecutionOutcome(outcome,envelope))throw new Error("verified envelope/outcome required");if(!durable.verifyFabricCheckpoint(preCheckpoint)||preCheckpoint.seal!==envelope.preCheckpointSeal)throw new Error("exact durable pre-checkpoint required");if(!durable.verifyFabricCheckpoint(postCheckpoint))throw new Error("verified durable post-checkpoint required");
  if(postCheckpoint.keyId!==preCheckpoint.keyId||postCheckpoint.principalId!==envelope.principalId||postCheckpoint.scopeId!==envelope.projectRootId)throw new Error("post-checkpoint identity drift");if(postCheckpoint.revision!==preCheckpoint.revision+1||postCheckpoint.previousSeal!==preCheckpoint.seal)throw new Error("post-checkpoint lineage must advance exactly one");
  if(postCheckpoint.state?.executionOutcomeSeal!==outcome.seal||postCheckpoint.state?.executionVerdict!==outcome.verdict)throw new Error("post-checkpoint does not bind exact execution outcome");
  const expectedManifest=outcome.verdict==="SUCCESS"&&outcome.effectClass==="PROJECT_MUTATION"?outcome.resultManifestHash:envelope.projectManifestHash;if(postCheckpoint.dependencyHeads?.projectManifestHash!==expectedManifest)throw new Error("post-checkpoint project manifest does not match execution result");
  return seal({schema:"seven.execution-close-receipt.v1",envelopeSeal:envelope.seal,outcomeSeal:outcome.seal,preCheckpointSeal:preCheckpoint.seal,postCheckpointSeal:postCheckpoint.seal,postCheckpointRevision:postCheckpoint.revision,status:outcome.verdict==="SUCCESS"?"COMMITTED_SUCCESS":"COMMITTED_RECOVERY_STATE",grantsAuthority:false})
}
function verifyExecutionCloseReceipt(x,envelope=null,outcome=null){return verifySealed(x,"seven.execution-close-receipt.v1")&&["COMMITTED_SUCCESS","COMMITTED_RECOVERY_STATE"].includes(x.status)&&x.grantsAuthority===false&&(!envelope||x.envelopeSeal===envelope.seal)&&(!outcome||x.outcomeSeal===outcome.seal)}

function recoveryDecision(input={}){
  const {envelope,observation=null,outcome=null,contract,retryPermit=null,retryLedger=null,executionReceipt=null,observedReceipt=null}=input;if(!verifyExecutionEnvelope(envelope)||envelope.commandSeal!==contract?.seal)return Object.freeze({action:"HALT",reasons:["invalid-envelope-or-command"]});
  if(!observation)return Object.freeze({action:"EXECUTE_PREPARED",reasons:[]});if(!verifyExecutionObservation(observation,envelope))return Object.freeze({action:"HALT",reasons:["invalid-observation"]});
  if(outcome){if(!verifyExecutionOutcome(outcome,envelope,observation))return Object.freeze({action:"HALT",reasons:["invalid-outcome"]});if(outcome.verdict==="SUCCESS")return Object.freeze({action:"CHECKPOINT_ONLY",reasons:["execution-already-successful-never-reexecute"]});if(outcome.verdict==="BLOCKED")return Object.freeze({action:"HALT",reasons:["observed-execution-blocked"]})}
  if(observation.observedVerdict!=="PASS")return Object.freeze({action:"HALT",reasons:["observed-execution-blocked"]});
  if(contract.effectClass!=="READ_ONLY"&&!retryPermit)return Object.freeze({action:"RECONCILE_EFFECT",reasons:["effectful-execution-not-proven-absent"]});
  if(retryPermit){if(!native.verifyRetryLedger(retryLedger)||retryLedger.commandSeal!==contract.seal)return Object.freeze({action:"HALT",reasons:["invalid-retry-ledger"]});if(!native.verifyRetryPermit(retryPermit,{contract,executionReceipt,observedReceipt,now:input.now??Date.now()}))return Object.freeze({action:"HALT",reasons:["invalid-or-expired-retry-permit"]});if(retryLedger.consumed.some(x=>x.permitSeal===retryPermit.seal||x.priorExecutionReceiptSeal===retryPermit.priorExecutionReceiptSeal))return Object.freeze({action:"HALT",reasons:["retry-already-consumed"]});const expected=retryLedger.revision+2;if(retryPermit.attempt!==expected)return Object.freeze({action:"HALT",reasons:[`retry-sequence-mismatch:${expected}`]});return Object.freeze({action:"RETRY_ALLOWED",reasons:[]})}
  return Object.freeze({action:"RETRY_REQUIRES_PERMIT",reasons:["read-only-retry-not-yet-authorized"]})
}

module.exports=Object.freeze({createExecutionEnvelope,verifyExecutionEnvelope,recordObservedExecution,verifyExecutionObservation,createExecutionOutcome,verifyExecutionOutcome,closeExecutionRun,verifyExecutionCloseReceipt,recoveryDecision});
