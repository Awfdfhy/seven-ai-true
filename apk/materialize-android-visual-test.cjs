const fs=require("fs"),path=require("path");
const ROOT=path.resolve(__dirname,".."),ANDROID=path.join(ROOT,"android"),testDir=path.join(ANDROID,"app","src","androidTest","java","ai","seven","app");
if(!fs.existsSync(ANDROID))throw Error("generated Android project missing");
fs.mkdirSync(testDir,{recursive:true});
const source=`package ai.seven.app;

import static org.junit.Assert.*;
import android.content.Context;
import android.graphics.Bitmap;
import android.webkit.WebView;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import java.io.File;
import java.io.FileOutputStream;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class SevenVisualEvidenceTest {
  private String js(WebView webView,String code) throws Exception {
    CountDownLatch latch=new CountDownLatch(1);
    AtomicReference<String> value=new AtomicReference<>();
    webView.post(() -> webView.evaluateJavascript(code,v -> { value.set(v); latch.countDown(); }));
    assertTrue("JavaScript evaluation timed out",latch.await(12,TimeUnit.SECONDS));
    return value.get();
  }
  private void waitFor(WebView webView,String code) throws Exception {
    for(int i=0;i<100;i++){ if("true".equals(js(webView,code)))return; Thread.sleep(200); }
    fail("Seven visual state did not become ready: "+code);
  }
  private void shot(String name) throws Exception {
    Bitmap bitmap=InstrumentationRegistry.getInstrumentation().getUiAutomation().takeScreenshot();
    assertNotNull("device screenshot unavailable",bitmap);
    Context testContext=InstrumentationRegistry.getInstrumentation().getContext();
    File root=new File(testContext.getExternalFilesDir(null),"seven-visual");
    assertTrue(root.exists()||root.mkdirs());
    File out=new File(root,name+".png");
    try(FileOutputStream stream=new FileOutputStream(out)){ assertTrue(bitmap.compress(Bitmap.CompressFormat.PNG,100,stream)); }
    assertTrue(out.isFile()&&out.length()>128);
    bitmap.recycle();
  }
  private void theme(WebView webView,String value) throws Exception {
    js(webView,"(()=>{SevenTheme.setPreference('"+value+"');return true})()");
    waitFor(webView,"document.documentElement.dataset.sevenTheme==='"+value+"'");
    Thread.sleep(120);
  }
  private void ensureWorkspaces(WebView webView) throws Exception {
    js(webView,"(()=>{if(window.SevenWorkspaces){window.__sevenWsReady='ok';return true}window.__sevenWsReady='loading';let s=document.createElement('script');s.src='./workspaces/hub.js';s.onload=()=>window.__sevenWsReady=window.SevenWorkspaces?'ok':'bad';s.onerror=()=>window.__sevenWsReady='error';document.head.appendChild(s);return true})()");
    waitFor(webView,"window.__sevenWsReady==='ok'");
  }
  private void workspace(WebView webView,String kind) throws Exception {
    js(webView,"(()=>{window.__sevenWsOpen='loading';SevenWorkspaces.open('"+kind+"').then(()=>window.__sevenWsOpen='"+kind+"').catch(()=>window.__sevenWsOpen='error');return true})()");
    waitFor(webView,"window.__sevenWsOpen==='"+kind+"'&&document.documentElement.dataset.sevenWorkspace==='"+kind+"'");
    Thread.sleep(180);
  }
  @Test
  public void captureReleaseVisualStates() throws Exception {
    Context testContext=InstrumentationRegistry.getInstrumentation().getContext();
    File root=new File(testContext.getExternalFilesDir(null),"seven-visual");
    if(root.exists()){File[] files=root.listFiles();if(files!=null)for(File f:files)f.delete();}else assertTrue(root.mkdirs());
    try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
      AtomicReference<WebView> ref=new AtomicReference<>();
      scenario.onActivity(a -> ref.set(a.getBridge().getWebView()));
      WebView webView=ref.get();assertNotNull(webView);
      waitFor(webView,"Boolean(window.SevenPerformance&&SevenPerformance.state.ready&&window.SevenTheme&&document.getElementById('userInput'))");

      theme(webView,"day");shot("chat-day");
      theme(webView,"night");shot("chat-night");

      ensureWorkspaces(webView);
      workspace(webView,"coding");shot("coding");
      workspace(webView,"research");shot("research");
      workspace(webView,"rpg");shot("rpg");

      js(webView,"(()=>{SevenWorkspaces.close();document.documentElement.lang='ar-IQ';document.documentElement.dir='rtl';document.body.dir='rtl';return true})()");
      waitFor(webView,"document.documentElement.dir==='rtl'&&document.documentElement.lang==='ar-IQ'");
      Thread.sleep(120);shot("arabic-rtl");

      js(webView,"(()=>{document.documentElement.lang='en';document.documentElement.dir='ltr';document.body.dir='ltr';if(window.SevenPerformance)SevenPerformance.state.reducedMotion=true;document.documentElement.dataset.sevenReducedMotion='1';return true})()");
      waitFor(webView,"Boolean(window.SevenPerformance&&SevenPerformance.state.reducedMotion===true&&document.documentElement.dataset.sevenReducedMotion==='1')");
      Thread.sleep(120);shot("reduced-motion");
    }
  }
}
`;
fs.writeFileSync(path.join(testDir,"SevenVisualEvidenceTest.java"),source);
console.log("android visual instrumentation materialization: PASS");
