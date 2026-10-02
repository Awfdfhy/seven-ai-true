"use strict";
const fs=require("fs");
const path=require("path");
const zlib=require("zlib");
const crypto=require("crypto");
const ROOT=path.resolve(__dirname);
const SOURCE=path.join(ROOT,"remake-source");
const OUT=path.join(ROOT,"workspaces");
const FILES=Object.freeze({
  "remake.css":"c2d78d4aeea97e2c54af3b2c3a4767fbda01c39bcd6b5b3f2b3063189af88ea3",
  "remake.js":"c0aeb663870be9230e846e386a12a55670be1dbbb2b9471847d604a775da685c",
  "intelligence.js":"1722898990b11364d225bb80a50bebb3acdd919437f411321644496ecadfe647",
  "research-v2.js":"54762228cc8d7ef19f92d57ac7b39e6457d11d7e46b04e1d2b70c68390fbb3f8"
});
function sha(b){return crypto.createHash("sha256").update(b).digest("hex");}
function materializeRemakeAssets(){
  fs.mkdirSync(OUT,{recursive:true});
  const result=[];
  for(const [name,expected] of Object.entries(FILES)){
    const source=path.join(SOURCE,name+".gz");
    if(!fs.existsSync(source))throw new Error("Seven UI Remake source missing: "+source);
    const raw=zlib.gunzipSync(fs.readFileSync(source));
    const actual=sha(raw);
    if(actual!==expected)throw new Error("Seven UI Remake integrity mismatch for "+name);
    fs.writeFileSync(path.join(OUT,name),raw);
    result.push({name,bytes:raw.length,sha256:actual});
  }
  return result;
}
if(require.main===module){
  const out=materializeRemakeAssets();
  console.log("Seven UI Remake materialization: PASS ("+out.map(x=>x.name+":"+x.bytes).join(", ")+")");
}
module.exports=Object.freeze({FILES,materializeRemakeAssets});
