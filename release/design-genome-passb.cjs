const genome=require('./design-genome.cjs');

const GOVERNANCE_VERSION='1.0.0';
const SHA40=/^[0-9a-f]{40}$/i;
const SHA64=/^[0-9a-f]{64}$/i;

function requireString(v,label){if(typeof v!=='string'||!v.trim())throw new Error(label+' required');return v.trim();}
function unique(values,label){if(new Set(values).size!==values.length)throw new Error('duplicate '+label);}

function createSourceRef({path,blobSha,commitSha,branch}){
  path=requireString(path,'path');branch=requireString(branch,'branch');
  if(path.startsWith('/')||path.includes('..'))throw new Error('path must be repository-relative and traversal-free');
  if(!SHA40.test(blobSha||''))throw new Error('blobSha must be a 40-char Git SHA');
  if(!SHA40.test(commitSha||''))throw new Error('commitSha must be a 40-char Git SHA');
  const body={schema:'seven-design-source-ref',version:1,path,blobSha:blobSha.toLowerCase(),commitSha:commitSha.toLowerCase(),branch};
  return {...body,seal:genome.sha(body)};
}
function verifySourceRef(ref){
  if(!ref||ref.schema!=='seven-design-source-ref')return false;const {seal,...body}=ref;
  return SHA40.test(ref.blobSha||'')&&SHA40.test(ref.commitSha||'')&&seal===genome.sha(body);
}

function createManifest({epoch='VISUAL-EPOCH-1',snapshot,sources,lintRuleset='seven-design-lint-v1'}){
  requireString(epoch,'epoch');requireString(lintRuleset,'lintRuleset');
  if(!genome.verifySnapshot(snapshot))throw new Error('valid Design Genome snapshot required');
  if(!Array.isArray(sources)||!sources.length)throw new Error('at least one source ref required');
  if(!sources.every(verifySourceRef))throw new Error('invalid source ref');
  unique(sources.map(s=>s.path),'source path');
  unique(sources.map(s=>s.blobSha),'source blob identity');
  const commits=[...new Set(sources.map(s=>s.commitSha))];if(commits.length!==1)throw new Error('manifest sources must bind to one exact commit');
  const branches=[...new Set(sources.map(s=>s.branch))];if(branches.length!==1)throw new Error('manifest sources must bind to one exact branch');
  const body={schema:'seven-design-genome-manifest',version:1,governanceVersion:GOVERNANCE_VERSION,epoch,genomeSeal:snapshot.seal,context:snapshot.context,lintRuleset,branch:branches[0],commitSha:commits[0],sources:sources.map(s=>({path:s.path,blobSha:s.blobSha,sourceSeal:s.seal})).sort((a,b)=>a.path.localeCompare(b.path))};
  return {...body,seal:genome.sha(body)};
}
function verifyManifest(manifest,{snapshot,sources}={}){
  if(!manifest||manifest.schema!=='seven-design-genome-manifest')return false;const {seal,...body}=manifest;
  if(seal!==genome.sha(body)||!SHA40.test(manifest.commitSha||''))return false;
  if(snapshot&&(!genome.verifySnapshot(snapshot)||snapshot.seal!==manifest.genomeSeal))return false;
  if(sources){if(!Array.isArray(sources)||!sources.every(verifySourceRef))return false;const byPath=new Map(sources.map(s=>[s.path,s]));for(const item of manifest.sources){const s=byPath.get(item.path);if(!s||s.blobSha!==item.blobSha||s.seal!==item.sourceSeal)return false;}}
  return true;
}

function compareCoverage({baseline,candidate,approvedUnmapped=[]}){
  if(!genome.verifyCoverageLedger(baseline)||!genome.verifyCoverageLedger(candidate))throw new Error('valid coverage ledgers required');
  const approved=new Set(approvedUnmapped.map(x=>requireString(x,'approvedUnmapped token')));
  const droppedAdapted=baseline.adapted.filter(x=>!candidate.adapted.includes(x));
  const droppedCanonical=baseline.canonical.filter(x=>!candidate.canonical.includes(x));
  const newUnmapped=candidate.legacyUnmapped.filter(x=>!baseline.legacyUnmapped.includes(x)&&!approved.has(x));
  const resolvedLegacy=baseline.legacyUnmapped.filter(x=>!candidate.legacyUnmapped.includes(x));
  const body={schema:'seven-design-coverage-comparison',version:1,baselineSourceSha256:baseline.sourceSha256,candidateSourceSha256:candidate.sourceSha256,droppedAdapted,droppedCanonical,newUnmapped,resolvedLegacy,approvedUnmapped:[...approved].sort(),verdict:(droppedAdapted.length||droppedCanonical.length||newUnmapped.length)?'BLOCK':'PASS'};
  return {...body,seal:genome.sha(body)};
}
function verifyCoverageComparison(c){if(!c||c.schema!=='seven-design-coverage-comparison')return false;const {seal,...body}=c;return SHA64.test(c.baselineSourceSha256||'')&&SHA64.test(c.candidateSourceSha256||'')&&seal===genome.sha(body);}

function createMigrationReceipt({comparison,reviewer,reason}){
  if(!verifyCoverageComparison(comparison))throw new Error('valid coverage comparison required');
  reviewer=requireString(reviewer,'reviewer');reason=requireString(reason,'reason');
  if(comparison.verdict!=='PASS')throw new Error('blocked coverage comparison cannot be promoted');
  const body={schema:'seven-design-migration-receipt',version:1,comparisonSeal:comparison.seal,reviewer,reason};
  return {...body,seal:genome.sha(body)};
}
function verifyMigrationReceipt(r,comparison){if(!r||r.schema!=='seven-design-migration-receipt')return false;const {seal,...body}=r;return seal===genome.sha(body)&&(!comparison||verifyCoverageComparison(comparison)&&r.comparisonSeal===comparison.seal);}

function validatePrimitiveUse({primitive,context,semanticChannels=[]}){
  const contract=genome.primitiveContract(primitive);context=requireString(context,'context');
  const channels=[...new Set(semanticChannels.map(x=>requireString(x,'semantic channel')))];
  const errors=[];
  if(!contract.allowed.includes(context))errors.push('context-not-allowed');
  if(contract.forbidden.includes(context))errors.push('context-explicitly-forbidden');
  if(primitive==='stateNode'&&!channels.some(x=>x!=='color'))errors.push('state-node-needs-non-color-semantic-channel');
  if(primitive==='focusHalo'&&context==='full-surface-glow')errors.push('focus-halo-cannot-be-global');
  const body={schema:'seven-signature-use-audit',version:1,primitive,context,semanticChannels:channels.sort(),errors,verdict:errors.length?'BLOCK':'PASS'};
  return {...body,seal:genome.sha(body)};
}
function verifyPrimitiveUseAudit(a){if(!a||a.schema!=='seven-signature-use-audit')return false;const {seal,...body}=a;return seal===genome.sha(body);}

function assertPromotable({manifest,comparison,receipt,primitiveAudits=[]}){
  if(!verifyManifest(manifest))throw new Error('manifest invalid');
  if(!verifyCoverageComparison(comparison)||comparison.verdict!=='PASS')throw new Error('coverage not promotable');
  if(!verifyMigrationReceipt(receipt,comparison))throw new Error('migration receipt invalid');
  if(!primitiveAudits.every(a=>verifyPrimitiveUseAudit(a)&&a.verdict==='PASS'))throw new Error('signature primitive audit blocked');
  return true;
}

module.exports={GOVERNANCE_VERSION,createSourceRef,verifySourceRef,createManifest,verifyManifest,compareCoverage,verifyCoverageComparison,createMigrationReceipt,verifyMigrationReceipt,validatePrimitiveUse,verifyPrimitiveUseAudit,assertPromotable};
