'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useVehicleContext } from '@/contexts/AppContext';
import { ChatMessage, ChatMessageLoading } from '@/components/chat/ChatMessage';
import { type ChatMessage as ChatMessageType, createChatMessage } from '@/schemas/chat.schema';
import { YMMTSelector } from '@/components/discovery/YMMTSelector';

interface VehicleTuple {
  year: number; make: string; model: string; trim: string;
}

interface KnownIssue {
  id: string; title: string; description: string; severity: string;
  category: string; reportCount: number;
  estimatedCost?: { low: number; high: number };
  typicalMileage?: { low: number; high: number };
  vehicleMatch: { years: number[]; trims?: string[]; engines?: string[]; make?: string; model?: string };
  symptoms?: string[]; solution?: string;
  communityRecommendations?: any[]; citations?: any[];
  dtcCodes?: string[]; source?: string; confidence?: string;
  lastReportedByOwners?: string; reviewedOn?: string;
  [key: string]: any;
}

interface RecallItem {
  campaignNumber: string; component: string; summary: string;
  consequence: string; remedy: string; reportDate: string; parkIt?: boolean;
}

interface CachedPart { task: string; parts: any[]; source: string; }

type SectionId = 'parts' | 'known-issues' | 'guides' | 'chat';

const NAV_ITEMS: { id: SectionId; label: string; icon: React.ReactNode }[] = [
  { id: 'chat', label: 'Chat', icon: <IconChat /> },
  { id: 'known-issues', label: 'Known Issues', icon: <IconIssues /> },
  { id: 'parts', label: 'Parts', icon: <IconParts /> },
  { id: 'guides', label: 'Guides', icon: <IconGuides /> },
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

const DEEP_SHADOW = 'rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px';

export function VehicleDashboard({
  vehicle, slug, issues, recalls, cachedParts, specsSummary,
}: {
  vehicle: VehicleTuple; slug: string;
  issues: KnownIssue[]; recalls: RecallItem[];
  cachedParts: CachedPart[]; specsSummary: Record<string, string>;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSection = (searchParams.get('tab') as SectionId) || 'chat';
  const [activeSection, setActiveSection] = useState<SectionId>(initialSection);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [styledTheme, setStyledTheme] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setVehicle } = useVehicleContext();

  const vehicleDisplay = vehicle.year + ' ' + vehicle.make + ' ' + vehicle.model + ' ' + vehicle.trim;
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
        signal: AbortSignal.timeout(65000),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Request failed');
      }
      const data = await res.json();
      setChatMessages(prev => [...prev, data.message]);
    } catch (err: any) {
      const errMsg = err?.name === 'TimeoutError'
        ? 'The request took too long. Please try again with a simpler question.'
        : 'Sorry, something went wrong. Please try again.';
      setChatMessages(prev => [...prev, createChatMessage('assistant', errMsg)]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleVehicleChange = () => {
    setVehicleModalOpen(false);
    // YMMTSelector sets vehicle in context - read it back
    // Small delay to let context update
    setTimeout(() => {
      const stored = localStorage.getItem('au7o_current_vehicle');
      if (stored) {
        try {
          const v = JSON.parse(stored);
          const s = v.year + '-' + v.make.toLowerCase().replace(/\s+/g, '-') + '-' + v.model.toLowerCase().replace(/\s+/g, '-') + '-' + v.trim.toLowerCase().replace(/\s+/g, '-');
          router.push('/vehicle/' + s);
        } catch { /* ignore */ }
      }
    }, 100);
  };

  // Suggestion chips for chat
  const suggestions: { label: string; msg: string }[] = [];
  if (issues.length > 0) {
    suggestions.push({ label: 'Common Problems', msg: 'What are the most common problems with my ' + vehicleDisplay + '? Include part recommendations with links.' });
  }
  if (recalls.length > 0) {
    suggestions.push({ label: recalls.length + ' Recall' + (recalls.length > 1 ? 's' : ''), msg: 'Tell me about the active recalls for my ' + vehicleDisplay });
  }
  suggestions.push(
    { label: 'Oil Change Guide', msg: 'Give me a step-by-step oil change guide for my ' + vehicleDisplay + '. Include the parts I need with links.' },
    { label: 'Brake Pads & Rotors', msg: 'What brake pads and rotors do I need for my ' + vehicleDisplay + '? Include part numbers and links.' },
    { label: 'Check Engine Light', msg: 'My check engine light is on. What are common causes for my ' + vehicleDisplay + '?' },
    { label: 'Find a Part', msg: 'I need to find a part for my ' + vehicleDisplay + '. What are you looking for?' },
  );

  return (
    <div className="h-screen flex bg-gray-100 text-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={'hidden sm:flex flex-col flex-shrink-0 bg-gradient-to-b from-white to-gray-100 transition-all duration-200 ' + (sidebarOpen ? 'w-56' : 'w-16')}>
        {/* Logo area */}
        <div className="flex-shrink-0 py-4 px-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-2 px-1">
              <Image src="/icons/icon-192.png" alt="Au7o" width={32} height={32} className="flex-shrink-0" style={styledTheme ? { filter: 'hue-rotate(240deg) saturate(1.5)' } : undefined} />
              <span className="text-lg font-bold text-gray-900 tracking-tight">
                Au<span style={{ color: styledTheme ? '#3C313D' : '#2563eb' }}>7</span>o
              </span>
              <button onClick={() => setSidebarOpen(false)} className="ml-auto p-1 rounded hover:bg-gray-100">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          ) : (
            <button onClick={() => setSidebarOpen(true)} className="w-full flex justify-center">
              <Image src="/icons/icon-192.png" alt="Au7o" width={32} height={32} style={styledTheme ? { filter: 'hue-rotate(240deg) saturate(1.5)' } : undefined} />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 space-y-1">
          <Link
            href="/"
            className={'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors ' + (sidebarOpen ? '' : 'justify-center')}
            title="Home"
          >
            <span className="flex-shrink-0 w-5 h-5"><IconHome /></span>
            {sidebarOpen && <span className="flex-1 text-left">Home</span>}
          </Link>
          {NAV_ITEMS.map(item => {
            const isActive = activeSection === item.id;
            const count = item.id === 'known-issues' ? issues.length + recalls.length
              : item.id === 'parts' ? standardParts.length
              : null;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ' +
                  (sidebarOpen ? '' : 'justify-center ') +
                  (isActive ? (styledTheme ? 'text-gray-900' : 'bg-blue-50 text-blue-700') : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800')}
                style={isActive && styledTheme ? { backgroundColor: '#EBEAEC' } : undefined}
                title={item.label}
              >
                <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {count !== null && count > 0 && (
                      <span className={'text-xs px-1.5 py-0.5 rounded-full ' + (isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400')}>{count}</span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Change Vehicle button */}
        <div className="flex-shrink-0 px-2 pb-4 space-y-1">
          <button
            onClick={() => setStyledTheme(!styledTheme)}
            className={'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors ' + (sidebarOpen ? '' : 'justify-center')}
            title={styledTheme ? 'Switch to Classic' : 'Switch to Styled'}
          >
            <svg className="flex-shrink-0 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
            </svg>
            {sidebarOpen && <span className="flex-1 text-left">{styledTheme ? 'Classic Theme' : 'Styled Theme'}</span>}
          </button>
          <button
            onClick={() => setVehicleModalOpen(true)}
            className={'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors ' + (sidebarOpen ? '' : 'justify-center')}
            title="Change Vehicle"
          >
            <svg className="flex-shrink-0 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            {sidebarOpen && <span className="flex-1 text-left">Change Vehicle</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 pt-10 sm:pt-12 pb-6 flex flex-col gap-8">
          {/* Vehicle Profile Card */}
          <div className={'rounded-lg flex-shrink-0 overflow-hidden ' + (styledTheme ? '' : 'bg-white p-5')} style={{ boxShadow: DEEP_SHADOW }}>
            {/* Header area */}
            <div className={styledTheme ? 'px-5 pt-5 pb-4' : ''} style={styledTheme ? { backgroundColor: '#3C313D' } : undefined}>
              <div className="flex items-center gap-4 mb-4">
                <div className={'flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden ' + (styledTheme ? '' : 'bg-gray-50')}>
                  <Image src={'/logos/' + logoSlug + '.png'} alt={vehicle.make} width={40} height={40} className="object-contain" style={styledTheme ? { filter: 'brightness(1.3)' } : undefined} />
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: styledTheme ? '#EBEAEC' : '#111827' }}>{vehicleDisplay}</h2>
                  {specsSummary.engine && <p className="text-sm" style={{ color: styledTheme ? '#9D9BA2' : '#6b7280' }}>{specsSummary.engine}</p>}
                </div>
              </div>
            </div>

            {/* Body area */}
            <div className={styledTheme ? 'px-5 pb-5 pt-4' : ''} style={styledTheme ? { backgroundColor: '#EBEAEC' } : undefined}>
            <div className="mb-4 text-sm leading-relaxed space-y-0.5" style={{ color: styledTheme ? '#3C313D' : '#6b7280' }}>
              {criticalCount > 0 && (
                <p className="text-red-600 font-medium">{criticalCount} critical/high severity issue{criticalCount > 1 ? 's' : ''} documented.</p>
              )}
              {specsSummary.oil && (
                <p>Oil: <span className="font-medium" style={{ color: styledTheme ? '#18141D' : '#1f2937' }}>{specsSummary.oil}</span>{specsSummary.oilFilter ? ' \u00B7 Filter: ' + specsSummary.oilFilter : ''}</p>
              )}
              {specsSummary.coolant && <p>Coolant: <span className="font-medium" style={{ color: styledTheme ? '#18141D' : '#1f2937' }}>{specsSummary.coolant}</span></p>}
              {specsSummary.transmission && <p>Transmission: <span className="font-medium" style={{ color: styledTheme ? '#18141D' : '#1f2937' }}>{specsSummary.transmission}</span></p>}
              {specsSummary.lug && <p>Lug: <span className="font-medium" style={{ color: styledTheme ? '#18141D' : '#1f2937' }}>{specsSummary.lug}</span></p>}
              {specsSummary.sparkPlugs && <p>Spark Plugs: <span className="font-medium" style={{ color: styledTheme ? '#18141D' : '#1f2937' }}>{specsSummary.sparkPlugs}</span></p>}
              {specsSummary.brakeFluid && <p>Brake Fluid: <span className="font-medium" style={{ color: styledTheme ? '#18141D' : '#1f2937' }}>{specsSummary.brakeFluid}</span></p>}
            </div>

            {/* Clickable stat badges - send context to chat */}
            <div className="flex gap-2 flex-wrap">
              {issues.length > 0 && (
                <button onClick={() => sendMessage('What are the most common problems with my ' + vehicleDisplay + '?')} className="text-xs px-2.5 py-1 bg-gray-100 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer">
                  {issues.length} known issue{issues.length !== 1 ? 's' : ''}
                </button>
              )}
              {recalls.length > 0 && (
                <button onClick={() => sendMessage('Tell me about the active recalls for my ' + vehicleDisplay)} className="text-xs px-2.5 py-1 bg-red-50 rounded-lg text-red-600 hover:bg-red-100 transition-colors cursor-pointer">
                  {recalls.length} recall{recalls.length !== 1 ? 's' : ''}
                </button>
              )}
              {standardParts.length > 0 && (
                <button onClick={() => handleNav('parts')} className="text-xs px-2.5 py-1 bg-gray-100 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer">
                  {standardParts.length} parts cached
                </button>
              )}
            </div>
            </div>
          </div>

          {/* Content Card */}
          <div className="bg-gradient-to-b from-white to-gray-100 rounded-lg p-5 flex-1 flex flex-col min-h-0" style={{ boxShadow: DEEP_SHADOW }}>
            {activeSection === 'parts' && (
              <div className="space-y-3">
                <SectionHeader title="Parts" count={standardParts.length} />
                {standardParts.length === 0 ? (
                  <EmptyState title="No Cached Parts" description="Parts haven't been loaded yet. Ask the AI about specific parts." />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {standardParts.map(cp => <PartCard key={cp.task} task={cp.task} parts={cp.parts} styled={styledTheme} />)}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'known-issues' && (
              <div className="space-y-6 overflow-y-auto">
                {/* Recalls section */}
                <div className="space-y-3">
                  <SectionHeader title="Recalls" count={recalls.length} />
                  {recalls.length === 0 ? (
                    <p className="text-sm text-gray-400">No active recalls for this vehicle.</p>
                  ) : (
                    recalls.map(r => (
                      <button key={r.campaignNumber} onClick={() => sendMessage('Tell me about the recall for ' + r.component + ' on my ' + vehicleDisplay + '. Campaign ' + r.campaignNumber)} className="w-full text-left">
                        <RecallCard recall={r} styled={styledTheme} />
                      </button>
                    ))
                  )}
                </div>

                {/* Known Issues section */}
                <div className="space-y-3">
                  <SectionHeader title="Known Issues" count={issues.length} />
                  {issues.length === 0 ? (
                    <p className="text-sm text-gray-400">No documented issues for this vehicle.</p>
                  ) : (
                    issues.map(issue => (
                      <IssueCardExpanded key={issue.id} issue={issue} styled={styledTheme} onAskAI={() => sendMessage('Tell me about the "' + issue.title + '" issue on my ' + vehicleDisplay + '. What parts do I need to fix it, what are owners using, and how much does it cost? Include part links.')} />
                    ))
                  )}
                </div>
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
                      className={'p-3 rounded-lg text-sm transition-colors text-left ' + (styledTheme ? 'text-gray-800 hover:opacity-90' : 'bg-gray-50 text-gray-600 hover:bg-gray-100')}
                      style={styledTheme ? { backgroundColor: '#c4bec4' } : undefined}
                    >
                      {task}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'chat' && (
              <div className="flex-1 flex flex-col space-y-1 min-h-0">
                {chatMessages.length === 0 && (
                  <div className="text-center py-6">
                    <Image src="/icons/icon-192.png" alt="Au7o" width={48} height={48} className="mx-auto mb-3" style={styledTheme ? { filter: 'hue-rotate(240deg) saturate(1.5)' } : undefined} />
                    <h2 className="text-base font-semibold text-gray-800">How can I help with your {vehicle.make} {vehicle.model}?</h2>
                    <p className="text-sm text-gray-400 mt-1">Parts, diagnostics, maintenance, costs</p>

                    {/* Suggestion chips */}
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(s.msg)}
                          className={'px-3 py-1.5 text-xs font-medium rounded-full transition-colors ' + (styledTheme ? 'hover:opacity-80' : 'text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-600')}
                          style={styledTheme ? { backgroundColor: '#3C313D', color: '#EBEAEC' } : undefined}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto min-h-0">
                  {chatMessages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
                  {chatLoading && <ChatMessageLoading />}
                  <div ref={chatEndRef} />
                </div>

                <div className="pt-3 mt-auto flex-shrink-0">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                      placeholder={'Ask about your ' + vehicle.make + ' ' + vehicle.model + '...'}
                      className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
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

      {/* Mobile Bottom Nav */}
      <nav className="flex-shrink-0 sm:hidden bg-white" style={{ boxShadow: '0 -1px 3px rgba(0,0,0,0.1)' }}>
        <div className="flex justify-around py-2">
          <Link href="/" className="flex flex-col items-center gap-0.5 px-2 py-1 text-gray-400">
            <span className="w-5 h-5"><IconHome /></span>
            <span className="text-[10px]">Home</span>
          </Link>
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

      {/* Vehicle Change Modal */}
      {vehicleModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 relative" style={{ boxShadow: DEEP_SHADOW }}>
            <button
              onClick={() => setVehicleModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Vehicle</h3>
            <YMMTSelector onComplete={handleVehicleChange} />
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components

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

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center py-12">
      <h3 className="text-base font-semibold text-gray-800 mt-3">{title}</h3>
      <p className="text-sm text-gray-400 mt-1">{description}</p>
    </div>
  );
}

function PartCard({ task, parts, styled = true }: { task: string; parts: any[]; styled?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const name = TASK_NAMES[task] || task.replace(/_/g, ' ');
  return (
    <div className={'rounded-xl overflow-hidden ' + (styled ? 'border' : 'bg-gray-50')} style={styled ? { borderColor: '#c4bec4', backgroundColor: '#EBEAEC' } : undefined}>
      <button onClick={() => setExpanded(!expanded)} className={'w-full px-4 py-3 text-left flex items-center justify-between ' + (styled ? '' : 'hover:bg-gray-100')} style={styled ? { backgroundColor: '#3C313D' } : undefined}>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: styled ? '#EBEAEC' : '#111' }}>{name}</h3>
          <p className="text-xs" style={{ color: styled ? '#9D9BA2' : '#666' }}>{parts.length} part{parts.length !== 1 ? 's' : ''}</p>
        </div>
        <svg className={'w-4 h-4 transition-transform ' + (expanded ? 'rotate-180' : '')} style={{ color: styled ? '#EBEAEC' : '#999' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-3 space-y-2">
          {parts.map((p: any, i: number) => (
            <div key={i} className="rounded-lg p-2.5 flex items-center justify-between gap-2" style={styled ? { backgroundColor: '#EBEAEC', border: '1px solid #c4bec4' } : { backgroundColor: 'white' }}>
              <div className="min-w-0">
                <p className="text-xs truncate" style={{ color: styled ? '#3C313D' : '#374151' }}>{p.brand || ''} {p.name || p.partNumber || ''}</p>
                {p.partNumber && <p className="text-[10px] font-mono" style={{ color: styled ? '#55535B' : '#9ca3af' }}>{p.partNumber}</p>}
                {p.spec && <p className="text-[10px]" style={{ color: styled ? '#55535B' : '#9ca3af' }}>{p.spec}</p>}
              </div>
              {(p.affiliateUrl || p.partNumber) && (
                <a href={p.affiliateUrl || ('https://www.amazon.com/s?k=' + encodeURIComponent((p.brand || '') + ' ' + p.partNumber) + '&tag=' + AFFILIATE_TAG)}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-shrink-0 text-[10px] font-medium px-2.5 py-1 rounded transition-colors hover:opacity-80"
                  style={styled ? { backgroundColor: '#3C313D', color: '#EBEAEC' } : { backgroundColor: '#eff6ff', color: '#2563eb' }}>
                  View on Amazon
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function IssueCard({ issue }: { issue: KnownIssue }) {
  const sevColor: Record<string, string> = {
    critical: 'bg-red-100 text-red-700',
    high: 'bg-red-50 text-red-600',
    medium: 'bg-amber-50 text-amber-700',
    low: 'bg-gray-100 text-gray-500',
  };
  return (
    <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900">{issue.title}</h3>
          {issue.estimatedCost && (
            <p className="text-xs text-gray-500 mt-0.5">{'$' + issue.estimatedCost.low + ' - $' + issue.estimatedCost.high}</p>
          )}
        </div>
        <span className={'flex-shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full ' + (sevColor[issue.severity] || sevColor.low)}>
          {issue.severity}
        </span>
      </div>
    </div>
  );
}

function IssueCardExpanded({ issue, styled = true, onAskAI }: { issue: KnownIssue; styled?: boolean; onAskAI: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const sevColor: Record<string, string> = {
    critical: 'bg-red-500 text-white',
    high: 'bg-red-400 text-white',
    medium: 'bg-amber-400 text-gray-900',
    low: 'bg-gray-400 text-white',
  };
  const recs = (issue.communityRecommendations as any[]) || [];
  const citations = (issue.citations as any[]) || [];
  // Theme-aware colors
  const labelStyle = styled ? { backgroundColor: '#3C313D', color: '#EBEAEC' } : { backgroundColor: '#f3f4f6', color: '#374151' };
  const dividerStyle = styled ? { borderTop: '1px solid #8a858c' } : { borderTop: '1px solid #e5e7eb' };
  const bodyColor = styled ? '#3C313D' : '#4b5563';
  const bulletColor = styled ? '#9D9BA2' : '#9ca3af';
  const makeModel = issue.vehicleMatch?.make && issue.vehicleMatch?.model
    ? issue.vehicleMatch.make + ' ' + issue.vehicleMatch.model
    : '';
  const searchQuery = encodeURIComponent(makeModel + ' ' + issue.title);

  return (
    <div className={'rounded-xl overflow-hidden ' + (styled ? 'border' : 'bg-gray-50')} style={styled ? { borderColor: '#c4bec4', backgroundColor: '#EBEAEC' } : undefined}>
      <button onClick={() => setExpanded(!expanded)} className={'w-full px-4 py-3 text-left ' + (styled ? '' : 'hover:bg-gray-100')} style={styled ? { backgroundColor: '#3C313D' } : undefined}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold" style={{ color: styled ? '#EBEAEC' : '#111' }}>{issue.title}</h3>
            {issue.estimatedCost && (
              <p className="text-xs mt-0.5" style={{ color: styled ? '#9D9BA2' : '#666' }}>Typical repair cost: {'$' + issue.estimatedCost.low.toLocaleString() + ' - $' + issue.estimatedCost.high.toLocaleString()}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={'px-2 py-0.5 text-[10px] font-medium rounded-full ' + (sevColor[issue.severity] || sevColor.low)}>
              {issue.severity}
            </span>
            <svg className={'w-4 h-4 transition-transform ' + (expanded ? 'rotate-180' : '')} style={{ color: styled ? '#EBEAEC' : '#999' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-0">
          {/* Description */}
          <div className="py-3">
            <p className="text-sm leading-relaxed" style={{ color: bodyColor }}>{issue.description}</p>
          </div>

          {/* DTC Codes */}
          {issue.dtcCodes && issue.dtcCodes.length > 0 && (
            <div className="py-3" style={dividerStyle}>
              <p className="text-xs font-semibold uppercase mb-1.5 px-2 py-1 rounded inline-block" style={labelStyle}>Common error codes that may appear</p>
              <div className="flex gap-1.5 flex-wrap mt-2">
                {issue.dtcCodes.map(code => (
                  <Link key={code} href={'/known-issues/dtc/' + code.toLowerCase()}
                    className="text-[10px] font-mono px-2.5 py-1 rounded-md hover:opacity-80 transition-opacity" style={{ backgroundColor: '#EBEAEC', color: '#3C313D' }}>
                    {code}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Symptoms */}
          {issue.symptoms && issue.symptoms.length > 0 && (
            <div className="py-3" style={dividerStyle}>
              <p className="text-xs font-semibold uppercase mb-1.5 px-2 py-1 rounded inline-block" style={labelStyle}>Common Symptoms</p>
              <ul className="space-y-1 mt-2">
                {issue.symptoms.map((s, i) => (
                  <li key={i} className="text-xs flex gap-2" style={{ color: bodyColor }}>
                    <span className="mt-0.5 flex-shrink-0" style={{ color: bodyColor }}>&bull;</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Solution / How to Fix */}
          {issue.solution && (
            <div className="py-3" style={dividerStyle}>
              <p className="text-xs font-semibold uppercase mb-1.5 px-2 py-1 rounded inline-block" style={labelStyle}>How to Fix</p>
              <p className="text-xs leading-relaxed mt-2" style={{ color: bodyColor }}>{issue.solution}</p>
            </div>
          )}

          {/* Community Recommendations */}
          {recs.length > 0 && (
            <div className="py-3" style={dividerStyle}>
              <p className="text-xs font-semibold uppercase mb-1.5 px-2 py-1 rounded inline-block" style={labelStyle}>
                What Owners Are Using
              </p>
              {issue.reportCount > 0 && <span className="text-[10px] ml-2" style={{ color: bodyColor }}>from {issue.reportCount}+ owners</span>}
              <div className="space-y-2 mt-2">
                {recs.map((r: any, i: number) => {
                  const content = r.content || r.text || r.name || (typeof r === 'string' ? r : '');
                  if (!content) return null;
                  const isPartRec = r.type === 'part' || r.partNumber;
                  const affiliateUrl = r.affiliateUrl || (r.partNumber
                    ? 'https://www.amazon.com/s?k=' + encodeURIComponent((r.partBrand || '') + ' ' + r.partNumber) + '&tag=' + AFFILIATE_TAG
                    : null);

                  return (
                    <div key={i} className="rounded-lg p-2.5" style={{ backgroundColor: '#EBEAEC', border: '1px solid #3C313D' }}>
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded" style={{
                          backgroundColor: isPartRec ? '#55535B' : '#55535B',
                          color: '#EBEAEC',
                        }}>
                          {isPartRec ? 'Upgrade' : 'Tip'}
                        </span>
                        <p className="text-xs flex-1" style={{ color: bodyColor }}>{content}</p>
                      </div>
                      {affiliateUrl && (
                        <a href={affiliateUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-block mt-1.5 ml-7 text-[10px] font-medium px-2.5 py-1 rounded transition-colors hover:opacity-80" style={{ backgroundColor: '#EBEAEC', color: '#3C313D' }}>
                          View on Amazon
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* References / Citations */}
          {citations.length > 0 && (
            <div className="py-3" style={dividerStyle}>
              <p className="text-xs font-semibold uppercase mb-1.5 px-2 py-1 rounded inline-block" style={labelStyle}>References</p>
              <ul className="space-y-1 mt-2">
                {citations.map((c: any, i: number) => (
                  <li key={i} className="text-xs">
                    {c.url ? (
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-70" style={{ color: '#18141D' }}>
                        {c.title || c.url}
                      </a>
                    ) : (
                      <span style={{ color: bodyColor }}>{c.title || (typeof c === 'string' ? c : '')}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Research Links */}
          <div className="py-3" style={dividerStyle}>
            <p className="text-xs font-semibold uppercase mb-1.5 px-2 py-1 rounded inline-block" style={labelStyle}>Research This Issue</p>
            <div className="flex gap-2 flex-wrap mt-2">
              {[
                { label: 'Google', url: 'https://www.google.com/search?q=' + searchQuery },
                { label: 'Reddit', url: 'https://www.reddit.com/search/?q=' + searchQuery },
                { label: 'YouTube', url: 'https://www.youtube.com/results?search_query=' + searchQuery },
                { label: 'NHTSA', url: 'https://www.nhtsa.gov/vehicle-safety/search-results?keyword=' + searchQuery },
              ].map(link => (
                <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="text-[10px] px-2.5 py-1.5 rounded-md transition-colors hover:opacity-80"
                  style={labelStyle}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] pt-3" style={{ borderTop: styled ? '1px solid #8a858c' : '1px solid #e5e7eb', color: styled ? '#3C313D' : '#6b7280' }}>
            {issue.source && (
              <span className="px-1.5 py-0.5 rounded" style={{
                backgroundColor: styled ? '#3C313D' : '#f3f4f6',
                color: styled ? '#EBEAEC' : '#374151',
              }}>
                {issue.source === 'nhtsa-verified' ? 'NHTSA Verified' : issue.source === 'manual' ? 'Manually Verified' : 'Community Reported'}
              </span>
            )}
            {issue.confidence && <span>{issue.confidence} confidence</span>}
            {issue.reportCount > 0 && <span>{issue.reportCount} reports</span>}
            {issue.lastReportedByOwners && <span>Last reported {issue.lastReportedByOwners}</span>}
            {issue.reviewedOn && <span>Reviewed {issue.reviewedOn}</span>}
          </div>

          {/* Ask AI button */}
          <div className="pt-3">
            <button
              onClick={onAskAI}
              className="text-xs font-medium px-3 py-2 rounded-lg transition-colors hover:opacity-80"
              style={{ backgroundColor: '#3C313D', color: '#EBEAEC' }}
            >
              Ask AI about this issue &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function RecallCard({ recall, styled = true }: { recall: RecallItem; styled?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={'rounded-xl overflow-hidden ' + (recall.parkIt ? 'ring-2 ring-red-400' : '')} style={styled ? { backgroundColor: '#c4bec4' } : { backgroundColor: '#f9fafb' }}>
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
          <a
            href={'https://www.nhtsa.gov/recalls?nhtsaId=' + recall.campaignNumber}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors mt-1"
          >
            View on NHTSA.gov &rarr;
          </a>
        </div>
      )}
    </div>
  );
}

// Icons
function IconIssues() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>;
}
function IconHome() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>;
}
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
