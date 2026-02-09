'use client';

import { useState } from 'react';
import { type Guide, type Part, type Tool } from '@/schemas/guide.schema';

// Note: useState is still used in PreFlightModal for activeTab

/**
 * PreFlightModal - Pre-flight checklist before starting a repair guide
 *
 * Story 1.7: Pre-Flight Modal
 * Displays required tools, parts, difficulty, safety level, and time estimate
 * with "Buy From" links for parts that search by part number.
 *
 * Follows Architecture patterns:
 * - Touch targets 44x44px minimum (NFR-A7)
 * - Accessible modal with proper ARIA attributes
 */

type PreFlightModalProps = {
  guide: Guide;
  isOpen: boolean;
  onStart: () => void;
  onCancel: () => void;
};

/**
 * Invalid part number patterns - these are NOT real part numbers
 */
const INVALID_PART_PATTERNS = [
  /^varies$/i,
  /^n\/?a$/i,
  /^generic$/i,
  /^unknown$/i,
  /^tbd$/i,
  /^see\s/i,
  /^check\s/i,
  /^consult/i,
  /^none$/i,
  /^any$/i,
];

/**
 * Common brand names that are NOT part numbers
 */
const BRAND_NAMES = [
  'motorcraft', 'toyota', 'honda', 'ford', 'gm', 'chevrolet', 'chevy',
  'acdelco', 'bosch', 'denso', 'ngk', 'fram', 'mobil', 'castrol',
  'valvoline', 'pennzoil', 'royal', 'purple', 'amsoil', 'liqui', 'moly',
  'wix', 'mann', 'k&n', 'purolator', 'champion', 'autolite', 'oem',
  'aftermarket', 'genuine', 'original', 'standard', 'premium', 'basic',
];

/**
 * Check if a string looks like a valid part number
 * Valid part numbers typically:
 * - Have both letters AND numbers (e.g., FL-500S, 04152-YZZA1)
 * - Are at least 4 characters
 * - Are not common brand names or placeholder text
 */
function isValidPartNumber(partNumber: string): boolean {
  if (!partNumber) return false;

  const cleaned = partNumber.trim().toLowerCase();

  // Too short
  if (cleaned.length < 4) return false;

  // Check against invalid patterns
  if (INVALID_PART_PATTERNS.some(pattern => pattern.test(cleaned))) return false;

  // Check if it's just a brand name
  if (BRAND_NAMES.includes(cleaned)) return false;

  // Valid part numbers usually have at least one number
  // (e.g., FL-500S, 04152-YZZA1, 15400-PLM-A02)
  const hasNumber = /\d/.test(cleaned);

  return hasNumber;
}

/**
 * Clean up part number - strip parentheses, notes, and extra text
 */
function cleanPartNumber(partNumber: string): string {
  // Remove anything in parentheses and trim
  let cleaned = partNumber.replace(/\s*\([^)]*\)/g, '').trim();
  // Take only the first word/token if there's extra text
  const match = cleaned.match(/^[\w-]+/);
  return match ? match[0] : cleaned;
}

/**
 * Get a valid, clean part number or null if invalid
 */
function getValidPartNumber(partNumber: string | undefined): string | null {
  if (!partNumber) return null;
  const cleaned = cleanPartNumber(partNumber);
  return isValidPartNumber(cleaned) ? cleaned : null;
}

/**
 * Extract brand name from part name if present in parentheses
 * e.g., "SAE 5W-30 Full Synthetic Engine Oil (Motorcraft)" -> "Motorcraft"
 */
function extractBrandFromName(partName: string): string | null {
  const match = partName.match(/\(([^)]+)\)/);
  if (match) {
    const potential = match[1].trim();
    // Check if it's a known brand name
    if (BRAND_NAMES.includes(potential.toLowerCase())) {
      return potential;
    }
  }
  return null;
}

/**
 * Generate Google search URL for a part
 * Uses brand + part number if valid, otherwise falls back to vehicle + part name
 */
function getPartSearchUrl(part: Part, vehicle: { year: number; make: string; model: string }): string {
  const validPartNum = getValidPartNumber(part.partNumber);
  const brand = extractBrandFromName(part.name);

  // If we have a valid part number, search for it (with brand if available)
  // Otherwise, search by vehicle + part name
  let query: string;
  if (validPartNum) {
    query = brand ? `${brand} ${validPartNum}` : validPartNum;
  } else {
    query = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${part.name}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=shop`;
}

/**
 * Generate Google search URL for a tool
 */
function getToolSearchUrl(tool: Tool): string {
  return `https://www.google.com/search?q=${encodeURIComponent(tool.name + ' tool')}&tbm=shop`;
}

/**
 * Part card with search button
 */
function PartCard({ part, vehicle }: { part: Part; vehicle: { year: number; make: string; model: string } }) {
  // Only display part number if it's a valid, real part number (not "Motorcraft", "Varies", etc.)
  const displayPartNum = getValidPartNumber(part.partNumber);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900">{part.name}</h4>
          {displayPartNum && (
            <p className="text-sm text-blue-600 font-mono mt-1">#{displayPartNum}</p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
            {part.oemPrice && (
              <span className="text-gray-500">OEM: <span className="font-medium">{part.oemPrice}</span></span>
            )}
            {part.aftermarketPrice && (
              <span className="text-green-600">Aftermarket: <span className="font-medium">{part.aftermarketPrice}</span></span>
            )}
          </div>
          {part.notes && (
            <p className="text-xs text-gray-400 mt-2">{part.notes}</p>
          )}
        </div>
      </div>

      {/* Search Button */}
      <a
        href={getPartSearchUrl(part, vehicle)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-gray-700 text-sm font-medium bg-gray-100 rounded-xl border border-gray-200 hover:bg-gray-200 hover:border-gray-300 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Find This Part
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  );
}

/**
 * Tool card with search button
 */
function ToolCard({ tool }: { tool: Tool }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tool.required ? 'bg-blue-100' : 'bg-gray-100'}`}>
          <svg className={`w-4 h-4 ${tool.required ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">{tool.name}</h4>
            {!tool.required && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Optional</span>
            )}
          </div>
          {tool.purpose && (
            <p className="text-sm text-gray-500 mt-0.5">{tool.purpose}</p>
          )}
          {tool.costRange && (
            <p className="text-sm text-gray-400 mt-1">{tool.costRange}</p>
          )}
          {tool.alternatives && tool.alternatives.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">Alt: {tool.alternatives.join(', ')}</p>
          )}
        </div>
      </div>

      {/* Search Button */}
      <a
        href={getToolSearchUrl(tool)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 text-sm font-medium bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Find This Tool
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  );
}

export function PreFlightModal({
  guide,
  isOpen,
  onStart,
  onCancel,
}: PreFlightModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'parts' | 'tools'>('overview');

  if (!isOpen) return null;

  const difficultyStars = '★'.repeat(guide.difficulty) + '☆'.repeat(5 - guide.difficulty);

  const safetyConfig = {
    'diy-safe': {
      label: 'DIY Safe',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    'diy-safe-with-care': {
      label: 'DIY Safe with Care',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    'requires-mechanic': {
      label: 'Professional Recommended',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
    },
  };

  const safety = safetyConfig[guide.safetyLevel];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preflight-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="preflight-title" className="text-xl font-semibold text-gray-900 tracking-tight">
                Before You Start
              </h2>
              <p className="text-sm text-gray-500 mt-1">{guide.title}</p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'parts', label: `Parts (${guide.parts.length})` },
              { id: 'tools', label: `Tools (${guide.tools.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as 'overview' | 'parts' | 'tools')}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="px-6 py-4 space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl p-4 text-center">
                  <div className="text-yellow-500 text-lg mb-1">{difficultyStars}</div>
                  <div className="text-xs text-gray-500 font-medium">Difficulty</div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl p-4 text-center">
                  <div className="text-lg font-semibold text-gray-900 mb-1">{guide.timeEstimate}</div>
                  <div className="text-xs text-gray-500 font-medium">Time</div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl p-4 text-center">
                  <div className="text-lg font-semibold text-gray-900 mb-1">{guide.steps.length}</div>
                  <div className="text-xs text-gray-500 font-medium">Steps</div>
                </div>
              </div>

              {/* Safety Badge */}
              <div className={`flex items-center gap-3 p-4 rounded-xl border ${safety.bgColor} ${safety.borderColor}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${safety.bgColor}`}>
                  <span className={safety.textColor}>{safety.icon}</span>
                </div>
                <div>
                  <div className={`font-semibold ${safety.textColor}`}>{safety.label}</div>
                  {guide.safetyLevel === 'requires-mechanic' && (
                    <p className="text-sm text-red-600 mt-0.5">Consider professional help if unsure.</p>
                  )}
                  {guide.safetyLevel === 'diy-safe-with-care' && (
                    <p className="text-sm text-amber-600 mt-0.5">Follow safety warnings carefully.</p>
                  )}
                </div>
              </div>

              {/* Quick Summary */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h3 className="font-medium text-blue-900 mb-2">What You&apos;ll Need</h3>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2 text-blue-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    {guide.parts.length} part{guide.parts.length !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-2 text-blue-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {guide.tools.length} tool{guide.tools.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <p className="text-sm text-blue-600 mt-2">
                  Check the Parts and Tools tabs to see what you need and where to buy.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'parts' && (
            <div className="px-6 py-4">
              {guide.parts.length > 0 ? (
                <div className="space-y-3">
                  {guide.parts.map((part) => (
                    <PartCard key={part.id} part={part} vehicle={guide.vehicle} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">No parts required</p>
                  <p className="text-sm text-gray-400 mt-1">This repair doesn&apos;t need any replacement parts.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="px-6 py-4">
              {guide.tools.length > 0 ? (
                <div className="space-y-3">
                  {guide.tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">No special tools needed</p>
                  <p className="text-sm text-gray-400 mt-1">Basic hand tools should be sufficient.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 min-h-[48px] py-3 px-4 font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onStart}
              className="flex-1 min-h-[48px] py-3 px-4 font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 hover:scale-[1.02] transition-all shadow-lg shadow-gray-900/20"
            >
              Start Guide →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
