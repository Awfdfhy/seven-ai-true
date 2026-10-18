const assert=require('assert/strict');
const fs=require('fs'),path=require('path'),os=require('os');
const {parseBadging,parseCertificates,verifyBinary,buildTool,buildToolCommand}=require('./binary-verification.cjs');
const expected={packageName:'ai.seven.v243',versionCode:243,versionName:'2.4.3'},certificate='a'.repeat(64);
const badging="package: name='ai.seven.v243' versionCode='243' versionName='2.4.3' platformBuildVersionName='16'\n";
const signature='Verifies\nSigner #1 certificate SHA-256 digest: '+certificate+'\n';
function run(name){return {status:0,stdout:name==='aapt'?badging:signature,stderr:''}}
const result=verifyBinary('candidate.apk',expected,{run,tool:x=>x});assert.equal(result.signatureVerified,true);assert.deepEqual(result.signerCertificateSha256,[certificate]);assert.equal(result.upgradeContinuity,'UNVERIFIED');
assert.deepEqual(parseBadging(badging),expected);
for(const change of [{packageName:'wrong.app'},{versionCode:244},{versionName:'old'}])assert.throws(()=>verifyBinary('candidate.apk',{...expected,...change},{run,tool:x=>x}),/mismatch/);
assert.throws(()=>parseBadging("package: name='ai.seven.v243' versionCode='NaN' versionName='2.4.3'"),/identity/);
assert.throws(()=>parseCertificates('Signer #1 public key SHA-256 digest: '+certificate),/certificate unavailable/);
assert.deepEqual(parseCertificates('Signer (minSdkVersion=33, maxSdkVersion=2147483647) certificate SHA-256 digest: '+certificate+'\nSigner (minSdkVersion=28, maxSdkVersion=32) certificate SHA-256 digest: '+certificate+'\n'),[certificate]);
assert.deepEqual(parseCertificates('Signer (minSdkVersion=33 (dev release=true), maxSdkVersion=2147483647) certificate SHA-256 digest: '+certificate.toUpperCase()),[certificate]);
assert.throws(()=>parseCertificates('Source Stamp Signer certificate SHA-256 digest: '+certificate),/certificate unavailable/);
const sdkCertificate='3901d241232f31c6815adc3fb04cb2a8bed4a8dfb45ee4f8c9b58eb87c9c0833';
const sdkOutput='Verifies\nVerified using v2 scheme (APK Signature Scheme v2): true\nNumber of signers: 1\nV2 Signer: certificate SHA-256 digest: '+sdkCertificate+'\nV2 Signer: public key SHA-256 digest: '+certificate+'\n';
assert.deepEqual(parseCertificates(sdkOutput),[sdkCertificate]);
assert.deepEqual(parseCertificates('V3.1 Signer: certificate SHA-256 digest: '+certificate+'\nV3.2 Signer: certificate SHA-256 digest: '+certificate),[certificate]);
assert.throws(()=>parseCertificates('V2 Signer: public key SHA-256 digest: '+certificate),/certificate unavailable/);
assert.throws(()=>verifyBinary('unsigned.apk',expected,{tool:x=>x,run:name=>name==='aapt'?run(name):{status:1,stderr:'DOES NOT VERIFY'}}),/verification failed/);
assert.throws(()=>verifyBinary('candidate.apk',expected,{tool:x=>x,run:()=>({status:null,error:new Error('ENOENT')})}),/verification failed/);

// buildTool must resolve the platform-suffixed filenames that Android SDK build-tools actually
// ship. On Windows the binaries are `aapt.exe` and `apksigner.bat`; on POSIX they have no suffix.
// The previous implementation probed only the bare name, so on Windows it returned the unresolved
// string and spawnSync failed with ENOENT -- verify-apk.cjs could never run there. The previous
// test stubbed buildTool out entirely, so nothing caught it.
{
  const sdk=fs.mkdtempSync(path.join(os.tmpdir(),'sdk-probe-'));
  // Reproduce a REAL Windows SDK layout: build-tools ship as `aapt.exe` / `apksigner.bat` and there
  // are no extensionless binaries. Probing only the bare name therefore resolves to a path that
  // does not exist. (An earlier version of this test also created bare names in an older
  // build-tools dir, which let the broken implementation pass by accident.)
  const newest=path.join(sdk,'build-tools','36.0.0');
  const older=path.join(sdk,'build-tools','35.0.0');
  fs.mkdirSync(newest,{recursive:true});fs.mkdirSync(older,{recursive:true});
  const write=(dir,name)=>fs.writeFileSync(path.join(dir,name),'');
  write(older,'aapt.exe');write(older,'apksigner.bat');
  write(newest,'aapt.exe');write(newest,'apksigner.bat');
  const savedRoot=process.env.ANDROID_SDK_ROOT,savedHome=process.env.ANDROID_HOME;
  process.env.ANDROID_SDK_ROOT=sdk;process.env.ANDROID_HOME=sdk;
  try{
    const resolvedAapt=buildTool('aapt');
    const resolvedSigner=buildTool('apksigner');
    // The decisive assertion: the resolved path must actually exist on disk. The old
    // implementation returned the unresolved bare name here, which is what made verify-apk.cjs
    // fail with spawnSync ENOENT on Windows.
    assert.ok(fs.existsSync(resolvedAapt),'buildTool("aapt") must resolve to an existing file, got '+resolvedAapt);
    assert.ok(fs.existsSync(resolvedSigner),'buildTool("apksigner") must resolve to an existing file, got '+resolvedSigner);
    assert.equal(path.dirname(resolvedAapt),newest,'newest build-tools version must win');
    // And the name must carry the suffix the platform actually uses.
    assert.ok(/aapt(\.exe|\.bat|\.cmd)?$/.test(resolvedAapt),'resolved aapt must end with a real name, got '+resolvedAapt);
    assert.ok(/apksigner(\.exe|\.bat|\.cmd)?$/.test(resolvedSigner),'resolved apksigner must end with a real name, got '+resolvedSigner);

    // apksigner is only a .bat wrapper on Windows, and Node cannot spawnSync a .bat without
    // shell:true. shell:true concatenates args UNESCAPED (DEP0190), so the APK path would flow
    // straight into a cmd.exe command line inside the signature gate. The resolver must instead
    // return a direct `java -jar` invocation, so no shell is involved at all.
    // The jar must exist in the version the resolver actually picks (newest wins), otherwise the
    // resolver legitimately falls back to the bare .bat.
    fs.mkdirSync(path.join(newest,'lib'),{recursive:true});
    fs.mkdirSync(path.join(older,'lib'),{recursive:true});
    fs.writeFileSync(path.join(newest,'lib','apksigner.jar'),'');
    fs.writeFileSync(path.join(older,'lib','apksigner.jar'),'');
    const cmd=buildToolCommand('apksigner',['verify','--print-certs','C:/tmp/a b.apk']);
    assert.notEqual(typeof cmd,'string','apksigner must not resolve to a bare .bat string on Windows');
    assert.equal(typeof cmd,'object','a batch wrapper must resolve to a {file,args} command');
    assert.ok(/java(\.exe)?$/.test(cmd.file),'apksigner must run via java, got '+cmd.file);
    assert.ok(/java(\.exe)?$/.test(path.basename(cmd.file)),'java launcher expected, got '+cmd.file);
    assert.equal(cmd.args[0],'-jar','apksigner must be invoked with -jar');
    assert.ok(/apksigner\.jar$/.test(cmd.args[1]),'apksigner jar expected, got '+cmd.args[1]);
    // The APK path must be passed as a discrete argv entry, never concatenated into a shell string.
    assert.deepEqual(cmd.args.slice(2),['verify','--print-certs','C:/tmp/a b.apk'],'apk path must survive as its own argv element');
    // The spawn must not require a shell: capture every spawn and assert none sets shell:true.
    const spawns=[];
    const stubRun=(file,argv,opts)=>{spawns.push({file,argv,shell:Boolean(opts&&opts.shell)});return {status:0,stdout:/aapt/.test(String(file))?badging:signature,stderr:''}};
    verifyBinary('candidate.apk',expected,{tool:buildToolCommand,run:stubRun});
    assert.equal(spawns.length,2,'expected one aapt spawn and one apksigner spawn');
    assert.ok(spawns.every(s=>s.shell===false),'signature verification must never spawn through a shell');
    const signerSpawn=spawns.find(s=>/java/.test(String(s.file)));
    assert.ok(signerSpawn,'apksigner must spawn java directly');
    assert.ok(!/\.(bat|cmd)$/i.test(String(signerSpawn.file)),'must not spawn the .bat wrapper, got '+signerSpawn.file);
    assert.ok(signerSpawn.argv.includes('candidate.apk'),'apk path must be passed as a discrete argv element');
  }finally{
    if(savedRoot===undefined)delete process.env.ANDROID_SDK_ROOT;else process.env.ANDROID_SDK_ROOT=savedRoot;
    if(savedHome===undefined)delete process.env.ANDROID_HOME;else process.env.ANDROID_HOME=savedHome;
    fs.rmSync(sdk,{recursive:true,force:true});
  }
}
console.log('APK binary gate: PASS (identity, wrong package/version, malformed data, unsigned APK, missing SDK tool, Windows-suffixed build tools)');
