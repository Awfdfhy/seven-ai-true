"use strict";
const fs=require("fs"),path=require("path");
const ROOT=path.resolve(__dirname,".."),ANDROID=path.join(ROOT,"android"),TEST_JAVA=path.join(ANDROID,"app","src","androidTest","java","ai","seven","app"),TEST_ASSETS=path.join(ANDROID,"app","src","androidTest","assets");
const legacy=path.join(ANDROID,"app","src","main","res","mipmap-xxxhdpi","ic_launcher.png");
if(!fs.existsSync(legacy))throw new Error("generated xxxhdpi legacy icon missing; run android:generate first");
fs.mkdirSync(TEST_JAVA,{recursive:true});fs.mkdirSync(TEST_ASSETS,{recursive:true});fs.copyFileSync(legacy,path.join(TEST_ASSETS,"wave14-legacy-icon.png"));
const java=`package ai.seven.app;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.drawable.Drawable;
import android.os.Build;
import android.util.DisplayMetrics;
import androidx.core.graphics.drawable.DrawableCompat;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import org.json.JSONObject;
import org.junit.Assume;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.junit.Assert.*;

@RunWith(AndroidJUnit4.class)
public final class Wave14LogoEvidenceTest {
  private static final int SIZE=432;
  private File out(Context c,String name){
    File dir=c.getFilesDir();
    if(!dir.exists())assertTrue("test files dir create failed",dir.mkdirs());
    return new File(dir,name);
  }
  private void writeBitmap(Bitmap b,File f)throws Exception{try(FileOutputStream o=new FileOutputStream(f)){assertTrue(b.compress(Bitmap.CompressFormat.PNG,100,o));}}
  private Bitmap render(Drawable original,boolean whiteBackground,boolean tintBlack){
    Drawable d=DrawableCompat.wrap(original.mutate());if(tintBlack)DrawableCompat.setTint(d,Color.BLACK);
    Bitmap b=Bitmap.createBitmap(SIZE,SIZE,Bitmap.Config.ARGB_8888);Canvas c=new Canvas(b);if(whiteBackground)c.drawColor(Color.WHITE);d.setBounds(0,0,SIZE,SIZE);d.draw(c);return b;
  }
  private void captureTargetDrawable(Context target,Context test,int id,String name,boolean white,boolean black)throws Exception{Drawable d=target.getDrawable(id);assertNotNull(name+" drawable missing",d);writeBitmap(render(d,white,black),out(test,name));}
  @Test public void captureWave14ReleaseLogoEvidence() throws Exception {
    Assume.assumeTrue("Wave14 release evidence test requires explicit release-evidence invocation","1".equals(InstrumentationRegistry.getArguments().getString("wave14ReleaseEvidence")));
    Context target=InstrumentationRegistry.getInstrumentation().getTargetContext();Context test=InstrumentationRegistry.getInstrumentation().getContext();
    assertEquals("ai.seven.app",target.getPackageName());
    int adaptive=target.getResources().getIdentifier("ic_launcher","mipmap",target.getPackageName());
    int mono=target.getResources().getIdentifier("ic_launcher_monochrome","mipmap",target.getPackageName());
    assertTrue("adaptive launcher resource missing",adaptive!=0);assertTrue("themed monochrome resource missing",mono!=0);
    captureTargetDrawable(target,test,adaptive,"wave14-adaptive-icon.png",false,false);
    captureTargetDrawable(target,test,mono,"wave14-themed-icon.png",true,true);
    try(InputStream in=test.getAssets().open("wave14-legacy-icon.png")){Bitmap legacy=BitmapFactory.decodeStream(in);assertNotNull("legacy raster asset decode failed",legacy);Bitmap scaled=Bitmap.createScaledBitmap(legacy,SIZE,SIZE,true);writeBitmap(scaled,out(test,"wave14-legacy-icon.png"));}
    DisplayMetrics dm=target.getResources().getDisplayMetrics();int widthDp=target.getResources().getConfiguration().screenWidthDp,heightDp=target.getResources().getConfiguration().screenHeightDp;
    JSONObject proof=new JSONObject();
    proof.put("schema","seven.wave14.device-capture.v1");
    proof.put("manufacturer",Build.MANUFACTURER);
    proof.put("model",Build.MODEL);
    proof.put("androidVersion",Build.VERSION.RELEASE);
    proof.put("apiLevel",Build.VERSION.SDK_INT);
    proof.put("widthDp",widthDp);
    proof.put("heightDp",heightDp);
    proof.put("density",dm.density);
    proof.put("packageName",target.getPackageName());
    proof.put("adaptiveResource","@mipmap/ic_launcher");
    proof.put("themedResource","@mipmap/ic_launcher_monochrome");
    proof.put("captureSize",SIZE);
    byte[] json=proof.toString().getBytes(StandardCharsets.UTF_8);
    try(FileOutputStream o=new FileOutputStream(out(test,"wave14-device-proof.json"))){o.write(json);}
    assertTrue(out(test,"wave14-adaptive-icon.png").length()>0);assertTrue(out(test,"wave14-themed-icon.png").length()>0);assertTrue(out(test,"wave14-legacy-icon.png").length()>0);assertTrue(out(test,"wave14-device-proof.json").length()>0);
  }
}
`;
fs.writeFileSync(path.join(TEST_JAVA,"Wave14LogoEvidenceTest.java"),java);
console.log("Wave 14 Android logo evidence instrumentation: PASS (release-only gated adaptive + themed target resources, legacy packaged raster fixture)");
