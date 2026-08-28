export type TwinEvidenceStatus = 'overdue' | 'on-track' | 'known-issue' | 'unavailable' | 'unlogged';

export interface TwinHotspot {
  id: string;
  branch: string;
  node?: string;
  label: string;
  x: number;
  y: number;
  status: TwinEvidenceStatus;
  statusDetail: string;
  knownIssueIds?: readonly string[];
}

export interface TwinSampleServiceRecord {
  node: string;
  label: string;
  lastServiceMileage: number;
  intervalMiles: number;
  intervalSource: string;
  sourceUrl: string;
  sourceSection: string;
}

export interface VehicleTwinCatalogEntry {
  id: string;
  fulfillmentId: string | null;
  identity: { year: number; make: string; model: string; trim: string; engine: string; paint: string };
  demoMileage: number | null;
  sampleState: {
    label: 'Sample demo state';
    records: readonly TwinSampleServiceRecord[];
  };
  treeResolver: string;
  treeStatus: 'fitment-reviewed' | 'model-specific' | 'structure-only';
  ownerReady: boolean;
  art: {
    available: boolean;
    base: string;
    effects: Record<string, string>;
    xray?: string;
    strategy: 'alpha-overlay' | 'opaque-masked';
    masks?: Record<string, string>;
  };
  hotspots: readonly TwinHotspot[];
  systems: readonly { hot: string; branch: string; label: string; img: string }[];
}

const systems = (includeTransmission: boolean) => [
  { hot: 'wheel', branch: 'wheel', label: 'Wheel, Tire & Brakes', img: '/twin-stage/parts/part-caliper.webp' },
  { hot: 'hood', branch: 'engine', label: 'Engine', img: '/twin-stage/parts/part-engine.webp' },
  ...(includeTransmission ? [{ hot: 'trans', branch: 'trans', label: 'Transmission', img: '/twin-stage/parts/part-transmission.webp' }] : []),
  { hot: 'glass', branch: 'wipers', label: 'Windshield Wipers', img: '/twin-stage/parts/part-wipers.webp' },
];

const standardHotspots = (
  coordinates: Record<string, [number, number]>,
  overrides: Partial<Record<string, Partial<TwinHotspot>>> = {},
): TwinHotspot[] => [
  ['wheel', 'wheel', undefined, 'Wheel, Tire & Brakes'],
  ['hood', 'engine', 'oil', 'Engine'],
  ['glass', 'wipers', undefined, 'Windshield Wipers'],
  ['rearwheel', 'wheel', 'tire', 'Rear Wheel & Tire'],
  ['rad', 'engine', 'rad', 'Radiator & Coolant'],
  ...(coordinates.trans ? [['trans', 'trans', undefined, 'Transmission']] : []),
].map(([id, branch, node, label]) => {
  const [x, y] = coordinates[id as string];
  return { id, branch, ...(node ? { node } : {}), label, x, y, status: 'unavailable', statusDetail: 'Service evidence unavailable', ...overrides[id as string] } as TwinHotspot;
});

const opaque = (root: string) => ({
  wheel: `${root}/glow-wheel-${root.includes('lincoln') ? 'gray' : root.includes('murano') ? 'red' : 'satin-steel'}.webp`,
  rearwheel: `${root}/glow-rearwheel-${root.includes('lincoln') ? 'gray' : root.includes('murano') ? 'red' : 'satin-steel'}.webp`,
  hood: `${root}/glow-hood-${root.includes('lincoln') ? 'gray' : root.includes('murano') ? 'red' : 'satin-steel'}.webp`,
  rad: `${root}/xray-radiator-${root.includes('lincoln') ? 'gray' : root.includes('murano') ? 'red' : 'satin-steel'}.webp`,
});

const masks = {
  wheel: 'ellipse(18% 25% at 42% 66%)', rearwheel: 'ellipse(16% 24% at 20% 64%)',
  hood: 'ellipse(29% 18% at 65% 39%)', rad: 'ellipse(23% 23% at 70% 53%)',
};

export const VEHICLE_TWIN_CATALOG: readonly VehicleTwinCatalogEntry[] = [
  {
    id: 'challenger', fulfillmentId: 'dodge-challenger', ownerReady: true,
    identity: { year: 2015, make: 'Dodge', model: 'Challenger', trim: 'SRT 392', engine: '6.4L V8 HEMI', paint: 'Granite Crystal' },
    demoMileage: 65000, treeResolver: 'challenger', treeStatus: 'fitment-reviewed',
    sampleState: { label:'Sample demo state', records:[
      {node:'oilFluid',label:'Engine oil',lastServiceMileage:54000,intervalMiles:6000,intervalSource:'2015 Dodge Challenger Owner\'s Manual',sourceUrl:'https://vehicleinfo.mopar.com/assets/publications/en-us/Dodge/2015/Challenger/1037.pdf',sourceSection:'Maintenance Chart — 6.4L, pp. 565–569'},
      {node:'oilFilter',label:'Oil filter',lastServiceMileage:54000,intervalMiles:6000,intervalSource:'2015 Dodge Challenger Owner\'s Manual',sourceUrl:'https://vehicleinfo.mopar.com/assets/publications/en-us/Dodge/2015/Challenger/1037.pdf',sourceSection:'Maintenance Chart — 6.4L, pp. 565–569'},
      {node:'transFluid',label:'Automatic transmission fluid',lastServiceMileage:0,intervalMiles:60000,intervalSource:'Au7o verified maintenance schedule · 2015 Challenger automatic severe-use branch',sourceUrl:'https://www.mopar.com/dodge/en-us/my-vehicle/maintenance-schedule.html',sourceSection:'ZF 8HP70 transmission service'},
    ]},
    art: { available: true, base: '/twin-stage/challenger/base-granite-crystal.webp', xray:'/twin-stage/car-xray.webp', strategy: 'alpha-overlay', effects: {
      wheel: '/twin-stage/challenger/glow-wheel-granite-crystal.webp', rearwheel: '/twin-stage/challenger/glow-rearwheel-granite-crystal.webp',
      hood: '/twin-stage/challenger/glow-hood-granite-crystal.webp', rad: '/twin-stage/challenger/glow-radiator-granite-crystal.webp',
    } },
    hotspots: standardHotspots({ wheel:[39.6,65.5], hood:[61,42], glass:[44,29], rearwheel:[20.5,52.5], rad:[67,58.5], trans:[54,60] }, {
      wheel:{status:'known-issue',statusDetail:'Published brake issue · no sample service event logged',knownIssueIds:['dodge-challenger-warped-front-brake-rotors-causing-pedal-pulsation-steering-s']},
      hood:{status:'overdue',statusDetail:'Service overdue on demo mileage'},
      rad:{status:'known-issue',statusDetail:'Published cooling-system issue',knownIssueIds:['dodge-challenger-radiator-failure']},
      rearwheel:{status:'unlogged',statusDetail:'No sample service event logged'},
      glass:{status:'unlogged',statusDetail:'No sample service event logged'},
      trans:{status:'known-issue',statusDetail:'Published transmission issue · sample service overdue',knownIssueIds:['dodge-challenger-zf8-trans-2015']},
    }), systems: systems(true),
  },
  {
    id:'nautilus', fulfillmentId:null, ownerReady:false,
    identity:{year:2019,make:'Lincoln',model:'Nautilus',trim:'Standard',engine:'2.0L EcoBoost I4',paint:'Magnetic Grey'}, demoMileage:42000,
    sampleState:{label:'Sample demo state',records:[
      {node:'oil',label:'Engine oil',lastServiceMileage:35000,intervalMiles:10000,intervalSource:'2019 Lincoln Nautilus Owner\'s Manual',sourceUrl:'https://cdn.dealereprocess.org/cdn/servicemanuals/lincoln/2019-nautilus.pdf',sourceSection:'Scheduled Maintenance, pp. 543–548'},
      {node:'tire',label:'Tire rotation',lastServiceMileage:30000,intervalMiles:10000,intervalSource:'2019 Lincoln Nautilus Owner\'s Manual',sourceUrl:'https://cdn.dealereprocess.org/cdn/servicemanuals/lincoln/2019-nautilus.pdf',sourceSection:'Normal Scheduled Maintenance'},
      {node:'airFilter',label:'Engine air filter',lastServiceMileage:18000,intervalMiles:30000,intervalSource:'2019 Lincoln Nautilus Owner\'s Manual',sourceUrl:'https://cdn.dealereprocess.org/cdn/servicemanuals/lincoln/2019-nautilus.pdf',sourceSection:'Other maintenance items'},
      {node:'transFluid',label:'Automatic transmission fluid',lastServiceMileage:0,intervalMiles:150000,intervalSource:'2019 Lincoln Nautilus Owner\'s Manual',sourceUrl:'https://cdn.dealereprocess.org/cdn/servicemanuals/lincoln/2019-nautilus.pdf',sourceSection:'Normal Scheduled Maintenance'},
    ]},
    treeResolver:'nautilus',treeStatus:'model-specific',
    art:{available:true,base:'/twin-stage/lincoln/base-gray.webp',effects:opaque('/twin-stage/lincoln'),strategy:'opaque-masked',masks},
    hotspots:standardHotspots({wheel:[42,65],hood:[65,39],glass:[48,29],rearwheel:[18,64],rad:[70,53],trans:[55,59]}, {
      wheel:{status:'overdue',statusDetail:'Sample tire rotation overdue'},
      hood:{status:'on-track',statusDetail:'Sample oil service on track'},
      rearwheel:{status:'overdue',statusDetail:'Sample tire rotation overdue'},
      rad:{status:'known-issue',statusDetail:'Published cooling-system issue',knownIssueIds:['lincoln-nautilus-2-0l-ecoboost-coolant-loss-egr-cooler-leak-low-coolant-white']},
      trans:{status:'known-issue',statusDetail:'Published transmission issue · sample service on track',knownIssueIds:['lincoln-nautilus-8f35-8-speed-automatic-shudder-buck-jerk-under-35-mph']},
      glass:{status:'unlogged',statusDetail:'No sample service event logged'},
    }),systems:systems(true),
  },
  {
    id:'murano',fulfillmentId:null,ownerReady:false,
    identity:{year:2023,make:'Nissan',model:'Murano',trim:'SV',engine:'3.5L V6',paint:'Scarlet Ember'},demoMileage:24000,
    sampleState:{label:'Sample demo state',records:[
      {node:'oil',label:'Engine oil',lastServiceMileage:20000,intervalMiles:7500,intervalSource:'2023 Nissan Murano Maintenance Schedule',sourceUrl:'https://maintenance-schedules.nissanusa.com/maintenance-schedules/2023/murano/components/',sourceSection:'Engine oil and filter · standard conditions'},
      {node:'tire',label:'Tire rotation',lastServiceMileage:15000,intervalMiles:7500,intervalSource:'2023 Nissan Murano Maintenance Schedule',sourceUrl:'https://maintenance-schedules.nissanusa.com/maintenance-schedules/2023/murano/components/tires/',sourceSection:'Rotate every 7,500 miles or 6 months'},
      {node:'airFilter',label:'Engine air filter',lastServiceMileage:0,intervalMiles:30000,intervalSource:'2023 Nissan Murano Maintenance Schedule',sourceUrl:'https://maintenance-schedules.nissanusa.com/maintenance-schedules/2023/murano/components/',sourceSection:'Engine air filter'},
      {node:'transFluid',label:'CVT fluid',lastServiceMileage:0,intervalMiles:60000,intervalSource:'2023 Nissan Murano Owner\'s Manual',sourceUrl:'https://www.nissanusa.com/content/dam/Nissan/us/manuals-and-guides/murano/2023/2023-nissan-murano-owner-manual.pdf',sourceSection:'Conditional severe/towing CVT replacement branch'},
    ]},
    treeResolver:'murano',treeStatus:'model-specific',
    art:{available:true,base:'/twin-stage/murano/base-red.webp',effects:opaque('/twin-stage/murano'),strategy:'opaque-masked',masks},
    hotspots:standardHotspots({wheel:[43,65],hood:[64,36],glass:[48,27],rearwheel:[19,64],rad:[70,53],trans:[55,59]}, {
      wheel:{status:'overdue',statusDetail:'Sample tire rotation overdue'},rearwheel:{status:'overdue',statusDetail:'Sample tire rotation overdue'},
      hood:{status:'on-track',statusDetail:'Sample oil service on track'},trans:{status:'on-track',statusDetail:'Sample CVT service on track'},
      glass:{status:'unlogged',statusDetail:'No sample service event logged'},rad:{status:'unlogged',statusDetail:'No sample service event logged'},
    }),systems:systems(true),
  },
  {
    id:'xt6',fulfillmentId:null,ownerReady:false,
    identity:{year:2020,make:'Cadillac',model:'XT6',trim:'Sport',engine:'3.6L V6',paint:'Satin Steel Metallic'},demoMileage:52000,
    sampleState:{label:'Sample demo state',records:[
      {node:'oil',label:'Engine oil',lastServiceMileage:45000,intervalMiles:7500,intervalSource:'2020 Cadillac XT6 Owner\'s Manual',sourceUrl:'https://www.cadillac.com/support/vehicle/manuals-guides',sourceSection:'Maintenance Schedule · 7,500-mile services'},
      {node:'tire',label:'Tire rotation',lastServiceMileage:37500,intervalMiles:7500,intervalSource:'2020 Cadillac XT6 Owner\'s Manual',sourceUrl:'https://www.cadillac.com/support/vehicle/manuals-guides',sourceSection:'Maintenance Schedule · 7,500-mile services'},
    ]},
    treeResolver:'xt6',treeStatus:'model-specific',
    art:{available:true,base:'/twin-stage/cadillac/base-satin-steel.webp',effects:opaque('/twin-stage/cadillac'),strategy:'opaque-masked',masks},
    hotspots:standardHotspots({wheel:[43,66],hood:[65,38],glass:[48,28],rearwheel:[20,64],rad:[70,53],trans:[55,59]}, {
      wheel:{status:'overdue',statusDetail:'Sample tire rotation overdue'},rearwheel:{status:'overdue',statusDetail:'Sample tire rotation overdue'},
      hood:{node:undefined,status:'known-issue',statusDetail:'Published engine issue · sample oil service on track',knownIssueIds:['cadillac-xt6-timing-chain-2020']},
      trans:{status:'known-issue',statusDetail:'Published transmission issue · no sample fluid service event logged',knownIssueIds:['cadillac-xt6-9speed-transmission-2020']},
      glass:{status:'unlogged',statusDetail:'No sample service event logged'},rad:{status:'unlogged',statusDetail:'No sample service event logged'},
    }),systems:systems(true),
  },
] as const;

export const DEFAULT_TWIN_ID = 'challenger';
export function resolveDemoVehicleTwin(id: string | null | undefined) {
  return VEHICLE_TWIN_CATALOG.find((twin) => twin.id === id) ?? VEHICLE_TWIN_CATALOG[0];
}
export function getTwinByFulfillmentId(id: string | null | undefined) {
  if (!id) return null;
  return VEHICLE_TWIN_CATALOG.find((twin) => twin.fulfillmentId === id) ?? null;
}
export function resolveTwinDeepLink(
  twin: VehicleTwinCatalogEntry,
  id: string | null | undefined,
  trees?: Record<string, { nodes: Record<string, unknown> }>,
) {
  if (id === 'car') {
    return !trees || trees.car
      ? { hotspot: 'car', branch: 'car', node: null }
      : { hotspot: null, branch: null, node: null };
  }
  const hotspot = twin.hotspots.find((entry) => entry.id === id);
  if (!hotspot) return { hotspot: null, branch: null, node: null };
  const tree = trees?.[hotspot.branch];
  if (trees && (!tree || (hotspot.node && !tree.nodes[hotspot.node]))) {
    return { hotspot: null, branch: null, node: null };
  }
  return { hotspot: hotspot.id, branch: hotspot.branch, node: hotspot.node ?? null };
}
export function getAdminTwinDefinitions() {
  return VEHICLE_TWIN_CATALOG.map(({ id, identity, demoMileage, sampleState, ownerReady, treeStatus, fulfillmentId, art, hotspots, systems }) => ({ id, identity, demoMileage, sampleState, ownerReady, treeStatus, fulfillmentId, art, hotspots, systems }));
}
export function validateVehicleTwinCatalog(): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const twin of VEHICLE_TWIN_CATALOG) {
    if (ids.has(twin.id)) errors.push(`duplicate ${twin.id}`); ids.add(twin.id);
    const hotspotIds = new Set(twin.hotspots.map((hotspot) => hotspot.id));
    for (const system of twin.systems) if (!hotspotIds.has(system.hot)) errors.push(`${twin.id}/${system.hot} inert system`);
    if (twin.treeStatus === 'structure-only' && twin.hotspots.some((hotspot) => hotspot.status !== 'unavailable')) errors.push(`${twin.id} claims evidence`);
    for (const record of twin.sampleState.records) {
      if (!record.node || record.intervalMiles <= 0 || record.lastServiceMileage < 0 || (twin.demoMileage != null && record.lastServiceMileage > twin.demoMileage)) errors.push(`${twin.id}/${record.node || 'unknown'} invalid sample record`);
      if (!record.intervalSource || !record.sourceUrl || !record.sourceSection) errors.push(`${twin.id}/${record.node} missing service provenance`);
    }
    const issueIds = twin.hotspots.flatMap((hotspot) => hotspot.knownIssueIds || []);
    if (new Set(issueIds).size !== issueIds.length) errors.push(`${twin.id} duplicate issue mapping`);
  }
  return errors;
}
