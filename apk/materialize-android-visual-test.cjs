const fs=require("fs"),path=require("path");
const ROOT=path.resolve(__dirname,".."),ANDROID=path.join(ROOT,"android"),testRoot=path.join(ANDROID,"app","src","androidTest"),testDir=path.join(testRoot,"java","ai","seven","app");
if(!fs.existsSync(ANDROID))throw Error("generated Android project missing");
fs.mkdirSync(testDir,{recursive:true});
const source=`package ai.seven.app;

import static org.junit.Assert.*;
import android.os.ParcelFileDescriptor;
import android.webkit.WebView;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class SevenVisualEvidenceTest {
  private static final String EVIDENCE_ROOT="/data/local/tmp/seven-visual";
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
  private String shell(String command) throws Exception {
    ParcelFileDescriptor pfd=InstrumentationRegistry.getInstrumentation().getUiAutomation().executeShellCommand(command);
    try(FileInputStream in=new FileInputStream(pfd.getFileDescriptor());ByteArrayOutputStream out=new ByteArrayOutputStream()){
      byte[] buffer=new byte[2048];
      for(int n;(n=in.read(buffer))!=-1;)out.write(buffer,0,n);
      return out.toString(StandardCharsets.UTF_8.name()).trim();
    } finally { pfd.close(); }
  }
  private void restoreScale(String key,String value) throws Exception {
    String safe=value!=null&&value.matches("[0-9]+(?:\\\\.[0-9]+)?")?value:"1";
    shell("settings put global "+key+" "+safe);
  }
  private void shot(String name) throws Exception {
    assertTrue("invalid evidence screenshot name",name!=null&&name.matches("[a-z0-9-]+"));
    String out=EVIDENCE_ROOT+"/"+name+".png";
    shell("screencap -p "+out);
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
      waitFor(webView,"document.documentElement.dir==='rtl'&&document.documentElement.lang==='ar-IQ'&&getComputedStyle(document.documentElement).direction==='rtl'");
      Thread.sleep(120);shot("arabic-rtl");

      js(webView,"(()=>{document.documentElement.lang='en';document.documentElement.dir='ltr';document.body.dir='ltr';SevenTheme.setPreference('night');return true})()");
      waitFor(webView,"document.documentElement.dir==='ltr'&&document.documentElement.dataset.sevenTheme==='night'");
      String oldWindow=shell("settings get global window_animation_scale");
      String oldTransition=shell("settings get global transition_animation_scale");
      String oldAnimator=shell("settings get global animator_duration_scale");
      try {
        shell("settings put global window_animation_scale 0");
        shell("settings put global transition_animation_scale 0");
        shell("settings put global animator_duration_scale 0");
        Thread.sleep(700);
        js(webView,"(()=>{if(window.SevenPerformance)SevenPerformance.reconsiderTier(null,{forceUpgrade:true});return true})()");
        waitFor(webView,"Boolean(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches&&window.SevenPerformance&&SevenPerformance.state.reducedMotion===true&&document.documentElement.dataset.sevenReducedMotion==='1')");
        Thread.sleep(120);shot("reduced-motion");
      } finally {
        restoreScale("window_animation_scale",oldWindow);
        restoreScale("transition_animation_scale",oldTransition);
        restoreScale("animator_duration_scale",oldAnimator);
      }
    }
  }
}
`;
fs.writeFileSync(path.join(testDir,"SevenVisualEvidenceTest.java"),source);
console.log("android visual instrumentation materialization: PASS");
