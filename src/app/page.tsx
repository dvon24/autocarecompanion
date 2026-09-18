import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import LandingPage from '@/components/landing/LandingPage';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';

// Dynamic: signed-in visitors are redirected to Account. The cached
// function below also deduplicates the metadata/page stats query per request.
export const dynamic = 'force-dynamic';

const getSiteStats = cache(async () => {
  try {
    // vehicleType: 'car' — these three numbers are the headline automotive stats ("N issues across
    // M makes"). Motorcycles are a separate catalog with a separate count (see KnownIssue.vehicleType,
    // added 2026-08-25); folding bikes in here would silently inflate the automotive claim and add
    // makes that build no cars at all. A no-op while every row is a car, and the guard that keeps it
    // honest once bikes are published.
    const [totalIssues, distinctMakes, distinctModels] = await Promise.all([
      prisma.knownIssue.count({ where: { status: 'published', vehicleType: 'car' } }),
      prisma.knownIssue.findMany({
        where: { status: 'published', vehicleType: 'car' },
        distinct: ['make'],
        select: { make: true },
      }),
      prisma.knownIssue.findMany({
        where: { status: 'published', vehicleType: 'car' },
        distinct: ['make', 'model'],
        select: { make: true, model: true },
      }),
    ]);
    return {
      totalIssues,
      totalMakes: distinctMakes.length,
      totalModels: distinctModels.length,
    };
  } catch {
    return { totalIssues: 7000, totalMakes: 34, totalModels: 640 };
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const { totalIssues } = await getSiteStats();
  const issueCount = totalIssues.toLocaleString('en-US');
  const description = `Explore ${issueCount}+ documented vehicle problems with symptoms, repair costs, and practical fixes, then try Au7o's interactive Vehicle Twin and AI repair tools.`;

  return {
    title: { absolute: `Au7o: Know Your Car's Weak Spots | ${issueCount}+ Issues` },
    description,
    openGraph: {
      title: "Au7o - Know Your Car's Weak Spots",
      description,
      url: 'https://au7o.io',
      siteName: 'Au7o',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: "Au7o - Know Your Car's Weak Spots",
      description,
    },
    alternates: { canonical: 'https://au7o.io' },
  };
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ home?: string }> }) {
  // Account's explicit Home link opens the public landing page. Private routes
  // continue to enforce their own authentication and product access checks.
  const publicHome = (await searchParams).home === '1';
  // Account owns enrollment and product routing. If auth fails, fall through
  // to the public homepage.
  try {
    const session = await auth();
    if (session?.user?.id && !publicHome) {
      redirect('/account');
    }
  } catch (error) {
    // next/navigation redirect() throws by design; only swallow real failures.
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      String(error.digest).startsWith('NEXT_REDIRECT')
    ) {
      throw error;
    }
  }

  const stats = await getSiteStats();
  return <LandingPage stats={stats} />;
}
