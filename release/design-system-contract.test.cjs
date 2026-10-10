const assert=require('assert/strict');
const fs=require('fs');
const path=require('path');
const root=__dirname;
const canonical=fs.readFileSync(path.join(root,'seven-final.css'),'utf8');
const hardening=fs.readFileSync(path.join(root,'ui-hardening.css'),'utf8');
const rtl=fs.readFileSync(path.join(root,'workspaces','rtl.css'),'utf8');

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
assert.ok(!/z-index:(?:999|9999|10020)\b/.test(canonical+hardening), 'owned shared CSS must not reintroduce random z-index literals');
assert.ok(!/(?:margin|padding|border|inset)-(?:left|right)\s*:/.test(rtl), 'rtl.css must use logical properties');
assert.ok(rtl.includes('unicode-bidi:isolate')&&rtl.includes('unicode-bidi:plaintext'),'RTL contract must protect mixed-direction content');
console.log('design-system-contract: PASS');
