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

function hasToken(value:string, terms:readonly string[]):boolean {
  const set=new Set(value.match(/[\p{L}\p{N}_-]+/gu)??[]);
  return terms.some(term=>set.has(term));
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

  const personalStateQuestion =
    /\b(where do i live|where am i based|where am i from|who am i|what am i (?:studying|learning|working on)|what do i (?:study|learn|like|love|hate|prefer)|which .{0,32} do i (?:use|prefer|like)|do i have|have i told you)\b/.test(q) ||
    /(?:اين|وين) (?:اسكن|اعيش|ساكن)|ماذا (?:ادرس|اتعلم|احب|اكره|افضل)|ما الذي (?:ادرسه|اتعلمه|احبه|اكرهه|افضله)|من انا|ما (?:اسمي|هدفي|مشروعي)|هل لدي|هل اخبرتك/.test(q);

  const personal =
    /\b(my|mine|me|for me|i prefer|i like|i love|i hate|my goal|my project|my device|my phone|my name)\b/.test(q) ||
    /\bwhat do i\b/.test(q) ||
    personalStateQuestion ||
    hasToken(q,["لي","خاصتي","اسمي","هدفي","مشروعي","هاتفي","جهازي","افضل","احب","اكره"]) ||
    /ماذا تعرف عني|ما الذي تعرفه عني/.test(q);
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
