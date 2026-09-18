import { REVIEWED_OWNER_EQUIPMENT } from './twin-owner-equipment';
import { VEHICLE_TWIN_CATALOG } from './vehicle-twin-catalog';

export const KNOWN_ISSUE_TWIN_PILOT = {
  slug: 'cadillac-xt6',
  year: 2020,
  twinId: 'xt6',
  sessionKey: 'au7o:known-issue-twin:cadillac-xt6:2020:viewed',
} as const;

export type KnownIssueTwinHotspotId = 'hood' | 'trans' | 'wheel' | 'rearwheel' | 'rad' | 'glass' | 'cooling' | 'steering' | 'camera' | 'roof' | 'assistance' | 'fuel';

export const KNOWN_ISSUE_TWIN_EFFECTS: Partial<Record<KnownIssueTwinHotspotId, {
  src?: string;
  backgroundImage?: string;
  fallbackBackgroundImage?: string;
  maskImage: string;
  /** Generated RGB fills must be clipped through the original vehicle alpha,
   * in addition to the local system mask. Never display these standalone. */
  clipToVehicle?: boolean;
}>> = {
  // These broad glows identify systems, not the exact internal failed part.
  cooling: {
    // User-requested cooling-system reveal, not a diagnosis of radiator failure.
    src: '/twin-stage/cadillac/known-issues/xray-radiator-satin-steel-transparent.webp',
    fallbackBackgroundImage: 'linear-gradient(rgba(34,211,238,.7), rgba(34,211,238,.7))',
    maskImage: 'radial-gradient(ellipse 17% 16% at 77% 59%, black 65%, transparent 100%)',
  },
  steering: {
    backgroundImage: 'radial-gradient(ellipse 12% 9% at 52% 61%, rgba(34,211,238,.85), rgba(34,211,238,.35) 55%, transparent 90%)',
    maskImage: 'radial-gradient(ellipse 13% 10% at 52% 61%, black 50%, transparent 100%)',
  },
  camera: {
    backgroundImage: 'radial-gradient(ellipse 13% 9% at 49% 37%, rgba(167,139,250,.85), rgba(167,139,250,.35) 55%, transparent 90%)',
    maskImage: 'radial-gradient(ellipse 14% 10% at 49% 37%, black 50%, transparent 100%)',
  },
  roof: {
    src: '/twin-stage/cadillac/known-issues/glow-roof-apillars-satin-steel.webp',
    fallbackBackgroundImage: 'linear-gradient(rgba(167,139,250,.7), rgba(167,139,250,.7))',
    clipToVehicle: true,
    // Roof perimeter and both windshield-side A-pillars, without hood bleed.
    maskImage: 'radial-gradient(ellipse 33% 6% at 43% 19%, black 65%, transparent 100%), radial-gradient(ellipse 7% 14% at 36% 28%, black 65%, transparent 100%), radial-gradient(ellipse 11% 12% at 68% 29%, black 65%, transparent 100%)',
  },
  // Only reveal a local interior of the aligned transparent asset family.
  // The master remains visible elsewhere: no whole-car crossfade/resize.
  hood: {
    src: '/twin-stage/cadillac/known-issues/glow-hood-satin-steel-transparent.webp',
    maskImage: 'radial-gradient(ellipse 27% 9% at 65% 43%, black 50%, transparent 100%)',
  },
  wheel: {
    src: '/twin-stage/cadillac/known-issues/glow-wheel-satin-steel-transparent.webp',
    maskImage: 'radial-gradient(ellipse 9% 17% at 42% 71%, black 60%, transparent 100%)',
  },
  rearwheel: {
    src: '/twin-stage/cadillac/known-issues/glow-rearwheel-satin-steel-transparent.webp',
    maskImage: 'radial-gradient(ellipse 6% 13% at 12% 64%, black 60%, transparent 100%)',
  },
  rad: {
    src: '/twin-stage/cadillac/known-issues/xray-radiator-satin-steel-transparent.webp',
    maskImage: 'radial-gradient(ellipse 17% 16% at 77% 59%, black 65%, transparent 100%)',
  },
  trans: {
    // Intact-body area illumination only. The older bumper gearbox raster
    // remains excluded; this does not claim an exact internal part location.
    src: '/twin-stage/cadillac/known-issues/glow-drivetrain-area-satin-steel.webp',
    fallbackBackgroundImage: 'linear-gradient(rgba(251,191,36,.7), rgba(251,191,36,.7))',
    clipToVehicle: true,
    maskImage: 'radial-gradient(ellipse 10% 14% at 48% 51%, black 60%, transparent 100%)',
  },
};

/** Coordinates belong to the 1536x1024 transparent master, not the Hub's
 * differently framed studio image. Issue-to-system mapping stays catalog-owned. */
export const KNOWN_ISSUE_TWIN_POSITIONS: Partial<Record<KnownIssueTwinHotspotId, { x: number; y: number }>> = {
  hood: { x: 73, y: 42 }, trans: { x: 57, y: 57 }, rad: { x: 82, y: 62 },
  wheel: { x: 42, y: 71 }, rearwheel: { x: 12, y: 64 }, glass: { x: 58, y: 32 },
  cooling: { x: 82, y: 57 }, steering: { x: 48, y: 64 }, camera: { x: 53, y: 37 }, roof: { x: 31, y: 25 },
};

/** Phone display anchors only. Leaders retain the reviewed physical locations
 * above; artwork and reveal masks never move to accommodate controls. */
export const KNOWN_ISSUE_TWIN_PHONE_ANCHORS: Partial<Record<KnownIssueTwinHotspotId, { x: number; y: number }>> = {
  roof: { x: 27, y: 18 }, camera: { x: 52, y: 32 }, hood: { x: 78, y: 34 },
  steering: { x: 32, y: 72 }, trans: { x: 57, y: 68 }, cooling: { x: 84, y: 75 },
};

export interface KnownIssueTwinVisualDefinition {
  slug: string; year: number; twinId: string; equipmentId: string;
  identity: {year:number; make:string; model:string; trim:string; engine:string};
  base: string; width: number; height: number; configuration: string;
  sessionKey: string; returnPath: string;
  positions: Partial<Record<KnownIssueTwinHotspotId,{x:number;y:number}>>;
  phoneAnchors: Partial<Record<KnownIssueTwinHotspotId,{x:number;y:number}>>;
  effects: typeof KNOWN_ISSUE_TWIN_EFFECTS;
  mappings: Record<string,KnownIssueTwinHotspotId>;
  labels: Partial<Record<KnownIssueTwinHotspotId,string>>;
}
const baseDefinition = (id:string) => {
  const profile=REVIEWED_OWNER_EQUIPMENT.find(row=>row.catalogId===id)!;
  const {year,make,model,trim,engine}=profile;
  return {slug:profile.fulfillmentId,year,twinId:id,equipmentId:profile.id,identity:{year,make,model,trim,engine},
    configuration:`Reviewed configuration: ${year} ${make} ${model} ${trim} · ${profile.details}. Other equipment is not represented.`,
    sessionKey:`au7o:known-issue-twin:${profile.fulfillmentId}:${year}:viewed`,
    returnPath:`/known-issues/${profile.fulfillmentId}?year=${year}&twinPilot=1`};
};
const xt6Catalog=VEHICLE_TWIN_CATALOG.find(row=>row.id==='xt6')!;
export const XT6_KNOWN_ISSUE_VISUAL: KnownIssueTwinVisualDefinition = {
  ...baseDefinition('xt6'), base:'/twin-stage/cadillac/known-issues/base-satin-steel-transparent.webp',width:1536,height:1024,
  positions:KNOWN_ISSUE_TWIN_POSITIONS,phoneAnchors:KNOWN_ISSUE_TWIN_PHONE_ANCHORS,effects:KNOWN_ISSUE_TWIN_EFFECTS,labels:{},
  mappings:Object.fromEntries([...xt6Catalog.hotspots,...(xt6Catalog.knownIssueHotspots||[])].flatMap(area=>(area.knownIssueIds||[]).map(id=>[id,area.id as KnownIssueTwinHotspotId]))),
};
// Each row is measured against its own 1672×941 master. These are affected
// system areas, not claims that an internal failed component is visible.
function sibling(id:string,folder:string,color:string,positions:KnownIssueTwinVisualDefinition['positions'],
  phoneAnchors:KnownIssueTwinVisualDefinition['phoneAnchors'],mappings:KnownIssueTwinVisualDefinition['mappings'],
  labels:KnownIssueTwinVisualDefinition['labels']):KnownIssueTwinVisualDefinition {
  const dir=`/twin-stage/${folder}/known-issues`;
  const effects:KnownIssueTwinVisualDefinition['effects']={};
  for(const key of new Set(Object.values(mappings))) {
    const point=positions[key]!;
    const radius=key==='hood'?[20,9]:key==='glass'?[17,12]:key==='fuel'?[10,13]:[12,11];
    effects[key]={backgroundImage:'linear-gradient(rgba(139,92,246,.65),rgba(139,92,246,.65))',
      maskImage:`radial-gradient(ellipse ${radius[0]}% ${radius[1]}% at ${point.x}% ${point.y}%, black 50%, transparent 100%)`};
    // Only engine-bay issues use the existing hood reveal. An ADAS issue is
    // never represented by a radiator raster, nor fuel-pump by an engine.
    if(key==='hood') effects[key]={...effects[key],src:`${dir}/glow-hood-${color}-transparent.webp`,backgroundImage:undefined,
      fallbackBackgroundImage:'linear-gradient(rgba(139,92,246,.65),rgba(139,92,246,.65))'};
  }
  return {...baseDefinition(id),base:`${dir}/base-${color}-transparent.webp`,width:1672,height:941,positions,phoneAnchors,effects,mappings,labels};
}
export const KNOWN_ISSUE_TWIN_VISUALS: readonly KnownIssueTwinVisualDefinition[] = [
  sibling('nautilus','lincoln','gray',{hood:{x:66,y:39},trans:{x:53,y:54},glass:{x:51,y:28}},
    {hood:{x:77,y:32},trans:{x:51,y:70},glass:{x:39,y:20}},{
      'lincoln-nautilus-2-0l-ecoboost-coolant-loss-egr-cooler-leak-low-coolant-white':'hood',
      'lincoln-nautilus-8f35-8-speed-automatic-shudder-buck-jerk-under-35-mph':'trans',
      'lincoln-nautilus-auto-start-stop-malfunction-engine-won-t-auto-restart':'hood',
      'lincoln-nautilus-rearview-camera-software-error-blank-image-image-that-won-t':'glass',
      'lincoln-nautilus-sync-3-apim-infotainment-freezes-black-screens-reboots':'glass',
    },{hood:'Engine bay and EGR cooling',glass:'Camera display and cabin electronics'}),
  sibling('murano','murano','red',{hood:{x:65,y:38},glass:{x:51,y:27},assistance:{x:76,y:49}},
    {hood:{x:65,y:21},glass:{x:35,y:23},assistance:{x:81,y:64}},{
      'nissan-murano-battery-drain-and-no-start-2021':'hood',
      'nissan-murano-front-driver-seat-frametrack-2021':'glass',
      'nissan-murano-front-radarsensor-malfunctions-triggering-2021':'assistance',
      'nissan-murano-rearview-camera-image-blank-2021':'glass',
      'nissan-murano-automatic-emergency-braking-forward-collision-phantom-activa':'assistance',
    },{hood:'Battery and engine starting',glass:'Seats, display and cabin electronics',assistance:'Front driver-assistance sensors'}),
  XT6_KNOWN_ISSUE_VISUAL,
  sibling('kicks','kicks','gun-metallic',{glass:{x:50,y:27}}, {glass:{x:50,y:20}},{
      'nissan-kicks-blank-partial-instrument-cluster-cold-start':'glass',
      'nissan-kicks-center-display-goes-blank-reverse-no-backup-camera-image':'glass',
      'nissan-kicks-infotainment-touchscreen-freezing-rebooting-carplay-disconne':'glass',
    },{glass:'Instrument cluster and cabin displays'}),
  sibling('mdx','acura-mdx','lunar-silver',{hood:{x:69,y:38},trans:{x:55,y:53},glass:{x:51,y:25},fuel:{x:24,y:44}},
    {hood:{x:81,y:29},trans:{x:59,y:70},glass:{x:49,y:16},fuel:{x:21,y:52}},{
      'acura-mdx-auto-idle-stop-failure-to-restart':'hood',
      'acura-mdx-fuel-pump-impeller-deformation-causing-stall':'fuel',
      'acura-mdx-infotainment-reboot-2014':'glass',
      'acura-mdx-torque-converter-shudder-2014':'trans',
      'acura-mdx-zf-9-speed-transmission-hesitation-hard-shifts-stalling':'trans',
    },{hood:'Engine starting and Idle-Stop',fuel:'Fuel delivery system — tank area',glass:'Infotainment and cabin electronics'}),
  sibling('aviator','lincoln-aviator','red-carpet',{}, {},{},{}),
];
export function resolveKnownIssueTwinVisual(slug:string,year?:number,selection?:{trim?:string;engine?:string}) {
  return KNOWN_ISSUE_TWIN_VISUALS.find(row=>row.slug===slug&&(year==null||row.year===year)
    &&(!selection?.trim||selection.trim.toLowerCase()===row.identity.trim.toLowerCase())
    &&(!selection?.engine||selection.engine.toLowerCase()===row.identity.engine.toLowerCase()))??null;
}
