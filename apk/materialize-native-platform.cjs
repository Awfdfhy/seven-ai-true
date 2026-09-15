"use strict";
const fs=require("fs");
const path=require("path");
const ROOT=path.resolve(__dirname,"..");
const ANDROID=path.join(ROOT,"android");
const JAVA_DIR=path.join(ANDROID,"app","src","main","java","ai","seven","app");
const MAIN=path.join(JAVA_DIR,"MainActivity.java");
if(!fs.existsSync(MAIN))throw new Error("generated MainActivity missing; run cap add android first");
fs.mkdirSync(JAVA_DIR,{recursive:true});

const secureStore=`package ai.seven.app;

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

const plugin=`package ai.seven.app;

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
import java.io.InputStream;
import java.io.OutputStream;
import java.util.regex.Pattern;
import org.json.JSONArray;

/** Native Android boundary for secure secrets and user-authorized Storage Access Framework documents. */
@CapacitorPlugin(name="SevenPlatform")
public class SevenPlatformPlugin extends Plugin {
  private static final Pattern SAFE_KEY=Pattern.compile("[A-Za-z0-9._:-]{1,160}");
  private static final int MAX_CHUNK=262144;
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
    ret.put("secureStore",true);ret.put("androidKeystore",true);ret.put("saf",true);ret.put("chunkedIO",true);ret.put("broadStoragePermission",false);ret.put("apiLevel",Build.VERSION.SDK_INT);ret.put("maxChunkBytes",MAX_CHUNK);
    call.resolve(ret);
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
