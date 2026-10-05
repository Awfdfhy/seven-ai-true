"use strict";
function sha(v){v=String(v||"").trim();if(!/^[a-f0-9]{7,64}$/i.test(v))throw Error("invalid-sha");return v}
function createVerifiedProposalPort(api,options={}){
 if(!api||typeof api.openPullRequest!=="function")throw Error("proposal-api-missing:openPullRequest");
 const base=String(options.base||"main").trim(),branch=String(options.branch||"").trim();if(!branch)throw Error("proposal-branch-required");if(branch===base)throw Error("proposal-branch-must-differ-from-base");
 return async function propose(ctx){
  const candidate=sha(ctx&&ctx.candidateSha),baseSha=sha(ctx&&ctx.baseSha);
  if(!ctx||!ctx.evidence||!Array.isArray(ctx.evidence.tests)||!ctx.evidence.tests.length)throw Error("proposal-test-evidence-required");
  if(!/^[a-f0-9]{64}$/i.test(String(ctx.evidence.diffDigest||"")))throw Error("proposal-diff-evidence-required");
  if(typeof options.currentHead!=="function")throw Error("proposal-head-check-required");
  const live=sha(await options.currentHead(branch));if(live!==candidate)throw Error("proposal-stale-candidate");
  if(typeof options.ciForSha!=="function")throw Error("proposal-ci-check-required");
  const ci=await options.ciForSha(candidate);if(!ci||ci.status!=="completed"||ci.conclusion!=="success")throw Error("proposal-green-ci-required");
  const body=["Seven Coding verified proposal.","","Base SHA: "+baseSha,"Candidate SHA: "+candidate,"CI: "+String(ci.id||"unknown"),"Diff digest: "+ctx.evidence.diffDigest,"Tests: "+ctx.evidence.tests.join(", ")].join("\n");
  const pr=await api.openPullRequest({title:"Seven Coding: "+String(ctx.task||"verified change").slice(0,90),head:branch,base,body});
  if(!pr||!pr.number)throw Error("proposal-pr-evidence-required");
  return Object.freeze({kind:"verified-pull-request",number:pr.number,url:pr.url||pr.html_url||null,candidateSha:candidate,ciRunId:ci.id||null});
 };
}
module.exports={createVerifiedProposalPort};
