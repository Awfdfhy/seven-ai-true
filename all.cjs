const fs=require('fs'),{spawnSync}=require('child_process');
const path=require('path');
const evolutionDir=path.join(__dirname,'evolution');
const evolutionTests=fs.readdirSync(evolutionDir).filter(name=>name.endsWith('.test.cjs')).sort().map(name=>path.join('evolution',name));
const releaseTests=[path.join('release','contrast.test.cjs'),path.join('release','static-audit.cjs'),path.join('release','motion-runtime.test.cjs'),path.join('release','canon-simulator.test.cjs'),path.join('release','world-runtime.test.cjs'),path.join('release','research-runtime.test.cjs'),path.join('release','release-verify.cjs')];
const files=[path.join('eval','harness.cjs'),'memory.cjs','runtime-smoke.cjs','verify.cjs',...releaseTests,...evolutionTests];
for(const file of files){
 const result=spawnSync(process.execPath,[path.join(__dirname,file)],{stdio:'inherit',timeout:120000});
 if(result.error) console.error(result.error);
 if(result.error || result.status!==0) process.exit(result.status || 1);
}
console.log('all test suites: PASS ('+files.length+' suites)');
