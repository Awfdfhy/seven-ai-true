const fs=require('fs');
const path=require('path');

// Pure: adds the sevenRelease upload-key signing config + release-buildType
// signing logic to a Gradle string that already contains the sevenCi signing
// block (injected by apk/patch-android.cjs during android:generate).
// Returns the patched Gradle string. Idempotent: re-applying adds nothing.
function patchProductionGradleSigning(gradle){
  if(!gradle.includes('def sevenCiKeystore'))throw new Error('Seven CI signing patch must run before production signing patch');

  const prelude=`def sevenReleaseKeystore = project.findProperty("sevenReleaseKeystore")\ndef sevenReleaseStorePass = project.findProperty("sevenReleaseStorePass")\ndef sevenReleaseKeyAlias = project.findProperty("sevenReleaseKeyAlias")\ndef sevenReleaseKeyPass = project.findProperty("sevenReleaseKeyPass")\n`;
  if(!gradle.includes('def sevenReleaseKeystore'))gradle=prelude+gradle;

  const configMarker='    signingConfigs {\n        if (sevenCiKeystore) {';
  if(!gradle.includes(configMarker))throw new Error('Seven CI signingConfigs marker missing');
  if(!gradle.includes('sevenRelease {')){
    gradle=gradle.replace(configMarker,`    signingConfigs {\n        if (sevenReleaseKeystore) {\n            sevenRelease {\n                storeFile file(sevenReleaseKeystore)\n                storePassword sevenReleaseStorePass\n                keyAlias sevenReleaseKeyAlias\n                keyPassword sevenReleaseKeyPass\n            }\n        }\n        if (sevenCiKeystore) {`);
  }

  const releaseMarker=`        release {\n            if (sevenCiKeystore) {\n                signingConfig signingConfigs.sevenCi\n            }`;
  if(!gradle.includes(releaseMarker)&&!gradle.includes('signingConfig signingConfigs.sevenRelease'))throw new Error('Seven release buildType signing marker missing');
  if(!gradle.includes('signingConfig signingConfigs.sevenRelease')){
    gradle=gradle.replace(releaseMarker,`        release {\n            if (sevenReleaseKeystore) {\n                signingConfig signingConfigs.sevenRelease\n            } else if (sevenCiKeystore) {\n                signingConfig signingConfigs.sevenCi\n            }`);
  }

  return gradle;
}

// CLI path (unchanged behavior): patch the generated android/app/build.gradle.
// A real production upload requires an external release keystore supplied via
// the sevenReleaseKeystore/StorePass/KeyAlias/KeyPass Gradle properties; this
// patch only prepares the Gradle to consume it. No key is created or logged.
if(require.main===module){
  const ROOT=path.resolve(__dirname,'..');
  const gradlePath=path.join(ROOT,'android','app','build.gradle');
  if(!fs.existsSync(gradlePath))throw new Error('generated Android app Gradle file missing');
  let gradle=fs.readFileSync(gradlePath,'utf8');
  gradle=patchProductionGradleSigning(gradle);
  fs.writeFileSync(gradlePath,gradle);
  console.log('android production upload-key signing patch: PASS');
}

module.exports={patchProductionGradleSigning};
