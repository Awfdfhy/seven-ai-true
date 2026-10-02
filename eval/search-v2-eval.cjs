const fs=require('fs');
const path=require('path');
const assert=require('assert');

const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,'search-v2-corpus.json'),'utf8'));

function canonicalUrl(value){
  try{
    const u=new URL(String(value||''));
    u.hash='';
    for(const key of [...u.searchParams.keys()]){
      if(/^utm_/i.test(key)||['fbclid','gclid','ref','ref_src'].includes(key.toLowerCase()))u.searchParams.delete(key);
    }
    if(u.pathname.length>1)u.pathname=u.pathname.replace(/\/{2,}/g,'/').replace(/\/$/,'');
    return u.href;
  }catch(_){return null;}
}
function host(value){try{return new URL(value).hostname.toLowerCase()}catch(_){return ''}}
function strong(type){return ['official','primary','government','documentation','academic'].includes(String(type||''))}
function fresh(cls){return cls==='current'||cls==='recent'}
function read(state){return state==='read_success'||state==='read_partial'}
function gaps(fixture){
  const rows=fixture.evidence||[];
  const hosts=new Set(rows.map(x=>host(x.url)).filter(Boolean));
  const out=[];
  if(rows.length<2)out.push('too_few_sources');
  if(rows.length>=2&&hosts.size<2)out.push('low_host_diversity');
  if(rows.filter(x=>read(x.readState)).length===0)out.push('no_read_evidence');
  if(fixture.requiresFreshness&&rows.filter(x=>fresh(x.freshnessClass)).length===0)out.push('stale_current_query');
  if(fixture.requiresPrimaryOrDocs&&rows.filter(x=>strong(x.sourceType)).length===0)out.push('no_strong_source');
  return out;
}
function numericConflict(rows){
  const claims=[];
  const re=/\b(\d+(?:\.\d+)?)\s*(%|fps|hz|khz|mhz|ghz|gb|mb|tb|ms|s|seconds?)\b/gi;
  for(const row of rows||[]){
    let m; const local=[];
    while((m=re.exec(String(row.excerpt||''))))local.push({value:Number(m[1]),unit:m[2].toLowerCase()});
    claims.push({host:host(row.url),claims:local});
    re.lastIndex=0;
  }
  for(let i=0;i<claims.length;i++)for(let j=i+1;j<claims.length;j++){
    if(!claims[i].host||claims[i].host===claims[j].host)continue;
    for(const a of claims[i].claims)for(const b of claims[j].claims){
      if(a.unit===b.unit&&Math.abs(a.value-b.value)>Math.max(.01,Math.abs(a.value)*.05))return true;
    }
  }
  return false;
}
function metrics(fixture){
  const rows=fixture.evidence||[];
  const canonical=rows.map(x=>canonicalUrl(x.url)).filter(Boolean);
  const unique=new Set(canonical);
  const hosts=new Set(rows.map(x=>host(x.url)).filter(Boolean));
  const ids=new Set(rows.map(x=>x.sourceId));
  const citations=fixture.citations||[];
  const readCount=rows.filter(x=>read(x.readState)).length;
  return {
    uniqueUrlRatio:rows.length?unique.size/rows.length:0,
    independentHostCount:hosts.size,
    strongSourcePresence:rows.some(x=>strong(x.sourceType)),
    freshSourcePresence:rows.some(x=>fresh(x.freshnessClass)),
    readEvidenceRatio:rows.length?readCount/rows.length:0,
    citationSourceIdConsistency:citations.every(id=>ids.has(id)),
    gapCodes:gaps(fixture),
    conflictSignal:numericConflict(rows)
  };
}

const requiredCategories=[
  'current_factual','arabic_current_factual','technical_official_docs','ambiguous_entity',
  'comparison','recent_news','historical_fact','conflicting_reports','niche_topic',
  'arabic_source_sensitive','blocked_reader','no_useful_results'
];
const categories=new Set(corpus.fixtures.map(x=>x.category));
for(const category of requiredCategories)assert(categories.has(category),'missing corpus category '+category);

for(const fixture of corpus.fixtures){
  const m=metrics(fixture);
  assert(m.citationSourceIdConsistency,fixture.id+' has inconsistent citation IDs');
  for(const code of fixture.expectedGapCodes||[])assert(m.gapCodes.includes(code),fixture.id+' missing expected gap '+code);
  if(fixture.expectedConflictSignal===true)assert(m.conflictSignal,fixture.id+' should expose conflict');
  if(fixture.expectedConflictSignal===false&&fixture.id!=='duplicate-heavy-control')assert(!m.conflictSignal,fixture.id+' unexpected conflict');
  if((fixture.evidence||[]).length && !(fixture.expectedGapCodes||[]).includes('too_few_sources')){
    assert(m.independentHostCount>=Math.min(fixture.minimumHostDiversity||0,(fixture.evidence||[]).length),fixture.id+' host diversity regression');
  }
}

const duplicate=corpus.fixtures.find(x=>x.id==='duplicate-heavy-control');
assert(duplicate,'duplicate control missing');
assert.strictEqual(metrics(duplicate).uniqueUrlRatio,.5,'duplicate-heavy fixture not detected');

const current=corpus.fixtures.find(x=>x.id==='current-factual');
assert(metrics(current).freshSourcePresence,'freshness metric failed');

const technical=corpus.fixtures.find(x=>x.id==='technical-docs');
assert(metrics(technical).strongSourcePresence,'strong-source metric failed');

const blocked=corpus.fixtures.find(x=>x.id==='blocked-reader');
assert.strictEqual(metrics(blocked).readEvidenceRatio,0,'blocked-reader should have no read evidence');

console.log('search v2 quality corpus: PASS ('+requiredCategories.length+' required categories, '+corpus.fixtures.length+' fixtures)');
