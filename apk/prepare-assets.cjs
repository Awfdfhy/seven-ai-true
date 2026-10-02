const fs=require('fs');
const path=require('path');
const sharp=require('sharp');
const brand=require('../release/brand-asset-contract.cjs');
const ROOT=path.resolve(__dirname,'..');
const OUT=path.join(ROOT,'assets');
const BRAND_MANIFEST=path.join(ROOT,'brand','final','brand-export.json');
const CANONICAL_LAUNCHER=path.join(ROOT,'release','brand','seven-night-black.svg');

function readCanonicalLauncherIcon(){
  if(!fs.existsSync(CANONICAL_LAUNCHER))throw new Error('canonical Seven launcher icon missing: '+CANONICAL_LAUNCHER);
  const bytes=fs.readFileSync(CANONICAL_LAUNCHER);
  const text=bytes.toString('utf8');
  for(const token of ['#32BECF','#4166F5','#263CFF','#8265DC','#0A1022']){
    if(!text.includes(token))throw new Error('canonical Seven launcher icon failed identity check: '+token);
  }
  return {bytes,mode:'CANONICAL_SEVEN_GRADIENT',plan:null};
}

function readApprovedBrandIcon(){
  if(!fs.existsSync(BRAND_MANIFEST))return null;
  const manifest=brand.loadBrandExportManifest(BRAND_MANIFEST,{root:ROOT,requireFiles:true});
  const item=brand.chooseBrandAsset(manifest,'MASTER_VECTOR');
  const plan=brand.createConsumptionPlan({manifest,root:ROOT});
  return {bytes:fs.readFileSync(path.join(ROOT,item.path)),mode:'APPROVED_BRAND_EXPORT',plan};
}

(async()=>{
  // Android launcher branding must never silently fall back to the legacy icon
  // embedded in the protected HTML. Until a final export manifest exists, the
  // canonical Seven gradient vector in release/brand is the authoritative icon.
  const source=readApprovedBrandIcon()||readCanonicalLauncherIcon();
  fs.rmSync(OUT,{recursive:true,force:true});
  fs.mkdirSync(OUT,{recursive:true});
  await sharp(source.bytes,{density:384}).resize(1024,1024,{fit:'contain'}).png().toFile(path.join(OUT,'logo.png'));
  if(source.plan)fs.writeFileSync(path.join(OUT,'brand-consumption-plan.json'),JSON.stringify(source.plan,null,2));
  fs.writeFileSync(path.join(OUT,'launcher-brand-source.json'),JSON.stringify({mode:source.mode,canonical:'release/brand/seven-night-black.svg'},null,2));
  console.log(`android visual assets: PASS (${source.mode})`);
})().catch(e=>{console.error(e);process.exit(1)});
