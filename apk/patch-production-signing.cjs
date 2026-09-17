const fs=require('fs');
const path=require('path');

const ROOT=path.resolve(__dirname,'..');
const gradlePath=path.join(ROOT,'android','app','build.gradle');
if(!fs.existsSync(gradlePath))throw new Error('generated Android app Gradle file missing');
let gradle=fs.readFileSync(gradlePath,'utf8');

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

fs.writeFileSync(gradlePath,gradle);
console.log('android production upload-key signing patch: PASS');
