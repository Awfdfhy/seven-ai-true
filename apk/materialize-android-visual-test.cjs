const fs=require("fs"),path=require("path");
const ROOT=path.resolve(__dirname,".."),ANDROID=path.join(ROOT,"android"),CONFIG=JSON.parse(fs.readFileSync(path.join(ROOT,"capacitor.config.json"),"utf8")),APP_ID=String(CONFIG.appId||"").trim(),testRoot=path.join(ANDROID,"app","src","androidTest"),testDir=path.join(testRoot,"java",...APP_ID.split("."));
if(!fs.existsSync(ANDROID))throw Error("generated Android project missing");
fs.mkdirSync(testDir,{recursive:true});
const source=`package ${APP_ID};

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
  private void assertZeroScale(String key) throws Exception {
    String value=shell("settings get global "+key);
    assertEquals("Android animation scale must be genuinely disabled: "+key,0f,Float.parseFloat(value),0.0001f);
  }
  private void shot(String name) throws Exception {
    assertTrue("invalid evidence screenshot name",name!=null&&name.matches("[a-z0-9-]+"));
    String out=EVIDENCE_ROOT+"/"+name+".png";
    shell("screencap -p "+out);
  }
  private WebView webView(ActivityScenario<MainActivity> scenario) {
    AtomicReference<WebView> ref=new AtomicReference<>();
    scenario.onActivity(a -> ref.set(a.getBridge().getWebView()));
    WebView webView=ref.get();assertNotNull(webView);return webView;
  }
  private void theme(WebView webView,String value) throws Exception {
    js(webView,"(()=>{SevenTheme.setPreference('"+value+"');return true})()");
    waitFor(webView,"document.documentElement.dataset.sevenTheme==='"+value+"'");
    waitFor(webView,"(()=>{const app=document.getElementById('seven-app'),main=document.querySelector('.main'),composer=document.querySelector('.composer');if(!app||!main||!composer)return false;const rs=getComputedStyle(app),ms=getComputedStyle(main),cs=getComputedStyle(composer);if('"+value+"'==='night')return app.dataset.sevenTheme==='night'&&rs.getPropertyValue('--s-bg').trim()==='#111815'&&ms.backgroundColor==='rgb(17, 24, 21)'&&cs.backgroundColor==='rgb(17, 24, 21)';return app.dataset.sevenTheme==='day'&&rs.getPropertyValue('--s-bg').trim()==='#f5f7f5'})()");
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
    String oldWindow=shell("settings get global window_animation_scale");
    String oldTransition=shell("settings get global transition_animation_scale");
    String oldAnimator=shell("settings get global animator_duration_scale");
    try {
      try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
        WebView webView=webView(scenario);
        waitFor(webView,"Boolean(window.SevenPerformance&&SevenPerformance.state.ready&&window.SevenTheme&&window.SevenRemake&&window.SevenShell&&document.getElementById('userInput'))");

        theme(webView,"day");
        assertEquals("true",js(webView,"getComputedStyle(document.getElementById('seven-app')).getPropertyValue('--s-bg').trim()==='#f5f7f5'"));
        shot("chat-day");
        theme(webView,"night");
        assertEquals("true",js(webView,"(()=>{const root=document.getElementById('seven-app'),main=document.querySelector('.main'),composer=document.querySelector('.composer');const rs=getComputedStyle(root),ms=getComputedStyle(main),cs=getComputedStyle(composer);return rs.getPropertyValue('--s-bg').trim()==='#111815'&&ms.backgroundColor==='rgb(17, 24, 21)'&&cs.backgroundColor==='rgb(17, 24, 21)'&&rs.color!=='rgb(0, 0, 0)'})()"));
        shot("chat-night");

        js(webView,"(()=>{const b=document.querySelector('.seven-shell-model-chip');if(b)b.click();return true})()");
        waitFor(webView,"Boolean(document.querySelector('.seven-shell-model-menu')&&!document.querySelector('.seven-shell-model-menu').hidden)");
        shot("model-menu-night");
        js(webView,"(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return true})()");Thread.sleep(80);

        js(webView,"(()=>{SevenRemake.modeDialog();return true})()");waitFor(webView,"Boolean(document.querySelector('#seven-app > .s-modal .s-dialog'))");shot("mode-dialog-night");js(webView,"(()=>{SevenRemake.closeDialog();return true})()");Thread.sleep(80);
        js(webView,"(()=>{SevenRemake.depthDialog();return true})()");waitFor(webView,"Boolean(document.querySelector('#seven-app > .s-modal .s-dialog'))");shot("depth-dialog-night");js(webView,"(()=>{SevenRemake.closeDialog();return true})()");Thread.sleep(80);
        js(webView,"(()=>{SevenRemake.searchSettings();return true})()");waitFor(webView,"Boolean(document.querySelector('#seven-app > .s-modal .s-dialog'))");shot("search-dialog-night");js(webView,"(()=>{SevenRemake.closeDialog();return true})()");Thread.sleep(80);

        js(webView,"(()=>{window.__sevenAttachVisual='loading';SevenAttachmentLoader.load().then(()=>{document.querySelector('[data-seven-attach-trigger]')?.click();window.__sevenAttachVisual='ok'}).catch(()=>window.__sevenAttachVisual='error');return true})()");
        waitFor(webView,"window.__sevenAttachVisual==='ok'&&Boolean(document.querySelector('.seven-attach-menu')&&!document.querySelector('.seven-attach-menu').hidden)");
        shot("attachments-night");
        js(webView,"(()=>{document.querySelector('[data-seven-attach-trigger]')?.click();return true})()");Thread.sleep(80);

        js(webView,"(()=>{window.__sevenGhVisual='loading';if(window.SevenGitHubSelfDev){SevenGitHubSelfDev.openPanel();window.__sevenGhVisual='ok';return true}const s=document.createElement('script');s.src='./github-self-dev.js';s.onload=()=>{if(window.SevenGitHubSelfDev){SevenGitHubSelfDev.openPanel();window.__sevenGhVisual='ok'}else window.__sevenGhVisual='bad'};s.onerror=()=>window.__sevenGhVisual='error';document.head.appendChild(s);return true})()");
        waitFor(webView,"window.__sevenGhVisual==='ok'&&Boolean(document.querySelector('#seven-github-selfdev .seven-gh-panel'))");
        shot("github-selfdev-night");
        js(webView,"(()=>{document.querySelector('#seven-github-selfdev .seven-gh-close')?.click();return true})()");Thread.sleep(80);

        assertEquals("true",js(webView,"(()=>{openSettings();const panel=id=>document.getElementById(id)?.closest('[role=tabpanel]')?.id||'';return panel('temperatureRange')==='s-settings-generation'&&panel('reasoningEffort')==='s-settings-generation'&&panel('pinnedNotes')==='s-settings-context'&&panel('providersSection')==='s-settings-models'&&panel('advancedSection')==='s-settings-data'&&panel('s-theme')==='s-settings-data'})()"));
        assertEquals("true",js(webView,"(()=>{const m=document.querySelector('#settingsModal .modal-content'),r=m.getBoundingClientRect();return m.scrollWidth<=m.clientWidth+1&&r.left>=-2&&r.right<=innerWidth+2&&r.top>=-2&&r.bottom<=innerHeight+2})()"));
        shot("settings-models-night");
        js(webView,"(()=>{document.getElementById('s-tab-generation').click();return true})()");Thread.sleep(80);shot("settings-intelligence-night");
        js(webView,"(()=>{document.getElementById('s-tab-context').click();return true})()");Thread.sleep(80);shot("settings-context-night");
        js(webView,"(()=>{document.getElementById('s-tab-data').click();return true})()");Thread.sleep(80);shot("settings-app-night");
        js(webView,"(()=>{closeSettings();return true})()");Thread.sleep(80);

        ensureWorkspaces(webView);
        js(webView,"(()=>{SevenWorkspaces.openLauncher();return true})()");
        waitFor(webView,"Boolean(document.querySelector('.seven-ws-launcher .seven-ws-picker'))");
        shot("workspace-picker-night");
        js(webView,"(()=>{document.querySelector('.seven-ws-close')?.click();return true})()");Thread.sleep(80);
        workspace(webView,"coding");shot("coding");
        workspace(webView,"research");shot("research");
        workspace(webView,"rpg");shot("rpg");

        js(webView,"(()=>{SevenWorkspaces.close();document.documentElement.lang='ar-IQ';document.documentElement.dir='rtl';document.body.dir='rtl';const s=document.querySelector('.sidebar');s.classList.remove('open','active');document.body.classList.remove('sidebar-open');document.documentElement.dataset.sevenShellSidebar='closed';return true})()");
        waitFor(webView,"document.documentElement.dir==='rtl'&&document.documentElement.lang==='ar-IQ'&&getComputedStyle(document.documentElement).direction==='rtl'");
        Thread.sleep(380);
        assertEquals("true",js(webView,"(()=>{const r=document.querySelector('.sidebar').getBoundingClientRect();return r.left>=innerWidth-2})()"));
        js(webView,"(()=>{window.SevenShell?.sync?.();document.querySelector('.sidebar').classList.add('open');return true})()");
        Thread.sleep(380);
        assertEquals("true",js(webView,"(()=>{const r=document.querySelector('.sidebar').getBoundingClientRect(),b=document.querySelector('.seven-shell-backdrop');return r.left>=-2&&r.right<=innerWidth+2&&b&&!b.hidden&&b.parentElement?.id==='seven-app'})()"));
        shot("sidebar-rtl-night");
        js(webView,"(()=>{document.querySelector('.sidebar').classList.remove('open');return true})()");
        Thread.sleep(380);
        js(webView,"(()=>{const chat=document.getElementById('chat');for(let i=0;i<18;i++)addMessage('assistant','رسالة اختبار طويلة رقم '+(i+1)+' — '+('نص '.repeat(24)));chat.scrollTop=0;window.SevenShell?.sync?.();return true})()");
        waitFor(webView,"(()=>{const b=document.querySelector('.seven-shell-jump');return !!b&&b.classList.contains('show')&&b.getAttribute('aria-label')==='الانتقال إلى أحدث رسالة'&&b.parentElement?.id==='seven-app'})()");
        shot("long-chat-jump-rtl-night");
        js(webView,"(()=>{const chat=document.getElementById('chat');chat.scrollTop=chat.scrollHeight;return true})()");Thread.sleep(100);
        Thread.sleep(120);shot("arabic-rtl");
      }

      shell("settings put global window_animation_scale 0");
      shell("settings put global transition_animation_scale 0");
      shell("settings put global animator_duration_scale 0");
      assertZeroScale("window_animation_scale");
      assertZeroScale("transition_animation_scale");
      assertZeroScale("animator_duration_scale");
      Thread.sleep(250);

      // Android WebView does not consistently expose Android's Remove animations
      // state through CSS prefers-reduced-motion. The production MainActivity bridge
      // reads the genuine Android animation scales and mirrors that system state into
      // SevenPerformance. Relaunch proves the release app consumes that native state.
      try(ActivityScenario<MainActivity> reducedScenario=ActivityScenario.launch(MainActivity.class)){
        WebView reducedWebView=webView(reducedScenario);
        waitFor(reducedWebView,"Boolean(window.SevenPerformance&&SevenPerformance.state.ready&&window.SevenTheme&&window.SevenMotion&&SevenMotion.state.ready&&document.getElementById('userInput'))");
        js(reducedWebView,"(()=>{document.documentElement.lang='en';document.documentElement.dir='ltr';document.body.dir='ltr';SevenTheme.setPreference('night');return true})()");
        waitFor(reducedWebView,"document.documentElement.dir==='ltr'&&document.documentElement.dataset.sevenTheme==='night'");
        waitFor(reducedWebView,"Boolean(window.__sevenAndroidMotion&&__sevenAndroidMotion.source==='ANDROID_GLOBAL_ANIMATION_SCALES'&&__sevenAndroidMotion.reducedMotion===true&&window.SevenPerformance&&SevenPerformance.state.reducedMotion===true&&document.documentElement.dataset.sevenReducedMotion==='1'&&window.SevenMotion&&SevenMotion.allow('ambient')===false)");
        Thread.sleep(120);shot("reduced-motion");
      }
    } finally {
      restoreScale("window_animation_scale",oldWindow);
      restoreScale("transition_animation_scale",oldTransition);
      restoreScale("animator_duration_scale",oldAnimator);
    }
  }

  @Test
  public void recoverRoomWalAfterActivityRecreation() throws Exception {
    final String marker="Android WAL recovery";
    try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
      WebView webView=webView(scenario);
      waitFor(webView,"Boolean(typeof roomPersistence!=='undefined'&&roomPersistence.status().ready&&typeof rooms!=='undefined'&&typeof roomTitles!=='undefined')");
      assertEquals("true",js(webView,"(()=>{window.__sevenVisualWal='pending';(async()=>{let id=currentRoom;if(!id||!own(rooms,id)){id='android-visual-wal-room';rooms[id]=createEmptyRoom();roomTitles[id]='Android WAL';currentRoom=id;const ok=await saveRooms();if(!ok){window.__sevenVisualWal='save-failed';return}}const base=roomPersistence.status().revision,value=JSON.parse(JSON.stringify({version:1,rooms,roomTitles,currentRoom}));value.roomTitles[value.currentRoom]='Android WAL recovery';localStorage.setItem('seven_ai_room_wal_v1',JSON.stringify({schemaVersion:1,seq:Date.now()*1000+4242,sessionId:'android-activity-recreate-fixture',baseRevision:base,value}));window.__sevenVisualWal=localStorage.getItem('seven_ai_room_wal_v1')!==null?'ok':'stage-failed'})().catch(()=>window.__sevenVisualWal='error');return true})()"));
      waitFor(webView,"window.__sevenVisualWal==='ok'");
    }
    try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
      WebView webView=webView(scenario);
      waitFor(webView,"Boolean(typeof roomPersistence!=='undefined'&&roomPersistence.status().ready)");
      assertEquals("true",js(webView,"(()=>roomTitles[currentRoom]==='Android WAL recovery'&&localStorage.getItem('seven_ai_room_wal_v1')===null)()"));
    }
  }
}
`;
fs.writeFileSync(path.join(testDir,"SevenVisualEvidenceTest.java"),source);
console.log("android visual instrumentation materialization: PASS");
