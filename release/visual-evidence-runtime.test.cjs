"use strict";
const assert=require("assert/strict");
const v=require("./visual-evidence-runtime.cjs");
let n=0;const pass=(name,fn)=>{fn();n++;console.log("PASS",name)};
const H=x=>String(x).repeat(64);

const scenario=v.createScenario({id:"chat-night",surface:"chat",journey:"send-message",state:"idle",viewport:{width:390,height:844},locale:"en",direction:"ltr",theme:"night",criticalSelectors:[".composer",".seven-beta-status"],expectedSelectors:["#chat",".composer"],tags:["phone","core"]});
pass("scenario verifies",()=>assert.equal(v.verifyScenario(scenario),true));
pass("scenario hash is deterministic",()=>assert.equal(v.createScenario({id:"chat-night",surface:"chat",journey:"send-message",state:"idle",viewport:{width:390,height:844},locale:"en",direction:"ltr",theme:"night",criticalSelectors:[".seven-beta-status",".composer"],expectedSelectors:[".composer","#chat"],tags:["core","phone"]}).scenarioHash,scenario.scenarioHash));
pass("scenario tampering is detected",()=>assert.equal(v.verifyScenario({...scenario,theme:"day"}),false));
assert.throws(()=>v.createScenario({id:"bad",surface:"chat",viewport:{width:100,height:100}}),/viewport too small/);n++;console.log("PASS invalid viewport blocked");

const artifact=v.createArtifact(scenario,{path:"screenshots/01.png",sha256:H("a"),byteSize:1200,width:390,height:844,sourceRef:"build:1"});
pass("artifact verifies",()=>assert.equal(v.verifyArtifact(artifact,scenario),true));
pass("artifact hash tampering is detected",()=>assert.equal(v.verifyArtifact({...artifact,byteSize:2},scenario),false));
assert.throws(()=>v.createArtifact(scenario,{path:"x",sha256:"bad",byteSize:1}),/sha256 invalid/);n++;console.log("PASS weak artifact hash blocked");

pass("viewport pass tolerates tiny rounding drift",()=>assert.equal(v.auditViewport({scrollWidth:391,clientWidth:390,scrollHeight:844,clientHeight:844}).status,"PASS"));
pass("viewport horizontal overflow fails",()=>assert.equal(v.auditViewport({scrollWidth:410,clientWidth:390,scrollHeight:844,clientHeight:844}).status,"FAIL"));
const touchPass=v.auditTouchTargets([{selector:"#send",width:48,height:48,visible:true,accessibleName:"Send"}]);
pass("preferred touch target passes",()=>assert.equal(touchPass.status,"PASS"));
pass("subpreferred but usable touch target warns",()=>assert.equal(v.auditTouchTargets([{selector:"#x",width:32,height:32,visible:true}]).status,"WARN"));
pass("unsafe touch target fails",()=>assert.equal(v.auditTouchTargets([{selector:"#x",width:20,height:40,visible:true}]).status,"FAIL"));
pass("hidden target is excluded",()=>assert.equal(v.auditTouchTargets([{selector:"#x",width:1,height:1,visible:false}]).status,"PASS"));
assert.throws(()=>v.auditTouchTargets([],{preferredMin:24,hardMin:44}),/hardMin/);n++;console.log("PASS invalid touch policy blocked");

pass("named focusable controls pass accessibility",()=>assert.equal(v.auditAccessibility([{selector:"#send",visible:true,interactive:true,focusable:true,accessibleName:"Send"}]).status,"PASS"));
pass("unnamed control fails accessibility",()=>assert.equal(v.auditAccessibility([{selector:"#icon",visible:true,interactive:true,focusable:true,accessibleName:""}]).status,"FAIL"));
pass("unfocusable control fails accessibility",()=>assert.equal(v.auditAccessibility([{selector:"#icon",visible:true,interactive:true,focusable:false,accessibleName:"Open"}]).status,"FAIL"));

pass("contrast math matches black on white",()=>assert.ok(Math.abs(v.contrastRatio("#000000","#ffffff")-21)<1e-9));
pass("high contrast sample passes",()=>assert.equal(v.auditContrast([{id:"body",fg:"rgb(0, 0, 0)",bg:"rgb(255,255,255)",min:4.5}]).status,"PASS"));
pass("low contrast sample fails",()=>assert.equal(v.auditContrast([{id:"muted",fg:"#777777",bg:"#888888",min:4.5}]).status,"FAIL"));
assert.throws(()=>v.contrastRatio("rgba(0,0,0,.5)","#ffffff"),/translucent/);n++;console.log("PASS unresolved alpha blocked");

const state=v.auditState(scenario,{presentSelectors:[".composer",".seven-beta-status","#chat"],direction:"ltr",reducedMotion:false});
pass("critical state presence passes",()=>assert.equal(state.status,"PASS"));
pass("missing critical selector fails",()=>assert.equal(v.auditState(scenario,{presentSelectors:[".composer"],direction:"ltr"}).status,"FAIL"));
pass("direction mismatch fails",()=>assert.equal(v.auditState(scenario,{presentSelectors:[".composer",".seven-beta-status"],direction:"rtl"}).status,"FAIL"));

const evidence=v.createEvidence(scenario,artifact,{tier:"HOST",commitSha:H("b"),branch:"ultimate-polish-v1",audits:[v.auditViewport({scrollWidth:390,clientWidth:390}),touchPass,state],policy:"OBSERVE"});
pass("evidence verifies",()=>assert.equal(v.verifyEvidence(evidence,scenario,artifact),true));
pass("evidence verdict is deterministic",()=>assert.equal(evidence.status,"PASS"));
pass("evidence tampering is detected",()=>assert.equal(v.verifyEvidence({...evidence,status:"FAIL"},scenario,artifact),false));
const warningEvidence=v.createEvidence(scenario,artifact,{tier:"HOST",commitSha:H("b"),branch:"ultimate-polish-v1",audits:[v.auditTouchTargets([{selector:"#small",width:32,height:32,visible:true}])],policy:"OBSERVE"});
pass("warning evidence remains non-pass",()=>assert.equal(warningEvidence.status,"WARN"));
const failingEvidence=v.createEvidence(scenario,artifact,{tier:"HOST",commitSha:H("b"),branch:"ultimate-polish-v1",audits:[v.auditViewport({scrollWidth:450,clientWidth:390})],policy:"OBSERVE"});
pass("hard audit failure dominates evidence",()=>assert.equal(failingEvidence.status,"FAIL"));

let registry=v.createBaselineRegistry({id:"release-phone"});
pass("empty baseline registry verifies",()=>assert.equal(v.verifyRegistry(registry),true));
assert.throws(()=>v.approveBaseline(registry,scenario,artifact,evidence,{}),/approval.reviewer/);n++;console.log("PASS golden update requires explicit approval");
assert.throws(()=>v.approveBaseline(registry,scenario,artifact,failingEvidence,{reviewer:"qa",reason:"x",approvalRef:"R1"}),/failing evidence/);n++;console.log("PASS failing evidence cannot become golden");
registry=v.approveBaseline(registry,scenario,artifact,evidence,{reviewer:"qa",reason:"verified initial baseline",approvalRef:"R1"});
pass("approved baseline registry verifies",()=>assert.equal(v.verifyRegistry(registry),true));
pass("exact baseline matches",()=>assert.equal(v.compareBaseline(registry,scenario,artifact).status,"MATCH"));
const changedArtifact=v.createArtifact(scenario,{path:"screenshots/01.png",sha256:H("c"),byteSize:1250,width:390,height:844});
pass("pixel hash change requires review",()=>{const r=v.compareBaseline(registry,scenario,changedArtifact);assert.equal(r.status,"CHANGED");assert.equal(r.reviewRequired,true)});
const changedScenario=v.createScenario({id:"chat-night",surface:"chat",journey:"send-message",state:"idle",viewport:{width:412,height:915},locale:"en",direction:"ltr",theme:"night"});
const changedScenarioArtifact=v.createArtifact(changedScenario,{path:"x",sha256:H("d"),byteSize:1,width:412,height:915});
pass("scenario-definition change cannot silently reuse golden",()=>assert.equal(v.compareBaseline(registry,changedScenario,changedScenarioArtifact).status,"SCENARIO_CHANGED"));
pass("registry tampering is detected",()=>assert.equal(v.verifyRegistry({...registry,revision:99}),false));

const rtl=v.createScenario({id:"chat-rtl",surface:"chat",viewport:{width:390,height:844},locale:"ar",direction:"rtl",theme:"night",reducedMotion:false});
pass("RTL is structural scenario metadata",()=>assert.equal(rtl.direction,"rtl"));
const reduced=v.createScenario({id:"chat-reduced",surface:"chat",viewport:{width:390,height:844},locale:"en",direction:"ltr",theme:"night",reducedMotion:true});
pass("reduced motion is scenario-bound",()=>assert.equal(reduced.reducedMotion,true));

const manifest=v.createManifest({branch:"ultimate-polish-v1",commitSha:H("b"),mode:"OBSERVE",scenarios:[scenario],artifacts:[artifact],evidence:[evidence]});
pass("manifest verifies",()=>assert.equal(v.verifyManifest(manifest),true));
pass("manifest summary is non-scalar evidence accounting",()=>assert.deepEqual(manifest.summary,{count:1,pass:1,warn:0,fail:0,inconclusive:0}));
pass("manifest tampering is detected",()=>assert.equal(v.verifyManifest({...manifest,mode:"GATE"}),false));
assert.throws(()=>v.createManifest({branch:"x",commitSha:H("b"),scenarios:[scenario],artifacts:[{...artifact,scenarioId:"other"}],evidence:[]}),/invalid artifact/);n++;console.log("PASS cross-scenario artifact laundering blocked");

console.log(`visual evidence runtime: PASS (${n} assertions)`);
