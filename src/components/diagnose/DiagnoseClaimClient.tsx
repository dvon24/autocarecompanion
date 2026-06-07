'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@/components/ui/Icon';
import type { VisionResult } from '@/components/vehicle/VisionResultCard';

const SNAPSHOT_KEY = 'au7o.diagSnapshot';

interface Snapshot {
  visionResult: VisionResult;
  year: number;
  make: string;
  model: string;
  trim?: string;
  caption?: string;
}

interface GarageVehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  nickname: string | null;
}

interface QuotaInfo {
  tier: string;
  current: number;
  limit: number;
  upgradeTo: 'plus' | 'pro';
  userVehicles: GarageVehicle[];
}

type State = 'saving' | 'success' | 'no-snapshot' | 'quota' | 'error';

/**
 * Client half of /diagnose/claim. Reads the sessionStorage snapshot,
 * fires the seed POST, and routes the user to their newly-seeded
 * /vehicle/{slug} hub. Surfaces quota-hit as a picker modal instead
 * of silently mis-attaching.
 */
export function DiagnoseClaimClient() {
  const router = useRouter();
  const [state, setState] = useState<State>('saving');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  // StrictMode-safe one-shot. The effect would otherwise fire twice
  // in dev and risk creating a duplicate vehicle if /api/diagnose/seed
  // ever returned a transient error that we ignore.
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    let snap: Snapshot | null = null;
    try {
      const raw = sessionStorage.getItem(SNAPSHOT_KEY);
      if (raw) snap = JSON.parse(raw) as Snapshot;
    } catch {
      /* corrupt JSON — treat as no-snapshot */
    }
    if (!snap || !snap.visionResult || !snap.year || !snap.make || !snap.model) {
      setState('no-snapshot');
      return;
    }
    setSnapshot(snap);
    void submitSeed(snap);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitSeed = async (snap: Snapshot, attachToVehicleId?: string) => {
    try {
      setState('saving');
      setErrorMsg(null);
      const res = await fetch('/api/diagnose/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visionResult: snap.visionResult,
          year: snap.year,
          make: snap.make,
          model: snap.model,
          trim: snap.trim,
          caption: snap.caption,
          attachToVehicleId,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 403 && data.error === 'vehicle_limit_reached') {
        setQuotaInfo(data as QuotaInfo);
        setState('quota');
        return;
      }

      if (!res.ok || !data.ok) {
        setErrorMsg(data.message || `Couldn't save the diagnosis (HTTP ${res.status}).`);
        setState('error');
        return;
      }

      // Success — clear the snapshot, jump to the hub with the
      // seeded session id so VehicleHub auto-loads its history.
      try { sessionStorage.removeItem(SNAPSHOT_KEY); } catch { /* ignore */ }
      setState('success');
      router.replace(`/vehicle/${data.vehicleSlug}?session=${encodeURIComponent(data.sessionId)}&from=diagnose`);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Network error.');
      setState('error');
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--paper, #F7F6F2)',
        color: 'var(--ink, #0B1220)',
        fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header style={{ padding: '14px 22px', borderBottom: '1px solid var(--paper-line, #E3DFD4)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit' }}>
            <Image src="/og-image.png" alt="" width={26} height={26} className="rounded-md" />
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
              Au<span style={{ color: 'var(--au7o-blue, #3B82F6)' }}>7</span>o
            </span>
          </Link>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 720, width: '100%', margin: '0 auto', padding: '40px 22px' }}>
        {state === 'saving' && (
          <Card>
            <div style={{ textAlign: 'center', padding: '32px 8px' }}>
              <Spinner large />
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: '20px 0 8px', letterSpacing: '-0.02em' }}>
                Saving your diagnosis…
              </h1>
              <p style={{ fontSize: 14, color: 'var(--slate-600, #475569)' }}>
                Adding it to your garage and opening a chat thread.
              </p>
            </div>
          </Card>
        )}

        {state === 'no-snapshot' && (
          <Card>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              We couldn&apos;t find your diagnosis
            </h1>
            <p style={{ fontSize: 14, color: 'var(--slate-700, #334155)', lineHeight: 1.55 }}>
              The brake-rotor (or whatever you uploaded) result wasn&apos;t in this browser tab&apos;s memory anymore — most likely you switched devices or closed the original tab. Run the diagnosis again and we&apos;ll save it this time.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <Link href="/diagnose" style={primaryBtn}>Start a new diagnosis</Link>
              <Link href="/" style={ghostBtn}>Back to home</Link>
            </div>
          </Card>
        )}

        {state === 'error' && (
          <Card>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              Hmm, something went sideways
            </h1>
            <p style={{ fontSize: 14, color: 'var(--slate-700, #334155)', lineHeight: 1.55 }}>
              {errorMsg || 'We hit an error saving your diagnosis. Your account is fine — try again, or start a new diagnosis.'}
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button
                type="button"
                onClick={() => snapshot && void submitSeed(snapshot)}
                style={{ ...primaryBtn, cursor: 'pointer', border: 'none' }}
              >
                Try again
              </button>
              <Link href="/diagnose" style={ghostBtn}>Start a new diagnosis</Link>
            </div>
          </Card>
        )}

        {state === 'quota' && quotaInfo && snapshot && (
          <Card>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: 'var(--au7o-blue, #3B82F6)',
                textTransform: 'uppercase',
              }}
            >
              GARAGE FULL
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: '8px 0 8px', letterSpacing: '-0.02em' }}>
              Pick where this diagnosis lives
            </h1>
            <p style={{ fontSize: 14, color: 'var(--slate-700, #334155)', lineHeight: 1.55 }}>
              Your <strong>{quotaInfo.tier}</strong> plan is at the {quotaInfo.limit}-vehicle limit. Attach this diagnosis to one of your existing garage vehicles, or upgrade to{' '}
              <strong>{quotaInfo.upgradeTo === 'plus' ? 'Plus' : 'Pro'}</strong> to add the{' '}
              <strong>
                {snapshot.year} {snapshot.make} {snapshot.model}
                {snapshot.trim ? ' ' + snapshot.trim : ''}
              </strong>{' '}
              as a new entry.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 18 }}>
              {quotaInfo.userVehicles.map((v) => (
                <button
                  type="button"
                  key={v.id}
                  onClick={() => snapshot && void submitSeed(snapshot, v.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    background: '#fff',
                    border: '1px solid var(--paper-line, #E3DFD4)',
                    borderRadius: 12,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {v.nickname || `${v.year} ${v.make} ${v.model}`}
                    </div>
                    {v.nickname && (
                      <div style={{ fontSize: 12, color: 'var(--slate-500, #64748B)' }}>
                        {v.year} {v.make} {v.model}{v.trim ? ' ' + v.trim : ''}
                      </div>
                    )}
                  </div>
                  <Icon name="check" size={14} style={{ color: 'var(--au7o-blue, #3B82F6)' }} />
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <Link href={`/subscribe?tier=${quotaInfo.upgradeTo}`} style={primaryBtn}>
                Upgrade to {quotaInfo.upgradeTo === 'plus' ? 'Plus' : 'Pro'}
              </Link>
              <Link href="/" style={ghostBtn}>Cancel</Link>
            </div>
          </Card>
        )}

        {state === 'success' && (
          <Card>
            <div style={{ textAlign: 'center', padding: '32px 8px' }}>
              <Icon name="check" size={28} style={{ color: 'var(--ok, #10B981)' }} />
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: '16px 0 8px', letterSpacing: '-0.02em' }}>
                Saved. Opening chat…
              </h1>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--paper-line, #E3DFD4)',
        borderRadius: 18,
        padding: 26,
        boxShadow: '0 1px 2px rgba(11,18,32,0.06)',
      }}
    >
      {children}
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '11px 18px',
  background: 'var(--au7o-blue, #3B82F6)',
  color: '#fff',
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 600,
  textDecoration: 'none',
  fontFamily: 'inherit',
};

const ghostBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '11px 18px',
  background: '#fff',
  color: 'var(--ink, #0B1220)',
  border: '1px solid var(--paper-line, #E3DFD4)',
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 600,
  textDecoration: 'none',
  fontFamily: 'inherit',
};

function Spinner({ large }: { large?: boolean }) {
  const size = large ? 32 : 14;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
      <circle cx="12" cy="12" r="10" stroke="rgba(59,130,246,0.15)" strokeWidth="3" fill="none" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" fill="none" />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}
