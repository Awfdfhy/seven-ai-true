const assert=require('assert/strict');
const fs=require('fs');
const path=require('path');

const canonical=fs.readFileSync(path.join(__dirname,'seven-final.css'),'utf8');
const hardening=fs.readFileSync(path.join(__dirname,'ui-hardening.css'),'utf8');
const beta=fs.readFileSync(path.join(__dirname,'beta-ui.css'),'utf8');
const rtl=fs.readFileSync(path.join(__dirname,'workspaces','rtl.css'),'utf8');
const generated=fs.readFileSync(path.join(__dirname,'workspaces','generated-ui.css'),'utf8');
const tokenSources=canonical+hardening;

const required=[
 '--seven-space-1','--seven-space-9',
 '--seven-radius-sm','--seven-radius-md','--seven-radius-lg','--seven-radius-pill',
 '--seven-elev-1','--seven-elev-2','--seven-ring',
 '--seven-motion-fast','--seven-motion-standard',
 '--seven-success','--seven-warning','--seven-info',
 '--seven-z-base','--seven-z-sticky','--seven-z-dropdown','--seven-z-popover','--seven-z-sheet','--seven-z-modal','--seven-z-toast','--seven-z-critical',
 '--seven-touch-min'
];
for(const token of required) assert.ok(tokenSources.includes(token),`missing canonical token ${token}`);

assert.ok(beta.includes('--bg:var(--sb-bg)')&&beta.includes('--surface:var(--sb-s)')&&beta.includes('--text:var(--sb-t)')&&beta.includes('--accent:var(--sb-a)'),'theme bridge must populate the canonical semantic color contract');
assert.ok(!hardening.includes('data-seven-theme="night"'),'ui-hardening must not own a competing night-theme layer');
assert.ok(canonical.includes('min-height:var(--seven-touch-min)'), 'shared controls must consume touch token');
assert.ok(!/z-index:(?:999|9999|10020|10060)\b/.test(canonical+hardening), 'owned shared CSS must not reintroduce random z-index literals');
assert.ok(!/(?:margin|padding|border|inset)-(?:left|right)\s*:/.test(rtl), 'rtl.css must use logical properties');
assert.ok(rtl.includes('unicode-bidi:isolate')&&rtl.includes('unicode-bidi:plaintext'),'RTL contract must protect mixed-direction content');
assert.ok(hardening.includes('var(--seven-radius-lg,22px)'),'settings dialog must consume canonical radius');
assert.ok(hardening.includes('var(--seven-touch-min,44px)'),'settings controls must consume touch target token');
assert.ok(generated.includes('var(--seven-radius-md,16px)'),'generated cards must consume canonical radius');
assert.ok(generated.includes('var(--seven-touch-min,44px)'),'generated controls must consume canonical touch target');
assert.ok(generated.includes('var(--seven-success,#20a878)')&&generated.includes('var(--seven-warning,#dc9418)'),'generated status colors must resolve through semantic tokens');
console.log('design-system-contract: PASS');
