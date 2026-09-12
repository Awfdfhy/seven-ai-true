const {spawnSync}=require('child_process');
const path=require('path');
for(const file of ['memory.cjs','runtime-smoke.cjs','ultimate-core.cjs','ultimate-systems.cjs','ultimate-runtime.cjs','ultimate-advanced.cjs','ultimate-agent-provider.cjs','ultimate-narrative.cjs','ultimate-rpg-extended.cjs','verify.cjs']) {
 const result=spawnSync(process.execPath,[path.join(__dirname,file)],{stdio:'inherit',timeout:120000});
 if(result.error) console.error(result.error);
 if(result.error || result.status!==0) process.exit(result.status || 1);
}
console.log('all test suites: PASS');
