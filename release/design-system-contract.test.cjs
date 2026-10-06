const assert=require('assert/strict');
const fs=require('fs');
const path=require('path');

const canonical=fs.readFileSync(path.join(__dirname,'seven-final.css'),'utf8');
const hardening=fs.readFileSync(path.join(__dirname,'ui-hardening.css'),'utf8');
const rtl=fs.readFileSync(path.join(__dirname,'workspaces','rtl.css'),'utf8');
const generated=fs.readFileSync(path.join(__dirname,'workspaces','generated-ui.css'),'utf8');

const required=[
 '--seven-color-surface-0','--seven-color-surface-1','--seven-color-surface-2','--seven-color-surface-raised',
 '--seven-color-text-primary','--seven-color-text-secondary','--seven-color-text-muted',
 '--seven-color-accent','--seven-color-danger','--seven-color-warning','--seven-color-success','--seven-color-info',
 '--seven-space-1','--seven-space-9','--seven-radius-control','--seven-radius-card','--seven-radius-dialog','--seven-radius-sheet',
 '--seven-z-sticky','--seven-z-dropdown','--seven-z-popover','--seven-z-sheet','--seven-z-modal','--seven-z-toast','--seven-z-critical',
 '--seven-duration-fast','--seven-duration-normal','--seven-duration-slow','--seven-touch-min'
];
for(const token of required) assert.ok(canonical.includes(token),`missing canonical token ${token}`);
assert.ok(canonical.includes('min-height:var(--seven-touch-min)'), 'shared controls must consume touch token');
assert.ok(!/z-index:(?:999|9999|10020|10060)\b/.test(canonical+hardening), 'owned shared CSS must not reintroduce random z-index literals');
assert.ok(!/(?:margin|padding|border|inset)-(?:left|right)\s*:/.test(rtl), 'rtl.css must use logical properties');
assert.ok(rtl.includes('unicode-bidi:isolate')&&rtl.includes('unicode-bidi:plaintext'),'RTL contract must protect mixed-direction content');
assert.ok(hardening.includes('var(--seven-radius-dialog,20px)'),'settings dialog must consume canonical radius');
assert.ok(hardening.includes('var(--seven-touch-min,44px)'),'settings controls must consume touch target token');
assert.ok(generated.includes('var(--seven-radius-card,16px)'),'generated cards must consume canonical radius');
assert.ok(generated.includes('var(--seven-touch-min,44px)'),'generated controls must consume canonical touch target');
assert.ok(generated.includes('var(--seven-color-success,#20a878)')&&generated.includes('var(--seven-color-warning,#dc9418)'),'generated status colors must resolve through semantic tokens');
console.log('design-system-contract: PASS');
