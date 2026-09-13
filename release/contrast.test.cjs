const fs=require('fs');
const path=require('path');
const assert=require('assert/strict');
const css=fs.readFileSync(path.join(__dirname,'seven-final.css'),'utf8');

function hexToRgb(hex){
  const h=hex.replace('#','');
  return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255);
}
function luminance(hex){
  const rgb=hexToRgb(hex).map(c=>c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4));
  return 0.2126*rgb[0]+0.7152*rgb[1]+0.0722*rgb[2];
}
function contrast(a,b){
  const x=luminance(a),y=luminance(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);
}
function vars(selector){
  const escaped=selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const match=css.match(new RegExp(escaped+'\\{([^}]*)\\}'));
  assert.ok(match,'missing CSS block '+selector);
  const out={};
  for(const m of match[1].matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{6})/g))out[m[1]]=m[2].toLowerCase();
  return out;
}
function expectPair(name,fg,bg,min=4.5){
  const value=contrast(fg,bg);assert.ok(value>=min,`${name} contrast ${value.toFixed(2)} < ${min}`);console.log(`PASS ${name} ${value.toFixed(2)}:1`);
}

const light=vars('body.light');
const dark=vars('body:not(.light)');
expectPair('light accent action',light['--seven-on-accent'],light['--accent']);
expectPair('light danger action',light['--seven-on-danger'],light['--danger']);
expectPair('light muted text',light['--muted'],'#ffffff');
expectPair('dark accent action',dark['--seven-on-accent'],dark['--accent']);
expectPair('dark danger action',dark['--seven-on-danger'],dark['--danger']);
expectPair('dark muted text',dark['--muted'],'#121026');
console.log('contrast gate: PASS');
