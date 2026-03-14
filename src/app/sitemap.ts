import { MetadataRoute } from 'next';
import { getAllKnownIssueSlugs } from '@/lib/known-issues';
import { getAllDTCSlugs } from '@/lib/dtc-codes';

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
  const knownIssuesPages: MetadataRoute.Sitemap = (await getAllKnownIssueSlugs()).map(s => ({
    url: `${baseUrl}/known-issues/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // DTC code pages
  const dtcPages: MetadataRoute.Sitemap = (await getAllDTCSlugs()).map(s => ({
    url: `${baseUrl}/known-issues/dtc/${s.code}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...knownIssuesIndex, ...knownIssuesPages, ...dtcPages];
}
