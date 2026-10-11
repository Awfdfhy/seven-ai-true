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
assert.ok(html.includes('id="seven-rpg-standalone-entry"'), 'Dedicated RPG entrypoint not wired');
assert.ok(html.includes('seven-rpg-standalone-style'), 'RPG-only navigation not wired');
const js = fs.readFileSync(path.join(root, 'www/rpg-standalone-entry.js'), 'utf8');
assert.match(js, /openWorkspace\('rpg'\)/, 'RPG should open on startup');
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
  assert.match(extract('assets/public/rpg-standalone-entry.js'), /openWorkspace\('rpg'\)/);
}
console.log('Seven RPG standalone profile: PASS ('+config.appId+', '+config.appName+', RPG-first startup assets)');
