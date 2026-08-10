import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { DiagnoseClaimClient } from '@/components/diagnose/DiagnoseClaimClient';

export const metadata: Metadata = {
  title: 'Saving your diagnosis · Au7o',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/**
 * /diagnose/claim — post-signup landing for the diagnose-to-chat
 * handoff. Reads the diagnosis snapshot from sessionStorage (stashed
 * on /diagnose just before signup), POSTs it to /api/diagnose/seed,
 * then redirects to /vehicle/{slug} with the seeded ChatSession id.
 *
 * Auth-gated server-side. Anonymous visitors return to /diagnose; only an
 * authenticated owner session can claim the saved result.
 */
export default async function DiagnoseClaimPage() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    redirect('/diagnose');
  }
  return <DiagnoseClaimClient />;
}
