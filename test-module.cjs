const vm = require('vm');
const code = require('fs').readFileSync('./release/workspaces/rpg-canon-continuity.js', 'utf8');
const context = vm.createContext({ 
  module: { exports: {} }, 
  globalThis: {}, 
  global: {}, 
  console, 
  setTimeout, 
  clearTimeout, 
  Buffer, 
  process 
});
const result = vm.runInContext(code, context);
console.log('Result:', result);
console.log('Module exports:', context.module.exports);