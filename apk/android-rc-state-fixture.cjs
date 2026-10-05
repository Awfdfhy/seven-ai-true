'use strict';

const FIXTURE=Object.freeze({
  metaKey:'seven_android_rc_fixture_v1',
  settingKey:'seven_android_rc_setting_v1',
  roomA:'rc-android-room-a',
  roomB:'rc-android-room-b',
  worldId:'rc-android-world',
  memoryContent:'Seven Android RC durable memory',
  artifactId:'rc-android-file-ref',
  secureKey:'rc.android.upgrade.secure',
  secureValue:'seven-rc-secure-v1',
  seedTitleA:'RC Upgrade A',
  seedTitleB:'RC Upgrade B'
});

function jsString(value){return JSON.stringify(String(value));}

function seedUpgradeScript(){
  const F=FIXTURE;
  return `(()=>{window.__sevenRcFixture={status:'pending'};(async()=>{
    if(!roomPersistence.status().ready||roomPersistence.status().failed)throw Error('room persistence unavailable');
    if(await roomPersistence.flush()!==true)throw Error('room persistence base flush failed');
    const a=${jsString(F.roomA)},b=${jsString(F.roomB)},world=${jsString(F.worldId)};
    rooms[a]=createEmptyRoom();rooms[b]=createEmptyRoom();
    rooms[a].history=[{role:'user',content:'upgrade-a-user'},{role:'assistant',content:'upgrade-a-assistant'}];
    rooms[b].history=[{role:'user',content:'upgrade-b-user'},{role:'assistant',content:'upgrade-b-assistant'}];
    rooms[a].pinned='upgrade-pinned-a';rooms[b].summary='upgrade-summary-b';
    const artifact=createKnowledgeArtifact(null,'Seven Android RC file reference payload',a,{id:${jsString(F.artifactId)},name:'rc-upgrade-fixture.txt',createdAt:1710000000000});
    if(!artifact)throw Error('fixture artifact invalid');
    rooms[a].knowledgeFiles=[artifact];rooms[a].knowledge=artifact.text;
    roomTitles[a]=${jsString(F.seedTitleA)};roomTitles[b]=${jsString(F.seedTitleB)};currentRoom=b;
    if(!getCanonicalMemories().some(m=>m&&m.content===${jsString(F.memoryContent)})){
      const memory=addMemory(${jsString(F.memoryContent)});if(!memory)throw Error('canonical memory fixture failed');
    }
    localStorage.setItem('theme','night');localStorage.setItem('seven_ui_language','ar');
    localStorage.setItem(${jsString(F.settingKey)},JSON.stringify({version:1,theme:'night',language:'ar',marker:'upgrade-setting'}));
    if(typeof SevenRpgState==='undefined'||typeof SevenRpgSession==='undefined'){
      if(window.SevenRemake&&typeof SevenRemake.openWorkspace==='function')SevenRemake.openWorkspace('rpg');
      for(let i=0;i<80&&(typeof SevenRpgState==='undefined'||typeof SevenRpgSession==='undefined');i++)await new Promise(r=>setTimeout(r,50));
    }
    if(typeof SevenRpgState==='undefined'||typeof SevenRpgSession==='undefined')throw Error('RPG runtime unavailable');
    const manager=SevenRpgSession.createManager({stateApi:SevenRpgState,storage:localStorage});
    manager.remove(b,world);
    const started=manager.start({roomId:b,worldId:world,state:{sessionId:'rc-android-session',worldId:world,turn:7,revision:0,timeline:{tick:42,dateLabel:'RC acceptance'}}});
    if(!started.ok)throw Error('RPG fixture persist failed: '+started.status);
    localStorage.setItem('seven_rpg_session_v3:active:'+encodeURIComponent(b),world);
    const saved=await roomPersistence.save();const flushed=await roomPersistence.flush();
    if(saved!==true||flushed!==true)throw Error('room fixture did not persist');
    const ps=roomPersistence.status();if(ps.failed||ps.pending||ps.walStaged)throw Error('room fixture not durable');
    const secure=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.SevenPlatform;
    if(!secure||typeof secure.secureSet!=='function')throw Error('native secure storage unavailable');
    await secure.secureSet({key:${jsString(F.secureKey)},value:${jsString(F.secureValue)}});
    localStorage.setItem(${jsString(F.metaKey)},JSON.stringify({version:1,roomA:a,roomB:b,worldId:world,baseRevision:ps.revision,artifactId:${jsString(F.artifactId)}}));
    window.__sevenRcFixture={status:'seeded',revision:ps.revision,rooms:Object.keys(rooms).length};
  })().catch(e=>window.__sevenRcFixture={status:'error',error:String(e&&e.message||e)});return true})()`;
}

function verifyStateScript(expectedTitle,expectedMessage,expectedArtifactId){
  const F=FIXTURE, title=String(expectedTitle||F.seedTitleB), msg=String(expectedMessage||'upgrade-b-user'), artifact=String(expectedArtifactId||F.artifactId);
  return `(()=>{window.__sevenRcVerify={status:'pending'};(async()=>{
    const meta=JSON.parse(localStorage.getItem(${jsString(F.metaKey)})||'null');if(!meta||meta.version!==1)throw Error('fixture metadata missing');
    const a=meta.roomA,b=meta.roomB,world=meta.worldId;
    if(!rooms[a]||!rooms[b])throw Error('rooms missing after restart/upgrade');
    if(currentRoom!==b)throw Error('current room changed');
    if(roomTitles[b]!==${jsString(title)})throw Error('room title mismatch: '+roomTitles[b]);
    if(!rooms[b].history.some(m=>m&&m.content===${jsString(msg)}))throw Error('expected chat event missing');
    const allArtifacts=[...(rooms[a].knowledgeFiles||[]),...(rooms[b].knowledgeFiles||[])];
    if(!allArtifacts.some(x=>x&&x.id===${jsString(artifact)}))throw Error('file reference missing');
    if(!getCanonicalMemories().some(m=>m&&m.content===${jsString(F.memoryContent)}))throw Error('canonical Memory missing');
    const setting=JSON.parse(localStorage.getItem(${jsString(F.settingKey)})||'null');
    if(!setting||setting.theme!=='night'||setting.language!=='ar'||localStorage.getItem('theme')!=='night'||localStorage.getItem('seven_ui_language')!=='ar')throw Error('settings missing');
    if(typeof SevenRpgState==='undefined'||typeof SevenRpgSession==='undefined'){
      if(window.SevenRemake&&typeof SevenRemake.openWorkspace==='function')SevenRemake.openWorkspace('rpg');
      for(let i=0;i<80&&(typeof SevenRpgState==='undefined'||typeof SevenRpgSession==='undefined');i++)await new Promise(r=>setTimeout(r,50));
    }
    if(typeof SevenRpgState==='undefined'||typeof SevenRpgSession==='undefined')throw Error('RPG runtime unavailable on verify');
    const manager=SevenRpgSession.createManager({stateApi:SevenRpgState,storage:localStorage}),loaded=manager.load(b,world);
    if(!loaded.ok||loaded.session.state.turn!==7||loaded.session.state.timeline.tick!==42)throw Error('RPG state missing');
    if(localStorage.getItem('seven_rpg_session_v3:active:'+encodeURIComponent(b))!==world)throw Error('RPG active index missing');
    const secure=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.SevenPlatform;if(!secure)throw Error('native plugin missing');
    const secret=await secure.secureGet({key:${jsString(F.secureKey)}});if(!secret||secret.found!==true||secret.value!==${jsString(F.secureValue)})throw Error('secure storage continuity failed');
    const ps=roomPersistence.status();if(!ps.ready||ps.failed||ps.pending)throw Error('room persistence unhealthy');
    if(localStorage.getItem('seven_ai_room_wal_v1')!==null)throw Error('WAL not clean after recovery');
    window.__sevenRcVerify={status:'ok',revision:ps.revision,title:roomTitles[b],roomCount:Object.keys(rooms).length};
  })().catch(e=>window.__sevenRcVerify={status:'error',error:String(e&&e.message||e)});return true})()`;
}

function phaseData(phase){
  if(phase==='precommit')return {title:'RC Process PRECOMMIT',message:'process-precommit-message',artifact:'rc-process-precommit-file'};
  if(phase==='postcommit')return {title:'RC Process POSTCOMMIT',message:'process-postcommit-message',artifact:'rc-process-postcommit-file'};
  if(phase==='cleancommit')return {title:'RC Process CLEANCOMMIT',message:'process-cleancommit-message',artifact:'rc-process-cleancommit-file'};
  throw Error('unknown phase');
}

function stageProcessScript(phase){
  const F=FIXTURE,P=phaseData(phase);
  const mutate=`
    const meta=JSON.parse(localStorage.getItem(${jsString(F.metaKey)})||'null');if(!meta)throw Error('fixture metadata missing');
    const b=meta.roomB;currentRoom=b;roomTitles[b]=${jsString(P.title)};
    rooms[b].history.push({role:'user',content:${jsString(P.message)}});
    const phaseArtifact=createKnowledgeArtifact(null,'process phase file '+${jsString(phase)},b,{id:${jsString(P.artifact)},name:${jsString(P.artifact+'.txt')},createdAt:1710000001000});
    if(!phaseArtifact)throw Error('phase artifact invalid');rooms[b].knowledgeFiles=(rooms[b].knowledgeFiles||[]).filter(x=>x&&x.id!==${jsString(P.artifact)});rooms[b].knowledgeFiles.push(phaseArtifact);
    localStorage.setItem('seven_android_rc_expected_phase',${jsString(phase)});`;
  if(phase==='precommit'){
    return `(()=>{window.__sevenRcProcess={status:'pending',phase:'precommit'};(async()=>{
      if(await roomPersistence.flush()!==true)throw Error('precommit base flush failed');const before=roomPersistence.status();
      const blockerDb=await new Promise((resolve,reject)=>{const q=indexedDB.open('seven_ai_canonical_v1');q.onerror=()=>reject(q.error);q.onsuccess=()=>resolve(q.result)});
      await new Promise((resolve,reject)=>{const tx=blockerDb.transaction(['state'],'readwrite'),store=tx.objectStore('state');window.__sevenRcIdbBlocker={db:blockerDb,tx};let first=true;const pump=()=>{const q=store.get('rooms');q.onerror=()=>reject(q.error);q.onsuccess=()=>{if(first){first=false;resolve()}pump()}};pump()});
      ${mutate}
      roomPersistence.save();
      await new Promise(r=>setTimeout(r,120));
      const ps=roomPersistence.status();if(ps.failed||ps.pending<1||!ps.walStaged||ps.revision!==before.revision)throw Error('precommit window not held '+JSON.stringify(ps));
      window.__sevenRcProcess={status:'ready',phase:'precommit',revision:ps.revision,pending:ps.pending};
    })().catch(e=>window.__sevenRcProcess={status:'error',phase:'precommit',error:String(e&&e.message||e)});return true})()`;
  }
  if(phase==='postcommit'){
    return `(()=>{window.__sevenRcProcess={status:'pending',phase:'postcommit'};(async()=>{
      if(await roomPersistence.flush()!==true)throw Error('postcommit base flush failed');const before=roomPersistence.status();
      ${mutate}
      const saved=await roomPersistence.save();await roomPersistence.flush();
      const ps=roomPersistence.status();if(saved!==true||ps.failed||ps.pending||ps.walStaged||ps.revision<=before.revision||!Number.isSafeInteger(ps.persistedWalSeq)||ps.persistedWalSeq<1)throw Error('postcommit commit invalid '+JSON.stringify(ps));
      const value=JSON.parse(JSON.stringify({version:1,rooms,roomTitles,currentRoom}));
      const stale={schemaVersion:1,seq:ps.persistedWalSeq,sessionId:'android-postcommit-fixture',baseRevision:before.revision,value};
      localStorage.setItem('seven_ai_room_wal_v1',JSON.stringify(stale));
      const walDb=await new Promise((resolve,reject)=>{const q=indexedDB.open('seven_ai_room_wal_durable_v1',1);q.onupgradeneeded=()=>{if(!q.result.objectStoreNames.contains('wal'))q.result.createObjectStore('wal',{keyPath:'id'})};q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)});
      await new Promise((resolve,reject)=>{const tx=walDb.transaction('wal','readwrite');tx.objectStore('wal').put({id:'active',value:stale});tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error||Error('postcommit WAL fixture abort'));tx.onerror=()=>{}});
      walDb.close();
      const durable=await new Promise((resolve,reject)=>{const q=indexedDB.open('seven_ai_room_wal_durable_v1',1);q.onsuccess=()=>{const db=q.result,tx=db.transaction('wal','readonly'),g=tx.objectStore('wal').get('active');g.onsuccess=()=>{const ok=!!(g.result&&g.result.value&&g.result.value.seq===ps.persistedWalSeq);db.close();resolve(ok)};g.onerror=()=>reject(g.error)};q.onerror=()=>reject(q.error)});
      if(!durable)throw Error('postcommit durable WAL fixture missing');
      window.__sevenRcProcess={status:'ready',phase:'postcommit',revision:ps.revision,walSeq:ps.persistedWalSeq};
    })().catch(e=>window.__sevenRcProcess={status:'error',phase:'postcommit',error:String(e&&e.message||e)});return true})()`;
  }
  return `(()=>{window.__sevenRcProcess={status:'pending',phase:'cleancommit'};(async()=>{
    if(await roomPersistence.flush()!==true)throw Error('cleancommit base flush failed');const before=roomPersistence.status();
    ${mutate}
    const saved=await roomPersistence.save();await roomPersistence.flush();const ps=roomPersistence.status();
    if(saved!==true||ps.failed||ps.pending||ps.walStaged||ps.revision<=before.revision)throw Error('cleancommit window invalid '+JSON.stringify(ps));
    window.__sevenRcProcess={status:'ready',phase:'cleancommit',revision:ps.revision};
  })().catch(e=>window.__sevenRcProcess={status:'error',phase:'cleancommit',error:String(e&&e.message||e)});return true})()`;
}

function verifyProcessScript(phase){
  const P=phaseData(phase);
  return verifyStateScript(P.title,P.message,P.artifact);
}

module.exports={FIXTURE,seedUpgradeScript,verifyStateScript,stageProcessScript,verifyProcessScript,phaseData};
