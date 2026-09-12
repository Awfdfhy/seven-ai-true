const assert=require('assert');
const UI=require('./src/ultimate/ui-system.js');
const Registry=require('./src/ultimate/ui-registry.js');
const Tools=require('./src/ultimate/tool-fabric.js');

assert.equal(UI.responsiveMode(390),'compact');
assert.equal(UI.responsiveMode(600),'small');
assert.equal(UI.responsiveMode(900),'medium');
assert.equal(UI.responsiveMode(1200),'large');
assert.equal(UI.responsiveMode(1600),'xlarge');
assert.equal(UI.responsiveMode(2200),'xxlarge');

const touch=UI.interactionProfile({width:390,coarsePointer:true});
assert.ok(touch.minTarget>=48);
assert.equal(touch.hover,false);
assert.equal(touch.mode,'compact');

const reduced=UI.resolveMotion('expressive',{reducedMotion:true});
assert.equal(reduced.duration,0);
assert.deepEqual(reduced.properties,['opacity']);
const normal=UI.resolveMotion('spatial',{size:1,importance:1});
assert.ok(normal.duration>=210&&normal.duration<=260);

const day=UI.themeFor({mode:'day'}),night=UI.themeFor({mode:'night'});
assert.equal(day.dark,false);assert.equal(day.launcherIcon,'seven-day');
assert.equal(night.dark,true);assert.equal(night.launcherIcon,'seven-night');

const registry=new Registry.UIRegistry();
const fabric=new Tools.ToolFabric();
for(const tool of fabric.tools.values())registry.ensureTool(tool);
const audit=registry.audit();
assert.equal(audit.pass,true,JSON.stringify(audit.issues));
assert.ok(audit.surfaces>=70,`expected deep surface coverage, got ${audit.surfaces}`);
assert.ok(audit.components>=audit.surfaces+40,'all built-in tools should have UI contracts');

const search=registry.get('tool:web_search');
assert.ok(search.accessibility.minimumTarget>=44);
assert.equal(search.accessibility.keyboard,true);
assert.ok(search.states.includes('waiting_permission'));
const reducedTool=registry.state('tool:web_search','running',{reducedMotion:true});
assert.equal(reducedTool.motion,'opacity-only');
assert.equal(reducedTool.semantic,'progress');
const failure=registry.state('tool:web_search','error');
assert.equal(failure.semantic,'error');

const stack=new Registry.ActivityStack();
stack.start({id:'t1',title:'Search',progress:.25});
stack.update('t1',{progress:.8,state:'running'});
assert.equal(stack.summary().active,1);
stack.update('t1',{state:'success',progress:1});
assert.equal(stack.summary().active,0);
assert.equal(stack.summary().completed,1);

const motion=new UI.MotionScheduler({maxExpressive:1,maxAmbient:1});
assert.equal(motion.request({id:'a',kind:'expressive'}).state,'active');
assert.equal(motion.request({id:'b',kind:'expressive'}).state,'queued');
motion.complete('a');
assert.equal(motion.snapshot().active[0].id,'b');

console.log('ultimate deep UI: 31 assertions PASS');
