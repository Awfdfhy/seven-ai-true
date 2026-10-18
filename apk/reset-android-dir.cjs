'use strict';
// Cross-platform replacement for the `rm -rf android` step in android:generate.
//
// The npm script used a raw `rm -rf`, which only exists in POSIX shells. On Windows the script
// died with "'rm' is not recognized", so android:generate could never run on this platform.
// This helper uses the same fs.rmSync pattern the other apk/ scripts already use.
//
// The removal is scoped to android/ (the generated Capacitor project). It is a no-op when the
// directory is already absent, so a first run is safe.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TARGET = path.join(ROOT, 'android');

const existed = fs.existsSync(TARGET);
// force:true => no error when absent; recursive:true => remove the tree.
fs.rmSync(TARGET, { recursive: true, force: true });

console.log('android dir reset: PASS (' + (existed ? 'removed existing android/' : 'android/ was already absent') + ')');