'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useVehicleContext } from '@/contexts/AppContext';
import { type YMMTData, YMMTDataSchema } from '@/schemas/vehicle.schema';
import { trackAffiliateClick } from '@/lib/analytics';

// ─── Types ─────────────────────────────────────────────────────────────

interface CrossReference {
  brand: string;
  partNumber: string;
}

interface PartResult {
  name: string;
  spec: string;
  detail?: string;
  searchQuery: string;
  partNumber?: string;
  oemBrand?: string;
  crossReferences?: CrossReference[];
  confidence?: 'dual-verified' | 'oem-verified' | 'high' | 'moderate' | 'needs-review';
  confidenceReason?: string;
  quantity?: number;
  summary?: string;
}

interface UnverifiedPart {
  name: string;
  partNumber?: string;
  reason: string;
  searchQuery: string;
}

interface TaskDef {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// ─── Constants ─────────────────────────────────────────────────────────

const AFFILIATE_TAG = 'au7o-20';

// Job write-ups — what the user needs to know before buying
const TASK_WRITEUPS: Record<string, string> = {
  oil_change: 'For an oil change you\'ll need the correct oil weight and quantity, a new oil filter, and the right socket for the drain plug. Always replace the filter when changing oil.',
  brake_inspection: 'Brake rotors and pads should be replaced as a set per axle — both front rotors together, both rear together. If your rotors are warped or worn below minimum thickness, replace them with the pads. Brake fluid should be DOT-rated for your vehicle.',
  spark_plugs: 'Replace all spark plugs at once. Use the correct gap and torque specification to avoid misfires. OEM plugs are recommended but quality aftermarket (NGK, Denso) work well.',
  coolant_flush: 'Use only the coolant type specified for your vehicle — mixing types can cause corrosion and cooling system damage. Capacity listed is total system capacity.',
  transmission_fluid: 'Use only the exact transmission fluid specification for your vehicle. Wrong fluid can cause shifting problems and transmission damage. Capacity listed is for a drain-and-fill, not a full flush.',
  air_filter: 'A dirty air filter reduces engine performance and fuel economy. Check every oil change, replace when visibly dirty or per your maintenance schedule.',
  cabin_filter: 'The cabin filter cleans the air coming through your vents. Replace it if you notice musty smells, reduced airflow, or increased allergy symptoms inside the car.',
  battery: 'Make sure the group size matches your vehicle — a wrong-size battery won\'t fit the tray. CCA (cold cranking amps) should meet or exceed the OEM spec.',
  wiper_blades: 'Driver and passenger wipers are usually different lengths. Some vehicles also have a rear wiper. Replace both front blades at the same time for even clearing.',
  differential_fluid: 'Differential fluid breaks down over time, especially under heavy load or towing. Use the exact GL rating and weight specified — wrong fluid can damage gears.',
  bulb_replacement: 'Bulb numbers are specific to each position on the vehicle. When replacing headlights, do both sides at the same time for even brightness.',
  tire_rotation: 'Always torque lug nuts/bolts to the exact specification with a torque wrench. Over-tightening can warp brake rotors; under-tightening is a safety hazard.',
  serpentine_belt: 'Replace the belt if you see cracks, fraying, or glazing. Consider replacing the tensioner at the same time — a worn tensioner will kill a new belt.',
  timing_belt: 'This is a major service item. If the timing belt breaks, it can cause serious engine damage on interference engines. Replace the water pump, tensioner, and idler pulleys at the same time — the labor is the same.',
  brake_calipers: 'Calipers should be replaced in pairs (both fronts or both rears) for even braking. Remanufactured calipers are a cost-effective alternative to new OEM.',
  shocks_struts: 'Replace shocks and struts in pairs per axle. Worn shocks increase stopping distance and reduce handling. Consider new mounts and bump stops at the same time.',
  water_pump: 'A leaking or failing water pump will cause overheating. If your vehicle has a timing-belt-driven water pump, replace both at the same time.',
  alternator: 'If your battery keeps dying or you see dim lights and electrical issues, the alternator may be failing. Remanufactured units are a good value option.',
  starter_motor: 'If your engine clicks but won\'t crank, the starter may be the issue. Remanufactured starters are widely available and reliable.',
  fuel_filter: 'A clogged fuel filter causes hesitation, rough idle, and reduced power. Some vehicles have serviceable inline filters; others have in-tank filters that are part of the fuel pump assembly.',
  wheel_bearing: 'A humming or growling noise that changes with speed usually indicates a bad wheel bearing. Replace the hub assembly — most modern vehicles use sealed hub-bearing units.',
  ac_compressor: 'If your AC blows warm air, the compressor may need replacement. Also check for refrigerant leaks before replacing. Use the correct refrigerant type and amount.',
  valve_cover_gasket: 'Oil leaking from the top of the engine usually means a worn valve cover gasket. On V-engines you may need left and right side gaskets. Replace the spark plug tube seals and grommets at the same time.',
  oil_pan_gasket: 'Oil dripping from the bottom of the engine points to the oil pan gasket. Some vehicles use a formed gasket while others use RTV sealant. Always replace the drain plug crush washer too.',
  head_gasket: 'A blown head gasket is a major repair. Symptoms include white exhaust smoke, milky oil, overheating, or coolant loss. Always resurface the head and use new head bolts — most modern engines use torque-to-yield bolts that cannot be reused.',
  intake_manifold_gasket: 'A leaking intake gasket can cause vacuum leaks, rough idle, and check engine lights. On some V-engines the lower intake gasket is a known coolant leak point.',
};

// Group parts into sections: "Front Brakes", "Rear Brakes", "Brake Fluid", etc.
function groupParts(parts: PartResult[]): { label: string; parts: PartResult[] }[] {
  const groups: Map<string, PartResult[]> = new Map();

  for (const part of parts) {
    const name = part.name.toLowerCase();
    let groupKey: string;

    if (name.startsWith('front brake') || name.startsWith('front rotor') || name.startsWith('front pad')) {
      groupKey = 'Front Brakes';
    } else if (name.startsWith('rear brake') || name.startsWith('rear rotor') || name.startsWith('rear pad')) {
      groupKey = 'Rear Brakes';
    } else if (name.includes('brake fluid')) {
      groupKey = 'Brake Fluid';
    } else if (name.startsWith('front ') && (name.includes('differential') || name.includes('axle') || name.includes('cv'))) {
      groupKey = 'Front Axle';
    } else if (name.startsWith('rear ') && (name.includes('differential') || name.includes('axle'))) {
      groupKey = 'Rear Axle';
    } else if (name.includes('low beam') || name.includes('high beam') || name.includes('fog') || name.includes('tail') || name.includes('brake light') || name.includes('turn signal')) {
      groupKey = 'Bulbs';
    } else {
      groupKey = part.name;
    }

    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey)!.push(part);
  }

  return Array.from(groups.entries()).map(([label, parts]) => ({ label, parts }));
}

interface TaskCategory {
  name: string;
  tasks: TaskDef[];
}

const TASK_CATEGORIES: TaskCategory[] = [
  {
    name: 'Regular Maintenance',
    tasks: [
      { id: 'oil_change', name: 'Oil Change', icon: '🛢️', description: 'Oil, filter, drain plug' },
      { id: 'air_filter', name: 'Air Filter', icon: '💨', description: 'Engine air filter' },
      { id: 'cabin_filter', name: 'Cabin Filter', icon: '🌬️', description: 'Fresh air inside' },
      { id: 'spark_plugs', name: 'Spark Plugs', icon: '⚡', description: 'Plugs, gap, qty' },
      { id: 'wiper_blades', name: 'Wipers', icon: '🌧️', description: 'Blade sizes' },
      { id: 'battery', name: 'Battery', icon: '🔋', description: 'Size, power rating' },
      { id: 'bulb_replacement', name: 'Light Bulbs', icon: '💡', description: 'All bulb numbers' },
      { id: 'serpentine_belt', name: 'Drive Belt', icon: '〰️', description: 'Belt and tensioner' },
    ],
  },
  {
    name: 'Fluids',
    tasks: [
      { id: 'coolant_flush', name: 'Coolant', icon: '🌡️', description: 'Type and capacity' },
      { id: 'transmission_fluid', name: 'Transmission', icon: '⚙️', description: 'Fluid type, capacity' },
      { id: 'brake_fluid', name: 'Brake Fluid', icon: '🧴', description: 'DOT type' },
      { id: 'power_steering_fluid', name: 'Power Steering', icon: '🔄', description: 'Fluid type' },
      { id: 'differential_fluid', name: 'Differential', icon: '🔧', description: 'Type and capacity' },
      { id: 'transfer_case_fluid', name: 'Transfer Case', icon: '🏔️', description: '4WD / AWD' },
    ],
  },
  {
    name: 'Brakes',
    tasks: [
      { id: 'brake_inspection', name: 'Pads & Rotors', icon: '🛑', description: 'Front and rear' },
      { id: 'brake_calipers', name: 'Calipers', icon: '🔴', description: 'Caliper assemblies' },
    ],
  },
  {
    name: 'Steering & Suspension',
    tasks: [
      { id: 'shocks_struts', name: 'Shocks & Struts', icon: '🏎️', description: 'Ride comfort' },
      { id: 'wheel_bearing', name: 'Wheel Bearings', icon: '🎡', description: 'Humming noise fix' },
      { id: 'ball_joints', name: 'Ball Joints', icon: '🔩', description: 'Clunking over bumps' },
      { id: 'tie_rods', name: 'Tie Rods', icon: '↔️', description: 'Steering play fix' },
      { id: 'control_arms', name: 'Control Arms', icon: '💪', description: 'Alignment issues' },
      { id: 'sway_bar_links', name: 'Sway Bar Links', icon: '🔗', description: 'Rattling in turns' },
    ],
  },
  {
    name: 'Engine & Cooling',
    tasks: [
      { id: 'timing_belt', name: 'Timing Belt / Chain', icon: '⏱️', description: 'Major service item' },
      { id: 'water_pump', name: 'Water Pump', icon: '💧', description: 'Coolant leak fix' },
      { id: 'thermostat', name: 'Thermostat', icon: '🌡️', description: 'Overheating fix' },
      { id: 'radiator', name: 'Radiator', icon: '♨️', description: 'Cooling system' },
      { id: 'ignition_coils', name: 'Ignition Coils', icon: '🔥', description: 'Misfires fix' },
      { id: 'fuel_filter', name: 'Fuel Filter', icon: '⛽', description: 'Fuel system' },
      { id: 'fuel_pump', name: 'Fuel Pump', icon: '⛽', description: 'No-start fix' },
      { id: 'alternator', name: 'Alternator', icon: '⚡', description: 'Charging system' },
      { id: 'starter_motor', name: 'Starter', icon: '🔑', description: 'Cranking issue fix' },
      { id: 'oxygen_sensor', name: 'O2 Sensor', icon: '📡', description: 'Check engine light' },
      { id: 'ac_compressor', name: 'AC Compressor', icon: '❄️', description: 'No cold air fix' },
    ],
  },
  {
    name: 'Gaskets & Seals',
    tasks: [
      { id: 'valve_cover_gasket', name: 'Valve Cover Gasket', icon: '🔲', description: 'Oil leak on top' },
      { id: 'oil_pan_gasket', name: 'Oil Pan Gasket', icon: '🫗', description: 'Oil leak underneath' },
      { id: 'head_gasket', name: 'Head Gasket', icon: '🔥', description: 'Major engine repair' },
      { id: 'intake_manifold_gasket', name: 'Intake Gasket', icon: '🌀', description: 'Vacuum leak fix' },
    ],
  },
  {
    name: 'Exhaust',
    tasks: [
      { id: 'catalytic_converter', name: 'Catalytic Converter', icon: '🏭', description: 'Emissions fix' },
      { id: 'muffler_exhaust', name: 'Muffler & Pipes', icon: '💨', description: 'Loud exhaust fix' },
    ],
  },
  {
    name: 'Wheels & Tires',
    tasks: [
      { id: 'tire_rotation', name: 'Lug Specs', icon: '🛞', description: 'Socket size, torque' },
      { id: 'wheel_specs', name: 'Wheel Specs', icon: '⭕', description: 'Bolt pattern, size' },
      { id: 'cv_axle', name: 'CV Axle', icon: '🦴', description: 'Clicking in turns' },
      { id: 'u_joints', name: 'U-Joints', icon: '🔗', description: 'Driveshaft vibration' },
      { id: 'clutch_kit', name: 'Clutch Kit', icon: '🏁', description: 'Manual trans only' },
    ],
  },
];

// Flat list for lookups
const ALL_TASKS = TASK_CATEGORIES.flatMap(c => c.tasks);

function amazonSearchUrl(query: string) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AFFILIATE_TAG}`;
}

function googleSearchUrl(query: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

// Natural search: "2015 Dodge Challenger SRT 392 front brake rotors"
// With brand: "PowerStop EBR1606XPR 2015 Dodge Challenger SRT 392 front brake rotors"
function buildPartQuery(
  vehicle: { year: string; make: string; model: string; trim: string },
  partName: string,
  opts?: { brand?: string; partNumber?: string; spec?: string }
) {
  const parts: string[] = [];
  if (opts?.brand) parts.push(opts.brand);
  if (opts?.partNumber) parts.push(opts.partNumber);
  parts.push(vehicle.year, vehicle.make, vehicle.model);
  if (vehicle.trim && !['Base', 'Standard'].includes(vehicle.trim)) {
    parts.push(vehicle.trim);
  }
  parts.push(partName);
  if (opts?.spec) parts.push(opts.spec);
  return parts.join(' ');
}

// Brand website search/catalog URLs
// Only brands with reliable, internationally accessible catalog/search pages
const BRAND_URLS: Record<string, string> = {
  'PowerStop': 'https://www.powerstop.com/search/?q=',
  'StopTech': 'https://www.stoptech.com/products/',
  'Hawk Performance': 'https://www.hawkperformance.com/',
  'EBC': 'https://ebcbrakes.com/find-brakes/',
  'Brembo': 'https://www.bremboparts.com/en/',
  'Centric': 'https://www.centricparts.com/',
  'K&N': 'https://www.knfilters.com/',
  'NGK': 'https://www.ngk.com/',
  'Denso': 'https://www.denso-am.com/',
  'Bosch': 'https://www.boschautoparts.com/',
  // Removed: Mopar (geo-blocked), Wix, Fram, Mobil 1, ACDelco, Motorcraft (no useful catalog search)
};

function getBrandUrl(brand: string): string | null {
  return BRAND_URLS[brand] || null;
}

const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
  backgroundPosition: 'right 12px center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '20px',
  paddingRight: '40px',
};

// ─── Component ─────────────────────────────────────────────────────────

export function PartsFinderClient() {
  const { selectedVehicle, setVehicle } = useVehicleContext();
  const [ymmtData, setYmmtData] = useState<YMMTData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(selectedVehicle?.year?.toString() || '');
  const [selectedMake, setSelectedMake] = useState(selectedVehicle?.make || '');
  const [selectedModel, setSelectedModel] = useState(selectedVehicle?.model || '');
  const [selectedTrim, setSelectedTrim] = useState(selectedVehicle?.trim || '');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [freeSearchQuery, setFreeSearchQuery] = useState('');
  const [activeFreeSearch, setActiveFreeSearch] = useState<string | null>(null);
  const [followUpQuery, setFollowUpQuery] = useState('');

  const [partsResults, setPartsResults] = useState<PartResult[]>([]);
  const [unverifiedResults, setUnverifiedResults] = useState<UnverifiedPart[]>([]);
  const [partsSource, setPartsSource] = useState<string>('');
  const [overallConfidence, setOverallConfidence] = useState<string>('');
  const [vehicleNotes, setVehicleNotes] = useState<string>('');
  const [partsLoading, setPartsLoading] = useState(false);
  const [partsError, setPartsError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetch('/data/ymmt.json')
      .then((res) => res.json())
      .then((data) => {
        setYmmtData(YMMTDataSchema.parse(data));
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  // Fetch parts from API when task is selected or free-text search is triggered
  useEffect(() => {
    const hasTask = selectedTask !== null;
    const hasFreeSearch = activeFreeSearch !== null;
    if (!selectedYear || !selectedMake || !selectedModel || !selectedTrim || (!hasTask && !hasFreeSearch)) {
      setPartsResults([]);
      setUnverifiedResults([]);
      setPartsSource('');
      setOverallConfidence('');
      setVehicleNotes('');
      setPartsError(null);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setPartsLoading(true);
    setPartsError(null);
    setPartsResults([]);
    setUnverifiedResults([]);

    const params = new URLSearchParams({
      year: selectedYear,
      make: selectedMake,
      model: selectedModel,
      trim: selectedTrim,
    });
    if (hasTask) {
      params.set('task', selectedTask!);
    } else {
      params.set('q', activeFreeSearch!);
    }

    fetch(`/api/parts?${params}`, { signal: controller.signal })
      .then(async (res) => {
        if (res.status === 429) {
          const data = await res.json();
          throw new Error(`LIMIT:${data.message || 'Weekly limit reached'}`);
        }
        if (!res.ok) throw new Error('Failed to load parts');
        return res.json();
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setPartsResults(data.parts || []);
          setUnverifiedResults(data.unverifiedParts || []);
          setPartsSource(data.source || '');
          setOverallConfidence(data.overallConfidence || '');
          setVehicleNotes(data.vehicleNotes || '');
          setPartsLoading(false);
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        if (err.message?.startsWith('LIMIT:')) {
          setPartsError(err.message.replace('LIMIT:', ''));
        } else {
          setPartsError('Something went wrong looking up parts. Please try again.');
        }
        setPartsLoading(false);
      });

    return () => controller.abort();
  }, [selectedYear, selectedMake, selectedModel, selectedTrim, selectedTask, activeFreeSearch]);

  const availableYears = useMemo(() => {
    if (!ymmtData) return [];
    return Object.keys(ymmtData).map((y) => parseInt(y, 10)).sort((a, b) => b - a);
  }, [ymmtData]);

  const availableMakes = useMemo(() => {
    if (!ymmtData || !selectedYear) return [];
    const yearData = ymmtData[selectedYear];
    return yearData ? Object.keys(yearData).sort() : [];
  }, [ymmtData, selectedYear]);

  const availableModels = useMemo(() => {
    if (!ymmtData || !selectedYear || !selectedMake) return [];
    const yearData = ymmtData[selectedYear];
    if (!yearData) return [];
    const makeData = yearData[selectedMake];
    return makeData ? Object.keys(makeData).sort() : [];
  }, [ymmtData, selectedYear, selectedMake]);

  const availableTrims = useMemo(() => {
    if (!ymmtData || !selectedYear || !selectedMake || !selectedModel) return [];
    const yearData = ymmtData[selectedYear];
    if (!yearData) return [];
    const makeData = yearData[selectedMake];
    if (!makeData) return [];
    return makeData[selectedModel] || [];
  }, [ymmtData, selectedYear, selectedMake, selectedModel]);

  const clearResults = useCallback(() => {
    setSelectedTask(null);
    setActiveFreeSearch(null);
    setFreeSearchQuery('');
  }, []);

  const handleYearChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value); setSelectedMake(''); setSelectedModel(''); setSelectedTrim(''); clearResults();
  }, [clearResults]);
  const handleMakeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMake(e.target.value); setSelectedModel(''); setSelectedTrim(''); clearResults();
  }, [clearResults]);
  const handleModelChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value); setSelectedTrim(''); clearResults();
  }, [clearResults]);
  const handleTrimChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedTrim(e.target.value);
      clearResults();
      if (e.target.value && selectedYear && selectedMake && selectedModel) {
        setVehicle({ year: parseInt(selectedYear, 10), make: selectedMake, model: selectedModel, trim: e.target.value });
      }
    },
    [selectedYear, selectedMake, selectedModel, setVehicle, clearResults]
  );

  const isVehicleSelected = selectedYear && selectedMake && selectedModel && selectedTrim;
  const vehicle = { year: selectedYear, make: selectedMake, model: selectedModel, trim: selectedTrim };
  const taskName = ALL_TASKS.find(t => t.id === selectedTask)?.name || '';

  const baseSelectClass =
    'min-h-[48px] px-4 py-3 rounded-lg border border-gray-300 bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none';

  const handleTaskClick = useCallback((taskId: string) => {
    setActiveFreeSearch(null);
    setSelectedTask(taskId);
  }, []);

  const handleChatSubmit = useCallback((query: string) => {
    const q = query.trim();
    if (q) {
      setSelectedTask(null);
      setActiveFreeSearch(q);
      setFollowUpQuery('');
      setFreeSearchQuery('');
    }
  }, []);

  return (
    <>
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/og-image.png" alt="Au7o mascot" width={32} height={32} className="rounded-lg" />
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              Au<span className="text-blue-600">7</span>o
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/known-issues" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Known Issues
            </Link>
            <Link href="/get-started" className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-28">
        {/* Two-column layout */}
        <div className="lg:flex lg:gap-0">

          {/* ─── LEFT SIDEBAR (desktop) ─────────────────────────── */}
          <aside className="hidden lg:block lg:w-56 xl:w-64 flex-shrink-0 border-r border-gray-200 pr-6 mr-8 pt-8">
            <nav className="sticky top-8 space-y-5" aria-label="Parts navigation">
              <div>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Parts</h2>
                <ul className="space-y-0.5">
                  {TASK_CATEGORIES.map((cat) => (
                    <li key={cat.name}>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-3 mb-1 px-2">{cat.name}</p>
                      <ul className="space-y-0">
                        {cat.tasks.map((task) => {
                          const isActive = selectedTask === task.id;
                          return (
                            <li key={task.id}>
                              <button
                                type="button"
                                onClick={() => handleTaskClick(task.id)}
                                disabled={!isVehicleSelected}
                                className={`w-full flex items-center gap-2 text-sm py-1.5 rounded-md px-2 -mx-0 transition-colors text-left ${
                                  isActive
                                    ? 'text-blue-700 bg-blue-50 font-medium'
                                    : isVehicleSelected
                                    ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    : 'text-gray-300 cursor-not-allowed'
                                }`}
                              >
                                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                                <span className="flex-shrink-0 w-5 text-center text-xs">{task.icon}</span>
                                <span className="truncate">{task.name}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sidebar CTAs */}
              {isVehicleSelected && (
                <div className="space-y-2 pt-3 border-t border-gray-100">
                  <Link
                    href={`/known-issues/${selectedMake.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${selectedModel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                    className="flex items-center justify-center gap-2 w-full py-2 px-3 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Known Issues
                  </Link>
                  <Link
                    href="/get-started"
                    className="flex items-center justify-center gap-2 w-full py-2 px-3 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    DIY Repair Guide
                  </Link>
                </div>
              )}

              <a href="#top" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Back to top
              </a>
            </nav>
          </aside>

          {/* ─── MAIN CONTENT ───────────────────────────────────── */}
          <main className="flex-1 min-w-0 pt-8" id="top">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-400 mb-6" aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5">
                <li><Link href="/" className="hover:text-gray-600">Au7o</Link></li>
                <li className="text-gray-300">/</li>
                <li className="text-gray-700 font-medium">Parts Finder</li>
              </ol>
            </nav>

            {/* Title */}
            <header className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Parts Finder</h1>
              <p className="text-sm text-gray-500">
                Select your vehicle, then pick a task or search for any part.
              </p>
            </header>

            {/* YMMT Selector */}
            <section className="mb-6">
              {isLoading ? (
                <div className="flex items-center justify-center gap-3 py-6">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  <span className="text-gray-400 text-sm">Loading vehicles...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <select value={selectedYear} onChange={handleYearChange} className={`${baseSelectClass} text-gray-900 cursor-pointer`} style={selectStyle}>
                    <option value="">Year</option>
                    {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <select value={selectedMake} onChange={handleMakeChange} disabled={!selectedYear} className={`${baseSelectClass} ${selectedYear ? 'text-gray-900 cursor-pointer' : 'text-gray-400 cursor-not-allowed bg-gray-50'}`} style={selectStyle}>
                    <option value="">{selectedYear ? 'Make' : 'Select year'}</option>
                    {availableMakes.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={selectedModel} onChange={handleModelChange} disabled={!selectedMake} className={`${baseSelectClass} ${selectedMake ? 'text-gray-900 cursor-pointer' : 'text-gray-400 cursor-not-allowed bg-gray-50'}`} style={selectStyle}>
                    <option value="">{selectedMake ? 'Model' : 'Select make'}</option>
                    {availableModels.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={selectedTrim} onChange={handleTrimChange} disabled={!selectedModel} className={`${baseSelectClass} ${selectedModel ? 'text-gray-900 cursor-pointer' : 'text-gray-400 cursor-not-allowed bg-gray-50'}`} style={selectStyle}>
                    <option value="">{selectedModel ? 'Trim' : 'Select model'}</option>
                    {availableTrims.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              )}
            </section>

            {/* Mobile task selector — horizontal pills (lg:hidden) */}
            {isVehicleSelected && (
              <div className="lg:hidden mb-6 overflow-x-auto -mx-4 px-4">
                <div className="flex gap-2 pb-2">
                  {ALL_TASKS.slice(0, 12).map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => handleTaskClick(task.id)}
                      className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                        selectedTask === task.id
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {task.icon} {task.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No vehicle selected — explainer */}
            {!isVehicleSelected && (
              <section className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-lg border border-gray-200">
                  <div className="text-2xl mb-2">🎯</div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">OEM Part Numbers</h3>
                  <p className="text-xs text-gray-500">Exact part numbers from service manuals with aftermarket cross-references.</p>
                </div>
                <div className="p-5 rounded-lg border border-gray-200">
                  <div className="text-2xl mb-2">🛒</div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">Compare Prices</h3>
                  <p className="text-xs text-gray-500">One-click links to Google and Amazon to find the best price.</p>
                </div>
                <div className="p-5 rounded-lg border border-gray-200">
                  <div className="text-2xl mb-2">✅</div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">Web Verified</h3>
                  <p className="text-xs text-gray-500">Every part is verified against real retailer listings before showing.</p>
                </div>
              </section>
            )}

            {/* Vehicle selected, no task yet — prompt */}
            {isVehicleSelected && !selectedTask && !activeFreeSearch && !partsLoading && (
              <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400">
                <p className="text-sm">Select a task from the sidebar or type a question below.</p>
              </div>
            )}

            {/* Results */}
            {isVehicleSelected && (selectedTask || activeFreeSearch) && (
              <section>
                {/* Results header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {activeFreeSearch ? `"${activeFreeSearch}"` : taskName}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {partsSource === 'static' ? '✅ Verified from OEM specs' :
                       (partsSource === 'pipeline' || partsSource === 'pipeline-freetext') ? `✅ Web verified${overallConfidence ? ` — ${overallConfidence} confidence` : ''}` :
                       partsLoading ? 'Running verification pipeline...' : ''}
                    </p>
                    {vehicleNotes && !partsLoading && (
                      <p className="text-xs text-amber-600 mt-1">{vehicleNotes}</p>
                    )}
                  </div>
                </div>

                {/* Loading */}
                {partsLoading && (
                  <div className="border border-gray-200 rounded-lg p-8 flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm">
                      {activeFreeSearch ? 'Searching with multi-agent verification...' : 'Looking up parts with verification...'}
                    </p>
                    <p className="text-xs text-gray-400">This may take 1-2 minutes — verifying parts across multiple sources</p>
                  </div>
                )}

                {/* Error */}
                {partsError && (
                  <div className={`border rounded-lg p-6 text-center ${partsError.includes('limit') || partsError.includes('Upgrade') ? 'border-amber-200 bg-amber-50/50' : 'border-red-200'}`}>
                    <p className={`text-sm mb-3 ${partsError.includes('limit') || partsError.includes('Upgrade') ? 'text-amber-800' : 'text-red-700'}`}>{partsError}</p>
                    {(partsError.includes('limit') || partsError.includes('Upgrade')) ? (
                      <Link
                        href="/subscribe"
                        className="inline-block px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Upgrade to Pro
                      </Link>
                    ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeFreeSearch) {
                          const q = activeFreeSearch;
                          setActiveFreeSearch(null);
                          setTimeout(() => setActiveFreeSearch(q), 50);
                        } else {
                          const t = selectedTask;
                          setSelectedTask(null);
                          setTimeout(() => setSelectedTask(t), 50);
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Try Again
                    </button>
                    )}
                  </div>
                )}

                {/* Parts list */}
                {!partsLoading && !partsError && partsResults.length > 0 && (
                  <div className="space-y-4">
                    {/* Job write-up */}
                    {(selectedTask && TASK_WRITEUPS[selectedTask]) && (
                      <div className="border-l-4 border-blue-200 bg-blue-50/50 p-4 rounded-r-lg">
                        <p className="text-sm text-gray-700 leading-relaxed">{TASK_WRITEUPS[selectedTask]}</p>
                      </div>
                    )}

                    {/* Unverified parts */}
                    {unverifiedResults.length > 0 && (
                      <div className="border border-amber-200 rounded-lg p-4 bg-amber-50/50">
                        <p className="text-sm font-medium text-amber-800 mb-3">
                          {partsResults.length > 0
                            ? `${unverifiedResults.length} part${unverifiedResults.length > 1 ? 's' : ''} couldn\u2019t be verified:`
                            : 'We couldn\u2019t verify these parts. Try searching directly:'}
                        </p>
                        <div className="space-y-2">
                          {unverifiedResults.map((up, i) => (
                            <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-amber-100 last:border-0">
                              <div className="min-w-0">
                                <span className="text-sm font-medium text-gray-700">{up.name}</span>
                                {up.partNumber && <span className="text-xs text-gray-400 ml-2 line-through">{up.partNumber}</span>}
                              </div>
                              <a
                                href={googleSearchUrl(up.searchQuery)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 border border-amber-300 rounded-md hover:bg-amber-100 transition-colors flex-shrink-0"
                              >
                                Search Google
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grouped parts */}
                    {groupParts(partsResults).map((group) => (
                      group.parts.length === 1 && group.label === group.parts[0].name ? (
                        <PartCard key={group.label} part={group.parts[0]} vehicle={vehicle} />
                      ) : (
                        <details key={group.label} className="border border-gray-200 rounded-lg overflow-hidden group">
                          <summary className="px-5 py-3 cursor-pointer select-none hover:bg-gray-50 transition-colors flex items-center justify-between bg-gray-50">
                            <span className="text-sm font-semibold text-gray-800">{group.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">{group.parts.length} {group.parts.length === 1 ? 'part' : 'parts'}</span>
                              <svg className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </summary>
                          <div className="divide-y divide-gray-100">
                            {group.parts.map((part, idx) => (
                              <PartCard key={idx} part={part} vehicle={vehicle} noBorder />
                            ))}
                          </div>
                        </details>
                      )
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Disclaimer */}
            <div className="flex items-start gap-2 py-3 mt-8">
              <svg className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-gray-400 leading-relaxed">
                Part numbers are sourced from OEM specs and AI cross-referencing. Always confirm compatibility before purchasing.
              </p>
            </div>
          </main>
        </div>
      </div>

      {/* ─── FIXED BOTTOM CHAT BAR ──────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleChatSubmit(followUpQuery || freeSearchQuery);
          }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={followUpQuery || freeSearchQuery}
              onChange={(e) => {
                if (selectedTask || activeFreeSearch) {
                  setFollowUpQuery(e.target.value);
                } else {
                  setFreeSearchQuery(e.target.value);
                }
              }}
              placeholder={
                !isVehicleSelected
                  ? 'Select a vehicle above to get started...'
                  : selectedTask || activeFreeSearch
                  ? 'Ask a follow-up — "what about rear brakes?" or "show me ceramic pads"'
                  : 'Ask about any part — rocker panels, water pump, headlight assembly...'
              }
              disabled={!isVehicleSelected}
              className="flex-1 min-h-[44px] px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!isVehicleSelected || !(followUpQuery.trim() || freeSearchQuery.trim())}
              className="px-5 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Ask
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ─── Part Card ─────────────────────────────────────────────────────────

function BuyLinks({
  query,
  partNumber,
  partName,
  brand,
  vehicle,
  index,
}: {
  query: string;
  partNumber?: string;
  partName: string;
  brand?: string;
  vehicle: { year: string; make: string; model: string; trim: string };
  index: number;
}) {
  const shopUrl = googleSearchUrl(query);
  const amzUrl = amazonSearchUrl(query);
  const brandUrl = brand ? getBrandUrl(brand) : null;

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={shopUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Google
      </a>
      <a
        href={amzUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => {
          trackAffiliateClick({
            issueId: `parts-finder-${vehicle.make}-${vehicle.model}`.toLowerCase(),
            recommendationIndex: index,
            linkUrl: amzUrl,
            partNumber: partNumber || undefined,
            partName,
            vehicleMake: vehicle.make,
            vehicleModel: vehicle.model,
          });
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-700 border border-orange-200 rounded-md hover:bg-orange-50 transition-colors"
      >
        Amazon
      </a>
      {brandUrl && (
        <a
          href={brandUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
        >
          {brand} Site
        </a>
      )}
    </div>
  );
}

function PartCard({
  part,
  vehicle,
  noBorder,
}: {
  part: PartResult;
  vehicle: { year: string; make: string; model: string; trim: string };
  noBorder?: boolean;
}) {
  // Natural search: "2015 Dodge Challenger SRT 392 front brake rotors 380mm"
  const oemQuery = buildPartQuery(vehicle, part.name, {
    brand: part.oemBrand,
    partNumber: part.partNumber,
    spec: part.spec !== part.partNumber ? part.spec : undefined,
  });

  const confidenceConfig: Record<string, { label: string; color: string }> = {
    'dual-verified': { label: 'Dual AI Verified', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    'oem-verified': { label: 'OEM Verified', color: 'text-green-700 bg-green-50 border-green-200' },
    high: { label: 'High Confidence', color: 'text-blue-700 bg-blue-50 border-blue-200' },
    moderate: { label: 'AI Recommended', color: 'text-gray-600 bg-gray-50 border-gray-200' },
    'needs-review': { label: 'Needs Review', color: 'text-red-700 bg-red-50 border-red-200' },
  };

  const conf = confidenceConfig[part.confidence || 'moderate'];
  const hasCrossRefs = part.crossReferences && part.crossReferences.length > 0;

  return (
    <div className={noBorder ? '' : 'border border-gray-200 rounded-lg overflow-hidden'}>
      {/* OEM Part — primary */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{part.name}</h3>
            {part.quantity && part.quantity > 1 && (
              <span className="text-xs text-gray-400">Qty: {part.quantity}</span>
            )}
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded border flex-shrink-0 ${conf.color}`}>
            {conf.label}
          </span>
        </div>

        {/* Spec + Brand */}
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          {part.oemBrand && (
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{part.oemBrand}</span>
          )}
          <span className="text-sm font-mono text-blue-700 bg-blue-50 inline-block px-2 py-0.5 rounded">
            {part.spec}
          </span>
        </div>

        {part.detail && <p className="text-sm text-gray-500 mb-3">{part.detail}</p>}

        {/* OEM buy links */}
        <BuyLinks
          query={part.searchQuery || oemQuery}
          partNumber={part.partNumber}
          partName={part.name}
          brand={part.oemBrand}
          vehicle={vehicle}
          index={0}
        />
      </div>

      {/* Aftermarket alternatives — collapsible */}
      {hasCrossRefs && (
        <details className="border-t border-gray-100 group">
          <summary className="px-5 py-3 cursor-pointer select-none hover:bg-gray-50 transition-colors flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              {part.crossReferences!.length} aftermarket option{part.crossReferences!.length > 1 ? 's' : ''}
            </span>
            <svg className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-5 pb-4 space-y-3">
            {part.crossReferences!.map((cr, i) => {
              // "PowerStop EBR1606XPR 2015 Dodge Challenger SRT 392 front brake rotors"
              const crQuery = buildPartQuery(vehicle, part.name, {
                brand: cr.brand,
                partNumber: cr.partNumber,
              });
              return (
                <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-gray-700">{cr.brand}</span>
                    <span className="text-sm font-mono text-gray-500 ml-2">{cr.partNumber}</span>
                  </div>
                  <BuyLinks
                    query={crQuery}
                    partNumber={cr.partNumber}
                    partName={`${cr.brand} ${part.name}`}
                    brand={cr.brand}
                    vehicle={vehicle}
                    index={i + 1}
                  />
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}
