import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const remake = path.join(root, "remake");
const dist = path.join(remake, "dist");
const output = path.join(dist, "seven-remake-release.json");

const pkg = JSON.parse(await fs.readFile(path.join(remake, "package.json"), "utf8"));
const capacitor = JSON.parse(
  await fs.readFile(path.join(remake, "capacitor.config.json"), "utf8"),
);

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

async function walk(directory, prefix = "") {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(absolute, rel));
    } else if (entry.isFile() && rel !== "seven-remake-release.json") {
      const bytes = await fs.readFile(absolute);
      files.push({
        path: rel.replaceAll("\\", "/"),
        sha256: sha256(bytes),
        sizeBytes: bytes.byteLength,
      });
    }
  }
  return files;
}

const files = (await walk(dist)).sort((a, b) => a.path.localeCompare(b.path));
if (files.length === 0) throw new Error("Seven Remake dist is empty.");
for (const file of files) {
  if (
    file.path.startsWith("/") ||
    file.path.split("/").some((segment) => !segment || segment === "." || segment === "..")
  ) {
    throw new Error(`Unsafe release payload path: ${file.path}`);
  }
}

const descriptor = JSON.stringify({
  schemaVersion: 1,
  artifactId: capacitor.appId,
  version: pkg.version,
  files,
});
const payloadSha256 = sha256(Buffer.from(descriptor, "utf8"));
const manifest = {
  schemaVersion: 1,
  artifactId: capacitor.appId,
  version: pkg.version,
  files,
  payloadSha256,
  descriptor,
};
await fs.writeFile(output, JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `Seven Remake release manifest: PASS (${files.length} files, sha256:${payloadSha256})`,
);
