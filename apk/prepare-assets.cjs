const fs=require('fs');
const path=require('path');
const sharp=require('sharp');

const ROOT=path.resolve(__dirname,'..');
const SVG=path.join(ROOT,'release','seven-mark.svg');
const OUT=path.join(ROOT,'assets');

(async()=>{
  if(!fs.existsSync(SVG))throw new Error('Seven identity mark missing: '+SVG);
  const svg=fs.readFileSync(SVG);
  fs.rmSync(OUT,{recursive:true,force:true});
  fs.mkdirSync(OUT,{recursive:true});

  // Transparent vector-derived foreground. Capacitor Assets supplies the
  // platform background, so the mark remains crisp across Android masks.
  await sharp(svg,{density:384})
    .resize(1024,1024,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}})
    .png()
    .toFile(path.join(OUT,'logo.png'));

  // Splash keeps the same identity without loading the WebView or old favicon.
  await sharp(svg,{density:384})
    .resize(560,560,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}})
    .extend({top:232,bottom:232,left:232,right:232,background:{r:8,g:9,b:16,alpha:1}})
    .png()
    .toFile(path.join(OUT,'splash.png'));

  console.log('android visual assets: PASS (Seven celestial mark, vector source)');
})().catch(e=>{console.error(e);process.exit(1)});
