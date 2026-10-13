'use strict';
// Structural diagnostic for the GATEWAY_CLIENT_KEYS secret.
//
// SECURITY: this logs ONLY structure — length, JSON validity, key NAMES, line
// count — NEVER any secret value. It exists solely to determine the secret's
// format so the loader can be corrected; it is a build-time aid, not a product
// path, and it prints no credential material.
const raw = typeof process.env.GATEWAY_CLIENT_KEYS === 'string' ? process.env.GATEWAY_CLIENT_KEYS : '';

function mask() { return '***'; }

console.log('gateway_keys.length=' + raw.length);
if (!raw) { console.log('gateway_keys.present=false'); process.exit(0); }
console.log('gateway_keys.present=true');

let json = null;
try { json = JSON.parse(raw); } catch (_) { json = null; }

if (json && typeof json === 'object' && !Array.isArray(json)) {
  console.log('gateway_keys.format=json-object');
  const keys = Object.keys(json);
  console.log('gateway_keys.json.keys=' + JSON.stringify(keys));
  for (const k of keys) {
    const v = json[k];
    console.log('gateway_keys.field.' + k + '.type=' + (v === null ? 'null' : typeof v));
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      console.log('gateway_keys.field.' + k + '.nestedKeys=' + JSON.stringify(Object.keys(v)));
    }
    void mask();
  }
} else if (json) {
  console.log('gateway_keys.format=json-' + (Array.isArray(json) ? 'array' : typeof json));
  if (Array.isArray(json)) {
    console.log('gateway_keys.array.length=' + json.length);
    json.slice(0, 10).forEach((el, i) => {
      if (el && typeof el === 'object') console.log('gateway_keys.array[' + i + '].keys=' + JSON.stringify(Object.keys(el)));
    });
  }
} else {
  console.log('gateway_keys.format=not-json');
  const lines = raw.split(/\r?\n/);
  const nonEmpty = lines.filter(l => l.trim() !== '');
  console.log('gateway_keys.lineCount=' + nonEmpty.length);
  nonEmpty.slice(0, 12).forEach((line, i) => {
    const m = line.match(/^\s*([A-Za-z0-9_.-]+)\s*[:=]/);
    const key = m ? m[1] : null;
    console.log('gateway_keys.line[' + i + '].key=' + (key || '(none)') + ' .len=' + line.length);
  });
}
