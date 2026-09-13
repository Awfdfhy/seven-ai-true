const fs=require('fs');
const path=require('path');
const sharp=require('sharp');
const ROOT=path.resolve(__dirname,'..');
const HTML=path.join(ROOT,'seven_ai-final.html');
const OUT=path.join(ROOT,'assets');

(async()=>{
  const html=fs.readFileSync(HTML,'utf8');
  const marker='href="data:image/png;base64,';
  const start=html.indexOf(marker);
  if(start<0)throw new Error('embedded app icon missing');
  const from=start+marker.length;
  const end=html.indexOf('"',from);
  if(end<0)throw new Error('embedded app icon malformed');
  const png=Buffer.from(html.slice(from,end),'base64');
  fs.rmSync(OUT,{recursive:true,force:true});
  fs.mkdirSync(OUT,{recursive:true});
  await sharp(png).resize(1024,1024,{fit:'contain'}).png().toFile(path.join(OUT,'logo.png'));
  console.log('android visual assets: PASS');
})().catch(e=>{console.error(e);process.exit(1)});
