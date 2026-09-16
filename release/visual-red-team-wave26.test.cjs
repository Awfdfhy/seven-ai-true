"use strict";
const assert=require("assert/strict");
const crypto=require("crypto");
const fs=require("fs");
const path=require("path");

const ROOT=path.resolve(__dirname,"..");
const read=(p)=>fs.readFileSync(path.join(ROOT,p),"utf8");
const exists=(p)=>fs.existsSync(path.join(ROOT,p));
let assertions=0;
const ok=(value,message)=>{assert.ok(value,message);assertions++;};
const eq=(actual,expected,message)=>{assert.equal(actual,expected,message);assertions++;};

// Wave 26 is an orchestration/red-team gate, not a replacement for the specialist gates.
// It fails closed if any required visual/product proof surface disappears or is downgraded.
const requiredGateFiles=[
  "release/visual-red-team.cjs",
  "release/visual-red-team.test.cjs",
  "release/android-visual-certification.cjs",
  "release/android-visual-certification.test.cjs",
  "release/visual-evidence-runtime.test.cjs",
  "release/visual-evidence-runtime-passb.test.cjs",
  "release/visual-evidence-runtime-final.test.cjs",
  "release/design-lint.test.cjs",
  "release/design-genome.test.cjs",
  "release/design-genome-passb.test.cjs",
  "release/contrast.test.cjs",
  "release/brand-asset-contract.test.cjs",
  "release/global-ui-contract.test.cjs",
  "release/global-ui-browser.test.cjs",
  "release/specialist-ui-contract.test.cjs",
  "release/specialist-ui-browser.test.cjs",
  "release/generated-ui-contract.test.cjs",
  "release/generated-ui-browser.test.cjs",
  "release/motion-contract.test.cjs",
  "release/motion-browser.test.cjs",
  "release/rtl-contract.test.cjs",
  "release/rtl-browser.test.cjs",
  "release/rtl-mobile.test.cjs",
  "release/accessibility-contract.test.cjs",
  "release/accessibility-browser.test.cjs",
  "release/mobile-performance-contract.test.cjs",
  "release/mobile-performance-browser.test.cjs",
  "release/product-wiring-contract.test.cjs",
  "release/product-wiring-browser.test.cjs",
  "release/source-integrity.test.cjs"
];
for(const file of requiredGateFiles){
  ok(exists(file),`Wave 26 required gate missing: ${file}`);
  ok(fs.statSync(path.join(ROOT,file)).size>500,`Wave 26 rejects empty/token gate: ${file}`);
}

// Ensure the umbrella runner still discovers every release *.test.cjs, including this gate.
const runner=read("all.cjs");
ok(runner.includes("readdirSync(releaseDir)"),"release test auto-discovery removed");
ok(runner.includes("endsWith('.test.cjs')"),"release *.test.cjs fail-closed discovery removed");

// Protected source must remain locked. The authoritative source-integrity suite is also run by all.cjs.
const sourceLock=read("release/source-integrity.test.cjs");
ok(sourceLock.includes("expectedBytes=658133"),"protected source byte lock drifted");
ok(sourceLock.includes("3e8dfa8e7da7124e16504140eb9631c10cabf053"),"protected source blob lock drifted");

// Existing Android visual red-team must retain the adversarial protections Wave 26 depends on.
const redTeamSource=read("release/visual-red-team.cjs");
const attackVectors=[
  "certification-build-drift",
  "duplicate-device",
  "invalid-capture",
  "cross-device-session-reuse",
  "stale-witness",
  "source-artifact-ref-reuse",
  "screenshot-hash-reuse-across-contexts",
  "physical-device-attestation-laundering",
  "physical-device-required"
];
for(const token of attackVectors)ok(redTeamSource.includes(token),`visual red-team attack coverage lost: ${token}`);
const visualRedTeam=require("./visual-red-team.cjs");
const androidVisual=require("./android-visual-certification.cjs");
eq(typeof visualRedTeam.redTeamAndroidVisual,"function","Android visual red-team entry point missing");
eq(typeof visualRedTeam.verifyRedTeamReport,"function","visual red-team report verifier missing");
ok(Array.isArray(androidVisual.SCENARIOS)&&androidVisual.SCENARIOS.length>=11,"Android visual scenario matrix regressed below certified coverage");
eq(new Set(androidVisual.SCENARIOS).size,androidVisual.SCENARIOS.length,"Android visual scenario matrix contains duplicates");

// Design quality may not silently regress to warnings in the two live release stylesheets.
const designTest=read("release/design-lint.test.cjs");
ok(designTest.includes("live.counts.fail,0"),"Design Lint live hard-failure floor removed");
ok(designTest.includes("live.counts.warn,0"),"Design Lint zero-warning floor removed");
ok(exists("release/seven-final.css")&&exists("release/beta-ui.css"),"live release stylesheets missing");

// Product wiring evidence must be real repository evidence, never probe/demo/mock/placeholder evidence.
const matrixPath="docs/project-memory/current/PRODUCT_WIRING_MATRIX.json";
ok(exists(matrixPath),"Product Wiring Matrix missing");
const matrix=JSON.parse(read(matrixPath));
eq(matrix.schema,"seven.product-wiring-matrix.v1","Product Wiring Matrix schema drift");
eq(matrix.version,2,"Product Wiring Matrix version drift");
ok(Array.isArray(matrix.rows)&&matrix.rows.length>=20,"Product Wiring Matrix no longer comprehensive");
const weakEvidence=/(^|[\/_.-])(probe|demo|mock|placeholder|fixture)([\/_.-]|$)/i;
const releaseRows=matrix.rows.filter(row=>row&&row.release_relevant===true);
ok(releaseRows.length>=20,"too few release-relevant product bindings for Wave 26");
for(const row of matrix.rows){
  ok(typeof row.capability_id==="string"&&row.capability_id.length>2,"invalid capability id in product wiring matrix");
  ok(Array.isArray(row.evidence_refs)&&row.evidence_refs.length>0,`missing evidence for ${row.capability_id}`);
  for(const ref of row.evidence_refs){
    ok(!weakEvidence.test(ref),`weak/fake evidence reference rejected for ${row.capability_id}: ${ref}`);
    ok(exists(ref),`stale evidence reference for ${row.capability_id}: ${ref}`);
    ok(fs.statSync(path.join(ROOT,ref)).size>0,`zero-byte evidence reference for ${row.capability_id}: ${ref}`);
  }
  if(row.release_relevant===true){
    ok(row.status!=="BLOCKED"&&row.status!=="NOT_RELEASE_RELEVANT",`release capability not ready: ${row.capability_id}`);
    ok(row.entry_point_class!=="NO_USER_SURFACE",`release capability lost product path: ${row.capability_id}`);
  }else{
    eq(row.status,"NOT_RELEASE_RELEVANT",`excluded capability must remain explicit: ${row.capability_id}`);
    eq(row.entry_point_class,"NO_USER_SURFACE",`excluded capability must not expose a fake surface: ${row.capability_id}`);
  }
}

// Prevent known foundation-only systems from being promoted by presentation/documentation drift.
for(const id of ["vision.live_multimodal_input","projects.persistent_full_system"]){
  const row=matrix.rows.find(x=>x.capability_id===id);
  ok(row,`truth-boundary row missing: ${id}`);
  eq(row.release_relevant,false,`partial capability falsely promoted: ${id}`);
  eq(row.status,"NOT_RELEASE_RELEVANT",`partial capability status falsely promoted: ${id}`);
}

// Cross-cutting visual state coverage required by the final product surface.
const states=new Set(matrix.rows.flatMap(row=>Array.isArray(row.applicable_states)?row.applicable_states:[]));
for(const state of ["ready","loading","running","streaming","success","empty","error","retry","cancel","post_cancel","permission_required","permission_denied","offline","provider_degraded","persistence_restart","long_content","malformed_input","compact_mobile"]){
  ok(states.has(state),`Wave 26 product-state coverage missing: ${state}`);
}

// Every major user-facing visual family needs both structural and real-browser evidence.
const browserPairs=[
  ["release/global-ui-contract.test.cjs","release/global-ui-browser.test.cjs"],
  ["release/specialist-ui-contract.test.cjs","release/specialist-ui-browser.test.cjs"],
  ["release/generated-ui-contract.test.cjs","release/generated-ui-browser.test.cjs"],
  ["release/motion-contract.test.cjs","release/motion-browser.test.cjs"],
  ["release/rtl-contract.test.cjs","release/rtl-browser.test.cjs"],
  ["release/accessibility-contract.test.cjs","release/accessibility-browser.test.cjs"],
  ["release/mobile-performance-contract.test.cjs","release/mobile-performance-browser.test.cjs"],
  ["release/product-wiring-contract.test.cjs","release/product-wiring-browser.test.cjs"]
];
for(const [contract,browser] of browserPairs){
  ok(exists(contract),`contract proof missing: ${contract}`);
  ok(exists(browser),`browser proof missing: ${browser}`);
}

const manifest=requiredGateFiles.concat([matrixPath,"release/seven-final.css","release/beta-ui.css"]).sort();
const manifestSha256=crypto.createHash("sha256").update(manifest.map(file=>`${file}:${fs.statSync(path.join(ROOT,file)).size}`).join("\n")).digest("hex");
console.log(`Wave 26 Visual Red Team Gate: PASS (${assertions} assertions; ${matrix.rows.length} capability bindings; ${androidVisual.SCENARIOS.length} Android scenarios; manifest ${manifestSha256})`);
