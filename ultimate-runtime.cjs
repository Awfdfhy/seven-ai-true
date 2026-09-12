const assert=require('assert');
const {SevenUltimateOS}=require('./src/ultimate/runtime.js');
const {RevisionedMemoryStore}=require('./src/ultimate/persistence.js');

(async()=>{
 let n=0;const os=new SevenUltimateOS({clock:()=>`2026-09-12T22:30:${String(n++).padStart(2,'0')}+03:00`,persistence:new RevisionedMemoryStore()});
 const ids=os.createRpg({gameId:'valen',campaignId:'main',timelineId:'prime',name:'Valen'});assert.deepStrictEqual(ids,{gameId:'valen',campaignId:'main',timelineId:'prime'});
 os.core.registerEntity('valen',{id:'ali',name:'Ali',tier:'core'});os.core.registerEntity('valen',{id:'aria',name:'Aria',tier:'core'});
 os.characters.createProfile('valen','aria',{values:['autonomy','duty'],philosophy:['Power must justify itself'],goals:['protect choice']});
 os.story.defineSeries('prime',{title:'Valen',themes:['choice']});os.story.createSeason('prime',{id:'s1',dramaticQuestion:'Can Valen remain free?'});os.story.createArc('prime',{id:'politics',seasonId:'s1'});
 os.plots.create({id:'plot_politics',title:'Political pressure'});
 os.visuals.registerCharacter('valen','aria',{identity:{design:'canon'}});os.visuals.addOutfit('valen','aria',{id:'royal'});
 os.models.registerProvider({id:'local',local:true});os.models.registerModel({id:'local-rpg',providerId:'local',roles:['rpg']});
 os.tools.register({id:'custom_story_tool',category:'rpg',capabilities:['story_custom']});
 const first=os.commitBeat({id:'meet',playerEntityId:'ali',actorEntityId:'aria',actionType:'dialogue',payload:{text:'Aria speaks'},witnessIds:['ali'],rememberBy:['ali'],interpretations:{ali:{summary:'Aria spoke'}},knowledge:[{entityId:'ali',factId:'aria_warning',confidence:90}],relationshipChanges:[{a:'ali',b:'aria',trust:4}],plotAdvances:[{plotId:'plot_politics',action:'advance'}]});assert.equal(first.id,'meet');
 assert.equal(os.knowledge.knows('valen','prime','ali','aria_warning'),true);assert.equal(os.relationships.get('ali','aria').trust,54);assert.equal(os.plots.get('plot_politics').events.length,1);
 assert.throws(()=>os.commitBeat({id:'stolen',playerEntityId:'ali',actorEntityId:'ali',actionType:'opinion',payload:{text:'Seven invents Ali opinion'}}),/PLAYER_AGENCY_REQUIRED/);
 const owned=os.commitBeat({id:'owned',playerEntityId:'ali',actorEntityId:'ali',actionType:'opinion',userAuthored:true,payload:{text:'Ali decides'},rememberBy:['ali']});assert.equal(owned.id,'owned');
 const packet=os.prepareRpgTurn({userInput:'What did Aria say?',activeCharacters:['ali'],scene:{location:'palace'},tone:{seriousness:70}});assert.equal(packet.recall.ali.items.length>0,true);assert.equal(packet.knowledge.ali.length,1);assert.equal(packet.agencyMode,'sovereign');assert.ok(packet.context.items.some(x=>x.id==='scene'));
 const saved=await os.save('state',0);assert.equal(saved.revision,1);os.core.appendEvent('valen','main','prime',{id:'temporary'});os.plots.create({id:'temporary_plot'});assert.equal(os.core.gameSummary('valen').events,3);
 const loaded=await os.load('state');assert.equal(loaded.revision,1);assert.equal(os.core.gameSummary('valen').events,2,'load must restore durable canonical snapshot');
 assert.equal(os.characters.get('valen','aria').values[0].name,'autonomy','character soul must persist');assert.equal(os.story.atlas('prime').seasons.length,1,'story architecture must persist');assert.equal(os.knowledge.knows('valen','prime','ali','aria_warning'),true,'knowledge firewall must persist');assert.equal(os.relationships.get('ali','aria').trust,54,'relationships must persist');assert.equal(os.plots.rows.has('temporary_plot'),false,'post-save derived mutations must not survive restore');assert.equal(os.plots.get('plot_politics').events.length,1);assert.equal(os.visuals.referencePack('valen','aria').state.outfitId,'royal','visual canon must persist');assert.equal(os.models.models.has('local-rpg'),true,'model registry must persist');assert.equal(os.tools.resolve('custom_story_tool').category,'rpg','custom tool registry must persist');
 assert.equal(os.theme({mode:'night'}).launcherIcon,'seven-night');assert.equal(os.snapshot().tools,41);
 console.log('ultimate runtime: 24 assertions PASS');
})().catch(err=>{console.error(err);process.exit(1)});
