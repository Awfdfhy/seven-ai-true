import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const srcRoot = new URL("../../", import.meta.url).pathname;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) out.push(...walk(path));
    else if (/\.(ts|tsx)$/.test(name)) out.push(path);
  }
  return out;
}

function rel(path: string): string {
  return relative(srcRoot, path).replaceAll("\\", "/");
}

describe("Remake architecture invariants", () => {
  const files = walk(srcRoot);

  it("does not introduce mutable Seven globals", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      if (/window\.Seven[A-Za-z0-9_]*/.test(text)) offenders.push(rel(file));
    }
    expect(offenders).toEqual([]);
  });

  it("keeps IndexedDB ownership inside storage adapters and storage tests", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const path = rel(file);
      if (path.startsWith("storage/")) continue;
      if (path.includes(".test.")) continue;
      const text = readFileSync(file, "utf8");
      if (/\bindexedDB\b/.test(text)) offenders.push(path);
    }
    expect(offenders).toEqual([]);
  });

  it("keeps UI free of direct provider, network, and persistence access", () => {
    const offenders: string[] = [];
    for (const file of files.filter((f) => rel(f).startsWith("ui/"))) {
      const text = readFileSync(file, "utf8");
      if (
        /\bfetch\s*\(/.test(text) ||
        /\bindexedDB\b/.test(text) ||
        /ProviderAdapter|RoomRepository|RoutedChatTransport/.test(text)
      ) {
        offenders.push(rel(file));
      }
    }
    expect(offenders).toEqual([]);
  });

  it("keeps direct browser storage APIs out of domain/application/provider/routing code", () => {
    const forbiddenRoots = [
      "core/",
      "domain/",
      "application/",
      "providers/",
      "routing/",
      "integration/",
    ];
    const offenders: string[] = [];
    for (const file of files) {
      const path = rel(file);
      if (!forbiddenRoots.some((root) => path.startsWith(root))) continue;
      if (path.includes(".test.")) continue;
      const text = readFileSync(file, "utf8");
      if (/\b(localStorage|sessionStorage|indexedDB)\b/.test(text)) {
        offenders.push(path);
      }
    }
    expect(offenders).toEqual([]);
  });
});
