"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const REMAKE = path.join(ROOT, "remake");
const ANDROID = path.join(REMAKE, "android");
const CONFIG = JSON.parse(
  fs.readFileSync(path.join(REMAKE, "capacitor.config.json"), "utf8"),
);
const PACKAGE = JSON.parse(
  fs.readFileSync(path.join(REMAKE, "package.json"), "utf8"),
);
const APP_ID = String(CONFIG.appId || "").trim();
if (!/^[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)+$/.test(APP_ID)) {
  throw new Error("invalid Seven Remake Capacitor appId");
}
if (!fs.existsSync(ANDROID)) {
  throw new Error("generated Seven Remake Android project missing");
}

const javaDir = path.join(
  ANDROID,
  "app",
  "src",
  "main",
  "java",
  ...APP_ID.split("."),
);
const mainPath = path.join(javaDir, "MainActivity.java");
if (!fs.existsSync(mainPath)) {
  throw new Error("generated Seven Remake MainActivity missing");
}
fs.mkdirSync(javaDir, { recursive: true });

const plugin = `package ${APP_ID};

import android.content.ContentResolver;
import android.content.Intent;
import android.content.UriPermission;
import android.net.Uri;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.json.JSONArray;
import org.json.JSONObject;

@CapacitorPlugin(name="SevenRemakeNative")
public class SevenRemakeNativePlugin extends Plugin {
  private static final long CANCEL_TTL_MS = 60_000L;
  private final ConcurrentHashMap<String,Long> cancelled = new ConcurrentHashMap<>();

  private void purgeCancelled() {
    long cutoff=System.currentTimeMillis()-CANCEL_TTL_MS;
    Iterator<Map.Entry<String,Long>> it=cancelled.entrySet().iterator();
    while(it.hasNext()) {
      Map.Entry<String,Long> item=it.next();
      if(item.getValue()<cutoff)cancelled.remove(item.getKey(),item.getValue());
    }
  }

  private String canonical(String value,String field,int max) {
    if(value==null||value.isEmpty()||!value.equals(value.trim())||value.length()>max) {
      throw new IllegalArgumentException(field+" must be canonical");
    }
    return value;
  }

  private Uri contentUri(String value) {
    Uri uri=Uri.parse(canonical(value,"uri",4096));
    if(!"content".equalsIgnoreCase(uri.getScheme())) {
      throw new IllegalArgumentException("SAF URI must use content://");
    }
    return uri;
  }

  private JSObject ok(String requestId,Object value) {
    JSObject result=new JSObject();
    result.put("ok",true);
    result.put("value",value);
    JSObject envelope=new JSObject();
    envelope.put("requestId",requestId);
    envelope.put("result",result);
    return envelope;
  }

  private JSObject fail(String requestId,String code,String message,boolean retryable) {
    JSObject error=new JSObject();
    error.put("code",code);
    error.put("message",message);
    error.put("retryable",retryable);
    JSObject result=new JSObject();
    result.put("ok",false);
    result.put("error",error);
    JSObject envelope=new JSObject();
    envelope.put("requestId",requestId);
    envelope.put("result",result);
    return envelope;
  }

  @PluginMethod
  public void dispatch(PluginCall call) {
    String requestId="unknown";
    try {
      JSObject request=call.getObject("request");
      if(request==null)throw new IllegalArgumentException("request envelope required");
      requestId=canonical(request.getString("requestId"),"requestId",512);
      String method=canonical(request.getString("method"),"method",128);
      purgeCancelled();
      if(cancelled.remove(requestId)!=null) {
        call.resolve(fail(requestId,"SEVEN_CANCELLED","Native request was cancelled.",false));
        return;
      }
      JSONObject payload=request.optJSONObject("payload");
      if(payload==null)payload=new JSONObject();

      if("platform.capabilities".equals(method)) {
        JSONArray capabilities=new JSONArray();
        capabilities.put("saf");
        JSObject value=new JSObject();
        value.put("schemaVersion",1);
        value.put("capabilities",capabilities);
        call.resolve(ok(requestId,value));
        return;
      }

      if("saf.persistGrant".equals(method)) {
        Uri uri=contentUri(payload.optString("uri",null));
        boolean read=payload.optBoolean("read",false);
        boolean write=payload.optBoolean("write",false);
        if(!read&&!write)throw new IllegalArgumentException("read and/or write grant required");
        int flags=(read?Intent.FLAG_GRANT_READ_URI_PERMISSION:0)
          |(write?Intent.FLAG_GRANT_WRITE_URI_PERMISSION:0);
        ContentResolver resolver=getContext().getContentResolver();
        resolver.takePersistableUriPermission(uri,flags);
        JSObject value=new JSObject();
        value.put("schemaVersion",1);
        value.put("uri",uri.toString());
        value.put("read",read);
        value.put("write",write);
        value.put("persisted",true);
        value.put("issuedAt",System.currentTimeMillis());
        call.resolve(ok(requestId,value));
        return;
      }

      if("saf.releaseGrant".equals(method)) {
        Uri uri=contentUri(payload.optString("uri",null));
        int flags=0;
        for(UriPermission permission:getContext().getContentResolver().getPersistedUriPermissions()) {
          if(!uri.equals(permission.getUri()))continue;
          if(permission.isReadPermission())flags|=Intent.FLAG_GRANT_READ_URI_PERMISSION;
          if(permission.isWritePermission())flags|=Intent.FLAG_GRANT_WRITE_URI_PERMISSION;
        }
        boolean released=false;
        if(flags!=0) {
          getContext().getContentResolver().releasePersistableUriPermission(uri,flags);
          released=true;
        }
        JSObject value=new JSObject();
        value.put("released",released);
        call.resolve(ok(requestId,value));
        return;
      }

      call.resolve(fail(requestId,"SEVEN_UNSUPPORTED","Unsupported Seven Remake native method.",false));
    } catch(SecurityException error) {
      call.resolve(fail(requestId,"SEVEN_PERMISSION","Android permission was denied.",false));
    } catch(Exception error) {
      call.resolve(fail(requestId,"SEVEN_NATIVE",String.valueOf(error.getMessage()),false));
    }
  }

  @PluginMethod
  public void cancel(PluginCall call) {
    try {
      String requestId=canonical(call.getString("requestId"),"requestId",512);
      purgeCancelled();
      cancelled.put(requestId,System.currentTimeMillis());
      call.resolve();
    } catch(Exception error) {
      call.reject("Invalid cancellation request","SEVEN_CANCEL_INPUT",error);
    }
  }
}
`;

fs.writeFileSync(
  path.join(javaDir, "SevenRemakeNativePlugin.java"),
  plugin,
);

let main = fs.readFileSync(mainPath, "utf8");
if (!main.includes("registerPlugin(SevenRemakeNativePlugin.class)")) {
  const empty = /public\s+class\s+MainActivity\s+extends\s+BridgeActivity\s*\{\s*\}/m;
  if (!empty.test(main)) {
    throw new Error("Seven Remake MainActivity shape changed; refusing blind plugin injection");
  }
  main = main.replace(
    empty,
    `public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(android.os.Bundle savedInstanceState) {
    registerPlugin(SevenRemakeNativePlugin.class);
    super.onCreate(savedInstanceState);
  }
}`,
  );
  fs.writeFileSync(mainPath, main);
}

const gradlePath = path.join(ANDROID, "app", "build.gradle");
let gradle = fs.readFileSync(gradlePath, "utf8");
const versionParts = String(PACKAGE.version || "0.0.1")
  .split(".")
  .map((part) => Number.parseInt(part, 10) || 0);
const versionCode = Math.max(
  1,
  (versionParts[0] || 0) * 10000 +
  (versionParts[1] || 0) * 100 +
  (versionParts[2] || 0),
);
if (!/versionCode\s+\d+/.test(gradle) || !/versionName\s+["'][^"']+["']/.test(gradle)) {
  throw new Error("generated Android version contract changed");
}
gradle = gradle
  .replace(/versionCode\s+\d+/, `versionCode ${versionCode}`)
  .replace(/versionName\s+["'][^"']+["']/, `versionName "${PACKAGE.version}"`);
if (!gradle.includes("androidTestImplementation 'androidx.test.ext:junit:1.2.1'")) {
  const marker = /dependencies\s*\{/;
  if (!marker.test(gradle))throw new Error("generated Android dependencies block missing");
  gradle = gradle.replace(
    marker,
    `dependencies {
    androidTestImplementation 'androidx.test.ext:junit:1.2.1'
    androidTestImplementation 'androidx.test:core:1.6.1'`,
  );
}
fs.writeFileSync(gradlePath, gradle);

const testDir = path.join(
  ANDROID,
  "app",
  "src",
  "androidTest",
  "java",
  ...APP_ID.split("."),
);
fs.mkdirSync(testDir, { recursive: true });

const test = `package ${APP_ID};

import static org.junit.Assert.*;
import android.content.Context;
import android.content.pm.PackageInfo;
import android.webkit.WebView;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class SevenRemakeReleaseTest {
  private byte[] readAll(InputStream input) throws Exception {
    try(InputStream in=input;ByteArrayOutputStream out=new ByteArrayOutputStream()) {
      byte[] buffer=new byte[8192];
      for(int n;(n=in.read(buffer))!=-1;)out.write(buffer,0,n);
      return out.toByteArray();
    }
  }

  private String sha256(byte[] bytes) throws Exception {
    byte[] digest=MessageDigest.getInstance("SHA-256").digest(bytes);
    StringBuilder out=new StringBuilder();
    for(byte value:digest)out.append(String.format("%02x",value&0xff));
    return out.toString();
  }

  private String js(WebView webView,String code) throws Exception {
    CountDownLatch latch=new CountDownLatch(1);
    AtomicReference<String> value=new AtomicReference<>();
    webView.post(() -> webView.evaluateJavascript(code,result -> {
      value.set(result);
      latch.countDown();
    }));
    assertTrue("JavaScript evaluation timed out",latch.await(12,TimeUnit.SECONDS));
    return value.get();
  }

  private void waitFor(WebView webView,String code) throws Exception {
    for(int i=0;i<100;i++) {
      if("true".equals(js(webView,code)))return;
      Thread.sleep(150);
    }
    fail("Seven Remake state did not become ready: "+code);
  }

  @Test
  public void installedPayloadIdentityMatchesBuiltManifest() throws Exception {
    Context context=InstrumentationRegistry.getInstrumentation().getTargetContext();
    byte[] manifestBytes=readAll(
      context.getAssets().open("public/seven-remake-release.json")
    );
    JSONObject manifest=new JSONObject(new String(manifestBytes,StandardCharsets.UTF_8));
    assertEquals(1,manifest.getInt("schemaVersion"));
    assertEquals(context.getPackageName(),manifest.getString("artifactId"));

    PackageInfo info=context.getPackageManager().getPackageInfo(context.getPackageName(),0);
    assertEquals(info.versionName,manifest.getString("version"));

    String descriptor=manifest.getString("descriptor");
    assertEquals(
      manifest.getString("payloadSha256"),
      sha256(descriptor.getBytes(StandardCharsets.UTF_8))
    );

    JSONObject descriptorJson=new JSONObject(descriptor);
    assertEquals(manifest.getString("artifactId"),descriptorJson.getString("artifactId"));
    assertEquals(manifest.getString("version"),descriptorJson.getString("version"));
    JSONArray files=descriptorJson.getJSONArray("files");
    assertTrue("release payload must not be empty",files.length()>0);
    for(int i=0;i<files.length();i++) {
      JSONObject file=files.getJSONObject(i);
      String path=file.getString("path");
      assertFalse(path.startsWith("/"));
      assertFalse(path.contains("../"));
      byte[] installed=readAll(context.getAssets().open("public/"+path));
      assertEquals(file.getLong("sizeBytes"),installed.length);
      assertEquals(file.getString("sha256"),sha256(installed));
    }
  }

  @Test
  public void installedRemakeBootsAndNativeBridgeRoundTrips() throws Exception {
    try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)) {
      AtomicReference<WebView> ref=new AtomicReference<>();
      scenario.onActivity(activity -> ref.set(activity.getBridge().getWebView()));
      WebView webView=ref.get();
      assertNotNull(webView);

      waitFor(
        webView,
        "document.title==='Seven Remake V3'&&Boolean(document.getElementById('root')?.childElementCount)"
      );
      assertEquals(
        "true",
        js(
          webView,
          "Boolean(window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.SevenRemakeNative)"
        )
      );

      js(
        webView,
        "(()=>{window.__sevenRemakeBridgeProof='pending';"
          +"const q={requestId:'android-release-gate-1',method:'platform.capabilities',payload:{}};"
          +"Capacitor.Plugins.SevenRemakeNative.dispatch({request:q}).then(r=>{"
          +"window.__sevenRemakeBridgeProof=(r&&r.requestId===q.requestId&&r.result&&r.result.ok===true"
          +"&&r.result.value&&r.result.value.schemaVersion===1"
          +"&&Array.isArray(r.result.value.capabilities)&&r.result.value.capabilities.includes('saf'))?'ok':'bad';"
          +"}).catch(()=>window.__sevenRemakeBridgeProof='error');return true})()"
      );
      waitFor(webView,"window.__sevenRemakeBridgeProof==='ok'");
    }
  }
}
`;

fs.writeFileSync(
  path.join(testDir, "SevenRemakeReleaseTest.java"),
  test,
);

console.log(
  `Seven Remake Android materialization: PASS (${APP_ID} ${PACKAGE.version})`,
);
