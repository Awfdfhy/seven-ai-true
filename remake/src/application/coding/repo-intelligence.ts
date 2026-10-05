import type { RepositoryFile, RepositorySnapshot } from "./contracts";
import { canonicalRepositoryPath } from "./workspace-truth";

export type RepositoryLanguage =
  | "typescript"
  | "javascript"
  | "json"
  | "markdown"
  | "css"
  | "html"
  | "java"
  | "kotlin"
  | "python"
  | "shell"
  | "yaml"
  | "text"
  | "unknown";

export type RepositorySymbol = Readonly<{
  path: string;
  name: string;
  kind: "function" | "class" | "interface" | "type" | "variable" | "method";
  line: number;
  exported: boolean;
}>;

export type RepositoryImport = Readonly<{
  path: string;
  specifier: string;
  line: number;
}>;

export type RepositoryIntelligence = Readonly<{
  version: 1;
  headSha: string;
  snapshotFingerprint: string;
  languages: Readonly<Record<string, number>>;
  symbols: readonly RepositorySymbol[];
  imports: readonly RepositoryImport[];
  testPaths: readonly string[];
  instructionPaths: readonly string[];
  buildPaths: readonly string[];
}>;

export type RepoMapEntry = Readonly<{
  path: string;
  score: number;
  language: RepositoryLanguage;
  symbols: readonly string[];
  reasons: readonly string[];
}>;

export type RepositoryMap = Readonly<{
  version: 1;
  query: string;
  headSha: string;
  snapshotFingerprint: string;
  entries: readonly RepoMapEntry[];
  omittedCount: number;
  estimatedChars: number;
}>;

const EXTENSION_LANGUAGE: Readonly<Record<string, RepositoryLanguage>> = Object.freeze({
  ts: "typescript", tsx: "typescript", mts: "typescript", cts: "typescript",
  js: "javascript", jsx: "javascript", mjs: "javascript", cjs: "javascript",
  json: "json", md: "markdown", mdx: "markdown", css: "css", scss: "css",
  html: "html", htm: "html", java: "java", kt: "kotlin", kts: "kotlin",
  py: "python", sh: "shell", bash: "shell", yml: "yaml", yaml: "yaml",
  txt: "text",
});

function languageFor(path: string): RepositoryLanguage {
  const clean = canonicalRepositoryPath(path);
  const name = clean.split("/").at(-1) ?? clean;
  const extension = name.includes(".") ? name.split(".").at(-1)!.toLowerCase() : "";
  return EXTENSION_LANGUAGE[extension] ?? "unknown";
}

function isTestPath(path: string): boolean {
  return /(^|\/)(?:test|tests|__tests__)(\/|$)/i.test(path) || /\.(?:test|spec)\.[^.]+$/i.test(path);
}

function isInstructionPath(path: string): boolean {
  return /(^|\/)(?:AGENTS|CLAUDE|GEMINI)\.md$/i.test(path) ||
    /^\.github\/copilot-instructions\.md$/i.test(path) ||
    /(^|\/)README\.md$/i.test(path);
}

function isBuildPath(path: string): boolean {
  return /(^|\/)(package(?:-lock)?\.json|pnpm-lock\.yaml|yarn\.lock|tsconfig[^/]*\.json|vite\.config\.[^/]+|gradle\.properties|settings\.gradle(?:\.kts)?|build\.gradle(?:\.kts)?|pom\.xml)$/i.test(path) ||
    /^\.github\/workflows\//i.test(path);
}

function lineNumber(content: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i += 1) if (content.charCodeAt(i) === 10) line += 1;
  return line;
}

function extractSymbols(file: RepositoryFile): readonly RepositorySymbol[] {
  const language = languageFor(file.path);
  if (language !== "typescript" && language !== "javascript") return Object.freeze([]);
  const out: RepositorySymbol[] = [];
  const pattern = /(^|\n)[\t ]*(export[\t ]+)?(?:default[\t ]+)?(?:(async)[\t ]+)?(function|class|interface|type|const|let|var)[\t ]+([A-Za-z_$][\w$]*)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(file.content))) {
    const rawKind = match[4]!;
    const kind: RepositorySymbol["kind"] =
      rawKind === "function" ? "function" :
      rawKind === "class" ? "class" :
      rawKind === "interface" ? "interface" :
      rawKind === "type" ? "type" : "variable";
    out.push(Object.freeze({
      path: file.path,
      name: match[5]!,
      kind,
      line: lineNumber(file.content, match.index),
      exported: Boolean(match[2]),
    }));
    if (out.length >= 400) break;
  }
  return Object.freeze(out);
}

function extractImports(file: RepositoryFile): readonly RepositoryImport[] {
  const language = languageFor(file.path);
  if (language !== "typescript" && language !== "javascript") return Object.freeze([]);
  const out: RepositoryImport[] = [];
  const patterns = [
    /(?:import|export)[\s\S]{0,240}?\bfrom\s*["']([^"']+)["']/g,
    /\brequire\(\s*["']([^"']+)["']\s*\)/g,
    /\bimport\(\s*["']([^"']+)["']\s*\)/g,
  ];
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(file.content))) {
      out.push(Object.freeze({ path: file.path, specifier: match[1]!, line: lineNumber(file.content, match.index) }));
      if (out.length >= 400) return Object.freeze(out);
    }
  }
  return Object.freeze(out);
}

function terms(value: string): readonly string[] {
  return Object.freeze([
    ...new Set(
      value
        .normalize("NFKC")
        .toLocaleLowerCase("en-US")
        .match(/[\p{L}\p{N}_-]{2,}/gu) ?? [],
    ),
  ]);
}

function scorePath(path: string, queryTerms: readonly string[]): { score: number; reasons: string[] } {
  const lower = path.toLocaleLowerCase("en-US");
  let score = 0;
  const reasons: string[] = [];
  for (const term of queryTerms) {
    if (lower === term) { score += 20; reasons.push(`exact-path:${term}`); }
    else if (lower.includes(term)) { score += 6; reasons.push(`path:${term}`); }
  }
  if (isTestPath(path)) score += 1;
  if (isBuildPath(path)) score += 1;
  return { score, reasons };
}

export function buildRepositoryIntelligence(snapshot: RepositorySnapshot): RepositoryIntelligence {
  const languages: Record<string, number> = {};
  const symbols: RepositorySymbol[] = [];
  const imports: RepositoryImport[] = [];
  const testPaths: string[] = [];
  const instructionPaths: string[] = [];
  const buildPaths: string[] = [];
  for (const file of snapshot.files) {
    const language = languageFor(file.path);
    languages[language] = (languages[language] ?? 0) + 1;
    symbols.push(...extractSymbols(file));
    imports.push(...extractImports(file));
    if (isTestPath(file.path)) testPaths.push(file.path);
    if (isInstructionPath(file.path)) instructionPaths.push(file.path);
    if (isBuildPath(file.path)) buildPaths.push(file.path);
  }
  symbols.sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line || a.name.localeCompare(b.name));
  imports.sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line || a.specifier.localeCompare(b.specifier));
  return Object.freeze({
    version: 1,
    headSha: snapshot.headSha,
    snapshotFingerprint: snapshot.fingerprint,
    languages: Object.freeze({ ...languages }),
    symbols: Object.freeze(symbols),
    imports: Object.freeze(imports),
    testPaths: Object.freeze(testPaths.sort()),
    instructionPaths: Object.freeze(instructionPaths.sort()),
    buildPaths: Object.freeze(buildPaths.sort()),
  });
}

export function buildRepositoryMap(
  snapshot: RepositorySnapshot,
  query: string,
  options: Readonly<{ maxEntries?: number; charBudget?: number }> = {},
): RepositoryMap {
  const cleanQuery = query.trim();
  if (!cleanQuery) throw new Error("Repository map query must not be empty.");
  const maxEntries = options.maxEntries ?? 24;
  const charBudget = options.charBudget ?? 12_000;
  if (!Number.isSafeInteger(maxEntries) || maxEntries < 1 || maxEntries > 200) throw new Error("Repository map maxEntries is invalid.");
  if (!Number.isSafeInteger(charBudget) || charBudget < 512 || charBudget > 200_000) throw new Error("Repository map charBudget is invalid.");
  const intelligence = buildRepositoryIntelligence(snapshot);
  const queryTerms = terms(cleanQuery);
  const symbolsByPath = new Map<string, RepositorySymbol[]>();
  for (const symbol of intelligence.symbols) {
    const list = symbolsByPath.get(symbol.path) ?? [];
    list.push(symbol);
    symbolsByPath.set(symbol.path, list);
  }
  const importsByPath = new Map<string, RepositoryImport[]>();
  for (const item of intelligence.imports) {
    const list = importsByPath.get(item.path) ?? [];
    list.push(item);
    importsByPath.set(item.path, list);
  }

  const ranked = snapshot.files.map((file) => {
    const pathScore = scorePath(file.path, queryTerms);
    let score = pathScore.score;
    const reasons = [...pathScore.reasons];
    const fileSymbols = symbolsByPath.get(file.path) ?? [];
    for (const symbol of fileSymbols) {
      const normalized = symbol.name.toLocaleLowerCase("en-US");
      for (const term of queryTerms) {
        if (normalized === term) { score += 14; reasons.push(`symbol:${symbol.name}`); }
        else if (normalized.includes(term)) { score += 7; reasons.push(`symbol:${symbol.name}`); }
      }
    }
    for (const item of importsByPath.get(file.path) ?? []) {
      const normalized = item.specifier.toLocaleLowerCase("en-US");
      if (queryTerms.some((term) => normalized.includes(term))) {
        score += 3;
        reasons.push(`import:${item.specifier}`);
      }
    }
    if (intelligence.instructionPaths.includes(file.path)) { score += 2; reasons.push("repository-instruction"); }
    if (intelligence.buildPaths.includes(file.path)) { score += 1; reasons.push("build-surface"); }
    return {
      path: file.path,
      score,
      language: languageFor(file.path),
      symbols: fileSymbols.slice(0, 12).map((symbol) => symbol.name),
      reasons: [...new Set(reasons)].slice(0, 12),
    } satisfies RepoMapEntry;
  }).sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));

  const entries: RepoMapEntry[] = [];
  let estimatedChars = 0;
  for (const entry of ranked) {
    if (entries.length >= maxEntries) break;
    const cost = entry.path.length + entry.symbols.join(",").length + entry.reasons.join(",").length + 64;
    if (entries.length > 0 && estimatedChars + cost > charBudget) break;
    entries.push(Object.freeze({ ...entry, symbols: Object.freeze(entry.symbols), reasons: Object.freeze(entry.reasons) }));
    estimatedChars += cost;
  }
  return Object.freeze({
    version: 1,
    query: cleanQuery,
    headSha: snapshot.headSha,
    snapshotFingerprint: snapshot.fingerprint,
    entries: Object.freeze(entries),
    omittedCount: Math.max(0, ranked.length - entries.length),
    estimatedChars,
  });
}
