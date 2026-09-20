import type { ReactNode } from 'react';

export default function MotorcycleCatalogLayout({ children }: { children: ReactNode }) {
  const isolated = process.env.NODE_ENV === 'development' && process.env.AU7O_ISOLATED_SIGNUP_PREVIEW === 'true';
  return <>
    {isolated && <aside role="note" style={{ padding: '12px 20px', background: '#FFF4D6', color: '#493610', fontSize: 14, lineHeight: 1.5, borderBottom: '1px solid #E5CD91' }}>
      <strong>Private design preview.</strong> The Au7o Demo motorcycle and its issues are synthetic examples—not verified defects, recalls, repair advice or products for sale. No motorcycle research has been published to production.
    </aside>}
    {children}
  </>;
}
