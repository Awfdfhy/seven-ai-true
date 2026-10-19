import { z, type ZodTypeAny } from "zod";
import { SevenError } from "../../core/errors";

const MAX_DEPTH = 4;
const MAX_PROPERTIES = 64;
const MAX_ARRAY_ITEMS = 128;
const MAX_STRING_LENGTH = 32_000;

const META_KEYS = new Set([
  "$schema","title","description","default","examples","deprecated","readOnly","writeOnly",
]);

function object(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new SevenError({ code: "VALIDATION", message: `${field} must be an object.` });
  }
  return value as Record<string, unknown>;
}

function finiteNumber(value: unknown, field: string): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new SevenError({ code: "VALIDATION", message: `${field} must be finite.` });
  }
  return value;
}

function integer(value: unknown, field: string): number | undefined {
  const parsed = finiteNumber(value, field);
  if (parsed === undefined) return undefined;
  if (!Number.isSafeInteger(parsed)) {
    throw new SevenError({ code: "VALIDATION", message: `${field} must be a safe integer.` });
  }
  return parsed;
}

function assertOnlyKeys(node: Record<string, unknown>, allowed: readonly string[]): void {
  const set = new Set([...META_KEYS, ...allowed]);
  for (const key of Object.keys(node)) {
    if (!set.has(key)) {
      throw new SevenError({
        code: "VALIDATION",
        message: `Unsupported MCP JSON Schema keyword: ${key}.`,
      });
    }
  }
}

function compileString(node: Record<string, unknown>): ZodTypeAny {
  assertOnlyKeys(node, ["type","enum","minLength","maxLength","pattern"]);
  const enumValues = node.enum;
  if (enumValues !== undefined) {
    if (
      !Array.isArray(enumValues) ||
      enumValues.length < 1 ||
      enumValues.length > 64 ||
      enumValues.some(value => typeof value !== "string")
    ) {
      throw new SevenError({ code: "VALIDATION", message: "Only bounded string enums are supported for MCP tools." });
    }
    return z.enum(enumValues as [string, ...string[]]);
  }
  const min = integer(node.minLength, "minLength");
  const max = integer(node.maxLength, "maxLength");
  if ((min ?? 0) < 0 || (max ?? MAX_STRING_LENGTH) > MAX_STRING_LENGTH || (min !== undefined && max !== undefined && min > max)) {
    throw new SevenError({ code: "VALIDATION", message: "MCP string bounds are unsupported." });
  }
  let out = z.string();
  if (min !== undefined) out = out.min(min);
  out = out.max(max ?? MAX_STRING_LENGTH);
  if (node.pattern !== undefined) {
    if (typeof node.pattern !== "string" || node.pattern.length > 256) {
      throw new SevenError({ code: "VALIDATION", message: "MCP string pattern is unsupported." });
    }
    let regex: RegExp;
    try { regex = new RegExp(node.pattern, "u"); }
    catch { throw new SevenError({ code: "VALIDATION", message: "MCP string pattern is invalid." }); }
    out = out.regex(regex);
  }
  return out;
}

function compileNumber(node: Record<string, unknown>, asInteger: boolean): ZodTypeAny {
  assertOnlyKeys(node, ["type","minimum","maximum"]);
  const min = finiteNumber(node.minimum, "minimum");
  const max = finiteNumber(node.maximum, "maximum");
  if (min !== undefined && max !== undefined && min > max) {
    throw new SevenError({ code: "VALIDATION", message: "MCP numeric bounds are invalid." });
  }
  let out = z.number().finite();
  if (asInteger) out = out.int();
  if (min !== undefined) out = out.min(min);
  if (max !== undefined) out = out.max(max);
  return out;
}

function compileArray(node: Record<string, unknown>, depth: number): ZodTypeAny {
  assertOnlyKeys(node, ["type","items","minItems","maxItems"]);
  if (node.items === undefined) {
    throw new SevenError({ code: "VALIDATION", message: "MCP array schemas require items." });
  }
  const min = integer(node.minItems, "minItems") ?? 0;
  const max = integer(node.maxItems, "maxItems") ?? MAX_ARRAY_ITEMS;
  if (min < 0 || max < 0 || max > MAX_ARRAY_ITEMS || min > max) {
    throw new SevenError({ code: "VALIDATION", message: "MCP array bounds are unsupported." });
  }
  return z.array(compileNode(node.items, depth + 1)).min(min).max(max);
}

function compileObject(node: Record<string, unknown>, depth: number): ZodTypeAny {
  assertOnlyKeys(node, ["type","properties","required","additionalProperties"]);
  const props = node.properties === undefined ? {} : object(node.properties, "properties");
  const keys = Object.keys(props);
  if (keys.length > MAX_PROPERTIES) {
    throw new SevenError({ code: "VALIDATION", message: "MCP tool schema has too many properties." });
  }
  if (node.additionalProperties !== undefined && node.additionalProperties !== false) {
    throw new SevenError({ code: "VALIDATION", message: "MCP additionalProperties must be false for Seven import." });
  }
  const requiredRaw = node.required ?? [];
  if (!Array.isArray(requiredRaw) || requiredRaw.some(item => typeof item !== "string")) {
    throw new SevenError({ code: "VALIDATION", message: "MCP required list is invalid." });
  }
  const required = new Set(requiredRaw as string[]);
  for (const name of required) {
    if (!(name in props)) {
      throw new SevenError({ code: "VALIDATION", message: "MCP required property is not declared." });
    }
  }
  const shape: Record<string, ZodTypeAny> = {};
  for (const [name, child] of Object.entries(props)) {
    if (!name || name.length > 128) {
      throw new SevenError({ code: "VALIDATION", message: "MCP property name is invalid." });
    }
    const compiled = compileNode(child, depth + 1);
    shape[name] = required.has(name) ? compiled : compiled.optional();
  }
  return z.object(shape).strict();
}

function compileNode(value: unknown, depth: number): ZodTypeAny {
  if (depth > MAX_DEPTH) {
    throw new SevenError({ code: "VALIDATION", message: "MCP tool schema nesting is too deep." });
  }
  const node = object(value, "MCP JSON Schema node");
  const type = node.type;
  if (typeof type !== "string") {
    throw new SevenError({ code: "VALIDATION", message: "MCP tool schema node must declare a single type." });
  }
  switch (type) {
    case "object": return compileObject(node, depth);
    case "string": return compileString(node);
    case "number": return compileNumber(node, false);
    case "integer": return compileNumber(node, true);
    case "boolean":
      assertOnlyKeys(node, ["type"]);
      return z.boolean();
    case "array": return compileArray(node, depth);
    default:
      throw new SevenError({ code: "VALIDATION", message: `Unsupported MCP JSON Schema type: ${type}.` });
  }
}

export function compileMcpInputSchema(schema: unknown): z.ZodType<Record<string, unknown>> {
  const node = object(schema, "MCP tool inputSchema");
  if (node.type !== "object") {
    throw new SevenError({ code: "VALIDATION", message: "MCP tool inputSchema root must be object." });
  }
  return compileObject(node, 0) as z.ZodType<Record<string, unknown>>;
}
