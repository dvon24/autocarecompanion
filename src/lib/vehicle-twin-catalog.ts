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
  paintPalette: {
    sourceLabel: string;
    sourceUrl: string;
    colors: readonly { name: string; swatch: string; artStatus: 'rendered' | 'awaiting-art' }[];
  };
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
  ...(includeTransmission ? [{ hot: 'trans', branch: 'trans', label: 'Transmission & Driveline', img: '/twin-stage/parts/part-transmission.webp' }] : []),
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
const challengerMasks = {
  wheel: 'ellipse(17% 25% at 44% 65%)', rearwheel: 'ellipse(14% 23% at 21% 55%)',
  hood: 'ellipse(31% 20% at 64% 40%)', rad: 'ellipse(29% 30% at 69% 50%)',
};
const generatedArt = (root: string, paintSlug: string) => ({
  available:true,base:`${root}/base-${paintSlug}.webp`,strategy:'opaque-masked' as const,masks,
  effects:{wheel:`${root}/glow-wheel-${paintSlug}.webp`,rearwheel:`${root}/glow-rearwheel-${paintSlug}.webp`,hood:`${root}/glow-hood-${paintSlug}.webp`,rad:`${root}/xray-radiator-${paintSlug}.webp`},
});

export const VEHICLE_TWIN_CATALOG: readonly VehicleTwinCatalogEntry[] = [
  {
    id: 'challenger', fulfillmentId: 'dodge-challenger', ownerReady: true,
    identity: { year: 2015, make: 'Dodge', model: 'Challenger', trim: 'SRT 392', engine: '6.4L V8 HEMI', paint: 'Granite Crystal Metallic' },
    demoMileage: 65000, treeResolver: 'challenger', treeStatus: 'fitment-reviewed',
    paintPalette:{sourceLabel:'2015 Dodge Challenger brochure · Color Choices',sourceUrl:'https://www.dodge.com/assets/pdf/brochure/2015challenger.pdf',colors:[
      {name:'Sublime Green',swatch:'#79A83B',artStatus:'awaiting-art'},{name:'Billet Silver Metallic',swatch:'#ADB2B6',artStatus:'awaiting-art'},
      {name:'Ivory Tri-Coat Pearl',swatch:'#E8E1D2',artStatus:'awaiting-art'},{name:'TorRed',swatch:'#B32631',artStatus:'awaiting-art'},
      {name:'Phantom Black Tri-Coat Pearl',swatch:'#202126',artStatus:'awaiting-art'},{name:'Redline Red Tri-Coat Pearl',swatch:'#7D2030',artStatus:'awaiting-art'},
      {name:'Bright White',swatch:'#F3F2EC',artStatus:'awaiting-art'},{name:'B5 Blue Pearl',swatch:'#3679A7',artStatus:'awaiting-art'},
      {name:'Granite Crystal Metallic',swatch:'#666A6E',artStatus:'rendered'},{name:'Jazz Blue Pearl',swatch:'#243A59',artStatus:'awaiting-art'},
      {name:'Pitch Black',swatch:'#111216',artStatus:'awaiting-art'},
    ]},
    sampleState: { label:'Sample demo state', records:[
      {node:'oilFluid',label:'Engine oil',lastServiceMileage:54000,intervalMiles:6000,intervalSource:'2015 Dodge Challenger Owner\'s Manual',sourceUrl:'https://vehicleinfo.mopar.com/assets/publications/en-us/Dodge/2015/Challenger/1037.pdf',sourceSection:'Maintenance Chart — 6.4L, pp. 565–569'},
      {node:'oilFilter',label:'Oil filter',lastServiceMileage:54000,intervalMiles:6000,intervalSource:'2015 Dodge Challenger Owner\'s Manual',sourceUrl:'https://vehicleinfo.mopar.com/assets/publications/en-us/Dodge/2015/Challenger/1037.pdf',sourceSection:'Maintenance Chart — 6.4L, pp. 565–569'},
      {node:'transFluid',label:'Automatic transmission fluid',lastServiceMileage:0,intervalMiles:60000,intervalSource:'Au7o verified maintenance schedule · 2015 Challenger automatic severe-use branch',sourceUrl:'https://www.mopar.com/dodge/en-us/my-vehicle/maintenance-schedule.html',sourceSection:'ZF 8HP70 transmission service'},
    ]},
    art: { available: true, base: '/twin-stage/challenger/base-granite-crystal.webp', xray:'/twin-stage/car-xray.webp', strategy: 'opaque-masked', masks: challengerMasks, effects: {
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
    identity:{year:2019,make:'Lincoln',model:'Nautilus',trim:'Standard',engine:'2.0L EcoBoost I4',paint:'Magnetic Gray Metallic'}, demoMileage:42000,
    paintPalette:{sourceLabel:'2019 Lincoln Nautilus order guide · Color & Trim Availability',sourceUrl:'https://www.blueovalforums.com/forums/applications/core/interface/file/attachment.php?id=16393',colors:[
      {name:'Infinite Black Metallic',swatch:'#16181B',artStatus:'awaiting-art'},{name:'White Platinum Metallic Tri-coat',swatch:'#E7E5DE',artStatus:'awaiting-art'},
      {name:'Ingot Silver Metallic',swatch:'#A9ADB0',artStatus:'awaiting-art'},{name:'Magnetic Gray Metallic',swatch:'#62676B',artStatus:'rendered'},
      {name:'Ruby Red Metallic Tinted Clearcoat',swatch:'#7E1D2A',artStatus:'awaiting-art'},{name:'Ochre Brown Metallic',swatch:'#655244',artStatus:'awaiting-art'},
      {name:'Ceramic Pearl Metallic Tri-coat',swatch:'#D9D3C6',artStatus:'awaiting-art'},{name:'Burgundy Velvet Metallic Tinted Clearcoat',swatch:'#4B2029',artStatus:'awaiting-art'},
      {name:'Iced Mocha Metallic',swatch:'#75675D',artStatus:'awaiting-art'},{name:'Blue Diamond Metallic',swatch:'#263A54',artStatus:'awaiting-art'},
      {name:'Rhapsody Blue',swatch:'#182B43',artStatus:'awaiting-art'},
    ]},
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
      hood:{node:'hoodRoot',status:'known-issue',statusDetail:'Published engine/start-stop issue · sample oil service on track',knownIssueIds:['lincoln-nautilus-auto-start-stop-malfunction-engine-won-t-auto-restart']},
      rearwheel:{status:'overdue',statusDetail:'Sample tire rotation overdue'},
      rad:{status:'known-issue',statusDetail:'Published cooling-system issue',knownIssueIds:['lincoln-nautilus-2-0l-ecoboost-coolant-loss-egr-cooler-leak-low-coolant-white']},
      trans:{status:'known-issue',statusDetail:'Published transmission issue · sample service on track',knownIssueIds:['lincoln-nautilus-8f35-8-speed-automatic-shudder-buck-jerk-under-35-mph']},
      glass:{label:'Visibility, Camera & Cabin',status:'known-issue',statusDetail:'Published SYNC 3 / APIM issue · wiper service unlogged',knownIssueIds:['lincoln-nautilus-sync-3-apim-infotainment-freezes-black-screens-reboots']},
    }),systems:systems(true).map((system)=>system.hot==='glass'?{...system,label:'Visibility, Camera & Cabin'}:system),
  },
  {
    id:'murano',fulfillmentId:null,ownerReady:false,
    identity:{year:2023,make:'Nissan',model:'Murano',trim:'SV',engine:'3.5L V6',paint:'Scarlet Ember Tintcoat'},demoMileage:24000,
    paintPalette:{sourceLabel:'2023 Nissan Murano brochure · Choose Your Color',sourceUrl:'https://www.nissanusa.com/content/dam/Nissan/us/vehicle-brochures/2023/2023-nissan-murano-brochure-en.pdf',colors:[
      {name:'Pearl White TriCoat',swatch:'#EEEDE7',artStatus:'awaiting-art'},{name:'Brilliant Silver Metallic',swatch:'#B9BCBD',artStatus:'awaiting-art'},
      {name:'Gun Metallic',swatch:'#565B60',artStatus:'awaiting-art'},{name:'Boulder Gray Pearl',swatch:'#777873',artStatus:'awaiting-art'},
      {name:'Scarlet Ember Tintcoat',swatch:'#8E2530',artStatus:'rendered'},{name:'Deep Ocean Blue Metallic',swatch:'#17354D',artStatus:'awaiting-art'},
      {name:'Super Black',swatch:'#101113',artStatus:'awaiting-art'},
    ]},
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
      hood:{node:'hoodRoot',status:'on-track',statusDetail:'Sample oil service on track'},trans:{status:'unlogged',statusDetail:'Sample CVT record exists; FWD/AWD driveline history is incomplete'},
      glass:{label:'Safety, Camera & Cabin',status:'known-issue',statusDetail:'Five published driver-assistance, electrical, seat and camera issues · wiper service unlogged',knownIssueIds:['nissan-murano-automatic-emergency-braking-forward-collision-phantom-activa','nissan-murano-battery-drain-and-no-start-2021','nissan-murano-front-driver-seat-frametrack-2021','nissan-murano-front-radarsensor-malfunctions-triggering-2021','nissan-murano-rearview-camera-image-blank-2021']},rad:{status:'unlogged',statusDetail:'No sample service event logged'},
    }),systems:systems(true).map((system)=>system.hot==='glass'?{...system,label:'Safety, Camera & Cabin'}:system),
  },
  {
    id:'xt6',fulfillmentId:null,ownerReady:false,
    identity:{year:2020,make:'Cadillac',model:'XT6',trim:'Sport',engine:'3.6L V6',paint:'Satin Steel Metallic'},demoMileage:52000,
    paintPalette:{sourceLabel:'2020 Cadillac XT6 brochure · Exterior Colors',sourceUrl:'https://www.cadillac.com/content/dam/cadillac/na/us/english/index/downloads/vehiclebrochures/brochures/2020/MY20_XT6_Brochure_v1.pdf',colors:[
      {name:'Radiant Silver Metallic',swatch:'#B9BBBC',artStatus:'awaiting-art'},{name:'Stellar Black Metallic',swatch:'#15171A',artStatus:'awaiting-art'},
      {name:'Crystal White Tricoat',swatch:'#ECEAE3',artStatus:'awaiting-art'},{name:'Shadow Metallic',swatch:'#3E4650',artStatus:'awaiting-art'},
      {name:'Satin Steel Metallic',swatch:'#73777A',artStatus:'rendered'},{name:'Red Horizon Tintcoat',swatch:'#84232B',artStatus:'awaiting-art'},
      {name:'Manhattan Noir Metallic',swatch:'#29292B',artStatus:'awaiting-art'},{name:'Garnet Metallic',swatch:'#5A2530',artStatus:'awaiting-art'},
      {name:'Dark Mocha Metallic',swatch:'#4B413B',artStatus:'awaiting-art'},
    ]},
    sampleState:{label:'Sample demo state',records:[
      {node:'oil',label:'Engine oil',lastServiceMileage:45000,intervalMiles:7500,intervalSource:'2020 Cadillac XT6 Owner\'s Manual',sourceUrl:'https://www.cadillac.com/support/vehicle/manuals-guides',sourceSection:'Maintenance Schedule · 7,500-mile services'},
      {node:'tire',label:'Tire rotation',lastServiceMileage:37500,intervalMiles:7500,intervalSource:'2020 Cadillac XT6 Owner\'s Manual',sourceUrl:'https://www.cadillac.com/support/vehicle/manuals-guides',sourceSection:'Maintenance Schedule · 7,500-mile services'},
    ]},
    treeResolver:'xt6',treeStatus:'model-specific',
    art:{available:true,base:'/twin-stage/cadillac/base-satin-steel.webp',effects:opaque('/twin-stage/cadillac'),strategy:'opaque-masked',masks},
    hotspots:standardHotspots({wheel:[43,66],hood:[65,38],glass:[48,28],rearwheel:[20,64],rad:[70,53],trans:[55,59]}, {
      wheel:{status:'overdue',statusDetail:'Sample tire rotation overdue'},rearwheel:{status:'overdue',statusDetail:'Sample tire rotation overdue'},
      hood:{node:'hoodRoot',status:'known-issue',statusDetail:'Published timing-chain and start-stop issues · sample oil service on track',knownIssueIds:['cadillac-xt6-timing-chain-2020','cadillac-xt6-auto-stop-2020']},
      trans:{status:'known-issue',statusDetail:'Three published transmission/AWD issues · no sample fluid service event logged',knownIssueIds:['cadillac-xt6-9speed-transmission-2020','cadillac-xt6-transmission-shudder-2020','cadillac-xt6-ptu-leak-2020']},
      glass:{status:'unlogged',statusDetail:'No sample service event logged'},rad:{status:'unlogged',statusDetail:'No sample service event logged'},
    }),systems:systems(true),
  },
  {
    id:'kicks',fulfillmentId:null,ownerReady:false,
    identity:{year:2025,make:'Nissan',model:'Kicks',trim:'Trim not provided',engine:'2.0L I4',paint:'Gun Metallic'},demoMileage:12000,
    paintPalette:{sourceLabel:'2025 Nissan Kicks brochure · Exterior Colors',sourceUrl:'https://www.nissanusa.com/content/dam/Nissan/us/vehicle-brochures/2025/2025-nissan-kicks-brochure-en.pdf',colors:[
      {name:'Fresh Powder',swatch:'#F4F2EA',artStatus:'awaiting-art'},{name:'Aspen White TriCoat',swatch:'#EEEDE7',artStatus:'awaiting-art'},
      {name:'Gun Metallic',swatch:'#565B60',artStatus:'rendered'},{name:'Canyon Bronze Metallic',swatch:'#75665A',artStatus:'awaiting-art'},
      {name:'Scarlet Ember Tintcoat',swatch:'#932934',artStatus:'awaiting-art'},{name:'Deep Blue Pearl',swatch:'#183651',artStatus:'awaiting-art'},
      {name:'Super Black',swatch:'#101113',artStatus:'awaiting-art'},{name:'Yuzu Yellow / Super Black',swatch:'#B7BC38',artStatus:'awaiting-art'},
      {name:'Arctic Ice Blue / Super Black',swatch:'#ABC8CF',artStatus:'awaiting-art'},{name:'Deep Blue Pearl / Gun Metallic',swatch:'#243A50',artStatus:'awaiting-art'},
    ]},
    sampleState:{label:'Sample demo state',records:[
      {node:'oil',label:'Engine oil and filter',lastServiceMileage:0,intervalMiles:10000,intervalSource:'2025 Nissan Kicks Maintenance Schedule',sourceUrl:'https://maintenance-schedules.nissanusa.com/maintenance-schedules/2025/kicks/components/',sourceSection:'Engine oil and filter · standard conditions'},
      {node:'tire',label:'Tire service',lastServiceMileage:0,intervalMiles:10000,intervalSource:'2025 Nissan Kicks Maintenance Schedule',sourceUrl:'https://maintenance-schedules.nissanusa.com/maintenance-schedules/2025/kicks/components/',sourceSection:'Tires and rotation'},
    ]},
    treeResolver:'kicks',treeStatus:'model-specific',art:generatedArt('/twin-stage/kicks','gun-metallic'),
    hotspots:standardHotspots({wheel:[44,71],hood:[65,38],glass:[51,30],rearwheel:[15,61],rad:[73,59],trans:[57,66]}, {
      wheel:{status:'overdue',statusDetail:'Sample tire-service deadline passed; brake history is incomplete'},hood:{node:'hoodRoot',status:'overdue',statusDetail:'Sample oil-service deadline passed; remaining engine history is incomplete'},
      rearwheel:{status:'overdue',statusDetail:'Sample tire-service deadline passed'},rad:{status:'unlogged',statusDetail:'Cooling-system history not supplied'},
      trans:{status:'unlogged',statusDetail:'FWD/AWD configuration still requires owner confirmation'},
      glass:{label:'Safety, Camera & Cabin',status:'known-issue',statusDetail:'Published cluster, backup-camera and infotainment issues',knownIssueIds:['nissan-kicks-blank-partial-instrument-cluster-cold-start','nissan-kicks-center-display-goes-blank-reverse-no-backup-camera-image','nissan-kicks-infotainment-touchscreen-freezing-rebooting-carplay-disconne']},
    }),systems:systems(true).map((system)=>system.hot==='glass'?{...system,label:'Safety, Camera & Cabin'}:system),
  },
  {
    id:'mdx',fulfillmentId:null,ownerReady:false,
    identity:{year:2019,make:'Acura',model:'MDX',trim:'Technology',engine:'3.5L V6',paint:'Lunar Silver Metallic'},demoMileage:48000,
    paintPalette:{sourceLabel:'2019 Acura MDX brochure · Exterior Colors',sourceUrl:'https://cdn.dealereprocess.org/cdn/brochures/acura/2019-mdx.pdf',colors:[
      {name:'Platinum White Pearl',swatch:'#EEEDE8',artStatus:'awaiting-art'},{name:'Lunar Silver Metallic',swatch:'#B9BBBC',artStatus:'rendered'},
      {name:'Modern Steel Metallic',swatch:'#555A5E',artStatus:'awaiting-art'},{name:'Majestic Black Pearl',swatch:'#111317',artStatus:'awaiting-art'},
      {name:'Fathom Blue Pearl',swatch:'#1C3449',artStatus:'awaiting-art'},{name:'Performance Red Pearl',swatch:'#8D2631',artStatus:'awaiting-art'},
      {name:'Gunmetal Metallic',swatch:'#68696A',artStatus:'awaiting-art'},
    ]},
    sampleState:{label:'Sample demo state',records:[
      {node:'oil',label:'Engine oil and filter',lastServiceMileage:40000,intervalMiles:7500,intervalSource:'2019 Acura MDX Owner\'s Manual',sourceUrl:'https://owners.acura.com/utility/download?path=/static/pdfs/2019/MDX/2019_MDX_Owners_Manual.pdf',sourceSection:'Maintenance Minder'},
      {node:'transFluid',label:'Transmission fluid',lastServiceMileage:30000,intervalMiles:30000,intervalSource:'2019 Acura Maintenance Minder',sourceUrl:'https://owners.acura.com/servicemaintenance/minder',sourceSection:'Sub-item 3 · transmission and transfer fluid'},
    ]},
    treeResolver:'mdx',treeStatus:'model-specific',art:generatedArt('/twin-stage/acura-mdx','lunar-silver'),
    hotspots:standardHotspots({wheel:[47,68],hood:[70,38],glass:[50,29],rearwheel:[13,63],rad:[75,58],trans:[58,65]}, {
      wheel:{status:'unlogged',statusDetail:'Brake and tire service history not supplied'},hood:{node:'hoodRoot',status:'known-issue',statusDetail:'Fuel-pump recall record · sample oil service approaching due',knownIssueIds:['acura-mdx-fuel-pump-impeller-deformation-causing-stall']},
      rearwheel:{status:'unlogged',statusDetail:'Tire service history not supplied'},rad:{status:'unlogged',statusDetail:'Cooling-system history not supplied'},
      trans:{status:'known-issue',statusDetail:'Published ZF 9-speed and torque-converter concerns · FWD/SH-AWD confirmation required',knownIssueIds:['acura-mdx-zf-9-speed-transmission-hesitation-hard-shifts-stalling','acura-mdx-torque-converter-shudder-2014']},
      glass:{label:'Infotainment & Visibility',status:'known-issue',statusDetail:'Published infotainment reboot issue',knownIssueIds:['acura-mdx-infotainment-reboot-2014']},
    }),systems:systems(true).map((system)=>system.hot==='glass'?{...system,label:'Infotainment & Visibility'}:system),
  },
  {
    id:'aviator',fulfillmentId:null,ownerReady:false,
    identity:{year:2026,make:'Lincoln',model:'Aviator',trim:'Premiere',engine:'3.0L Twin-Turbo V6',paint:'Red Carpet Metallic Tinted Clearcoat'},demoMileage:5000,
    paintPalette:{sourceLabel:'2026 Lincoln Aviator · Exterior Colors',sourceUrl:'https://www.lincoln.com/luxury-suvs/aviator/',colors:[
      {name:'Pristine White Metallic Tri-Coat',swatch:'#ECEAE3',artStatus:'awaiting-art'},{name:'Harbor Gray',swatch:'#65696B',artStatus:'awaiting-art'},
      {name:'Cenote Green Bright Colorant Clearcoat',swatch:'#2F5B4A',artStatus:'awaiting-art'},{name:'Whisper Blue Metallic',swatch:'#8195A5',artStatus:'awaiting-art'},
      {name:'Red Carpet Metallic Tinted Clearcoat',swatch:'#8D1E2C',artStatus:'rendered'},{name:'Infinite Black Metallic',swatch:'#121417',artStatus:'awaiting-art'},
    ]},
    sampleState:{label:'Sample demo state',records:[]},treeResolver:'aviator',treeStatus:'model-specific',art:generatedArt('/twin-stage/lincoln-aviator','red-carpet'),
    hotspots:standardHotspots({wheel:[49,67],hood:[72,38],glass:[51,28],rearwheel:[18,59],rad:[76,55],trans:[58,64]}, {
      wheel:{status:'unlogged',statusDetail:'First tire/brake service history not supplied'},hood:{node:'hoodRoot',status:'unlogged',statusDetail:'First engine-service history not supplied'},
      rearwheel:{status:'unlogged',statusDetail:'Tire service history not supplied'},rad:{status:'unlogged',statusDetail:'Cooling-system history not supplied'},trans:{status:'unlogged',statusDetail:'RWD/AWD configuration requires owner confirmation'},glass:{status:'unlogged',statusDetail:'Wiper service history not supplied'},
    }),systems:systems(true),
  },
  {
    id:'camaro',fulfillmentId:'chevrolet-camaro-zl1-1le',ownerReady:true,
    identity:{year:2019,make:'Chevrolet',model:'Camaro',trim:'ZL1 1LE',engine:'6.2L Supercharged LT4 V8',paint:'Summit White'},demoMileage:30000,
    paintPalette:{sourceLabel:'2019 Chevrolet Camaro brochure · Exterior Colors',sourceUrl:'https://cdn.dealereprocess.org/cdn/brochures/chevrolet/2019-camaro.pdf',colors:[
      {name:'Summit White',swatch:'#F1F0EA',artStatus:'rendered'},{name:'Black',swatch:'#111216',artStatus:'awaiting-art'},
      {name:'Satin Steel Gray Metallic',swatch:'#686C70',artStatus:'awaiting-art'},{name:'Shadow Gray Metallic',swatch:'#444A50',artStatus:'awaiting-art'},
      {name:'Silver Ice Metallic',swatch:'#B8BBBD',artStatus:'awaiting-art'},{name:'Riverside Blue Metallic',swatch:'#174A75',artStatus:'awaiting-art'},
      {name:'Garnet Red Tintcoat',swatch:'#69222B',artStatus:'awaiting-art'},{name:'Crush',swatch:'#C95824',artStatus:'awaiting-art'},
      {name:'Red Hot',swatch:'#B4212A',artStatus:'awaiting-art'},
    ]},
    sampleState:{label:'Sample demo state',records:[
      {node:'oil',label:'Engine oil and filter',lastServiceMileage:22500,intervalMiles:7500,intervalSource:'2019 Camaro Owner\'s Manual',sourceUrl:'https://www.chevrolet.com/support/vehicle/manuals-guides',sourceSection:'Maintenance schedule and engine-oil life system'},
      {node:'driveline',label:'Electronic limited-slip differential fluid',lastServiceMileage:0,intervalMiles:45000,intervalSource:'2019 Camaro High Performance Owner\'s Manual Supplement',sourceUrl:'https://www.chevrolet.com/support/vehicle/manuals-guides',sourceSection:'Track and competitive driving · rear axle fluid'},
    ]},
    treeResolver:'camaro',treeStatus:'model-specific',art:generatedArt('/twin-stage/camaro','summit'),
    hotspots:standardHotspots({wheel:[44,64],hood:[63,42],glass:[50,29],rearwheel:[20,57],rad:[71,59],trans:[57,63]}, {
      wheel:{status:'unlogged',statusDetail:'Staggered tire and brake history not supplied'},hood:{node:'hoodRoot',status:'unlogged',statusDetail:'Sample oil service reaches its deadline at the sample mileage'},rearwheel:{status:'unlogged',statusDetail:'Rear tire history not supplied'},
      rad:{status:'unlogged',statusDetail:'Main and low-temperature cooling service history not supplied'},trans:{status:'known-issue',statusDetail:'eLSD issue record · manual/automatic choice required',knownIssueIds:['chevy-camaro-rear-differential-noise']},glass:{label:'Infotainment & Visibility',status:'known-issue',statusDetail:'Published MyLink/HMI issue',knownIssueIds:['chevrolet-camaro-mylink-hmi-infotainment-module-failure']},
    }),systems:systems(true).map((system)=>system.hot==='glass'?{...system,label:'Infotainment & Visibility'}:system),
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
  return VEHICLE_TWIN_CATALOG.map(({ id, identity, demoMileage, sampleState, ownerReady, treeStatus, fulfillmentId, paintPalette, art, hotspots, systems }) => ({ id, identity, demoMileage, sampleState, ownerReady, treeStatus, fulfillmentId, paintPalette, art, hotspots, systems }));
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
    const renderedPaints=twin.paintPalette.colors.filter((color)=>color.artStatus==='rendered');
    if (renderedPaints.length!==1||renderedPaints[0]?.name!==twin.identity.paint) errors.push(`${twin.id} dishonest paint readiness`);
    if (!twin.paintPalette.sourceLabel||!twin.paintPalette.sourceUrl) errors.push(`${twin.id} missing paint source`);
    const paintNames=twin.paintPalette.colors.map((color)=>color.name.trim());
    if (paintNames.some((name,index)=>!name||paintNames.indexOf(name)!==index)||twin.paintPalette.colors.some((color)=>!/^#[0-9a-f]{6}$/i.test(color.swatch))) errors.push(`${twin.id} invalid paint palette`);
  }
  return errors;
}
