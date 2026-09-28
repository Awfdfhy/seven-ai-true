const assert=require('assert/strict');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');

const sourcePath=path.join(__dirname,'..','seven_ai-final.html');
const expectedBytes=669670;
const expectedGitBlob='8664cc2d5ba762c638a07f2a7f47f13f9eaabae4';
const data=fs.readFileSync(sourcePath);
const gitBlob=crypto.createHash('sha1').update(Buffer.from(`blob ${data.length}\0`)).update(data).digest('hex');

assert.equal(data.length,expectedBytes,'seven_ai-final.html byte size changed: source lock violated');
assert.equal(gitBlob,expectedGitBlob,'seven_ai-final.html content changed: source lock violated');
console.log(`source integrity lock: PASS (${data.length} bytes, ${gitBlob})`);
