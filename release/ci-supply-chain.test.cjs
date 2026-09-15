"use strict";
const assert=require("assert/strict"),fs=require("fs"),path=require("path");let n=0;const ok=(v,m)=>{assert.ok(v,m);n++};
const root=path.join(__dirname,"..");
const tests=fs.readFileSync(path.join(root,".github","workflows","seven-tests.yml"),"utf8");
const android=fs.readFileSync(path.join(root,".github","workflows","android-apk.yml"),"utf8");
const pkg=JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8"));
const testPins={
  checkout:"actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1",
  setup:"actions/setup-node@820762786026740c76f36085b0efc47a31fe5020",
  upload:"actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a"
};
const androidPins={
  checkout:"actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1",
  setupNode:"actions/setup-node@820762786026740c76f36085b0efc47a31fe5020",
  setupJava:"actions/setup-java@de7274f081f381c8f8158605e0321c36c376e2e6",
  emulator:"ReactiveCircus/android-emulator-runner@a421e43855164a8197daf9d8d40fe71c6996bb0d",
  upload:"actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a"
};
for(const [name,pin] of Object.entries(testPins))ok(tests.includes(pin),`test ${name} action must be immutable-SHA pinned`);
for(const [name,pin] of Object.entries(androidPins))ok(android.includes(pin),`android ${name} action must be immutable-SHA pinned`);
for(const [name,y] of [["test",tests],["android",android]]){
  ok(!/uses:\s*[^\s@]+@(?:v\d+(?:\.\d+){0,2}|main|master|latest)\b/i.test(y),`${name} workflow cannot execute mutable action refs`);
  ok(/permissions:\s*\n\s*contents:\s*read/.test(y),`${name} workflow token must retain read-only contents permission`);
  ok(y.includes("package-manager-cache: false"),`${name} setup-node cache must be explicitly disabled without committed lockfile`);
}
ok(tests.includes("npm install --ignore-scripts --no-save playwright@1.63.0 pdfjs-dist@4.10.38"),"test toolchain must be explicit and install scripts disabled");
ok(tests.includes("npm install --package-lock-only --ignore-scripts --no-audit --no-fund"),"test audit resolution must suppress install scripts");
ok(tests.includes("npm audit --json > /tmp/seven-audit-full.json || true"),"test full graph audit evidence required");
ok(tests.includes("npm audit --omit=dev --json > /tmp/seven-audit-prod.json || true"),"test production audit evidence required");
ok(tests.includes("node release/dependency-audit-gate.cjs"),"test sealed dependency audit gate required");
ok(android.includes("npm install --ignore-scripts --no-audit --no-fund"),"Android dependency install must suppress lifecycle scripts");
ok(android.includes("npm install --package-lock-only --ignore-scripts --no-audit --no-fund"),"Android audit resolution must suppress install scripts");
ok(android.includes("npm audit --omit=dev --json > /tmp/seven-audit-prod.json || true"),"Android production audit evidence required");
ok(android.includes("node release/dependency-audit-gate.cjs"),"Android build must pass the same production dependency audit gate");
ok(android.includes("npx --no-install playwright install"),"Android workflow may not let npx fetch an undeclared Playwright package");
ok(/branches:\s*\n(?:\s*-.*\n)*\s*- ultimate-polish-v1\b/.test(android),"Android workflow must exercise the active polish branch");
ok(android.includes("- 'package-lock.json'"),"future dependency lock changes must retrigger Android verification");
ok(android.includes("./gradlew --no-daemon lintDebug testDebugUnitTest assembleDebug"),"Android lint, unit test and APK build gate required");
ok(android.includes(":app:connectedDebugAndroidTest"),"Android emulator instrumentation smoke gate required");
ok(!pkg.devDependencies?.["@capacitor/assets"],"legacy @capacitor/assets tooling with nested native install script must stay removed");
ok(pkg.scripts?.["android:generate"]?.includes("apk/materialize-android-assets.cjs"),"Android build must use Seven deterministic asset materializer");
ok(pkg.scripts?.["android:generate"]?.includes("npx --no-install cap"),"Capacitor CLI must resolve only from installed dependency graph");
ok(!pkg.scripts?.["android:generate"]?.includes("capacitor-assets"),"Android build cannot silently restore legacy asset generator");
console.log(`CI Supply Chain Contract: PASS (${n} assertions; test + Android workflows SHA-pinned, script-suppressed installs, local asset pipeline, audit gates, read-only tokens)`);
