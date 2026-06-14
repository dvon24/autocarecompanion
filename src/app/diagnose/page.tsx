import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { DiagnoseFlowClient } from '@/components/diagnose/DiagnoseFlowClient';
import { SnapDiagnoseClient } from '@/components/diagnose/SnapDiagnoseClient';

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

export default async function DiagnosePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Device split: phones get the photo-first capture layout (tap → camera),
  // desktops get the upload-first layout (no usable camera). Detected from
  // the UA server-side so the right layout is in the first paint — no flash.
  // ?mobile=1 / ?desktop=1 force a layout for testing on the other device.
  const h = await headers();
  const ua = (h.get('user-agent') || '').toLowerCase();
  const sp = await searchParams;
  const uaMobile = /android|iphone|ipod|ipad|mobile|silk|kindle/.test(ua);
  const isMobile = sp.mobile === '1' ? true : sp.desktop === '1' ? false : uaMobile;
  // Mobile → the snap-first camera flow (au7oapp design). Desktop → the
  // upload-first flow (no usable camera on desktop).
  return isMobile ? <SnapDiagnoseClient /> : <DiagnoseFlowClient isMobile={false} />;
}
