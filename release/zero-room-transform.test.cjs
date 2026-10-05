const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const {applyZeroRoomTransform}=require('./zero-room-transform.cjs');
const source=fs.readFileSync(__dirname+'/../seven_ai-final.html','utf8'),output=applyZeroRoomTransform(source);
assert.equal(applyZeroRoomTransform(output),output);
const start=output.indexOf('function deleteRoomById(id)'),end=output.indexOf('function updateRoomTitle()',start);
assert.ok(start>0&&end>start);
function fixture(generating){
  const events=[],context={rooms:{only:{}},roomTitles:{only:'Only'},currentRoom:'only',activeGenerationRoomId:'only',isGenerating:generating,own:(o,k)=>Object.prototype.hasOwnProperty.call(o,k),confirm:()=>true,alert:()=>events.push('alert'),saveRooms:()=>events.push('save'),updateRoomTitle(){},renderChatHistory(){},updateRoomListUI(){},dispatchRoomChange:(from,to,reason)=>events.push({from,to,reason})};
  vm.runInNewContext(output.slice(start,end)+';deleteRoomById("only");',context);
  return {context,events};
}
const idle=fixture(false);assert.equal(Object.keys(idle.context.rooms).length,0);assert.equal(idle.context.currentRoom,'');assert.deepEqual(idle.events,['save',{from:'only',to:'',reason:'delete'}]);
const active=fixture(true);assert.equal(Object.keys(active.context.rooms).length,1);assert.deepEqual(active.events,['alert']);
assert.throws(()=>applyZeroRoomTransform(source.replace('function updateRoomTitle()','function renamedRoomTitle()')),/missing title/);
console.log('Zero-room transform: PASS (last-room deletion, change event, active-generation guard, repeat transform, changed anchor)');
