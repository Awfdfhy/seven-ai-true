'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

console.log('Testing RPG Roadmap Ledger...');

const ledgerPath = path.join(__dirname, '..', 'docs', 'seven-rpg', 'ROADMAP_LEDGER.json');
const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));

console.log('\n1. Ledger format and metadata...');
assert.equal(ledger.format, 'seven-rpg-roadmap-ledger');
assert.equal(ledger.version, 1);
assert.ok(ledger.generatedAt);
assert.equal(ledger.repository, 'Awfdfhy/seven-ai-true');
assert.equal(ledger.branch, 'rpg/standalone-20261011');
console.log('  PASS');

console.log('\n2. Total item count...');
assert.equal(ledger.totalItems, 227);
assert.equal(ledger.items.length, 227);
console.log('  PASS');

console.log('\n3. Summary consistency...');
const byStatus = {};
const byPriority = {};
for (const item of ledger.items) {
  byStatus[item.status] = (byStatus[item.status] || 0) + 1;
  byPriority[item.priority] = (byPriority[item.priority] || 0) + 1;
}
assert.deepEqual(ledger.summary.byStatus, byStatus);
assert.deepEqual(ledger.summary.byPriority, byPriority);
assert.equal(byStatus.VERIFIED + byStatus.IMPLEMENTED + byStatus.BLOCKED + byStatus.TODO, 227);
console.log('  PASS');

console.log('\n4. Item structure...');
const validStatuses = new Set(['VERIFIED', 'IMPLEMENTED', 'BLOCKED', 'TODO']);
const validPriorities = new Set(['P0', 'P1', 'P2', 'P3']);
for (const item of ledger.items) {
  assert.match(item.id, /^RPG-\d{2}-\d{2}$/);
  assert.ok(validPriorities.has(item.priority), `invalid priority ${item.priority} for ${item.id}`);
  assert.ok(validStatuses.has(item.status), `invalid status ${item.status} for ${item.id}`);
  assert.ok(item.domain, `missing domain for ${item.id}`);
  assert.ok(item.feature, `missing feature for ${item.id}`);
  if (item.status === 'VERIFIED' || item.status === 'IMPLEMENTED') {
    assert.ok(item.evidence && item.evidence.commit, `missing evidence for ${item.id}`);
    assert.ok(item.evidence.testFile, `missing testFile for ${item.id}`);
  }
  if (item.status === 'BLOCKED') {
    assert.ok(item.evidence && item.evidence.reason, `missing blocked reason for ${item.id}`);
  }
}
console.log('  PASS');

console.log('\n5. ID uniqueness...');
const ids = new Set(ledger.items.map(i => i.id));
assert.equal(ids.size, 227);
console.log('  PASS');

console.log('\n6. Priority coverage...');
assert.equal(byPriority.P0, 15);
assert.equal(byPriority.P1, 90);
assert.equal(byPriority.P2, 107);
assert.equal(byPriority.P3, 15);
console.log('  PASS');

console.log('\n✅ All RPG Roadmap Ledger tests passed!');
console.log(`\nSummary: ${byStatus.VERIFIED} VERIFIED, ${byStatus.IMPLEMENTED} IMPLEMENTED, ${byStatus.BLOCKED} BLOCKED, ${byStatus.TODO} TODO`);
console.log(`Priorities: P0=${byPriority.P0}, P1=${byPriority.P1}, P2=${byPriority.P2}, P3=${byPriority.P3}`);
