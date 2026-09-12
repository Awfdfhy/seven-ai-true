const assert=require('assert');
const {layoutFor,CodingStudioState,CodingStudioPresentation}=require('./src/ultimate/coding-studio.js');
assert.equal(layoutFor(390).kind,'phone');assert.equal(layoutFor(900).kind,'compact');assert.equal(layoutFor(1440).kind,'desktop');
const state=new CodingStudioState({projectId:'seven',branch:'ultimate-rebuild-v1'});state.openFile('src/a.js',{preview:true});assert.equal(state.previewFile,'src/a.js');state.pinPreview();assert.ok(state.tabs.includes('src/a.js'));state.openFile('src/b.js',{preview:false});assert.equal(state.activeFile,'src/b.js');
const thread=state.createThread({id:'run1',title:'Build feature',mode:'plan',goal:'Implement feature'});thread.step({id:'inspect',label:'Inspect',state:'success'});thread.setMode('agent');thread.step({id:'edit',label:'Edit',state:'running'});thread.activity({id:'tests',title:'Test runner',state:'running',progress:.5});thread.enqueue('Polish the mobile layout');assert.equal(thread.snapshot().queue.length,1);
const terminal=state.createTerminal({id:'term1'});state.terminalEvent(terminal.id,{command:'node all.cjs',state:'running'});state.terminalEvent(terminal.id,{line:'PASS',state:'success',exitCode:0});assert.equal(state.view(1280).terminals[0].exitCode,0);
const changes=state.createChangeSet({id:'c1'});changes.addFile({path:'src/a.js',hunks:[{id:'h1',added:4,removed:1},{id:'h2',added:2,removed:0}]});changes.decide('src/a.js','h1','accepted');assert.equal(changes.summary().pending,1);
const ui=new CodingStudioPresentation({state});const card=ui.card();assert.equal(card.mode,'agent');assert.equal(state.view(390).layout.agentDock,'surface');
console.log('ultimate coding studio: 15 assertions PASS');
