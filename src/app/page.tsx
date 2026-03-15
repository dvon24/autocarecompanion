import type { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';
import prisma from '@/lib/db';
import { makeSlug } from '@/lib/known-issues';

export const metadata: Metadata = {
  title: 'Au7o - Know Your Car\'s Weak Spots | 2,300+ Documented Vehicle Problems',
  description: 'Browse 2,300+ documented vehicle problems across 500+ models and 20 makes. Symptoms, repair costs, and real solutions from 6M+ owner reports. Free AI-powered DIY repair guides.',
  openGraph: {
    title: 'Au7o - Know Your Car\'s Weak Spots',
    description: 'Browse 2,300+ documented vehicle problems across 500+ models. Symptoms, repair costs, and solutions from real owner reports.',
    url: 'https://au7o.io',
    siteName: 'Au7o',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Au7o - Know Your Car\'s Weak Spots',
    description: '2,300+ documented vehicle problems with symptoms, costs, and DIY solutions.',
  },
  alternates: {
    canonical: 'https://au7o.io',
  },
};

export const revalidate = 3600; // revalidate every hour

async function getTrendingIssues() {
  try {
    const issues = await prisma.knownIssue.findMany({
      where: {
        status: 'published',
        severity: 'high',
      },
      orderBy: {
        reportCount: 'desc',
      },
      take: 6,
      select: {
        id: true,
        make: true,
        model: true,
        title: true,
        category: true,
        severity: true,
        reportCount: true,
        years: true,
      },
    });

    return issues.map((issue) => ({
      id: issue.id,
      make: issue.make,
      model: issue.model,
      title: issue.title,
      category: issue.category,
      severity: issue.severity,
      reportCount: issue.reportCount,
      yearRange: issue.years.length > 0
        ? `${Math.min(...issue.years)}–${Math.max(...issue.years)}`
        : '',
      slug: makeSlug(issue.make, issue.model),
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const trendingIssues = await getTrendingIssues();
  return <LandingPage trendingIssues={trendingIssues} />;
}
