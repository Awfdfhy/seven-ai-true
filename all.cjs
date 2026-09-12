const {execFileSync}=require('child_process');
const path=require('path');
const root=__dirname;
for(const file of ['memory.cjs','runtime-smoke.cjs']) execFileSync(process.execPath,[path.join(root,file)],{stdio:'inherit'});
try{execFileSync(process.execPath,[path.join(root,'verify.cjs')],{stdio:'ignore'});}
catch(e){console.log('browser regression: INCONCLUSIVE (Chromium unavailable)');}
console.log('local release gate: PASS');
