"use strict";
const base=require("./project-file-fabric-passb-core.cjs");
function createProjectTransaction(input={}){
  if(!input.root||!input.root.backendId)throw new Error("transaction project root/backend required");
  const tx=base.createProjectTransaction(input);
  const body={...tx,backendId:input.root.backendId};
  delete body.id;
  return Object.freeze({...body,id:`project-tx-${base.hash({...body,history:undefined}).slice(0,24)}`});
}
module.exports=Object.freeze({...base,createProjectTransaction});