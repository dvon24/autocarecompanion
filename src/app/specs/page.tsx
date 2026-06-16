import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getSpecsDirectory } from '@/lib/specs';
import { CollectionPageJsonLd } from '@/components/seo/JsonLd';
import { SiteFooter } from '@/components/shared/SiteFooter';

export const revalidate = 3600;

const BASE = 'https://au7o.io';

export async function generateMetadata(): Promise<Metadata> {
  const dir = getSpecsDirectory();
  const empty = dir.length === 0;
  return {
    title: { absolute: 'Vehicle Fluid Types, Capacities & Specs | Au7o' },
    description:
      'Look up engine oil type & capacity, coolant, transmission fluid, brake fluid and torque specs by vehicle. Sourced from manufacturer data.',
    alternates: { canonical: `${BASE}/specs` },
    // Don't index an empty directory while the audit is still populating it.
    ...(empty ? { robots: { index: false, follow: true } } : {}),
  };
}

export default function SpecsIndexPage() {
  const dir = getSpecsDirectory();
  const total = dir.reduce((s, m) => s + m.vehicles.length, 0);

  return (
    <div className="min-h-screen" style={{ background: '#F7F6F2' }}>
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
          <Link href="/known-issues" className="px-3 sm:px-4 py-2 text-sm font-medium text-[#475569] hover:text-[#0B1220] transition-colors">
            Known Issues
          </Link>
        </div>
      </header>

      {total > 0 && (
        <CollectionPageJsonLd
          name="Vehicle Fluid Types & Capacities"
          description="Engine oil, coolant, transmission and brake fluid specs by vehicle."
          url={`${BASE}/specs`}
          numberOfItems={total}
          itemListElement={dir.flatMap((m) =>
            m.vehicles.map((v) => ({ name: `${m.make} ${v.model}`, url: `${BASE}/specs/${v.slug}` })),
          )}
        />
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: '#0B1220' }}>
          Vehicle Fluid Types &amp; Capacities
        </h1>
        <p className="mt-3 text-base sm:text-lg" style={{ color: '#475569', lineHeight: 1.6, maxWidth: 640 }}>
          Engine oil type and capacity, coolant, transmission fluid, brake fluid and torque specs — by vehicle. Sourced
          from manufacturer service data.
        </p>

        {total === 0 ? (
          <div className="mt-8 p-5 rounded-xl text-sm" style={{ background: '#fff', border: '1px solid #E3DFD4', color: '#64748B' }}>
            We&apos;re auditing fluid specs against manufacturer sources before publishing them — check back shortly.
          </div>
        ) : (
          <div className="mt-8 space-y-7">
            {dir.map((m) => (
              <section key={m.make}>
                <h2 className="text-sm font-bold uppercase tracking-wide mb-2.5" style={{ color: '#64748B' }}>{m.make}</h2>
                <div className="flex flex-wrap gap-2">
                  {m.vehicles.map((v) => (
                    <Link
                      key={v.slug}
                      href={`/specs/${v.slug}`}
                      className="px-3.5 py-2 text-sm font-medium rounded-lg transition-colors"
                      style={{ background: '#fff', border: '1px solid #E3DFD4', color: '#0B1220' }}
                    >
                      {v.model}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
