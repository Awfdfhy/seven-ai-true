const fs=require('fs');
const path=require('path');
const assert=require('assert/strict');
const {gitIdentity,verifyPayload}=require('./build-provenance.cjs');
const {sha256}=require('./build-provenance.cjs');
const {verifyBinary}=require('./binary-verification.cjs');
const zipRead=require('./zip-read.cjs');
const ROOT=path.resolve(__dirname,'..');
const PACKAGE=JSON.parse(fs.readFileSync(path.join(ROOT,'package.json'),'utf8'));
const EXPECTED_VERSION_NAME=String(PACKAGE.version||'').trim();
const EXPECTED_VERSION_CODE=Number(PACKAGE.sevenAndroidVersionCode);
const generatedGradlePath=path.join(ROOT,'android','app','build.gradle');
assert.ok(fs.existsSync(generatedGradlePath),'generated Android build.gradle missing');
const generatedGradle=fs.readFileSync(generatedGradlePath,'utf8');
assert.match(generatedGradle,new RegExp('versionCode\\s+'+EXPECTED_VERSION_CODE+'(?:\\s|$)'),'generated Android versionCode does not match package.json');
assert.ok(
  generatedGradle.includes('versionName "'+EXPECTED_VERSION_NAME+'"')||generatedGradle.includes("versionName '"+EXPECTED_VERSION_NAME+"'"),
  'generated Android versionName does not match package.json'
);
const DEFAULT_APK=path.join(ROOT,'android','app','build','outputs','apk','debug','app-debug.apk');
const APK=path.resolve(process.env.SEVEN_APK_PATH||process.argv[2]||DEFAULT_APK);
assert.ok(fs.existsSync(APK),`APK missing: ${APK}`);
const bytes=fs.statSync(APK).size;
assert.ok(bytes<30*1024*1024,`APK too large: ${bytes}`);
const appId=JSON.parse(fs.readFileSync(path.join(ROOT,'capacitor.config.json'),'utf8')).appId;
const binary=verifyBinary(APK,{packageName:appId,versionCode:EXPECTED_VERSION_CODE,versionName:EXPECTED_VERSION_NAME});
// Read the APK with the dependency-free reader instead of shelling out to `unzip`, which does not
// exist on Windows. No shell is involved, so no argument escaping is possible.
const archive=zipRead.open(APK);
const listing=archive.listing();
assert.match(listing,/assets\/public\/index\.html/);
assert.match(listing,/assets\/public\/vendor\/pdfjs\/pdf\.min\.mjs/);
assert.match(listing,/assets\/public\/workspaces\/remake\.css/);
assert.match(listing,/assets\/public\/workspaces\/remake\.js/);
assert.match(listing,/assets\/public\/workspaces\/intelligence\.js/);
if(appId==='ai.seven.rpg'){
  assert.ok(listing.includes('assets/public/rpg-standalone-ui.css'),'RPG redesign stylesheet missing');
  assert.ok(listing.includes('assets/public/rpg-standalone-entry.js'),'RPG entrypoint missing');
  for(const name of ['coding.js','research.js','research-v2.js','generated-ui.js','generated-ui.css']){
    assert.ok(!listing.includes('assets/public/workspaces/'+name),'RPG APK contains unrelated workspace: '+name);
  }
}else{assert.ok(listing.includes('assets/public/workspaces/research-v2.js'));}

assert.match(listing,/classes(?:\d*)?\.dex/);
const packagedManifest=archive.read('assets/public/seven-packaging.json');
const provenance=JSON.parse(packagedManifest.toString('utf8')),identity=gitIdentity(ROOT);
assert.equal(identity.sourceDirty,false,'APK verification requires committed source');
verifyPayload(provenance,name=>{
  return archive.read('assets/public/'+name);
},{sourceCommit:identity.sourceCommit});
console.log('APK source provenance: '+provenance.sourceCommit+' / run '+(provenance.workflowRunId||'local'));
const html=archive.read('assets/public/index.html').toString('utf8');
assert.ok(html.includes('SEVEN_FINAL_RELEASE_LAYER_V1'),'release marker missing from APK');
assert.ok(html.includes('id="seven-app"')&&html.includes('data-seven-remake="1"'),'modern Seven UI root missing from APK');
assert.ok(html.includes('./workspaces/remake.css')&&html.includes('./workspaces/remake.js')&&html.includes('./workspaces/intelligence.js'),'modern Seven UI wiring missing from APK');
assert.ok(!html.includes('cdnjs.cloudflare.com/ajax/libs/pdf.js'),'APK still references remote PDF runtime');
assert.ok(html.includes('Seven 2.4.3 Zero-Key + UI Cleanup'),'2.4.3 UI cleanup marker missing from APK');
assert.ok(html.includes('Seven 2.4.2 Zero-Key UX'),'zero-key marker missing from APK');
assert.ok(!html.includes('id="apiKeyInput"')&&!html.includes('id="nvidiaApiKeyInput"')&&!html.includes('id="openrouterApiKeyInput"')&&!html.includes('id="geminiApiKeyInput"')&&!html.includes('id="llm7TokenInput"'),'APK still contains manual API-key fields');
assert.ok(!/type=["']password["']/i.test(html),'APK still contains password credential inputs');
assert.ok(!html.includes('id="nameModal"')&&!html.includes('id="nameInput"'),'APK still contains legacy name capture UI');
assert.ok(html.includes('Automatic Providers')&&html.includes('Zero-Key routing'),'APK missing automatic provider UX');
const bundledRemakeCss=archive.read('assets/public/workspaces/remake.css').toString('utf8');
assert.ok(bundledRemakeCss.includes('--seven-ui-hardening-v242:1'),'APK missing bundled UI hardening layer');
const bundledRemakeJs=archive.read('assets/public/workspaces/remake.js').toString('utf8');
assert.ok(!bundledRemakeJs.includes('s-brave-key'),'APK still contains manual Brave key control');
assert.ok(!bundledRemakeJs.includes('Brave API key'),'APK still asks for a Brave API key');
assert.ok(!bundledRemakeJs.includes('Enter API key'),'APK still contains manual API-key prompt');

fs.mkdirSync(path.join(ROOT,'dist'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'dist','apk-verification.json'),JSON.stringify({format:'seven-apk-verification',version:1,sourceCommit:provenance.sourceCommit,workflowRunId:provenance.workflowRunId,apkSha256:sha256(fs.readFileSync(APK)),bytes,webAssetCount:provenance.files.length,...binary},null,2));
console.log(`apk package gate: PASS (${path.basename(APK)}, ${bytes} bytes, ${binary.packageName} ${binary.versionName}/${binary.versionCode}, signature verified)`);
