const {walFixtureScript}=require('./android-wal-fixture.cjs');
const vm=require('vm'),assert=require('assert/strict');
(async()=>{
 for(const empty of [true,false]){
  let durable=false,staged;const context={window:{},rooms:empty?{}:{r:{}},roomTitles:empty?{}:{r:'Old'},currentRoom:empty?'':'r',createNewChat(){context.rooms.r={};context.roomTitles.r='New';context.currentRoom='r'},roomPersistence:{async flush(){await new Promise(r=>setImmediate(r));durable=true;return true},status(){return {ready:true,failed:false,pending:0,revision:9,persistedWalSeq:0}}},localStorage:{setItem(k,v){assert(durable);assert.equal(k,'seven_ai_room_wal_v1');staged=JSON.parse(v)}}};
  vm.runInNewContext(walFixtureScript('Recovered "Arabic" غرفة'),context);
  await new Promise(r=>setImmediate(r));
  assert.equal(context.window.__sevenWalFixture.status,'staged');assert.equal(staged.baseRevision,9);assert.equal(staged.value.currentRoom,'r');assert.equal(staged.value.roomTitles.r,'Recovered "Arabic" غرفة');assert.equal(context.window.rooms,undefined);
 }
 let writes=0;const context={window:{},rooms:{r:{}},roomTitles:{r:'Old'},currentRoom:'r',roomPersistence:{async flush(){return false}},localStorage:{setItem(){writes++}}};
 vm.runInNewContext(walFixtureScript('blocked'),context);await new Promise(r=>setImmediate(r));assert.equal(writes,0);assert.equal(context.window.__sevenWalFixture.status,'error');
 console.log('Android WAL fixture: PASS empty/existing lexical rooms, durable base, failed flush refusal');
})().catch(e=>{console.error(e);process.exit(1)});
