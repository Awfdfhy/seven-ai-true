const assert=require('assert');
const Tools=require('./src/ultimate/tool-fabric.js');
const Registry=require('./src/ultimate/ui-registry.js');
const ToolUI=require('./src/ultimate/tool-ui.js');

const fabric=new Tools.ToolFabric();
const registry=new Registry.UIRegistry();
for(const tool of fabric.tools.values()) registry.ensureTool(tool);
const ui=new ToolUI.ToolPresentationEngine({registry});
const cards=ui.catalog(fabric.tools,new Map());
assert.equal(cards.length,Tools.BUILTIN_TOOL_IDS.length);
assert.ok(cards.length>=40);
for(const card of cards){
 assert.ok(card.toolId);assert.ok(card.title);assert.ok(card.icon);assert.ok(card.stateLabel);
 assert.ok(Array.isArray(card.actions)&&card.actions.length>0);assert.ok(card.motion);assert.ok(card.semantic);
}
const search=ui.card(fabric.resolve('web_search'),{state:'running',progress:.5,details:{query:'Seven UI research',results:20,opened:8}});
assert.equal(search.primary,'Seven UI research');assert.ok(search.meta.includes('20 results'));assert.equal(search.progress,.5);assert.ok(search.actions.includes('cancel'));
const permission=ui.card(fabric.resolve('patch_tool'),{state:'waiting_permission',details:{file:'app.js',added:12,removed:4}});
assert.equal(permission.permissionRequired,true);assert.ok(permission.actions.includes('allow_once'));assert.ok(permission.meta.includes('+12'));
const tests=ui.card(fabric.resolve('test_runner'),{state:'success',details:{suite:'Ultimate',passed:42,total:42}});
assert.equal(tests.semantic,'success');assert.ok(tests.meta.includes('42/42'));
const details=ui.detail(fabric.resolve('code_executor'),{state:'success',input:{command:'node all.cjs'},output:'PASS',history:[{state:'running'},{state:'success'}]});
assert.ok(details.sections.some(x=>x.id==='input'));assert.ok(details.sections.some(x=>x.id==='output'));assert.ok(details.sections.some(x=>x.id==='progress'));
console.log(`ultimate tool UI: ${cards.length} built in tool contracts PASS`);
