import { auth } from '@/lib/auth';
import { isFounderEmail } from '@/lib/founder';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// Founder-only internal lab (3D/vision pipeline previews). Never indexed.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'au7o lab',
};

/**
 * Server-side gate for the entire /lab route — same pattern as /admin. A
 * non-founder (signed in OR not) gets a 404 and never sees the lab exists.
 */
export default async function LabLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!isFounderEmail(session?.user?.email)) {
    notFound();
  }
  return <>{children}</>;
}
