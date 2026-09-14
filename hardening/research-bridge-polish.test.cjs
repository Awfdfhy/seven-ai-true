"use strict";
const assert=require("assert/strict");
const browserControl=require("../release/control-runtime.js");
const research=require("../release/research-runtime.js");
globalThis.SevenControl=browserControl;
globalThis.SevenPerformance={state:{tier:"balanced",reducedMotion:false,longTasks:[]}};
delete require.cache[require.resolve("../release/control-bridge.js")];
const bridge=require("../release/control-bridge.js");
let n=0;const t=(name,fn)=>{fn();n++;console.log("PASS",name)};
t("research bridge transports claim-scoped evidence conservatively",()=>{
  const out=research.verify([{id:"c",text:"supported"}],[{id:"s",url:"https://example.com/a",authority:"A0",clusterId:"cluster-a",evidence:[{claimId:"c",stance:"support",locator:"p1"}]}]);
  const truth=bridge.researchVerificationToTruth(out),claim=truth.claims[0];
  assert.equal(claim.kind,"FACT");
  assert.equal(claim.sources[0].authority,"A5");
  assert.equal(claim.sources[0].independentGroup,"cluster-a");
  assert.equal(claim.sources[0].metadata.researchAuthorityMode,"claim-scoped");
  assert.equal(Object.hasOwn(claim.metadata,"bestAuthority"),false);
});
t("unknown research independence stays unknown in truth bridge",()=>{
  const out=research.verify([{id:"c",text:"needs two",minIndependentSupport:2}],[
    {id:"a",url:"https://a.example/x",evidence:[{claimId:"c",stance:"support",locator:"a"}]},
    {id:"b",url:"https://b.example/x",evidence:[{claimId:"c",stance:"support",locator:"b"}]}
  ]);
  const claim=bridge.researchVerificationToTruth(out).claims[0];
  assert.equal(claim.kind,"UNKNOWN");
  assert.equal(browserControl.independentSourceCount(claim),0);
  assert.ok(claim.sources.every(s=>s.independentGroup===null));
});
console.log(`research bridge polish: PASS (${n} assertions)`);
