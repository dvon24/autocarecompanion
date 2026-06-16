import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import {
  getAllSpecSlugs,
  getSpecVehicle,
  amazonSearchLink,
  specLabel,
  type SpecGeneration,
} from '@/lib/specs';
import { TechnicalArticleJsonLd, BreadcrumbJsonLd, FAQJsonLd } from '@/components/seo/JsonLd';
import { SiteFooter } from '@/components/shared/SiteFooter';

export const revalidate = 3600;
export const dynamicParams = true;

const BASE = 'https://au7o.io';

export async function generateStaticParams() {
  return getAllSpecSlugs().map((s) => ({ slug: s.slug }));
}

function yearRange(gens: SpecGeneration[]): { min: number; max: number } {
  const starts = gens.map((g) => g.yearStart);
  const ends = gens.map((g) => g.yearEnd);
  return { min: Math.min(...starts), max: Math.max(...ends) };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const v = getSpecVehicle(slug);
  if (!v) {
    return { title: 'Vehicle specs not found · Au7o', robots: { index: false, follow: true } };
  }
  const { min, max } = yearRange(v.generations);
  const vehicleName = `${v.make} ${v.model}`;
  const yr = min === max ? `${min}` : `${min}–${max}`;
  const title = `${yr} ${vehicleName} Fluid Types & Capacities — Oil, Coolant & Specs`;
  const description = `${vehicleName} fluid specs: engine oil type & capacity, coolant, transmission, brake fluid, spark plugs and torque specs for the ${yr} model years. Sourced from manufacturer data.`;
  const url = `${BASE}/specs/${slug}`;
  return {
    title: { absolute: `${title} | Au7o` },
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'article', siteName: 'Au7o' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

function FluidRow({ label, type, capacity, note, buy }: { label: string; type: string; capacity?: string; note?: string; buy?: string }) {
  return (
    <tr style={{ borderBottom: '1px solid #EDEAE1' }}>
      <td style={{ padding: '12px 10px', fontWeight: 600, color: '#0B1220', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{label}</td>
      <td style={{ padding: '12px 10px', color: '#334155', verticalAlign: 'top' }}>
        {type}
        {note && <div style={{ fontSize: 12.5, color: '#B45309', marginTop: 4 }}>⚠ {note}</div>}
      </td>
      <td style={{ padding: '12px 10px', color: '#0B1220', fontWeight: 600, verticalAlign: 'top', whiteSpace: 'nowrap' }}>{capacity ?? '—'}</td>
      <td style={{ padding: '12px 10px', verticalAlign: 'top', textAlign: 'right', whiteSpace: 'nowrap' }}>
        {buy && (
          <a
            href={amazonSearchLink(buy)}
            target="_blank"
            rel="nofollow sponsored noopener"
            style={{ fontSize: 13, fontWeight: 600, color: '#3B82F6', textDecoration: 'none' }}
          >
            Shop ↗
          </a>
        )}
      </td>
    </tr>
  );
}

export default async function SpecsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = getSpecVehicle(slug);
  if (!v) notFound();

  const { min, max } = yearRange(v.generations);
  const vehicleName = `${v.make} ${v.model}`;
  const yr = min === max ? `${min}` : `${min}–${max}`;
  const url = `${BASE}/specs/${slug}`;
  const makeSlugForUrl = v.make.toLowerCase().replace(/\s+/g, '-');
  const auditedAt = v.generations.map((g) => g.auditedAt).filter(Boolean).sort().pop() || '2026-06-16';

  // FAQ schema built from the first generation's headline fluids.
  const g0 = v.generations[0];
  const faqs: { question: string; answer: string }[] = [];
  if (g0?.fluids.engineOil) {
    faqs.push({
      question: `What oil does a ${vehicleName} take?`,
      answer: `The ${yr} ${vehicleName} (${g0.engine ?? 'as equipped'}) uses ${g0.fluids.engineOil.type}${g0.fluids.engineOil.capacity ? `, capacity ${g0.fluids.engineOil.capacity}` : ''}.`,
    });
  }
  if (g0?.fluids.coolant) {
    faqs.push({
      question: `What coolant does a ${vehicleName} use?`,
      answer: `${g0.fluids.coolant.type}${g0.fluids.coolant.capacity ? `, ${g0.fluids.coolant.capacity}` : ''}.`,
    });
  }

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F2' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 px-6 py-4"
        style={{
          background: 'rgba(247,246,242,0.85)',
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          borderBottom: '1px solid #E3DFD4',
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/og-image.png" alt="Au7o mascot" width={32} height={32} className="rounded-lg" />
            <span className="text-2xl font-bold tracking-tight" style={{ color: '#0B1220' }}>
              Au<span style={{ color: '#3B82F6' }}>7</span>o
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href={`/known-issues/${slug}`} className="px-3 sm:px-4 py-2 text-sm font-medium text-[#475569] hover:text-[#0B1220] transition-colors hidden sm:inline-block">
              Known Issues
            </Link>
            <Link href="/specs" className="px-3 sm:px-4 py-2 text-sm font-medium text-[#475569] hover:text-[#0B1220] transition-colors hidden sm:inline-block">
              All Specs
            </Link>
          </div>
        </div>
      </header>

      <TechnicalArticleJsonLd
        title={`${yr} ${vehicleName} Fluid Types, Capacities & Specs`}
        description={`Engine oil, coolant, transmission, brake fluid and torque specs for the ${yr} ${vehicleName}.`}
        url={url}
        datePublished="2026-06-16"
        dateModified={auditedAt}
      />
      {faqs.length > 0 && <FAQJsonLd questions={faqs} />}
      <BreadcrumbJsonLd
        items={[
          { name: 'Au7o', url: BASE },
          { name: 'Specs', url: `${BASE}/specs` },
          { name: v.make, url: `${BASE}/specs` },
          { name: vehicleName, url },
        ]}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6" style={{ color: '#94A3B8' }} aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li><Link href="/" className="hover:text-gray-600">Au7o</Link></li>
            <li style={{ color: '#CBD5E1' }}>/</li>
            <li><Link href="/specs" className="hover:text-gray-600">Specs</Link></li>
            <li style={{ color: '#CBD5E1' }}>/</li>
            <li className="font-medium" style={{ color: '#334155' }}>{vehicleName}</li>
          </ol>
        </nav>

        <header className="mb-5">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: '#0B1220' }}>
            {yr} {vehicleName} Fluid Types &amp; Capacities
          </h1>
          <p className="mt-3 text-base sm:text-lg" style={{ color: '#475569', lineHeight: 1.6 }}>
            Engine oil, coolant, transmission, brake fluid, differential and key torque specs for the {yr} {vehicleName}.
            Capacities are from manufacturer service data — always confirm against your owner&apos;s manual and dipstick before
            a fill.
          </p>
        </header>

        {/* Cross-link to known issues */}
        <Link
          href={`/known-issues/${slug}`}
          className="inline-flex items-center gap-1.5 mb-7 text-sm font-medium"
          style={{ color: '#3B82F6' }}
        >
          See known issues &amp; common problems for the {v.model} →
        </Link>

        {/* Per-generation spec tables */}
        {v.generations.map((g) => (
          <section key={g.label} className="mb-9">
            <h2 className="text-lg font-bold mb-1" style={{ color: '#0B1220' }}>{g.label}</h2>
            {g.engine && (
              <div className="text-sm mb-3" style={{ color: '#64748B' }}>
                {g.yearStart}–{g.yearEnd} · {g.engine}
              </div>
            )}

            <div style={{ overflowX: 'auto', background: '#fff', border: '1px solid #E3DFD4', borderRadius: 14 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E3DFD4', textAlign: 'left' }}>
                    <th style={{ padding: '10px', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Fluid</th>
                    <th style={{ padding: '10px', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Type / Spec</th>
                    <th style={{ padding: '10px', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Capacity</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(g.fluids).map(([key, f]) => (
                    <FluidRow key={key} label={specLabel(key)} type={f.type} capacity={f.capacity} note={f.note} buy={f.buy} />
                  ))}
                  {g.parts && Object.entries(g.parts).map(([key, p]) => (
                    <FluidRow key={key} label={specLabel(key)} type={p.value} buy={p.buy} />
                  ))}
                </tbody>
              </table>
            </div>

            {g.safety && g.safety.length > 0 && (
              <div className="mt-3 p-3.5 rounded-xl" style={{ background: '#FEF3C7', border: '1px solid #F59E0B' }}>
                <div className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: '#92400E' }}>Before you service it</div>
                <ul className="text-sm space-y-1" style={{ color: '#92400E', lineHeight: 1.5 }}>
                  {g.safety.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
            )}
          </section>
        ))}

        {/* AI / accuracy disclaimer */}
        <div className="mt-8 p-4 rounded-xl flex gap-3" style={{ background: '#fff', border: '1px solid #E3DFD4' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
            <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-xs" style={{ color: '#64748B', lineHeight: 1.6 }}>
            Specs are compiled from manufacturer service data with AI assistance and may contain errors or vary by exact
            trim, engine and market. Always verify against your owner&apos;s manual and the dipstick/fill level before adding
            fluid. &ldquo;Shop&rdquo; links are affiliate links — we may earn a commission at no extra cost to you.
          </p>
        </div>
      </article>

      <SiteFooter />
    </div>
  );
}
