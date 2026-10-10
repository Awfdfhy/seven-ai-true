import {chromium} from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const here=path.dirname(fileURLToPath(import.meta.url));
const out=path.resolve(here,"../artifacts/ui");
await fs.mkdir(out,{recursive:true});

const browser=await chromium.launch({headless:true});
async function shot(name,url,viewport,{fullPage=false}={}){
  const context=await browser.newContext({viewport,deviceScaleFactor:1});
  const page=await context.newPage();
  await page.goto(url,{waitUntil:"networkidle"});
  await page.screenshot({path:path.join(out,name+".png"),fullPage});
  await context.close();
}

const base=process.env.SEVEN_V3_UI_URL||"http://127.0.0.1:4173";
await shot("chat-desktop",base+"/preview.html",{width:1440,height:900});
await shot("chat-mobile",base+"/preview.html",{width:390,height:844});
await shot("chat-compact",base+"/preview.html",{width:320,height:720});

for(const name of ["settings","coding","selfdev","research","rpg"]){
  await shot(name+"-desktop",base+"/surface.html?name="+name,{width:1280,height:800});
  await shot(name+"-mobile",base+"/surface.html?name="+name,{width:390,height:844});
}
await shot("rpg-arabic-mobile",base+"/surface.html?name=rpg&rtl=1",{width:390,height:844});
await shot("selfdev-arabic-mobile",base+"/surface.html?name=selfdev&rtl=1",{width:390,height:844});
await browser.close();
