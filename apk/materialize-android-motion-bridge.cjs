"use strict";
const fs=require("fs"),path=require("path");
const ROOT=path.resolve(__dirname,".."),MAIN=path.join(ROOT,"android","app","src","main","java","ai","seven","app","MainActivity.java");
if(!fs.existsSync(MAIN))throw new Error("generated MainActivity missing");
let source=fs.readFileSync(MAIN,"utf8");
if(!source.includes("registerPlugin(SevenPlatformPlugin.class)"))throw new Error("SevenPlatform registration missing; refusing blind Android motion bridge injection");
if(source.includes("SEVEN_ANDROID_REDUCED_MOTION_BRIDGE_V1")){console.log("android reduced-motion bridge: PASS (already materialized)");process.exit(0)}
if(!/\n}\s*$/.test(source))throw new Error("MainActivity closing brace missing; refusing blind Android motion bridge injection");
const bridge=`

  // SEVEN_ANDROID_REDUCED_MOTION_BRIDGE_V1
  // WebView does not reliably map Android's Remove animations / animation-scale
  // state to CSS prefers-reduced-motion. Mirror the genuine Android system state
  // into SevenPerformance so the release app honors the device preference.
  private boolean sevenAndroidReducedMotionEnabled() {
    try {
      android.content.ContentResolver resolver=getContentResolver();
      float window=android.provider.Settings.Global.getFloat(resolver,android.provider.Settings.Global.WINDOW_ANIMATION_SCALE,1f);
      float transition=android.provider.Settings.Global.getFloat(resolver,android.provider.Settings.Global.TRANSITION_ANIMATION_SCALE,1f);
      float animator=android.provider.Settings.Global.getFloat(resolver,android.provider.Settings.Global.ANIMATOR_DURATION_SCALE,1f);
      return window==0f&&transition==0f&&animator==0f;
    } catch(Exception ignored) { return false; }
  }

  private void syncSevenAndroidReducedMotion(final int attempt) {
    if(getBridge()==null||getBridge().getWebView()==null) {
      if(attempt<6)getWindow().getDecorView().postDelayed(() -> syncSevenAndroidReducedMotion(attempt+1),150L*(attempt+1));
      return;
    }
    final android.webkit.WebView webView=getBridge().getWebView();
    final boolean nativeReduced=sevenAndroidReducedMotionEnabled();
    final String js="(()=>{const p=window.SevenPerformance,css=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches),nativeReduced="+(nativeReduced?"true":"false")+";window.__sevenAndroidMotion={source:'ANDROID_GLOBAL_ANIMATION_SCALES',reducedMotion:nativeReduced};if(!p||!p.state)return false;p.state.reducedMotion=nativeReduced||css;if(p.applyTier)p.applyTier(p.state.tier);else if(document&&document.documentElement)document.documentElement.dataset.sevenReducedMotion=p.state.reducedMotion?'1':'0';return true})()";
    webView.evaluateJavascript(js,value -> {
      if(!"true".equals(value)&&attempt<6)webView.postDelayed(() -> syncSevenAndroidReducedMotion(attempt+1),150L*(attempt+1));
    });
  }

  @Override
  public void onResume() {
    super.onResume();
    syncSevenAndroidReducedMotion(0);
  }
`;
source=source.replace(/\n}\s*$/,bridge+"\n}\n");
fs.writeFileSync(MAIN,source);
console.log("android reduced-motion bridge: PASS (Android system animation scales -> SevenPerformance)");
