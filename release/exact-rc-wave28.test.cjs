const assert=require('assert/strict');
const fs=require('fs');
const path=require('path');
const exact=require('./exact-rc-seal.cjs');
const android=require('./android-visual-certification.cjs');
const artifact=require('./android-ci-release-artifact.cjs');
const audit=require('./dependency-audit-gate.cjs');

const ROOT=path.resolve(__dirname,'..');
const read=(rel)=>fs.readFileSync(path.join(ROOT,rel),'utf8');
const policy=JSON.parse(read('release/exact-rc-policy.json'));
let n=0;
const ok=(v,m)=>{assert.ok(v,m);n++};
const eq=(a,b,m)=>{assert.equal(a,b,m);n++};

ok(exact.validatePolicy(policy,ROOT),'exact RC policy must verify against current repository');
eq(policy.branch,'ultimate-polish-v1');
eq(policy.applicationId,'ai.seven.app');
eq(policy.artifactKind,'APK');
eq(policy.requiredAndroidScenarioCount,11);
eq(policy.protectedSource.bytes,658133);
eq(policy.protectedSource.gitBlobSha1,'3e8dfa8e7da7124e16504140eb9631c10cabf053');
eq(policy.signingClaimBoundary,'RELEASE_VARIANT_CI_SIGNED_NOT_STORE_PRODUCTION_SIGNING');
eq(policy.rcClaimBoundary,'EXACT_RC_CI_SIGNED_NOT_STORE_PRODUCTION_SIGNING_NO_PHYSICAL_DEVICE_CLAIM');
ok(policy.requirePhysicalDevice===false,'CI RC must not manufacture a physical-device claim');

const suites=exact.createSuiteManifest(ROOT);
ok(suites.count>=policy.minCanonicalSuites,`canonical suite floor regressed: ${suites.count}`);
ok(/^[0-9a-f]{64}$/.test(suites.sha256),'suite manifest must be SHA-256 bound');
for(const rel of [
  'release/full-seven-red-team-wave27.test.cjs',
  'release/exact-rc-wave28.test.cjs',
  'release/material-design-quality-wave25.test.cjs',
  'release/visual-red-team-wave26.test.cjs',
  'release/product-wiring-contract.test.cjs',
  'release/release-readiness.test.cjs',
  'release/source-integrity.test.cjs'
]) ok(suites.entries.some(x=>x.path===rel),`exact RC suite manifest lost ${rel}`);

const sourcePath=path.join(ROOT,policy.protectedSource.path);
eq(fs.statSync(sourcePath).size,policy.protectedSource.bytes);
eq(exact.gitBlobSha1(sourcePath),policy.protectedSource.gitBlobSha1);
for(const rel of policy.requiredFiles){ok(fs.existsSync(path.join(ROOT,rel)),`required RC evidence missing: ${rel}`);ok(!/(^|[\/_.-])(probe|demo|mock|placeholder|fake)([\/_.-]|$)/i.test(rel),`weak evidence class in RC policy: ${rel}`)}

const commit='1'.repeat(40),apkSha='a'.repeat(64),signer='b'.repeat(64);
const candidate=artifact.createCandidate({branch:policy.branch,commitSha:commit,applicationId:policy.applicationId,versionName:'1.0',versionCode:1,artifactSha256:apkSha,signerCertSha256:signer,sourceRef:'github-actions:123:1'});
const exportReceipt=artifact.createExportReceipt({candidate,exportedArtifactSha256:apkSha,sourceRef:'github-actions:123:1:export'});
const buildBundle=artifact.createBundle({candidate,exportReceipt});
const certBody={schema:'seven.android-visual-certification.v1',version:'1.0.0',buildSeal:buildBundle.build.seal,artifactSha256:apkSha,candidateSeal:candidate.seal,deviceSeals:['d'.repeat(64),'e'.repeat(64)],captureSeals:android.SCENARIOS.map((_,i)=>String(i).padStart(64,'0')),covered:[...android.SCENARIOS].sort(),missing:[],failures:[],verdict:'PASS',evidenceTier:'RELEASE_BUILD_DEVICE',physicalDeviceIncluded:false,claim:'ANDROID_RELEASE_VISUAL_MATRIX_NO_PHYSICAL_DEVICE_CLAIM'};
const certification={...certBody,seal:android.hash(certBody)};
ok(android.verifyCertification(certification),'synthetic certification fixture must itself be sealed');
const visual={schema:'seven.android-release-visual-evidence-merge.v1',buildSeal:buildBundle.build.seal,artifactSha256:apkSha,profileIds:['api24-legacy','api33-compact','api36-modern'],deviceSeals:certBody.deviceSeals,captureCount:11,certification,claimBoundary:'ANDROID_RELEASE_VISUAL_MATRIX_CONTRACT_PASS'};
const dependencyAudit=audit.summarize({},{});
ok(audit.verifySummary(dependencyAudit),'dependency audit fixture must verify');
ok(dependencyAudit.gate.productionVulnerabilityFree&&dependencyAudit.gate.fullGraphVulnerabilityFree,'RC dependency fixture must be clean');

const rc=exact.createExactRc({buildBundle,visual,dependencyAudit,artifactBytes:4994799,root:ROOT,policy,branch:policy.branch,commitSha:commit,sourceRef:'github-actions:123:1:wave28'});
ok(exact.verifyExactRc(rc),'new exact RC seal must verify');
eq(rc.commitSha,commit);
eq(rc.artifact.sha256,apkSha);
eq(rc.artifact.bytes,4994799);
eq(rc.identity.buildSeal,buildBundle.build.seal);
eq(rc.identity.candidateSeal,candidate.seal);
eq(rc.identity.visualCertificationSeal,certification.seal);
eq(rc.references.dependencyAuditSeal,dependencyAudit.seal);
eq(rc.coverage.androidScenarioCount,11);
eq(rc.coverage.canonicalSuites,suites.count);
eq(rc.coverage.suiteManifestSha256,suites.sha256);
ok(rc.coverage.physicalDeviceIncluded===false,'RC must preserve no-physical-device truth boundary');
ok(exact.verifyExactRc(rc,{branch:policy.branch,commitSha:commit,artifactSha256:apkSha,artifactBytes:4994799,buildSeal:buildBundle.build.seal,candidateSeal:candidate.seal}),'expected exact identities must verify');
ok(!exact.verifyExactRc(rc,{commitSha:'2'.repeat(40)}),'cross-commit replay must fail expected-identity verification');
ok(!exact.verifyExactRc(rc,{artifactSha256:'c'.repeat(64)}),'artifact substitution must fail expected-identity verification');
ok(!exact.verifyExactRc(rc,{artifactBytes:4994800}),'artifact byte drift must fail expected-identity verification');
ok(!exact.verifyExactRc(rc,{buildSeal:'f'.repeat(64)}),'build identity substitution must fail expected-identity verification');

for(const mutate of [
  x=>{x.commitSha='2'.repeat(40)},
  x=>{x.artifact.sha256='c'.repeat(64)},
  x=>{x.coverage.androidScenarioCount=10},
  x=>{x.signing.claimBoundary='STORE_SIGNED'},
  x=>{x.coverage.physicalDeviceIncluded=true},
  x=>{x.protectedSource.bytes=1},
  x=>{x.references.wave27GateSha256='0'.repeat(64)}
]){const forged=JSON.parse(JSON.stringify(rc));mutate(forged);ok(!exact.verifyExactRc(forged),'tampered RC seal must fail closed')}

assert.throws(()=>exact.createExactRc({buildBundle,visual:{...visual,artifactSha256:'c'.repeat(64)},dependencyAudit,artifactBytes:4994799,root:ROOT,policy,branch:policy.branch,commitSha:commit,sourceRef:'x'}),/drift/);n++;
const dirtyAudit=JSON.parse(JSON.stringify(dependencyAudit));dirtyAudit.gate.fullGraphVulnerabilityFree=false;dirtyAudit.seal=audit.hash(Object.fromEntries(Object.entries(dirtyAudit).filter(([k])=>k!=='seal')));
assert.throws(()=>exact.createExactRc({buildBundle,visual,dependencyAudit:dirtyAudit,artifactBytes:4994799,root:ROOT,policy,branch:policy.branch,commitSha:commit,sourceRef:'x'}),/full dependency graph/);n++;

const merge=read('release/merge-android-visual-evidence.cjs');
ok(merge.includes("require('./exact-rc-seal.cjs')")||merge.includes('require("./exact-rc-seal.cjs")'),'Android evidence merge must load Wave28 exact RC sealer');
ok(merge.includes('GITHUB_ACTIONS'),'Wave28 exact RC generation must be CI-bound');
ok(merge.includes('generateFromFiles'),'Android evidence merge must generate exact RC from sealed files');
ok(merge.includes('evidence/android/exact-rc.json')||merge.includes('exact-rc.json'),'exact RC must persist inside uploaded Android evidence bundle');

const workflow=read('.github/workflows/android-apk.yml');
ok(workflow.includes('Merge complete release-device Android visual matrix'),'Wave28 must remain downstream of complete Android matrix');
ok(workflow.includes('Verify APK again after device tests'),'Wave28 evidence head must retain post-device APK verification');
ok(workflow.includes('evidence/android'),'exact RC evidence must ride the retained Android evidence artifact');

console.log(`Wave 28 Exact Release Candidate Gate: PASS (${n} assertions; ${suites.count} canonical suites; ${android.SCENARIOS.length}/11 Android scenarios; policy ${exact.fileHash(path.join(ROOT,'release/exact-rc-policy.json')).slice(0,16)}…)`);
