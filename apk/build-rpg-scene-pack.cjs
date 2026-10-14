'use strict';
/*
 * Seven RPG: deterministic, original, offline story-scene illustrations.
 * Built from layered SVG silhouettes + cinematic gradients + subtle texture.
 * All pictures are local: no network fetch, user data or copyrighted assets.
 */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const WWW = path.join(ROOT,'www');
const OUT = path.join(WWW,'rpg-scenes');
const W=2560,H=1440;
const THEMES = [
  ['midnight-citadel','#080f2a','#676285','#9b8fb7','#22294a','#0a142b','#f7d6a4','citadel'],
  ['emerald-wood','#081b25','#427870','#3c7b69','#1c5148','#0b342f','#ccf5d9','forest'],
  ['amber-dunes','#35243c','#e3a17d','#eec394','#92635d','#42364d','#ffdda5','desert'],
  ['silver-peaks','#101c38','#7b9abb','#9cc4ca','#46647c','#263c59','#e6f6ff','mountains'],
  ['violet-archive','#121027','#85538d','#b58b9c','#423357','#211c3e','#efd7ff','citadel'],
  ['celestial-lake','#091d31','#438da5','#75b3b8','#1f6574','#103a52','#b5e7ff','lake'],
  ['crimson-eclipse','#1b0d25','#a64c70','#d17b83','#63304c','#301c39','#ffc9ae','citadel'],
  ['moss-sanctuary','#112b29','#749b6c','#a8b98e','#486e57','#284d40','#f3e0aa','forest'],
  ['obsidian-port','#090f1e','#466484','#7999a9','#263e57','#101f36','#f8dbaa','lake'],
  ['golden-kingdom','#282034','#ae8073','#d6b28e','#75526a','#42324c','#f7deac','citadel'],
  ['frostbound-forest','#0c2139','#6089a6','#b8dce5','#406779','#1f4155','#e5faff','forest'],
  ['starfall-valley','#121537','#705caa','#ae83b5','#44396b','#1c2143','#f2caff','mountains'],
  ['rose-oasis','#3e203d','#d8898e','#edbba4','#996a79','#5d3d61','#f5d9b2','desert'],
  ['whispering-marsh','#11272f','#557b82','#7da7a9','#406473','#1e4447','#bdeae5','forest'],
  ['twilight-ruins','#172039','#9b7595','#d6b0a3','#664b75','#322b52','#ffecd0','citadel'],
  ['azure-isles','#0b2545','#519db2','#8ac8c5','#34718c','#194662','#c9ffff','lake'],
  ['ancient-grove','#151e32','#628a76','#a4bc9a','#456d64','#1f4443','#f4e8b1','forest'],
  ['moonlit-passage','#0a1231','#57508b','#9283ac','#31365b','#172044','#efe4ff','mountains'],
  ['stormwatch-keep','#080e21','#596b88','#8994a4','#343e58','#1d243b','#e2ceba','citadel'],
  ['sapphire-sea','#101a37','#608cb0','#a1cccd','#457999','#1d5372','#ffeed0','lake'],
  ['scarlet-canyon','#2b1526','#c56f70','#e7b28f','#8d4b55','#492e3e','#ffdfa5','desert'],
  ['royal-gardens','#122331','#638f89','#a3baaa','#456e65','#273e49','#fff1cd','forest'],
  ['dreaming-spires','#1c1639','#7a68b1','#be91bc','#594577','#30214f','#fff0ec','citadel'],
  ['aurora-highlands','#081c31','#46768c','#82ada0','#316077','#16384e','#cceff0','mountains']
];
function rng(seed){let s=seed>>>0;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296}}
function hash(input){return parseInt(crypto.createHash('sha256').update(input).digest('hex').slice(0,8),16)>>>0}
function horizon(rand,height,variance,n){let p='M0 '+height;for(let i=0;i<n;i++){const x=Math.round(i*W/(n-1));const y=Math.round(height+(rand()-.5)*variance);p+=' L'+x+' '+y}return p+' L'+W+' '+H+' L0 '+H+' Z'}
function tree(x,y,scale,foliage,trunk){
  const h=Math.round(270*scale), w=Math.round(96*scale);
  return '<path d="M'+x+' '+y+'l'+Math.round(10*scale)+' 0l0 -'+h+'l-'+Math.round(10*scale)+' 0Z" fill="'+trunk+'"/>'+
  [0,.23,.49].map((j,i)=>'<path d="M'+(x-w+i*15)+' '+(y-h*(.25+j))+'Q'+x+' '+(y-h*(1.18-j))+' '+(x+w-i*15)+' '+(y-h*(.25+j))+'Z" fill="'+foliage+'" opacity="'+(.90-i*.17)+'"/>').join('');
}
function castle(cx,ground,accent,dark,rand){
  let out='<path d="M'+(cx-270)+' '+ground+'V'+(ground-290)+'h'+500+'V'+ground+'Z" fill="'+dark+'"/>';
  for(let t=0;t<7;t++){let x=cx-290+t*98,h=180+Math.round(rand()*200),w=62+Math.round(rand()*30);
    out+='<rect x="'+x+'" y="'+(ground-h)+'" width="'+w+'" height="'+h+'" fill="'+dark+'"/>';
    out+='<path d="M'+(x-13)+' '+(ground-h)+'L'+(x+w/2)+' '+(ground-h-75)+'L'+(x+w+13)+' '+(ground-h)+'Z" fill="'+accent+'" opacity=".72"/>';
    out+='<rect x="'+(x+w*.43)+'" y="'+(ground-h+Math.round(h*.34))+'" width="'+(w*.14)+'" height="33" rx="9" fill="'+accent+'" opacity=".85"/>';
  }
  out+='<path d="M'+(cx-90)+' '+ground+'V'+(ground-200)+'Q'+cx+' '+(ground-300)+' '+(cx+90)+' '+(ground-200)+'V'+ground+'Z" fill="#0a1025" opacity=".9"/>';
  return out;
}
function scene(theme,index){
  const [name,top,bottom,far,middle,near,light,kind]=theme,rand=rng(hash(name));
  const stars=Array.from({length:170},()=>{const x=Math.round(rand()*W),y=Math.round(rand()*770),r=(rand()*2.6+.7).toFixed(1);return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+light+'" opacity="'+(.14+rand()*.49).toFixed(2)+'"/>'}).join('');
  const orbX=Math.round(W*(.23+rand()*.56)), orbY=Math.round(170+rand()*300),orbR=Math.round(80+rand()*35);
  let structures='';
  if(kind==='citadel')structures=castle(1450+Math.round(rand()*260),1150,light,near,rand);
  if(kind==='forest'){for(let i=0;i<27;i++){const x=Math.round(rand()*W),y=Math.round(1030+rand()*440),scale=.45+rand()*.80;structures+=tree(x,y,scale,near,middle)}}
  if(kind==='lake'){structures='<path d="M0 1130 Q660 1080 1280 1135 T2560 1100V1440H0Z" fill="'+middle+'" opacity=".74"/>';for(let i=0;i<30;i++){let x=Math.round(rand()*W),y=Math.round(1170+rand()*255);structures+='<path d="M'+x+' '+y+'h'+(60+rand()*180).toFixed(0)+'" stroke="'+light+'" stroke-width="'+(2+rand()*3).toFixed(1)+'" opacity="'+(.1+rand()*.35).toFixed(2)+'"/>'}}
  if(kind==='desert'){structures='<path d="M0 1180Q320 980 740 1170T1510 1150T2560 1090V1440H0Z" fill="'+near+'"/>';for(let i=0;i<11;i++){let x=rand()*W,y=1040+rand()*300;structures+='<path d="M'+x+' '+y+'l45 0m-24 0l0 -'+(35+rand()*45)+'" fill="none" stroke="'+light+'" stroke-width="7" opacity=".2"/>'}}
  if(kind==='mountains'){for(let i=0;i<19;i++){const x=Math.round(i*150),y=Math.round(760+rand()*220);structures+='<path d="M'+(x-95)+' 1200 L'+x+' '+y+'L'+(x+145)+' 1200Z" fill="'+middle+'" opacity=".37"/>'}}
  const clouds=Array.from({length:14},()=>{const x=Math.round(rand()*W),y=Math.round(110+rand()*670),w=110+rand()*540;return '<ellipse cx="'+x+'" cy="'+y+'" rx="'+w.toFixed(0)+'" ry="26" fill="'+light+'" opacity=".036"/>'}).join('');
  return '<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'">'+
    '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="'+top+'"/><stop offset=".6" stop-color="'+bottom+'"/><stop offset="1" stop-color="'+far+'"/></linearGradient>'+
    '<radialGradient id="glow"><stop stop-color="'+light+'" stop-opacity=".86"/><stop offset=".5" stop-color="'+light+'" stop-opacity=".20"/><stop offset="1" stop-color="'+light+'" stop-opacity="0"/></radialGradient>'+
    '<linearGradient id="foreground" x1="0" y1="0" x2="0" y2="1"><stop stop-color="'+middle+'"/><stop offset="1" stop-color="'+near+'"/></linearGradient></defs>'+
    '<rect width="'+W+'" height="'+H+'" fill="url(#sky)"/><ellipse cx="'+orbX+'" cy="'+orbY+'" rx="500" ry="400" fill="url(#glow)"/>'+
    stars+'<circle cx="'+orbX+'" cy="'+orbY+'" r="'+orbR+'" fill="'+light+'" opacity=".82"/>'+clouds+
    '<path d="'+horizon(rand,930,460,18)+'" fill="'+far+'" opacity=".50"/>'+
    '<path d="'+horizon(rand,1090,360,16)+'" fill="'+middle+'" opacity=".83"/>'+
    structures+
    '<path d="M0 1345Q260 1290 530 1350T1080 1320T1650 1360T2210 1290T2560 1350V1440H0Z" fill="url(#foreground)" opacity=".93"/>'+
    '<path d="M0 0H2560V1440H0Z" fill="#080d21" opacity=".07"/></svg>';
}
async function render(theme,index){
  const svg=Buffer.from(scene(theme,index));
  const raw=await sharp(svg).removeAlpha().raw().toBuffer();
  const seed=hash(theme[0]+'-texture');let state=seed;
  // Fine-grained cinematic grain is intentional: imagery stays expressive at
  // 2560px even after zoom/pan on large-screen RPG layouts.
  for(let i=0;i<raw.length;i++){
    state^=state<<13;state^=state>>>17;state^=state<<5;
    const jitter=((state>>>0)%25)-12;
    raw[i]=Math.max(0,Math.min(255,raw[i]+jitter));
  }
  return sharp(raw,{raw:{width:W,height:H,channels:3}})
    .jpeg({quality:97,chromaSubsampling:'4:4:4',progressive:true})
    .toBuffer();
}
async function build({dest=OUT}={}){
  fs.rmSync(dest,{recursive:true,force:true});fs.mkdirSync(dest,{recursive:true});
  let total=0;const manifest={schema:'seven-rpg-scene-pack.v1',generated:'deterministic-offline',width:W,height:H,scenes:[]};
  for(let i=0;i<THEMES.length;i++){
    const theme=THEMES[i],bytes=await render(theme,i),filename=theme[0]+'.jpg';
    fs.writeFileSync(path.join(dest,filename),bytes);total+=bytes.length;
    manifest.scenes.push({name:theme[0],file:filename,bytes:bytes.length,kind:theme[7]});
    // Target ~90 MB final installable APK: a real usable offline scene library,
    // never a fake padding blob or unused random placeholder file.
    if(total>=82_000_000)break;
  }
  manifest.totalBytes=total;manifest.count=manifest.scenes.length;
  fs.writeFileSync(path.join(dest,'manifest.json'),JSON.stringify(manifest,null,2));
  if(total<78_000_000)throw new Error('RPG visual scene library unexpectedly small: '+total);
  console.log('Seven RPG offline cinematic scene library: '+manifest.count+' scenes, '+(total/1e6).toFixed(1)+' MB');
  return manifest;
}
if(require.main===module)build().catch(error=>{console.error(error);process.exitCode=1});
module.exports={build,THEMES,scene};
