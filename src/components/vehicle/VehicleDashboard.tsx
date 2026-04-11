'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useVehicleContext } from '@/contexts/AppContext';
import { ChatMessage, ChatMessageLoading } from '@/components/chat/ChatMessage';
import { type ChatMessage as ChatMessageType, createChatMessage } from '@/schemas/chat.schema';

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

type SectionId = 'parts' | 'recalls' | 'guides' | 'chat';

const NAV_ITEMS: { id: SectionId; label: string; icon: React.ReactNode }[] = [
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setVehicle } = useVehicleContext();

  const vehicleDisplay = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`;
  const standardParts = cachedParts.filter(p => !p.task.startsWith('freetext:'));
  const criticalCount = issues.filter(i => i.severity === 'high' || i.severity === 'critical').length;
  const logoSlug = vehicle.make.toLowerCase().replace(/\s+/g, '-');

  useEffect(() => { setVehicle(vehicle); }, [vehicle, setVehicle]);

  useEffect(() => {
    if (activeSection === 'chat') chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading, activeSection]);

  const handleNav = (id: SectionId) => {
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
    <div className="h-screen flex flex-col bg-gray-100 text-gray-900 overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 h-14 flex items-center justify-between px-4 sm:px-6 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors hidden sm:block"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <Link href="/" className="text-lg font-bold text-gray-900 tracking-tight">
            Au<span className="text-blue-600">7</span>o
          </Link>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`hidden sm:flex flex-col flex-shrink-0 bg-white shadow-sm transition-all duration-200 ${sidebarOpen ? 'w-52' : 'w-16'}`}>
          <nav className="flex-1 py-3 px-2 space-y-1">
            {NAV_ITEMS.map(item => {
              const isActive = activeSection === item.id;
              const count = item.id === 'recalls' ? recalls.length
                : item.id === 'parts' ? standardParts.length
                : null;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    sidebarOpen ? '' : 'justify-center'
                  } ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                  title={item.label}
                >
                  <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {count !== null && count > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>{count}</span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Vehicle Profile Card */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                  <Image
                    src={'/logos/' + logoSlug + '.png'}
                    alt={vehicle.make}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{vehicleDisplay}</h2>
                  {specsSummary.engine && <p className="text-sm text-gray-500">{specsSummary.engine}</p>}
                </div>
              </div>

              <div className="mb-4 text-sm text-gray-500 leading-relaxed space-y-0.5">
                {criticalCount > 0 && (
                  <p className="text-red-600 font-medium">{criticalCount} critical/high severity issue{criticalCount > 1 ? 's' : ''} documented.</p>
                )}
                {specsSummary.oil && (
                  <p>Oil: <span className="text-gray-800 font-medium">{specsSummary.oil}</span>{specsSummary.oilFilter ? ' \u00B7 Filter: ' + specsSummary.oilFilter : ''}</p>
                )}
                {specsSummary.coolant && <p>Coolant: <span className="text-gray-800 font-medium">{specsSummary.coolant}</span></p>}
                {specsSummary.transmission && <p>Transmission: <span className="text-gray-800 font-medium">{specsSummary.transmission}</span></p>}
                {specsSummary.lug && <p>Lug: <span className="text-gray-800 font-medium">{specsSummary.lug}</span></p>}
                {specsSummary.sparkPlugs && <p>Spark Plugs: <span className="text-gray-800 font-medium">{specsSummary.sparkPlugs}</span></p>}
                {specsSummary.brakeFluid && <p>Brake Fluid: <span className="text-gray-800 font-medium">{specsSummary.brakeFluid}</span></p>}
              </div>

              <div className="flex gap-2 flex-wrap">
                {issues.length > 0 && <Badge text={issues.length + ' known issue' + (issues.length !== 1 ? 's' : '')} />}
                {recalls.length > 0 && <Badge text={recalls.length + ' recall' + (recalls.length !== 1 ? 's' : '')} color="red" />}
                {standardParts.length > 0 && <Badge text={standardParts.length + ' parts cached'} />}
              </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              {activeSection === 'parts' && (
                <div className="space-y-3">
                  <SectionHeader title="Parts" count={standardParts.length} />
                  {standardParts.length === 0 ? (
                    <EmptyState icon="&#128295;" title="No Cached Parts" description="Parts haven't been loaded yet. Ask the AI about specific parts." />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {standardParts.map(cp => <PartCard key={cp.task} task={cp.task} parts={cp.parts} />)}
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'recalls' && (
                <div className="space-y-3">
                  <SectionHeader title="Recalls" count={recalls.length} />
                  {recalls.length === 0 ? (
                    <EmptyState icon="&#9989;" title="No Active Recalls" description="No open recalls for this vehicle." />
                  ) : (
                    recalls.map(r => <RecallCard key={r.campaignNumber} recall={r} />)
                  )}
                </div>
              )}

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
                        onClick={() => sendMessage('Give me a step-by-step ' + task.toLowerCase() + ' guide for my ' + vehicleDisplay)}
                        className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors text-left"
                      >
                        {task}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'chat' && (
                <div className="space-y-1">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                      </div>
                      <h2 className="text-base font-semibold text-gray-800">Ask me anything</h2>
                      <p className="text-sm text-gray-400 mt-1">Parts, diagnostics, maintenance, costs</p>
                    </div>
                  )}
                  {chatMessages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
                  {chatLoading && <ChatMessageLoading />}
                  <div ref={chatEndRef} />
                  <div className="pt-3">
                    <div className="flex gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                        placeholder={'Ask about your ' + vehicle.make + ' ' + vehicle.model + '...'}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="flex-shrink-0 sm:hidden bg-white shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around py-2">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={'flex flex-col items-center gap-0.5 px-2 py-1 ' + (activeSection === item.id ? 'text-blue-600' : 'text-gray-400')}
            >
              <span className="w-5 h-5">{item.icon}</span>
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// Sub-components

function Badge({ text, color = 'gray' }: { text: string; color?: string }) {
  const cls = color === 'red' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600';
  return <span className={'text-xs px-2.5 py-1 rounded-lg ' + cls}>{text}</span>;
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
      <span className="text-4xl" dangerouslySetInnerHTML={{ __html: icon }} />
      <h3 className="text-base font-semibold text-gray-800 mt-3">{title}</h3>
      <p className="text-sm text-gray-400 mt-1">{description}</p>
    </div>
  );
}

function PartCard({ task, parts }: { task: string; parts: any[] }) {
  const [expanded, setExpanded] = useState(false);
  const name = TASK_NAMES[task] || task.replace(/_/g, ' ');
  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full p-3 text-left flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-800">{name}</h3>
          <p className="text-xs text-gray-500">{parts.length} part{parts.length !== 1 ? 's' : ''}</p>
        </div>
        <svg className={'w-4 h-4 text-gray-400 transition-transform ' + (expanded ? 'rotate-180' : '')} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          {parts.map((p: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-gray-700 truncate">{p.brand || ''} {p.name || p.partNumber || ''}</p>
                {p.partNumber && <p className="text-[10px] text-gray-400 font-mono">{p.partNumber}</p>}
              </div>
              {p.partNumber && (
                <a href={'https://www.amazon.com/s?k=' + encodeURIComponent((p.brand || '') + ' ' + p.partNumber) + '&tag=' + AFFILIATE_TAG}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-shrink-0 text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">
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
    <div className={'bg-gray-50 rounded-xl overflow-hidden ' + (recall.parkIt ? 'ring-2 ring-red-400' : '')}>
      <button onClick={() => setExpanded(!expanded)} className="w-full p-4 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900">{recall.component}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{recall.campaignNumber}</p>
          </div>
          {recall.parkIt && (
            <span className="flex-shrink-0 px-2 py-0.5 text-[10px] font-medium bg-red-100 text-red-600 rounded-full">PARK IT</span>
          )}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          <p className="text-sm text-gray-500">{recall.summary}</p>
          {recall.consequence && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Risk</p>
              <p className="text-xs text-red-600">{recall.consequence}</p>
            </div>
          )}
          {recall.remedy && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Remedy</p>
              <p className="text-xs text-gray-500">{recall.remedy}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Icons
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
