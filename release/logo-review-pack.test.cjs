"use strict";
const assert=require("assert");
const t=require("./logo-tournament.cjs");
const p=require("./logo-candidate-portfolio.cjs");
const passb=require("./logo-tournament-passb.cjs");
const h=require("./logo-review-handoff.cjs");
const r=require("./logo-review-pack.cjs");
let n=0;const ok=(v,m)=>{assert.ok(v,m);n++},eq=(a,b,m)=>{assert.strictEqual(a,b,m);n++},throws=(fn,re)=>{assert.throws(fn,re);n++};
const built=p.buildPortfolio(),record=built.records[0],candidate=record.candidate;
const fakePackages=[];for(const [stage,variants] of Object.entries(passb.requiredVisualCoverage()))for(const variant of variants)fakePackages.push({binding:{stage,variant,seal:t.sha(`binding:${stage}:${variant}`),evidenceHashV2:t.sha(`evidence:${stage}:${variant}`),artifactSha256:t.sha(`artifact:${stage}:${variant}`),evidenceTier:"HOST",environmentIdentity:"host-test"},artifact:{path:`dist/${stage}/${variant}.png`}});
const hostCandidate={candidateId:candidate.id,candidateSeal:candidate.seal,coverage:{candidateSeal:candidate.seal,verdict:"PASS",seal:t.sha("coverage")},packages:fakePackages};
const worksheet=r.createStageWorksheet(record,hostCandidate);eq(worksheet.candidateId,candidate.id);eq(worksheet.winnerEligible,false);eq(worksheet.authorityBoundary.hostEvidenceProvesRenderIntegrityOnly,true);eq(worksheet.authorityBoundary.semanticRatingsStillIndependent,true);eq(worksheet.stages.SILHOUETTE.status,"HOST_RENDER_CAPTURED_SEMANTIC_REVIEW_REQUIRED");eq(worksheet.stages.TINY_SIZE.evidence.length,5);eq(worksheet.stages.ADAPTIVE_MASK.evidence.length,4);eq(worksheet.stages.DAY_NIGHT.evidence.length,2);eq(worksheet.stages.PRODUCT_CONTEXT.evidence.length,5);eq(worksheet.stages.HUMAN_EVIDENCE.status,"OPTIONAL_WHERE_AVAILABLE");eq(worksheet.stages.MOTION_MARK.status,"INDEPENDENT_REVIEW_REQUIRED");eq(worksheet.stages.DISTINCTIVENESS.status,"INDEPENDENT_REVIEW_REQUIRED");eq(worksheet.stages.SIMPLIFIER.status,"INDEPENDENT_REVIEW_REQUIRED");
for(const stage of r.VISUAL_STAGES){eq(worksheet.stages[stage].captureTier,"HOST");eq(worksheet.stages[stage].renderIntegrity,"PASS");ok(worksheet.stages[stage].evidence.every(e=>e.evidenceTier==="HOST"));}
const handoff=h.createReviewHandoff({portfolioManifest:built.manifest,candidate,builderContext:"seven-ci-logo-builder-wave14-v1",branch:"ultimate-polish-v1",commitSha:"a".repeat(40),artifactRef:"ci://review-pack"});const template=r.createSubmissionTemplate({handoff,worksheet});eq(template.handoffSeal,handoff.seal);eq(template.candidateId,candidate.id);eq(template.instructions.useDifferentContextFromBuilder,true);eq(template.instructions.hostEvidenceIsRenderIntegrityNotSemanticApproval,true);eq(template.instructions.humanRecognitionEvidenceOptional,true);eq(template.sourceRefs.length,0);eq(template.comparedProducts.length,0);eq(template.evidenceRefs.length,18);for(const d of t.DIMENSIONS)eq(template.ratings[d],null);
const missing={...hostCandidate,packages:hostCandidate.packages.filter(x=>!(x.binding.stage==="TINY_SIZE"&&x.binding.variant==="size-16"))};throws(()=>r.createStageWorksheet(record,missing),/coverage mismatch/);
const wrongTier={...hostCandidate,packages:hostCandidate.packages.map((x,i)=>i?x:{...x,binding:{...x.binding,evidenceTier:"SIMULATED"}})};throws(()=>r.createStageWorksheet(record,wrongTier),/HOST evidence invalid/);
const wrongCandidate={...hostCandidate,candidateId:"foreign"};throws(()=>r.createStageWorksheet(record,wrongCandidate),/mismatch/);
const noPass={...hostCandidate,coverage:{...hostCandidate.coverage,verdict:"INCONCLUSIVE"}};throws(()=>r.createStageWorksheet(record,noPass),/PASS host coverage required/);
console.log(`Logo Review Pack: PASS (${n} assertions; HOST capture is indexed without becoming semantic approval)`);
