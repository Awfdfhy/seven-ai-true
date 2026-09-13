const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const ANDROID=path.join(ROOT,'android');
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

const testDir=path.join(ANDROID,'app','src','androidTest','java','ai','seven','app');
fs.mkdirSync(testDir,{recursive:true});
const test=`package ai.seven.app;

import static org.junit.Assert.*;
import android.webkit.WebView;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
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
      waitFor(webView,"Boolean(window.SevenPerformance&&SevenPerformance.state.ready&&window.SevenCanon&&window.SevenMotion&&SevenMotion.state.ready&&window.SevenPdf)");
      waitFor(webView,"Boolean(typeof roomPersistence!=='undefined'&&roomPersistence.status().ready)");
      assertEquals("true",js(webView,"location.origin==='https://localhost'"));
      assertEquals("true",js(webView,"Boolean(document.getElementById('userInput'))"));
      assertEquals("true",js(webView,"document.documentElement.scrollWidth<=document.documentElement.clientWidth+2"));
      assertEquals("true",js(webView,"SevenPdf.loaded===false"));
      assertEquals("true",js(webView,"(()=>{const e=document.getElementById('userInput');e.focus();return document.activeElement===e})()"));
    }
  }
}
`;
fs.writeFileSync(path.join(testDir,'SevenSmokeTest.java'),test);
console.log('android shell hardening: PASS');
