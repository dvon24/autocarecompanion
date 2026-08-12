'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useVehicleContext } from '@/contexts/AppContext';
import { ChatMessage, ChatMessageLoading } from '@/components/chat/ChatMessage';
import { type ChatMessage as ChatMessageType, createChatMessage } from '@/schemas/chat.schema';
import { YMMTSelector } from '@/components/discovery/YMMTSelector';
import { MakeLogo } from '@/components/shared/MakeLogo';
import type { KnownIssue as CatalogKnownIssue } from '@/schemas/knownIssue.schema';
import { getKnownIssueCommerce, hasKnownIssueCommerce, knownIssueAffiliateUrl } from '@/lib/known-issue-commerce';
import { trackAffiliateClick } from '@/lib/analytics';
import { externalHttpUrl } from '@/lib/external-http-url';
import { describeFitment, fitmentResolutionPrompt, isNarrowerThanArticle, resolvePartsForVehicle } from '@/lib/known-issue-part-fitment';
import { resolveReviewedVehicleContext } from '@/lib/reviewed-vehicle-context';
import { IssueDiagnosticTools, issueHasDiagnosticToolInput } from '@/components/known-issues/IssueDiagnosticTools';

type IssueRecommendation = NonNullable<CatalogKnownIssue['communityRecommendations']>[number];
type IssueFixPart = NonNullable<CatalogKnownIssue['fixParts']>[number];
type IssueCitation = CatalogKnownIssue['citations'][number] | string;

interface VehicleTuple {
  year: number;
  make: string;
  model: string;
  trim: string;
  engine?: string;
  drivetrain?: string;
  transmission?: string;
}
interface KnownIssue {
  id: string; title: string; description: string; severity: string;
  category: string; reportCount: number;
  estimatedCost?: { low: number; high: number };
  typicalMileage?: { low: number; high: number };
  vehicleMatch: { years: number[]; trims?: string[]; engines?: string[]; make?: string; model?: string };
  symptoms?: string[]; solution?: string;
  communityRecommendations?: IssueRecommendation[]; fixParts?: IssueFixPart[]; citations?: IssueCitation[];
  dtcCodes?: string[]; source?: string; confidence?: string;
  lastReportedByOwners?: string; reviewedOn?: string;
}
interface RecallItem {
  campaignNumber: string; component: string; summary: string;
  consequence: string; remedy: string; reportDate: string; parkIt?: boolean;
}
interface PartRecord {
  brand?: string;
  name?: string;
  partNumber?: string;
  spec?: string;
  affiliateUrl?: string;
  searchQuery?: string;
}
interface CachedPart { task: string; parts: PartRecord[]; source: string; }

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
  vehicle, issues, recalls, cachedParts, specsSummary,
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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [specsExpanded, setSpecsExpanded] = useState(false);
  const [styledTheme, setStyledTheme] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setVehicle } = useVehicleContext();

  const vehicleDisplay = vehicle.year + ' ' + vehicle.make + ' ' + vehicle.model + ' ' + vehicle.trim;
  const vehicleShort = vehicle.year + ' ' + vehicle.model + ' ' + vehicle.trim;
  const standardParts = cachedParts.filter(p => !p.task.startsWith('freetext:'));
  const criticalCount = issues.filter(i => i.severity === 'high' || i.severity === 'critical').length;

  // AppContext persists only the canonical YMMT tuple. Runtime fitment details
  // remain on this dashboard prop and are not implied to be durable garage or
  // Prisma fields.
  useEffect(() => {
    setVehicle({
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      trim: vehicle.trim,
    });
  }, [vehicle.year, vehicle.make, vehicle.model, vehicle.trim, setVehicle]);
  useEffect(() => {
    if (activeSection === 'chat') chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading, activeSection]);

  const handleNav = (id: SectionId) => {
    setActiveSection(id);
    setMobileDrawerOpen(false);
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
    setMobileDrawerOpen(false);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          conversationHistory: chatMessages.map(m => ({ id: m.id, role: m.role, content: m.content, timestamp: m.timestamp })),
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
    } catch (err: unknown) {
      const errMsg = err instanceof Error && err.name === 'TimeoutError'
        ? 'The request took too long. Please try again with a simpler question.'
        : 'Sorry, something went wrong. Please try again.';
      setChatMessages(prev => [...prev, createChatMessage('assistant', errMsg)]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleVehicleChange = () => {
    setVehicleModalOpen(false);
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

  // Shared content renderer
  const renderContent = () => (
    <>
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
          <div className="space-y-3">
            <SectionHeader title="Known Issues" count={issues.length} />
            {issues.length === 0 ? (
              <p className="text-sm text-gray-400">No documented issues for this vehicle.</p>
            ) : (
              issues.map(issue => (
                <IssueCardExpanded
                  key={issue.id}
                  issue={issue}
                  vehicle={vehicle}
                  styled={styledTheme}
                  onAskAI={() => sendMessage('Tell me about the "' + issue.title + '" issue on my ' + vehicleDisplay + '. What parts do I need to fix it, what are owners using, and how much does it cost? Include part links.')}
                />
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
              <button key={task} onClick={() => sendMessage('Give me a step-by-step ' + task.toLowerCase() + ' guide for my ' + vehicleDisplay)}
                className={'p-3 rounded-lg text-sm transition-colors text-left ' + (styledTheme ? 'text-gray-800 hover:opacity-90' : 'bg-gray-50 text-gray-600 hover:bg-gray-100')}
                style={styledTheme ? { backgroundColor: '#c4bec4' } : undefined}>
                {task}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="flex flex-col sm:flex-row bg-gray-100 text-gray-900 overflow-hidden" style={{ height: '100dvh' }}>

      {/* ===== MOBILE LAYOUT ===== */}
      <div className="flex flex-col flex-1 sm:hidden overflow-hidden bg-white">
        {/* Mobile Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-3 pt-3 pb-2 bg-white z-30" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <button onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)} className="p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <button onClick={() => setSpecsExpanded(!specsExpanded)} className="flex items-center gap-2 flex-1 mx-3 min-w-0">
            <MakeLogo make={vehicle.make} size={24} />
            <span className="text-sm font-semibold text-gray-900 truncate">{vehicleShort}</span>
            <svg className={'w-3 h-3 text-gray-400 flex-shrink-0 transition-transform ' + (specsExpanded ? 'rotate-180' : '')} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button onClick={() => setVehicleModalOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
          </button>
        </header>

        {/* Mobile: Expandable specs overlay */}
        {specsExpanded && (
          <div className="flex-shrink-0 bg-white px-4 py-3 shadow-md z-10">
            <p className="text-xs text-gray-500 font-medium mb-1">{specsSummary.engine}</p>
            <div className="text-xs text-gray-500 space-y-0.5">
              {criticalCount > 0 && <p className="text-[#3C313D] font-medium">{criticalCount} critical issue{criticalCount > 1 ? 's' : ''}</p>}
              {specsSummary.oil && <p>Oil: <span className="text-gray-800 font-medium">{specsSummary.oil}</span></p>}
              {specsSummary.coolant && <p>Coolant: <span className="text-gray-800 font-medium">{specsSummary.coolant}</span></p>}
              {specsSummary.transmission && <p>Trans: <span className="text-gray-800 font-medium">{specsSummary.transmission}</span></p>}
              {specsSummary.lug && <p>Lug: <span className="text-gray-800 font-medium">{specsSummary.lug}</span></p>}
            </div>
            <div className="flex gap-2 mt-2">
              {issues.length > 0 && <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded text-gray-500">{issues.length} issues</span>}
              {recalls.length > 0 && <span className="text-[10px] px-2 py-0.5 border border-[#D8D1C3] bg-[#F7F4EC] rounded text-[#3C313D]">{recalls.length} recall{recalls.length > 1 ? 's' : ''}</span>}
            </div>
          </div>
        )}

        {/* Mobile: Slide-over drawer (ChatGPT style) */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-30 flex" onClick={() => setMobileDrawerOpen(false)}>
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative w-72 bg-white h-full shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-4 flex items-center gap-2">
                <Image src="/icons/icon-192.png" alt="Au7o" width={28} height={28} />
                <span className="text-lg font-bold text-gray-900">Au<span className="text-blue-600">7</span>o</span>
              </div>
              <nav className="flex-1 px-3 space-y-1">
                <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50">
                  <span className="w-5 h-5"><IconHome /></span><span>Home</span>
                </Link>
                {NAV_ITEMS.map(item => (
                  <button key={item.id} onClick={() => handleNav(item.id)}
                    className={'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ' + (activeSection === item.id ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50')}>
                    <span className="w-5 h-5">{item.icon}</span><span>{item.label}</span>
                  </button>
                ))}
              </nav>
              <div className="p-3 space-y-1">
                <button onClick={() => { setStyledTheme(!styledTheme); setMobileDrawerOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" /></svg>
                  <span>{styledTheme ? 'Classic Theme' : 'Styled Theme'}</span>
                </button>
                <button onClick={() => { setVehicleModalOpen(true); setMobileDrawerOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
                  <span>Change Vehicle</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile: Main content area */}
        <main className="flex-1 overflow-y-auto px-4 pt-4 pb-28 bg-gray-100" id="mobile-chat-container">
          {activeSection === 'chat' ? (
            <>
              {chatMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] px-2">
                  <h2 className="text-xl font-semibold text-gray-800 text-center">How can I help with your {vehicle.model}?</h2>
                  <p className="text-sm text-gray-400 mt-2 text-center">Parts, diagnostics, maintenance, costs</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-6">
                    {suggestions.slice(0, 4).map((s, i) => (
                      <button key={i} onClick={() => sendMessage(s.msg)}
                        className="px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 shadow-sm">
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chatMessages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
              {chatLoading && <ChatMessageLoading />}
              <div ref={chatEndRef} />
            </>
          ) : (
            <div>{renderContent()}</div>
          )}
        </main>

        {/* Mobile: Fixed floating input with gradient fade (Perplexity style) */}
        {activeSection === 'chat' && (
          <div className="fixed bottom-0 left-0 w-full z-20 p-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-100 via-gray-100/90 to-transparent pointer-events-none" />
            <div className="relative max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-lg p-2 flex items-end gap-2">
              <input ref={inputRef} type="text" value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                placeholder={'Ask about your ' + vehicle.model + '...'}
                className="flex-1 bg-transparent border-none px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0" />
              <button onClick={() => sendMessage()} disabled={!chatInput.trim() || chatLoading}
                className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-40 transition-all active:scale-95">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      {/* Desktop Sidebar */}
      <aside className="hidden sm:flex flex-col flex-shrink-0 bg-gradient-to-b from-white to-gray-100 transition-all duration-200" style={{ width: sidebarOpen ? '14rem' : '4rem' }}>
        <div className="flex-shrink-0 py-4 px-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-2 px-1">
              <Image src="/icons/icon-192.png" alt="Au7o" width={32} height={32} className="flex-shrink-0" style={styledTheme ? { filter: 'hue-rotate(240deg) saturate(1.5)' } : undefined} />
              <span className="text-lg font-bold text-gray-900 tracking-tight">Au<span style={{ color: styledTheme ? '#3C313D' : '#2563eb' }}>7</span>o</span>
              <button onClick={() => setSidebarOpen(false)} className="ml-auto p-1 rounded hover:bg-gray-100">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
            </div>
          ) : (
            <button onClick={() => setSidebarOpen(true)} className="w-full flex justify-center">
              <Image src="/icons/icon-192.png" alt="Au7o" width={32} height={32} style={styledTheme ? { filter: 'hue-rotate(240deg) saturate(1.5)' } : undefined} />
            </button>
          )}
        </div>
        <nav className="flex-1 px-2 space-y-1">
          <Link href="/" className={'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors ' + (sidebarOpen ? '' : 'justify-center')} title="Home">
            <span className="flex-shrink-0 w-5 h-5"><IconHome /></span>
            {sidebarOpen && <span className="flex-1 text-left">Home</span>}
          </Link>
          {NAV_ITEMS.map(item => {
            const isActive = activeSection === item.id;
            const count = item.id === 'known-issues' ? issues.length + recalls.length : item.id === 'parts' ? standardParts.length : null;
            return (
              <button key={item.id} onClick={() => handleNav(item.id)}
                className={'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ' + (sidebarOpen ? '' : 'justify-center ') + (isActive ? (styledTheme ? 'text-gray-900' : 'bg-blue-50 text-blue-700') : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800')}
                style={isActive && styledTheme ? { backgroundColor: '#EBEAEC' } : undefined} title={item.label}>
                <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>
                {sidebarOpen && (<><span className="flex-1 text-left">{item.label}</span>{count !== null && count > 0 && <span className={'text-xs px-1.5 py-0.5 rounded-full ' + (isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400')}>{count}</span>}</>)}
              </button>
            );
          })}
        </nav>
        <div className="flex-shrink-0 px-2 pb-4 space-y-1">
          <button onClick={() => setStyledTheme(!styledTheme)} className={'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors ' + (sidebarOpen ? '' : 'justify-center')} title={styledTheme ? 'Classic' : 'Styled'}>
            <svg className="flex-shrink-0 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" /></svg>
            {sidebarOpen && <span className="flex-1 text-left">{styledTheme ? 'Classic Theme' : 'Styled Theme'}</span>}
          </button>
          <button onClick={() => setVehicleModalOpen(true)} className={'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors ' + (sidebarOpen ? '' : 'justify-center')} title="Change Vehicle">
            <svg className="flex-shrink-0 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
            {sidebarOpen && <span className="flex-1 text-left">Change Vehicle</span>}
          </button>
        </div>
      </aside>

      {/* Desktop Main */}
      <main className="hidden sm:flex flex-1 flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 pt-10 sm:pt-12 pb-6 flex flex-col gap-8">
          {/* Vehicle Profile Card */}
          <div className="bg-white rounded-lg p-5 flex-shrink-0" style={{ boxShadow: DEEP_SHADOW }}>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                <MakeLogo make={vehicle.make} size={40} />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900">{vehicleDisplay}</h2>
                {specsSummary.engine && <p className="text-sm text-gray-500">{specsSummary.engine}</p>}
              </div>
              <button onClick={() => setSpecsExpanded(!specsExpanded)} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                <svg className={'w-3 h-3 transition-transform ' + (specsExpanded ? 'rotate-180' : '')} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                {specsExpanded ? 'Hide' : 'Details'}
              </button>
            </div>
            {specsExpanded && (
              <div className="mb-4 text-sm text-gray-500 leading-relaxed space-y-0.5 mt-3">
                {criticalCount > 0 && <p className="text-[#3C313D] font-medium">{criticalCount} critical/high severity issue{criticalCount > 1 ? 's' : ''} documented.</p>}
                {specsSummary.oil && <p>Oil: <span className="text-gray-800 font-medium">{specsSummary.oil}</span>{specsSummary.oilFilter ? ' \u00B7 Filter: ' + specsSummary.oilFilter : ''}</p>}
                {specsSummary.coolant && <p>Coolant: <span className="text-gray-800 font-medium">{specsSummary.coolant}</span></p>}
                {specsSummary.transmission && <p>Transmission: <span className="text-gray-800 font-medium">{specsSummary.transmission}</span></p>}
                {specsSummary.lug && <p>Lug: <span className="text-gray-800 font-medium">{specsSummary.lug}</span></p>}
                {specsSummary.sparkPlugs && <p>Spark Plugs: <span className="text-gray-800 font-medium">{specsSummary.sparkPlugs}</span></p>}
                {specsSummary.brakeFluid && <p>Brake Fluid: <span className="text-gray-800 font-medium">{specsSummary.brakeFluid}</span></p>}
              </div>
            )}
            <div className="flex gap-2 flex-wrap mt-2">
              {issues.length > 0 && <button onClick={() => sendMessage('What are the most common problems with my ' + vehicleDisplay + '?')} className="text-xs px-2.5 py-1 bg-gray-100 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer">{issues.length} known issue{issues.length !== 1 ? 's' : ''}</button>}
              {recalls.length > 0 && <button onClick={() => sendMessage('Tell me about the active recalls for my ' + vehicleDisplay)} className="text-xs px-2.5 py-1 border border-[#D8D1C3] bg-[#F7F4EC] rounded-lg text-[#3C313D] hover:bg-[#EFEDE6] transition-colors cursor-pointer">{recalls.length} recall{recalls.length !== 1 ? 's' : ''}</button>}
              {standardParts.length > 0 && <button onClick={() => handleNav('parts')} className="text-xs px-2.5 py-1 bg-gray-100 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer">{standardParts.length} parts cached</button>}
            </div>
          </div>

          {/* Desktop Content Card */}
          <div className="bg-gradient-to-b from-white to-gray-100 rounded-lg p-5 flex-1 flex flex-col min-h-0" style={{ boxShadow: DEEP_SHADOW }}>
            {renderContent()}
            {activeSection === 'chat' && (
              <div className={'flex-1 flex flex-col min-h-0 ' + (chatMessages.length === 0 ? 'justify-center' : 'justify-end')}>
                {chatMessages.length === 0 ? (
                  <div className="text-center px-4">
                    <Image src="/icons/icon-192.png" alt="Au7o" width={48} height={48} className="mx-auto mb-3" style={styledTheme ? { filter: 'hue-rotate(240deg) saturate(1.5)' } : undefined} />
                    <h2 className="text-lg font-semibold text-gray-800">How can I help with your {vehicle.make} {vehicle.model}?</h2>
                    <p className="text-sm text-gray-400 mt-1">Parts, diagnostics, maintenance, costs</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4 mb-8">
                      {suggestions.map((s, i) => (
                        <button key={i} onClick={() => sendMessage(s.msg)}
                          className={'px-3 py-1.5 text-xs font-medium rounded-full transition-colors ' + (styledTheme ? 'hover:opacity-80' : 'text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-600')}
                          style={styledTheme ? { backgroundColor: '#3C313D', color: '#EBEAEC' } : undefined}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                    <div className="max-w-xl mx-auto">
                      <div className="flex gap-2">
                        <input ref={inputRef} type="text" value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                          placeholder={'Ask about your ' + vehicle.make + ' ' + vehicle.model + '...'}
                          className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm" />
                        <button onClick={() => sendMessage()} disabled={!chatInput.trim() || chatLoading}
                          className="px-4 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 disabled:opacity-40 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto min-h-0 px-1">
                      {chatMessages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
                      {chatLoading && <ChatMessageLoading />}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="pt-3 flex-shrink-0">
                      <div className="flex gap-2">
                        <input type="text" value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                          placeholder={'Ask about your ' + vehicle.make + ' ' + vehicle.model + '...'}
                          className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm" />
                        <button onClick={() => sendMessage()} disabled={!chatInput.trim() || chatLoading}
                          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-40 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Vehicle Change Modal */}
      {vehicleModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 relative" style={{ boxShadow: DEEP_SHADOW }}>
            <button onClick={() => setVehicleModalOpen(false)} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Vehicle</h3>
            <YMMTSelector onComplete={handleVehicleChange} />
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components (unchanged from before - IssueCardExpanded, RecallCard, PartCard, etc.)
function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (<div className="flex items-center gap-2 mb-1"><h2 className="text-lg font-semibold text-gray-900">{title}</h2>{count !== undefined && count > 0 && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{count}</span>}</div>);
}
function EmptyState({ title, description }: { title: string; description: string }) {
  return (<div className="text-center py-12"><h3 className="text-base font-semibold text-gray-800 mt-3">{title}</h3><p className="text-sm text-gray-400 mt-1">{description}</p></div>);
}

function IssueCardExpanded({ issue, vehicle, styled = true, onAskAI }: { issue: KnownIssue; vehicle: VehicleTuple; styled?: boolean; onAskAI: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const sevColor = 'border border-[#C9C0B1] bg-[#EFEDE6] text-[#0B1220]';
  const { fixParts: gatedParts, ownerGuidance } = getKnownIssueCommerce(issue);
  const fitmentVehicle = resolveReviewedVehicleContext(vehicle);
  const resolved = resolvePartsForVehicle(gatedParts, fitmentVehicle, issue.vehicleMatch);
  const fitmentPrompt = fitmentResolutionPrompt(resolved);
  const { fixParts } = getKnownIssueCommerce({
    fixParts: resolved.parts,
    communityRecommendations: [],
  });
  const citations = issue.citations || [];
  const makeModel = issue.vehicleMatch?.make && issue.vehicleMatch?.model ? issue.vehicleMatch.make + ' ' + issue.vehicleMatch.model : '';
  const searchQuery = encodeURIComponent(makeModel + ' ' + issue.title);
  const labelStyle = styled ? { backgroundColor: '#EFEDE6', color: '#0B1220', border: '1px solid #D8D1C3' } : { backgroundColor: '#f3f4f6', color: '#374151' };
  const dividerStyle = styled ? { borderTop: '1px solid #D8D1C3' } : { borderTop: '1px solid #e5e7eb' };
  const bodyColor = styled ? '#475569' : '#4b5563';

  return (
    <div className={'rounded-xl overflow-hidden ' + (styled ? 'border' : 'bg-gray-50')} style={styled ? { borderColor: '#D8D1C3', backgroundColor: '#FBFAF6' } : undefined}>
      <button onClick={() => setExpanded(!expanded)} className={'w-full px-4 py-3 text-left ' + (styled ? '' : 'hover:bg-gray-100')} style={styled ? { backgroundColor: '#3C313D' } : undefined}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold" style={{ color: styled ? '#EBEAEC' : '#111' }}>{issue.title}</h3>
            {issue.estimatedCost && <p className="text-xs mt-0.5" style={{ color: styled ? '#D8D1C3' : '#666' }}>Typical repair cost: {'$' + issue.estimatedCost.low.toLocaleString() + ' - $' + issue.estimatedCost.high.toLocaleString()}</p>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={'px-2 py-0.5 text-[10px] font-medium rounded-full ' + sevColor}>{issue.severity}</span>
            <svg className={'w-4 h-4 transition-transform ' + (expanded ? 'rotate-180' : '')} style={{ color: styled ? '#EBEAEC' : '#999' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-0">
          <div className="py-3"><p className="text-sm leading-relaxed" style={{ color: bodyColor }}>{issue.description}</p></div>
          {issue.dtcCodes && issue.dtcCodes.length > 0 && (<div className="py-3" style={dividerStyle}><p className="text-xs font-semibold uppercase mb-1.5 px-2 py-1 rounded inline-block" style={labelStyle}>Common error codes that may appear</p><div className="flex gap-1.5 flex-wrap mt-2">{issue.dtcCodes.map(code => (<Link key={code} href={'/known-issues/dtc/' + code.toLowerCase()} className="text-[10px] font-mono px-2.5 py-1 rounded-md hover:opacity-80 transition-opacity" style={{ backgroundColor: '#EFEDE6', color: '#3C313D' }}>{code}</Link>))}</div></div>)}
          {issue.symptoms && issue.symptoms.length > 0 && (<div className="py-3" style={dividerStyle}><p className="text-xs font-semibold uppercase mb-1.5 px-2 py-1 rounded inline-block" style={labelStyle}>Common Symptoms</p><ul className="space-y-1 mt-2">{issue.symptoms.map((s, i) => (<li key={i} className="text-xs flex gap-2" style={{ color: bodyColor }}><span style={{ color: '#9D9BA2' }}>&bull;</span><span>{s}</span></li>))}</ul></div>)}
          {issue.solution && (<div className="py-3" style={dividerStyle}><p className="text-xs font-semibold uppercase mb-1.5 px-2 py-1 rounded inline-block" style={labelStyle}>How to Fix</p><p className="text-xs leading-relaxed mt-2" style={{ color: bodyColor }}>{issue.solution}</p></div>)}
          {issueHasDiagnosticToolInput(issue.solution, issue.dtcCodes) && (
            <IssueDiagnosticTools
              solution={issue.solution || ''}
              dtcCodes={issue.dtcCodes}
              engines={fitmentVehicle.engine ? [fitmentVehicle.engine] : issue.vehicleMatch.engines}
            />
          )}
          {fixParts.length === 0 && fitmentPrompt && (
            <div className="py-3" style={dividerStyle}>
              <p className="rounded-lg border border-[#C9C0B1] bg-[#F7F4EC] p-2.5 text-xs leading-relaxed text-[#475569]">
                {fitmentPrompt}
              </p>
            </div>
          )}
          {fixParts.length > 0 && (
            <div className="py-3" style={dividerStyle}>
              <p className="text-xs font-semibold uppercase mb-1.5 px-2 py-1 rounded inline-block" style={labelStyle}>What you need to fix it</p>
              <p className="mt-1 text-[10px]" style={{ color: '#6B6570' }}>
                Only diagnosis- and fitment-reviewed repair parts are linked here.
                {fitmentPrompt && <span className="mt-1 block">{fitmentPrompt}</span>}
              </p>
              <ul className="mt-2 space-y-2">
                {fixParts.map((part, index) => (
                  <li key={`${part.component}-${part.oemPartNumber || ''}-${index}`} className="rounded-lg border border-[#C9C0B1] bg-[#F7F4EC] p-2.5">
                    <p className="text-xs font-semibold text-[#0B1220]">{part.component}</p>
                    {isNarrowerThanArticle(part.fitment, issue.vehicleMatch.years) && (
                      <p className="mt-0.5 text-[10px] font-medium text-[#475569]">Fits {describeFitment(part.fitment)}</p>
                    )}
                    {part.oemPartNumber && <p className="mt-0.5 font-mono text-[10px] text-[#475569]">OEM {part.oemPartNumber}</p>}
                    {part.buyLinks && part.buyLinks.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {part.buyLinks.map((link, linkIndex) => {
                          const affiliateUrl = knownIssueAffiliateUrl(link.url, issue.id);
                          return (
                            <a
                              key={`${link.vendor}-${linkIndex}`}
                              href={affiliateUrl}
                              target="_blank"
                              rel="noopener noreferrer sponsored"
                              onClick={() => trackAffiliateClick({
                                issueId: issue.id,
                                partBrand: link.vendor,
                                partName: part.component,
                                partNumber: part.oemPartNumber || undefined,
                                linkUrl: affiliateUrl,
                                recommendationIndex: index,
                                vehicleMake: issue.vehicleMatch.make,
                                vehicleModel: issue.vehicleMatch.model,
                              })}
                              className="rounded bg-[#0B1220] px-2.5 py-1 text-[10px] font-medium text-white transition-colors hover:bg-[#1E293B]"
                            >
                              {link.vendor}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              {hasKnownIssueCommerce(fixParts) && <p className="mt-2 text-[11px] font-medium text-[#475569]">As an Amazon Associate, we earn from qualifying purchases; other part links may also earn au7o a commission. Confirm fitment by VIN.</p>}
            </div>
          )}
          {ownerGuidance.length > 0 && (
            <div className="py-3" style={dividerStyle}>
              <p className="text-xs font-semibold uppercase mb-1.5 px-2 py-1 rounded inline-block" style={labelStyle}>Owner tips &amp; cautions</p>
              <ul className="mt-2 space-y-2">
                {ownerGuidance.map((guidance, index) => (
                  <li key={`${guidance.type}-${index}`} className="flex items-start gap-2 rounded-lg border border-[#C9C0B1] bg-[#F7F4EC] p-2.5">
                    <span className="rounded border border-[#C9C0B1] bg-[#EFEDE6] px-1.5 py-0.5 text-[9px] font-semibold uppercase text-[#3C313D]">
                      {guidance.type === 'warning' ? 'Warning' : 'Tip'}
                    </span>
                    <p className="text-xs text-[#475569]">{guidance.content}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {citations.length > 0 && (<div className="py-3" style={dividerStyle}><p className="text-xs font-semibold uppercase mb-1.5 px-2 py-1 rounded inline-block" style={labelStyle}>References</p><ul className="space-y-1 mt-2">{citations.map((citation, index) => { const url = externalHttpUrl(typeof citation === 'string' ? undefined : citation.url); const title = typeof citation === 'string' ? citation : citation.title || url || 'Reference'; return <li key={index} className="text-xs">{url ? <a href={url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-70" style={{ color: '#18141D' }}>{title}</a> : <span style={{ color: bodyColor }}>{title}</span>}</li>; })}</ul></div>)}
          <div className="py-3" style={dividerStyle}><p className="text-xs font-semibold uppercase mb-1.5 px-2 py-1 rounded inline-block" style={labelStyle}>Research This Issue</p><div className="flex gap-2 flex-wrap mt-2">{[{ label: 'Google', url: 'https://www.google.com/search?q=' + searchQuery },{ label: 'Reddit', url: 'https://www.reddit.com/search/?q=' + searchQuery },{ label: 'YouTube', url: 'https://www.youtube.com/results?search_query=' + searchQuery },{ label: 'NHTSA', url: 'https://www.nhtsa.gov/vehicle-safety/search-results?keyword=' + searchQuery }].map(link => (<a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="text-[10px] px-2.5 py-1.5 rounded-md transition-colors hover:opacity-80" style={labelStyle}>{link.label}</a>))}</div></div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] pt-3" style={{ ...dividerStyle, color: styled ? '#3C313D' : '#6b7280' }}>
            {issue.source && <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: styled ? '#EFEDE6' : '#f3f4f6', color: styled ? '#3C313D' : '#374151', border: styled ? '1px solid #D8D1C3' : undefined }}>{issue.source === 'nhtsa-verified' ? 'NHTSA Verified' : issue.source === 'manual' ? 'Manually Verified' : 'Community Reported'}</span>}
            {issue.confidence && <span>{issue.confidence} confidence</span>}
            {issue.reportCount > 0 && <span>{issue.reportCount} reports</span>}
            {issue.lastReportedByOwners && <span>Last reported {issue.lastReportedByOwners}</span>}
            {issue.reviewedOn && <span>Reviewed {issue.reviewedOn}</span>}
          </div>
          <div className="pt-3"><button onClick={onAskAI} className="text-xs font-medium px-3 py-2 rounded-lg transition-colors hover:opacity-80" style={labelStyle}>Ask AI about this issue &rarr;</button></div>
        </div>
      )}
    </div>
  );
}

function RecallCard({ recall, styled = true }: { recall: RecallItem; styled?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={'rounded-xl overflow-hidden ' + (recall.parkIt ? 'ring-2 ring-[#3C313D]' : '')} style={styled ? { backgroundColor: '#EFEDE6' } : { backgroundColor: '#f9fafb' }}>
      <button onClick={() => setExpanded(!expanded)} className="w-full p-4 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0"><h3 className="text-sm font-medium text-gray-900">{recall.component}</h3><p className="text-xs text-gray-500 mt-0.5">{recall.campaignNumber}</p></div>
          {recall.parkIt && <span className="flex-shrink-0 px-2 py-0.5 text-[10px] font-medium bg-[#0B1220] text-white rounded-full">PARK IT</span>}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          <p className="text-sm text-gray-500">{recall.summary}</p>
          {recall.consequence && <div><p className="text-xs font-medium text-gray-500 uppercase mb-1">Risk</p><p className="text-xs text-[#3C313D]">{recall.consequence}</p></div>}
          {recall.remedy && <div><p className="text-xs font-medium text-gray-500 uppercase mb-1">Remedy</p><p className="text-xs text-gray-500">{recall.remedy}</p></div>}
          <a href={'https://www.nhtsa.gov/recalls?nhtsaId=' + recall.campaignNumber} target="_blank" rel="noopener noreferrer" className="inline-block text-xs font-medium text-[#3C313D] border border-[#D8D1C3] bg-[#F7F4EC] hover:bg-[#EFEDE6] px-3 py-2 rounded-lg transition-colors mt-1">View on NHTSA.gov &rarr;</a>
        </div>
      )}
    </div>
  );
}

function PartCard({ task, parts, styled = true }: { task: string; parts: PartRecord[]; styled?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const name = TASK_NAMES[task] || task.replace(/_/g, ' ');
  return (
    <div className={'rounded-xl overflow-hidden ' + (styled ? 'border' : 'bg-gray-50')} style={styled ? { borderColor: '#c4bec4', backgroundColor: '#EBEAEC' } : undefined}>
      <button onClick={() => setExpanded(!expanded)} className={'w-full px-4 py-3 text-left flex items-center justify-between ' + (styled ? '' : 'hover:bg-gray-100')} style={styled ? { backgroundColor: '#3C313D' } : undefined}>
        <div><h3 className="text-sm font-semibold" style={{ color: styled ? '#EBEAEC' : '#111' }}>{name}</h3><p className="text-xs" style={{ color: styled ? '#9D9BA2' : '#666' }}>{parts.length} part{parts.length !== 1 ? 's' : ''}</p></div>
        <svg className={'w-4 h-4 transition-transform ' + (expanded ? 'rotate-180' : '')} style={{ color: styled ? '#EBEAEC' : '#999' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-3 space-y-2">
          {parts.map((p, i) => (
            <div key={i} className="rounded-lg p-2.5 flex items-center justify-between gap-2" style={styled ? { backgroundColor: '#EBEAEC', border: '1px solid #c4bec4' } : { backgroundColor: 'white' }}>
              <div className="min-w-0">
                <p className="text-xs truncate" style={{ color: styled ? '#3C313D' : '#374151' }}>{p.brand || ''} {p.name || p.partNumber || ''}</p>
                {p.partNumber && <p className="text-[10px] font-mono" style={{ color: styled ? '#55535B' : '#9ca3af' }}>{p.partNumber}</p>}
                {p.spec && <p className="text-[10px]" style={{ color: styled ? '#55535B' : '#9ca3af' }}>{p.spec}</p>}
              </div>
              {(p.affiliateUrl || p.searchQuery || p.partNumber) && (
                <a href={p.affiliateUrl || ('https://www.amazon.com/s?k=' + encodeURIComponent(p.searchQuery || ((p.brand || '') + ' ' + (p.name || '') + ' ' + (p.partNumber || '')).trim()) + '&tag=' + AFFILIATE_TAG)}
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

// Icons
function IconIssues() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>; }
function IconHome() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>; }
function IconParts() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-5.1m0 0L3.07 12.32c-.84.84-.84 2.2 0 3.04l5.58 5.58c.84.84 2.2.84 3.04 0l2.24-2.24m-5.58-8.4l7.12-7.12c.84-.84 2.2-.84 3.04 0l1.41 1.41c.84.84.84 2.2 0 3.04L13.36 15.17" /></svg>; }
function IconGuides() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>; }
function IconChat() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>; }
