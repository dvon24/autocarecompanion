import { MetadataRoute } from 'next';
import { getAllKnownIssueSlugsWithDates } from '@/lib/known-issues';
import { getAllDTCSlugsWithDates } from '@/lib/dtc-codes';
import prisma from '@/lib/db';

// Fixed launch date — static pages don't change frequently
const SITE_LAUNCH = new Date('2026-02-01');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://au7o.io';

  // Static pages — use fixed dates, not new Date()
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date('2026-03-15'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/get-started`,
      lastModified: SITE_LAUNCH,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guide`,
      lastModified: SITE_LAUNCH,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/symptom-chat`,
      lastModified: SITE_LAUNCH,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/garage`,
      lastModified: SITE_LAUNCH,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/subscribe`,
      lastModified: SITE_LAUNCH,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/known-issues`,
      lastModified: new Date('2026-03-16'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/parts`,
      lastModified: new Date('2026-03-26'),
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date('2026-03-29'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: SITE_LAUNCH,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: SITE_LAUNCH,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: SITE_LAUNCH,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Known issues article pages — use actual DB updatedAt dates.
  const knownIssueSlugsWithDates = await getAllKnownIssueSlugsWithDates();
  const knownIssuesPages: MetadataRoute.Sitemap = knownIssueSlugsWithDates.map(s => ({
    url: `${baseUrl}/known-issues/${s.slug}`,
    lastModified: s.lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Year-filtered indexable variants of each article. The page renders
  // ?year=YYYY as a separate canonical URL (server-filtered issues,
  // year-specific title/H1/description, distinct meta canonical) so each
  // "2018 BMW 1 Series Problems" lands as its own indexable page.
  // Multiplies our known-issues index footprint roughly 5-7x.
  const allPublished = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: { make: true, model: true, years: true, updatedAt: true },
  });
  const perYearMap = new Map<string, Date>(); // key = `${slug}|${year}` → lastModified
  for (const row of allPublished) {
    const slug = `${row.make} ${row.model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    for (const year of row.years || []) {
      const key = `${slug}|${year}`;
      const prev = perYearMap.get(key);
      if (!prev || row.updatedAt > prev) perYearMap.set(key, row.updatedAt);
    }
  }
  const layoutDate = new Date('2026-04-29T00:00:00Z');
  const yearVariantPages: MetadataRoute.Sitemap = Array.from(perYearMap.entries()).map(([key, lastModified]) => {
    const [slug, year] = key.split('|');
    const lm = lastModified > layoutDate ? lastModified : layoutDate;
    return {
      url: `${baseUrl}/known-issues/${slug}?year=${year}`,
      lastModified: lm,
      changeFrequency: 'monthly' as const,
      priority: 0.6, // slightly lower than base — the canonical per-vehicle page is the hub
    };
  });

  // DTC code pages — use actual DB updatedAt dates
  const dtcPages: MetadataRoute.Sitemap = (await getAllDTCSlugsWithDates()).map(s => ({
    url: `${baseUrl}/known-issues/dtc/${s.code}`,
    lastModified: s.lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Category landing pages — use most recent updatedAt per category
  const categoryDates = await prisma.$queryRaw<{ category: string; lastmod: Date }[]>`
    SELECT category, MAX("updatedAt") as lastmod
    FROM "KnownIssue"
    WHERE status = 'published'
    GROUP BY category
  `;
  const categoryPages: MetadataRoute.Sitemap = categoryDates.map(c => ({
    url: `${baseUrl}/known-issues/category/${c.category}`,
    // Bump to layoutDate when our render layer is fresher than the data —
    // same logic as the per-vehicle articles. Forces sitemap to advertise
    // a recent lastmod so Google re-fetches the category landing pages.
    lastModified: c.lastmod > layoutDate ? c.lastmod : layoutDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Make landing pages — use most recent updatedAt per make
  const makeDates = await prisma.$queryRaw<{ make: string; lastmod: Date }[]>`
    SELECT make, MAX("updatedAt") as lastmod
    FROM "KnownIssue"
    WHERE status = 'published'
    GROUP BY make
  `;
  const makePages: MetadataRoute.Sitemap = makeDates.map(m => ({
    url: `${baseUrl}/known-issues/make/${m.make.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: m.lastmod > layoutDate ? m.lastmod : layoutDate,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...knownIssuesPages, ...yearVariantPages, ...dtcPages, ...categoryPages, ...makePages];
}
