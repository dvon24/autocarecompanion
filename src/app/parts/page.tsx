import type { Metadata } from 'next';
import { PartsFinderClient } from '@/components/parts/PartsFinderClient';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Find Exact Parts for Your Vehicle | Au7o Parts Finder',
  description:
    'Select your vehicle and maintenance task to see the exact parts you need — oil type, filters, spark plugs, brake pads, and more. Instant results with links to buy.',
  openGraph: {
    title: 'Find Exact Parts for Your Vehicle | Au7o',
    description:
      'Select your vehicle and task to see exact parts needed with buy links.',
    url: 'https://au7o.io/parts',
    siteName: 'Au7o',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Au7o Parts Finder',
    description: 'Find the exact parts for your vehicle maintenance task.',
  },
  alternates: {
    canonical: 'https://au7o.io/parts',
  },
};

export default function PartsFinderPage() {
  return (
    <div className="min-h-screen bg-white">
      <BreadcrumbJsonLd
        items={[
          { name: 'Au7o', url: 'https://au7o.io' },
          { name: 'Parts Finder', url: 'https://au7o.io/parts' },
        ]}
      />
      <PartsFinderClient />
    </div>
  );
}
