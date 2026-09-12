const assert=require('assert');
const {SevenUltimateOS}=require('./src/ultimate/runtime.js');

(async()=>{
 const os=new SevenUltimateOS();os.models.registerProvider({id:'fake',freeProof:'verified_free',latencyMs:20});os.models.registerModel({id:'fake-general',providerId:'fake',roles:['general','research','coding','rpg'],quality:.8,speed:.9});
 os.providers.register({id:'fake',async *streamChat(){yield 'Hello ';yield 'from Seven';}},{freeProof:'verified_free'});
 const p1=os.planRequest({text:'search latest documentation',search:true});assert.equal(p1.intent.searchRequested,true);assert.ok(p1.tools.some(t=>t.id==='web_search'));assert.equal(p1.model.selected.modelId,'fake-general');
 const publicPlan=os.controller.publicPlan(p1);assert.equal(publicPlan.search,true);assert.ok(!Object.prototype.hasOwnProperty.call(publicPlan,'reasoning'),'public plan must not expose hidden reasoning');
 const chunks=[];const result=await os.chat({id:'chat1',text:'hello',messages:[{role:'user',content:'hello'}],onChunk:x=>chunks.push(x)});assert.equal(result.run.status,'completed');assert.equal(result.run.output,'Hello from Seven');assert.equal(chunks.join(''),'Hello from Seven');assert.equal(os.halo.state.mode,'success');
 const rpgPlan=os.planRequest({text:'continue the RPG story episode',complexity:.8,uncertainty:.5,risk:.4,latencyPriority:.2});assert.equal(rpgPlan.intent.role,'rpg');assert.ok(['deep','max','think'].includes(rpgPlan.compute.mode));
 console.log('ultimate cognitive controller: 13 assertions PASS');
})().catch(err=>{console.error(err);process.exit(1)});