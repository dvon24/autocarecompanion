'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Highlight = 'wheel' | 'rearwheel' | 'hood' | 'radiator' | null;

interface HeroTwin {
  id: string;
  name: string;
  trim: string;
  paint: string;
  miles?: number;
  live: boolean;
  base: string;
  wheelGlow: string;
  rearWheelGlow: string;
  hoodGlow: string;
  radiatorReveal: string;
  wheel: [number, number];
  rearWheel: [number, number];
  hood: [number, number];
  radiator: [number, number];
  rows: Array<{ label: string; detail: string; tone: 'due' | 'upgrade' | 'ok' }>;
}

const HERO_TWINS: readonly HeroTwin[] = [
  {
    id: 'challenger',
    name: '2015 Dodge Challenger',
    trim: 'SRT 392',
    paint: 'Granite Crystal',
    miles: 65_000,
    live: true,
    base: '/twin-stage/car-base.webp',
    wheelGlow: '/twin-stage/car-wheel-highlight-glow.webp',
    rearWheelGlow: '/twin-stage/car-rear-wheel-highlight-glow.webp',
    hoodGlow: '/twin-stage/car-hood-highlight-glow.webp',
    radiatorReveal: '/twin-stage/car-radiator-highlight-glow.webp',
    wheel: [39.6, 65.5],
    rearWheel: [20, 65],
    hood: [61, 42],
    radiator: [68, 53],
    rows: [
      { label: 'Front tire', detail: 'Past its expected life at this mileage', tone: 'due' },
      { label: 'Lug nuts', detail: 'Known swelling issue · fix available', tone: 'upgrade' },
      { label: 'Brake rotor', detail: 'On track', tone: 'ok' },
    ],
  },
  {
    id: 'nautilus',
    name: '2019 Lincoln Nautilus',
    trim: 'Standard',
    paint: 'Magnetic Grey',
    miles: 52_000,
    live: false,
    base: '/twin-stage/lincoln/base-gray.webp',
    wheelGlow: '/twin-stage/lincoln/glow-wheel-gray.webp',
    rearWheelGlow: '/twin-stage/lincoln/glow-rearwheel-gray.webp',
    hoodGlow: '/twin-stage/lincoln/glow-hood-gray.webp',
    radiatorReveal: '/twin-stage/lincoln/xray-radiator-gray.webp',
    wheel: [42, 65],
    rearWheel: [18, 64],
    hood: [65, 39],
    radiator: [70, 53],
    rows: [
      { label: 'Front tire', detail: 'Past its expected life at this mileage', tone: 'due' },
      { label: 'Front rotor', detail: 'Known issue · repair path mapped', tone: 'upgrade' },
      { label: 'Wheel bearing', detail: 'On track', tone: 'ok' },
    ],
  },
  {
    id: 'murano',
    name: '2023 Nissan Murano',
    trim: 'SV',
    paint: 'Scarlet Ember',
    miles: 24_000,
    live: false,
    base: '/twin-stage/murano/base-red.webp',
    wheelGlow: '/twin-stage/murano/glow-wheel-red.webp',
    rearWheelGlow: '/twin-stage/murano/glow-rearwheel-red.webp',
    hoodGlow: '/twin-stage/murano/glow-hood-red.webp',
    radiatorReveal: '/twin-stage/murano/xray-radiator-red.webp',
    wheel: [43, 65],
    rearWheel: [19, 64],
    hood: [64, 36],
    radiator: [70, 53],
    rows: [
      { label: 'Front tire', detail: 'On track at 24,000 mi', tone: 'ok' },
      { label: 'Front rotor', detail: 'Known issue · repair path mapped', tone: 'upgrade' },
      { label: 'Brake pads', detail: 'On track', tone: 'ok' },
    ],
  },
  {
    id: 'xt6',
    name: 'Cadillac XT6',
    trim: 'Sport',
    paint: 'Satin Steel Metallic',
    live: false,
    base: '/twin-stage/cadillac/base-satin-steel.webp',
    wheelGlow: '/twin-stage/cadillac/glow-wheel-satin-steel.webp',
    rearWheelGlow: '/twin-stage/cadillac/glow-rearwheel-satin-steel.webp',
    hoodGlow: '/twin-stage/cadillac/glow-hood-satin-steel.webp',
    radiatorReveal: '/twin-stage/cadillac/xray-radiator-satin-steel.webp',
    wheel: [43, 66],
    rearWheel: [20, 64],
    hood: [65, 38],
    radiator: [70, 53],
    rows: [
      { label: 'Front tire', detail: 'Service state shown as a visual preview', tone: 'due' },
      { label: 'Cooling system', detail: 'Radiator location mapped', tone: 'upgrade' },
      { label: 'Rear tire', detail: 'Independent inspection point', tone: 'ok' },
    ],
  },
] as const;

const TONE = {
  due: { dot: '#FF6B63', ink: '#FFD9D6' },
  upgrade: { dot: '#A78BFA', ink: '#EDE4FF' },
  ok: { dot: '#35D69B', ink: '#D8FFF0' },
} as const;

const HIGHLIGHT_LABEL: Record<Exclude<Highlight, null>, string> = {
  wheel: 'Front Wheel, Tire & Brakes',
  rearwheel: 'Rear Wheel, Tire & Brakes',
  hood: 'Engine',
  radiator: 'Radiator & Cooling',
};

type DetailRow = HeroTwin['rows'][number];

function detailRows(car: HeroTwin, highlight: Exclude<Highlight, null>): DetailRow[] {
  if (!car.live) {
    const preview: Record<Exclude<Highlight, null>, DetailRow[]> = {
      wheel: [{ label: 'Front wheel', detail: 'Clickable inspection point mapped', tone: 'ok' }],
      rearwheel: [{ label: 'Rear wheel', detail: 'Independent inspection point mapped', tone: 'ok' }],
      hood: [{ label: 'Engine bay', detail: 'Component reveal mapped', tone: 'upgrade' }],
      radiator: [{ label: 'Cooling system', detail: 'Radiator location mapped', tone: 'upgrade' }],
    };
    return preview[highlight];
  }
  const challenger: Record<Exclude<Highlight, null>, DetailRow[]> = {
    wheel: car.rows,
    rearwheel: [
      { label: 'Rear tire', detail: 'Separate inspection point', tone: 'ok' },
      { label: 'Rear brakes', detail: 'Wear tree mapped', tone: 'ok' },
      { label: 'Lug nuts', detail: 'Known swelling issue · fix available', tone: 'upgrade' },
    ],
    hood: [
      { label: 'Engine oil', detail: 'Service branch mapped', tone: 'due' },
      { label: 'Air filter', detail: 'Replacement path mapped', tone: 'ok' },
      { label: 'Cooling hoses', detail: 'Inspection branch mapped', tone: 'ok' },
    ],
    radiator: [
      { label: 'Radiator', detail: 'Plastic end-tank failure mapped', tone: 'upgrade' },
      { label: 'Coolant', detail: 'Correct OAT specification mapped', tone: 'ok' },
      { label: 'Upgrade', detail: 'All-aluminium repair option mapped', tone: 'upgrade' },
    ],
  };
  return challenger[highlight];
}

function Marker({
  label,
  position,
  tone,
  active,
  onActivate,
}: {
  label: string;
  position: [number, number];
  tone: 'due' | 'upgrade';
  active: boolean;
  onActivate: () => void;
}) {
  const color = TONE[tone].dot;
  return (
    <button
      type="button"
      aria-label={`Inspect ${label}`}
      aria-pressed={active}
      onClick={onActivate}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      style={{
        position: 'absolute',
        left: `${position[0]}%`,
        top: `${position[1]}%`,
        zIndex: 5,
        width: 42,
        height: 42,
        transform: `translate(-50%,-50%) scale(${active ? 1.1 : 1})`,
        borderRadius: '50%',
        border: `2px solid ${color}`,
        background: `color-mix(in srgb, ${color} 18%, rgba(8,11,18,.85))`,
        boxShadow: `0 0 ${active ? 28 : 14}px color-mix(in srgb, ${color} 70%, transparent)`,
        color: '#fff',
        cursor: 'pointer',
        transition: 'transform .2s ease, box-shadow .2s ease',
      }}
    >
      <span aria-hidden style={{ display: 'block', width: 8, height: 8, margin: 'auto', borderRadius: '50%', background: color }} />
    </button>
  );
}

export function RotatingTwinStage() {
  const [index, setIndex] = useState(0);
  const [highlight, setHighlight] = useState<Highlight>('wheel');
  const [held, setHeld] = useState(false);
  const car = HERO_TWINS[index];
  const rows = highlight ? detailRows(car, highlight) : [];

  useEffect(() => {
    if (held) return;
    const timer = window.setTimeout(() => {
      setHighlight('wheel');
      setIndex((current) => (current + 1) % HERO_TWINS.length);
    }, 8_000);
    return () => window.clearTimeout(timer);
  }, [index, held]);

  function go(next: number) {
    setHeld(true);
    setHighlight('wheel');
    setIndex((next + HERO_TWINS.length) % HERO_TWINS.length);
  }

  function choose(next: Exclude<Highlight, null>) {
    setHeld(true);
    setHighlight((current) => current === next ? null : next);
  }

  return (
    <section aria-label="Vehicle Twin preview" style={{ overflow: 'hidden', borderRadius: 20, border: '1px solid rgba(255,255,255,.14)', background: '#05070C', boxShadow: '0 24px 60px rgba(0,0,0,.35)' }}>
      <div style={{ position: 'relative', aspectRatio: '16 / 9', minHeight: 300 }}>
        <Image key={`${car.id}-base`} src={car.base} alt={`${car.name} ${car.trim} in ${car.paint}`} fill priority={index === 0} sizes="(max-width: 900px) 100vw, 1120px" style={{ objectFit: 'cover' }} />
        <Image key={`${car.id}-wheel`} src={car.wheelGlow} alt="" aria-hidden fill sizes="(max-width: 900px) 100vw, 1120px" style={{ objectFit: 'cover', opacity: highlight === 'wheel' ? 1 : 0, transition: 'opacity .35s ease' }} />
        <Image key={`${car.id}-rearwheel`} src={car.rearWheelGlow} alt="" aria-hidden fill sizes="(max-width: 900px) 100vw, 1120px" style={{ objectFit: 'cover', opacity: highlight === 'rearwheel' ? 1 : 0, transition: 'opacity .35s ease' }} />
        <Image key={`${car.id}-hood`} src={car.hoodGlow} alt="" aria-hidden fill sizes="(max-width: 900px) 100vw, 1120px" style={{ objectFit: 'cover', opacity: highlight === 'hood' ? 1 : 0, transition: 'opacity .35s ease' }} />
        <Image key={`${car.id}-radiator`} src={car.radiatorReveal} alt="" aria-hidden fill sizes="(max-width: 900px) 100vw, 1120px" style={{ objectFit: 'cover', opacity: highlight === 'radiator' ? 1 : 0, transition: 'opacity .35s ease' }} />

        <Marker label="front wheel, tire and brakes" position={car.wheel} tone="due" active={highlight === 'wheel'} onActivate={() => choose('wheel')} />
        <Marker label="rear wheel, tire and brakes" position={car.rearWheel} tone="due" active={highlight === 'rearwheel'} onActivate={() => choose('rearwheel')} />
        <Marker label="engine" position={car.hood} tone="upgrade" active={highlight === 'hood'} onActivate={() => choose('hood')} />
        <Marker label="radiator and cooling" position={car.radiator} tone="upgrade" active={highlight === 'radiator'} onActivate={() => choose('radiator')} />

        {highlight && (
          <div className="hidden md:block" style={{ position: 'absolute', zIndex: 6, right: 20, top: '50%', width: 330, transform: 'translateY(-50%)', borderRadius: 16, border: '1px solid rgba(255,255,255,.14)', background: 'rgba(8,11,18,.9)', boxShadow: '0 18px 50px rgba(0,0,0,.4)', backdropFilter: 'blur(14px)', padding: 14 }}>
            <div style={{ color: '#fff', fontSize: 13.5, fontWeight: 600 }}>{HIGHLIGHT_LABEL[highlight]}</div>
            <div style={{ marginTop: 4, color: 'rgba(255,255,255,.55)', fontSize: 11.5 }}>{car.live ? 'Interactive demo service state — owner hubs use the real odometer and service history.' : 'Visual preview only — no owner mileage or service status is shown.'}</div>
            <div style={{ marginTop: 10, display: 'grid', gap: 7 }}>
              {rows.map((row) => (
                <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '8px 92px 1fr', gap: 8, alignItems: 'center', color: '#fff', fontSize: 11.5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: TONE[row.tone].dot }} />
                  <span style={{ fontWeight: 600 }}>{row.label}</span>
                  <span style={{ color: TONE[row.tone].ink }}>{row.detail}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {highlight && (
        <div className="md:hidden" style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,.1)', background: 'rgba(8,11,18,.96)' }}>
          <div style={{ color: '#fff', fontSize: 13.5, fontWeight: 600 }}>{HIGHLIGHT_LABEL[highlight]}</div>
          <div style={{ marginTop: 3, color: 'rgba(255,255,255,.55)', fontSize: 11 }}>{car.live ? 'Interactive demo data; owner hubs use real service history.' : 'Visual preview only; no owner service status.'}</div>
          <div style={{ marginTop: 9, display: 'grid', gap: 7 }}>
            {rows.map((row) => (
              <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '8px 88px 1fr', gap: 7, alignItems: 'center', color: '#fff', fontSize: 11 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: TONE[row.tone].dot }} />
                <span style={{ fontWeight: 600 }}>{row.label}</span>
                <span style={{ color: TONE[row.tone].ink }}>{row.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,.1)', background: 'rgba(8,11,18,.96)', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: '#fff', fontSize: 14.5, fontWeight: 600 }}>{car.name} <span style={{ color: 'rgba(255,255,255,.5)', fontWeight: 500 }}>{car.trim}</span></div>
          <div className="mono" style={{ marginTop: 2, color: 'rgba(255,255,255,.5)', fontSize: 10.5 }}>{car.paint}{car.live && car.miles ? ` · ${car.miles.toLocaleString()} mi` : ''} · {car.live ? 'interactive demo data' : 'visual preview · no owner service state'}</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {HERO_TWINS.map((twin, position) => (
              <button key={twin.id} type="button" onClick={() => go(position)} aria-label={`Show ${twin.name}`} aria-current={position === index} style={{ width: position === index ? 22 : 8, height: 8, border: 0, borderRadius: 999, padding: 0, cursor: 'pointer', background: position === index ? '#8FDDF7' : 'rgba(255,255,255,.28)', transition: 'width .3s ease' }} />
            ))}
          </div>
          <button type="button" onClick={() => go(index - 1)} aria-label="Previous vehicle" style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(255,255,255,.16)', background: 'rgba(255,255,255,.08)', color: '#fff', cursor: 'pointer' }}>‹</button>
          <button type="button" onClick={() => go(index + 1)} aria-label="Next vehicle" style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(255,255,255,.16)', background: 'rgba(255,255,255,.08)', color: '#fff', cursor: 'pointer' }}>›</button>
        </div>
      </div>
      <div style={{ padding: '9px 14px', borderTop: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.56)', fontSize: 11.5 }}>
        {HERO_TWINS.length} vehicles visualized. Owner hubs open only after the exact vehicle and its fitment-reviewed tree are ready.{' '}
        <Link href="/demo/hub" style={{ color: '#8FDDF7', fontWeight: 600, textUnderlineOffset: 3 }}>Open the Challenger demo →</Link>
      </div>
    </section>
  );
}
