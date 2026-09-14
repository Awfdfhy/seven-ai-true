const assert=require('assert');
const g=require('./design-genome.cjs');
const p=require('./design-genome-passb.cjs');
let n=0;const ok=(v,m)=>{assert.ok(v,m);n++};const eq=(a,b,m)=>{assert.strictEqual(a,b,m);n++};const throws=(fn,re,m)=>{assert.throws(fn,re,m);n++};

const C='9a3b185eeaf959dcf39f75b1a9429ac7aff13319';
const B1='ea5ba5416fd63c2a208c76d70cc6fea3635a6b21',B2='d2c5782e402c59c316b2e8f5eb11110a1157c8de';
const s1=p.createSourceRef({path:'release/beta-ui.css',blobSha:B1,commitSha:C,branch:'ultimate-polish-v1'});
const s2=p.createSourceRef({path:'release/seven-final.css',blobSha:B2,commitSha:C,branch:'ultimate-polish-v1'});
ok(p.verifySourceRef(s1));ok(p.verifySourceRef(s2));
const st={...s1,path:'../evil.css'};eq(p.verifySourceRef(st),false);
throws(()=>p.createSourceRef({path:'../x',blobSha:B1,commitSha:C,branch:'x'}),/traversal-free/);
throws(()=>p.createSourceRef({path:'x',blobSha:'bad',commitSha:C,branch:'x'}),/blobSha/);
throws(()=>p.createSourceRef({path:'x',blobSha:B1,commitSha:'bad',branch:'x'}),/commitSha/);

const snap=g.createSnapshot({theme:'night',aurora:'idle',domain:'core'});
const manifest=p.createManifest({snapshot:snap,sources:[s1,s2]});ok(p.verifyManifest(manifest));ok(p.verifyManifest(manifest,{snapshot:snap,sources:[s1,s2]}));
const mt=JSON.parse(JSON.stringify(manifest));mt.sources[0].blobSha=B2;eq(p.verifyManifest(mt),false);
throws(()=>p.createManifest({snapshot:{},sources:[s1]}),/valid Design Genome snapshot/);
throws(()=>p.createManifest({snapshot:snap,sources:[]}),/at least one source ref/);
throws(()=>p.createManifest({snapshot:snap,sources:[s1,s1]}),/duplicate source path/);
const other=p.createSourceRef({path:'release/x.css',blobSha:'1111111111111111111111111111111111111111',commitSha:'2222222222222222222222222222222222222222',branch:'ultimate-polish-v1'});
throws(()=>p.createManifest({snapshot:snap,sources:[s1,other]}),/one exact commit/);
const otherBranch=p.createSourceRef({path:'release/x.css',blobSha:'1111111111111111111111111111111111111111',commitSha:C,branch:'main'});
throws(()=>p.createManifest({snapshot:snap,sources:[s1,otherBranch]}),/one exact branch/);

const base=g.createCoverageLedger({sourceId:'base.css',cssText:':root{--sb-bg:#000;--seven-motion-fast:150ms}.x{color:var(--sb-bg)}'});
const candidate=g.createCoverageLedger({sourceId:'candidate.css',cssText:':root{--sb-bg:#000;--seven-motion-fast:150ms;--seven-g-canvas:#000}.x{color:var(--sb-bg)}'});
let cmp=p.compareCoverage({baseline:base,candidate});eq(cmp.verdict,'PASS');ok(p.verifyCoverageComparison(cmp));ok(cmp.droppedAdapted.length===0);
const receipt=p.createMigrationReceipt({comparison:cmp,reviewer:'visual-council',reason:'monotonic Genome migration'});ok(p.verifyMigrationReceipt(receipt,cmp));
const rt={...receipt,reason:'fake'};eq(p.verifyMigrationReceipt(rt,cmp),false);

const dropped=g.createCoverageLedger({sourceId:'drop.css',cssText:':root{--sb-bg:#000}.x{color:var(--sb-bg)}'});
cmp=p.compareCoverage({baseline:base,candidate:dropped});eq(cmp.verdict,'BLOCK');ok(cmp.droppedAdapted.includes('--seven-motion-fast'));throws(()=>p.createMigrationReceipt({comparison:cmp,reviewer:'r',reason:'x'}),/cannot be promoted/);
const newLegacy=g.createCoverageLedger({sourceId:'new.css',cssText:':root{--sb-bg:#000;--seven-motion-fast:150ms;--seven-new-thing:1}.x{color:var(--sb-bg)}'});
cmp=p.compareCoverage({baseline:base,candidate:newLegacy});eq(cmp.verdict,'BLOCK');ok(cmp.newUnmapped.includes('--seven-new-thing'));
cmp=p.compareCoverage({baseline:base,candidate:newLegacy,approvedUnmapped:['--seven-new-thing']});eq(cmp.verdict,'PASS');

let a=p.validatePrimitiveUse({primitive:'orbitThread',context:'evidence'});eq(a.verdict,'PASS');ok(p.verifyPrimitiveUseAudit(a));
a=p.validatePrimitiveUse({primitive:'orbitThread',context:'constant-decoration'});eq(a.verdict,'BLOCK');
a=p.validatePrimitiveUse({primitive:'stateNode',context:'run-state',semanticChannels:['color']});eq(a.verdict,'BLOCK');ok(a.errors.includes('state-node-needs-non-color-semantic-channel'));
const node=p.validatePrimitiveUse({primitive:'stateNode',context:'run-state',semanticChannels:['color','label']});eq(node.verdict,'PASS');
const halo=p.validatePrimitiveUse({primitive:'focusHalo',context:'focused-control',semanticChannels:['shape']});eq(halo.verdict,'PASS');

const goodCmp=p.compareCoverage({baseline:base,candidate});const goodReceipt=p.createMigrationReceipt({comparison:goodCmp,reviewer:'visual-council',reason:'verified migration'});ok(p.assertPromotable({manifest,comparison:goodCmp,receipt:goodReceipt,primitiveAudits:[node,halo]}));
throws(()=>p.assertPromotable({manifest,comparison:goodCmp,receipt:goodReceipt,primitiveAudits:[p.validatePrimitiveUse({primitive:'stateNode',context:'run-state',semanticChannels:['color']})]}),/signature primitive audit blocked/);
throws(()=>p.assertPromotable({manifest:{},comparison:goodCmp,receipt:goodReceipt}),/manifest invalid/);

console.log(`Design Genome Pass B: PASS (${n} assertions)`);
