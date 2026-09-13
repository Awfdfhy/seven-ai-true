'use strict';
const fs=require('fs');const path=require('path');const root=path.resolve(__dirname,'..'),target=path.join(root,'android');if(!target.startsWith(root+path.sep))throw new Error('unsafe android cleanup path');fs.rmSync(target,{recursive:true,force:true});console.log('android generated directory cleaned');
