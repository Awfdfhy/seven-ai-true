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
  // The WebView global may be replaced while Capacitor finishes navigation, so a
  // resume sync is considered complete only after SevenPerformance itself is ready.
  private static final int SEVEN_MOTION_SYNC_MAX_ATTEMPTS=80;
  private static final long SEVEN_MOTION_SYNC_RETRY_MS=200L;

  private boolean sevenAndroidReducedMotionEnabled() {
    try {
      // Public Android animation authority on API 26+. This is more robust than
      // relying solely on direct Settings.Global reads on newer Android releases.
      if(android.os.Build.VERSION.SDK_INT>=android.os.Build.VERSION_CODES.O && !android.animation.ValueAnimator.areAnimatorsEnabled()) return true;
    } catch(Exception ignored) {}
    try {
      // Keep the exact global-scale witness as the compatibility path, including
      // API 24/25 where ValueAnimator.areAnimatorsEnabled() is unavailable.
      android.content.ContentResolver resolver=getContentResolver();
      float window=android.provider.Settings.Global.getFloat(resolver,android.provider.Settings.Global.WINDOW_ANIMATION_SCALE,1f);
      float transition=android.provider.Settings.Global.getFloat(resolver,android.provider.Settings.Global.TRANSITION_ANIMATION_SCALE,1f);
      float animator=android.provider.Settings.Global.getFloat(resolver,android.provider.Settings.Global.ANIMATOR_DURATION_SCALE,1f);
      return window==0f&&transition==0f&&animator==0f;
    } catch(Exception ignored) { return false; }
  }

  private void retrySevenAndroidReducedMotion(final int attempt) {
    if(attempt<SEVEN_MOTION_SYNC_MAX_ATTEMPTS) {
      getWindow().getDecorView().postDelayed(() -> syncSevenAndroidReducedMotion(attempt+1),SEVEN_MOTION_SYNC_RETRY_MS);
    }
  }

  private void syncSevenAndroidReducedMotion(final int attempt) {
    if(getBridge()==null||getBridge().getWebView()==null) {
      retrySevenAndroidReducedMotion(attempt);
      return;
    }
    final android.webkit.WebView webView=getBridge().getWebView();
    final boolean nativeReduced=sevenAndroidReducedMotionEnabled();
    final String js="(()=>{const p=window.SevenPerformance,css=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches),nativeReduced="+(nativeReduced?"true":"false")+";window.__sevenAndroidMotion={source:'ANDROID_GLOBAL_ANIMATION_SCALES',reducedMotion:nativeReduced};if(!p||!p.state||p.state.ready!==true)return false;p.state.reducedMotion=nativeReduced||css;if(p.applyTier)p.applyTier(p.state.tier);else if(document&&document.documentElement)document.documentElement.dataset.sevenReducedMotion=p.state.reducedMotion?'1':'0';return p.state.reducedMotion===(nativeReduced||css)&&document&&document.documentElement&&document.documentElement.dataset.sevenReducedMotion===(p.state.reducedMotion?'1':'0')})()";
    webView.evaluateJavascript(js,value -> {
      if(!"true".equals(value))retrySevenAndroidReducedMotion(attempt);
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
