const assert=require('assert');
const fs=require('fs');
const crypto=require('crypto');
const os=require('os');
const path=require('path');
const cp=require('child_process');
const proof=require('./production-release-proof.cjs');

const root=path.resolve(__dirname,'..');
const workflow=fs.readFileSync(path.join(root,'.github','workflows','android-production-release.yml'),'utf8');
const patcher=fs.readFileSync(path.join(root,'apk','patch-production-signing.cjs'),'utf8');
const handoff=fs.readFileSync(path.join(root,'docs','project-memory','current','PRODUCTION_RELEASE_HANDOFF.md'),'utf8');
const status=fs.readFileSync(path.join(root,'docs','project-memory','current','STATUS.md'),'utf8');

assert.match(workflow,/workflow_dispatch:/);
assert.doesNotMatch(workflow,/\npush:/);
assert.match(workflow,/contents:\s*read/);
assert.match(workflow,/SEVEN_UPLOAD_KEYSTORE_B64/);
assert.match(workflow,/:app:bundleRelease/);
assert.match(workflow,/jarsigner -verify -strict/);
assert.match(workflow,/apksigner/);
assert.match(workflow,/production-release-proof\.cjs/);
assert.match(workflow,/seven-play-ready-aab/);
assert.match(workflow,/seven-upload-key-release-proof/);
assert.match(patcher,/sevenReleaseKeystore/);
assert.match(patcher,/signingConfigs\.sevenRelease/);
assert.match(handoff,/not.*Play.*publication/is);
assert.match(handoff,/physical-device/is);
assert.match(status,/Play\/store production signing|Play app signing/is);
assert.match(status,/Do not merge.*main/is);

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'seven-prod-proof-'));
const aab=path.join(tmp,'app-release.aab');
const apk=path.join(tmp,'app-release.apk');
fs.writeFileSync(aab,'aab-seven');
fs.writeFileSync(apk,'apk-seven');
const commit='a'.repeat(40), signer='b'.repeat(64);
const p=proof.createProof({bundlePath:aab,apkPath:apk,branch:'ultimate-polish-v1',commit,sourceRef:'test:1',applicationId:'ai.seven.app',versionName:'1.0',versionCode:'1',signerSha256:signer});
assert.equal(proof.verifyProof(p,{"identity.commit":commit}),true);
assert.equal(p.boundaries.uploadKeySigned,true);
assert.equal(p.boundaries.playAppSigningKey,false);
assert.equal(p.boundaries.publishedToPlay,false);
assert.equal(p.boundaries.physicalDeviceCertified,false);
assert.throws(()=>proof.verifyProof({...p,verdict:'FAIL'}));
assert.throws(()=>proof.verifyProof({...p,boundaries:{...p.boundaries,publishedToPlay:true}}));

const protectedPath=path.join(root,'seven_ai-final.html');
assert.equal(fs.statSync(protectedPath).size,658133);
const gitBlob=cp.execFileSync('git',['hash-object','seven_ai-final.html'],{cwd:root,encoding:'utf8'}).trim();
assert.equal(gitBlob,'3e8dfa8e7da7124e16504140eb9631c10cabf053');

console.log('Production Release Contract: PASS (Play-ready upload-key lane, fail-closed truth boundaries, protected source intact)');
