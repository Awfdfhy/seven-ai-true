const assert=require('assert');
const {SevenUltimateOS}=require('./src/ultimate/runtime.js');
const {LatencyBudget,HotWarmColdCache,WorkLaneScheduler,StreamBatcher,PerformanceController}=require('./src/ultimate/performance-fabric.js');
const {UIRegistry,ActivityStack,SevenHaloState,SURFACES}=require('./src/ultimate/ui-registry.js');
const {LegacyBridge}=require('./src/ultimate/legacy-migration.js');
const {ProjectWorkspace}=require('./src/ultimate/project-workspace.js');

(async()=>{
 const latency=new LatencyBudget({ttftMs:400});const assessment=latency.record({uiMs:8,contextMs:30,retrievalMs:50,networkMs:100,ttftMs:350,generationMs:700,cacheHit:true});assert.equal(assessment.healthy,true);assert.equal(latency.summary().cacheHitRate,1);
 const cache=new HotWarmColdCache({hotLimit:1,warmLimit:1});cache.set('a',{v:1});cache.set('b',{v:2});cache.set('c',{v:3});assert.equal(cache.stats().hot,1);assert.equal(cache.stats().warm,1);assert.equal(cache.stats().cold,1);assert.deepStrictEqual(cache.get('a'),{v:1});
 const scheduler=new WorkLaneScheduler({interactive:1});const order=[];await Promise.all([scheduler.enqueue(async()=>{await new Promise(r=>setTimeout(r,5));order.push('first')},{lane:'interactive',priority:1}),scheduler.enqueue(async()=>{order.push('second')},{lane:'interactive',priority:0})]);assert.deepStrictEqual(order,['first','second']);
 const batch=new StreamBatcher({intervalMs:20,maxChars:4});assert.equal(batch.push('ab',0),null);assert.equal(batch.push('cd',1),'abcd');const perf=new PerformanceController();perf.updateDevice({lowPower:true,fps:35});assert.equal(perf.quality(),'light');assert.equal(perf.strategy().ambient,false);

 const ui=new UIRegistry();assert.equal(ui.audit().pass,true);assert.equal(ui.list('surface').length,SURFACES.length);ui.ensureTool({id:'web_search',category:'research'});assert.equal(ui.state('tool:web_search','running').motion,'travelling-highlight');assert.equal(ui.state('tool:web_search','running',{reducedMotion:true}).motion,'opacity-only');
 const activity=new ActivityStack();activity.start({id:'a',title:'Search'});activity.update('a',{state:'success'});assert.equal(activity.collapseCompleted().items[0].collapsed,true);const halo=new SevenHaloState();halo.set('research',{count:24});assert.equal(halo.compact(),'◌ Research · 24');

 const values=new Map([['chat_rooms_v6',JSON.stringify([{id:'r1',title:'Old Room'}])],['room_titles_v6',JSON.stringify({r1:'Legacy'} )],['current_room_v6','r1'],['theme','night'],['groq_api_key','SECRET']]);const storage={getItem:k=>values.has(k)?values.get(k):null,setItem:(k,v)=>values.set(k,v)};const bridge=new LegacyBridge({clock:()=> '2026-09-12T23:00:00+03:00'});const snap=bridge.export(storage);assert.equal(snap.secretValuesIncluded,false);assert.ok(snap.secretsPresent.includes('groq_api_key'));assert.equal(Object.prototype.hasOwnProperty.call(snap.data,'groq_api_key'),false,'credentials must never enter migration backup');
 const ws=new ProjectWorkspace();const migrated=bridge.applyToWorkspace(snap,ws,{projectId:'legacy'});assert.equal(migrated.project.chats,1);assert.equal(ws.project('legacy').metadata.legacyPreferences.theme,'night');const plan=bridge.plan(snap).summary();assert.ok(plan.warnings.some(x=>x.type==='SECRETS_NOT_EXPORTED'));

 const os=new SevenUltimateOS();const dry=os.migrateLegacy(storage,{apply:false});assert.equal(dry.plan.rooms,1);const applied=os.migrateLegacy(storage,{projectId:'legacy2'});assert.equal(applied.result.project.chats,1);assert.equal(os.snapshot().ui.pass,true);assert.ok(os.snapshot().ui.components>=SURFACES.length+40,'all built-in tools must have UI contracts');
 console.log('ultimate performance/ui/migration: 31 assertions PASS');
})().catch(err=>{console.error(err);process.exit(1)});