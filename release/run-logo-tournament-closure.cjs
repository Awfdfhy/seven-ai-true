"use strict";
const impl=require("./run-logo-tournament-closure-v2.cjs");
if(require.main===module){try{impl.main()}catch(e){console.error(e);process.exit(1)}}
module.exports=impl;
