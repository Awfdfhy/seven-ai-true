const assert=require('assert/strict');
const {parseBadging,parseCertificates,verifyBinary}=require('./binary-verification.cjs');
const expected={packageName:'ai.seven.v243',versionCode:243,versionName:'2.4.3'},certificate='a'.repeat(64);
const badging="package: name='ai.seven.v243' versionCode='243' versionName='2.4.3' platformBuildVersionName='16'\n";
const signature='Verifies\nSigner #1 certificate SHA-256 digest: '+certificate+'\n';
function run(name){return {status:0,stdout:name==='aapt'?badging:signature,stderr:''}}
const result=verifyBinary('candidate.apk',expected,{run,tool:x=>x});assert.equal(result.signatureVerified,true);assert.deepEqual(result.signerCertificateSha256,[certificate]);assert.equal(result.upgradeContinuity,'UNVERIFIED');
assert.deepEqual(parseBadging(badging),expected);
for(const change of [{packageName:'wrong.app'},{versionCode:244},{versionName:'old'}])assert.throws(()=>verifyBinary('candidate.apk',{...expected,...change},{run,tool:x=>x}),/mismatch/);
assert.throws(()=>parseBadging("package: name='ai.seven.v243' versionCode='NaN' versionName='2.4.3'"),/identity/);
assert.throws(()=>parseCertificates('Signer #1 public key SHA-256 digest: '+certificate),/certificate unavailable/);
assert.throws(()=>verifyBinary('unsigned.apk',expected,{tool:x=>x,run:name=>name==='aapt'?run(name):{status:1,stderr:'DOES NOT VERIFY'}}),/verification failed/);
assert.throws(()=>verifyBinary('candidate.apk',expected,{tool:x=>x,run:()=>({status:null,error:new Error('ENOENT')})}),/verification failed/);
console.log('APK binary gate: PASS (identity, wrong package/version, malformed data, unsigned APK, missing SDK tool)');
