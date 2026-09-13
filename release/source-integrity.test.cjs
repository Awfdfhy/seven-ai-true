const assert=require('assert/strict');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');

const sourcePath=path.join(__dirname,'..','seven_ai-final.html');
const expectedBytes=658133;
const expectedGitBlob='3e8dfa8e7da7124e16504140eb9631c10cabf053';
const data=fs.readFileSync(sourcePath);
const gitBlob=crypto.createHash('sha1').update(Buffer.from(`blob ${data.length}\0`)).update(data).digest('hex');

assert.equal(data.length,expectedBytes,'seven_ai-final.html byte size changed: source lock violated');
assert.equal(gitBlob,expectedGitBlob,'seven_ai-final.html content changed: source lock violated');
console.log(`source integrity lock: PASS (${data.length} bytes, ${gitBlob})`);
