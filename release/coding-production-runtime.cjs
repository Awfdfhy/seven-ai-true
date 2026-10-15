"use strict";

const crypto=require("crypto");
const STATES=Object.freeze(["UNDERSTAND","INSPECT","RESEARCH","PLAN","EDIT","TEST","DIAGNOSE","REPAIR","RETEST","REVIEW","VERIFY","COMMIT_OR_PROPOSE"]);
const PROTECTED=[
  /(^|\/)\.github\//,
  /(^|\/)eval\//,
  /(^|\/)evolution\//,
  /(^|\/)all\.cjs$/,
  /(^|\/)verify\.cjs$/,
  /(^|\/)runtime-smoke\.cjs$/,
  /(^|\/)release\/release-verify\.cjs$/,
  /(^|\/)release\/static-audit\.cjs$/,
  /(^|\/)release\/coding-(?:integration-contract|production-runtime|github-adapter|proposal-policy|test-selector|browser-bundle)\.cjs$/,
  /(^|\/)apk\/(?:binary-verification|build-provenance)(?:\.test)?\.cjs$/,
  /(^|\/)apk\/(?:verify-apk\.cjs|android-rc-[^/]*\.cjs|materialize-android-rc-harness\.cjs|run-android-rc-acceptance\.sh)$/,
  /(^|\/)evolution\/.*\.test\.cjs$/,
  /(^|\/)cloudflare\/.*\.test\.mjs$/,
  /(^|\/)release\/.*\.test\.cjs$/
];
function cleanPath(p){p=String(p||"").replace(/^\/+|\/+$/g,"");if(!p||p.includes("..")||p.includes("\\")||/[\0-\x1f]/.test(p))throw Error("unsafe-path");return p}
function protectedPath(p){p=cleanPath(p);return PROTECTED.some(r=>r.test(p))}
function digest(v){return crypto.createHash("sha256").update(String(v)).digest("hex")}
function requireAdapter(a){for(const m of ["snapshot","inspect","applyAtomic","runTests","diff","verify","propose"]){if(!a||typeof a[m]!=="function")throw Error("coding-adapter-missing:"+m)}return a}
function evidence(run){return Object.freeze({schema:"seven-coding-evidence-v1",task:run.task,baseSha:run.base.sha,resultSha:run.resultSha||null,states:[...run.states],filesRead:[...run.filesRead],filesChanged:[...run.filesChanged],research:[...run.research],tests:[...new Set(run.tests)],failures:[...new Set(run.failures)],repairs:run.repairs,diffDigest:run.diffDigest||null,verdict:run.verdict,proposal:run.proposal||null})}
async function runCodingTransaction(adapter,input){
  const a=requireAdapter(adapter),task=String(input&&input.task||"").trim();if(!task)throw Error("task-required");
  const maxRepairs=Math.max(0,Math.min(3,Number(input.maxRepairs??2)));
  const run={task,states:[],filesRead:[],filesChanged:[],research:[],tests:[],failures:[],repairs:0,verdict:"BLOCKED"};
  const step=s=>run.states.push(s);
  step("UNDERSTAND");run.base=await a.snapshot();if(!run.base||!run.base.sha)throw Error("snapshot-sha-required");
  step("INSPECT");const inspection=await a.inspect({task,snapshot:run.base});run.filesRead=[...new Set(inspection.filesRead||[])].map(cleanPath);
  step("RESEARCH");if(typeof a.research==="function"){const rr=await a.research({task,snapshot:run.base,inspection});if(rr&&Array.isArray(rr.notes))run.research=rr.notes.map(x=>String(x).slice(0,1000)).slice(0,20)}
  step("PLAN");const plan=await a.plan?.({task,snapshot:run.base,inspection})||inspection.plan;if(!plan||!Array.isArray(plan.changes)||!plan.changes.length)throw Error("bounded-plan-required");
  for(const c of plan.changes){c.path=cleanPath(c.path);if(protectedPath(c.path))throw Error("protected-path:"+c.path)}
  const beforeApply=await a.snapshot();if(beforeApply.sha!==run.base.sha)throw Error("stale-plan");
  step("EDIT");let applied=await a.applyAtomic({baseSha:run.base.sha,changes:plan.changes});if(!applied||!applied.sha||applied.sha===run.base.sha)throw Error("candidate-sha-required");run.filesChanged=[...new Set(plan.changes.map(c=>c.path))];
  let testResult;step("TEST");testResult=await a.runTests({task,baseSha:run.base.sha,candidateSha:applied.sha,changed:run.filesChanged,phase:"targeted"});run.tests.push(...(testResult.tests||[]));
  while(!testResult.ok&&run.repairs<maxRepairs){
    step("DIAGNOSE");run.failures.push(...(testResult.failures||["test-failed"]));const diagnosis=await a.diagnose?.({task,inspection,plan,testResult,candidateSha:applied.sha});if(!diagnosis)break;
    step("REPAIR");const repair=await a.repair?.({task,diagnosis,candidateSha:applied.sha});if(!repair||!Array.isArray(repair.changes)||!repair.changes.length)break;
    for(const c of repair.changes){c.path=cleanPath(c.path);if(protectedPath(c.path))throw Error("protected-path:"+c.path)}
    const live=await a.snapshot();if(live.sha!==applied.sha)throw Error("concurrent-edit");
    const repairBase=applied.sha;applied=await a.applyAtomic({baseSha:repairBase,changes:repair.changes});if(!applied||!applied.sha||applied.sha===repairBase)throw Error("repair-sha-required");run.filesChanged=[...new Set(run.filesChanged.concat(repair.changes.map(c=>c.path)))];run.repairs++;
    step("RETEST");testResult=await a.runTests({task,baseSha:run.base.sha,candidateSha:applied.sha,changed:run.filesChanged,phase:"targeted"});run.tests.push(...(testResult.tests||[]));
  }
  if(!testResult.ok){run.failures.push(...(testResult.failures||["test-failed"]));run.resultSha=applied.sha;return evidence(run)}
  step("REVIEW");const diff=await a.diff({baseSha:run.base.sha,headSha:applied.sha});if(!diff||typeof diff.text!=="string"||!Array.isArray(diff.files))throw Error("authoritative-diff-required");const actualFiles=diff.files.map(cleanPath);const declared=new Set(run.filesChanged);const unexpected=actualFiles.filter(x=>!declared.has(x));if(unexpected.length)throw Error("unexpected-diff-files:"+unexpected.join(","));const missing=run.filesChanged.filter(x=>!actualFiles.includes(x));if(missing.length||actualFiles.length!==new Set(actualFiles).size)throw Error("incomplete-authoritative-diff");run.filesChanged=actualFiles;run.diffDigest=digest(diff.text);
  step("VERIFY");const verified=await a.verify({task,baseSha:run.base.sha,candidateSha:applied.sha,changed:run.filesChanged,diffDigest:run.diffDigest});
  if(!verified||verified.ok!==true){run.failures.push(...(verified&&verified.failures||["verification-failed"]));run.resultSha=applied.sha;return evidence(run)}
  const live=await a.snapshot();if(live.sha!==applied.sha)throw Error("candidate-moved-before-proposal");
  step("COMMIT_OR_PROPOSE");run.proposal=await a.propose({task,baseSha:run.base.sha,candidateSha:applied.sha,evidence:{tests:run.tests,diffDigest:run.diffDigest}});run.resultSha=applied.sha;run.verdict="READY_FOR_INTEGRATION";return evidence(run)
}
module.exports={STATES,protectedPath,runCodingTransaction};
