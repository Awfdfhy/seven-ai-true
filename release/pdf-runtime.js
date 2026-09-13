(function(root){
  'use strict';
  if(!root)return;
  let pending=null;
  async function load(){
    if(root.pdfjsLib&&typeof root.pdfjsLib.getDocument==='function')return root.pdfjsLib;
    if(pending)return pending;
    pending=import('./vendor/pdfjs/pdf.min.mjs').then(lib=>{
      lib.GlobalWorkerOptions.workerSrc='./vendor/pdfjs/pdf.worker.min.mjs';
      root.pdfjsLib=lib;
      return lib;
    }).catch(error=>{pending=null;throw error;});
    return pending;
  }
  root.SevenPdf={load,get loaded(){return !!(root.pdfjsLib&&typeof root.pdfjsLib.getDocument==='function');}};
})(typeof globalThis!=='undefined'?globalThis:this);
