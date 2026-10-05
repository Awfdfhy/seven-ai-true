const fs=require('fs'),path=require('path'),crypto=require('crypto'),{spawnSync}=require('child_process');
function sha256(bytes){return crypto.createHash('sha256').update(bytes).digest('hex')}
function inventory(root,relative=''){
  return fs.readdirSync(path.join(root,relative),{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(entry=>{
    const name=relative?relative+'/'+entry.name:entry.name;
    if(name==='seven-packaging.json')return [];
    if(entry.isDirectory())return inventory(root,name);
    if(!entry.isFile())throw new Error('Non-file web asset refused: '+name);
    const bytes=fs.readFileSync(path.join(root,name));return [{path:name,bytes:bytes.length,sha256:sha256(bytes)}];
  });
}
function gitIdentity(root){
  const head=spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'});
  if(head.status!==0||!/^[a-f0-9]{40}$/.test(head.stdout.trim()))throw new Error('Build commit identity unavailable');
  const diff=spawnSync('git',['diff','--quiet','HEAD','--'],{cwd:root});
  if(![0,1].includes(diff.status))throw new Error('Build source status unavailable');
  const commit=head.stdout.trim();
  if(process.env.GITHUB_SHA&&process.env.GITHUB_SHA!==commit)throw new Error('Checkout does not match workflow SHA');
  return {sourceCommit:commit,sourceDirty:diff.status===1,workflowRunId:process.env.GITHUB_RUN_ID||null};
}
function verifyPayload(manifest,read,{sourceCommit,allowDirty=false}={}){
  if(!manifest||manifest.format!=='seven-android-web-payload'||manifest.version!==5)throw new Error('Missing current build provenance');
  if(!/^[a-f0-9]{40}$/.test(manifest.sourceCommit||''))throw new Error('Invalid build commit identity');
  if(sourceCommit&&manifest.sourceCommit!==sourceCommit)throw new Error('APK commit mismatch');
  if(typeof manifest.sourceDirty!=='boolean'||(!allowDirty&&manifest.sourceDirty))throw new Error('APK source tree was dirty');
  if(!Array.isArray(manifest.files)||!manifest.files.some(x=>x.path==='index.html'))throw new Error('Missing payload inventory');
  const seen=new Set();
  for(const file of manifest.files){
    if(!file||typeof file.path!=='string'||file.path.startsWith('/')||file.path.split('/').some(x=>!x||x==='..'||x==='.')||file.path.includes('\\')||seen.has(file.path))throw new Error('Invalid payload path');
    seen.add(file.path);const bytes=read(file.path);
    if(!Buffer.isBuffer(bytes)||bytes.length!==file.bytes||sha256(bytes)!==file.sha256)throw new Error('APK payload mismatch: '+file.path);
  }
  return true;
}
module.exports={sha256,inventory,gitIdentity,verifyPayload};
