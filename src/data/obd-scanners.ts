export type ScannerTier = 'budget' | 'midrange' | 'advanced' | 'professional';

export interface OBDScanner {
  name: string;
  brand: string;
  priceRange: string;
  description: string;
  features: string[];
  amazonUrl: string;
  tier: ScannerTier;
}

export const obdScanners: OBDScanner[] = [
  {
    name: 'ANCEL AD310 Classic OBD-II Scanner',
    brand: 'ANCEL',
    priceRange: '$10–$20',
    description:
      'A simple, affordable code reader that reads and clears check engine codes. Great for quick diagnostics on any OBD-II vehicle (1996+).',
    features: [
      'Read & clear engine codes',
      'View freeze frame data',
      'I/M readiness status',
      'No batteries or app needed',
    ],
    amazonUrl: 'https://www.amazon.com/s?k=ANCEL+AD310+OBD2+scanner&tag=au7o-20',
    tier: 'budget',
  },
  {
    name: 'BlueDriver Pro Bluetooth Scanner',
    brand: 'BlueDriver',
    priceRange: '$90–$120',
    description:
      'Bluetooth OBD-II scanner with a free companion app. Provides enhanced diagnostics, smog readiness, and repair reports sourced from a database of verified fixes.',
    features: [
      'Enhanced diagnostics (ABS, SRS, transmission)',
      'Repair Reports with verified fixes',
      'Smog check readiness',
      'Free app (iOS & Android)',
    ],
    amazonUrl: 'https://www.amazon.com/s?k=BlueDriver+Bluetooth+Pro+OBD2+scanner&tag=au7o-20',
    tier: 'midrange',
  },
  {
    name: 'LAUNCH CRP123X OBD-II Scanner',
    brand: 'LAUNCH',
    priceRange: '$180–$230',
    description:
      'A professional-grade handheld scanner that reads all four major systems (engine, transmission, ABS, SRS) with live data streaming and graphing.',
    features: [
      'Engine, transmission, ABS, SRS diagnostics',
      'Live data stream & graphing',
      'AutoVIN for vehicle identification',
      'Free lifetime updates via Wi-Fi',
    ],
    amazonUrl: 'https://www.amazon.com/s?k=LAUNCH+CRP123X+OBD2+scanner&tag=au7o-20',
    tier: 'advanced',
  },
  {
    name: 'Autel MaxiCOM MK808S Diagnostic Tool',
    brand: 'Autel',
    priceRange: '$350–$450',
    description:
      'Shop-level diagnostic tablet with bi-directional control, active tests, and full system coverage. Ideal for serious DIYers and small shops.',
    features: [
      'All-system diagnostics (25+ modules)',
      'Bi-directional control & active tests',
      'Oil reset, EPB, BMS, TPMS, injector coding',
      '7-inch touchscreen with Android OS',
    ],
    amazonUrl: 'https://www.amazon.com/s?k=Autel+MaxiCOM+MK808S+diagnostic+scanner&tag=au7o-20',
    tier: 'professional',
  },
];
