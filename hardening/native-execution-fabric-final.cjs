"use strict";
const core=require("./native-execution-fabric-passb.cjs");
const HASH64=/^[0-9a-f]{64}$/i;
function arr(v){return Array.isArray(v)?v:[]}
function req(v,n){const s=String(v??"").trim();if(!s)throw new Error(`${n} required`);return s}
function stable(v){if(Array.isArray(v))return v.map(stable);if(v&&typeof v==="object"){const o={};for(const k of Object.keys(v).sort())if(v[k]!==undefined)o[k]=stable(v[k]);return o}return v}
function seal(body){return Object.freeze({...body,seal:core.sha(body)})}
function verifySealed(x,schema){if(!x||x.schema!==schema||!HASH64.test(String(x.seal||"")))return false;const {seal:s,...body}=x;return s===core.sha(body)}

function createRetryPermit(input={}){
  const {contract,executionReceipt,observedReceipt}=input;
  if(!core.verifyObservedExecutionReceipt(observedReceipt,{contract,executionReceipt}))throw new Error("verified observed receipt required");
  if(observedReceipt.verdict!=="PASS")throw new Error("blocked observed execution cannot be retried");
  const issued=Date.parse(req(input.issuedAt,"issuedAt")),ended=Date.parse(executionReceipt.endedAt);if(!Number.isFinite(issued)||issued<ended)throw new Error("retry cannot be issued before prior execution ended");
  if(contract.effectClass!=="READ_ONLY"){
    const r=input.absenceReconciliation;if(!core.verifyAbsenceReconciliation(r,{contract,executionReceipt,observedReceipt}))throw new Error("effectful retry requires verified absence reconciliation");
    const checked=Date.parse(r.checkedAt);if(!Number.isFinite(checked)||checked<ended||checked>issued)throw new Error("absence reconciliation chronology invalid");
  }
  return core.createRetryPermit(input)
}
function successDecisionFinal(input={}){
  const d=core.successDecisionPassB(input),reasons=[...d.reasons];
  if(input.observedReceipt?.outputTruncated===true||input.executionReceipt?.outputTruncated===true)reasons.push("truncated-output-cannot-establish-final-success");
  return Object.freeze({success:reasons.length===0,reasons:[...new Set(reasons)]})
}
function createRetryLedger(input={}){const body={schema:"seven.execution-retry-ledger.v1",id:req(input.id,"id"),commandSeal:req(input.commandSeal,"commandSeal"),revision:0,consumed:[]};if(!HASH64.test(body.commandSeal))throw new Error("commandSeal invalid");return seal(body)}
function verifyRetryLedger(x){return verifySealed(x,"seven.execution-retry-ledger.v1")&&Number.isInteger(x.revision)&&x.revision>=0&&Array.isArray(x.consumed)}
function consumeRetryPermit(ledger,permit,{contract,executionReceipt,observedReceipt,now=Date.now()}={}){
  if(!verifyRetryLedger(ledger))throw new Error("verified retry ledger required");if(!core.verifyCommandContract(contract)||ledger.commandSeal!==contract.seal)throw new Error("retry ledger command mismatch");if(!core.verifyRetryPermit(permit,{contract,executionReceipt,observedReceipt,now}))throw new Error("verified live retry permit required");if(observedReceipt.verdict!=="PASS")throw new Error("blocked observed execution cannot consume retry permit");
  if(ledger.consumed.some(x=>x.priorExecutionReceiptSeal===permit.priorExecutionReceiptSeal))throw new Error("prior execution already consumed for retry");if(ledger.consumed.some(x=>x.permitSeal===permit.seal))throw new Error("retry permit replay blocked");
  const expectedAttempt=ledger.revision+2;if(permit.attempt!==expectedAttempt)throw new Error(`retry attempt must be ${expectedAttempt}`);
  const row={revision:ledger.revision+1,attempt:permit.attempt,permitSeal:permit.seal,priorExecutionReceiptSeal:permit.priorExecutionReceiptSeal,consumedAt:new Date(Number(now)).toISOString()};const body={schema:ledger.schema,id:ledger.id,commandSeal:ledger.commandSeal,revision:ledger.revision+1,consumed:[...ledger.consumed,stable(row)]};return seal(body)
}
module.exports=Object.freeze({...core,createRetryPermit,successDecisionFinal,createRetryLedger,verifyRetryLedger,consumeRetryPermit});
