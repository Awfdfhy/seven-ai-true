const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
function parseBadging(output){
  const line=String(output).split('\n').find(x=>x.startsWith('package:'))||'';
  const field=name=>(line.match(new RegExp("(?:^|\\s)"+name+"='([^']*)'"))||[])[1];
  const packageName=field('name'),versionCode=field('versionCode'),versionName=field('versionName');
  if(!packageName||!/^\d+$/.test(versionCode||'')||!versionName)throw new Error('APK binary identity unavailable');
  return {packageName,versionCode:Number(versionCode),versionName};
}
function parseCertificates(output){
  const certificates=[...String(output).matchAll(/^(?:Signer (?:#\d+|\(minSdkVersion=[^\r\n]*\))|V\d+(?:\.\d+)? Signer:) certificate SHA-256 digest: ([a-f0-9]{64})[ \t]*$/gmi)].map(x=>x[1].toLowerCase());
  if(!certificates.length)throw new Error('APK signing certificate unavailable: '+String(output).slice(0,2500));
  return [...new Set(certificates)];
}
function assertIdentity(actual,expected){
  for(const key of ['packageName','versionCode','versionName'])if(actual[key]!==expected[key])throw new Error('APK binary '+key+' mismatch');
}
// Android SDK build-tools ship as `aapt.exe` / `apksigner.bat` on Windows but as extensionless
// binaries on POSIX. Probing the bare name only found them on macOS/Linux, so on Windows
// verify-apk.cjs fell through to the bare name and spawnSync failed with ENOENT.
const EXECUTABLE_SUFFIXES=['.exe','.bat','.cmd',''];
function resolveExecutable(base){
  for(const suffix of EXECUTABLE_SUFFIXES){
    const candidate=base+suffix;
    if(fs.existsSync(candidate))return candidate;
  }
  return null;
}
// `apksigner` ships on Windows as apksigner.bat, a cmd.exe wrapper around `java -jar`. Node
// refuses to spawnSync a .bat without shell:true (EINVAL), and shell:true concatenates args
// UNESCAPED (Node DEP0190) -- unacceptable in the signature-verification gate, where the APK path
// would flow into a shell command line. So for a batch wrapper we locate the underlying jar and
// run it with java directly: no shell, no escaping, no injection surface.
// Returns a spawn target: either a string executable, or {file,args} when a prefix is required.
function jarCommand(buildToolsDir,name,jarArgs){
  const javaBin=process.env.JAVA_HOME?path.join(process.env.JAVA_HOME,'bin','java'+(process.platform==='win32'?'.exe':'')):'java';
  const jar=resolveExecutable(path.join(buildToolsDir,'lib',name+'.jar'));
  if(!jar)return null;
  return {file:fs.existsSync(javaBin)?javaBin:'java',args:['-jar',jar,...jarArgs]};
}
function buildToolCommand(name,args){
  for(const sdk of [...new Set([process.env.ANDROID_SDK_ROOT,process.env.ANDROID_HOME].filter(Boolean))]){
    const root=path.join(sdk,'build-tools');if(!fs.existsSync(root))continue;
    for(const version of fs.readdirSync(root).sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}))){
      const dir=path.join(root,version);
      const resolved=resolveExecutable(path.join(dir,name));
      if(!resolved)continue;
      if(/\.(bat|cmd)$/i.test(resolved)){
        const viaJava=jarCommand(dir,name,args);
        if(viaJava)return viaJava;
      }
      return resolved;
    }
  }
  // Not inside an SDK: fall back to PATH, which resolves platform-specific suffixes itself.
  return name;
}
function buildTool(name){return buildToolCommand(name,[])}
function verifyBinary(apk,expected,{run=spawnSync,tool=buildTool}={}){
  function execute(name,args){
    const resolved=tool(name,args);
    const file=typeof resolved==='string'?resolved:resolved.file;
    const argv=typeof resolved==='string'?args:[...resolved.args,...args];
    const result=run(file,argv,{encoding:'utf8',timeout:30000,maxBuffer:4*1024*1024});
    if(result.error||result.status!==0)throw new Error('APK '+name+' verification failed: '+(result.error||String(result.stderr||'').slice(0,1000)));return result.stdout}
  const identity=parseBadging(execute('aapt',['dump','badging',apk]));assertIdentity(identity,expected);
  const signerCertificateSha256=parseCertificates(execute('apksigner',['verify','--verbose','--print-certs',apk]));
  return {...identity,signatureVerified:true,signerCertificateSha256,upgradeContinuity:'UNVERIFIED'};
}
module.exports={parseBadging,parseCertificates,assertIdentity,verifyBinary,buildTool,buildToolCommand,resolveExecutable};
