'use strict';
// Minimal, dependency-free ZIP reader for APK verification.
//
// verify-apk.cjs used to shell out to `unzip -l` and `unzip -p`. `unzip` is a POSIX tool that
// does not exist on Windows, so APK verification could never run there. Using a dependency-free
// reader built on Node's own zlib keeps the gate portable and avoids shell invocation entirely
// (no argument escaping concerns, no reliance on a transitive package such as yauzl).
//
// Supports the subset an APK needs: the central directory, STORED (method 0) and DEFLATE
// (method 8) entries. Anything else is reported as unsupported rather than silently ignored.
const fs = require('fs');
const zlib = require('zlib');

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const EOCD_MIN_SIZE = 22;
const MAX_COMMENT = 0xffff;

function findEndOfCentralDirectory(buffer) {
  const lowest = Math.max(0, buffer.length - EOCD_MIN_SIZE - MAX_COMMENT);
  for (let i = buffer.length - EOCD_MIN_SIZE; i >= lowest; i--) {
    if (buffer.readUInt32LE(i) === EOCD_SIGNATURE) return i;
  }
  throw new Error('not a ZIP archive: end-of-central-directory record not found');
}

function readEntries(buffer) {
  const eocd = findEndOfCentralDirectory(buffer);
  const entryCount = buffer.readUInt16LE(eocd + 10);
  let offset = buffer.readUInt32LE(eocd + 16);
  const entries = new Map();
  for (let i = 0; i < entryCount; i++) {
    if (offset + 46 > buffer.length || buffer.readUInt32LE(offset) !== CENTRAL_SIGNATURE) {
      throw new Error('corrupt ZIP central directory at entry ' + i);
    }
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString('utf8', offset + 46, offset + 46 + nameLength);
    entries.set(name, { name, method, compressedSize, uncompressedSize, localHeaderOffset });
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

function readEntryData(buffer, entry) {
  const local = entry.localHeaderOffset;
  if (local + 30 > buffer.length || buffer.readUInt32LE(local) !== 0x04034b50) {
    throw new Error('corrupt ZIP local header for ' + entry.name);
  }
  const nameLength = buffer.readUInt16LE(local + 26);
  const extraLength = buffer.readUInt16LE(local + 28);
  const start = local + 30 + nameLength + extraLength;
  const raw = buffer.subarray(start, start + entry.compressedSize);
  if (entry.method === 0) return Buffer.from(raw);
  if (entry.method === 8) return zlib.inflateRawSync(raw);
  throw new Error('unsupported ZIP compression method ' + entry.method + ' for ' + entry.name);
}

// --- `unzip -l`-shaped listing: one "<length> <date> <time> <name>" row per entry ------------
function listText(entries) {
  const rows = [];
  let total = 0;
  for (const entry of entries.values()) {
    if (entry.name.endsWith('/')) continue;
    const size = String(entry.uncompressedSize).padStart(9);
    rows.push(size + '  ' + entry.name);
    total += entry.uncompressedSize;
  }
  const names = [...entries.keys()].join('\n');
  return rows.join('\n') + '\n' + names + '\n' + total + ' files';
}

function open(apkPath) {
  const buffer = fs.readFileSync(apkPath);
  const entries = readEntries(buffer);
  return {
    names: () => [...entries.keys()],
    listing: () => listText(entries),
    has: (name) => entries.has(name),
    read: (name) => {
      const entry = entries.get(name);
      if (!entry) throw new Error('APK payload missing: ' + name);
      return readEntryData(buffer, entry);
    }
  };
}

module.exports = { open, readEntries, readEntryData, findEndOfCentralDirectory };