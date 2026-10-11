'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const cfg=JSON.parse(fs.readFileSync(path.join(root,'capacitor.config.json'),'utf8'));
const appId=String(cfg.appId||'').trim();
if(!/^[a-zA-Z_][\w]*(\.[a-zA-Z_][\w]*)+$/.test(appId))throw Error('Invalid Android application ID');
const folder=path.join(root,'android','app','src','androidTest','java',...appId.split('.'));
fs.mkdirSync(folder,{recursive:true});
const seed="(()=>{const State=window.SevenRpgState,Session=window.SevenRpgSession,Live=window.SevenRpgLiveIntegration,R=window.SevenRuntime;if(!State||!Session||!Live||!R)return 'runtime-missing';const b=Live.createBridge({stateApi:State,sessionApi:Session,runtime:R});const legacy={work:{id:'valen-force-stop',title:'Valen Force Stop'},worldSession:{position:7,titles:[]},canonPack:null,canonSession:{position:7,ledger:[{id:'canon-1'}]}};const result=b.sync({roomId:'rpg-force-stop-ci',worldId:'valen-force-stop',legacy,reason:'android-force-stop-seed'});if(!result.ok)return 'seed-failed:'+result.reason;return b.loadLatest('rpg-force-stop-ci').session.legacy.worldSession.position===7?'ok':'seed-readback-failed'})()";
const verify="(()=>{const State=window.SevenRpgState,Session=window.SevenRpgSession,Live=window.SevenRpgLiveIntegration,R=window.SevenRuntime;if(!State||!Session||!Live||!R)return 'runtime-missing';const b=Live.createBridge({stateApi:State,sessionApi:Session,runtime:R});const x=b.loadLatest('rpg-force-stop-ci');if(!x.ok)return 'missing:'+x.reason;const s=x.session;return s.worldId==='valen-force-stop'&&s.legacy&&s.legacy.worldSession.position===7&&s.legacy.canonSession.ledger[0].id==='canon-1'&&s.state.revision>=1?'ok':'restored-state-mismatch'})()";
const source=`package ${appId};

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
public class RpgForceStopTest {
  private WebView current(ActivityScenario<MainActivity> scenario) {
    AtomicReference<WebView> result=new AtomicReference<>();
    scenario.onActivity(activity -> result.set(activity.getBridge().getWebView()));
    assertNotNull(result.get());
    return result.get();
  }
  private String evaluate(WebView view,String expression) throws Exception {
    CountDownLatch latch=new CountDownLatch(1);
    AtomicReference<String> value=new AtomicReference<>();
    view.post(() -> view.evaluateJavascript(expression, v -> {value.set(v);latch.countDown();}));
    assertTrue("WebView evaluation timeout",latch.await(15,TimeUnit.SECONDS));
    return value.get();
  }
  private void awaitRuntime(WebView view) throws Exception {
    for(int i=0;i<100;i++) {
      if("true".equals(evaluate(view,"Boolean(window.SevenRpgState&&window.SevenRpgSession&&window.SevenRpgLiveIntegration&&window.SevenRuntime)")))return;
      Thread.sleep(200);
    }
    fail("RPG runtime did not load");
  }
  @Test public void seedRpgState() throws Exception {
    try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)) {
      WebView view=current(scenario); awaitRuntime(view);
      assertEquals("RPG seed must persist before process termination","\\\"ok\\\"",evaluate(view,${JSON.stringify(seed)}));
    }
  }
  @Test public void verifyRpgState() throws Exception {
    try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)) {
      WebView view=current(scenario); awaitRuntime(view);
      assertEquals("RPG world, session, canon ledger and revision must survive actual app force-stop","\\\"ok\\\"",evaluate(view,${JSON.stringify(verify)}));
    }
  }
}
`;
fs.writeFileSync(path.join(folder,'RpgForceStopTest.java'),source);
console.log('RPG instrumented process-restart test materialized');
