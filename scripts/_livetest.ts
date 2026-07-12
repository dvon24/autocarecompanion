import 'dotenv/config';
import { getCachedVerifiedPart } from '@/lib/verified-parts';
const v = { year: 2015, make: 'Dodge', model: 'Challenger', trim: 'SRT 392' };
const markers = ['engine oil filter', 'oil filter', 'rear differential fluid', 'engine air filter', 'front brake pads', 'differential drain plug', 'engine oil', 'spark plugs'];
(async () => {
  for (const m of markers) {
    try {
      const h = await getCachedVerifiedPart(v, m);
      if (h && h.buyUrl) console.log('OK  ', m, '=> PN', h.partNumber || '-', '| matched:', h.name, '|', (h.buyLinks || []).map((l) => l.vendor).join(', '));
      else console.log('..  ', m, '=> no verified record (honest Amazon fallback)');
    } catch (e) { console.log('ERR ', m, (e as Error).message.slice(0, 80)); }
  }
  process.exit(0);
})();
