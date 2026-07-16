'use client';

import { triggerHaptic } from '@/hooks/useHaptic';

type Severity = 'high' | 'medium' | 'low';

interface SeverityFilterProps {
  selected: Severity[];
  onChange: (selected: Severity[]) => void;
}

export function SeverityFilter({ selected, onChange }: SeverityFilterProps) {
  const severities: { value: Severity; label: string; color: string; activeColor: string }[] = [
    {
      value: 'high',
      label: 'Critical',
      color: 'border-[#D8D1C3] text-[#64748B] hover:bg-[#F7F4EC]',
      activeColor: 'border-[#3C313D] bg-[#EFEDE6] text-[#0B1220]',
    },
    {
      value: 'medium',
      label: 'Moderate',
      color: 'border-[#D8D1C3] text-[#64748B] hover:bg-[#F7F4EC]',
      activeColor: 'border-[#3C313D] bg-[#EFEDE6] text-[#0B1220]',
    },
    {
      value: 'low',
      label: 'Minor',
      color: 'border-[#D8D1C3] text-[#64748B] hover:bg-[#F7F4EC]',
      activeColor: 'border-[#3C313D] bg-[#EFEDE6] text-[#0B1220]',
    },
  ];

  const toggleSeverity = (severity: Severity) => {
    triggerHaptic('light');

    if (selected.includes(severity)) {
      // Don't allow deselecting all
      if (selected.length === 1) return;
      onChange(selected.filter(s => s !== severity));
    } else {
      onChange([...selected, severity]);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Filter:</span>
      <div className="flex gap-1.5">
        {severities.map(({ value, label, color, activeColor }) => {
          const isActive = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => toggleSeverity(value)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                isActive ? activeColor : color
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
