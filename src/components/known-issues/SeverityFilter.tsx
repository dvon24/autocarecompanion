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
      color: 'border-red-200 text-red-600 hover:bg-red-50',
      activeColor: 'border-red-500 bg-red-100 text-red-800',
    },
    {
      value: 'medium',
      label: 'Moderate',
      color: 'border-yellow-200 text-yellow-700 hover:bg-yellow-50',
      activeColor: 'border-yellow-500 bg-yellow-100 text-yellow-800',
    },
    {
      value: 'low',
      label: 'Minor',
      color: 'border-gray-200 text-gray-600 hover:bg-gray-50',
      activeColor: 'border-gray-400 bg-gray-100 text-gray-800',
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
