'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useVehicleContext } from '@/contexts/AppContext';
import { ChatMessage, ChatMessageLoading } from '@/components/chat/ChatMessage';
import { type ChatMessage as ChatMessageType, createChatMessage } from '@/schemas/chat.schema';

// ─── Types ─────────────────────────────────────────────────────────────

interface VehicleTuple {
  year: number; make: string; model: string; trim: string;
}

interface KnownIssue {
  id: string; title: string; description: string; severity: string;
  category: string; reportCount: number;
  estimatedCost?: { min: number; max: number };
  vehicleMatch: { years: number[]; trims?: string[] };
  symptoms?: string[]; solutions?: string[];
  communityRecommendations?: any[]; dtcCodes?: string[];
  [key: string]: any;
}

interface RecallItem {
  campaignNumber: string; component: string; summary: string;
  consequence: string; remedy: string; reportDate: string; parkIt?: boolean;
}

interface CachedPart { task: string; parts: any[]; source: string; }

type SectionId = 'issues' | 'parts' | 'recalls' | 'guides' | 'chat';

const SIDEBAR_ITEMS: { id: SectionId; label: string; icon: React.ReactNode }[] = [
  { id: 'parts', label: 'Parts', icon: <IconParts /> },
  { id: 'recalls', label: 'Recalls', icon: <IconRecalls /> },
  { id: 'guides', label: 'Guides', icon: <IconGuides /> },
  { id: 'chat', label: 'Chat', icon: <IconChat /> },
];

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
  clutch_kit: 'Clutch', u_joints: 'U-Joints', brake_fluid: 'Brake Fluid',
  power_steering_fluid: 'Power Steering', transfer_case_fluid: 'Transfer Case',
  bulb_replacement: 'Bulbs', tire_rotation: 'Lug Specs', wheel_specs: 'Wheel Specs',
};

const AFFILIATE_TAG = 'au7o-20';

// ─── Main Component ────────────────────────────────────────────────────

export function VehicleDashboard({
  vehicle, slug, issues, recalls, cachedParts, specsSummary,
}: {
  vehicle: VehicleTuple; slug: string;
  issues: KnownIssue[]; recalls: RecallItem[];
  cachedParts: CachedPart[]; specsSummary: Record<string, string>;
}) {
  const searchParams = useSearchParams();
  const initialSection = (searchParams.get('tab') as SectionId) || 'chat';
  const [activeSection, setActiveSection] = useState<SectionId>(initialSection);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [aiContext, setAiContext] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setVehicle } = useVehicleContext();

  const vehicleDisplay = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`;
  const standardParts = cachedParts.filter(p => !p.task.startsWith('freetext:'));
  const criticalCount = issues.filter(i => i.severity === 'high' || i.severity === 'critical').length;

  // Set vehicle context on mount
  useEffect(() => { setVehicle(vehicle); }, [vehicle, setVehicle]);

  // Auto-scroll chat
  useEffect(() => {
    if (activeSection === 'chat') chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading, activeSection]);

  // Update AI context when section changes
  useEffect(() => {
    const contextMap: Record<SectionId, string> = {
      issues: `User has ${issues.length} known issues for their ${vehicleDisplay}. ${criticalCount} are critical/high severity.`,
      parts: `User is browsing cached parts for their ${vehicleDisplay}. ${standardParts.length} part categories available.`,
      recalls: `User is viewing ${recalls.length} recall(s) for their ${vehicleDisplay}.`,
      guides: `User wants maintenance guides for their ${vehicleDisplay}.`,
      chat: `User is in open chat about their ${vehicleDisplay}.`,
    };
    setAiContext(contextMap[activeSection]);
  }, [activeSection, vehicleDisplay, issues.length, criticalCount, standardParts.length, recalls.length]);

  const handleSectionChange = (id: SectionId) => {
    setActiveSection(id);
    if (id === 'chat') setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = async (text?: string) => {
    const msg = (text || chatInput).trim();
    if (!msg || chatLoading) return;

    const userMsg = createChatMessage('user', msg);
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);
    setActiveSection('chat');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          conversationHistory: chatMessages.map(m => ({ role: m.role, content: m.content })),
          vehicle,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setChatMessages(prev => [...prev, data.message]);
    } catch {
      setChatMessages(prev => [...prev, createChatMessage('assistant', 'Sorry, something went wrong. Please try again.')]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white text-gray-900 overflow-hidden">

      {/* ─── Top Bar ─────────────────────────────────────────── */}
      <header className="flex-shrink-0 h-14 flex items-center justify-between px-4 border-b border-gray-200 bg-gray-100">
        <div className="flex items-center gap-3">
          {/* Hamburger */}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors hidden sm:block"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <Link href="/" className="text-lg font-bold text-gray-900 tracking-tight">
            Au<span className="text-blue-600">7</span>o
          </Link>
        </div>

        {/* Vehicle name */}
        <div className="text-right">
          <p className="text-sm font-medium text-gray-800">{vehicleDisplay}</p>
          {specsSummary.engine && (
            <p className="text-[11px] text-gray-500">{specsSummary.engine}</p>
          )}
        </div>
      </header>

      {/* ─── Body: Sidebar + Main ─────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ─── Sidebar (YouTube-style) ──────────────────────── */}
        <aside className={`hidden sm:flex flex-col flex-shrink-0 border-r border-gray-200 bg-gray-50 transition-all duration-200 ${
          sidebarExpanded ? 'w-56' : 'w-[72px]'
        }`}>
          <nav className="flex-1 py-2">
            {SIDEBAR_ITEMS.map(item => {
              const isActive = activeSection === item.id;
              const count = item.id === 'issues' ? issues.length
                : item.id === 'recalls' ? recalls.length
                : item.id === 'parts' ? standardParts.length
                : null;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                    sidebarExpanded ? 'mx-2 rounded-lg' : 'flex-col gap-1 rounded-none text-[10px]'
                  } ${
                    isActive
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                  title={item.label}
                >
                  <span className={`flex-shrink-0 ${sidebarExpanded ? '' : 'mx-auto'}`}>
                    {item.icon}
                  </span>
                  {sidebarExpanded ? (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  ) : (
                    <span className="truncate">{item.label.split(' ').pop()}</span>
                  )}
                  {sidebarExpanded && count !== null && count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-gray-200 text-gray-700' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ─── Main Content Area ────────────────────────────── */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Vehicle Profile Card */}
          <div className="flex-shrink-0 p-4 sm:p-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg shadow-gray-200/60 p-5">
              {/* Logo + Name row */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  <Image
                    src={`/logos/${vehicle.make.toLowerCase().replace(/\s+/g, '-')}.png`}
                    alt={vehicle.make}
                    width={40}
                    height={40}
                    className="object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{vehicleDisplay}</h2>
                  {specsSummary.engine && (
                    <p className="text-sm text-gray-500">{specsSummary.engine}</p>
                  )}
                </div>
              </div>

              {/* Quick Brief */}
              <div className="mb-4 text-sm text-gray-500 leading-relaxed">
                {criticalCount > 0 && (
                  <p className="text-red-600 font-medium mb-1">
                    {criticalCount} known critical/high severity issue{criticalCount > 1 ? 's' : ''} for this vehicle.
                  </p>
                )}
                {specsSummary.oil && <p>Oil: <span className="text-gray-800 font-medium">{specsSummary.oil}</span>{specsSummary.oilFilter ? ` · Filter: ${specsSummary.oilFilter}` : ''}</p>}
                {specsSummary.coolant && <p>Coolant: <span className="text-gray-800 font-medium">{specsSummary.coolant}</span></p>}
                {specsSummary.transmission && <p>Transmission: <span className="text-gray-800 font-medium">{specsSummary.transmission}</span></p>}
                {specsSummary.lug && <p>Lug: <span className="text-gray-800 font-medium">{specsSummary.lug}</span></p>}
                {specsSummary.sparkPlugs && <p>Spark Plugs: <span className="text-gray-800 font-medium">{specsSummary.sparkPlugs}</span></p>}
                {specsSummary.brakeFluid && <p>Brake Fluid: <span className="text-gray-800 font-medium">{specsSummary.brakeFluid}</span></p>}
              </div>

              {/* Stats row */}
              <div className="flex gap-3 flex-wrap">
                {issues.length > 0 && (
                  <span className="text-xs px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-lg text-gray-600">
                    {issues.length} known issue{issues.length !== 1 ? 's' : ''}
                  </span>
                )}
                {recalls.length > 0 && (
                  <span className="text-xs px-2.5 py-1 bg-red-50 border border-red-200 rounded-lg text-red-600">
                    {recalls.length} recall{recalls.length !== 1 ? 's' : ''}
                  </span>
                )}
                {standardParts.length > 0 && (
                  <span className="text-xs px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-lg text-gray-600">
                    {standardParts.length} parts cached
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4">

            {/* Parts Section */}
            {activeSection === 'parts' && (
              <div className="space-y-3">
                <SectionHeader title="Parts" count={standardParts.length} />
                {standardParts.length === 0 ? (
                  <EmptyState icon="🔧" title="No Cached Parts" description="Parts haven't been loaded yet. Ask the AI about specific parts." />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {standardParts.map(cp => <PartCard key={cp.task} task={cp.task} parts={cp.parts} />)}
                  </div>
                )}
              </div>
            )}

            {/* Recalls Section */}
            {activeSection === 'recalls' && (
              <div className="space-y-3">
                <SectionHeader title="Recalls" count={recalls.length} />
                {recalls.length === 0 ? (
                  <EmptyState icon="✅" title="No Active Recalls" description="No open recalls for this vehicle." />
                ) : (
                  recalls.map(r => <RecallCard key={r.campaignNumber} recall={r} />)
                )}
              </div>
            )}

            {/* Guides Section */}
            {activeSection === 'guides' && (
              <div className="space-y-3">
                <SectionHeader title="Maintenance Guides" />
                <p className="text-sm text-gray-500">Select a task to get a step-by-step guide from the AI.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['Oil Change', 'Brake Pads', 'Spark Plugs', 'Air Filter', 'Cabin Filter', 'Battery',
                    'Coolant Flush', 'Tire Rotation', 'Wiper Blades', 'Serpentine Belt', 'Transmission Fluid', 'Brake Fluid',
                  ].map(task => (
                    <button
                      key={task}
                      onClick={() => sendMessage(`Give me a step-by-step ${task.toLowerCase()} guide for my ${vehicleDisplay}`)}
                      className="p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm transition-all text-left"
                    >
                      {task}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Section */}
            {activeSection === 'chat' && (
              <div className="space-y-1">
                {chatMessages.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">Ask me anything</h2>
                    <p className="text-sm text-gray-500 mt-1">Parts, diagnostics, maintenance, costs</p>
                  </div>
                )}
                {chatMessages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
                {chatLoading && <ChatMessageLoading />}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* ─── Bottom: Context Buttons + Chat Input ────────── */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-4 sm:px-6 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
            {/* Chat input (always visible) */}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                onFocus={() => { if (activeSection !== 'chat') setActiveSection('chat'); }}
                placeholder={`Ask about your ${vehicle.make} ${vehicle.model}...`}
                className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!chatInput.trim() || chatLoading}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-40 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* ─── Mobile Bottom Nav ──────────────────────────────── */}
      <nav className="flex-shrink-0 sm:hidden border-t border-gray-200 bg-white">
        <div className="flex justify-around py-1.5">
          {SIDEBAR_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => handleSectionChange(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 ${
                activeSection === item.id ? 'text-white' : 'text-gray-500'
              }`}
            >
              <span className="w-5 h-5">{item.icon}</span>
              <span className="text-[10px]">{item.label.split(' ').pop()}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────

function SpecChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-shrink-0 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
      <span className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</span>
      <p className="text-xs text-gray-700 font-medium whitespace-nowrap">{value}</p>
    </div>
  );
}

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {count !== undefined && count > 0 && (
        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{count}</span>
      )}
    </div>
  );
}

function EmptyState({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="text-center py-12">
      <span className="text-4xl">{icon}</span>
      <h3 className="text-base font-semibold text-gray-800 mt-3">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  );
}

function PartCard({ task, parts }: { task: string; parts: any[] }) {
  const [expanded, setExpanded] = useState(false);
  const name = TASK_NAMES[task] || task.replace(/_/g, ' ');

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md shadow-gray-200/60 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full p-3 text-left flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-800">{name}</h3>
          <p className="text-xs text-gray-500">{parts.length} part{parts.length !== 1 ? 's' : ''}</p>
        </div>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-gray-200 pt-2">
          {parts.map((p: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-gray-700 truncate">{p.brand || ''} {p.name || p.partNumber || ''}</p>
                {p.partNumber && <p className="text-[10px] text-gray-400 font-mono">{p.partNumber}</p>}
              </div>
              {p.partNumber && (
                <a href={`https://www.amazon.com/s?k=${encodeURIComponent((p.brand || '') + ' ' + p.partNumber)}&tag=${AFFILIATE_TAG}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-shrink-0 text-[10px] px-2 py-1 bg-blue-50 text-blue-400 border border-blue-200 rounded hover:bg-blue-100">
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
    <div className={`bg-white rounded-xl shadow-md shadow-gray-200/60 overflow-hidden ${recall.parkIt ? 'border-2 border-red-400' : 'border border-gray-200'}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full p-4 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900">{recall.component}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{recall.campaignNumber} · {recall.reportDate}</p>
          </div>
          {recall.parkIt && (
            <span className="flex-shrink-0 px-2 py-0.5 text-[10px] font-medium bg-red-50 text-red-600 border border-red-200 rounded-full">PARK IT</span>
          )}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-gray-200 pt-3">
          <p className="text-sm text-gray-500">{recall.summary}</p>
          {recall.consequence && <div><p className="text-xs font-medium text-gray-500 uppercase mb-1">Risk</p><p className="text-xs text-red-600">{recall.consequence}</p></div>}
          {recall.remedy && <div><p className="text-xs font-medium text-gray-500 uppercase mb-1">Remedy</p><p className="text-xs text-gray-400">{recall.remedy}</p></div>}
        </div>
      )}
    </div>
  );
}

// ─── Icons (inline SVGs) ───────────────────────────────────────────────

function IconParts() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-5.1m0 0L3.07 12.32c-.84.84-.84 2.2 0 3.04l5.58 5.58c.84.84 2.2.84 3.04 0l2.24-2.24m-5.58-8.4l7.12-7.12c.84-.84 2.2-.84 3.04 0l1.41 1.41c.84.84.84 2.2 0 3.04L13.36 15.17" /></svg>;
}
function IconRecalls() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>;
}
function IconGuides() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
}
function IconChat() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>;
}
