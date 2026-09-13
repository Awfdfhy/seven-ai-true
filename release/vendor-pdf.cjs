const fs=require('fs');
const path=require('path');

const ROOT=path.resolve(__dirname,'..');
const DIST=path.join(ROOT,'dist');
const TARGET=path.join(DIST,'vendor','pdfjs');

function copyDir(source,target){
  fs.mkdirSync(target,{recursive:true});
  for(const entry of fs.readdirSync(source,{withFileTypes:true})){
    const from=path.join(source,entry.name),to=path.join(target,entry.name);
    if(entry.isDirectory())copyDir(from,to);else if(entry.isFile())fs.copyFileSync(from,to);
  }
}
function dirBytes(dir){
  let total=0;
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,entry.name);total+=entry.isDirectory()?dirBytes(p):fs.statSync(p).size;
  }
  return total;
}
function vendorPdf(){
  let packagePath;
  try{packagePath=require.resolve('pdfjs-dist/package.json',{paths:[ROOT]});}
  catch(_){throw new Error('pdfjs-dist is required for a release build. Install pdfjs-dist@4.10.38 before building.');}
  const base=path.dirname(packagePath);
  const sourcePdf=path.join(base,'build','pdf.min.mjs');
  const sourceWorker=path.join(base,'build','pdf.worker.min.mjs');
  const sourceCmaps=path.join(base,'cmaps');
  for(const required of [sourcePdf,sourceWorker,sourceCmaps])if(!fs.existsSync(required))throw new Error('pdfjs-dist asset missing: '+required);
  fs.rmSync(TARGET,{recursive:true,force:true});
  fs.mkdirSync(TARGET,{recursive:true});
  fs.copyFileSync(sourcePdf,path.join(TARGET,'pdf.min.mjs'));
  fs.copyFileSync(sourceWorker,path.join(TARGET,'pdf.worker.min.mjs'));
  copyDir(sourceCmaps,path.join(TARGET,'cmaps'));
  return {
    version:require(packagePath).version,
    bytes:dirBytes(TARGET),
    module:'./vendor/pdfjs/pdf.min.mjs',
    worker:'./vendor/pdfjs/pdf.worker.min.mjs',
    cmaps:'./vendor/pdfjs/cmaps/'
  };
}

if(require.main===module)console.log(JSON.stringify(vendorPdf(),null,2));
module.exports={vendorPdf,TARGET};
