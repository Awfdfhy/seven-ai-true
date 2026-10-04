import { SevenError } from "../../core/errors";

function normalize(value: unknown, seen: WeakSet<object>): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new SevenError({ code: "VALIDATION", message: "Tool arguments contain a non-finite number." });
    }
    return Object.is(value,-0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map(item => normalize(item,seen));
  if (typeof value === "object") {
    const object=value as Record<string,unknown>;
    if (seen.has(object)) {
      throw new SevenError({ code: "VALIDATION", message: "Tool arguments contain a cycle." });
    }
    seen.add(object);
    const out:Record<string,unknown>={};
    for (const key of Object.keys(object).sort()) {
      const child=object[key];
      if (child === undefined || typeof child === "function" || typeof child === "symbol" || typeof child === "bigint") {
        throw new SevenError({ code: "VALIDATION", message: "Tool arguments contain unsupported values." });
      }
      out[key]=normalize(child,seen);
    }
    seen.delete(object);
    return out;
  }
  throw new SevenError({ code: "VALIDATION", message: "Tool arguments contain unsupported values." });
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(normalize(value,new WeakSet<object>()));
}

export async function sha256Hex(value: string): Promise<string> {
  const data=new TextEncoder().encode(value);
  const digest=await crypto.subtle.digest("SHA-256",data);
  return [...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,"0")).join("");
}

export async function invocationFingerprint(input: Readonly<{
  toolId:string;
  version:string;
  roomId:string;
  taskId:string;
  args:unknown;
}>): Promise<string> {
  return sha256Hex(canonicalJson({
    toolId:input.toolId,
    version:input.version,
    roomId:input.roomId,
    taskId:input.taskId,
    args:input.args,
  }));
}
