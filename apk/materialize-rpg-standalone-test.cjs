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
   assertEquals("true",js(view,"document.title==='Seven RPG'"));
   assertEquals("true",js(view,"getComputedStyle(document.querySelector('[data-seven-shell-workspace=\\\"chat\\\"]')).display==='none'"));
  }
 }
}
`;
fs.writeFileSync(path.join(dir,'SevenRpgStandaloneTest.java'),java);
console.log('Seven RPG standalone Android instrumentation materialization: PASS');
