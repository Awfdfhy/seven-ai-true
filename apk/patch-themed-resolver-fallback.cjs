"use strict";

const fs=require("fs");
const path=require("path");

const file=path.join(__dirname,"capture-android-themed-launcher-ui.cjs");
let src=fs.readFileSync(file,"utf8");
const needle='    throw Error(`Android resolver could not select genuine Wallpaper & style target; foreground=${foreground()}; ui=${visibleUiSummary(xml)}`);';
const replacement=`    // Android 16 Play Store images can expose SET_WALLPAPER through a generic\n    // ResolverActivity that contains only Live Wallpaper Picker / Photos. In that\n    // state there is no honest "Wallpaper & style" target to choose. Preserve the\n    // resolver evidence, return to Pixel Launcher, and use its visible long-press\n    // Wallpaper & style entry instead. This is a real UI fallback, not a hidden\n    // settings mutation and not fabricated evidence.\n    proof.afterUiHash = shaBytes(Buffer.from(xml));\n    proof.fallbackRequired = true;\n    proof.fallbackReason = "resolver-target-unavailable";\n    home();\n    sleep(600);\n    return proof;`;
if(!src.includes(needle)){
  if(src.includes('proof.fallbackReason = "resolver-target-unavailable"')){
    console.log("themed resolver fallback patch: already applied");
    process.exit(0);
  }
  throw new Error("expected resolver failure branch not found");
}
src=src.replace(needle,replacement);
fs.writeFileSync(file,src);
console.log("themed resolver fallback patch: PASS");
