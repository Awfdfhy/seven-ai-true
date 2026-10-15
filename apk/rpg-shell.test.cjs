'use strict';
const assert=require('node:assert/strict');
const {removeLegacyUi,RPG_SHELL}=require('./rpg-shell.cjs');
const fixture=[
  '<!doctype html><html><head><title>Seven AI</title>',
  '<style id="seven-final-style">.sidebar{display:block}</style>',
  '<style id="seven-beta-ui-style">.topbar{display:block}</style>',
  '</head><body><!-- SEVEN_FINAL_RELEASE_LAYER_V1:fixture -->',
  '<!-- Sidebar --><div id="sidebar"><div id="roomList"></div></div>',
  '<div id="chat"></div><div id="settingsModal"><select id="modelSelect"></select></div>',
  '<script>window.legacyModelTransport=true;</script>',
  '<script id="seven-ui-runtime">window.legacyUI=true;</script>',
  '</body></html>'
].join('');
const result=removeLegacyUi(fixture);
assert.ok(result.includes('SEVEN_RPG_NATIVE_SHELL_V1'));
assert.ok(!result.includes('<!-- Sidebar -->'));
assert.ok(!result.includes('.sidebar{display:block}'));
assert.ok(!result.includes('id="seven-ui-runtime"'));
assert.ok(result.includes('window.legacyModelTransport=true'), 'Keep provider transport, not legacy UI');
assert.ok(!result.includes('window.legacyUI=true'));
for(const id of ['sidebar','roomList','roomTitle','chat','userInput','settingsModal','modelSelect','routingModeSelect','sendBtn','stopBtn']){
  assert.equal((result.match(new RegExp('id="'+id+'"','g'))||[]).length,1,'One RPG-owned '+id);
}
assert.ok(RPG_SHELL.includes('class="rpg-header"'));
for(const id of ['rpg-library-search','rpg-library-count','rpg-library-empty','rpg-model-search','rpg-provider-filter','rpg-refresh-models','rpg-model-count','rpg-model-refresh-state']){
  assert.ok(result.includes('id="'+id+'"'),'Missing RPG menu control '+id);
}
assert.ok(result.includes('class="rpg-story-tuning"'),'Missing collapsible narrator tuning section');
assert.ok(result.includes('id="rpg-test-narrator"'),'Narrator test button must be available');
assert.ok(result.includes('id="routingModeSelect"'),'RPG narrator routing must remain available');
assert.ok(result.includes('id="rpg-connections-panel"'),'RPG must support native provider onboarding');
assert.ok(result.includes('id="rpg-key-input"'),'Provider key input must be explicit and private');
assert.throws(()=>removeLegacyUi(result),/already installed/);
console.log('RPG exclusive shell replacement: PASS');
