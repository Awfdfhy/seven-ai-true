'use strict';
const fs=require('fs'),assert=require('assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..');
const config=JSON.parse(fs.readFileSync(path.join(root,'capacitor.config.json'),'utf8'));
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
assert.equal(config.appId,'ai.seven.v243','RC install lineage package ID must remain stable');
assert.equal(pkg.sevenAndroidVersionCode,243,'baseline Android versionCode changed without a migration decision');
const fixture=require('./android-rc-state-fixture.cjs');
for(const phase of ['precommit','postcommit','cleancommit']){
  const script=fixture.stageProcessScript(phase);
  assert.match(script,/roomPersistence\.save\(\)/,'process phase must exercise the real save path');
  assert.match(script,/seven_ai_room_wal_v1|walStaged/,'process phase must observe the real WAL');
  assert.match(fixture.verifyProcessScript(phase),/roomPersistence\.status\(\)/);
}
assert.match(fixture.stageProcessScript('precommit'),/indexedDB\.open\('seven_ai_canonical_v1'\)/,'precommit phase must hold the real IndexedDB transaction');
const seed=fixture.seedUpgradeScript();
for(const required of ['createKnowledgeArtifact','addMemory','SevenRpgSession.createManager','secureSet','roomPersistence.save'])assert.ok(seed.includes(required),'upgrade fixture missing '+required);
const materializer=fs.readFileSync(path.join(__dirname,'materialize-android-rc-harness.cjs'),'utf8');
assert.match(materializer,/takePersistableUriPermission/);
assert.match(materializer,/getPersistedUriPermissions/);
assert.match(materializer,/versionCode\(\)>before/);
assert.match(materializer,/host did not kill the target process/);
const signing=fs.readFileSync(path.join(__dirname,'patch-production-signing.cjs'),'utf8');
assert.match(signing,/sevenReleaseKeystore/);
assert.match(signing,/signingConfig signingConfigs\.sevenRelease/);
console.log('android RC acceptance harness contracts: PASS');
