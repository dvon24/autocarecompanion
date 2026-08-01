import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import LandingPage from '@/components/landing/LandingPage';
import prisma from '@/lib/db';
import { auth } from '@/lib/auth';
import { vehicleSlug } from '@/lib/vehicle-slug';

// Dynamic: signed-in visitors are redirected to their vehicle hub. The cached
// function below also deduplicates the metadata/page stats query per request.
export const dynamic = 'force-dynamic';

const getSiteStats = cache(async () => {
  try {
    const [totalIssues, distinctMakes, distinctModels] = await Promise.all([
      prisma.knownIssue.count({ where: { status: 'published' } }),
      prisma.knownIssue.findMany({
        where: { status: 'published' },
        distinct: ['make'],
        select: { make: true },
      }),
      prisma.knownIssue.findMany({
        where: { status: 'published' },
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

export default async function HomePage() {
  // The marketing page is for acquisition; signed-in users go to their product
  // surface. If auth or vehicle lookup fails, fall through to the homepage.
  try {
    const session = await auth();
    if (session?.user?.id) {
      const [user, primary] = await Promise.all([
        prisma.user.findUnique({
          where: { id: session.user.id },
          select: { onboardingCompletedAt: true },
        }),
        prisma.vehicle.findFirst({
          where: { userId: session.user.id },
          orderBy: [{ isPrimary: 'desc' }, { updatedAt: 'desc' }],
          select: { year: true, make: true, model: true, trim: true },
        }),
      ]);
      if (user && !user.onboardingCompletedAt) redirect('/onboarding');
      if (primary) {
        redirect(`/vehicle/${vehicleSlug(primary.year, primary.make, primary.model, primary.trim)}`);
      }
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
