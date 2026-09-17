"use strict";
const {chromium}=require("playwright");
const http=require("http");
const fs=require("fs"),path=require("path"),assert=require("assert/strict");
const {build}=require("./build-release.cjs");

(async()=>{
  const built=build(),html=fs.readFileSync(built.output,"utf8"),dist=path.dirname(built.output);
  const server=http.createServer((req,res)=>{
    const pathname=new URL(req.url,"http://127.0.0.1").pathname;
    const isAsset=pathname.startsWith("/vendor/")||pathname.startsWith("/brand/")||pathname.startsWith("/workspaces/")||pathname==="/attachment-runtime.js";
    if(isAsset){
      const file=path.resolve(dist,"."+pathname);
      if(!file.startsWith(path.resolve(dist)+path.sep)||!fs.existsSync(file)){res.statusCode=404;res.end("not found");return;}
      const type=file.endsWith(".svg")?"image/svg+xml":file.endsWith(".css")?"text/css; charset=utf-8":file.endsWith(".js")||file.endsWith(".mjs")?"text/javascript; charset=utf-8":"application/octet-stream";
      res.setHeader("Content-Type",type);
      fs.createReadStream(file).pipe(res);return;
    }
    res.setHeader("Content-Type","text/html; charset=utf-8");res.end(html);
  });
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  const origin="http://127.0.0.1:"+server.address().port;
  const browser=await chromium.launch({headless:true});
  try{
    const context=await browser.newContext({viewport:{width:390,height:844},userAgent:"Mozilla/5.0 (Linux; Android 14; TECNO LH7n) AppleWebKit/537.36 Chrome/126 Mobile Safari/537.36"});
    await context.route("**/*",route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    const page=await context.newPage(),errors=[],requests=[];page.on("pageerror",e=>errors.push(e.message));page.on('request',q=>requests.push(new URL(q.url()).pathname));
    await page.goto(origin,{waitUntil:"domcontentloaded"});
    await page.waitForFunction(()=>window.SevenAttachmentLoader&&window.SevenBetaUI&&SevenBetaUI.state.ready,{timeout:10000});
    const cold=await page.evaluate(()=>({loader:!!window.SevenAttachmentLoader,runtime:!!window.SevenAttachments}));
    assert.equal(cold.loader,true);assert.equal(cold.runtime,false,"full attachment runtime must not load before intent");assert.equal(requests.includes('/attachment-runtime.js'),false);
    await page.evaluate(()=>{const m=document.getElementById("nameModal");if(m)m.style.display="none"});
    await page.click('.composer-tools .tool-btn:not(.toggle)');
    await page.waitForFunction(()=>window.SevenAttachments&&SevenAttachments.state.ready,{timeout:10000});
    assert.equal(requests.filter(x=>x==='/attachment-runtime.js').length,1,"attachment runtime must lazy-load exactly once");
    const base=await page.evaluate(()=>({version:SevenAttachments.version,accept:fileInput.accept,multiple:fileInput.multiple,menu:document.querySelectorAll(".seven-attach-menu").length,photos:document.querySelectorAll('[data-seven-attach="photos"]').length,files:document.querySelectorAll('[data-seven-attach="files"]').length,style:!!document.getElementById("seven-attachment-style"),busy:document.querySelector('[data-seven-attach-trigger]')?.hasAttribute('aria-busy'),cats:[SevenAttachments.category(new File(["x"],"photo.webp",{type:"image/webp"})),SevenAttachments.category(new File(["x"],"pack.zip",{type:"application/zip"})),SevenAttachments.category(new File(["x"],"main.py",{type:"text/plain"})),SevenAttachments.category(new File(["x"],"deck.pptx",{type:"application/vnd.openxmlformats-officedocument.presentationml.presentation"}))]}));
    assert.equal(base.version,"1.2.0-beta.1");assert.equal(base.accept,"*/*");assert.equal(base.multiple,true);assert.equal(base.menu,1);assert.equal(base.photos,1);assert.equal(base.files,1);assert.equal(base.style,true);assert.equal(base.busy,false);assert.deepEqual(base.cats,["image","archive","text","presentation"]);
    if(await page.isVisible('.seven-attach-menu'))await page.keyboard.press('Escape');
    await page.click("[data-seven-attach-trigger]");assert.equal(await page.getAttribute("[data-seven-attach-trigger]","aria-expanded"),"true");assert.equal(await page.isVisible(".seven-attach-menu"),true);await page.keyboard.press("Escape");assert.equal(await page.getAttribute("[data-seven-attach-trigger]","aria-expanded"),"false");
    await page.setInputFiles("#fileInput",[{name:"notes.md",mimeType:"text/markdown",buffer:Buffer.from("Seven attachment browser proof")},{name:"picture.png",mimeType:"image/png",buffer:Buffer.from([137,80,78,71])},{name:"bundle.zip",mimeType:"application/zip",buffer:Buffer.from([80,75,3,4])}]);
    await page.waitForFunction(()=>document.querySelectorAll(".seven-attachment-chip").length===3);
    const chips=await page.evaluate(()=>Array.from(document.querySelectorAll(".seven-attachment-chip")).map(x=>({kind:x.dataset.kind,text:x.textContent})));
    assert.deepEqual(chips.map(x=>x.kind),["text","image","archive"]);assert.match(chips[0].text,/notes\.md/);assert.match(chips[1].text,/picture\.png/);assert.match(chips[2].text,/bundle\.zip/);
    const extracted=await page.evaluate(async()=>{const text=await SevenAttachments.extractForKnowledge(new File(["hello seven"],"readme.txt",{type:"text/plain"}));const binary=await SevenAttachments.extractForKnowledge(new File([new Uint8Array([0,1,2,3])],"archive.zip",{type:"application/zip"}));return{text,binary}});
    assert.equal(extracted.text.method,"text_file");assert.equal(extracted.text.text,"hello seven");assert.equal(extracted.binary.method,"attachment_metadata_archive");assert.match(extracted.binary.text,/Binary format kept as an attachment/);assert.doesNotMatch(extracted.binary.text,/\u0000/);
    const width=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));assert.ok(width.sw<=width.cw+2,JSON.stringify(width));assert.deepEqual(errors,[]);
    await context.close();
    console.log("Universal attachment Android-browser test: PASS (lazy intent load)");
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(err=>{console.error(err);process.exit(1)});