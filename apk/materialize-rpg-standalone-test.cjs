'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const app=JSON.parse(fs.readFileSync(path.join(root,'capacitor.config.json'),'utf8'));
if(app.appId!=='ai.seven.rpg')throw Error('Refusing to generate standalone RPG instrumentation for Seven AI');
const dir=path.join(root,'android','app','src','androidTest','java','ai','seven','rpg');
fs.mkdirSync(dir,{recursive:true});
const java=`package ai.seven.rpg;

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
public class SevenRpgStandaloneTest {
 private String js(WebView webView, String script) throws Exception {
  CountDownLatch done=new CountDownLatch(1);
  AtomicReference<String> value=new AtomicReference<>();
  webView.post(()->webView.evaluateJavascript(script,r->{value.set(r);done.countDown();}));
  assertTrue("RPG JavaScript timed out",done.await(15,TimeUnit.SECONDS));
  return value.get();
 }
 private void assertJsTrue(WebView view, String expression) throws Exception {
  String actual=js(view,expression);
  assertEquals("RPG WebView assertion failed: "+expression+"; actual="+actual+"; diagnostics="+js(view,"JSON.stringify({profile:document.documentElement.dataset.sevenStandaloneProfile,ready:document.documentElement.dataset.sevenStandaloneReady,error:document.documentElement.dataset.sevenStandaloneError,workspace:window.SevenWorkspaces?SevenWorkspaces.active():null,firstRun:!!document.querySelector('#seven-rpg-first-run'),panelHidden:document.querySelector('#seven-rpg-world-panel')?.hidden,world:window.SevenRpgWorkspace?.state?.worldEngine?.work?.title})"),"true",actual);
 }
 @Test public void launchesIntoRpgNotSevenAi() throws Exception {
  try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
   AtomicReference<WebView> reference=new AtomicReference<>();
   scenario.onActivity(a->reference.set(a.getBridge().getWebView()));
   WebView view=reference.get();assertNotNull(view);
   boolean ready=false;
   String probe="Boolean(document.documentElement.dataset.sevenStandaloneProfile==='rpg' && document.documentElement.dataset.sevenStandaloneReady==='1' && window.SevenWorkspaces && SevenWorkspaces.active()==='rpg' && window.SevenRpgWorkspace && document.querySelector('.seven-rpg-chatbar') && document.querySelector('#userInput'))";
   for(int i=0;i<160;i++){
    if("true".equals(js(view,probe))){ready=true;break;}
    Thread.sleep(250);
   }
   assertTrue("Dedicated RPG did not reach ready state. Actual: "+js(view,"JSON.stringify({profile:document.documentElement.dataset.sevenStandaloneProfile,ready:document.documentElement.dataset.sevenStandaloneReady,error:document.documentElement.dataset.sevenStandaloneError,workspace:window.SevenWorkspaces?SevenWorkspaces.active():null,bar:!!document.querySelector('.seven-rpg-chatbar')})"),ready);
   assertJsTrue(view,"document.title==='Seven RPG'");
   // Standalone features must remain accessible on the packaged Android UI.
   assertJsTrue(view,"Boolean(document.querySelector('#seven-rpg-world-button') && document.querySelector('#seven-rpg-model-control'))");
   assertJsTrue(view,"(()=>{document.querySelector('#seven-rpg-world-button').click();return !!document.querySelector('#seven-rpg-import-world') && document.querySelector('#seven-rpg-import-world').accept.includes('json') && !document.querySelector('#seven-rpg-world-panel').hidden})()");
   assertJsTrue(view,"Boolean(document.querySelector('#seven-rpg-world-button') && document.querySelector('#seven-rpg-model-control') && document.querySelector('#seven-rpg-world-panel'))");
   assertJsTrue(view,"(()=>{document.querySelector('#seven-rpg-world-button').click();if(!document.querySelector('#seven-rpg-world-panel').hidden)return false;document.querySelector('#seven-rpg-world-button').click();return document.querySelector('#seven-rpg-world-panel').hidden===false})()");
   assertJsTrue(view,"document.querySelector('#seven-rpg-export-world').disabled===true");
   // The standalone app must offer a no-import first-run flow, not just an RPG tab.
   assertJsTrue(view,"Boolean(document.querySelector('#seven-rpg-first-run') && document.querySelector('#seven-rpg-create-world'))");
   assertJsTrue(view,"(()=>{document.querySelector('#seven-rpg-world-name').value='Test World';document.querySelector('#seven-rpg-create-world').click();return true})()");
   boolean created=false;
   for(int i=0;i<50;i++) {
     if("true".equals(js(view,"Boolean(document.documentElement.dataset.sevenStandaloneWorldCreated==='1' && window.SevenRpgWorkspace.state.worldEngine && window.SevenRpgWorkspace.state.worldEngine.work.title==='Test World' && document.querySelector('#userInput') && document.querySelector('#userInput').value.includes('Never invent dialogue'))"))){created=true;break;}
     Thread.sleep(200);
   }
   assertTrue("World creation did not commit: "+js(view,"JSON.stringify({created:document.documentElement.dataset.sevenStandaloneWorldCreated,world:window.SevenRpgWorkspace?.state?.worldEngine?.work?.title,error:document.querySelector('#seven-rpg-first-run [role=status]')?.textContent,room:typeof currentRoom!=='undefined'?currentRoom:null,input:document.querySelector('#userInput')?.value?.slice(0,80)})"),created);
   assertJsTrue(view,"(()=>{document.querySelector('#seven-rpg-world-button').click();document.querySelector('#seven-rpg-world-button').click();return document.querySelector('#seven-rpg-export-world').disabled===false})()");
   // Activity recreation must rehydrate the same world, not show the first-run prompt.
   scenario.recreate();
   AtomicReference<WebView> recreated=new AtomicReference<>();
   scenario.onActivity(a->recreated.set(a.getBridge().getWebView()));
   WebView restored=recreated.get();assertNotNull(restored);
   boolean persisted=false;
   for(int i=0;i<160;i++){
     if("true".equals(js(restored,"Boolean(document.documentElement.dataset.sevenStandaloneReady==='1' && SevenRpgWorkspace.state.worldEngine && SevenRpgWorkspace.state.worldEngine.work.title==='Test World' && !document.querySelector('#seven-rpg-first-run'))"))){persisted=true;break;}
     Thread.sleep(250);
   }
   assertTrue("RPG first world was not restored after Activity recreation",persisted);
   assertJsTrue(restored,"getComputedStyle(document.querySelector('[data-seven-shell-workspace=\\\"chat\\\"]')).display==='none'");
  }
 }
}
`;
fs.writeFileSync(path.join(dir,'SevenRpgStandaloneTest.java'),java);
console.log('Seven RPG standalone Android instrumentation materialization: PASS');
