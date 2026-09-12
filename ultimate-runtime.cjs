const assert=require('assert');
const {SevenUltimateOS}=require('./src/ultimate/runtime.js');
const {RevisionedMemoryStore}=require('./src/ultimate/persistence.js');

(async()=>{
 let n=0;const os=new SevenUltimateOS({clock:()=>`2026-09-12T22:30:${String(n++).padStart(2,'0')}+03:00`,persistence:new RevisionedMemoryStore()});
 const ids=os.createRpg({gameId:'valen',campaignId:'main',timelineId:'prime',name:'Valen'});assert.deepStrictEqual(ids,{gameId:'valen',campaignId:'main',timelineId:'prime'});
 os.core.registerEntity('valen',{id:'ali',name:'Ali',tier:'core'});os.core.registerEntity('valen',{id:'aria',name:'Aria',tier:'core'});
 const first=os.commitBeat({id:'meet',playerEntityId:'ali',actorEntityId:'aria',actionType:'dialogue',payload:{text:'Aria speaks'},witnessIds:['ali'],rememberBy:['ali'],interpretations:{ali:{summary:'Aria spoke'}}});assert.equal(first.id,'meet');
 assert.throws(()=>os.commitBeat({id:'stolen',playerEntityId:'ali',actorEntityId:'ali',actionType:'opinion',payload:{text:'Seven invents Ali opinion'}}),/PLAYER_AGENCY_REQUIRED/);
 const owned=os.commitBeat({id:'owned',playerEntityId:'ali',actorEntityId:'ali',actionType:'opinion',userAuthored:true,payload:{text:'Ali decides'},rememberBy:['ali']});assert.equal(owned.id,'owned');
 const packet=os.prepareRpgTurn({userInput:'What did Aria say?',activeCharacters:['ali'],scene:{location:'palace'},tone:{seriousness:70}});assert.equal(packet.recall.ali.items.length>0,true);assert.equal(packet.agencyMode,'sovereign');assert.ok(packet.context.items.some(x=>x.id==='scene'));
 const saved=await os.save('state',0);assert.equal(saved.revision,1);os.core.appendEvent('valen','main','prime',{id:'temporary'});assert.equal(os.core.gameSummary('valen').events,3);
 const loaded=await os.load('state');assert.equal(loaded.revision,1);assert.equal(os.core.gameSummary('valen').events,2,'load must restore durable canonical snapshot');
 assert.equal(os.theme({mode:'night'}).launcherIcon,'seven-night');assert.equal(os.snapshot().tools,40);
 console.log('ultimate runtime: 11 assertions PASS');
})().catch(err=>{console.error(err);process.exit(1)});
