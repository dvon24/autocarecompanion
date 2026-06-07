import Link from 'next/link';
import Image from 'next/image';
import { ShareButtons } from '@/components/shared/ShareButtons';
import { Icon } from '@/components/ui/Icon';

/**
 * Site footer — comprehensive legal-links row + share + AI disclaimer
 * + brand line, used on the home page AND every long-form public page
 * (known-issues index, articles, make/category/DTC pages).
 *
 * Replaces the earlier SiteMapSection block on known-issues pages so
 * the bottom of every page reads the same — Google sees a consistent
 * sitelink + footer-link layout, and visitors who land deep get the
 * same nav surface as visitors who came in through the home page.
 *
 * The compact "Explore Au7o" grouped layout is still available via
 * SiteMapSection (kept for /account where it lives mid-page as a
 * discovery section, not as the page footer).
 */
const footerLink: React.CSSProperties = {
  color: 'var(--slate-500, #64748B)',
  textDecoration: 'none',
};

export function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--paper-line, #E3DFD4)',
        background: '#fff',
        padding: '36px 22px 28px',
        marginTop: 'auto',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div
          className="flex flex-wrap justify-center gap-x-6 gap-y-3"
          style={{ fontSize: 13, color: 'var(--slate-500, #64748B)' }}
        >
          <Link href="/known-issues" style={footerLink}>Known Issues</Link>
          <Link href="/known-issues/dtc" style={footerLink}>DTC Lookup</Link>
          <Link href="/drive" style={footerLink}>Drive</Link>
          <Link href="/subscribe" style={footerLink}>Pricing</Link>
          <Link href="/about" style={footerLink}>About</Link>
          <Link href="/terms" style={footerLink}>Terms</Link>
          <Link href="/privacy" style={footerLink}>Privacy</Link>
          <Link href="/cookies" style={footerLink}>Cookies</Link>
          <a href="#" className="termly-display-preferences" style={footerLink}>Consent</a>
          <Link href="/data-rights" style={footerLink}>Data rights</Link>
          <Link href="/copyright" style={footerLink}>Copyright</Link>
          <Link href="/feedback" style={footerLink}>Feedback</Link>
        </div>
        <div className="flex justify-center" style={{ marginTop: 22 }}>
          <ShareButtons url="https://au7o.io" title="Au7o - Know Your Car's Weak Spots" />
        </div>
        <div
          className="flex items-start gap-2 mx-auto"
          style={{
            maxWidth: 640,
            marginTop: 24,
            padding: '10px 14px',
            background: 'var(--paper, #F7F6F2)',
            border: '1px solid var(--paper-line, #E3DFD4)',
            borderRadius: 10,
          }}
        >
          <Icon name="alert" size={14} style={{ color: 'var(--slate-400, #94A3B8)', marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: 11.5, color: 'var(--slate-500, #64748B)', lineHeight: 1.55, margin: 0 }}>
            Vehicle data and repair guidance on this site are compiled with AI assistance and may contain errors. Always verify with your service manual or a qualified mechanic.
          </p>
        </div>
        <div
          className="flex justify-between items-center"
          style={{
            marginTop: 24,
            paddingTop: 18,
            borderTop: '1px solid var(--paper-line, #E3DFD4)',
            fontSize: 12,
            color: 'var(--slate-500, #64748B)',
          }}
        >
          <div className="flex items-center gap-2">
            <Image src="/og-image.png" alt="" width={20} height={20} className="rounded" />
            <span>
              Au<span style={{ color: 'var(--au7o-blue, #3B82F6)' }}>7</span>o · {new Date().getFullYear()}
            </span>
          </div>
          <span>Built for DIY mechanics. Privacy-first.</span>
        </div>
      </div>
    </footer>
  );
}
