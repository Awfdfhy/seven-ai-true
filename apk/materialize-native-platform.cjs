"use strict";
const fs=require("fs");
const path=require("path");
const ROOT=path.resolve(__dirname,"..");
const ANDROID=path.join(ROOT,"android");
const CONFIG=JSON.parse(fs.readFileSync(path.join(ROOT,"capacitor.config.json"),"utf8"));
const APP_ID=String(CONFIG.appId||"").trim();
if(!/^[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)+$/.test(APP_ID))throw new Error("invalid Capacitor appId");
const JAVA_DIR=path.join(ANDROID,"app","src","main","java",...APP_ID.split("."));
const MAIN=path.join(JAVA_DIR,"MainActivity.java");
if(!fs.existsSync(MAIN))throw new Error("generated MainActivity missing; run cap add android first");
fs.mkdirSync(JAVA_DIR,{recursive:true});

const secureStore=`package ${APP_ID};

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.KeyStore;
import java.util.Set;
import java.util.TreeSet;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/** Seven-owned secret storage. Ciphertext lives in private app preferences; key material never leaves Android Keystore. */
public final class SevenSecureStore {
  public static final String PREFS_NAME = "seven.secure.v1";
  private static final String KEY_ALIAS = "seven.secure.keystore.v1";
  private static final String ANDROID_KEYSTORE = "AndroidKeyStore";
  private final SharedPreferences prefs;

  public SevenSecureStore(Context context) {
    prefs=context.getApplicationContext().getSharedPreferences(PREFS_NAME,Context.MODE_PRIVATE);
  }

  private SecretKey key() throws Exception {
    KeyStore store=KeyStore.getInstance(ANDROID_KEYSTORE);
    store.load(null);
    if(!store.containsAlias(KEY_ALIAS)) {
      KeyGenerator generator=KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES,ANDROID_KEYSTORE);
      KeyGenParameterSpec spec=new KeyGenParameterSpec.Builder(KEY_ALIAS,KeyProperties.PURPOSE_ENCRYPT|KeyProperties.PURPOSE_DECRYPT)
        .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
        .setRandomizedEncryptionRequired(true)
        .build();
      generator.init(spec);
      generator.generateKey();
    }
    KeyStore.Entry entry=store.getEntry(KEY_ALIAS,null);
    if(!(entry instanceof KeyStore.SecretKeyEntry))throw new GeneralSecurityException("secure key unavailable");
    return ((KeyStore.SecretKeyEntry)entry).getSecretKey();
  }

  public synchronized void put(String name,String value) throws Exception {
    Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");
    cipher.init(Cipher.ENCRYPT_MODE,key());
    byte[] encrypted=cipher.doFinal(value.getBytes(StandardCharsets.UTF_8));
    String payload=Base64.encodeToString(cipher.getIV(),Base64.NO_WRAP)+"."+Base64.encodeToString(encrypted,Base64.NO_WRAP);
    if(!prefs.edit().putString(name,payload).commit())throw new IllegalStateException("secure persistence failed");
  }

  public synchronized String get(String name) throws Exception {
    String payload=prefs.getString(name,null);
    if(payload==null)return null;
    int split=payload.indexOf('.');
    if(split<=0||split>=payload.length()-1)throw new GeneralSecurityException("secure payload malformed");
    byte[] iv=Base64.decode(payload.substring(0,split),Base64.NO_WRAP);
    byte[] encrypted=Base64.decode(payload.substring(split+1),Base64.NO_WRAP);
    if(iv.length!=12)throw new GeneralSecurityException("secure payload IV invalid");
    Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");
    cipher.init(Cipher.DECRYPT_MODE,key(),new GCMParameterSpec(128,iv));
    return new String(cipher.doFinal(encrypted),StandardCharsets.UTF_8);
  }

  public synchronized boolean remove(String name){return prefs.edit().remove(name).commit();}
  public synchronized boolean clear(){return prefs.edit().clear().commit();}
  public synchronized Set<String> keys(){return new TreeSet<>(prefs.getAll().keySet());}
}
`;

const plugin=`package ${APP_ID};

import android.app.Activity;
import android.content.ContentResolver;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.OpenableColumns;
import android.util.Base64;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import org.json.JSONArray;
import org.json.JSONObject;

/** Native Android boundary for secure secrets and user-authorized Storage Access Framework documents. */
@CapacitorPlugin(name="SevenPlatform")
public class SevenPlatformPlugin extends Plugin {
  private static final Pattern SAFE_KEY=Pattern.compile("[A-Za-z0-9._:-]{1,160}");
  private static final Pattern GITHUB_CLIENT_ID=Pattern.compile("[A-Za-z0-9_-]{10,120}");
  private static final Pattern GITHUB_METHOD=Pattern.compile("GET|POST|PUT|PATCH|DELETE");
  private static final String GITHUB_API="https://api.github.com";
  private static final String GITHUB_REPO="/repos/Awfdfhy/seven-ai-true";
  private static final String GH_ACCESS="github.user_access_token";
  private static final String GH_REFRESH="github.refresh_token";
  private static final String GH_EXPIRES="github.access_expires_at";
  private static final String GH_REFRESH_EXPIRES="github.refresh_expires_at";
  private static final int MAX_CHUNK=262144;
  private static final int MAX_GITHUB_RESPONSE=2*1024*1024;
  private SevenSecureStore secure;

  @Override public void load(){secure=new SevenSecureStore(getContext());}

  private String secureKey(PluginCall call){
    String key=call.getString("key");
    if(key==null||!SAFE_KEY.matcher(key).matches())throw new IllegalArgumentException("invalid secure-store key");
    return key;
  }
  private Uri contentUri(String raw){
    if(raw==null)throw new IllegalArgumentException("uri required");
    Uri uri=Uri.parse(raw);
    if(!"content".equalsIgnoreCase(uri.getScheme()))throw new IllegalArgumentException("only content:// SAF URIs are accepted");
    return uri;
  }
  private int chunkLength(PluginCall call){
    Integer value=call.getInt("length");
    int n=value==null?65536:value;
    if(n<1||n>MAX_CHUNK)throw new IllegalArgumentException("length must be 1..262144 bytes");
    return n;
  }
  private long offset(PluginCall call){
    Long value=call.getLong("offset");
    long n=value==null?0:value;
    if(n<0)throw new IllegalArgumentException("offset must be non-negative");
    return n;
  }

  @PluginMethod public void getCapabilities(PluginCall call){
    JSObject ret=new JSObject();
    ret.put("secureStore",true);ret.put("androidKeystore",true);ret.put("saf",true);ret.put("chunkedIO",true);ret.put("githubDeviceFlow",true);ret.put("githubRepoApi",true);ret.put("broadStoragePermission",false);ret.put("apiLevel",Build.VERSION.SDK_INT);ret.put("maxChunkBytes",MAX_CHUNK);
    call.resolve(ret);
  }

  private String githubClientId(PluginCall call){
    String id=call.getString("clientId");
    if(id==null||!GITHUB_CLIENT_ID.matcher(id).matches())throw new IllegalArgumentException("invalid GitHub client id");
    return id;
  }
  private static String enc(String value)throws Exception{return URLEncoder.encode(value,StandardCharsets.UTF_8.name());}
  private static String readUtf8(InputStream in,int limit)throws Exception{
    if(in==null)return "";
    ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] buf=new byte[8192];int total=0,n;
    while((n=in.read(buf))>=0){if(n==0)continue;int take=Math.min(n,Math.max(0,limit-total));if(take>0)out.write(buf,0,take);total+=n;if(total>=limit)break;}
    return out.toString(StandardCharsets.UTF_8.name());
  }
  private JSONObject postGithubForm(String endpoint,Map<String,String> params)throws Exception{
    StringBuilder body=new StringBuilder();for(Map.Entry<String,String> e:params.entrySet()){if(body.length()>0)body.append('&');body.append(enc(e.getKey())).append('=').append(enc(e.getValue()));}
    byte[] bytes=body.toString().getBytes(StandardCharsets.UTF_8);
    HttpURLConnection c=(HttpURLConnection)new URL(endpoint).openConnection();c.setRequestMethod("POST");c.setConnectTimeout(15000);c.setReadTimeout(30000);c.setDoOutput(true);c.setInstanceFollowRedirects(true);
    c.setRequestProperty("Accept","application/json");c.setRequestProperty("Content-Type","application/x-www-form-urlencoded");c.setRequestProperty("User-Agent","seven.ai");
    try(OutputStream out=c.getOutputStream()){out.write(bytes);}
    int status=c.getResponseCode();String raw=readUtf8(status>=200&&status<400?c.getInputStream():c.getErrorStream(),MAX_GITHUB_RESPONSE);
    JSONObject json=raw.isEmpty()?new JSONObject():new JSONObject(raw);json.put("_httpStatus",status);return json;
  }
  private void storeGithubToken(JSONObject json)throws Exception{
    String access=json.optString("access_token","");if(access.isEmpty())throw new IllegalStateException("GitHub access token missing");
    secure.put(GH_ACCESS,access);
    long now=System.currentTimeMillis(),expires=json.optLong("expires_in",0);if(expires>0)secure.put(GH_EXPIRES,String.valueOf(now+expires*1000L));else secure.remove(GH_EXPIRES);
    String refresh=json.optString("refresh_token","");if(!refresh.isEmpty())secure.put(GH_REFRESH,refresh);
    long refreshExpires=json.optLong("refresh_token_expires_in",0);if(refreshExpires>0)secure.put(GH_REFRESH_EXPIRES,String.valueOf(now+refreshExpires*1000L));
  }
  private String ensureGithubToken(String clientId)throws Exception{
    String access=secure.get(GH_ACCESS);String expRaw=secure.get(GH_EXPIRES);long exp=0;try{if(expRaw!=null)exp=Long.parseLong(expRaw);}catch(Exception ignored){}
    if(access!=null&&!access.isEmpty()&&(exp==0||System.currentTimeMillis()<exp-300000L))return access;
    String refresh=secure.get(GH_REFRESH);if(refresh==null||refresh.isEmpty()){if(access!=null&&!access.isEmpty())return access;throw new IllegalStateException("GitHub is not connected");}
    Map<String,String> p=new LinkedHashMap<>();p.put("client_id",clientId);p.put("grant_type","refresh_token");p.put("refresh_token",refresh);
    JSONObject json=postGithubForm("https://github.com/login/oauth/access_token",p);if(json.has("error"))throw new IllegalStateException("GitHub token refresh failed: "+json.optString("error"));
    storeGithubToken(json);return secure.get(GH_ACCESS);
  }
  private boolean allowedGithubPath(String path,String method){
    if(path==null||path.contains("://")||path.contains(".."))return false;
    if("/user".equals(path))return "GET".equals(method);
    if(!path.startsWith(GITHUB_REPO))return false;
    String lower=path.toLowerCase();
    String[] blocked={"/actions/secrets","/dependabot/secrets","/codespaces/secrets","/hooks","/collaborators","/deploy_keys","/environments","/actions/permissions","/rulesets","/protection"};
    for(String part:blocked)if(lower.contains(part))return false;
    return true;
  }
  private JSObject githubApiOnce(String clientId,String method,String path,String bodyJson)throws Exception{
    if(!GITHUB_METHOD.matcher(method).matches()||!allowedGithubPath(path,method))throw new SecurityException("GitHub path or method is outside Seven's repository-development boundary");
    String token=ensureGithubToken(clientId);
    HttpURLConnection c=(HttpURLConnection)new URL(GITHUB_API+path).openConnection();c.setRequestMethod(method);c.setConnectTimeout(15000);c.setReadTimeout(45000);c.setInstanceFollowRedirects(true);
    c.setRequestProperty("Accept","application/vnd.github+json");c.setRequestProperty("Authorization","Bearer "+token);c.setRequestProperty("X-GitHub-Api-Version","2026-03-10");c.setRequestProperty("User-Agent","seven.ai");
    if(bodyJson!=null&&!"GET".equals(method)&&!"DELETE".equals(method)){byte[] bytes=bodyJson.getBytes(StandardCharsets.UTF_8);c.setDoOutput(true);c.setRequestProperty("Content-Type","application/json; charset=utf-8");try(OutputStream out=c.getOutputStream()){out.write(bytes);}}
    int status=c.getResponseCode();String raw=readUtf8(status>=200&&status<400?c.getInputStream():c.getErrorStream(),MAX_GITHUB_RESPONSE);
    JSObject ret=new JSObject();ret.put("status",status);ret.put("ok",status>=200&&status<300);ret.put("body",raw);String perms=c.getHeaderField("X-Accepted-GitHub-Permissions");if(perms!=null)ret.put("acceptedPermissions",perms);String remain=c.getHeaderField("X-RateLimit-Remaining");if(remain!=null)ret.put("rateLimitRemaining",remain);return ret;
  }

  @PluginMethod public void githubBeginDeviceFlow(PluginCall call){
    final String clientId;try{clientId=githubClientId(call);}catch(Exception e){call.reject("Invalid GitHub client id","SEVEN_GITHUB_INPUT",e);return;}
    new Thread(()->{try{Map<String,String> p=new LinkedHashMap<>();p.put("client_id",clientId);JSONObject json=postGithubForm("https://github.com/login/device/code",p);if(json.has("error"))throw new IllegalStateException(json.optString("error"));JSObject ret=new JSObject();ret.put("deviceCode",json.getString("device_code"));ret.put("userCode",json.getString("user_code"));ret.put("verificationUri",json.optString("verification_uri","https://github.com/login/device"));ret.put("expiresIn",json.optInt("expires_in",900));ret.put("interval",json.optInt("interval",5));call.resolve(ret);}catch(Exception e){call.reject("GitHub device authorization could not start","SEVEN_GITHUB_DEVICE",e);}},"seven-github-device").start();
  }
  @PluginMethod public void githubPollDeviceFlow(PluginCall call){
    final String clientId,deviceCode;try{clientId=githubClientId(call);deviceCode=call.getString("deviceCode");if(deviceCode==null||deviceCode.length()<20)throw new IllegalArgumentException("deviceCode required");}catch(Exception e){call.reject("Invalid GitHub device flow input","SEVEN_GITHUB_INPUT",e);return;}
    new Thread(()->{try{Map<String,String> p=new LinkedHashMap<>();p.put("client_id",clientId);p.put("device_code",deviceCode);p.put("grant_type","urn:ietf:params:oauth:grant-type:device_code");JSONObject json=postGithubForm("https://github.com/login/oauth/access_token",p);JSObject ret=new JSObject();if(json.has("access_token")){storeGithubToken(json);ret.put("authorized",true);ret.put("expiresIn",json.optLong("expires_in",0));ret.put("refreshTokenPresent",json.has("refresh_token"));}else{ret.put("authorized",false);ret.put("error",json.optString("error","authorization_pending"));ret.put("interval",json.optInt("interval",0));}call.resolve(ret);}catch(Exception e){call.reject("GitHub device authorization polling failed","SEVEN_GITHUB_DEVICE",e);}},"seven-github-device-poll").start();
  }
  @PluginMethod public void githubOpenDevicePage(PluginCall call){
    try{Intent i=new Intent(Intent.ACTION_VIEW,Uri.parse("https://github.com/login/device"));i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);getContext().startActivity(i);call.resolve();}catch(Exception e){call.reject("Could not open GitHub device page","SEVEN_GITHUB_BROWSER",e);}
  }
  @PluginMethod public void githubApi(PluginCall call){
    final String clientId,method,path,body;try{clientId=githubClientId(call);method=call.getString("method","GET").toUpperCase();path=call.getString("path");body=call.getString("bodyJson");if(path==null)throw new IllegalArgumentException("path required");}catch(Exception e){call.reject("Invalid GitHub API request","SEVEN_GITHUB_INPUT",e);return;}
    new Thread(()->{try{JSObject ret=githubApiOnce(clientId,method,path,body);call.resolve(ret);}catch(Exception e){call.reject("GitHub API request failed","SEVEN_GITHUB_API",e);}},"seven-github-api").start();
  }
  @PluginMethod public void githubJobLogs(PluginCall call){
    final String clientId;final Long jobId;try{clientId=githubClientId(call);jobId=call.getLong("jobId");if(jobId==null||jobId<=0)throw new IllegalArgumentException("jobId required");}catch(Exception e){call.reject("Invalid GitHub job id","SEVEN_GITHUB_INPUT",e);return;}
    new Thread(()->{try{String token=ensureGithubToken(clientId),path=GITHUB_REPO+"/actions/jobs/"+jobId+"/logs";HttpURLConnection c=(HttpURLConnection)new URL(GITHUB_API+path).openConnection();c.setRequestMethod("GET");c.setConnectTimeout(15000);c.setReadTimeout(45000);c.setInstanceFollowRedirects(true);c.setRequestProperty("Authorization","Bearer "+token);c.setRequestProperty("Accept","application/vnd.github+json");c.setRequestProperty("X-GitHub-Api-Version","2026-03-10");c.setRequestProperty("User-Agent","seven.ai");int status=c.getResponseCode();if(status<200||status>=300)throw new IllegalStateException("job logs status "+status);ByteArrayOutputStream text=new ByteArrayOutputStream();try(ZipInputStream zin=new ZipInputStream(c.getInputStream())){ZipEntry entry;byte[] buf=new byte[8192];while((entry=zin.getNextEntry())!=null&&text.size()<MAX_GITHUB_RESPONSE){int n;while((n=zin.read(buf))>0&&text.size()<MAX_GITHUB_RESPONSE)text.write(buf,0,Math.min(n,MAX_GITHUB_RESPONSE-text.size()));text.write('\\n');zin.closeEntry();}}String out=text.toString(StandardCharsets.UTF_8.name());if(out.length()>180000)out=out.substring(out.length()-180000);JSObject ret=new JSObject();ret.put("status",status);ret.put("logs",out);call.resolve(ret);}catch(Exception e){call.reject("GitHub job logs could not be read","SEVEN_GITHUB_LOGS",e);}},"seven-github-logs").start();
  }
  @PluginMethod public void githubConnectionState(PluginCall call){
    try{JSObject ret=new JSObject();ret.put("connected",secure.get(GH_ACCESS)!=null||secure.get(GH_REFRESH)!=null);String exp=secure.get(GH_EXPIRES);if(exp!=null)ret.put("expiresAt",exp);call.resolve(ret);}catch(Exception e){call.reject("GitHub connection state unavailable","SEVEN_GITHUB_STATE",e);}
  }
  @PluginMethod public void githubDisconnect(PluginCall call){
    try{secure.remove(GH_ACCESS);secure.remove(GH_REFRESH);secure.remove(GH_EXPIRES);secure.remove(GH_REFRESH_EXPIRES);call.resolve();}catch(Exception e){call.reject("GitHub disconnect failed","SEVEN_GITHUB_STATE",e);}
  }

  @PluginMethod public void secureSet(PluginCall call){
    try{
      String key=secureKey(call),value=call.getString("value");if(value==null)throw new IllegalArgumentException("value required");secure.put(key,value);call.resolve();
    }catch(Exception e){call.reject("Secure storage operation failed","SEVEN_SECURE_STORE",e);}
  }
  @PluginMethod public void secureGet(PluginCall call){
    try{
      String value=secure.get(secureKey(call));JSObject ret=new JSObject();ret.put("found",value!=null);if(value!=null)ret.put("value",value);call.resolve(ret);
    }catch(Exception e){call.reject("Secure storage integrity check failed","SEVEN_SECURE_STORE",e);}
  }
  @PluginMethod public void secureRemove(PluginCall call){
    try{JSObject ret=new JSObject();ret.put("removed",secure.remove(secureKey(call)));call.resolve(ret);}catch(Exception e){call.reject("Secure storage operation failed","SEVEN_SECURE_STORE",e);}
  }
  @PluginMethod public void secureClear(PluginCall call){
    try{JSObject ret=new JSObject();ret.put("cleared",secure.clear());call.resolve(ret);}catch(Exception e){call.reject("Secure storage operation failed","SEVEN_SECURE_STORE",e);}
  }
  @PluginMethod public void secureListKeys(PluginCall call){
    try{JSObject ret=new JSObject();ret.put("keys",new JSONArray(secure.keys()));call.resolve(ret);}catch(Exception e){call.reject("Secure storage operation failed","SEVEN_SECURE_STORE",e);}
  }

  @PluginMethod public void openDocument(PluginCall call){
    String mime=call.getString("mimeType","*/*");
    Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType(mime)
      .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION|Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
    startActivityForResult(call,intent,"openDocumentResult");
  }
  @ActivityCallback private void openDocumentResult(PluginCall call,ActivityResult result){finishSafResult(call,result,false);}

  @PluginMethod public void createDocument(PluginCall call){
    String name=call.getString("name"),mime=call.getString("mimeType","application/octet-stream");
    if(name==null||name.trim().isEmpty()){call.reject("Document name required","SEVEN_SAF_INPUT");return;}
    Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType(mime).putExtra(Intent.EXTRA_TITLE,name)
      .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION|Intent.FLAG_GRANT_WRITE_URI_PERMISSION|Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
    startActivityForResult(call,intent,"createDocumentResult");
  }
  @ActivityCallback private void createDocumentResult(PluginCall call,ActivityResult result){finishSafResult(call,result,true);}

  private void finishSafResult(PluginCall call,ActivityResult result,boolean writable){
    if(call==null)return;
    if(result.getResultCode()!=Activity.RESULT_OK||result.getData()==null||result.getData().getData()==null){JSObject ret=new JSObject();ret.put("cancelled",true);call.resolve(ret);return;}
    Uri uri=result.getData().getData();ContentResolver resolver=getContext().getContentResolver();int wanted=Intent.FLAG_GRANT_READ_URI_PERMISSION|(writable?Intent.FLAG_GRANT_WRITE_URI_PERMISSION:0);int granted=result.getData().getFlags()&wanted;boolean persisted=false;
    try{resolver.takePersistableUriPermission(uri,granted);persisted=true;}catch(SecurityException ignored){}
    JSObject ret=metadata(uri);ret.put("cancelled",false);ret.put("uri",uri.toString());ret.put("persisted",persisted);ret.put("writable",writable);call.resolve(ret);
  }
  private JSObject metadata(Uri uri){
    JSObject ret=new JSObject();ContentResolver resolver=getContext().getContentResolver();ret.put("mimeType",resolver.getType(uri));
    try(Cursor c=resolver.query(uri,new String[]{OpenableColumns.DISPLAY_NAME,OpenableColumns.SIZE},null,null,null)){
      if(c!=null&&c.moveToFirst()){int ni=c.getColumnIndex(OpenableColumns.DISPLAY_NAME),si=c.getColumnIndex(OpenableColumns.SIZE);if(ni>=0)ret.put("name",c.getString(ni));if(si>=0&&!c.isNull(si))ret.put("size",c.getLong(si));}
    }catch(Exception ignored){}
    return ret;
  }

  @PluginMethod public void readChunk(PluginCall call){
    try(InputStream in=getContext().getContentResolver().openInputStream(contentUri(call.getString("uri")))){
      if(in==null)throw new IllegalStateException("document stream unavailable");long target=offset(call),skipped=0;while(skipped<target){long n=in.skip(target-skipped);if(n>0){skipped+=n;continue;}if(in.read()==-1)break;skipped++;}
      int length=chunkLength(call),total=0;byte[] buf=new byte[length];while(total<length){int n=in.read(buf,total,length-total);if(n<0)break;total+=n;}
      byte[] exact=total==buf.length?buf:java.util.Arrays.copyOf(buf,total);JSObject ret=new JSObject();ret.put("offset",skipped);ret.put("bytesRead",total);ret.put("dataBase64",Base64.encodeToString(exact,Base64.NO_WRAP));call.resolve(ret);
    }catch(Exception e){call.reject("Native document read failed","SEVEN_NATIVE_IO",e);}
  }

  @PluginMethod public void writeChunk(PluginCall call){
    try{
      Uri uri=contentUri(call.getString("uri"));String encoded=call.getString("dataBase64");if(encoded==null)throw new IllegalArgumentException("dataBase64 required");byte[] data=Base64.decode(encoded,Base64.DEFAULT);if(data.length>MAX_CHUNK)throw new IllegalArgumentException("chunk exceeds 262144 bytes");boolean append=Boolean.TRUE.equals(call.getBoolean("append",false));
      try(OutputStream out=getContext().getContentResolver().openOutputStream(uri,append?"wa":"wt")){if(out==null)throw new IllegalStateException("document stream unavailable");out.write(data);out.flush();}
      JSObject ret=new JSObject();ret.put("bytesWritten",data.length);call.resolve(ret);
    }catch(Exception e){call.reject("Native document write failed","SEVEN_NATIVE_IO",e);}
  }

  @PluginMethod public void releaseDocument(PluginCall call){
    try{Uri uri=contentUri(call.getString("uri"));int flags=Intent.FLAG_GRANT_READ_URI_PERMISSION|Intent.FLAG_GRANT_WRITE_URI_PERMISSION;getContext().getContentResolver().releasePersistableUriPermission(uri,flags);call.resolve();}
    catch(Exception e){call.reject("Native document permission release failed","SEVEN_NATIVE_IO",e);}
  }
}
`;

fs.writeFileSync(path.join(JAVA_DIR,"SevenSecureStore.java"),secureStore);
fs.writeFileSync(path.join(JAVA_DIR,"SevenPlatformPlugin.java"),plugin);
let main=fs.readFileSync(MAIN,"utf8");
if(!main.includes("registerPlugin(SevenPlatformPlugin.class)")){
  const empty=/public\s+class\s+MainActivity\s+extends\s+BridgeActivity\s*\{\s*\}/m;
  if(empty.test(main))main=main.replace(empty,`public class MainActivity extends BridgeActivity {\n  @Override\n  public void onCreate(android.os.Bundle savedInstanceState) {\n    registerPlugin(SevenPlatformPlugin.class);\n    super.onCreate(savedInstanceState);\n  }\n}`);
  else throw new Error("MainActivity shape changed; refusing blind native-plugin injection");
  fs.writeFileSync(MAIN,main);
}
console.log("android native platform bridge: PASS (Keystore + SAF + chunked IO)");
