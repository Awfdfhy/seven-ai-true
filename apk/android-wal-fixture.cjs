// Stage a recovery fixture only after its actual base revision is durable.
// Global lexical chat bindings are deliberately accessed without window aliases.
function walFixtureScript(marker) {
  return `(()=>{window.__sevenWalFixture={status:'pending'};(async()=>{if(!currentRoom||!rooms[currentRoom])createNewChat();if(await roomPersistence.flush()!==true)throw Error('WAL fixture base did not persist');const state=roomPersistence.status();if(!state.ready||state.failed||state.pending)throw Error('WAL fixture base is not stable');const value=JSON.parse(JSON.stringify({version:1,rooms,roomTitles,currentRoom}));value.roomTitles[value.currentRoom]=${JSON.stringify(marker)};const seq=Math.max(Date.now()*1000+999,state.persistedWalSeq+1);localStorage.setItem('seven_ai_room_wal_v1',JSON.stringify({schemaVersion:1,seq,sessionId:'android-recovery-fixture',baseRevision:state.revision,value}));window.__sevenWalFixture={status:'staged'}})().catch(e=>window.__sevenWalFixture={status:'error',error:String(e.message)});return true})()`;
}
module.exports={walFixtureScript};
