const textEncoder = new TextEncoder();

export async function sha256Text(value: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error("SHA-256 requires Web Crypto support.");
  }
  const digest = await globalThis.crypto.subtle.digest("SHA-256", textEncoder.encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function utf8Bytes(value: string): number {
  return textEncoder.encode(value).byteLength;
}
