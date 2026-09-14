const fs=require('fs');
const path=require('path');
const sharp=require('sharp');
const brand=require('../release/brand-asset-contract.cjs');
const ROOT=path.resolve(__dirname,'..');
const HTML=path.join(ROOT,'seven_ai-final.html');
const OUT=path.join(ROOT,'assets');
const BRAND_MANIFEST=path.join(ROOT,'brand','final','brand-export.json');

function readLegacyEmbeddedIcon(){
  const html=fs.readFileSync(HTML,'utf8');
  const marker='href="data:image/png;base64,';
  const start=html.indexOf(marker);
  if(start<0)throw new Error('embedded app icon missing');
  const from=start+marker.length;
  const end=html.indexOf('"',from);
  if(end<0)throw new Error('embedded app icon malformed');
  return {bytes:Buffer.from(html.slice(from,end),'base64'),mode:'LEGACY_EMBEDDED',plan:null};
}

function readApprovedBrandIcon(){
  if(!fs.existsSync(BRAND_MANIFEST))return null;
  const manifest=brand.loadBrandExportManifest(BRAND_MANIFEST,{root:ROOT,requireFiles:true});
  const item=brand.chooseBrandAsset(manifest,'MASTER_VECTOR');
  const plan=brand.createConsumptionPlan({manifest,root:ROOT});
  return {bytes:fs.readFileSync(path.join(ROOT,item.path)),mode:'APPROVED_BRAND_EXPORT',plan};
}

(async()=>{
  const source=readApprovedBrandIcon()||readLegacyEmbeddedIcon();
  fs.rmSync(OUT,{recursive:true,force:true});
  fs.mkdirSync(OUT,{recursive:true});
  await sharp(source.bytes).resize(1024,1024,{fit:'contain'}).png().toFile(path.join(OUT,'logo.png'));
  if(source.plan)fs.writeFileSync(path.join(OUT,'brand-consumption-plan.json'),JSON.stringify(source.plan,null,2));
  console.log(`android visual assets: PASS (${source.mode})`);
})().catch(e=>{console.error(e);process.exit(1)});
