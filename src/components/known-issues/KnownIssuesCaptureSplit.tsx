'use client';

import { KnownIssueAlertSignup } from './KnownIssueAlertSignup';
import { LiveHubDemo } from '@/components/marketing/LiveHubDemo';

/**
 * The known-issues conversion surface, per design/15-FeatureCarousel.jsx
 * ("Split" arrangement). LEFT proves + asks (headline, account/email capture,
 * social proof) on warm paper; RIGHT is the live, auto-rotating hub demo on
 * ink — the value is shown before the ask. Replaces the plain email popup:
 * the "carousel" IS this rotating hub window.
 *
 * The left column reuses the tested KnownIssueAlertSignup (account-primary,
 * email-secondary, /api/interest lead + feedback), with its own text carousel
 * turned off since the live demo now carries the value story.
 */
export function KnownIssuesCaptureSplit({
  vehicleName,
  context,
  headline,
  blurb,
}: {
  vehicleName: string;
  context: string;
  headline?: string;
  blurb?: string;
}) {
  return (
    <div
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.1fr)',
        background: '#fff',
        borderRadius: 24,
        overflow: 'hidden',
        border: '1px solid #E3DFD4',
        boxShadow: '0 30px 60px rgba(11,18,32,0.10)',
      }}
      className="ki-capture-split"
    >
      <style>{`
        @media (max-width: 860px) {
          .ki-capture-split { grid-template-columns: 1fr !important; }
          .ki-capture-demo { padding: 28px 20px !important; }
        }
      `}</style>

      {/* LEFT — value + ask on paper */}
      <div style={{ padding: '40px 34px', display: 'flex', alignItems: 'center', background: '#FBFAF7' }}>
        <div style={{ width: '100%' }}>
          <KnownIssueAlertSignup
            vehicleName={vehicleName}
            context={context}
            headline={headline}
            blurb={blurb}
            showCarousel={false}
          />
        </div>
      </div>

      {/* RIGHT — live rotating hub demo on ink */}
      <div
        className="ki-capture-demo"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          background: 'linear-gradient(155deg,#0B1220,#1a2440 70%,#1d2b4a)',
          overflow: 'hidden',
        }}
      >
        {/* ambient glow */}
        <div aria-hidden style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.20), transparent 70%)', filter: 'blur(20px)', top: '-10%', right: '-15%' }} />
        <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <LiveHubDemo vehicleName={vehicleName} />
        </div>
      </div>
    </div>
  );
}
