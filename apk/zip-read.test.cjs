'use strict';
// Regression tests for the dependency-free APK/ZIP reader.
//
// verify-apk.cjs previously shelled out to `unzip`, a POSIX-only tool, so APK verification could
// never run on Windows. These tests build real archives (STORED and DEFLATE) and read them back so
// the replacement is proven against actual ZIP structure rather than a mocked reader.
const assert=require('assert/strict');
const fs=require('fs'),os=require('os'),path=require('path'),zlib=require('zlib'),crypto=require('crypto');
const zipRead=require('./zip-read.cjs');

// --- tiny ZIP writer, used only to produce fixtures -------------------------------------------
function crc32(buffer){
  let c,crc=0xffffffff;
  for(let n=0;n<buffer.length;n++){
    c=(crc^buffer[n])&0xff;
    for(let k=0;k<8;k++)c=c&1?(c>>>1)^0xedb88320:c>>>1;
    crc=c^(crc>>>8);
  }
  return (crc^0xffffffff)>>>0;
}
function makeZip(files){
  const locals=[],centrals=[];let offset=0;
  for(const f of files){
    const name=Buffer.from(f.name,'utf8'),data=Buffer.from(f.data);
    const deflated=f.deflate?zlib.deflateRawSync(data):data;
    const method=f.deflate?8:0;
    const crc=crc32(data);
    const lh=Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50,0);lh.writeUInt16LE(20,4);lh.writeUInt16LE(0,6);
    lh.writeUInt16LE(method,8);lh.writeUInt32LE(crc,14);
    lh.writeUInt32LE(deflated.length,18);lh.writeUInt32LE(data.length,22);
    lh.writeUInt16LE(name.length,26);lh.writeUInt16LE(0,28);
    locals.push(lh,name,deflated);
    const ch=Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50,0);ch.writeUInt16LE(20,4);ch.writeUInt16LE(20,6);
    ch.writeUInt16LE(method,10);ch.writeUInt32LE(crc,16);
    ch.writeUInt32LE(deflated.length,20);ch.writeUInt32LE(data.length,24);
    ch.writeUInt16LE(name.length,28);ch.writeUInt32LE(offset,42);
    centrals.push(ch,name);
    offset+=lh.length+name.length+deflated.length;
  }
  const centralBuf=Buffer.concat(centrals);
  const eocd=Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50,0);
  eocd.writeUInt16LE(files.length,8);eocd.writeUInt16LE(files.length,10);
  eocd.writeUInt32LE(centralBuf.length,12);eocd.writeUInt32LE(offset,16);
  return Buffer.concat([...locals,centralBuf,eocd]);
}

const dir=fs.mkdtempSync(path.join(os.tmpdir(),'zipread-'));
try{
  // 1. STORED and DEFLATE entries both round-trip byte-for-byte.
  const stored='stored payload 世界',deflated=('deflate me '.repeat(200));
  const zipPath=path.join(dir,'mixed.zip');
  fs.writeFileSync(zipPath,makeZip([
    {name:'stored.txt',data:stored},
    {name:'deflated.txt',data:deflated,deflate:true},
    {name:'nested/dir/file.txt',data:'nested'}
  ]));
  const a=zipRead.open(zipPath);
  assert.equal(a.read('stored.txt').toString('utf8'),stored,'STORED entry must round-trip exactly');
  assert.equal(a.read('deflated.txt').toString('utf8'),deflated,'DEFLATE entry must round-trip exactly');
  assert.equal(a.read('nested/dir/file.txt').toString('utf8'),'nested','nested paths must be addressable');

  // 2. Listing exposes every entry name (the property verify-apk.cjs depends on).
  const listing=a.listing();
  for(const n of ['stored.txt','deflated.txt','nested/dir/file.txt'])assert.ok(listing.includes(n),'listing must include '+n);

  // 3. has() / names() behave.
  assert.equal(a.has('stored.txt'),true);
  assert.equal(a.has('absent.txt'),false);
  assert.deepEqual(a.names().sort(),['deflated.txt','nested/dir/file.txt','stored.txt']);

  // 4. A missing entry must throw rather than return empty content -- a silent empty read would
  //    let the APK gate pass on absent payloads.
  assert.throws(()=>a.read('absent.txt'),/APK payload missing/);

  // 5. Non-ZIP input is rejected with a clear error, not a confusing crash.
  const badPath=path.join(dir,'not.zip');
  fs.writeFileSync(badPath,Buffer.from('this is definitely not a zip archive'));
  assert.throws(()=>zipRead.open(badPath),/not a ZIP archive/);

  // 6. Corrupt/truncated archive is rejected.
  const truncated=fs.readFileSync(zipPath).subarray(0,40);
  const truncPath=path.join(dir,'trunc.zip');
  fs.writeFileSync(truncPath,truncated);
  assert.throws(()=>zipRead.open(truncPath),/not a ZIP archive/);

  // 7. Large-ish binary payload (the real APK has ~1MB entries) survives intact.
  const big=crypto.randomBytes(1024*1024);
  const bigPath=path.join(dir,'big.zip');
  fs.writeFileSync(bigPath,makeZip([{name:'big.bin',data:big,deflate:true}]));
  const bigRead=zipRead.open(bigPath).read('big.bin');
  assert.equal(bigRead.length,big.length,'1MB binary entry must round-trip at full length');
  assert.ok(bigRead.equals(big),'1MB binary entry must be byte-identical');

  // 8. An unsupported compression method is reported, never silently mishandled.
  //    The reader takes the method from the CENTRAL directory record (signature 0x02014b50),
  //    so that is the offset that must be patched -- not the local file header.
  const method9=makeZip([{name:'ok.txt',data:'fine'}]);
  const centralOffset=method9.indexOf(Buffer.from([0x50,0x4b,0x01,0x02]));
  assert.ok(centralOffset>0,'central directory signature must be present in the fixture');
  method9.writeUInt16LE(9,centralOffset+10);
  const m9=path.join(dir,'m9.zip');
  fs.writeFileSync(m9,method9);
  assert.throws(()=>zipRead.open(m9).read('ok.txt'),/unsupported ZIP compression method/);

  console.log('APK zip reader: PASS (stored + deflate round-trip, nested paths, listing, missing entry, non-zip, truncated, 1MB binary, unsupported method)');
}finally{
  fs.rmSync(dir,{recursive:true,force:true});
}