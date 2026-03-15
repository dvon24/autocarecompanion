import { MetadataRoute } from 'next';
import { getAllKnownIssueSlugsWithDates } from '@/lib/known-issues';
import { getAllDTCSlugsWithDates } from '@/lib/dtc-codes';
import prisma from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://au7o.io';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/get-started`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guide`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/symptom-chat`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/garage`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/subscribe`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Known issues index page
  const knownIssuesIndex: MetadataRoute.Sitemap = [{
    url: `${baseUrl}/known-issues`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }];

  // Known issues article pages
  const knownIssuesPages: MetadataRoute.Sitemap = (await getAllKnownIssueSlugsWithDates()).map(s => ({
    url: `${baseUrl}/known-issues/${s.slug}`,
    lastModified: s.lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // DTC code pages
  const dtcPages: MetadataRoute.Sitemap = (await getAllDTCSlugsWithDates()).map(s => ({
    url: `${baseUrl}/known-issues/dtc/${s.code}`,
    lastModified: s.lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Category landing pages
  const categories = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: { category: true },
    distinct: ['category'],
  });
  const categoryPages: MetadataRoute.Sitemap = categories.map(c => ({
    url: `${baseUrl}/known-issues/category/${c.category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Make landing pages
  const makes = await prisma.knownIssue.findMany({
    where: { status: 'published' },
    select: { make: true },
    distinct: ['make'],
  });
  const makePages: MetadataRoute.Sitemap = makes.map(m => ({
    url: `${baseUrl}/known-issues/make/${m.make.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...knownIssuesIndex, ...knownIssuesPages, ...dtcPages, ...categoryPages, ...makePages];
}
