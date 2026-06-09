'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { DTCDirectoryEntry } from '@/lib/dtc-codes';

/**
 * Searchable DTC code directory. Renders EVERY code on the server (so the
 * full grid is in the SSG HTML for crawlers); the search box filters
 * client-side. Grouped by the first letter (P/B/C/U) which maps to the
 * OBD-II system family.
 */

const PREFIX_LABEL: Record<string, string> = {
  P: 'Powertrain — engine & transmission',
  B: 'Body',
  C: 'Chassis',
  U: 'Network & communication',
};

const SEV: Record<string, { bg: string; fg: string }> = {
  critical: { bg: '#FEE2E2', fg: '#B91C1C' },
  high: { bg: '#FEF3C7', fg: '#92400E' },
  medium: { bg: '#EFEDE6', fg: '#334155' },
  low: { bg: '#EFEDE6', fg: '#64748B' },
};

export function DTCDirectory({ codes }: { codes: DTCDirectoryEntry[] }) {
  const [q, setQ] = useState('');
  const query = q.trim().toUpperCase();

  const groups = useMemo(() => {
    const g: Record<string, DTCDirectoryEntry[]> = {};
    for (const c of codes) {
      const p = (c.code[0] || 'P').toUpperCase();
      (g[p] = g[p] || []).push(c);
    }
    return g;
  }, [codes]);

  const matches = (c: DTCDirectoryEntry) =>
    !query || c.code.toUpperCase().includes(query) || c.name.toUpperCase().includes(query);

  const visibleCount = codes.filter(matches).length;

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a code or symptom — e.g. P0420, misfire, EGR, oil pressure"
          aria-label="Search DTC codes"
          style={{
            width: '100%',
            padding: '13px 16px',
            fontSize: 15,
            background: '#fff',
            border: '1px solid #E3DFD4',
            borderRadius: 12,
            color: '#0B1220',
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />
      </div>

      {query && visibleCount === 0 && (
        <p style={{ color: '#64748B', fontSize: 14, padding: '8px 0 24px' }}>
          No code matches &ldquo;{q}&rdquo; in our database yet. Try the bare code (e.g. <strong>P0300</strong>) or a
          symptom keyword.
        </p>
      )}

      {(['P', 'B', 'C', 'U'] as const).map((prefix) => {
        const all = groups[prefix];
        if (!all || all.length === 0) return null;
        const items = all.filter(matches);
        if (items.length === 0) return null;
        return (
          <section key={prefix} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0B1220', marginBottom: 14 }}>
              {PREFIX_LABEL[prefix] || prefix}{' '}
              <span style={{ fontSize: 14, fontWeight: 500, color: '#94A3B8' }}>({items.length})</span>
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 10,
              }}
            >
              {items.map((c) => {
                const sev = SEV[c.severity] || SEV.medium;
                return (
                  <Link
                    key={c.code}
                    href={`/known-issues/dtc/${c.code.toLowerCase()}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      background: '#fff',
                      border: '1px solid #E3DFD4',
                      borderRadius: 11,
                      textDecoration: 'none',
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                        fontWeight: 700,
                        fontSize: 14,
                        color: '#0B1220',
                        background: '#EFEDE6',
                        borderRadius: 7,
                        padding: '4px 8px',
                      }}
                    >
                      {c.code}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        fontSize: 13,
                        color: '#334155',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.name}
                    </span>
                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: sev.fg,
                        background: sev.bg,
                        borderRadius: 999,
                        padding: '3px 8px',
                      }}
                    >
                      {c.severity}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
