'use client';

type VerificationSource = 'nhtsa-verified' | 'recall-related' | 'ai-researched' | 'manual';

const config: Record<VerificationSource, { label: string; color: string; icon: string }> = {
  'nhtsa-verified': {
    label: 'NHTSA Verified',
    color: 'text-[#3C313D] bg-[#F7F4EC] border-[#D8D1C3]',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  'recall-related': {
    label: 'Recall Related',
    color: 'text-[#3C313D] bg-[#F7F4EC] border-[#D8D1C3]',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  'ai-researched': {
    label: 'Community Reported',
    color: 'text-[#3C313D] bg-[#F7F4EC] border-[#D8D1C3]',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  manual: {
    label: 'Manually Verified',
    color: 'text-[#3C313D] bg-[#F7F4EC] border-[#D8D1C3]',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
};

export function VerificationBadge({ source }: { source?: string }) {
  const key = (source || 'ai-researched') as VerificationSource;
  const cfg = config[key] || config['ai-researched'];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border rounded ${cfg.color}`}
      title={`Data source: ${cfg.label}`}
    >
      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cfg.icon} />
      </svg>
      {cfg.label}
    </span>
  );
}
