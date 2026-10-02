const fs=require('fs');
const path=require('path');
const sharp=require('sharp');
const ROOT=path.resolve(__dirname,'..');
const OUT=path.join(ROOT,'assets');
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

(async()=>{
  // Android launcher branding must never silently fall back to the legacy icon
  // embedded in the protected HTML. Until a final export manifest exists, the
  // canonical Seven gradient vector in release/brand is the authoritative icon.
  const source=readCanonicalLauncherIcon();
  fs.rmSync(OUT,{recursive:true,force:true});
  fs.mkdirSync(OUT,{recursive:true});
  await sharp(source.bytes,{density:384}).resize(1024,1024,{fit:'contain'}).png().toFile(path.join(OUT,'logo.png'));
  if(source.plan)fs.writeFileSync(path.join(OUT,'brand-consumption-plan.json'),JSON.stringify(source.plan,null,2));
  fs.writeFileSync(path.join(OUT,'launcher-brand-source.json'),JSON.stringify({mode:source.mode,canonical:'release/brand/seven-night-black.svg'},null,2));
  console.log(`android visual assets: PASS (${source.mode})`);
})().catch(e=>{console.error(e);process.exit(1)});
