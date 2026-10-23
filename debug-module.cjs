const vm = require('vm');
const code = `
(function(root, factory) {
  console.log('IIFE started');
  const api = factory();
  console.log('Factory returned:', api);
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SevenRpgCanonContinuity = api;
  return api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  return { createCanonContinuity: function() { return 'test'; } };
});
`;
const context = vm.createContext({ 
  module: { exports: {} }, 
  globalThis: {}, 
  global: {}, 
  console 
});
const result = vm.runInContext(code, context);
console.log('Result:', result);
console.log('Module exports:', context.module.exports);