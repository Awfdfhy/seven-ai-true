export type MemoryIntentMode = "none" | "core" | "recall" | "history";

export type MemoryIntent = Readonly<{
  mode: MemoryIntentMode;
  reasons: readonly string[];
}>;

function normalize(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase("en-US")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه");
}

export function classifyMemoryIntent(query: string): MemoryIntent {
  const q = normalize(query.trim());
  if (!q) return Object.freeze({ mode: "none", reasons: Object.freeze(["empty"]) });

  const reasons: string[] = [];
  const historical =
    /\b(previous|previously|before|used to|formerly|past|last time|earlier)\b/.test(q) ||
    /سابق|سابقا|قبل|قديم|الماضي|المره السابقه|المرة السابقة|كنت افضل|كنت احب/.test(q);
  if (historical) {
    reasons.push("historical-reference");
    return Object.freeze({ mode: "history", reasons: Object.freeze(reasons) });
  }

  const explicitMemory =
    /\b(remember|memory|recall|you know|we discussed|we talked|continue from|as before)\b/.test(q) ||
    /تذكر|ذاكره|الذاكره|تتذكر|كما ناقشنا|كما تحدثنا|اكمل من|أكمل من/.test(q);
  if (explicitMemory) reasons.push("explicit-memory-reference");

  const personal =
    /\b(my|mine|me|for me|i prefer|i like|i love|i hate|my goal|my project|my device|my phone|my name)\b/.test(q) ||
    /\bwhat do i\b/.test(q) ||
    /لي|خاصتي|اسمي|هدفي|مشروعي|هاتفي|جهازي|افضل|أفضّل|احب|أحب|اكره|أكره|ماذا تعرف عني|ما الذي تعرفه عني/.test(q);
  if (personal) reasons.push("personal-reference");

  const preference =
    /\b(prefer|preference|theme|style|language|name|goal|project|device|phone)\b/.test(q) ||
    /تفضيل|مظهر|ثيم|اسلوب|أسلوب|لغه|لغة|اسم|هدف|مشروع|جهاز|هاتف/.test(q);
  if (preference) reasons.push("profile-or-preference");

  const continuity =
    /\b(continue|resume|again|same project|that project|our project|that plan|our plan)\b/.test(q) ||
    /اكمل|أكمل|تابع|مره اخرى|مرة أخرى|نفس المشروع|ذلك المشروع|مشروعنا|خطتنا/.test(q);
  if (continuity) reasons.push("continuity");

  if (explicitMemory || continuity) {
    return Object.freeze({ mode: "recall", reasons: Object.freeze(reasons) });
  }
  if (personal || preference) {
    return Object.freeze({ mode: "core", reasons: Object.freeze(reasons) });
  }

  return Object.freeze({ mode: "none", reasons: Object.freeze(["self-contained"]) });
}
