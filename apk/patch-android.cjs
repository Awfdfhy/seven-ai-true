const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const ANDROID=path.join(ROOT,'android');
const CONFIG=JSON.parse(fs.readFileSync(path.join(ROOT,'capacitor.config.json'),'utf8'));
const PACKAGE=JSON.parse(fs.readFileSync(path.join(ROOT,'package.json'),'utf8'));
const APP_ID=String(CONFIG.appId||'').trim();
const VERSION_NAME=String(PACKAGE.version||'').trim();
const VERSION_CODE=Number(PACKAGE.sevenAndroidVersionCode);
if(!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(VERSION_NAME))throw new Error('invalid package.json version');
if(!Number.isInteger(VERSION_CODE)||VERSION_CODE<1)throw new Error('invalid package.json sevenAndroidVersionCode');
if(!/^[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)+$/.test(APP_ID))throw new Error('invalid Capacitor appId');
const PACKAGE_PATH=APP_ID.split('.');
const manifestPath=path.join(ANDROID,'app','src','main','AndroidManifest.xml');
if(!fs.existsSync(manifestPath))throw new Error('generated Android manifest missing');
let xml=fs.readFileSync(manifestPath,'utf8');
if(!xml.includes('android.permission.INTERNET'))throw new Error('Android INTERNET permission missing');
xml=xml.replace(/<application\b([^>]*)>/,(_,attrs)=>{
  let a=attrs.replace(/\sandroid:allowBackup="[^"]*"/g,'').replace(/\sandroid:usesCleartextTraffic="[^"]*"/g,'');
  return `<application${a} android:allowBackup="false" android:usesCleartextTraffic="false">`;
});
xml=xml.replace(/<activity\b([^>]*android:name="\.MainActivity"[^>]*)>/,(_,attrs)=>{
  let a=attrs;
  if(!/android:windowSoftInputMode=/.test(a))a+=' android:windowSoftInputMode="adjustResize"';
  if(/android:configChanges="([^"]*)"/.test(a)&&!/android:configChanges="[^"]*density/.test(a)){
    a=a.replace(/android:configChanges="([^"]*)"/,(_,v)=>`android:configChanges="${v}|density"`);
  }
  return `<activity${a}>`;
});
fs.writeFileSync(manifestPath,xml);

// The generated project is ephemeral. For CI release-device evidence only, make
// the application debug/release variants and AndroidTest APK use one explicit
// deterministic signing identity. Android instrumentation will correctly reject
// a test APK whose certificate differs from the installed release target.
// No credential is embedded here: CI provides the keystore and test-only values
// as Gradle properties, and normal local generation retains Capacitor defaults.
const gradlePath=path.join(ANDROID,'app','build.gradle');
if(!fs.existsSync(gradlePath))throw new Error('generated Android app Gradle file missing');
let gradle=fs.readFileSync(gradlePath,'utf8');
if(!gradle.includes('android {'))throw new Error('generated Android app Gradle android block missing');
if(!/buildTypes\s*\{\s*release\s*\{/.test(gradle))throw new Error('generated Android app Gradle release buildType missing');
if(!/versionCode\s+\d+/.test(gradle)||!/versionName\s+["'][^"']+["']/.test(gradle))throw new Error('generated Android version anchors missing');
gradle=gradle.replace(/versionCode\s+\d+/,`versionCode ${VERSION_CODE}`).replace(/versionName\s+["'][^"']+["']/,`versionName "${VERSION_NAME}"`);
const signingPrelude=`def sevenCiKeystore = project.findProperty("sevenCiKeystore")\ndef sevenCiStorePass = project.findProperty("sevenCiStorePass")\ndef sevenCiKeyAlias = project.findProperty("sevenCiKeyAlias")\ndef sevenCiKeyPass = project.findProperty("sevenCiKeyPass")\n`;
if(!gradle.includes('def sevenCiKeystore'))gradle=signingPrelude+gradle;
gradle=gradle.replace('android {',`android {\n    if (sevenCiKeystore) {\n        testBuildType = "release"\n    }\n    signingConfigs {\n        if (sevenCiKeystore) {\n            sevenCi {\n                storeFile file(sevenCiKeystore)\n                storePassword sevenCiStorePass\n                keyAlias sevenCiKeyAlias\n                keyPassword sevenCiKeyPass\n            }\n        }\n    }`);
gradle=gradle.replace(/buildTypes\s*\{\s*release\s*\{/,`buildTypes {\n        debug {\n            if (sevenCiKeystore) {\n                signingConfig signingConfigs.sevenCi\n            }\n        }\n        release {\n            if (sevenCiKeystore) {\n                signingConfig signingConfigs.sevenCi\n            }`);
fs.writeFileSync(gradlePath,gradle);

// Capacitor generates a sample instrumentation test bound to its template
// package. It is not a Seven test and must not ship or gate our Android run.
const templateTest=path.join(ANDROID,'app','src','androidTest','java','com','getcapacitor','myapp','ExampleInstrumentedTest.java');
if(fs.existsSync(templateTest))fs.rmSync(templateTest,{force:true});

const testDir=path.join(ANDROID,'app','src','androidTest','java',...PACKAGE_PATH);
fs.mkdirSync(testDir,{recursive:true});
const test=`package ${APP_ID};

import static org.junit.Assert.*;
import android.content.Context;
import android.webkit.WebView;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class SevenSmokeTest {
  private String js(WebView webView,String code) throws Exception {
    CountDownLatch latch=new CountDownLatch(1);
    AtomicReference<String> value=new AtomicReference<>();
    webView.post(() -> webView.evaluateJavascript(code,v -> { value.set(v); latch.countDown(); }));
    assertTrue("JavaScript evaluation timed out",latch.await(10,TimeUnit.SECONDS));
    return value.get();
  }

  private void waitFor(WebView webView,String code) throws Exception {
    for(int i=0;i<80;i++){
      if("true".equals(js(webView,code)))return;
      Thread.sleep(250);
    }
    fail("Seven runtime did not become ready: "+code);
  }

  @Test
  public void verifiedReleaseBootsInsideAndroidWebView() throws Exception {
    try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
      AtomicReference<WebView> ref=new AtomicReference<>();
      scenario.onActivity(a -> ref.set(a.getBridge().getWebView()));
      WebView webView=ref.get();
      assertNotNull(webView);
      waitFor(webView,"Boolean(window.SevenPerformance&&SevenPerformance.state.ready&&window.SevenMotion&&SevenMotion.state.ready&&window.SevenPdf&&window.SevenBetaUI&&SevenBetaUI.state.ready&&window.SevenRemake&&window.SevenIntelligence)");
      waitFor(webView,"Boolean(typeof roomPersistence!=='undefined'&&roomPersistence.status().ready)");
      assertEquals("true",js(webView,"location.origin==='https://localhost'"));
      assertEquals("true",js(webView,"Boolean(document.getElementById('userInput'))"));
      assertEquals("true",js(webView,"Boolean(window.SevenRemake&&window.SevenIntelligence&&document.getElementById('seven-app'))"));
      assertEquals("true",js(webView,"isFreeProviderConfigured('kilo')&&isFreeProviderConfigured('llm7')&&hasAnyConfiguredFreeProvider()"));
      assertEquals("true",js(webView,"(()=>{openSettings();const s=document.getElementById('providersSection');s.open=true;return [...s.querySelectorAll('input,textarea,select')].every(el=>{const cs=getComputedStyle(el),r=el.getBoundingClientRect();return el.hidden||cs.display==='none'||cs.visibility==='hidden'||r.width===0||r.height===0})})()"));
      assertEquals("true",js(webView,"Boolean(document.querySelector('#seven-app[data-seven-remake=\\\"1\\"]'))"));
      assertEquals("true",js(webView,"document.documentElement.scrollWidth<=document.documentElement.clientWidth+2"));
      assertEquals("true",js(webView,"SevenPdf.loaded===false"));
      assertEquals("true",js(webView,"typeof window.SevenCanon==='undefined'&&typeof window.SevenWorld==='undefined'"));
      assertEquals("true",js(webView,"Boolean(window.SevenAttachmentLoader)&&typeof window.SevenAttachments==='undefined'"));
      assertEquals("true",js(webView,"(()=>{const e=document.getElementById('userInput');e.focus();return document.activeElement===e})()"));
      assertEquals("true",js(webView,"(()=>{window.__sevenDoubleSend='pending';freeProviderPrefs={groq:false,nvidia:false,openrouter:false,gemini:false,kilo:false,llm7:false,aion:false,mistral:false,zai:false,cloudflare:false};const input=document.getElementById('userInput');input.value='ci-double-send';Promise.all([sendMessage(),sendMessage()]).then(()=>{const room=rooms[currentRoom];const count=room?room.history.filter(m=>m&&m.role==='user'&&m.content==='ci-double-send').length:0;window.__sevenDoubleSend=count===1?'ok':'bad'}).catch(()=>window.__sevenDoubleSend='error');return true})()"));
      waitFor(webView,"window.__sevenDoubleSend==='ok'");
      assertEquals("true",js(webView,"Boolean(window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.SevenPlatform)"));
      assertEquals("true",js(webView,"(()=>{window.__sevenNativeCaps='pending';const p=Capacitor.Plugins.SevenPlatform;p.getCapabilities().then(x=>window.__sevenNativeCaps=(x.secureStore&&x.androidKeystore&&x.saf&&x.chunkedIO&&!x.broadStoragePermission)?'ok':'bad').catch(()=>window.__sevenNativeCaps='error');return true})()"));
      waitFor(webView,"window.__sevenNativeCaps==='ok'");
      assertEquals("true",js(webView,"(()=>{window.__sevenSecure='pending';(async()=>{const p=Capacitor.Plugins.SevenPlatform,k='ci.webview.roundtrip',v='seven-'+Date.now();await p.secureSet({key:k,value:v});const r=await p.secureGet({key:k});await p.secureRemove({key:k});window.__sevenSecure=(r.found&&r.value===v)?'ok':'bad'})().catch(()=>window.__sevenSecure='error');return true})()"));
      waitFor(webView,"window.__sevenSecure==='ok'");
    }
  }

  @Test
  public void secureStoreEncryptsAtRest() throws Exception {
    Context context=InstrumentationRegistry.getInstrumentation().getTargetContext();
    assertEquals("${APP_ID}",context.getPackageName());
    SevenSecureStore store=new SevenSecureStore(context);
    String key="ci.native."+System.nanoTime(),secret="seven-secret-"+System.nanoTime();
    try{
      store.put(key,secret);
      assertEquals(secret,store.get(key));
      String raw=context.getSharedPreferences(SevenSecureStore.PREFS_NAME,Context.MODE_PRIVATE).getString(key,"");
      assertNotNull(raw);
      assertFalse("secret must not be stored as plaintext",raw.contains(secret));
      assertTrue("encrypted payload must contain IV and ciphertext",raw.contains("."));
    } finally { store.remove(key); }
  }
}
`;
fs.writeFileSync(path.join(testDir,'SevenSmokeTest.java'),test);
console.log('android shell hardening: PASS');
