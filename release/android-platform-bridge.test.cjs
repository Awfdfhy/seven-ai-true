"use strict";
const assert=require("assert");
const fs=require("fs");
const path=require("path");
const ROOT=path.resolve(__dirname,"..");
const generator=fs.readFileSync(path.join(ROOT,"apk","materialize-native-platform.cjs"),"utf8");
const motionBridge=fs.readFileSync(path.join(ROOT,"apk","materialize-android-motion-bridge.cjs"),"utf8");
const visual=fs.readFileSync(path.join(ROOT,"apk","materialize-android-visual-test.cjs"),"utf8");
const hardener=fs.readFileSync(path.join(ROOT,"apk","harden-native-platform.cjs"),"utf8");
const patch=fs.readFileSync(path.join(ROOT,"apk","patch-android.cjs"),"utf8");
const pkg=JSON.parse(fs.readFileSync(path.join(ROOT,"package.json"),"utf8"));
let n=0;const ok=(v,m)=>{assert.ok(v,m);n++};const no=(v,m)=>{assert.ok(!v,m);n++};

ok(pkg.scripts["android:generate"].includes("materialize-native-platform.cjs"),"native platform materialization must be in Android generation path");
ok(pkg.scripts["android:generate"].includes("materialize-android-motion-bridge.cjs"),"Android reduced-motion bridge must be in generation path");
ok(pkg.scripts["android:generate"].includes("harden-native-platform.cjs"),"native permission hardening must be in Android generation path");
ok(pkg.scripts["android:generate"].indexOf("cap add android")<pkg.scripts["android:generate"].indexOf("materialize-native-platform.cjs"),"native materialization must happen after Android project generation");
ok(pkg.scripts["android:generate"].indexOf("materialize-native-platform.cjs")<pkg.scripts["android:generate"].indexOf("materialize-android-motion-bridge.cjs"),"motion bridge must extend the registered native MainActivity");
ok(pkg.scripts["android:generate"].indexOf("materialize-android-motion-bridge.cjs")<pkg.scripts["android:generate"].indexOf("harden-native-platform.cjs"),"native permission hardening must run after motion bridge materialization");
ok(generator.includes('@CapacitorPlugin(name="SevenPlatform")'),"SevenPlatform must be a real Capacitor plugin");
ok(generator.includes("registerPlugin(SevenPlatformPlugin.class)"),"plugin must be registered in MainActivity");
ok(generator.indexOf("registerPlugin(SevenPlatformPlugin.class)")<generator.indexOf("super.onCreate(savedInstanceState)"),"plugin must register before BridgeActivity creates its bridge");

ok(generator.includes('KeyStore.getInstance(ANDROID_KEYSTORE)'),"secret key must live in Android Keystore");
ok(generator.includes('AES/GCM/NoPadding'),"authenticated encryption is required");
ok(generator.includes('setRandomizedEncryptionRequired(true)'),"secure store must require randomized encryption");
ok(generator.includes('GCMParameterSpec(128,iv)'),"GCM authentication tag strength must be explicit");
ok(generator.includes('Context.MODE_PRIVATE'),"ciphertext preferences must be private to app");
ok(generator.includes('cipher.getIV()'),"fresh encryption IV must be persisted with ciphertext");
no(generator.includes('ENCRYPTION_PADDING_PKCS7'),"GCM must not be downgraded to padding mode");
no(generator.includes('android.util.Log'),"native secret boundary must not log values");
no(generator.includes('System.out.println'),"native secret boundary must not print values");

ok(generator.includes('Intent.ACTION_OPEN_DOCUMENT'),"SAF open must use ACTION_OPEN_DOCUMENT");
ok(generator.includes('Intent.ACTION_CREATE_DOCUMENT'),"SAF create must use ACTION_CREATE_DOCUMENT");
ok(generator.includes('Intent.CATEGORY_OPENABLE'),"SAF intents must request openable documents");
ok(generator.includes('FLAG_GRANT_PERSISTABLE_URI_PERMISSION'),"SAF grant must support persisted user authorization");
ok(generator.includes('takePersistableUriPermission'),"selected URI authorization must be persisted when provider permits it");
ok(generator.includes('releasePersistableUriPermission'),"persisted document authorization must be releasable");
ok(generator.includes('only content:// SAF URIs are accepted'),"native file operations must reject arbitrary filesystem paths");
no(generator.includes('MANAGE_EXTERNAL_STORAGE'),"all-files access is forbidden");
no(generator.includes('READ_EXTERNAL_STORAGE'),"legacy broad storage read permission is forbidden");
no(generator.includes('WRITE_EXTERNAL_STORAGE'),"legacy broad storage write permission is forbidden");

ok(hardener.includes('canRead&&canWrite'),"persisted SAF grants must choose explicit read/write constant combinations");
ok(hardener.includes('Intent.FLAG_GRANT_READ_URI_PERMISSION|Intent.FLAG_GRANT_WRITE_URI_PERMISSION'),"combined SAF grant must remain a compile-time allowed constant expression");
ok(hardener.includes('getPersistedUriPermissions()'),"release must inspect grants actually held instead of guessing");
no(hardener.includes('@SuppressLint("WrongConstant")'),"native permission boundary must not suppress WrongConstant lint");
ok(hardener.includes('refusing blind rewrite'),"native hardening must fail closed when generated source shape drifts");

ok(generator.includes('MAX_CHUNK=262144'),"native IO must be chunk bounded for mobile memory safety");
ok(generator.includes('@PluginMethod public void readChunk'),"chunked SAF read method must exist");
ok(generator.includes('@PluginMethod public void writeChunk'),"chunked SAF write method must exist");
ok(generator.includes('bytesRead'),"read result must expose exact progress");
ok(generator.includes('bytesWritten'),"write result must expose exact progress");
ok(generator.includes('dataBase64'),"binary-safe bridge transport must be explicit");

ok(motionBridge.includes('SEVEN_ANDROID_REDUCED_MOTION_BRIDGE_V1'),"native reduced-motion bridge must have a stable marker");
ok(motionBridge.includes('Settings.Global.WINDOW_ANIMATION_SCALE'),"bridge must read the real Android window animation scale");
ok(motionBridge.includes('Settings.Global.TRANSITION_ANIMATION_SCALE'),"bridge must read the real Android transition animation scale");
ok(motionBridge.includes('Settings.Global.ANIMATOR_DURATION_SCALE'),"bridge must read the real Android animator duration scale");
ok(motionBridge.includes('window==0f&&transition==0f&&animator==0f'),"reduced motion must require genuine disabled Android animation scales");
ok(motionBridge.includes("source:'ANDROID_GLOBAL_ANIMATION_SCALES'"),"WebView state must retain provenance to Android system animation scales");
ok(motionBridge.includes('p.state.reducedMotion=nativeReduced||css'),"SevenPerformance must honor native reduction without discarding genuine CSS reduction");
ok(motionBridge.includes('p.applyTier(p.state.tier)'),"native motion synchronization must refresh canonical DOM performance state");
ok(motionBridge.includes('public void onResume()'),"Android system preference must be resynchronized on resume");
no(motionBridge.includes('nativeReduced=true'),"bridge must never hard-code reduced motion as enabled");
no(motionBridge.includes('matchMedia=function'),"bridge must not forge browser media-query APIs");

ok(visual.includes('assertZeroScale("window_animation_scale")'),"visual evidence must verify the real Android window animation scale is zero");
ok(visual.includes('assertZeroScale("transition_animation_scale")'),"visual evidence must verify the real Android transition animation scale is zero");
ok(visual.includes('assertZeroScale("animator_duration_scale")'),"visual evidence must verify the real Android animator duration scale is zero");
ok(visual.includes("__sevenAndroidMotion.source==='ANDROID_GLOBAL_ANIMATION_SCALES'"),"visual evidence must bind reduced-motion proof to native Android provenance");
ok(visual.includes("SevenMotion.allow('ambient')===false"),"visual evidence must prove motion is actually suppressed");
no(visual.includes("matchMedia('(prefers-reduced-motion: reduce)').matches&&window.SevenPerformance"),"release evidence must not require a WebView media-query behavior Android does not provide");

ok(patch.includes("Capacitor.Plugins.SevenPlatform"),"Android WebView instrumentation must exercise the native bridge");
ok(patch.includes("getCapabilities()"),"instrumentation must verify native capability handshake");
ok(patch.includes("secureSet({key:k,value:v})"),"instrumentation must execute secure-store set through the JavaScript bridge");
ok(patch.includes("secureGet({key:k})"),"instrumentation must execute secure-store read through the JavaScript bridge");
ok(patch.includes("secureRemove({key:k})"),"instrumentation must clean its secure-store test value");
ok(patch.includes("secureStoreEncryptsAtRest"),"instrumentation must verify ciphertext-at-rest behavior");
ok(patch.includes("assertFalse(\"secret must not be stored as plaintext\""),"plaintext leakage assertion must be present");

console.log(`Android Native Platform Bridge: PASS (${n} assertions; Keystore + SAF + Android system reduced motion + bridge instrumentation + lint-safe grants)`);
