'use strict';
const assert = require('node:assert/strict');
const { parseGatewayClientKeys, toRuntimeEnv, PROVIDER_KEYS } = require('./gateway-client-keys.cjs');

// Fixture placeholders — NOT real secrets. They validate the loader logic
// without ever touching a credential.
const fixtureJson = JSON.stringify({
  groq: 'fixture-groq-key',
  OPENROUTER: 'fixture-openrouter-key',
  nvidia: 'fixture-nvidia-key',
  Mistral: 'fixture-mistral-key'
});

// 1. JSON object, mixed-case provider keys
const parsed = parseGatewayClientKeys(fixtureJson);
assert.equal(parsed.groq, 'fixture-groq-key');
assert.equal(parsed.openrouter, 'fixture-openrouter-key');
assert.equal(parsed.nvidia, 'fixture-nvidia-key');
assert.equal(parsed.mistral, 'fixture-mistral-key');

// 2. Newline-separated "PROVIDER=key" / "provider:key" fallback
const parsedNl = parseGatewayClientKeys('groq=fixture-groq-key\nopenrouter:fixture-openrouter-key');
assert.equal(parsedNl.groq, 'fixture-groq-key');
assert.equal(parsedNl.openrouter, 'fixture-openrouter-key');

// 2b. base64-encoded JSON (the likely opaque-secret form)
const b64Json = Buffer.from(JSON.stringify({ groq: 'fixture-groq-key', openrouter: 'fixture-openrouter-key', nvidia: 'fixture-nvidia-key', mistral: 'fixture-mistral-key' })).toString('base64');
const parsedB64 = parseGatewayClientKeys(b64Json);
assert.equal(parsedB64.groq, 'fixture-groq-key');
assert.equal(parsedB64.openrouter, 'fixture-openrouter-key');
assert.equal(parsedB64.nvidia, 'fixture-nvidia-key');
assert.equal(parsedB64.mistral, 'fixture-mistral-key');

// 2c. base64-encoded PROVIDER=key lines
const b64Lines = Buffer.from('groq=fixture-groq-key\nmistral=fixture-mistral-key').toString('base64');
const parsedB64Lines = parseGatewayClientKeys(b64Lines);
assert.equal(parsedB64Lines.groq, 'fixture-groq-key');
assert.equal(parsedB64Lines.mistral, 'fixture-mistral-key');

// 3. Empty / invalid / non-string input yields {}
assert.deepEqual(parseGatewayClientKeys(''), {});
assert.deepEqual(parseGatewayClientKeys(undefined), {});
assert.deepEqual(parseGatewayClientKeys('   '), {});
assert.deepEqual(parseGatewayClientKeys('not-json-no-colons'), {});

// 4. Partial bundles only return the providers present
const partial = parseGatewayClientKeys(JSON.stringify({ groq: 'fixture-groq-key' }));
assert.deepEqual(Object.keys(partial), ['groq']);

// 5. Env mapping produces the exact SEVEN_RPG_*_KEY names
const env = toRuntimeEnv(parsed);
assert.equal(env.SEVEN_RPG_GROQ_KEY, 'fixture-groq-key');
assert.equal(env.SEVEN_RPG_OPENROUTER_KEY, 'fixture-openrouter-key');
assert.equal(env.SEVEN_RPG_NVIDIA_KEY, 'fixture-nvidia-key');
assert.equal(env.SEVEN_RPG_MISTRAL_KEY, 'fixture-mistral-key');

// 6. Canonical provider set is exactly the four expected
assert.deepEqual([...PROVIDER_KEYS].sort(), ['groq', 'mistral', 'nvidia', 'openrouter']);

console.log('gateway client keys loader: PASS');
