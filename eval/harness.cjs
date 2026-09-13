"use strict";
const fs=require('fs');
const path=require('path');
const assert=require('assert/strict');
const crypto=require('crypto');

const ROOT=path.resolve(__dirname,'..');
const taskPath=path.join(__dirname,'tasks.jsonl');
const baselinePath=path.join(__dirname,'baseline.json');
const lines=fs.readFileSync(taskPath,'utf8').split(/\r?\n/).filter(Boolean);
const tasks=lines.map((line,index)=>{try{return JSON.parse(line)}catch(e){throw new Error(`invalid JSONL at line ${index+1}: ${e.message}`)}});
const baseline=JSON.parse(fs.readFileSync(baselinePath,'utf8'));
const allowedScorers=new Set(['rubric','contract','device']);
const requiredCategories=['chat','memory','context','world','research','coding','tools','models','files','persistence','recovery','ui','android'];
const requiredModes=['core','build','world','research'];
const ids=new Set(),inputs=new Set();

assert.equal(baseline.format,'seven-eval-baseline');
assert.equal(baseline.version,1);
assert.equal(baseline.truth.liveProviderQuality,'UNMEASURED','baseline must not fake provider quality');
assert.equal(baseline.truth.realPhoneBatteryRamThermal,'UNMEASURED','baseline must not fake phone measurements');
assert.ok(tasks.length>=24,'evaluation corpus is too small to represent Seven surfaces');

for(const task of tasks){
  assert.ok(task&&typeof task==='object'&&!Array.isArray(task),'task object required');
  assert.ok(typeof task.id==='string'&&/^[a-z0-9][a-z0-9-]+$/.test(task.id),`bad task id: ${task.id}`);
  assert.ok(!ids.has(task.id),`duplicate task id: ${task.id}`);ids.add(task.id);
  assert.ok(typeof task.category==='string'&&task.category,'category required');
  assert.ok(typeof task.mode==='string'&&task.mode,'mode required');
  assert.ok(typeof task.locale==='string'&&task.locale,'locale required');
  assert.ok(typeof task.input==='string'&&task.input.trim().length>=8,`input too short: ${task.id}`);
  assert.ok(!inputs.has(task.input),`duplicate task input: ${task.id}`);inputs.add(task.input);
  assert.ok(Array.isArray(task.requires)&&task.requires.length>0,`requires missing: ${task.id}`);
  assert.ok(task.scorer&&allowedScorers.has(task.scorer.type),`unsupported scorer: ${task.id}`);
  assert.ok(Array.isArray(task.scorer.criteria)&&task.scorer.criteria.length>=2,`criteria missing: ${task.id}`);
  assert.ok(task.scorer.criteria.every(x=>typeof x==='string'&&x.trim().length>=5),`bad criterion: ${task.id}`);
}
for(const category of requiredCategories)assert.ok(tasks.some(t=>t.category===category),`missing category coverage: ${category}`);
for(const mode of requiredModes)assert.ok(tasks.some(t=>t.mode===mode),`missing mode coverage: ${mode}`);
const arabicCount=tasks.filter(t=>t.locale.startsWith('ar')).length;
const minimumArabic=Math.ceil(tasks.length*0.25);
assert.ok(arabicCount>=minimumArabic,`Arabic coverage is too small: ${arabicCount}/${tasks.length}, need ${minimumArabic}`);
assert.ok(tasks.some(t=>t.scorer.type==='device'),'device evaluation coverage required');
assert.ok(tasks.some(t=>t.scorer.type==='rubric'),'model/rubric evaluation coverage required');
assert.ok(tasks.some(t=>t.scorer.type==='contract'),'deterministic contract coverage required');

const corpusHash=crypto.createHash('sha256').update(fs.readFileSync(taskPath)).digest('hex');
const report={
  format:'seven-eval-corpus-audit',version:1,
  tasks:tasks.length,corpusHash,
  categories:Object.fromEntries([...new Set(tasks.map(t=>t.category))].sort().map(k=>[k,tasks.filter(t=>t.category===k).length])),
  modes:Object.fromEntries([...new Set(tasks.map(t=>t.mode))].sort().map(k=>[k,tasks.filter(t=>t.mode===k).length])),
  locales:Object.fromEntries([...new Set(tasks.map(t=>t.locale))].sort().map(k=>[k,tasks.filter(t=>t.locale===k).length])),
  scorers:Object.fromEntries([...allowedScorers].map(k=>[k,tasks.filter(t=>t.scorer.type===k).length])),
  arabicCoverage:{count:arabicCount,minimum:minimumArabic,ratio:Number((arabicCount/tasks.length).toFixed(4))},
  baseline:baseline.baselineCommit
};
fs.mkdirSync(path.join(ROOT,'dist'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'dist','eval-corpus-audit.json'),JSON.stringify(report,null,2));
console.log(`eval corpus: PASS (${report.tasks} tasks, ${Object.keys(report.categories).length} categories, Arabic ${arabicCount}/${tasks.length}, ${corpusHash.slice(0,12)})`);
