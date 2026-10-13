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
  const trimmed = raw.trim();
  const dots = (trimmed.match(/\./g) || []).length;
  console.log('gateway_keys.dots=' + dots);
  const delims = {
    comma: (trimmed.match(/,/g) || []).length,
    semicolon: (trimmed.match(/;/g) || []).length,
    pipe: (trimmed.match(/\|/g) || []).length,
    space: (trimmed.match(/ /g) || []).length,
    colon: (trimmed.match(/:/g) || []).length,
    equals: (trimmed.match(/=/g) || []).length
  };
  console.log('gateway_keys.delims=' + JSON.stringify(delims));
  if (dots >= 1) {
    const segs = trimmed.split('.');
    console.log('gateway_keys.segments=' + segs.length);
    segs.forEach((seg, i) => {
      const b64url = /^[A-Za-z0-9_-]+$/.test(seg);
      console.log('gateway_keys.seg[' + i + '].len=' + seg.length + ' base64url=' + b64url);
      if (b64url) {
        try {
          const d = Buffer.from(seg.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
          let dj = null; try { dj = JSON.parse(d); } catch (_) {}
          if (dj && typeof dj === 'object' && !Array.isArray(dj)) {
            console.log('gateway_keys.seg[' + i + '].decoded=json-object keys=' + JSON.stringify(Object.keys(dj)));
          } else {
            console.log('gateway_keys.seg[' + i + '].decodedIs=' + (dj ? ('json-' + typeof dj) : (/[\u0000-\u0008\u000e-\u001f]/.test(d) ? 'binary' : 'text')) + ' .len=' + d.length);
          }
        } catch (_) {}
      }
    });
  }
  const base64ish = /^[A-Za-z0-9+/=_-]+$/.test(trimmed) && trimmed.length % 4 === 0;
  console.log('gateway_keys.base64like=' + base64ish);
  if (base64ish) {
    try {
      const decoded = Buffer.from(trimmed, 'base64').toString('utf8');
      console.log('gateway_keys.base64.decodedLen=' + decoded.length);
      let dj = null; try { dj = JSON.parse(decoded); } catch (_) {}
      if (dj && typeof dj === 'object' && !Array.isArray(dj)) {
        console.log('gateway_keys.base64.decodedIs=json-object keys=' + JSON.stringify(Object.keys(dj)));
      } else {
        const subLines = decoded.split(/\r?\n/).filter(Boolean);
        console.log('gateway_keys.base64.decodedIs=text sublineCount=' + subLines.length);
        subLines.slice(0, 8).forEach((l, i) => {
          const m = l.match(/^\s*([A-Za-z0-9_.-]+)\s*[:=]/);
          console.log('gateway_keys.base64.decoded.line[' + i + '].key=' + (m ? m[1] : '(none)') + ' .len=' + l.length);
        });
      }
    } catch (_) { console.log('gateway_keys.base64.decode=failed'); }
  }
  nonEmpty.slice(0, 12).forEach((line, i) => {
    const m = line.match(/^\s*([A-Za-z0-9_.-]+)\s*[:=]/);
    const key = m ? m[1] : null;
    console.log('gateway_keys.line[' + i + '].key=' + (key || '(none)') + ' .len=' + line.length);
  });
}
