import type { MemoryKind, MemoryScope, MemoryTier } from "../../domain/memory/fabric";

export type MemoryCandidate = Readonly<{
  kind: MemoryKind;
  tier: MemoryTier;
  scope: MemoryScope;
  canonicalKey: string;
  content: string;
  tags: readonly string[];
  importance: number;
  confidence: number;
}>;

function normalizeArabic(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه");
}

function clean(value: string): string {
  return value.trim().replace(/[\s\u00A0]+/g, " ").replace(/[.!؟?،,;؛]+$/u, "").trim();
}

function stableKey(value: string): string {
  let h = 2166136261;
  for (const ch of value.toLocaleLowerCase("en-US")) {
    h ^= ch.codePointAt(0) ?? 0;
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function instructionLike(text: string): boolean {
  const n = normalizeArabic(text.toLocaleLowerCase("en-US"));
  return /\b(ignore|override|disregard|reveal|bypass)\b.{0,40}\b(system|instruction|prompt|policy|safety)\b/.test(n) ||
    /\b(act as|pretend to be)\b/.test(n) ||
    /تجاهل.{0,40}(تعليمات|نظام|سياس|امان|سلام)/u.test(n) ||
    /(اكشف|اظهر).{0,30}(برومبت|تعليمات النظام)/u.test(n);
}

function secretLike(text: string): boolean {
  const lower = text.toLocaleLowerCase("en-US");
  return /\b(password|passcode|otp|one[- ]?time code|api[_ -]?key|access[_ -]?token|bearer|secret)\b/.test(lower) ||
    /(?:sk|ghp|github_pat)_[A-Za-z0-9_-]{12,}/.test(text) ||
    /\b\d{6}\b/.test(text) && /code|otp|رمز/.test(lower + " " + normalizeArabic(text));
}

function memoryTags(content:string, base:readonly string[]):readonly string[]{
  const stop=new Set(["the","and","for","with","that","this","from","my","your","our","انا","أنا","هذا","هذه","من","في","على","مع"]);
  const normalized=normalizeArabic(content.toLocaleLowerCase("en-US"));
  const salient=(normalized.match(/[\\p{L}\\p{N}_-]{3,}/gu)??[]).filter(token=>!stop.has(token)&&!/^\\d+$/.test(token));
  return Object.freeze([...new Set([...base,...salient])].slice(0,16));
}

function preferenceKey(subject: string): { key: string; tags: readonly string[] } {
  const n = normalizeArabic(subject.toLocaleLowerCase("en-US"));
  if (/\b(theme|mode|dark|light)\b/.test(n) || /مظهر|ثيم|داكن|فاتح|الوضع/.test(n)) {
    return { key: "preference:theme", tags: ["preference","theme"] };
  }
  if (/\b(answer|response|concise|verbose|short|long)\b/.test(n) || /رد|اجابه|مختصر|مفصل|قصير|طويل/.test(n)) {
    return { key: "preference:response-style", tags: ["preference","response-style"] };
  }
  if (/\b(language|arabic|english)\b/.test(n) || /لغه|عربي|انجليزي/.test(n)) {
    return { key: "preference:language", tags: ["preference","language"] };
  }
  return { key: `preference:${stableKey(n)}`, tags: ["preference"] };
}

export function isSafeMemoryContent(input:string):boolean{
  const text=clean(input);
  return !!text && text.length<=1200 && !secretLike(text) && !instructionLike(text);
}

function candidate(
  kind: MemoryKind,
  tier: MemoryTier,
  scope: MemoryScope,
  canonicalKey: string,
  content: string,
  tags: readonly string[],
  importance: number,
  confidence: number,
): MemoryCandidate | null {
  const cleaned = clean(content);
  if (!isSafeMemoryContent(cleaned)) return null;
  return Object.freeze({ kind, tier, scope, canonicalKey, content: cleaned, tags: memoryTags(cleaned,tags), importance, confidence });
}

export function extractMemoryCandidates(input: string): readonly MemoryCandidate[] {
  const text = clean(input);
  if (!text || secretLike(text) || instructionLike(text)) return Object.freeze([]);
  const out: MemoryCandidate[] = [];
  const push = (value: MemoryCandidate | null) => { if (value && !out.some(x => x.canonicalKey === value.canonicalKey && x.content === value.content)) out.push(value); };

  let m = text.match(/^(?:please\s+)?remember(?:\s+that)?\s+(.+)$/iu);
  if (m?.[1]) {
    const body = clean(m[1]);
    const roomScope = /\b(?:in|for) this (?:chat|conversation)\b/iu.test(body);
    push(candidate("fact","core",roomScope ? "room" : "global",`explicit:${stableKey(body)}`,body,["explicit"],0.98,0.99));
  }

  m = text.match(/^(?:تذكر|تذكّر)(?:\s+(?:ان|أن))?\s+(.+)$/u);
  if (m?.[1]) {
    const body = clean(m[1]);
    const roomScope = /في (?:هذه|هذي) (?:المحادثه|المحادثة|الدردشه|الدردشة)/u.test(body);
    push(candidate("fact","core",roomScope ? "room" : "global",`explicit:${stableKey(normalizeArabic(body))}`,body,["explicit","arabic"],0.98,0.99));
  }

  m = text.match(/^my name is\s+(.+)$/iu) ?? text.match(/^call me\s+(.+)$/iu);
  if (m?.[1]) push(candidate("profile","core","global","profile:name",text,["profile","name"],1,0.99));

  m = text.match(/^اسمي\s+(.+)$/u) ?? text.match(/^(?:نادني|يمكنك مناداتي)\s+(.+)$/u);
  if (m?.[1]) push(candidate("profile","core","global","profile:name",text,["profile","name","arabic"],1,0.99));

  m = text.match(/^i\s+(?:really\s+)?(prefer|like|love|hate|dislike)\s+(.+)$/iu);
  if (m?.[2]) {
    const meta = preferenceKey(m[2]);
    push(candidate("preference","recall","global",meta.key,text,meta.tags,0.88,0.96));
  }

  m = text.match(/^(?:[اأإآ]نا\s+)?(افضل|أفضل|احب|أحب|اكره|أكره)\s+(.+)$/u);
  if (m?.[2]) {
    const meta = preferenceKey(m[2]);
    push(candidate("preference","recall","global",meta.key,text,[...meta.tags,"arabic"],0.88,0.96));
  }

  m = text.match(/^my (?:main )?goal is\s+(.+)$/iu);
  if (m?.[1]) push(candidate("goal","recall","global",`goal:${stableKey(m[1])}`,text,["goal"],0.9,0.95));

  m = text.match(/^هدفي(?:\s+هو)?\s+(.+)$/u);
  if (m?.[1]) push(candidate("goal","recall","global",`goal:${stableKey(normalizeArabic(m[1]))}`,text,["goal","arabic"],0.9,0.95));

  m = text.match(/^i(?:'m| am)\s+(studying|learning|working on)\s+(.+)$/iu);
  if (m?.[2]) push(candidate("profile","recall","global","profile:current-work",text,["profile","work"],0.82,0.92));

  m = text.match(/^(?:[اأإآ]نا\s+)?(ادرس|أدرس|اتعلم|أتعلم|اعمل على|أعمل على)\s+(.+)$/u);
  if (m?.[2]) push(candidate("profile","recall","global","profile:current-work",text,["profile","work","arabic"],0.82,0.92));

  return Object.freeze(out);
}
