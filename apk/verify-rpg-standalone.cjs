'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'capacitor.config.json'), 'utf8'));
assert.equal(config.appId, 'ai.seven.rpg', 'Standalone APK must not reuse Seven AI package ID');
assert.equal(config.appName, 'Seven RPG', 'Android launcher identity must be Seven RPG');
const html = fs.readFileSync(path.join(root, 'www/index.html'), 'utf8');
assert.ok(html.includes('<title>Seven RPG</title>'), 'Standalone HTML must identify as Seven RPG before boot');
assert.ok(html.includes('id="seven-rpg-standalone-entry"'), 'Dedicated RPG entrypoint not wired');
assert.ok(html.includes('SEVEN_RPG_NATIVE_SHELL_V1'), 'New RPG-only document shell is missing');
assert.ok(!html.includes('<!-- Sidebar -->'), 'Legacy Seven AI interface was not deleted');
assert.ok(!html.includes('id="seven-beta-ui-style"'), 'Legacy Seven AI styling still ships in the app');
assert.ok(html.includes('class="rpg-header"') && html.includes('class="rpg-application"'), 'New RPG interface missing');
assert.ok(html.includes('seven-rpg-standalone-style'), 'RPG-only navigation not wired');
assert.ok(html.includes('id="rpg-smart-controls"'), 'RPG smart controls not wired');
assert.ok(fs.existsSync(path.join(root,'www/rpg-smart-controls.js')), 'RPG smart controls not packaged');
assert.ok(html.includes('id="rpg-provider-keys"'),'Android Keystore provider bridge missing from RPG APK');
assert.ok(fs.existsSync(path.join(root,'www/rpg-provider-keys.js')),'Native provider onboarding script missing');
assert.ok(html.includes('id="rpg-scene-vista"')&&html.includes('id="seven-rpg-scene-controller"'),'Illustrated scene stage missing');
assert.ok(fs.existsSync(path.join(root,'www/rpg-scene-controller.js')),'Scenery controller absent');
const sceneDir=path.join(root,'www','rpg-scenes');
const sceneManifest=JSON.parse(fs.readFileSync(path.join(sceneDir,'manifest.json'),'utf8'));
assert.equal(sceneManifest.schema,'seven-rpg-scene-pack.v1');
assert.ok(sceneManifest.scenes.length>=14,'Too few unique illustrated world scenes');
let artBytes=0;
for(const scene of sceneManifest.scenes){
  assert.match(scene.file,/^[a-z0-9-]+\.jpg$/,'Unexpected scene filename');
  const file=path.join(sceneDir,scene.file);
  assert.ok(fs.existsSync(file),'Missing art scene: '+scene.file);
  const bytes=fs.statSync(file).size;
  assert.equal(bytes,scene.bytes,'Scene size mismatch');
  artBytes+=bytes;
}
assert.ok(artBytes>=78*1024*1024 && artBytes<94*1024*1024,'Illustrated asset pack is outside planned RPG size envelope: '+artBytes);
assert.ok(html.includes('id="rpg-key-provider"') && html.includes('rpg-connections-panel'),'RPG provider-connection menu missing');
for(const id of ['rpg-library-search','rpg-model-search','rpg-provider-filter','rpg-refresh-models']){
  assert.ok(html.includes('id="'+id+'"'), 'RPG navigation/model control missing: '+id);
}
assert.ok(html.includes('No available route — refresh or check provider access'), 'RPG model picker availability guard missing');
assert.ok(!html.includes('const pool = ready.length ? ready : all;'), 'Unconfigured models must never become selectable');
assert.ok(html.includes('rpg-memory-runtime.js'),'RPG state runtime bootstrap missing');
const memoryScript=fs.readFileSync(path.join(root,'www/rpg-memory-runtime.js'),'utf8');
assert.ok(memoryScript.includes('window.SevenRuntime = (() => {') && memoryScript.includes('commitMemory'),'RPG state runtime incomplete');
const js = fs.readFileSync(path.join(root, 'www/rpg-standalone-entry.js'), 'utf8');
assert.match(js, /SevenWorkspaces\.open\('rpg'\)/, 'RPG must boot via dedicated RPG-only workspace host');
assert.match(js, /sevenStandaloneReady/, 'RPG startup readiness state missing');
assert.ok(!html.includes('Seven RPG production signing verified'), 'No unverified production-signed claims');
const apk = path.join(root, 'android/app/build/outputs/apk/debug/app-debug.apk');
if(fs.existsSync(apk)){
  function extract(entry){
    const out = spawnSync('unzip', ['-p', apk, entry], {encoding:'utf8', maxBuffer:10*1024*1024});
    assert.equal(out.status, 0, 'APK missing '+entry+': '+out.stderr);
    return out.stdout;
  }
  const packedHtml = extract('assets/public/index.html');
  assert.ok(packedHtml.includes('seven-rpg-standalone-entry'), 'APK ships wrong HTML profile');
  assert.match(extract('assets/public/rpg-standalone-entry.js'), /SevenWorkspaces\.open\('rpg'\)/);
  assert.ok(!packedHtml.includes('<!-- Sidebar -->'), 'Legacy HTML still present inside APK');
  const hub=extract('assets/public/workspaces/hub.js');
  assert.ok(hub.includes('Seven RPG exclusive workspace host'), 'APK ships legacy multi-workspace hub');
}
const workspace=path.join(root,'www','workspaces');
if(fs.existsSync(workspace)){
  const files=fs.readdirSync(workspace);
  for(const old of ['coding.js','research.js','research-v2.js','seven-shell.js','seven-shell-final.js','generated-ui.js','remake.js','hub.css']){
    assert.ok(!files.includes(old),'Non-RPG UI asset still ships: '+old);
  }
  assert.ok(fs.readFileSync(path.join(workspace,'hub.js'),'utf8').includes('Seven RPG exclusive workspace host'),'RPG hub was not replaced');
}
console.log('Seven RPG standalone profile: PASS ('+config.appId+', '+config.appName+', RPG-only shell and assets)');
