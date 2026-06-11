import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LOCALES, LOCALE_KEYS, getLocaleConfig, getLocaleData, t } from '@/lib/i18n';
import { SiteFooter } from '@/components/shared/SiteFooter';

export const revalidate = 3600;
export const dynamicParams = false;

export async function generateStaticParams() {
  return LOCALE_KEYS.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const cfg = getLocaleConfig(locale);
  const data = getLocaleData(locale);
  if (!cfg || !data) return { title: 'Not Found' };

  const url = `https://au7o.io/${locale}`;
  const title = `Au7o — ${t(locale, 'knownIssues', 'Known Issues')}`;
  const description = t(
    locale,
    'diagnosePitch',
    'Snap a photo or describe the problem and let Au7o confirm the likely cause for your exact vehicle — free.',
  );

  // Every locale home cross-references its siblings + the English root.
  const languages: Record<string, string> = { en: 'https://au7o.io', 'x-default': 'https://au7o.io' };
  for (const key of LOCALE_KEYS) languages[LOCALES[key].code] = `https://au7o.io/${key}`;

  return {
    title,
    description,
    openGraph: { title, description, type: 'website', url, siteName: 'Au7o', locale: cfg.ogLocale },
    alternates: { canonical: url, languages },
  };
}

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cfg = getLocaleConfig(locale);
  const data = getLocaleData(locale);
  if (!cfg || !data) notFound();

  const tr = (key: string, fallback: string) => t(locale, key, fallback);
  const models = [...data.models].sort((a, b) => b.issues.length - a.issues.length);

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F2' }}>
      <header
        className="px-6 py-4"
        style={{ borderBottom: '1px solid #E3DFD4' }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <Image src="/og-image.png" alt="Au7o" width={32} height={32} className="rounded-lg" />
            <span className="text-2xl font-bold text-[#0B1220] tracking-tight">
              Au<span className="text-blue-600">7</span>o
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="px-3 py-2 text-sm font-medium text-[#475569] hover:text-[#0B1220] transition-colors" hrefLang="en">
              English
            </Link>
            <Link href="/" className="px-4 py-2 text-sm font-semibold bg-[#0B1220] text-white rounded-lg hover:opacity-90 transition-opacity">
              {tr('diagnoseCta', 'Diagnose my car')}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Hero */}
        <section className="mb-10">
          <div className="text-[11px] font-semibold uppercase mb-3 tracking-wider text-blue-600">
            {data.languageName} · Au7o
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0B1220] mb-4">
            {tr('knownIssues', 'Known Issues')}
          </h1>
          <p className="text-[#475569] leading-relaxed max-w-2xl mb-6">
            {tr('diagnosePitch', 'Snap a photo or describe the problem and let Au7o confirm the likely cause for your exact vehicle — free.')}
          </p>
          <Link href="/" className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition-colors">
            {tr('diagnoseFreeCta', 'Diagnose my car free')}
          </Link>
        </section>

        {/* Translated model pages */}
        <section>
          <h2 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-4">
            {tr('knownIssues', 'Known Issues')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {models.map((m) => (
              <Link
                key={m.slug}
                href={`/${locale}/known-issues/${m.slug}`}
                className="bg-white border border-[#E3DFD4] rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="font-semibold text-[#0B1220]">{m.make} {m.model}</div>
                <div className="text-sm text-[#64748B] mt-1">
                  {m.issues.length} {tr('documentedProblems', 'documented problems')}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <p className="text-xs text-[#94A3B8] mt-10">
          {tr('aiDisclaimer', 'Compiled with AI assistance from owner reports, NHTSA data, and manufacturer bulletins — may contain errors.')}
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
