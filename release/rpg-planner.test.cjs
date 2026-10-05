const assert=require('assert/strict');
const State=require('./workspaces/rpg-state.js');
const Planner=require('./workspaces/rpg-planner.js');
const s=State.createState({characters:{p:{control:'player',locationId:'x',intent:'win'},a:{control:'ai',locationId:'x',intent:'investigate',emotions:{anxiety:.8}},n:{control:'narrator',locationId:'x',intent:'narrate'}},openThreads:{mystery:{status:'open',updatedTurn:5}},factions:{guild:{goals:['expand'],leaderIds:['a']}}});
const plan=Planner.buildPlan(s,State);assert.ok(plan.npcProposals.some(x=>x.characterId==='a'));assert.ok(!plan.npcProposals.some(x=>x.characterId==='p'));assert.ok(!plan.npcProposals.some(x=>x.characterId==='n'));assert.equal(plan.openThreads[0].id,'mystery');
const events=Planner.worldTickProposals(s,State,{emotionDecay:.1});assert.ok(events.some(x=>x.payload.characterId==='a'));assert.ok(!events.some(x=>x.payload.characterId==='p'));
console.log('rpg planner: PASS');