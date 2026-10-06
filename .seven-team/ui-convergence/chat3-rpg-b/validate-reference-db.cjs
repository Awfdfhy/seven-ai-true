const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const file=path.join(__dirname,'RPG_UI_B_REFERENCE_DATABASE.csv');
const raw=fs.readFileSync(file,'utf8').trimEnd();
function parse(line){const out=[];let cur='',q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(q&&line[i+1]==='"'){cur+='"';i++;}else q=!q;}else if(c===','&&!q){out.push(cur);cur='';}else cur+=c;}out.push(cur);return out}
const lines=raw.split(/\r?\n/),header=parse(lines[0]),rows=lines.slice(1).map(parse);
const expected=['id','game/app','platform','source_url','surface','information_density','interaction_pattern','strengths','weaknesses','readability','mobile_adaptability','suitability_for_seven','visual_identity','what_to_extract','what_not_to_copy','tags'];
assert.deepEqual(header,expected);assert.equal(rows.length,250);
for(const r of rows){assert.equal(r.length,expected.length);for(const v of r)assert.ok(String(v).trim().length>0)}
const counts={B:0,P:0,I:0,M:0,K:0};for(const r of rows){const k=r[0][0];assert.ok(k in counts);counts[k]++}
assert.deepEqual(counts,{B:60,P:50,I:50,M:50,K:40});assert.equal(new Set(rows.map(r=>r[0])).size,250);
const urls=new Set(rows.map(r=>r[3]));assert.ok(urls.size>=10);
console.log('rpg ui b reference db: PASS',JSON.stringify({rows:rows.length,counts,uniqueSources:urls.size}));