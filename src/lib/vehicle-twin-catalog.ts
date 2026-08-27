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

export interface VehicleTwinCatalogEntry {
  id: string;
  fulfillmentId: string | null;
  identity: { year: number; make: string; model: string; trim: string; engine: string; paint: string };
  demoMileage: number | null;
  treeResolver: string;
  treeStatus: 'fitment-reviewed' | 'model-specific' | 'structure-only';
  ownerReady: boolean;
  art: {
    available: boolean;
    base: string;
    effects: Record<string, string>;
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
  ['airbox', 'engine', 'airFilter', 'Engine Air Filter'],
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
    art: { available: true, base: '/twin-stage/challenger/base-granite-crystal.webp', strategy: 'alpha-overlay', effects: {
      wheel: '/twin-stage/challenger/glow-wheel-granite-crystal.webp', rearwheel: '/twin-stage/challenger/glow-rearwheel-granite-crystal.webp',
      hood: '/twin-stage/challenger/glow-hood-granite-crystal.webp', rad: '/twin-stage/challenger/glow-radiator-granite-crystal.webp',
    } },
    hotspots: standardHotspots({ wheel:[39.6,65.5], hood:[61,42], glass:[44,29], rearwheel:[20.5,52.5], rad:[67,58.5], airbox:[78.5,42.5], trans:[54,60] }, {
      wheel:{status:'known-issue',statusDetail:'Known issue on record',knownIssueIds:['challenger-swollen-lug-nuts']},
      hood:{status:'overdue',statusDetail:'Service overdue on demo mileage'},
      rad:{status:'known-issue',statusDetail:'Known issue on record',knownIssueIds:['challenger-radiator-end-tank']},
      rearwheel:{status:'overdue',statusDetail:'Service overdue on demo mileage'},
      glass:{status:'overdue',statusDetail:'Service overdue on demo mileage'}, airbox:{status:'overdue',statusDetail:'Service overdue on demo mileage'},
      trans:{status:'overdue',statusDetail:'Service overdue on demo mileage'},
    }), systems: systems(true),
  },
  {
    id:'nautilus', fulfillmentId:null, ownerReady:false,
    identity:{year:2019,make:'Lincoln',model:'Nautilus',trim:'Standard',engine:'Unavailable',paint:'Magnetic Grey'}, demoMileage:null,
    treeResolver:'nautilus',treeStatus:'structure-only',
    art:{available:true,base:'/twin-stage/lincoln/base-gray.webp',effects:opaque('/twin-stage/lincoln'),strategy:'opaque-masked',masks},
    hotspots:standardHotspots({wheel:[42,65],hood:[65,39],glass:[48,29],rearwheel:[18,64],rad:[70,53],airbox:[77,42]}),systems:systems(false),
  },
  {
    id:'murano',fulfillmentId:null,ownerReady:false,
    identity:{year:2023,make:'Nissan',model:'Murano',trim:'SV',engine:'3.5L V6',paint:'Scarlet Ember'},demoMileage:24000,
    treeResolver:'murano',treeStatus:'model-specific',
    art:{available:true,base:'/twin-stage/murano/base-red.webp',effects:opaque('/twin-stage/murano'),strategy:'opaque-masked',masks},
    hotspots:standardHotspots({wheel:[43,65],hood:[64,36],glass:[48,27],rearwheel:[19,64],rad:[70,53],airbox:[77,40],trans:[55,59]}, {
      hood:{status:'known-issue',statusDetail:'Known issue on record',knownIssueIds:['murano-cvt-judder']},
      trans:{status:'known-issue',statusDetail:'Known issue on record',knownIssueIds:['murano-cvt-judder']},
      wheel:{status:'unlogged',statusDetail:'No service event logged'},rearwheel:{status:'unlogged',statusDetail:'No service event logged'},
      glass:{status:'unlogged',statusDetail:'No service event logged'},rad:{status:'unlogged',statusDetail:'No service event logged'},airbox:{status:'unlogged',statusDetail:'No service event logged'},
    }),systems:systems(true),
  },
  {
    id:'xt6',fulfillmentId:null,ownerReady:false,
    identity:{year:2020,make:'Cadillac',model:'XT6',trim:'Sport',engine:'Unavailable',paint:'Satin Steel Metallic'},demoMileage:null,
    treeResolver:'xt6',treeStatus:'structure-only',
    art:{available:true,base:'/twin-stage/cadillac/base-satin-steel.webp',effects:opaque('/twin-stage/cadillac'),strategy:'opaque-masked',masks},
    hotspots:standardHotspots({wheel:[43,66],hood:[65,38],glass:[48,28],rearwheel:[20,64],rad:[70,53],airbox:[77,41]}),systems:systems(false),
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
  return VEHICLE_TWIN_CATALOG.map(({ id, identity, ownerReady, treeStatus, fulfillmentId, art, hotspots }) => ({ id, identity, ownerReady, treeStatus, fulfillmentId, art, hotspots }));
}
export function validateVehicleTwinCatalog(): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const twin of VEHICLE_TWIN_CATALOG) {
    if (ids.has(twin.id)) errors.push(`duplicate ${twin.id}`); ids.add(twin.id);
    const hotspotIds = new Set(twin.hotspots.map((hotspot) => hotspot.id));
    for (const system of twin.systems) if (!hotspotIds.has(system.hot)) errors.push(`${twin.id}/${system.hot} inert system`);
    if (twin.treeStatus === 'structure-only' && twin.hotspots.some((hotspot) => hotspot.status !== 'unavailable')) errors.push(`${twin.id} claims evidence`);
  }
  return errors;
}
