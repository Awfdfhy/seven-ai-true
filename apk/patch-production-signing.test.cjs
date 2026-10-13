'use strict';
const assert = require('node:assert/strict');
const { patchProductionGradleSigning } = require('./patch-production-signing.cjs');

// Fixture Gradle in the exact shape apk/patch-android.cjs produces: an
// `android {}` block with a sevenCi signingConfigs section and a release
// buildType that currently only knows about sevenCi.
const fixtureGradle = [
  'def sevenCiKeystore = project.findProperty("sevenCiKeystore")',
  'def sevenCiStorePass = project.findProperty("sevenCiStorePass")',
  'def sevenCiKeyAlias = project.findProperty("sevenCiKeyAlias")',
  'def sevenCiKeyPass = project.findProperty("sevenCiKeyPass")',
  'apply plugin: "com.android.application"',
  'android {',
  '    if (sevenCiKeystore) {',
  '        testBuildType = "release"',
  '    }',
  '    signingConfigs {',
  '        if (sevenCiKeystore) {',
  '            sevenCi {',
  '                storeFile file(sevenCiKeystore)',
  '                storePassword sevenCiStorePass',
  '                keyAlias sevenCiKeyAlias',
  '                keyPassword sevenCiKeyPass',
  '            }',
  '        }',
  '    }',
  '    buildTypes {',
  '        debug {',
  '            if (sevenCiKeystore) {',
  '                signingConfig signingConfigs.sevenCi',
  '            }',
  '        }',
  '        release {',
  '            if (sevenCiKeystore) {',
  '                signingConfig signingConfigs.sevenCi',
  '            }',
  '        }',
  '    }',
  '}'
].join('\n');

// 1. sevenRelease signing config is added with the four Gradle properties
const patched = patchProductionGradleSigning(fixtureGradle);
assert.ok(patched.includes('def sevenReleaseKeystore'), 'sevenRelease property prelude must be added');
assert.ok(patched.includes('def sevenReleaseStorePass'), 'store password property must be declared');
assert.ok(patched.includes('sevenRelease {'), 'sevenRelease signingConfig block must be added');
assert.ok(patched.includes('storePassword sevenReleaseStorePass'), 'release store password mapping');
assert.ok(patched.includes('keyAlias sevenReleaseKeyAlias'), 'release key alias mapping');
assert.ok(patched.includes('keyPassword sevenReleaseKeyPass'), 'release key password mapping');

// 2. release buildType prefers sevenRelease, falls back to sevenCi
assert.ok(patched.includes('signingConfig signingConfigs.sevenRelease'), 'release must use sevenRelease');
assert.ok(patched.includes('} else if (sevenCiKeystore) {'), 'release must keep a sevenCi fallback');

// 3. Existing sevenCi paths are preserved (debug still uses sevenCi)
assert.ok(patched.includes('signingConfig signingConfigs.sevenCi'), 'existing sevenCi references must remain (debug + release fallback)');
assert.ok(patched.includes('sevenCi {'), 'sevenCi signingConfig block must be preserved');
assert.ok((patched.match(/def sevenCiKeystore/g) || []).length === 1, 'sevenCi property declaration must not be duplicated');

// 4. Missing the sevenCi prerequisite fails loudly (never silently under-sign)
assert.throws(() => patchProductionGradleSigning('android {\n  buildTypes {}\n}'), /CI signing patch must run before/);

console.log('production signing patch: PASS');
