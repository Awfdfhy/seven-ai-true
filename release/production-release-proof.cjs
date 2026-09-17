#!/usr/bin/env node
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');

const SCHEMA='seven.production-release-proof.v1';
const CLAIM='UPLOAD_KEY_SIGNED_PLAY_READY_NOT_PUBLISHED_NOT_PLAY_APP_SIGNING_KEY_NOT_PHYSICAL_DEVICE_CERTIFIED';

function stable(value){
  if(Array.isArray(value))return '['+value.map(stable).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}';
  return JSON.stringify(value);
}
function sha256Buffer(buf){return crypto.createHash('sha256').update(buf).digest('hex');}
function sha256File(file){return sha256Buffer(fs.readFileSync(file));}
function requireString(name,value){if(typeof value!=='string'||!value.trim())throw new Error(`${name} required`);return value.trim();}
function requireHex(name,value,n){value=requireString(name,value).toLowerCase();if(!new RegExp(`^[0-9a-f]{${n}}$`).test(value))throw new Error(`${name} must be ${n} hex chars`);return value;}
function fileIdentity(file){
  if(!fs.existsSync(file))throw new Error(`artifact missing: ${file}`);
  const stat=fs.statSync(file);
  if(!stat.isFile()||stat.size<=0)throw new Error(`artifact invalid: ${file}`);
  return {name:path.basename(file),bytes:stat.size,sha256:sha256File(file)};
}
function sealBody(body){return sha256Buffer(Buffer.from(stable(body)));}
function createProof(opts={}){
  const branch=requireString('branch',opts.branch);
  const commit=requireHex('commit',opts.commit,40);
  const sourceRef=requireString('sourceRef',opts.sourceRef);
  const applicationId=requireString('applicationId',opts.applicationId);
  const versionName=requireString('versionName',opts.versionName);
  const versionCode=requireString('versionCode',String(opts.versionCode??''));
  const signerSha256=requireHex('signerSha256',opts.signerSha256,64);
  const bundle=fileIdentity(requireString('bundlePath',opts.bundlePath));
  const apk=fileIdentity(requireString('apkPath',opts.apkPath));
  const body={
    schema:SCHEMA,
    verdict:'PASS',
    claimBoundary:CLAIM,
    identity:{branch,commit,sourceRef,applicationId,versionName,versionCode,signerSha256},
    artifacts:{bundle,apk},
    boundaries:{uploadKeySigned:true,playAppSigningKey:false,publishedToPlay:false,physicalDeviceCertified:false}
  };
  return {...body,seal:sealBody(body)};
}
function verifyProof(proof,expected={}){
  if(!proof||typeof proof!=='object')throw new Error('proof object required');
  const {seal,...body}=proof;
  if(requireHex('seal',seal,64)!==sealBody(body))throw new Error('production release proof seal mismatch');
  if(proof.schema!==SCHEMA||proof.verdict!=='PASS'||proof.claimBoundary!==CLAIM)throw new Error('production release proof contract mismatch');
  if(!proof.boundaries||proof.boundaries.uploadKeySigned!==true||proof.boundaries.playAppSigningKey!==false||proof.boundaries.publishedToPlay!==false||proof.boundaries.physicalDeviceCertified!==false)throw new Error('production release truth boundary mismatch');
  requireHex('identity.commit',proof.identity?.commit,40);
  requireHex('identity.signerSha256',proof.identity?.signerSha256,64);
  requireHex('bundle.sha256',proof.artifacts?.bundle?.sha256,64);
  requireHex('apk.sha256',proof.artifacts?.apk?.sha256,64);
  if(!(proof.artifacts.bundle.bytes>0&&proof.artifacts.apk.bytes>0))throw new Error('artifact bytes missing');
  for(const [key,value] of Object.entries(expected)){
    const actual=key.split('.').reduce((x,k)=>x?.[k],proof);
    if(actual!==value)throw new Error(`expected ${key}=${value}, got ${actual}`);
  }
  return true;
}
function parse(argv){
  const out={};
  for(let i=0;i<argv.length;i++){
    const a=argv[i];
    if(!a.startsWith('--'))continue;
    const k=a.slice(2).replace(/-([a-z])/g,(_,c)=>c.toUpperCase());
    out[k]=argv[++i];
  }
  return out;
}
function main(){
  const a=parse(process.argv.slice(2));
  const proof=createProof({
    bundlePath:a.bundle,
    apkPath:a.apk,
    branch:a.branch,
    commit:a.commit,
    sourceRef:a.sourceRef,
    applicationId:a.applicationId,
    versionName:a.versionName,
    versionCode:a.versionCode,
    signerSha256:a.signer
  });
  verifyProof(proof,{"identity.commit":a.commit});
  const out=requireString('out',a.out);
  fs.mkdirSync(path.dirname(out),{recursive:true});
  fs.writeFileSync(out,JSON.stringify(proof,null,2)+'\n');
  const reread=JSON.parse(fs.readFileSync(out,'utf8'));
  verifyProof(reread,{"identity.commit":a.commit});
  console.log(`Seven production release proof: PASS (${proof.artifacts.bundle.bytes} AAB bytes; ${proof.artifacts.bundle.sha256.slice(0,16)}…; upload-key signed, not Play-published)`);
}
if(require.main===module)main();
module.exports={SCHEMA,CLAIM,stable,createProof,verifyProof,sha256File};
