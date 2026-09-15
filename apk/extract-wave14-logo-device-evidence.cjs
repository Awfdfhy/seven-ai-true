"use strict";
const fs=require("fs"),path=require("path");
const input=process.argv[2]||"/tmp/wave14-instrumentation.txt";
const root=path.resolve(__dirname,"..");
const outDir=path.join(root,"dist","logo-tournament","android-device");
const expected=new Set(["wave14-adaptive-icon.png","wave14-themed-icon.png","wave14-legacy-icon.png","wave14-device-proof.json"]);
const marker="INSTRUMENTATION_STATUS: wave14Evidence=";
if(!fs.existsSync(input))throw new Error(`instrumentation transcript missing: ${input}`);
const groups=new Map();
for(const line of fs.readFileSync(input,"utf8").split(/\r?\n/)){
  const at=line.indexOf(marker);if(at<0)continue;
  const value=line.slice(at+marker.length).trim();
  const p1=value.indexOf("|"),p2=value.indexOf("|",p1+1),p3=value.indexOf("|",p2+1);
  if(p1<1||p2<0||p3<0)throw new Error(`malformed Wave14 instrumentation evidence marker: ${value.slice(0,120)}`);
  const name=value.slice(0,p1),index=Number(value.slice(p1+1,p2)),total=Number(value.slice(p2+1,p3)),chunk=value.slice(p3+1);
  if(!expected.has(name))throw new Error(`unexpected Wave14 evidence file: ${name}`);
  if(!Number.isInteger(index)||!Number.isInteger(total)||index<1||total<1||index>total||total>512)throw new Error(`invalid Wave14 evidence chunk coordinates: ${name} ${index}/${total}`);
  if(!/^[A-Za-z0-9+/]*={0,2}$/.test(chunk))throw new Error(`invalid base64 evidence chunk: ${name} ${index}/${total}`);
  const g=groups.get(name)||{total,chunks:new Map()};
  if(g.total!==total)throw new Error(`Wave14 evidence total drift: ${name}`);
  if(g.chunks.has(index)&&g.chunks.get(index)!==chunk)throw new Error(`conflicting Wave14 evidence chunk: ${name} ${index}`);
  g.chunks.set(index,chunk);groups.set(name,g);
}
fs.mkdirSync(outDir,{recursive:true});
for(const name of expected){
  const g=groups.get(name);if(!g)throw new Error(`Wave14 evidence absent from instrumentation transcript: ${name}`);
  if(g.chunks.size!==g.total)throw new Error(`Wave14 evidence incomplete: ${name} ${g.chunks.size}/${g.total}`);
  let b64="";for(let i=1;i<=g.total;i++){if(!g.chunks.has(i))throw new Error(`Wave14 evidence missing chunk: ${name} ${i}/${g.total}`);b64+=g.chunks.get(i)}
  if(b64.length%4!==0)throw new Error(`Wave14 evidence base64 length invalid: ${name}`);
  const bytes=Buffer.from(b64,"base64");if(bytes.length===0)throw new Error(`Wave14 evidence decoded empty: ${name}`);
  if(name.endsWith(".png")&&!(bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4e&&bytes[3]===0x47&&bytes[4]===0x0d&&bytes[5]===0x0a&&bytes[6]===0x1a&&bytes[7]===0x0a))throw new Error(`Wave14 evidence PNG signature invalid: ${name}`);
  fs.writeFileSync(path.join(outDir,name),bytes);
}
const proof=JSON.parse(fs.readFileSync(path.join(outDir,"wave14-device-proof.json"),"utf8"));
if(proof.schema!=="seven.wave14.device-capture.v1"||proof.packageName!=="ai.seven.app"||proof.evidenceTransportPackage!=="ai.seven.app.test"||proof.evidenceTransportMode!=="instrumentation-status-bundle"||Number(proof.apiLevel)<33)throw new Error(`Wave14 reconstructed device proof invalid: ${JSON.stringify(proof)}`);
console.log(`Wave14 instrumentation evidence reconstruction: PASS (${[...expected].map(n=>`${n}:${fs.statSync(path.join(outDir,n)).size}`).join(", ")})`);
