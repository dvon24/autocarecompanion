import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import LandingPage from '@/components/landing/LandingPage';
import prisma from '@/lib/db';
import { makeSlug } from '@/lib/known-issues';
import { auth } from '@/lib/auth';
import { vehicleSlug } from '@/lib/vehicle-slug';

export const metadata: Metadata = {
  title: 'Au7o - Know Your Car\'s Weak Spots | 3,600+ Documented Vehicle Problems',
  description: 'Browse 3,600+ documented vehicle problems across 640+ models and 34 makes. Symptoms, repair costs, and real solutions from owner reports. Free AI-powered DIY repair guides.',
  openGraph: {
    title: 'Au7o - Know Your Car\'s Weak Spots',
    description: 'Browse 3,600+ documented vehicle problems across 640+ models and 34 makes. Symptoms, repair costs, and solutions from real owner reports.',
    url: 'https://au7o.io',
    siteName: 'Au7o',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Au7o - Know Your Car\'s Weak Spots',
    description: '3,600+ documented vehicle problems with symptoms, costs, and DIY solutions.',
  },
  alternates: {
    canonical: 'https://au7o.io',
  },
};

// Dynamic — needs to call auth() to redirect signed-in users to their hub.
// Trades the previous 1h ISR for per-request rendering; trending + stats
// DB queries below are cheap and still fast.
export const dynamic = 'force-dynamic';

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

async function getSiteStats() {
  try {
    const [totalIssues, distinctMakes, distinctModels] = await Promise.all([
      prisma.knownIssue.count({ where: { status: 'published' } }),
      prisma.knownIssue.findMany({ where: { status: 'published' }, distinct: ['make'], select: { make: true } }),
      prisma.knownIssue.findMany({ where: { status: 'published' }, distinct: ['make', 'model'], select: { make: true, model: true } }),
    ]);
    return {
      totalIssues,
      totalMakes: distinctMakes.length,
      totalModels: distinctModels.length,
    };
  } catch {
    return { totalIssues: 3600, totalMakes: 34, totalModels: 640 };
  }
}

export default async function HomePage() {
  // Signed-in users land on their primary vehicle hub instead of the
  // marketing landing — the marketing page is for acquisition, the hub
  // is the product. Falls through to the landing if auth fails, the user
  // has no vehicles yet, or anything else goes sideways.
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
      // Phase 2 onboarding gate — anyone who hasn't completed it gets
      // walked through it on their first visit to / after signup.
      // Idempotent because /onboarding itself bounces completed users
      // back here.
      if (user && !user.onboardingCompletedAt) {
        redirect('/onboarding');
      }
      if (primary) {
        redirect(`/vehicle/${vehicleSlug(primary.year, primary.make, primary.model, primary.trim)}`);
      }
    }
  } catch (err) {
    // next/navigation's redirect() throws by design — re-throw so Next
    // can act on it. Swallow only real errors so the landing renders as
    // a fallback.
    if (err && typeof err === 'object' && 'digest' in err && String(err.digest).startsWith('NEXT_REDIRECT')) {
      throw err;
    }
  }

  const [trendingIssues, stats] = await Promise.all([
    getTrendingIssues(),
    getSiteStats(),
  ]);
  return <LandingPage trendingIssues={trendingIssues} stats={stats} />;
}
