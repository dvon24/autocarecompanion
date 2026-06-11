import ptBr from '@/data/i18n/pt-br.json';
import es from '@/data/i18n/es.json';
import de from '@/data/i18n/de.json';
import fr from '@/data/i18n/fr.json';
import ko from '@/data/i18n/ko.json';

/**
 * Locale-generic i18n layer. Adding a language is two lines: import its
 * data file + add a LOCALES entry. The [locale] route, sitemap, and
 * hreflang all read from here, so nothing else changes.
 */

export interface LocaleConfig {
  key: string; // URL prefix, e.g. 'pt-br'
  code: string; // BCP-47, e.g. 'pt-BR'
  label: string; // native name shown in the language switcher
  ogLocale: string; // og:locale, e.g. 'pt_BR'
  htmlLang: string; // <html lang>, e.g. 'pt-BR'
}

export const LOCALES: Record<string, LocaleConfig> = {
  'pt-br': { key: 'pt-br', code: 'pt-BR', label: 'Português (Brasil)', ogLocale: 'pt_BR', htmlLang: 'pt-BR' },
  es: { key: 'es', code: 'es', label: 'Español', ogLocale: 'es_ES', htmlLang: 'es' },
  de: { key: 'de', code: 'de', label: 'Deutsch', ogLocale: 'de_DE', htmlLang: 'de' },
  fr: { key: 'fr', code: 'fr', label: 'Français', ogLocale: 'fr_FR', htmlLang: 'fr' },
  ko: { key: 'ko', code: 'ko', label: '한국어', ogLocale: 'ko_KR', htmlLang: 'ko' },
  // To add a language: import its data file, add a LOCALES entry, and
  // register it in DATA below. Routes, sitemap, and hreflang follow.
};

export const LOCALE_KEYS = Object.keys(LOCALES);

export interface TIssue {
  id: string;
  title: string;
  description: string;
  solution: string;
  symptoms: string[];
  severity: string;
  category: string;
  costLow: number | null;
  costHigh: number | null;
  dtcCodes: string[];
  reportCount: number;
}
export interface TModel {
  slug: string;
  make: string;
  model: string;
  h1: string;
  intro: string;
  issues: TIssue[];
}
export interface LocaleData {
  locale: string;
  languageName: string;
  chrome: Record<string, string>;
  models: TModel[];
}

const DATA: Record<string, LocaleData> = {
  'pt-br': ptBr as unknown as LocaleData,
  es: es as unknown as LocaleData,
  de: de as unknown as LocaleData,
  fr: fr as unknown as LocaleData,
  ko: ko as unknown as LocaleData,
};

export function isLocale(key: string): boolean {
  return Object.prototype.hasOwnProperty.call(LOCALES, key);
}
export function getLocaleConfig(key: string): LocaleConfig | null {
  return LOCALES[key] || null;
}
export function getLocaleData(key: string): LocaleData | null {
  return DATA[key] || null;
}
export function getTranslatedModel(key: string, slug: string): TModel | null {
  const d = DATA[key];
  if (!d) return null;
  return d.models.find((m) => m.slug === slug) || null;
}
export function t(key: string, str: string, fallback = ''): string {
  const d = DATA[key];
  return (d && d.chrome[str]) || fallback || str;
}

/** All (locale, slug) pairs that have a translation — for generateStaticParams. */
export function getAllLocaleSlugParams(): { locale: string; slug: string }[] {
  const out: { locale: string; slug: string }[] = [];
  for (const key of LOCALE_KEYS) {
    const d = DATA[key];
    if (!d) continue;
    for (const m of d.models) out.push({ locale: key, slug: m.slug });
  }
  return out;
}

/** Which locales translate a given (English) slug — for hreflang on the English page. */
export function getLocalesForSlug(slug: string): string[] {
  return LOCALE_KEYS.filter((key) => {
    const d = DATA[key];
    return !!d && d.models.some((m) => m.slug === slug);
  });
}

/** hreflang alternates map for a slug, given the English URL. Always includes x-default → English. */
export function hreflangFor(slug: string, enUrl: string): Record<string, string> {
  const langs: Record<string, string> = { en: enUrl, 'x-default': enUrl };
  for (const key of getLocalesForSlug(slug)) {
    const cfg = LOCALES[key];
    langs[cfg.code] = `https://au7o.io/${key}/known-issues/${slug}`;
  }
  return langs;
}
