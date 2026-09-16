const fs=require("fs"),path=require("path");
const ROOT=path.resolve(__dirname,".."),ANDROID=path.join(ROOT,"android"),testRoot=path.join(ANDROID,"app","src","androidTest"),testDir=path.join(testRoot,"java","ai","seven","app");
if(!fs.existsSync(ANDROID))throw Error("generated Android project missing");
fs.mkdirSync(testDir,{recursive:true});
const source=`package ai.seven.app;

import static org.junit.Assert.*;
import android.content.Context;
import android.graphics.Bitmap;
import android.os.ParcelFileDescriptor;
import android.webkit.WebView;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
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
  private File evidenceDir() {
    Context testContext=InstrumentationRegistry.getInstrumentation().getContext();
    File root=new File(testContext.getFilesDir(),"seven-visual");
    assertTrue("internal evidence directory unavailable",root.exists()||root.mkdirs());
    return root;
  }
  private void shot(String name) throws Exception {
    Bitmap bitmap=InstrumentationRegistry.getInstrumentation().getUiAutomation().takeScreenshot();
    assertNotNull("device screenshot unavailable",bitmap);
    File out=new File(evidenceDir(),name+".png");
    try(FileOutputStream stream=new FileOutputStream(out)){ assertTrue("PNG compression failed",bitmap.compress(Bitmap.CompressFormat.PNG,100,stream)); }
    assertTrue("captured screenshot is empty",out.isFile()&&out.length()>128);
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
    File root=evidenceDir();
    File[] files=root.listFiles();
    if(files!=null)for(File f:files)assertTrue("stale evidence cleanup failed: "+f.getName(),f.delete());
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
const provider=`package ai.seven.app;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.net.Uri;
import android.os.Binder;
import android.os.ParcelFileDescriptor;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;

public final class SevenEvidenceProvider extends ContentProvider {
  private static final int SHELL_UID=2000;
  @Override public boolean onCreate(){ return true; }
  @Override public String getType(Uri uri){ return "image/png"; }
  @Override public Cursor query(Uri uri,String[] projection,String selection,String[] selectionArgs,String sortOrder){ return null; }
  @Override public Uri insert(Uri uri,ContentValues values){ throw new UnsupportedOperationException("read only"); }
  @Override public int delete(Uri uri,String selection,String[] selectionArgs){ throw new UnsupportedOperationException("read only"); }
  @Override public int update(Uri uri,ContentValues values,String selection,String[] selectionArgs){ throw new UnsupportedOperationException("read only"); }
  @Override public ParcelFileDescriptor openFile(Uri uri,String mode) throws FileNotFoundException {
    if(Binder.getCallingUid()!=SHELL_UID)throw new SecurityException("shell-only evidence provider");
    if(!"r".equals(mode))throw new FileNotFoundException("evidence provider is read only");
    String name=uri.getLastPathSegment();
    if(name==null||!name.matches("[a-z0-9-]+\\\\.png"))throw new FileNotFoundException("invalid evidence filename");
    try {
      File root=new File(getContext().getFilesDir(),"seven-visual").getCanonicalFile();
      File file=new File(root,name).getCanonicalFile();
      if(!file.getPath().startsWith(root.getPath()+File.separator)||!file.isFile())throw new FileNotFoundException("evidence file unavailable");
      return ParcelFileDescriptor.open(file,ParcelFileDescriptor.MODE_READ_ONLY);
    } catch(IOException e){
      FileNotFoundException failure=new FileNotFoundException("evidence path resolution failed");failure.initCause(e);throw failure;
    }
  }
}
`;
const manifest=`<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <application>
    <provider
      android:name="ai.seven.app.SevenEvidenceProvider"
      android:authorities="ai.seven.app.test.sevenevidence"
      android:exported="true"
      android:grantUriPermissions="false" />
  </application>
</manifest>
`;
fs.writeFileSync(path.join(testDir,"SevenVisualEvidenceTest.java"),source);
fs.writeFileSync(path.join(testDir,"SevenEvidenceProvider.java"),provider);
fs.writeFileSync(path.join(testRoot,"AndroidManifest.xml"),manifest);
console.log("android visual instrumentation materialization: PASS");
