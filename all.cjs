const fs=require('fs'),{spawnSync}=require('child_process');
const path=require('path');
const evolutionDir=path.join(__dirname,'evolution');
const evolutionTests=fs.readdirSync(evolutionDir).filter(name=>name.endsWith('.test.cjs')).sort().map(name=>path.join('evolution',name));
const releaseTests=fs.readdirSync(path.join(__dirname,'release')).filter(name=>name.endsWith('.test.cjs')).sort().map(name=>path.join('release',name));
const apkTests=fs.readdirSync(path.join(__dirname,'apk')).filter(name=>name.endsWith('.test.cjs')).sort().map(name=>path.join('apk',name));
const files=[path.join('eval','harness.cjs'),path.join('eval','search-v2-eval.cjs'),'memory.cjs','runtime-smoke.cjs','verify.cjs',path.join('cloudflare','search-gateway','search-gateway.test.mjs'),...apkTests,path.join('release','release-verify.cjs'),path.join('release','static-audit.cjs'),...releaseTests,...evolutionTests];
for(const file of files){
 const result=spawnSync(process.execPath,[path.join(__dirname,file)],{stdio:'inherit',timeout:120000});
 if(result.error) console.error(result.error);
 if(result.error || result.status!==0) process.exit(result.status || 1);
}
console.log('all test suites: PASS ('+files.length+' suites)');
