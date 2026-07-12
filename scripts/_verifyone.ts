import 'dotenv/config';
import { verifyPartNow, getCachedVerifiedPart } from '@/lib/verified-parts';
const V = { year: 2015, make: 'Dodge', model: 'Challenger', trim: 'SRT 392' };
(async () => {
  for (const p of ['rear differential fluid', 'spark plugs', 'engine coolant']) {
    const h = await verifyPartNow(V, p, 45000);
    if (h?.buyUrl) console.log(`✓ ${p} → PN ${h.partNumber || '-'} | ${(h.buyLinks || []).map((l) => l.vendor).join(', ')}${h.caveat ? ' | caveat: ' + h.caveat.slice(0, 60) : ''}`);
    else { const c = await getCachedVerifiedPart(V, p); console.log(`· ${p} → ${c?.buyUrl ? 'now cached: ' + (c.buyLinks||[]).map(l=>l.vendor).join(',') : 'dropped'}`); }
  }
  process.exit(0);
})();
