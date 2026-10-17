#!/usr/bin/env node
'use strict';
/**
 * Mint an API key.
 *
 *   node zpp/bin/mint-key.mjs <owner-id> [label]
 *   node zpp/bin/mint-key.mjs <owner-id> --revoke <key-hash>
 *   node zpp/bin/mint-key.mjs <owner-id> --list
 *
 * The plaintext key is printed exactly once. Only its SHA-256 is stored, so it
 * cannot be recovered afterwards — if you lose it, mint another.
 */

const { openDb, configFromEnv } = require('../src/db');
const { createAuth } = require('../src/auth');

async function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith('--')));
  const positional = args.filter((a) => !a.startsWith('--'));
  const owner = positional[0];

  if (!owner) {
    console.error('usage: mint-key.mjs <owner-id> [label] | --list | --revoke <key-hash>');
    process.exit(2);
  }

  const db = await openDb(configFromEnv());
  const auth = createAuth(db, { mode: 'required' });

  try {
    if (flags.has('--list')) {
      const keys = await auth.listKeys(owner);
      if (!keys.length) {
        console.log(`no keys for ${owner}`);
      } else {
        for (const k of keys) {
          const state = k.revoked_at ? `REVOKED ${k.revoked_at}` : `active${k.last_used_at ? ` last used ${k.last_used_at}` : ' never used'}`;
          console.log(`${k.key_hash.slice(0, 16)}…  ${JSON.stringify(k.label).padEnd(20)} ${state}`);
        }
      }
      return;
    }

    if (flags.has('--revoke')) {
      const hash = positional[1];
      if (!hash) {
        console.error('--revoke needs the key hash (see --list)');
        process.exit(2);
      }
      const ok = await auth.revokeKey(hash);
      console.log(ok ? 'revoked' : 'not found or already revoked');
      return;
    }

    const label = positional[1] || '';
    const minted = await auth.registerKey({ ownerId: owner, label });

    console.log('');
    console.log('  API key (shown once — copy it now):');
    console.log('');
    console.log(`    ${minted.plaintext}`);
    console.log('');
    console.log(`  owner : ${minted.ownerId}`);
    console.log(`  hash  : ${minted.keyHash}`);
    console.log('');
    console.log('  Use it as:  Authorization: Bearer <key>');
    console.log('');
  } finally {
    await db.close();
  }
}

main().catch((err) => {
  console.error('mint-key failed:', err.message);
  process.exit(1);
});