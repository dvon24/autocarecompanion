import type { Metadata } from 'next';
import { DiagnoseFlowClient } from '@/components/diagnose/DiagnoseFlowClient';

export const metadata: Metadata = {
  title: 'Try Au7o free — Diagnose from a photo',
  description:
    'Free vehicle diagnosis. Show Au7o a photo of the problem, pick your car, get the exact part. No account needed for your first try.',
  openGraph: {
    title: 'Try Au7o free — Diagnose from a photo',
    description:
      'Show Au7o what\'s wrong. One free diagnosis, no card needed.',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

/**
 * /diagnose — anonymous-friendly entry point for the photo-to-part
 * "magic moment". Linked from the home page hero CTA. Server component
 * just renders the client flow; gating + rate limit live server-side
 * in /api/vision (1 per IP per month for anonymous, then a signup gate).
 */
export const dynamic = 'force-dynamic';

export default function DiagnosePage() {
  return <DiagnoseFlowClient />;
}
