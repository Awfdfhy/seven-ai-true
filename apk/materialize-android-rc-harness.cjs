'use strict';
const fs=require('fs'),path=require('path');
const {FIXTURE,seedUpgradeScript,verifyProcessScript,stageProcessScript}=require('./android-rc-state-fixture.cjs');
const ROOT=path.resolve(__dirname,'..'),ANDROID=path.join(ROOT,'android');
const CONFIG=JSON.parse(fs.readFileSync(path.join(ROOT,'capacitor.config.json'),'utf8'));
const APP_ID=String(CONFIG.appId||'').trim();
if(!/^[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)+$/.test(APP_ID))throw Error('invalid appId');
const TEST_DIR=path.join(ANDROID,'app','src','androidTest','java',...APP_ID.split('.'));
if(!fs.existsSync(path.join(ANDROID,'app','build.gradle')))throw Error('generated Android project missing');
fs.mkdirSync(TEST_DIR,{recursive:true});
const javaString=v=>JSON.stringify(String(v));
const AUTHORITY=APP_ID+'.rc.documents';
const DOC_ID='seven-rc-fixture';
const DOC_URI='content://'+AUTHORITY+'/document/'+DOC_ID;
const performanceScript=`(()=>{window.__sevenRcPerf={status:'pending'};try{
  const original=currentRoom,id='rc-perf-500';if(!rooms[original])throw Error('original room missing');
  rooms[id]=createEmptyRoom();roomTitles[id]='RC Performance';
  for(let i=0;i<500;i++)rooms[id].history.push({role:i%2?'assistant':'user',content:'performance message '+i+' '+('payload '.repeat(12))});
  currentRoom=id;chatRenderLimits.delete(id);
  const renderStart=performance.now();renderChatHistory();const render500Ms=performance.now()-renderStart;
  const rendered=document.getElementById('chat').querySelectorAll('.message').length;
  const input=document.getElementById('userInput'),oldValue=input.value;const inputStart=performance.now();
  for(let i=0;i<50;i++){input.value='latency-'+i+'-'+('x'.repeat(i%16));input.dispatchEvent(new Event('input',{bubbles:true}));}
  const composer50InputMs=performance.now()-inputStart;input.value=oldValue;input.dispatchEvent(new Event('input',{bubbles:true}));
  const timerStart=performance.now();
  setTimeout(()=>{const timerTurnMs=performance.now()-timerStart;delete rooms[id];delete roomTitles[id];chatRenderLimits.delete(id);currentRoom=original;updateRoomTitle();renderChatHistory();updateRoomListUI();
    window.__sevenRcPerf={status:'ok',canonical:500,rendered,render500Ms,composer50InputMs,timerTurnMs};
  },0);
}catch(e){window.__sevenRcPerf={status:'error',error:String(e&&e.message||e)}}return true})()`;

const test=`package ${APP_ID};

import static org.junit.Assert.*;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.DocumentsContract;
import android.webkit.WebView;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class SevenRcHarnessTest {
  private static final String APP_ID=${javaString(APP_ID)};
  private static final String DOC_URI=${javaString(DOC_URI)};
  private static final String PREFS="seven.rc.acceptance.v1";
  private static final String SAF_KEY="persistedSafUri";

  private String js(WebView webView,String code)throws Exception{
    CountDownLatch latch=new CountDownLatch(1);AtomicReference<String> out=new AtomicReference<>();
    webView.post(()->webView.evaluateJavascript(code,v->{out.set(v);latch.countDown();}));
    assertTrue("JavaScript evaluation timeout",latch.await(15,TimeUnit.SECONDS));return out.get();
  }
  private void waitFor(WebView webView,String code)throws Exception{
    for(int i=0;i<120;i++){if("true".equals(js(webView,code)))return;Thread.sleep(250);}
    fail("RC runtime wait failed: "+code+" state="+js(webView,"JSON.stringify({fixture:window.__sevenRcFixture||null,process:window.__sevenRcProcess||null,verify:window.__sevenRcVerify||null,persistence:typeof roomPersistence!=='undefined'?roomPersistence.status():null})"));
  }
  private WebView web(ActivityScenario<MainActivity> scenario)throws Exception{
    AtomicReference<WebView> ref=new AtomicReference<>();scenario.onActivity(a->ref.set(a.getBridge().getWebView()));
    WebView w=ref.get();assertNotNull(w);
    waitFor(w,"Boolean(typeof roomPersistence!=='undefined'&&roomPersistence.status().ready&&window.SevenRemake&&window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.SevenPlatform)");
    return w;
  }
  private SharedPreferences prefs(){return InstrumentationRegistry.getInstrumentation().getTargetContext().getSharedPreferences(PREFS,Context.MODE_PRIVATE);}
  private long versionCode()throws Exception{
    Context c=InstrumentationRegistry.getInstrumentation().getTargetContext();
    PackageInfo p=c.getPackageManager().getPackageInfo(APP_ID,0);return p.getLongVersionCode();
  }
  private String versionName()throws Exception{
    Context c=InstrumentationRegistry.getInstrumentation().getTargetContext();
    PackageInfo p=c.getPackageManager().getPackageInfo(APP_ID,0);return p.versionName;
  }
  private void seedSafGrant()throws Exception{
    Context test=InstrumentationRegistry.getInstrumentation().getContext();
    Context target=InstrumentationRegistry.getInstrumentation().getTargetContext();
    Uri uri=Uri.parse(DOC_URI);
    // Instrumentation executes in the target UID even when using the test Context.
    // The provider-owning test APK must issue the URI grant from its own process.
    Intent broker=new Intent().setClassName(test.getPackageName(),APP_ID+".SevenRcGrantActivity")
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    target.startActivity(broker);
    boolean taken=false;
    for(int i=0;i<120&&!taken;i++){
      try{target.getContentResolver().takePersistableUriPermission(uri,Intent.FLAG_GRANT_READ_URI_PERMISSION);taken=true;}
      catch(SecurityException pending){Thread.sleep(250);}
    }
    assertTrue("provider owner did not deliver a persistable SAF grant",taken);
    boolean persisted=target.getContentResolver().getPersistedUriPermissions().stream().anyMatch(p->uri.equals(p.getUri())&&p.isReadPermission());
    assertTrue("target app did not persist SAF permission",persisted);
    assertEquals("seven-rc-saf-document",readAll(target,uri));
    assertTrue(prefs().edit().putString(SAF_KEY,uri.toString()).commit());
  }
  private static String readAll(Context c,Uri uri)throws Exception{
    try(InputStream in=c.getContentResolver().openInputStream(uri);ByteArrayOutputStream out=new ByteArrayOutputStream()){
      assertNotNull(in);byte[] buf=new byte[256];for(int n;(n=in.read(buf))>=0;){if(n>0)out.write(buf,0,n);}return out.toString(StandardCharsets.UTF_8.name());
    }
  }
  private void verifySafGrant()throws Exception{
    Context target=InstrumentationRegistry.getInstrumentation().getTargetContext();
    String raw=prefs().getString(SAF_KEY,null);assertNotNull("SAF fixture URI missing",raw);Uri uri=Uri.parse(raw);
    boolean persisted=target.getContentResolver().getPersistedUriPermissions().stream().anyMatch(p->uri.equals(p.getUri())&&p.isReadPermission());
    assertTrue("persisted SAF permission missing after restart/upgrade",persisted);
    assertEquals("seven-rc-saf-document",readAll(target,uri));
  }
  private void signal(String phase)throws Exception{
    Context target=InstrumentationRegistry.getInstrumentation().getTargetContext();
    java.io.File marker=new java.io.File(target.getFilesDir(),"seven-rc-process-ready");
    byte[] expected=phase.getBytes(StandardCharsets.UTF_8);
    try(java.io.FileOutputStream out=new java.io.FileOutputStream(marker)){
      out.write(expected);out.flush();out.getFD().sync();
    }
    try(InputStream in=new java.io.FileInputStream(marker);ByteArrayOutputStream out=new ByteArrayOutputStream()){
      byte[] buf=new byte[128];for(int n;(n=in.read(buf))>=0;){if(n>0)out.write(buf,0,n);}
      assertEquals("host marker was not written",phase,out.toString(StandardCharsets.UTF_8.name()));
    }
  }
  private void stage(String phase,String script)throws Exception{
    try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
      WebView w=web(scenario);System.out.println("SEVEN_RC_STAGE_WEB_READY="+phase);assertEquals("true",js(w,script));
      waitFor(w,"window.__sevenRcProcess&&window.__sevenRcProcess.status!=='pending'");
      System.out.println("SEVEN_RC_STAGE_STATE="+js(w,"JSON.stringify(window.__sevenRcProcess)"));
      assertEquals("true",js(w,"window.__sevenRcProcess.status==='ready'"));
      signal(phase);
      Thread.sleep(60000);
      fail("host did not kill the target process for "+phase);
    }
  }
  private void verifyProcess(String phase,String script)throws Exception{
    try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
      WebView w=web(scenario);assertEquals("true",js(w,script));
      waitFor(w,"window.__sevenRcVerify&&window.__sevenRcVerify.status!=='pending'");
      assertEquals("true",js(w,"window.__sevenRcVerify.status==='ok'"));
      verifySafGrant();
    }
  }

  @Test public void seedUpgradeState()throws Exception{
    try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
      WebView w=web(scenario);assertEquals("true",js(w,${javaString(seedUpgradeScript())}));
      waitFor(w,"window.__sevenRcFixture&&window.__sevenRcFixture.status!=='pending'");
      assertEquals("true",js(w,"window.__sevenRcFixture.status==='seeded'"));
    }
    seedSafGrant();
    assertTrue(prefs().edit().putLong("versionCodeA",versionCode()).putString("versionNameA",versionName()).putString("packageA",APP_ID).commit());
  }

  @Test public void verifyUpgradeState()throws Exception{
    long before=prefs().getLong("versionCodeA",-1);assertTrue("Build A version marker missing",before>0);
    assertEquals("package id changed across upgrade",APP_ID,prefs().getString("packageA",null));
    assertTrue("Build B versionCode did not increase",versionCode()>before);
    verifySafGrant();
    verifyProcess("upgrade",${javaString(verifyProcessScript('cleancommit'))});
  }

  @Test public void measureRuntimePerformance()throws Exception{
    try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
      WebView w=web(scenario);assertEquals("true",js(w,${javaString(performanceScript)}));
      waitFor(w,"window.__sevenRcPerf&&window.__sevenRcPerf.status!=='pending'");
      assertEquals("true",js(w,"window.__sevenRcPerf.status==='ok'&&window.__sevenRcPerf.canonical===500&&window.__sevenRcPerf.rendered<=100&&Number.isFinite(window.__sevenRcPerf.render500Ms)&&window.__sevenRcPerf.render500Ms>=0&&Number.isFinite(window.__sevenRcPerf.composer50InputMs)&&window.__sevenRcPerf.composer50InputMs>=0&&Number.isFinite(window.__sevenRcPerf.timerTurnMs)&&window.__sevenRcPerf.timerTurnMs>=0"));
      System.out.println("SEVEN_RC_PERFORMANCE="+js(w,"JSON.stringify(window.__sevenRcPerf)"));
    }
  }

  @Test public void backgroundForegroundPreservesDurableState()throws Exception{
    try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
      WebView first=web(scenario);
      assertEquals("true",js(first,${javaString(verifyProcessScript('cleancommit'))}));
      waitFor(first,"window.__sevenRcVerify&&window.__sevenRcVerify.status==='ok'");
      scenario.moveToState(androidx.lifecycle.Lifecycle.State.STARTED);Thread.sleep(250);
      scenario.moveToState(androidx.lifecycle.Lifecycle.State.RESUMED);
      WebView resumed=web(scenario);
      assertEquals("true",js(resumed,${javaString(verifyProcessScript('cleancommit'))}));
      waitFor(resumed,"window.__sevenRcVerify&&window.__sevenRcVerify.status==='ok'");
      verifySafGrant();
    }
  }

  @Test public void stageProcessPreCommit()throws Exception{stage("precommit",${javaString(stageProcessScript('precommit'))});}
  @Test public void verifyProcessPreCommit()throws Exception{verifyProcess("precommit",${javaString(verifyProcessScript('precommit'))});}
  @Test public void stageProcessPostCommit()throws Exception{stage("postcommit",${javaString(stageProcessScript('postcommit'))});}
  @Test public void verifyProcessPostCommit()throws Exception{verifyProcess("postcommit",${javaString(verifyProcessScript('postcommit'))});}
  @Test public void stageProcessCleanCommit()throws Exception{stage("cleancommit",${javaString(stageProcessScript('cleancommit'))});}
  @Test public void verifyProcessCleanCommit()throws Exception{verifyProcess("cleancommit",${javaString(verifyProcessScript('cleancommit'))});}
}
`;

const provider=`package ${APP_ID};

import android.database.Cursor;
import android.database.MatrixCursor;
import android.os.CancellationSignal;
import android.os.ParcelFileDescriptor;
import android.provider.DocumentsContract;
import android.provider.DocumentsProvider;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class SevenTestDocumentsProvider extends DocumentsProvider {
  public static final String AUTHORITY=${javaString(AUTHORITY)};
  private static final String ROOT="seven-rc-root",DOC=${javaString(DOC_ID)};
  private static final byte[] BODY="seven-rc-saf-document".getBytes(StandardCharsets.UTF_8);
  @Override public boolean onCreate(){return true;}
  private MatrixCursor.RowBuilder doc(MatrixCursor c,String id,String name){
    MatrixCursor.RowBuilder r=c.newRow();r.add(DocumentsContract.Document.COLUMN_DOCUMENT_ID,id);
    r.add(DocumentsContract.Document.COLUMN_DISPLAY_NAME,name);r.add(DocumentsContract.Document.COLUMN_MIME_TYPE,"text/plain");
    r.add(DocumentsContract.Document.COLUMN_SIZE,BODY.length);r.add(DocumentsContract.Document.COLUMN_FLAGS,0);return r;
  }
  @Override public Cursor queryRoots(String[] projection){
    String[] cols=projection==null?new String[]{DocumentsContract.Root.COLUMN_ROOT_ID,DocumentsContract.Root.COLUMN_DOCUMENT_ID,DocumentsContract.Root.COLUMN_TITLE,DocumentsContract.Root.COLUMN_FLAGS,DocumentsContract.Root.COLUMN_MIME_TYPES}:projection;MatrixCursor c=new MatrixCursor(cols);
    MatrixCursor.RowBuilder r=c.newRow();r.add(DocumentsContract.Root.COLUMN_ROOT_ID,ROOT);r.add(DocumentsContract.Root.COLUMN_DOCUMENT_ID,DOC);
    r.add(DocumentsContract.Root.COLUMN_TITLE,"Seven RC Fixture");r.add(DocumentsContract.Root.COLUMN_FLAGS,0);r.add(DocumentsContract.Root.COLUMN_MIME_TYPES,"text/plain");return c;
  }
  @Override public Cursor queryDocument(String documentId,String[] projection){
    String[] cols=projection==null?new String[]{DocumentsContract.Document.COLUMN_DOCUMENT_ID,DocumentsContract.Document.COLUMN_DISPLAY_NAME,DocumentsContract.Document.COLUMN_MIME_TYPE,DocumentsContract.Document.COLUMN_SIZE,DocumentsContract.Document.COLUMN_FLAGS}:projection;MatrixCursor c=new MatrixCursor(cols);doc(c,DOC,"seven-rc-saf.txt");return c;
  }
  @Override public Cursor queryChildDocuments(String parentDocumentId,String[] projection,String sortOrder){
    String[] cols=projection==null?new String[]{DocumentsContract.Document.COLUMN_DOCUMENT_ID,DocumentsContract.Document.COLUMN_DISPLAY_NAME,DocumentsContract.Document.COLUMN_MIME_TYPE,DocumentsContract.Document.COLUMN_SIZE,DocumentsContract.Document.COLUMN_FLAGS}:projection;MatrixCursor c=new MatrixCursor(cols);doc(c,DOC,"seven-rc-saf.txt");return c;
  }
  @Override public ParcelFileDescriptor openDocument(String documentId,String mode,CancellationSignal signal)throws java.io.FileNotFoundException{
    if(!DOC.equals(documentId)||!mode.contains("r"))throw new java.io.FileNotFoundException(documentId);
    try{
      final ParcelFileDescriptor[] pipe=ParcelFileDescriptor.createPipe();
      new Thread(()->{try(OutputStream out=new ParcelFileDescriptor.AutoCloseOutputStream(pipe[1])){out.write(BODY);}catch(Exception ignored){}},"seven-rc-doc").start();
      return pipe[0];
    }catch(java.io.IOException e){throw new java.io.FileNotFoundException(e.getMessage());}
  }
}
`;
fs.writeFileSync(path.join(TEST_DIR,'SevenRcHarnessTest.java'),test);
fs.writeFileSync(path.join(TEST_DIR,'SevenTestDocumentsProvider.java'),provider);
const broker=`package ${APP_ID};
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
public class SevenRcGrantActivity extends Activity {
  @Override public void onCreate(Bundle state){
    super.onCreate(state);
    Intent grant=new Intent(Intent.ACTION_VIEW,Uri.parse(${javaString(DOC_URI)}))
      .setClassName(${javaString(APP_ID)},${javaString(APP_ID+'.MainActivity')})
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_ACTIVITY_SINGLE_TOP|Intent.FLAG_GRANT_READ_URI_PERMISSION|Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
    startActivity(grant);
    finish();
  }
}
`;
fs.writeFileSync(path.join(TEST_DIR,'SevenRcGrantActivity.java'),broker);


const manifestDir=path.join(ANDROID,'app','src','androidTest'),manifestPath=path.join(manifestDir,'AndroidManifest.xml');
fs.mkdirSync(manifestDir,{recursive:true});
let manifest=fs.existsSync(manifestPath)?fs.readFileSync(manifestPath,'utf8'):'<manifest xmlns:android="http://schemas.android.com/apk/res/android"><application /></manifest>';
if(!manifest.includes('SevenTestDocumentsProvider')){
  if(!/<application\b[^>]*\/>/.test(manifest)&&!/<application\b[^>]*>/.test(manifest))throw Error('androidTest manifest application anchor missing');
  const entry=`<provider android:name="${APP_ID}.SevenTestDocumentsProvider" android:authorities="${AUTHORITY}" android:exported="true" android:grantUriPermissions="true" android:permission="android.permission.MANAGE_DOCUMENTS"><intent-filter><action android:name="android.content.action.DOCUMENTS_PROVIDER"/></intent-filter></provider>`;
  if(/<application\b([^>]*)\/>/.test(manifest))manifest=manifest.replace(/<application\b([^>]*)\/>/,`<application$1>${entry}</application>`);
  else manifest=manifest.replace(/<application\b([^>]*)>/,m=>m+entry);
}
if(!manifest.includes('SevenRcGrantActivity')){
  manifest=manifest.replace('</application>',`<activity android:name="${APP_ID}.SevenRcGrantActivity" android:exported="true"/></application>`);
}
fs.writeFileSync(manifestPath,manifest);
console.log('android RC acceptance harness materialized: '+APP_ID+' '+DOC_URI);
