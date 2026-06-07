import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

/**
 * Inline "confirm with a photo" CTA, placed at the top of a known-issues
 * article's issue list — the peak "is this my problem?" moment. Ported
 * from BMAD au7o(4)/03-WebKnownIssues `ConfirmWithPhotoCTA`.
 *
 * Deliberately a PLAIN SERVER COMPONENT (no 'use client', a real
 * `<Link>`/`<a href="/diagnose">`) so it ships in the SSR HTML with no
 * hydration cost and stays crawlable.
 *
 * Copy defaults to generic phrasing. The BMAD mock interpolated a
 * hardcoded "{issueName}" / "{platform}" ("N20") — we only interpolate
 * when the caller passes real values, so anonymous crawl traffic never
 * gets a mock string baked into the static HTML.
 */
export function ConfirmWithPhotoCTA({
  issueName,
  platform,
}: {
  /** e.g. "this timing chain issue" — omitted → generic copy */
  issueName?: string;
  /** e.g. "N20" — omitted → generic copy */
  platform?: string;
}) {
  const title = issueName
    ? `Not sure ${issueName} is what you've got?`
    : "Not sure this is what you've got?";
  const sub = platform
    ? `Upload a photo or video — Au7o will confirm the match and check for the other ${platform} failures at the same time.`
    : 'Upload a photo or video — Au7o will confirm the match and check for other common failures at the same time.';

  return (
    <div
      className="flex items-center gap-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg,#141b29,#0B0E14)',
        borderRadius: 16,
        padding: '18px 22px',
      }}
    >
      {/* reticle motif */}
      <span
        aria-hidden
        style={{ position: 'absolute', right: -24, top: -24, width: 110, height: 110, borderRadius: '50%', border: '2px solid rgba(59,130,246,0.16)' }}
      />
      <span
        aria-hidden
        style={{ position: 'absolute', right: 18, top: 14, width: 56, height: 56, borderRadius: '50%', border: '2px solid rgba(59,130,246,0.24)' }}
      />
      <span
        className="inline-flex items-center justify-center flex-shrink-0"
        style={{ width: 44, height: 44, borderRadius: 12, background: '#3B82F6', color: '#fff', boxShadow: '0 6px 16px rgba(59,130,246,0.4)' }}
      >
        <Icon name="camera" size={21} />
      </span>
      <div className="flex-1 relative min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="inline-flex items-center text-[9px] font-bold uppercase text-white"
            style={{ letterSpacing: '0.06em', background: '#3B82F6', padding: '2px 6px', borderRadius: 999 }}
          >
            New
          </span>
          <span
            className="text-[10px] font-semibold uppercase"
            style={{ letterSpacing: '0.08em', color: 'rgba(147,197,253,0.9)' }}
          >
            AI Photo &amp; Video Diagnosis
          </span>
        </div>
        <div className="text-[15px] font-semibold text-white" style={{ letterSpacing: '-0.01em' }}>
          {title}
        </div>
        <div className="text-[12.5px] mt-0.5 leading-snug" style={{ color: 'rgba(255,255,255,0.65)' }}>
          {sub}
        </div>
      </div>
      <Link
        href="/diagnose"
        className="flex-shrink-0 inline-flex items-center gap-1.5 font-semibold text-[13.5px] relative hover:opacity-90 transition-opacity"
        style={{ padding: '11px 18px', background: '#fff', color: '#0B1220', borderRadius: 11 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="M17 8l-5-5-5 5" />
          <path d="M12 3v12" />
        </svg>
        Upload &amp; confirm
      </Link>
    </div>
  );
}
