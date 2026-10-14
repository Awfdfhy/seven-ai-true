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
import androidx.test.platform.app.InstrumentationRegistry;
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
   assertJsTrue(view,"Boolean(document.querySelector('#rpg-scene-vista') && document.querySelector('#rpg-vista-world-title') && document.querySelector('#rpg-art-cycle'))");
   assertJsTrue(view,"(()=>{const stage=document.querySelector('#rpg-scene-vista'),main=document.querySelector('#seven-rpg-main');return !!stage&&stage.getBoundingClientRect().width>100&&stage.getBoundingClientRect().right<=main.getBoundingClientRect().right+3})()");

   assertJsTrue(view,"Boolean(document.querySelector('#rpg-library-search') && document.querySelector('#rpg-model-search') && document.querySelector('#rpg-refresh-models') && document.documentElement.dataset.rpgSmartControls==='ready')");
   assertJsTrue(view,"Boolean(document.querySelector('#rpg-tab-connections') && document.querySelector('#rpg-provider-key-status') && window.SevenRpgProviderKeys && window.__SEVEN_RPG_NATIVE_KEYS)");
   assertJsTrue(view,"(()=>{document.querySelector('#rpg-settings-toggle').click();document.querySelector('#rpg-tab-connections').click();const section=document.querySelector('#rpg-connections-panel');const visible=!!section&&!section.hidden;document.querySelector('#rpg-tab-narrator').click();closeSettings();return visible&&document.querySelector('#rpg-connections-panel').hidden})()");
   assertJsTrue(view,"(()=>{document.querySelector('#rpg-library-toggle').click();const drawer=document.querySelector('#sidebar');const search=document.querySelector('#rpg-library-search');if(drawer.hidden||!search)return false;search.value='no-exact-such-world';search.dispatchEvent(new Event('input',{bubbles:true}));const worked=!!document.querySelector('#rpg-library-count');document.querySelector('#rpg-library-close').click();return worked&&drawer.hidden})()");
   assertJsTrue(view,"(()=>{document.querySelector('#rpg-library-toggle').click();const drawer=document.querySelector('#sidebar'),item=document.querySelector('#roomList .room-item'),list=document.querySelector('#roomList');const ok=!!list&&list.scrollWidth<=list.clientWidth+2&&(!item||item.getBoundingClientRect().right<=list.getBoundingClientRect().right+2);document.querySelector('#rpg-library-close').click();return ok})()");
   assertJsTrue(view,"(()=>{document.querySelector('#rpg-settings-toggle').click();return document.querySelector('#settingsModal').style.display==='flex'&&document.querySelector('#modelSelect').options.length>0})()");
   assertJsTrue(view,"(()=>{closeSettings();return document.getElementById('settingsModal').style.display==='none'})()");
   assertJsTrue(view,"(()=>{document.querySelector('#seven-rpg-world-button').click();return !!document.querySelector('#seven-rpg-import-world') && document.querySelector('#seven-rpg-import-world').accept.includes('json') && !document.querySelector('#seven-rpg-world-panel').hidden})()");
   assertJsTrue(view,"Boolean(document.querySelector('#seven-rpg-world-button') && document.querySelector('#seven-rpg-model-control') && document.querySelector('#seven-rpg-world-panel'))");
   assertJsTrue(view,"(()=>{document.querySelector('#seven-rpg-world-button').click();if(!document.querySelector('#seven-rpg-world-panel').hidden)return false;document.querySelector('#seven-rpg-world-button').click();return document.querySelector('#seven-rpg-world-panel').hidden===false})()");
   assertJsTrue(view,"document.querySelector('#seven-rpg-export-world').disabled===true");
   // The standalone app must offer a no-import first-run flow, not just an RPG tab.
   assertJsTrue(view,"Boolean(document.querySelector('#seven-rpg-first-run') && document.querySelector('#seven-rpg-create-world'))");
   assertJsTrue(view,"(()=>{document.querySelector('#seven-rpg-world-name').value='Test World';document.querySelector('#seven-rpg-create-world').click();return true})()");
   boolean created=false;
   for(int i=0;i<50;i++) {
     if("true".equals(js(view,"Boolean(document.documentElement.dataset.sevenStandaloneWorldCreated==='1' && window.SevenRpgWorkspace.state.worldEngine && window.SevenRpgWorkspace.state.worldEngine.work.title==='Test World' && document.querySelector('#userInput') && document.querySelector('#userInput').value.includes('opening scene'))"))){created=true;break;}
     Thread.sleep(200);
   }
   assertTrue("World creation did not commit: "+js(view,"JSON.stringify({created:document.documentElement.dataset.sevenStandaloneWorldCreated,world:window.SevenRpgWorkspace?.state?.worldEngine?.work?.title,error:document.querySelector('#seven-rpg-first-run [role=status]')?.textContent,room:typeof currentRoom!=='undefined'?currentRoom:null,input:document.querySelector('#userInput')?.value?.slice(0,80)})"),created);
   assertJsTrue(view,"(()=>{document.querySelector('#seven-rpg-world-button').click();document.querySelector('#seven-rpg-world-button').click();return document.querySelector('#seven-rpg-export-world').disabled===false})()");
   assertJsTrue(view,"(()=>{document.querySelector('#rpg-library-toggle').click();const list=document.querySelector('#roomList');const fixture=document.createElement('div');fixture.className='room-item';const span=document.createElement('span');span.textContent='A very long story-world name that must be truncated rather than overflow the adventure list on a mobile screen';const del=document.createElement('button');del.textContent='×';fixture.append(span,del);list.appendChild(fixture);const rect=list.getBoundingClientRect();const ok=rect.width>0&&fixture.getBoundingClientRect().right<=rect.right+2&&span.getBoundingClientRect().right<=del.getBoundingClientRect().left+2;fixture.remove();document.querySelector('#rpg-library-close').click();return ok})()");
   // Exercise the real file-input path instead of checking only that an importer exists.
   assertJsTrue(view,"(()=>{window.__rpgBackupTest='pending';const api=SevenRpgWorkspace;const snapshot=api.snapshot();const originalTitle=snapshot.work.title;api.loadWork({...snapshot.work,title:'Temporary Import Target'});const picker=document.querySelector('#seven-rpg-import-world');const file=new File([JSON.stringify({format:'seven-rpg-world-backup',version:1,data:snapshot})],'world.json',{type:'application/json'});const transfer=new DataTransfer();transfer.items.add(file);Object.defineProperty(picker,'files',{configurable:true,value:transfer.files});window.__rpgBackupOldConfirm=window.confirm;window.confirm=()=>true;picker.dispatchEvent(new Event('change',{bubbles:true}));return true})()");
   boolean imported=false;
   for(int i=0;i<60;i++){
    if("true".equals(js(view,"Boolean(window.SevenRpgWorkspace?.state?.worldEngine?.work?.title==='Test World' && document.querySelector('#seven-rpg-world-backup-status')?.textContent.includes('World imported'))"))){imported=true;break;}
    Thread.sleep(250);
   }
   assertTrue("RPG backup import round-trip failed: "+js(view,"JSON.stringify({world:SevenRpgWorkspace?.state?.worldEngine?.work?.title,status:document.querySelector('#seven-rpg-world-backup-status')?.textContent})"),imported);
   js(view,"(()=>{if(window.__rpgBackupOldConfirm)window.confirm=window.__rpgBackupOldConfirm;delete window.__rpgBackupOldConfirm;return true})()");
   // A malformed backup must fail without modifying the restored world.
   assertJsTrue(view,"(()=>{const picker=document.querySelector('#seven-rpg-import-world');const file=new File(['{invalid-json'],'broken.json',{type:'application/json'});const dt=new DataTransfer();dt.items.add(file);Object.defineProperty(picker,'files',{configurable:true,value:dt.files});picker.dispatchEvent(new Event('change',{bubbles:true}));return true})()");
   boolean rejected=false;
   for(int i=0;i<40;i++){
    if("true".equals(js(view,"Boolean(document.querySelector('#seven-rpg-world-backup-status')?.textContent.startsWith('Import failed:') && SevenRpgWorkspace?.state?.worldEngine?.work?.title==='Test World')"))){rejected=true;break;}
    Thread.sleep(250);
   }
   assertTrue("Invalid backup was not safely rejected: "+js(view,"JSON.stringify({title:SevenRpgWorkspace?.state?.worldEngine?.work?.title,status:document.querySelector('#seven-rpg-world-backup-status')?.textContent})"),rejected);
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
   assertJsTrue(restored,"Boolean(document.querySelector('.rpg-header') && document.querySelector('.rpg-application') && !document.querySelector('.topbar') && !document.querySelector('.sidebar') && !document.querySelector('[data-seven-shell-workspace]'))");
  }
 }
 @Test public void androidKeystoreSecretIsolation() throws Exception {
  android.content.Context ctx=InstrumentationRegistry.getInstrumentation().getTargetContext();
  SevenSecureStore store=new SevenSecureStore(ctx);
  store.clear();
  store.put("provider_token","secret-value-123");
  assertEquals("secret-value-123",store.get("provider_token"));
  assertTrue(store.keys().contains("provider_token"));
  java.security.KeyStore ks=java.security.KeyStore.getInstance("AndroidKeyStore");
  ks.load(null);
  assertTrue("keystore key must exist",ks.containsAlias("seven.secure.keystore.v1"));
  String raw=ctx.getSharedPreferences("seven.secure.v1",android.content.Context.MODE_PRIVATE).getString("provider_token","");
  assertFalse("stored value must be ciphertext not plaintext",raw.contains("secret-value-123"));
  store.remove("provider_token");
  assertNull("removed secret must be gone",store.get("provider_token"));
 }
}
`;
fs.writeFileSync(path.join(dir,'SevenRpgStandaloneTest.java'),java);
console.log('Seven RPG standalone Android instrumentation materialization: PASS');
