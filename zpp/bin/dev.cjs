#!/usr/bin/env node
'use strict';
/**
 * Dev server: auth=dev and a scratch database.
 *
 * Kept as a script rather than an npm inline env assignment because
 * `ZPP_AUTH=dev node ...` is a POSIX-ism and this repo develops on Windows.
 */

process.env.ZPP_AUTH = 'dev';
if (!process.env.ZPP_DB_FILE) {
  process.env.ZPP_DB_FILE = require('node:path').join(__dirname, '..', 'data', 'dev.sqlite');
}

require('../src/server');