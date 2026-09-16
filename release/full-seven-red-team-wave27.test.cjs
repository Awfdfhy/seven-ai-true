const assert=require('assert/strict');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');

const ROOT=path.resolve(__dirname,'..');
const p=(...xs)=>path.join(ROOT,...xs);
const read=(rel)=>fs.readFileSync(p(rel),'utf8');
const exists=(rel)=>fs.existsSync(p(rel));
const tests=(dir)=>fs.readdirSync(p(dir)).filter(x=>x.endsWith('.test.cjs')).sort().map(x=>`${dir}/${x}`);
let n=0;
const ok=(v,m)=>{assert.ok(v,m);n++};
const eq=(a,b,m)=>{assert.equal(a,b,m);n++};

const releaseTests=tests('release');
const evolutionTests=tests('evolution');
const hardeningTests=tests('hardening');
const fixedSuites=['eval/harness.cjs','memory.cjs','runtime-smoke.cjs','verify.cjs','release/static-audit.cjs','release/release-verify.cjs'];
const suiteUniverse=[...fixedSuites,...releaseTests,...evolutionTests,...hardeningTests];
const suiteSet=new Set(suiteUniverse);

ok(releaseTests.length>=45,'release test surface unexpectedly collapsed');
ok(evolutionTests.length>=10,'evolution verification surface unexpectedly collapsed');
ok(hardeningTests.length>=10,'hardening verification surface unexpectedly collapsed');
eq(suiteSet.size,suiteUniverse.length,'duplicate suite identity detected');

const runner=read('all.cjs');
for(const token of ["readdirSync(evolutionDir)","readdirSync(releaseDir)","readdirSync(hardeningDir)","endsWith('.test.cjs')","static-audit.cjs","release-verify.cjs","'eval','harness.cjs'","memory.cjs","runtime-smoke.cjs","verify.cjs"])
  ok(runner.includes(token),`canonical test runner lost ${token}`);

for(const rel of [
  'release/product-wiring-contract.test.cjs',
  'release/material-design-quality-wave25.test.cjs',
  'release/visual-red-team-wave26.test.cjs',
  'release/full-seven-red-team-wave27.test.cjs',
  'release/source-integrity.test.cjs',
  'release/release-readiness.test.cjs'
]) ok(suiteSet.has(rel),`mandatory release gate missing from canonical suite discovery: ${rel}`);

const allTestNames=suiteUniverse.join('\n').toLowerCase();
const families={
  product:/product-wiring/,
  materials:/material-design-quality/,
  visual_red_team:/visual-red-team/,
  accessibility:/accessibility/,
  rtl:/rtl/,
  motion:/motion/,
  performance:/performance/,
  android:/android/,
  generated_ui:/generated-ui/,
  specialist_ui:/specialist-ui|workspace-ui/,
  supply_chain:/supply-chain|dependency-audit/,
  models:/model|provider/,
  adaptive_compute:/compute|adaptive/,
  coding:/coding/,
  verification:/judge|benchmark|eval/,
  self_evolution:/evolution/,
  research:/research|retrieval/,
  canon:/canon|title/,
  rpg:/rpg|story|world/,
  tools:/tool|execution/,
  memory_context:/memory|context/,
  vision:/vision/,
  recovery:/recovery|rollback|durable/,
  integrity:/integrity|source-integrity|parity/
};
for(const [family,re] of Object.entries(families))ok(re.test(allTestNames),`Full Seven Red Team lost ${family} test-family coverage`);

const matrix=JSON.parse(read('docs/project-memory/current/PRODUCT_WIRING_MATRIX.json'));
eq(matrix.schema,'seven.product-wiring-matrix.v1');
eq(matrix.version,2);
ok(Array.isArray(matrix.rows)&&matrix.rows.length>=29,'product wiring coverage regressed');
const ids=new Set();
const weakEvidence=/(^|[\/_.-])(probe|demo|mock|placeholder|fake)([\/_.-]|$)/i;
for(const row of matrix.rows){
  ok(row&&typeof row==='object','invalid product row');
  ok(typeof row.capability_id==='string'&&row.capability_id.length>2,'product row missing capability identity');
  ok(!ids.has(row.capability_id),`duplicate product capability ${row.capability_id}`);ids.add(row.capability_id);
  ok(Array.isArray(row.evidence_refs)&&row.evidence_refs.length>0,`missing evidence for ${row.capability_id}`);
  for(const ref of row.evidence_refs){
    ok(typeof ref==='string'&&ref.length>2,`invalid evidence ref for ${row.capability_id}`);
    ok(!weakEvidence.test(ref),`weak/fabricated evidence class used for release claim: ${ref}`);
    ok(exists(ref),`stale product evidence ref: ${ref}`);
  }
  if(row.release_relevant){
    ok(row.status==='WIRED_VERIFIED'||row.status==='INFRA_VERIFIED',`release capability is not verified: ${row.capability_id}`);
    ok(row.entry_point_class!=='NO_USER_SURFACE',`release capability has no product/runtime surface: ${row.capability_id}`);
  }else{
    ok(row.status==='NOT_RELEASE_RELEVANT',`excluded capability lacks explicit exclusion state: ${row.capability_id}`);
    ok(typeof row.rationale==='string'&&row.rationale.length>10,`excluded capability lacks rationale: ${row.capability_id}`);
  }
}
for(const partialId of ['vision.live_multimodal_input','projects.persistent_full_system']){
  const row=matrix.rows.find(x=>x.capability_id===partialId);
  ok(row&&row.release_relevant===false&&row.entry_point_class==='NO_USER_SURFACE'&&row.status==='NOT_RELEASE_RELEVANT',`partial subsystem was over-promoted: ${partialId}`);
}

const source=fs.readFileSync(p('seven_ai-final.html'));
const blob=crypto.createHash('sha1').update(Buffer.from(`blob ${source.length}\0`)).update(source).digest('hex');
eq(source.length,658133,'protected source byte size changed');
eq(blob,'3e8dfa8e7da7124e16504140eb9631c10cabf053','protected source blob changed');

const pkg=JSON.parse(read('package.json'));
for(const [kind,deps] of Object.entries({dependencies:pkg.dependencies||{},devDependencies:pkg.devDependencies||{}})){
  for(const [name,version] of Object.entries(deps)){
    ok(typeof version==='string'&&version.length>0,`${kind} ${name} has no version`);
    ok(!/^[~^*]/.test(version)&&!/[xX*]/.test(version),`${kind} ${name} is not exactly pinned: ${version}`);
  }
}
ok(Object.keys(pkg.dependencies||{}).length<=4,'production dependency surface expanded unexpectedly');

for(const wf of ['.github/workflows/seven-tests.yml','.github/workflows/android-apk.yml']){
  const yml=read(wf);
  ok(/permissions:\s*\n\s*contents:\s*read/m.test(yml),`${wf} lost read-only contents permission`);
  const uses=[...yml.matchAll(/uses:\s*([^\s#]+)/g)].map(m=>m[1]);
  ok(uses.length>0,`${wf} has no action identities`);
  for(const action of uses)ok(/@[0-9a-f]{40}$/i.test(action),`${wf} contains unpinned action: ${action}`);
  ok(!/pull_request_target\s*:/i.test(yml),`${wf} must not use pull_request_target for this release gate`);
}

const invariantEvidence=[
  ['authority conservation',/authority|permission/i,['hardening','evolution']],
  ['side-effect uncertainty',/side.?effect|effect/i,['hardening','release']],
  ['evidence lineage',/lineage|evidence/i,['hardening','evolution','release']],
  ['bounded recovery',/rollback|recovery/i,['hardening','evolution']],
  ['cancellation',/cancel/i,['release','hardening']],
  ['Arabic/RTL',/rtl|arabic/i,['release']],
  ['reduced motion',/reduced.?motion|motion/i,['release']],
  ['resource governance',/performance|resource|budget/i,['release','evolution']]
];
for(const [label,re,dirs] of invariantEvidence){
  const candidates=suiteUniverse.filter(x=>dirs.some(d=>x.startsWith(d+'/')));
  let found=false;
  for(const rel of candidates){
    if(!exists(rel)) continue;
    const text=read(rel);
    if(re.test(rel)||re.test(text)){found=true;break;}
  }
  ok(found,`Full Seven Red Team lost invariant evidence: ${label}`);
}

const staticAudit=read('release/static-audit.cjs');
ok(staticAudit.includes('if(layerBytes>100000)'), 'startup release-layer budget guard disappeared');
ok(staticAudit.includes('const lazyWorkspaceBudgetBytes=160000'), 'lazy workspace package budget guard disappeared');
ok(staticAudit.includes('const apkStaticBudgetBytes=8*1024*1024'), 'static APK budget guard disappeared');
ok(staticAudit.includes("built.pdfLoadMode!=='lazy-local'"),'lazy-local PDF invariant disappeared');
ok(staticAudit.includes("built.workspaceLoadMode!=='lazy-local'"),'lazy-local workspace invariant disappeared');
ok(exists('release/mobile-performance-browser.test.cjs'),'browser performance proof missing');
ok(exists('release/device-release-evidence.test.cjs'),'device release evidence proof missing');
ok(exists('release/android-visual-certification.test.cjs'),'Android visual certification proof missing');

const status=read('docs/project-memory/current/STATUS.md');
ok(/store-production signing|store production signing|Play\/store production signing/i.test(status),'status lost store-signing truth boundary');
ok(/physical-device/i.test(status),'status lost physical-device truth boundary');

const manifest=crypto.createHash('sha256').update(JSON.stringify({releaseTests,evolutionTests,hardeningTests,capabilities:[...ids].sort()})).digest('hex');
console.log(`Wave 27 Full Seven Red Team + E2E Gate: PASS (${n} assertions; ${suiteUniverse.length} canonical suites; ${matrix.rows.length} capability bindings; manifest ${manifest})`);
