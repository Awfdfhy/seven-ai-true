const assert=require('assert');
const {NarrativeCompiler}=require('./src/ultimate/narrative-engine.js');
const {AgencyRiskDetector,parsePlayerInput,LiveSceneSession}=require('./src/ultimate/live-agency.js');

(()=>{
 const n=new NarrativeCompiler();n.threads.create({id:'black_sun',title:'Black Sun',status:'active',importance:95,questions:['What is it?']});n.promises.add({id:'old_warning',text:'An old warning matters',importance:80});n.foreshadow.plant({id:'seed1',targetThreadId:'black_sun',earliestEpisode:2,latestUsefulEpisode:8,allowedRevealers:['aria']});
 for(let i=0;i<5;i++)n.pacing.record({tension:90,action:80,downtime:5,information:45});
 const plan=n.planScene({episode:4,location:'Valen Palace',time:'night',presentCharacters:['aria','ali'],characterGoals:{aria:'learn truth'},possibleExits:['player choice']});assert.equal(plan.contract.endingState,'unknown');assert.ok(plan.activeThreads.some(x=>x.id==='black_sun'));assert.ok(plan.promisesDue.some(x=>x.id==='old_warning'));assert.ok(plan.foreshadowing.some(x=>x.id==='seed1'));assert.equal(plan.pacing.recommendation,'breathing_scene_if_causally_valid');
 assert.equal(n.quality.judge({text:'A\n\nA',claimedCharacterThought:true,playerThoughtAuthorized:false}).pass,false);assert.equal(n.dialogue.annotate('No.',{speakerId:'aria',intents:['refuse','deflect']}).intents.length,2);
 const detector=new AgencyRiskDetector();assert.equal(detector.needsGate({directQuestion:true,decisionRequired:true}).gate,true);
 const parsed=parsePlayerInput('*Ali looks at Aria.* "No." [Think: She is hiding something.] [OOC: slower scene]');assert.equal(parsed.act[0],'Ali looks at Aria.');assert.equal(parsed.say[0],'No.');assert.equal(parsed.think[0],'She is hiding something.');assert.equal(parsed.ooc[0],'slower scene');
 const scene=new LiveSceneSession({playerEntityId:'ali',mode:'sovereign'});assert.equal(scene.proposeBeat({actorEntityId:'aria',actionType:'dialogue',text:'Question'}).state,'speculative');scene.commitSpeculative();assert.equal(scene.snapshot().committed.length,1);assert.equal(scene.proposeBeat({actorEntityId:'ali',actionType:'opinion'}).state,'gate');const answer=scene.playerInput('"I disagree."');assert.equal(answer.say[0],'I disagree.');
 scene.proposeBeat({actorEntityId:'aria',actionType:'movement'});const interrupted=scene.interrupt();assert.equal(interrupted.discarded.length,1);scene.continueWithoutActing();assert.equal(scene.finish().state,'complete');
 console.log('ultimate narrative/agency: 18 assertions PASS');
})();
