import type { SevenLocale } from "../shell/shell-store";

export type SevenCopy = Readonly<{
  eyebrow: string;
  title: string;
  status: string;
  core: string;
  research: string;
  build: string;
  world: string;
  headline: string;
  description: string;
  check: string;
  theme: string;
  language: string;
}>;

const COPY: Record<SevenLocale, SevenCopy> = {
  en: Object.freeze({
    eyebrow: "SEVEN REMAKE V3",
    title: "Seven",
    status: "Runtime ready",
    core: "Core",
    research: "Research",
    build: "Build",
    world: "World",
    headline: "One runtime. Explicit state.",
    description: "Seven now exposes a single mobile-first shell for Core, Research, Build and World.",
    check: "Check runtime",
    theme: "Theme",
    language: "العربية",
  }),
  ar: Object.freeze({
    eyebrow: "SEVEN REMAKE V3",
    title: "Seven",
    status: "النظام جاهز",
    core: "الأساسي",
    research: "البحث",
    build: "البناء",
    world: "العالم",
    headline: "نظام واحد. حالة واضحة.",
    description: "يعرض Seven الآن واجهة موحّدة ومصممة للهاتف للأوضاع الأساسية والبحث والبناء والعالم.",
    check: "فحص النظام",
    theme: "المظهر",
    language: "English",
  }),
};

export function sevenCopy(locale: SevenLocale): SevenCopy {
  return COPY[locale];
}
