"use strict";
const assert=require('assert/strict');
const {createExperiment}=require('./experiment-lab.cjs');
const {runVerifiedCodingRequest}=require('./coding-request.cjs');
const experiment=createExperiment({id:'public-seam',subsystem:'coding',hypothesis:'fix fixture',baselineRef:'aaaaaaa',candidateRef:'candidate',allowedPaths:['src']});
function fixture(options={}){
 let stable='aaaaaaa',sha='aaaaaaa',edits=0,discarded=0;
 const agent={getStableHeadSha:async()=>stable,prepareCandidate:async()=>({isolated:true,baselineSha:'aaaaaaa',workspaceId:'ws'}),discardCandidate:async()=>{discarded++},restoreStable:async()=>{if(options.restoreFail)throw Error('restore failed');stable='aaaaaaa'}};
 const adapter={snapshot:async()=>({sha}),inspect:async()=>({filesRead:['src/a.js'],plan:{changes:[{path:options.path||'src/a.js',content:'fixed'}]}}),applyAtomic:async()=>{edits++;sha='bbbbbbb';if(options.mutateStable)stable='ccccccc';return {sha}},runTests:async()=>({ok:!options.testFail,tests:['fixture']}),diff:async()=>options.noFiles?{text:'fixture diff'}:{text:'fixture diff',files:options.extraFile?['src/a.js','src/unplanned.js']:['src/a.js']},verify:async()=>({ok:true}),propose:async()=>({candidateSha:sha})};
 return {agent,adapter,get edits(){return edits},get discarded(){return discarded}};
}
(async()=>{
 const f=fixture();const out=await runVerifiedCodingRequest({experiment,baselineSha:'aaaaaaa',...f});
 assert.equal(out.outcome,'PASS');assert.equal(out.receipt.contract,'seven-coding-integration-v1');assert.equal(out.receipt.baseSha,'aaaaaaa');assert.equal(out.receipt.resultSha,'bbbbbbb');assert.ok(Object.isFrozen(out.receipt));
 const missing=fixture();await assert.rejects(()=>runVerifiedCodingRequest({experiment,baselineSha:'aaaaaaa',agent:missing.agent}),/public-coding-adapter-required/);assert.equal(missing.edits,0);
 for(const options of [{noFiles:true},{extraFile:true},{testFail:true},{path:'release/coding-integration-contract.cjs'},{mutateStable:true},{mutateStable:true,restoreFail:true}]){
  const f=fixture(options),r=await runVerifiedCodingRequest({experiment,baselineSha:'aaaaaaa',agent:f.agent,adapter:f.adapter});assert.notEqual(r.outcome,'PASS');assert.equal(f.discarded,1);
 }
 console.log('public Coding -> Self-Development seam: PASS');
})().catch(e=>{console.error(e);process.exit(1)});
