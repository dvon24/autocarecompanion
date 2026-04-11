'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useVehicleContext } from '@/contexts/AppContext';
import { KnownIssueCard } from '@/components/known-issues/KnownIssueCard';
import { SeverityFilter } from '@/components/known-issues/SeverityFilter';
import { FloatingChat } from '@/components/vehicle/FloatingChat';

// Types
interface VehicleTuple {
  year: number;
  make: string;
  model: string;
  trim: string;
}

interface KnownIssue {
  id: string;
  title: string;
  description: string;
  severity: string;
  category: string;
  reportCount: number;
  estimatedCost?: { min: number; max: number };
  vehicleMatch: { years: number[]; trims?: string[] };
  symptoms?: string[];
  solutions?: string[];
  communityRecommendations?: any[];
  dtcCodes?: string[];
  [key: string]: any;
}

interface RecallItem {
  campaignNumber: string;
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  reportDate: string;
  parkIt?: boolean;
}

interface CachedPart {
  task: string;
  parts: any[];
  source: string;
}

type TabId = 'issues' | 'parts' | 'recalls' | 'guides';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'issues', label: 'Known Issues', icon: '⚠️' },
  { id: 'parts', label: 'Parts', icon: '🔧' },
  { id: 'recalls', label: 'Recalls', icon: '🔔' },
  { id: 'guides', label: 'Guides', icon: '📖' },
];

// Task display names
const TASK_NAMES: Record<string, string> = {
  oil_change: 'Oil Change', brake_inspection: 'Brakes', spark_plugs: 'Spark Plugs',
  air_filter: 'Air Filter', cabin_filter: 'Cabin Filter', battery: 'Battery',
  coolant_flush: 'Coolant', transmission_fluid: 'Transmission', wiper_blades: 'Wipers',
  serpentine_belt: 'Drive Belt', differential_fluid: 'Differential', alternator: 'Alternator',
  starter_motor: 'Starter', water_pump: 'Water Pump', thermostat: 'Thermostat',
  radiator: 'Radiator', shocks_struts: 'Shocks & Struts', wheel_bearing: 'Wheel Bearings',
  brake_calipers: 'Calipers', ignition_coils: 'Ignition Coils', fuel_filter: 'Fuel Filter',
  fuel_pump: 'Fuel Pump', oxygen_sensor: 'O2 Sensor', ac_compressor: 'AC Compressor',
  timing_belt: 'Timing Belt/Chain', valve_cover_gasket: 'Valve Cover Gasket',
  oil_pan_gasket: 'Oil Pan Gasket', head_gasket: 'Head Gasket',
  intake_manifold_gasket: 'Intake Gasket', catalytic_converter: 'Cat Converter',
  muffler_exhaust: 'Exhaust', ball_joints: 'Ball Joints', tie_rods: 'Tie Rods',
  control_arms: 'Control Arms', sway_bar_links: 'Sway Bar Links', cv_axle: 'CV Axle',
  clutch_kit: 'Clutch Kit', u_joints: 'U-Joints', brake_fluid: 'Brake Fluid',
  power_steering_fluid: 'Power Steering', transfer_case_fluid: 'Transfer Case',
  bulb_replacement: 'Bulbs', tire_rotation: 'Lug Specs', wheel_specs: 'Wheel Specs',
};

const AFFILIATE_TAG = 'au7o-20';

export function VehicleDashboard({
  vehicle,
  slug,
  issues,
  recalls,
  cachedParts,
  specsSummary,
}: {
  vehicle: VehicleTuple;
  slug: string;
  issues: KnownIssue[];
  recalls: RecallItem[];
  cachedParts: CachedPart[];
  specsSummary: Record<string, string>;
}) {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabId) || 'issues';
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState<string>('');
  const { setVehicle } = useVehicleContext();

  // Set vehicle context on mount
  useEffect(() => {
    setVehicle(vehicle);
  }, [vehicle, setVehicle]);

  // Update chat context when tab changes
  useEffect(() => {
    setChatContext(`User is viewing the ${activeTab} tab for their ${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}.`);
  }, [activeTab, vehicle]);

  const vehicleDisplay = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`;
  const criticalCount = issues.filter(i => i.severity === 'high' || i.severity === 'critical').length;
  const filteredIssues = severityFilter
    ? issues.filter(i => i.severity === severityFilter)
    : issues;

  // Parts grouped by category
  const standardParts = cachedParts.filter(p => !p.task.startsWith('freetext:'));

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-3">
          {/* Top row: Logo + Vehicle */}
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg font-bold text-white tracking-tight">
              Au<span className="text-blue-400">7</span>o
            </Link>
            <div className="text-right">
              <h1 className="text-base font-semibold text-white">{vehicleDisplay}</h1>
              {specsSummary.engine && (
                <p className="text-xs text-gray-400">{specsSummary.engine}</p>
              )}
            </div>
          </div>

          {/* Specs Cheat Sheet */}
          {Object.keys(specsSummary).length > 1 && (
            <div className="mt-2 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {specsSummary.oil && (
                <SpecChip label="Oil" value={specsSummary.oil} />
              )}
              {specsSummary.oilFilter && (
                <SpecChip label="Filter" value={specsSummary.oilFilter} />
              )}
              {specsSummary.coolant && (
                <SpecChip label="Coolant" value={specsSummary.coolant} />
              )}
              {specsSummary.lug && (
                <SpecChip label="Lug" value={specsSummary.lug} />
              )}
              {specsSummary.sparkPlugs && (
                <SpecChip label="Plugs" value={specsSummary.sparkPlugs} />
              )}
              {specsSummary.brakeFluid && (
                <SpecChip label="Brake Fluid" value={specsSummary.brakeFluid} />
              )}
              {specsSummary.transmission && (
                <SpecChip label="Trans" value={specsSummary.transmission} />
              )}
            </div>
          )}
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="sticky top-[72px] z-30 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex">
            {TABS.map(tab => {
              const count = tab.id === 'issues' ? issues.length
                : tab.id === 'recalls' ? recalls.length
                : tab.id === 'parts' ? standardParts.length
                : 0;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-400 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span className="text-xs">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id ? 'bg-blue-400/20 text-blue-300' : 'bg-gray-800 text-gray-500'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Issues Tab */}
        {activeTab === 'issues' && (
          <div>
            {issues.length === 0 ? (
              <EmptyState
                icon="✅"
                title="No Known Issues"
                description={`We don't have any documented issues for the ${vehicleDisplay}. That's good news!`}
              />
            ) : (
              <>
                {criticalCount > 0 && (
                  <div className="mb-4 p-3 bg-red-950/50 border border-red-800/50 rounded-lg">
                    <p className="text-sm text-red-300">
                      <span className="font-semibold">{criticalCount} critical issue{criticalCount > 1 ? 's' : ''}</span> documented for this vehicle
                    </p>
                  </div>
                )}

                {/* Severity pills */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                  <FilterPill
                    label="All"
                    count={issues.length}
                    active={!severityFilter}
                    onClick={() => setSeverityFilter(null)}
                  />
                  {['critical', 'high', 'medium', 'low'].map(sev => {
                    const count = issues.filter(i => i.severity === sev).length;
                    if (count === 0) return null;
                    return (
                      <FilterPill
                        key={sev}
                        label={sev.charAt(0).toUpperCase() + sev.slice(1)}
                        count={count}
                        active={severityFilter === sev}
                        onClick={() => setSeverityFilter(severityFilter === sev ? null : sev)}
                        color={sev === 'critical' || sev === 'high' ? 'red' : sev === 'medium' ? 'amber' : 'gray'}
                      />
                    );
                  })}
                </div>

                <div className="space-y-3">
                  {filteredIssues.map(issue => (
                    <IssueCard key={issue.id} issue={issue} vehicle={vehicle} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Parts Tab */}
        {activeTab === 'parts' && (
          <div>
            {standardParts.length === 0 ? (
              <EmptyState
                icon="🔧"
                title="No Cached Parts Yet"
                description="Parts data hasn't been loaded for this vehicle yet. Use the chat to ask about specific parts."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {standardParts.map(cp => (
                  <PartTaskCard key={cp.task} task={cp.task} parts={cp.parts} vehicle={vehicle} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recalls Tab */}
        {activeTab === 'recalls' && (
          <div>
            {recalls.length === 0 ? (
              <EmptyState
                icon="✅"
                title="No Active Recalls"
                description={`No open recalls found for the ${vehicleDisplay}.`}
              />
            ) : (
              <div className="space-y-3">
                {recalls.map(recall => (
                  <RecallCard key={recall.campaignNumber} recall={recall} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Guides Tab */}
        {activeTab === 'guides' && (
          <div>
            <EmptyState
              icon="📖"
              title="Maintenance Guides"
              description="Ask the AI assistant about any maintenance task and it will generate a step-by-step guide for your specific vehicle."
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
              {['Oil Change', 'Brake Pads', 'Spark Plugs', 'Air Filter', 'Cabin Filter', 'Battery',
                'Coolant Flush', 'Tire Rotation', 'Wiper Blades', 'Serpentine Belt', 'Transmission Fluid', 'Brake Fluid'
              ].map(task => (
                <button
                  key={task}
                  onClick={() => {
                    setChatContext(`User wants a ${task.toLowerCase()} guide for their ${vehicleDisplay}.`);
                    setChatOpen(true);
                  }}
                  className="p-3 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-left"
                >
                  {task}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gray-950/95 backdrop-blur-sm border-t border-gray-800 sm:hidden">
        <div className="flex justify-around py-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs ${
                activeTab === tab.id ? 'text-blue-400' : 'text-gray-500'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label.split(' ').pop()}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Floating Chat */}
      <FloatingChat
        vehicle={vehicle}
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
        context={chatContext}
      />

      {/* Bottom padding for mobile nav */}
      <div className="h-16 sm:hidden" />
    </div>
  );
}

// --- Sub-components ---

function SpecChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-shrink-0 px-2.5 py-1 bg-gray-900 border border-gray-800 rounded-md">
      <span className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</span>
      <p className="text-xs text-gray-200 font-medium whitespace-nowrap">{value}</p>
    </div>
  );
}

function FilterPill({
  label, count, active, onClick, color = 'gray',
}: {
  label: string; count: number; active: boolean; onClick: () => void; color?: string;
}) {
  const colorMap: Record<string, string> = {
    red: active ? 'bg-red-900/50 border-red-700 text-red-300' : 'border-gray-700 text-gray-400 hover:border-red-800',
    amber: active ? 'bg-amber-900/50 border-amber-700 text-amber-300' : 'border-gray-700 text-gray-400 hover:border-amber-800',
    gray: active ? 'bg-gray-800 border-gray-600 text-gray-200' : 'border-gray-700 text-gray-400 hover:border-gray-600',
  };

  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-full transition-colors ${colorMap[color]}`}
    >
      {label}
      <span className="opacity-60">{count}</span>
    </button>
  );
}

function IssueCard({ issue, vehicle }: { issue: KnownIssue; vehicle: VehicleTuple }) {
  const [expanded, setExpanded] = useState(false);
  const severityColors: Record<string, string> = {
    critical: 'bg-red-900/50 text-red-300 border-red-800',
    high: 'bg-red-900/30 text-red-400 border-red-800/50',
    medium: 'bg-amber-900/30 text-amber-400 border-amber-800/50',
    low: 'bg-gray-800 text-gray-400 border-gray-700',
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-100">{issue.title}</h3>
            {issue.estimatedCost && (
              <p className="text-xs text-gray-500 mt-1">
                ${issue.estimatedCost.min} - ${issue.estimatedCost.max} to fix
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${severityColors[issue.severity] || severityColors.low}`}>
              {issue.severity}
            </span>
            <svg className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-800 pt-3">
          <p className="text-sm text-gray-400">{issue.description}</p>

          {issue.symptoms && issue.symptoms.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Symptoms</p>
              <ul className="space-y-1">
                {issue.symptoms.map((s, i) => (
                  <li key={i} className="text-xs text-gray-400 flex gap-2">
                    <span className="text-gray-600">-</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {issue.solutions && issue.solutions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Solutions</p>
              <ul className="space-y-1">
                {issue.solutions.map((s, i) => (
                  <li key={i} className="text-xs text-gray-400 flex gap-2">
                    <span className="text-gray-600">-</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {issue.dtcCodes && issue.dtcCodes.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {issue.dtcCodes.map(code => (
                <Link
                  key={code}
                  href={`/known-issues/dtc/${code.toLowerCase()}`}
                  className="text-[10px] font-mono px-2 py-0.5 bg-blue-900/30 text-blue-400 border border-blue-800/50 rounded hover:bg-blue-900/50"
                >
                  {code}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PartTaskCard({ task, parts, vehicle }: { task: string; parts: any[]; vehicle: VehicleTuple }) {
  const [expanded, setExpanded] = useState(false);
  const displayName = TASK_NAMES[task] || task.replace(/_/g, ' ');

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 text-left flex items-center justify-between"
      >
        <div>
          <h3 className="text-sm font-medium text-gray-200">{displayName}</h3>
          <p className="text-xs text-gray-500">{parts.length} part{parts.length !== 1 ? 's' : ''}</p>
        </div>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-gray-800 pt-2">
          {parts.map((part: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-gray-300 truncate">{part.brand || ''} {part.name || part.partNumber || ''}</p>
                {part.partNumber && <p className="text-[10px] text-gray-500 font-mono">{part.partNumber}</p>}
              </div>
              {part.partNumber && (
                <a
                  href={`https://www.amazon.com/s?k=${encodeURIComponent((part.brand || '') + ' ' + part.partNumber)}&tag=${AFFILIATE_TAG}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 text-[10px] px-2 py-1 bg-blue-900/30 text-blue-400 border border-blue-800/50 rounded hover:bg-blue-900/50 transition-colors"
                >
                  Amazon
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecallCard({ recall }: { recall: RecallItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`bg-gray-900 border rounded-lg overflow-hidden ${recall.parkIt ? 'border-red-800' : 'border-gray-800'}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-100">{recall.component}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{recall.campaignNumber} · {recall.reportDate}</p>
          </div>
          {recall.parkIt && (
            <span className="flex-shrink-0 px-2 py-0.5 text-[10px] font-medium bg-red-900/50 text-red-300 border border-red-800 rounded-full">
              PARK IT
            </span>
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-gray-800 pt-3">
          <p className="text-sm text-gray-400">{recall.summary}</p>
          {recall.consequence && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Risk</p>
              <p className="text-xs text-red-400">{recall.consequence}</p>
            </div>
          )}
          {recall.remedy && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Remedy</p>
              <p className="text-xs text-gray-400">{recall.remedy}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="text-center py-12">
      <span className="text-4xl">{icon}</span>
      <h2 className="text-lg font-semibold text-gray-200 mt-3">{title}</h2>
      <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">{description}</p>
    </div>
  );
}
