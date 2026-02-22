'use client';

import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface Modification {
  id: string;
  category: string;
  name: string;
  brand?: string | null;
  partNumber?: string | null;
  description?: string | null;
  cost?: number | null;
  installDate?: Date | string | null;
  imageUrl?: string | null;
}

interface ModListProps {
  modifications: Modification[];
  showCosts?: boolean;
}

const CATEGORY_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  wheels: { icon: '🛞', label: 'Wheels', color: 'bg-blue-100 text-blue-800' },
  tires: { icon: '⚫', label: 'Tires', color: 'bg-gray-100 text-gray-800' },
  suspension: { icon: '🔧', label: 'Suspension', color: 'bg-orange-100 text-orange-800' },
  exhaust: { icon: '💨', label: 'Exhaust', color: 'bg-red-100 text-red-800' },
  body: { icon: '🚗', label: 'Body', color: 'bg-purple-100 text-purple-800' },
  interior: { icon: '🪑', label: 'Interior', color: 'bg-green-100 text-green-800' },
  performance: { icon: '⚡', label: 'Performance', color: 'bg-yellow-100 text-yellow-800' },
  lighting: { icon: '💡', label: 'Lighting', color: 'bg-cyan-100 text-cyan-800' },
  audio: { icon: '🔊', label: 'Audio', color: 'bg-pink-100 text-pink-800' },
  other: { icon: '📦', label: 'Other', color: 'bg-gray-100 text-gray-600' },
};

export function ModList({ modifications, showCosts = true }: ModListProps) {
  // Group by category
  const grouped = modifications.reduce((acc, mod) => {
    const category = mod.category.toLowerCase();
    if (!acc[category]) acc[category] = [];
    acc[category].push(mod);
    return acc;
  }, {} as Record<string, Modification[]>);

  const categories = Object.keys(grouped);

  if (modifications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No modifications added yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
        const mods = grouped[category];

        return (
          <div key={category}>
            {/* Category Header */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{config.icon}</span>
              <h3 className="font-medium text-gray-900">{config.label}</h3>
              <span className="text-sm text-gray-400">({mods.length})</span>
            </div>

            {/* Mods in Category */}
            <div className="space-y-3">
              {mods.map((mod) => (
                <ModItem key={mod.id} mod={mod} showCost={showCosts} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ModItem({ mod, showCost }: { mod: Modification; showCost: boolean }) {
  const config = CATEGORY_CONFIG[mod.category.toLowerCase()] || CATEGORY_CONFIG.other;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors">
      <div className="flex gap-4">
        {/* Image */}
        {mod.imageUrl && (
          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={mod.imageUrl}
              alt={mod.name}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium text-gray-900">{mod.name}</h4>
              {mod.brand && (
                <p className="text-sm text-gray-600">{mod.brand}</p>
              )}
            </div>

            {showCost && mod.cost && (
              <span className="text-sm font-medium text-gray-700 flex-shrink-0">
                ${mod.cost.toLocaleString()}
              </span>
            )}
          </div>

          {mod.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {mod.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            {mod.partNumber && (
              <span>Part# {mod.partNumber}</span>
            )}
            {mod.installDate && (
              <span>
                Installed {formatDistanceToNow(new Date(mod.installDate), { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Summary component for quick stats
export function ModSummary({ modifications }: { modifications: Modification[] }) {
  const totalCost = modifications.reduce((sum, mod) => sum + (mod.cost || 0), 0);
  const categoryCount = new Set(modifications.map((m) => m.category)).size;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center p-4 bg-gray-50 rounded-xl">
        <p className="text-2xl font-bold text-gray-900">{modifications.length}</p>
        <p className="text-xs text-gray-500 mt-1">Total Mods</p>
      </div>
      <div className="text-center p-4 bg-gray-50 rounded-xl">
        <p className="text-2xl font-bold text-gray-900">{categoryCount}</p>
        <p className="text-xs text-gray-500 mt-1">Categories</p>
      </div>
      <div className="text-center p-4 bg-gray-50 rounded-xl">
        <p className="text-2xl font-bold text-gray-900">
          ${totalCost.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mt-1">Invested</p>
      </div>
    </div>
  );
}
