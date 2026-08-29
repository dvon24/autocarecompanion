import { TT_TREES } from './stage/TechTree';
import { buildTwinTrees } from './twin-trees';

const cloneTrees = (trees) => {
  const shared = new Map();
  return Object.fromEntries(Object.entries(trees).map(([key, tree]) => [key, {
    ...tree,
    nodes:Object.fromEntries(Object.entries(tree.nodes).map(([id, node]) => {
      if (!shared.has(id)) shared.set(id, {...node, kids:[...(node.kids || [])]});
      return [id, shared.get(id)];
    })),
  }]));
};

const XT6_OWNER_MANUAL = 'https://cdn.dealereprocess.org/cdn/servicemanuals/cadillac/2020-xt6.pdf';
const CAMARO_OWNER_MANUAL = 'https://www.chevrolet.com/ownercenter/content/dam/gmownercenter/gmna/dynamic/manuals/2019/Chevrolet/camaro/19_CHEV_Camaro_OM_en_US_U_84210673A_2018JUN22.pdf';
const CAMARO_HIGH_PERFORMANCE_SUPPLEMENT = 'https://www.carmanualsonline.info/chevrolet-camaro-2019-high-performance-owner-manual/?srch=differential';
const BRAKE_INSPECTION = 'Service when pads reach their published minimum, rotors reach the minimum thickness stamped on the rotor, or inspection finds scoring, heat cracks, excessive runout, a fluid leak, sticking hardware, squeal/grinding, pedal pulsation, steering-wheel vibration, pulling or increased stopping distance.';
const TIRE_INSPECTION = 'Replace for exposed cord/fabric, sidewall cracks/cuts, a bulge or split, repeated pressure loss, three or more visible wear indicators, or tread at the legal/service limit; investigate vibration, pulling and irregular wear before ordering.';
const UNCONFIRMED_BRAKE_FLUID = {brand:'Qualified brake-fluid service',spec:'Read the reservoir cap and exact owner manual before service; test moisture/condition and use a clean sealed container. No fluid product is asserted until the vehicle-specific DOT specification is confirmed.'};
const DEMO_TREE_CONTEXT = {
  nautilus:{
    engine:'2.0L EcoBoost turbocharged I4', transmission:'8-speed SelectShift automatic',
    wheel:'2019 Nautilus wheel and tire package',
    service:{oil:{interval:10000,partNo:'FL-910S',brand:'Motorcraft engine oil filter',spec:'Use SAE 5W-30 meeting the owner-manual Ford specification'},air:{interval:30000,partNo:'FA-1912',brand:'Motorcraft engine air filter'},coolant:{interval:100000,partNo:'VC-13DL-G',brand:'Motorcraft Yellow Prediluted Antifreeze/Coolant'},trans:{interval:150000,partNo:'XT-12-QULV',brand:'Motorcraft MERCON ULV',spec:'8F35 automatic; use the manual level-temperature procedure'},driveline:{label:'PTU / Rear Differential',brand:'Drivetrain-specific service',spec:'Confirm FWD or AWD by VIN. FWD has no rear differential; an AWD PTU/rear-drive fluid product and interval must come from the exact owner manual or dealer parts catalog before ordering.'},tire:{interval:10000},brake:{},brakeFluid:{...UNCONFIRMED_BRAKE_FLUID}},
    radiatorIssue:{id:'lincoln-nautilus-2-0l-ecoboost-coolant-loss-egr-cooler-leak-low-coolant-white',label:'2.0L EcoBoost coolant loss / EGR cooler leak'},
    engineIssues:[{key:'startStop',id:'lincoln-nautilus-auto-start-stop-malfunction-engine-won-t-auto-restart',label:'Auto Start-Stop / 12V battery malfunction',sub:'2019 Nautilus may fail to restart after an automatic stop',where:'12V battery, charging system and powertrain controls'}],
    transmissionIssues:[{key:'transShudder',id:'lincoln-nautilus-8f35-8-speed-automatic-shudder-buck-jerk-under-35-mph',label:'8F35 low-speed shudder',sub:'Shudder, buck or jerk below 35 mph',where:'8F35 transmission and calibration branch'}],
    cabinIssues:[{key:'sync',id:'lincoln-nautilus-sync-3-apim-infotainment-freezes-black-screens-reboots',label:'SYNC 3 / APIM freezes and reboots',sub:'2019 Standard-trim infotainment issue',where:'Center display and APIM behind the instrument panel'}],
  },
  murano:{engine:'3.5L VQ35DE V6',transmission:'Xtronic continuously variable transmission',wheel:'2023 Murano SV wheel and tire package',service:{oil:{interval:7500,partNo:'15208-65F0E',brand:'Genuine Nissan oil filter',spec:'SAE 0W-20; verify capacity in the 2023 Owner\'s Manual'},air:{interval:30000,partNo:'16546-5AA1A',brand:'Genuine Nissan engine air filter'},coolant:{interval:105000,partNo:'999MP-L25500P',brand:'Nissan Blue Long Life Antifreeze/Coolant'},trans:{interval:60000,partNo:'999MP-NS300P',brand:'Nissan NS-3 CVT Fluid',spec:'NS-3 only; use the temperature-dependent level procedure'},driveline:{label:'Transfer Case / Rear Differential',brand:'Drivetrain-specific service',spec:'Confirm FWD or AWD by VIN. FWD has no rear final-drive service; AWD transfer and rear final-drive fluids require separate exact catalog confirmation before ordering.'},tire:{interval:7500},brake:{},brakeFluid:{...UNCONFIRMED_BRAKE_FLUID}},cabinIssues:[
    {key:'aeb',id:'nissan-murano-automatic-emergency-braking-forward-collision-phantom-activa',label:'AEB phantom activation',sub:'Forward-collision system may brake without a true obstacle',where:'Forward driver-assistance sensing and control system'},
    {key:'battery',id:'nissan-murano-battery-drain-and-no-start-2021',label:'Battery drain / no-start',sub:'Telematics or infotainment modules may remain awake',where:'12V battery and module sleep-current circuit'},
    {key:'seatTrack',id:'nissan-murano-front-driver-seat-frametrack-2021',label:'Driver-seat frame / track movement',sub:'Seat may rock, click or move unexpectedly',where:'Front driver-seat frame and floor-mounted track'},
    {key:'frontRadar',id:'nissan-murano-front-radarsensor-malfunctions-triggering-2021',label:'Front radar / sensor malfunction',sub:'AEB, ICC and forward-collision warnings may appear',where:'Front radar sensor and its mounting/alignment branch'},
    {key:'rearCamera',id:'nissan-murano-rearview-camera-image-blank-2021',label:'Rear-view camera image failure',sub:'Camera image may be blank, distorted or intermittent',where:'Liftgate camera, harness and AV control unit'},
  ]},
  xt6:{
    engine:'3.6L naturally aspirated V6',transmission:'9-speed automatic transmission',wheel:'2020 XT6 Sport wheel and tire package',
    service:{
      oil:{interval:7500,partNo:'12693541 / UPF63R',brand:'ACDelco GM Original Equipment oil filter',price:'$21.14 MSRP for the original filter when reviewed',sourceUrl:XT6_OWNER_MANUAL,sourceLabel:'2020 Cadillac XT6 Owner Manual, pp. 339–340',spec:'SAE 5W-30 dexos1 full synthetic · 6.0 qt with filter; the manual identifies 12693541 / UPF63R and newer catalogs may supersede it'},
      air:{interval:45000,intervalMonths:48,partNo:'23321606 / A3212C',brand:'ACDelco GM Original Equipment engine air filter',price:'$78.76 MSRP when reviewed',buyUrl:'https://parts.cadillac.com/product/acdelco-gm-original-equipment-air-filter-23321606',sourceUrl:XT6_OWNER_MANUAL,sourceLabel:'2020 Cadillac XT6 Owner Manual, pp. 332–340',spec:'Exact 2020–2025 XT6 Luxury, Premium Luxury and Sport fitment; replace by the filter-life monitor or four years when not equipped with the monitor, sooner in dust'},
      cabin:{intervalMonths:24,partNo:'13508023 / CF185',brand:'ACDelco passenger-compartment air filter',sourceUrl:XT6_OWNER_MANUAL,sourceLabel:'2020 Cadillac XT6 Owner Manual, pp. 332–340',spec:'Owner-manual replacement part; replace every two years or sooner for reduced airflow, window fogging, odor, heavy traffic, dust or allergens'},
      spark:{interval:97500,partNo:'12646780 / 41-130',brand:'ACDelco spark plugs',sourceUrl:XT6_OWNER_MANUAL,sourceLabel:'2020 Cadillac XT6 Owner Manual, pp. 332–340',spec:'Six plugs for the 3.6L V6; use the owner-manual 97,500-mile schedule and have a dealer confirm any supersession before ordering'},
      coolant:{interval:150000,intervalMonths:60,brand:'DEX-COOL cooling-system service',sourceUrl:XT6_OWNER_MANUAL,sourceLabel:'2020 Cadillac XT6 Owner Manual, pp. 332–343',spec:'50/50 DEX-COOL mixture only · 12.0 qt without rear A/C or 13.6 qt with rear A/C; confirm equipment before filling'},
      trans:{interval:45000,brand:'DEXRON-VI transmission service',sourceUrl:XT6_OWNER_MANUAL,sourceLabel:'2020 Cadillac XT6 Owner Manual, pp. 263, 334 and 339',spec:'The 2020 XT6 manual specifies DEXRON-VI—not DEXRON ULV—for its 9-speed automatic. The 45,000-mile change is the severe-use branch; have the level-temperature procedure performed with the VIN-confirmed transmission.'},
      driveline:{label:'AWD Rear-Axle Fluid & Power Transfer Unit Inspection',interval:150000,separateService:true,manualFirstDeadline:false,img:'/twin-stage/parts/part-power-transfer-unit.webp',sourceUrl:XT6_OWNER_MANUAL,sourceLabel:'2020 Cadillac XT6 Owner Manual, pp. 330–339',brand:'Cadillac rear-axle service / PTU inspection',spec:'The Sport is AWD with an Active Twin-Clutch rear drive module. Change rear-axle fluid at 150,000 miles under the normal schedule or at 60,000 and 150,000 miles under the manual’s severe-use schedule. Inspect PTU, axle and output seals for leakage, contamination, vibration, grinding/whining, popping/clunking or AWD engagement faults. The manual says “See your dealer” for rear-axle fluid and does not publish a retail PTU-fluid service, so no PTU product or interval is asserted.'},
      tire:{interval:7500,partNo:'235/55R20 102H OE minimum · 235 mm section width · Discount Tire replacement item 103603 is 102V SL',brand:'Pirelli Scorpion AS Plus 3 235/55R20 102V SL',price:'$245.00 each when reviewed',buyUrl:'https://www.discounttire.com/buy-tires/pirelli-scorpion-all-season-plus-3/p/103603',buyLabel:'View exact 235/55R20 tire at Discount Tire',spec:'Recommendation applies only to a Sport carrying the standard 235/55R20 placard: 235 mm nominal section width, 55 aspect ratio, 20-inch rim and approximately 9.65 in section width; the reviewed 102V replacement meets or exceeds the 102H service description. Optional 21-inch wheels use a different size—verify the door placard and installed sidewall.'},
      brake:{},
      brakeFluid:{intervalMonths:60,partNo:'19353126 / 10-4110',brand:'ACDelco GM Original Equipment DOT 3 brake fluid',price:'$10.29 MSRP / 16 oz when reviewed',buyUrl:'https://parts.cadillac.com/product/acdelco-gm-original-equipment-dot-3-hydraulic-brake-fluid-16-oz-19353126',sourceUrl:XT6_OWNER_MANUAL,sourceLabel:'2020 Cadillac XT6 Owner Manual, pp. 270–271, 333 and 339',spec:'GM-approved DOT 3 from a clean sealed container; replace every five years. Low level can indicate lining wear or a hydraulic leak—do not top off to hide the cause.'},
    },
    timingIssue:{id:'cadillac-xt6-timing-chain-2020',label:'3.6L V6 timing-chain concern'},
    engineIssues:[{key:'startStop',id:'cadillac-xt6-auto-stop-2020',label:'Auto Start-Stop harshness / battery issue',sub:'Restart harshness and battery-related stop/start faults',where:'12V battery, starter system and powertrain controls'}],
    transmissionIssues:[
      {key:'trans9Speed',id:'cadillac-xt6-9speed-transmission-2020',label:'9-speed shudder and hesitation',sub:'Published 9-speed shift-quality issue',where:'9-speed automatic transmission and calibration branch'},
      {key:'transHarsh',id:'cadillac-xt6-transmission-shudder-2020',label:'Transmission shudder / harsh shifts',sub:'Separate published XT6 transmission-shudder record',where:'9-speed automatic transmission and fluid/control branch'},
      {key:'ptuLeak',id:'cadillac-xt6-ptu-leak-2020',label:'AWD power-transfer-unit fluid leak',sub:'Sport AWD driveline may leak at the PTU',where:'Power transfer unit between transmission and rear driveline'},
    ],
  },
  kicks:{
    engine:'2.0L naturally aspirated I4',transmission:'Xtronic CVT',wheel:'2025 Kicks wheel and tire package',
    service:{oil:{interval:10000,partNo:'15208-65F0E',brand:'Genuine Nissan oil filter',spec:'Use the oil viscosity and capacity printed in the 2025 Owner\'s Manual for the confirmed trim'},air:{interval:40000,partNo:'16546-7LG0B',brand:'Genuine Nissan engine air filter'},coolant:{interval:100000,partNo:'999MP-L25500P',brand:'Nissan Blue Long Life Antifreeze/Coolant',spec:'Blue long-life premix; confirm capacity in the 2025 Owner\'s Manual'},trans:{interval:60000,partNo:'999MP-NS300P',brand:'Nissan NS-3 CVT Fluid',spec:'NS-3 only; level procedure and capacity require the exact CVT'},driveline:{label:'AWD Coupling / FWD Transaxle',brand:'Drivetrain-specific service',spec:'Confirm FWD or AWD by VIN. The FWD final drive is integrated with the CVT and is not a separate fluid service; do not select an AWD coupling product until the AWD branch is confirmed.'},tire:{interval:10000},brake:{},brakeFluid:{...UNCONFIRMED_BRAKE_FLUID}},
    cabinIssues:[
      {key:'cluster',id:'nissan-kicks-blank-partial-instrument-cluster-cold-start',label:'Instrument cluster blank on cold start',sub:'Published cluster/recall concern for the redesigned Kicks',where:'Instrument cluster and vehicle communication network'},
      {key:'camera',id:'nissan-kicks-center-display-goes-blank-reverse-no-backup-camera-image',label:'Backup-camera display may go blank',sub:'Published rear-visibility recall concern',where:'Center display, rear camera and video path'},
      {key:'infotainment',id:'nissan-kicks-infotainment-touchscreen-freezing-rebooting-carplay-disconne',label:'Infotainment freezes or reboots',sub:'Touchscreen and phone projection may disconnect',where:'Center display and infotainment control unit'},
    ],
  },
  mdx:{
    engine:'3.5L SOHC i-VTEC V6',transmission:'ZF 9-speed automatic',wheel:'2019 MDX Technology wheel and tire package',
    service:{oil:{interval:7500,partNo:'15400-RTA-003',brand:'Genuine Honda/Acura engine oil filter',spec:'Follow Maintenance Minder oil-life indication; verify oil capacity by drivetrain'},air:{interval:30000,partNo:'17220-5J2-A00',brand:'Genuine Acura engine air filter'},coolant:{interval:100000,partNo:'OL999-9011',brand:'Honda Type 2 coolant',spec:'Premixed Honda Type 2; never mix incompatible coolant chemistry'},trans:{interval:30000,partNo:'08200-9016A',brand:'Honda ATF Type 3.1',spec:'ZF 9-speed Type 3.1 branch; do not substitute DW-1'},driveline:{label:'Transfer Case / Rear Differential',brand:'Drivetrain-specific service',spec:'Confirm FWD or SH-AWD by VIN. FWD omits rear-differential service; SH-AWD uses separate transfer-case and rear-differential fluids that must be selected only after drivetrain confirmation.'},tire:{interval:7500},brake:{},brakeFluid:{...UNCONFIRMED_BRAKE_FLUID}},
    engineIssues:[{key:'fuelPump',id:'acura-mdx-fuel-pump-impeller-deformation-causing-stall',label:'Fuel-pump impeller recall',sub:'Deformed impeller may cause stall or no-start',where:'In-tank fuel pump module'}],
    transmissionIssues:[
      {key:'zfHesitation',id:'acura-mdx-zf-9-speed-transmission-hesitation-hard-shifts-stalling',label:'ZF 9-speed hesitation / harsh shifts',sub:'Published shift-quality concern',where:'ZF 9-speed transmission and software branch'},
      {key:'converter',id:'acura-mdx-torque-converter-shudder-2014',label:'Torque-converter shudder',sub:'Judder under light throttle',where:'Transmission torque converter and fluid branch'},
    ],
    cabinIssues:[{key:'infotainment',id:'acura-mdx-infotainment-reboot-2014',label:'Infotainment freezes or reboots',sub:'Display/audio system may restart unexpectedly',where:'Center display and infotainment network'}],
  },
  aviator:{
    engine:'3.0L twin-turbocharged V6',transmission:'10-speed SelectShift automatic',wheel:'2026 Aviator Premiere wheel and tire package',
    service:{oil:{interval:10000,partNo:'FL-2062-A',brand:'Motorcraft engine oil filter',spec:'Confirm oil grade/capacity in the 2026 Owner\'s Manual'},air:{interval:30000,brand:'Motorcraft engine air-filter service',spec:'Have a dealer match the filter to the VIN and installed airbox; no filter part is asserted for the unconfirmed 2026 configuration.'},coolant:{interval:100000,partNo:'VC-13DL-G',brand:'Motorcraft Yellow Prediluted Antifreeze/Coolant',spec:'Use only the coolant specification printed in the 2026 Owner\'s Manual'},trans:{interval:150000,partNo:'XT-12-QULV',brand:'Motorcraft MERCON ULV',spec:'10R transmission; severe use may shorten interval'},driveline:{label:'Rear Differential / AWD PTU',brand:'Drivetrain-specific service',spec:'Confirm RWD or AWD by VIN. The AWD PTU and rear differential add separate hardware; no fluid product or interval is asserted until the drivetrain and 2026 manual branch are confirmed.'},tire:{interval:10000},brake:{},brakeFluid:{...UNCONFIRMED_BRAKE_FLUID}},
  },
  camaro:{
    engine:'6.2L supercharged LT4 V8',transmission:'TR-6060 6-speed manual or 10L90 10-speed automatic',wheel:'2019 Camaro ZL1 1LE staggered wheel and tire package',
    service:{
      oil:{interval:7500,partNo:'12640445 / PF64 → 25206377',brand:'ACDelco GM Original Equipment oil filter',price:'$5.55 when reviewed',buyUrl:'https://www.gmpartsgiant.com/parts/gm-filter-12640445.html',spec:'Use dexosR-approved SAE 0W-40; 10 qt with filter'},
      air:{interval:45000,partNo:'23323508 / A3223C',brand:'ACDelco GM Original Equipment engine air filter',price:'$81.00 MSRP',buyUrl:'https://parts.chevrolet.com/product/acdelco-gm-original-equipment-air-filter-23323508',spec:'2016–2024 Camaro ZL1/LT4 direct-fit branch; confirm the installed airbox remains stock'},
      cabin:{intervalMonths:24,partNo:'13508023 / CF185',brand:'ACDelco passenger-compartment air filter',sourceUrl:CAMARO_OWNER_MANUAL,sourceLabel:'2019 Chevrolet Camaro Owner Manual, pp. 321–330',spec:'Owner-manual replacement part; replace every two years or sooner for reduced airflow, window fogging, odor, heavy traffic, dust or allergens'},
      spark:{brand:'Dealer-confirmed LT4 ignition service',sourceUrl:CAMARO_HIGH_PERFORMANCE_SUPPLEMENT,sourceLabel:'2019 Camaro High Performance supplement',spec:'The base manual explicitly routes High Performance models to the supplement. No LT1 spark-plug number is reused for this LT4; confirm the LT4 plug and supersession by VIN before ordering.'},
      coolant:{interval:150000,partNo:'12346290 / 10-101',brand:'ACDelco GM Original Equipment DEX-COOL coolant',price:'$33.48 MSRP / gal',buyUrl:'https://parts.chevrolet.com/product/acdelco-gm-original-equipment-dex-cool-extended-life-engine-coolant-1-gal-12346290',spec:'DEX-COOL; mix only to the concentration required by the owner manual and never mix incompatible chemistry'},
      trans:{interval:45000,brand:'Transmission-specific GM fluid service',spec:'The 10L90 and TR-6060 use different fluids. Choose the installed transmission before the tree exposes a product or part number.'},
      driveline:{label:'Electronic Limited-Slip Differential',interval:45000,separateService:true,img:'/twin-stage/parts/part-differential.webp',where:'Rear electronic limited-slip differential gear housing',partNo:'88862624 / 10-4034 · 2 × 32 oz bottles',brand:'ACDelco GM Original Equipment DEXRON LS 75W-90 gear oil',price:'$44.28 MSRP each · $88.56 for two before tax/shipping when reviewed',buyUrl:'https://parts.chevrolet.com/product/acdelco-gm-original-equipment-dexron-ls-75w-90-gear-oil-32-oz-88862624',buyLabel:'Buy exact rear-axle gear oil',sourceUrl:CAMARO_OWNER_MANUAL,sourceLabel:'2019 Camaro Owner Manual, pp. 322 and 330; High Performance supplement, p. 48',capacitySourceUrl:CAMARO_HIGH_PERFORMANCE_SUPPLEMENT,spec:'Exact 2019 ZL1 1LE coupe eLSD gear-case service: DEXRON LS 75W-90, GM 88862624 / ACDelco 10-4034, approximately 1.5 L (1.6 qt), so two 32 oz bottles cover the published approximate capacity. Change at 45,000-mile intervals. The separate eLSD clutch hydraulic circuit holds 160 mL (5.4 oz); this purchase is not for that circuit, which requires its own service procedure.'},
      tire:{rotationAllowed:false,partNo:'305/30ZR19 98Y front · 325/30ZR19 101Y rear · Discount Tire items 38704/38720',brand:'Goodyear Eagle F1 SuperCar 3R',price:'$458.00 front · $480.00 rear when reviewed',buyUrl:'https://www.discounttire.com/buy-tires/goodyear-eagle-f1-supercar-3r/p/38704/rearProduct/38720',buyLabel:'View the exact staggered ZL1 1LE tire set',spec:'Factory staggered ZL1 1LE sizes; front-to-rear rotation is not permitted. Replace by measured tread/condition and verify both installed sidewalls before ordering.'},
      brake:{partNo:'84271643 rotor / 23399101 pad kit',brand:'GM ZL1 six-piston Brembo front brake service parts',price:'$311.44 front pad kit when reviewed; rotor price is intentionally not published without a reviewed direct destination',buyUrl:'https://www.gmpartsgiant.com/parts/chevrolet-pad-kit-frt-disc-brk~23399101.html',buyLabel:'Buy exact front pad kit',spec:'J6H/ZL1 heavy-duty front branch: 390 × 36 mm rotor and pad kit for both front sides. The purchase action is for pad kit 23399101 only; confirm VIN/RPO and rotor minimum thickness before ordering rotors.'},
      brakeFluid:{partNo:'19353126 / 10-4110',brand:'ACDelco GM Original Equipment DOT 3 brake fluid',price:'$10.29 MSRP / 16 oz when reviewed',buyUrl:'https://parts.chevrolet.com/product/acdelco-gm-original-equipment-dot-3-hydraulic-brake-fluid-16-oz-19353126',sourceUrl:CAMARO_OWNER_MANUAL,sourceLabel:'2019 Chevrolet Camaro Owner Manual, pp. 256–257 and 321–329',spec:'Street service uses GM-approved DOT 3 from a clean sealed container. Replace every five years with the automatic or every three years with the manual because the manual shares the brake/clutch reservoir. Track preparation has a separate high-temperature fluid requirement; no track fluid product is asserted here.'},
    },
    transmissionIssues:[{key:'diffNoise',id:'chevy-camaro-rear-differential-noise',label:'Rear differential groan or chatter',sub:'Published eLSD/differential fluid concern',where:'Rear electronic limited-slip differential'}],
    cabinIssues:[{key:'hmi',id:'chevrolet-camaro-mylink-hmi-infotainment-module-failure',label:'MyLink screen freezes or reboots',sub:'Infotainment HMI may become intermittent',where:'Center display and HMI module'}],
  },
};

const demoNode = ({label,sub,img,kids=[],where,spec,life,group=false,knownIssue,unlogged=!group,...details}) => ({
  label,sub,img,kids,where,spec,life,group,knownIssue,unlogged,
  availability:'sample',...details,
});
const serviceDetails = (service, maintenanceType, serviceLabel) => service ? ({
  ...service,maintenanceType,serviceLabel,
  ...(Number.isFinite(service.interval) ? {serviceIntervalMiles:service.interval,riskAt:service.interval} : {}),
  ...(Number.isFinite(service.intervalMonths) ? {serviceIntervalMonths:service.intervalMonths} : {}),
  firstServiceDeadline:Number.isFinite(service.interval) && service.manualFirstDeadline !== false,
}) : {};
const issueHref = (twin, id) => `/known-issues/${`${twin.identity.make}-${twin.identity.model}`.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}#${id}`;
const issueNode = (twin, issue, img) => demoNode({
  label:issue.label,sub:issue.sub,img,kids:[],where:issue.where,
  spec:`Published for the ${twin.identity.year} ${twin.identity.make} ${twin.identity.model}${twin.identity.trim?` ${twin.identity.trim}`:''}; diagnose the named system before replacing parts`,
  life:'Known-issue evidence only; no maintenance interval or replacement part is inferred',
  knownIssue:{id:issue.id,label:issue.label,href:issueHref(twin,issue.id)},unlogged:false,
});
const ISSUE_COMPONENT_ART = Object.freeze({
  sync:'/twin-stage/parts/part-infotainment-module.webp',
  infotainment:'/twin-stage/parts/part-infotainment-module.webp',
  hmi:'/twin-stage/parts/part-infotainment-module.webp',
  camera:'/twin-stage/parts/part-backup-camera.webp',
  rearCamera:'/twin-stage/parts/part-backup-camera.webp',
  aeb:'/twin-stage/parts/part-radar-sensor.webp',
  frontRadar:'/twin-stage/parts/part-radar-sensor.webp',
  cluster:'/twin-stage/parts/part-instrument-cluster.webp',
  battery:'/twin-stage/parts/part-battery.webp',
  startStop:'/twin-stage/parts/part-battery.webp',
  seatTrack:'/twin-stage/parts/part-seat-track.webp',
  ptuLeak:'/twin-stage/parts/part-power-transfer-unit.webp',
});

function challengerTrees(twin, transmission = 'automatic') {
  const trees = cloneTrees(TT_TREES);
  const branchTrees = buildTwinTrees({}, twin?.demoMileage ?? 65000, transmission || 'automatic');
  if (transmission === 'manual' && branchTrees.trans) {
    for (const id of Object.keys(trees.trans.nodes)) delete trees.car.nodes[id];
    trees.trans = branchTrees.trans;
    for (const [id,node] of Object.entries(trees.trans.nodes)) trees.car.nodes[id]=node;
  } else if (branchTrees.trans?.nodes?.diffFluid) {
    const diffFluid = branchTrees.trans.nodes.diffFluid;
    trees.trans.nodes.diffFluid=diffFluid;
    trees.car.nodes.diffFluid=diffFluid;
    if (!trees.trans.nodes.trx.kids.includes('diffFluid')) trees.trans.nodes.trx.kids=[...trees.trans.nodes.trx.kids,'diffFluid'];
  }
  const unique = new Map();
  for (const tree of Object.values(trees)) for (const [id,node] of Object.entries(tree.nodes)) if (!unique.has(id)) unique.set(id,node);
  for (const node of unique.values()) {
    if (node.partNo === '—' || /verify by vin/i.test(node.partNo || '')) delete node.partNo;
    if (node.price === '—' || /verify current/i.test(node.price || '')) delete node.price;
    // Alternate recommendations have no destination field in the legacy tree.
    // Holding them is safer than rendering an unlinked product and price as a
    // fitment-reviewed purchase candidate.
    delete node.alt;
    if (/TireSearchResults\.jsp|amazon\.com\/s\?|rockauto\.com\/en\/partsearch|moparpartsgiant\.com\/oem-/i.test(node.buyUrl || '')) {
      delete node.buyUrl; delete node.price; delete node.stock;
      node.spec = `${node.spec || ''}${node.spec ? ' · ' : ''}No purchase action is published until a live exact product destination is reviewed.`;
    }
  }
  Object.assign(trees.wheel.nodes.tire,{
    brand:'Pirelli P Zero AS Plus 3',partNo:'275/40R20 106Y XL · Discount Tire item 137905',price:'$317.00 each when reviewed',
    buyUrl:'https://www.discounttire.com/buy-tires/pirelli-p-zero-as-plus-3/p/137905',
    buyLabel:'View exact 275/40R20 tire at Discount Tire',
    spec:'275/40R20 106Y XL · 9–11 in approved rim range and 2,094 lb max load · verify the door placard and all installed sidewalls before ordering',
    life:TIRE_INSPECTION,
  });
  if (trees.engine.nodes.cabinFilter) Object.assign(trees.engine.nodes.cabinFilter,{
    partNo:'68071668AA → 68535614AA',price:'$26.96 when reviewed',
    buyUrl:'https://www.moparpartsgiant.com/parts/mopar-filter-cabin-air~68071668aa.html',
    buyLabel:'Buy exact cabin air filter',
    spec:String(trees.engine.nodes.cabinFilter.spec || '').replace(/\s*No purchase action is published until a live exact product destination is reviewed\.?/i,''),
  });
  for (const id of ['radCore','radAlum']) {
    const node = trees.engine.nodes[id];
    if (!node) continue;
    node.buyUrl='https://www.mishimoto.com/dodge-challenger-srt8-hellcat-radiator-2008-2016.html?___store=default';
    node.price='$825.95 sale price when reviewed';
    node.spec=String(node.spec || '').replace(/\s*No purchase action is published until a live exact product destination is reviewed\.?/i,'');
  }
  const originalUpgrade = trees.engine.nodes.radCore?.upgrade;
  if (originalUpgrade) {
    const radiatorUpgrade={...originalUpgrade,
      buyUrl:'https://www.mishimoto.com/dodge-challenger-srt8-hellcat-radiator-2008-2016.html?___store=default',
      price:'$825.95 sale price when reviewed',
      node:originalUpgrade.node?{...originalUpgrade.node,buyUrl:'https://www.mishimoto.com/dodge-challenger-srt8-hellcat-radiator-2008-2016.html?___store=default',price:'$825.95 sale price when reviewed'}:undefined,
    };
    for (const id of ['radCore','radAlum']) if (trees.engine.nodes[id]?.upgrade) trees.engine.nodes[id].upgrade=radiatorUpgrade;
  }
  const annotate = (id, issueId) => {
    for (const tree of Object.values(trees)) if (tree.nodes[id]) tree.nodes[id].knownIssue = {id:issueId,label:'Known issue on record'};
  };
  annotate('rotor','dodge-challenger-warped-front-brake-rotors-causing-pedal-pulsation-steering-s');
  annotate('radCore','dodge-challenger-radiator-failure');
  annotate('transFluid','dodge-challenger-zf8-trans-2015');
  return trees;
}
function modelSpecificTrees(twin) {
  const context = DEMO_TREE_CONTEXT[twin.id];
  if (!context) throw new Error(`No model-specific tree context for ${twin.id}`);
  const modelLabel=`${twin.identity.year} ${twin.identity.make} ${twin.identity.model} ${twin.identity.trim}`.trim();
  const wheelNodes = {
    wheelRoot:demoNode({label:'Wheel, Tire & Brakes',sub:context.wheel,img:'/twin-stage/parts/part-wheel.webp',kids:['tire','brakes'],group:true,where:'All four corners',spec:'Use the tire placard and installed wheel package before ordering',life:'Inspect tires and brakes at every scheduled service'}),
    tire:demoNode({label:context.service?.tire?.rotationAllowed===false?'Staggered Tires':'Tires & Rotation',sub:`${modelLabel} installed-tire ${context.service?.tire?.rotationAllowed===false?'condition':'and rotation'} record`,img:'/twin-stage/parts/part-tire.webp',where:'All four corners',spec:context.service?.tire?.spec || 'Verify the driver-door placard and every installed sidewall before ordering; record the installed tire and expected lifespan here',life:TIRE_INSPECTION,...serviceDetails(context.service?.tire,context.service?.tire?.rotationAllowed===false?'tire_replacement':'tire_rotation',context.service?.tire?.rotationAllowed===false?'Tire inspection / replacement':'Tire rotation / inspection')}),
    brakes:demoNode({label:'Brake System',sub:`${modelLabel} pads, rotors, calipers and hydraulic fluid`,img:'/twin-stage/parts/part-caliper.webp',kids:['frontRotor','rearBrake','brakeFluid'],group:true,where:'Front and rear axles plus master-cylinder hydraulic circuit',spec:`Inspect all four ${twin.identity.model} brake corners and the hydraulic circuit; an axle-level symptom is not proof that a particular product is required`,life:'Pads and rotors are condition-based; brake fluid follows its documented time interval'}),
    frontRotor:demoNode({label:'Front Rotors & Pads',sub:`${modelLabel} front-axle brake service`,img:'/twin-stage/parts/part-rotor.webp',where:'Front axle, both sides',spec:context.service?.brake?.spec || 'Measure both front pad sets, rotor thickness and runout; record the actual installed parts before replacement',life:BRAKE_INSPECTION,...serviceDetails({...context.service?.brake,manualFirstDeadline:false},'brake_service','Front brake inspection / service')}),
    rearBrake:demoNode({label:'Rear Rotors & Pads',sub:`${modelLabel} rear-axle brake service`,img:'/twin-stage/parts/part-rotor.webp',where:'Rear axle, both sides, including parking-brake hardware as equipped',spec:'Measure both rear pad sets and rotor thickness/runout; inspect caliper operation and parking-brake hardware. No rear part number or purchase link is asserted without axle/RPO-level fitment.',life:BRAKE_INSPECTION,...serviceDetails({manualFirstDeadline:false},'brake_service','Rear brake inspection / service')}),
    brakeFluid:demoNode({label:'Brake Fluid',sub:`${modelLabel} hydraulic brake-fluid circuit`,img:'/twin-stage/parts/part-brake-fluid.webp',where:'Master-cylinder reservoir, hydraulic lines, ABS modulator and all four calipers',spec:context.service?.brakeFluid?.spec || UNCONFIRMED_BRAKE_FLUID.spec,life:'Inspect for leaks, contamination, moisture and a soft/spongy pedal; replace only to the confirmed factory time/specification branch',...serviceDetails(context.service?.brakeFluid || UNCONFIRMED_BRAKE_FLUID,'brake_fluid','Brake fluid service')}),
  };
  const engineIssueNodes=Object.fromEntries((context.engineIssues||[]).map((issue)=>[issue.key,issueNode(twin,issue,ISSUE_COMPONENT_ART[issue.key] || '/twin-stage/parts/part-engine.webp')]));
  const hoodKids=['oil','airFilter','sparkPlugs',...(context.timingIssue?['timing']:[]),...Object.keys(engineIssueNodes)];
  const engineNodes = {
    engineRoot:demoNode({label:'Engine',sub:context.engine,img:'/twin-stage/parts/part-engine.webp',kids:['hoodRoot','rad'],group:true,where:'Under the hood',spec:`${context.engine} · exact service fluids remain manual/VIN dependent`,life:'Follow the cited sample schedule; no Challenger specifications are reused'}),
    hoodRoot:demoNode({label:'Engine Service & Issues',sub:`${modelLabel} · ${context.engine}`,img:'/twin-stage/parts/part-engine.webp',kids:hoodKids,group:true,where:'Under the hood and engine controls',spec:'Service records and published engine issues for this exact demo identity',life:'Intervals are shown only where cited sample evidence exists'}),
    oil:demoNode({label:'Engine Oil & Filter',sub:`${modelLabel} · ${context.engine} scheduled service`,img:'/twin-stage/parts/part-oil-filter.webp',where:'Engine lubrication system',spec:context.service?.oil?.spec || `Confirm exact ${twin.identity.model} viscosity, approval and capacity in the owner manual`,life:'Service by the cited factory interval or oil-life monitor',...serviceDetails(context.service?.oil,'oil_change','Engine oil and filter')}),
    airFilter:demoNode({label:'Engine Air Filter',sub:`${modelLabel} dry replacement filter element`,img:'/twin-stage/parts/part-air-filter.webp',where:'Engine intake airbox',spec:context.service?.air?.spec || `Verify filter shape and part number against VIN`,life:'Inspect sooner in dust',...serviceDetails(context.service?.air,'air_filter','Engine air filter')}),
    sparkPlugs:demoNode({label:'Spark Plugs',sub:`${modelLabel} ignition service`,img:'/twin-stage/parts/part-spark-plug.webp',unlogged:Boolean(context.service?.spark),where:'Cylinder heads beneath the ignition coils',spec:context.service?.spark?.spec || 'Have the exact engine/VIN matched to the owner-manual plug specification and supersession before ordering; the component image is illustrative and is not a fitment claim.',life:'Replace at the exact owner-manual interval; diagnose misfire, hard starting, rough idle or damaged coils before treating plugs as the cause',...serviceDetails(context.service?.spark || {},'spark_plugs','Spark-plug service')}),
    rad:demoNode({label:'Radiator & Coolant',sub:`${modelLabel} cooling circuit`,img:'/twin-stage/parts/part-radiator.webp',kids:['coolant'],group:true,where:'Front cooling module and engine coolant circuit',spec:`Pressure-test the ${context.engine} cooling circuit and verify exact coolant chemistry before service`,life:'Radiator replacement is condition-based; coolant follows its own factory interval',knownIssue:context.radiatorIssue?{...context.radiatorIssue,href:issueHref(twin,context.radiatorIssue.id)}:undefined,...serviceDetails(context.service?.coolant,'cooling_system_service','Cooling-system / radiator service')}),
    coolant:demoNode({label:'Engine Coolant',sub:`${modelLabel} factory coolant chemistry`,img:'/twin-stage/parts/part-antifreeze.webp',where:'Cooling circuit and expansion reservoir',spec:context.service?.coolant?.spec || 'Never mix coolant chemistries; verify the exact manual/VIN branch',life:'Use the factory time-and-mileage schedule',...serviceDetails(context.service?.coolant,'coolant_flush','Engine coolant')}),
    ...(context.timingIssue?{timing:demoNode({label:'Timing Chain System',sub:`${modelLabel} 3.6L V6 chain, guides and tensioners`,img:'/twin-stage/parts/part-engine.webp',where:'Front and upper engine timing drive',spec:'Diagnose correlation faults and mechanical timing before parts replacement',life:'Known-issue evidence is model/engine specific; no replacement mileage is invented',knownIssue:{...context.timingIssue,href:issueHref(twin,context.timingIssue.id)}})}:{}),
    ...engineIssueNodes,
  };
  const transmissionIssueNodes=Object.fromEntries((context.transmissionIssues||[]).map((issue)=>[issue.key,issueNode(twin,issue,ISSUE_COMPONENT_ART[issue.key] || '/twin-stage/parts/part-transmission.webp')]));
  const transmissionNodes = {
    trx:demoNode({label:'Transmission & Driveline',sub:`${modelLabel} · ${context.transmission}`,img:'/twin-stage/parts/part-transmission.webp',kids:['transFluid','driveline',...Object.keys(transmissionIssueNodes)],group:true,where:'Powertrain driveline',spec:`${context.transmission} · confirm VIN/drivetrain before any parts or fluid order`,life:'Use the cited vehicle schedule and operating-condition branch'}),
    transFluid:demoNode({label:twin.id==='murano'||twin.id==='kicks'?'CVT Fluid Service':'Transmission Fluid',sub:`${modelLabel} transmission fluid branch`,img:twin.id==='murano'||twin.id==='kicks'?'/twin-stage/parts/part-cvt-fluid.webp':'/twin-stage/parts/part-transmission-fluid.webp',where:'Transmission sump and fill/check circuit',spec:context.service?.trans?.spec || `Fluid type, level temperature and procedure must match this ${context.transmission}`,life:'Severe use may shorten the factory interval',...serviceDetails(context.service?.trans,'transmission_fluid_auto','Transmission fluid')}),
    driveline:demoNode({label:context.service?.driveline?.label || 'Differential / Driveline',sub:`${modelLabel} drivetrain-specific service branch`,img:context.service?.driveline?.img,imageUnavailable:!context.service?.driveline?.img,where:context.service?.driveline?.where || 'Final drive, differential, transfer case or integrated transaxle as equipped',spec:context.service?.driveline?.spec || 'Configuration must be confirmed before fluid or parts selection',life:'A separate node is retained for every Twin, but service logging is enabled only when a separate fluid branch is confirmed',...(context.service?.driveline?.separateService ? serviceDetails(context.service.driveline,'differential_fluid','Differential / driveline fluid') : context.service?.driveline)}),
    ...transmissionIssueNodes,
  };
  const cabinIssueNodes=Object.fromEntries((context.cabinIssues||[]).map((issue)=>[issue.key,issueNode(twin,issue,ISSUE_COMPONENT_ART[issue.key])]));
  const wiperNodes = {
    wiperRoot:demoNode({label:context.cabinIssues?.length?'Visibility, Camera & Cabin':'Windshield Wipers & Cabin Air',sub:`${modelLabel} front visibility and cabin-air systems`,img:'/twin-stage/parts/part-wipers.webp',kids:['wiperBlades','washerFluid','cabinFilter',...Object.keys(cabinIssueNodes)],group:true,where:'Windshield, cowl and applicable cabin/driver-assistance systems',spec:`Have blade connectors and any unlisted cabin-filter fitment matched to the exact ${twin.identity.model} before ordering`,life:'Inspect blades for streaking/chatter and the cabin filter for restricted airflow or odor'}),
    wiperBlades:demoNode({label:'Front Wiper Blades',sub:`${modelLabel} driver and passenger pair`,img:'/twin-stage/parts/part-wiper-driver.webp',where:'Front wiper arms',spec:`No ${twin.identity.model} blade length or connector fitment is asserted in this demo`,life:'Replace when visibility degrades; no sample service is logged'}),
    washerFluid:demoNode({label:'Washer Fluid',sub:`${modelLabel} windshield washer reservoir`,img:'/twin-stage/parts/part-washer-fluid.webp',where:'Under-hood washer reservoir',spec:'Use climate-appropriate washer fluid; do not substitute engine coolant',life:'Check level during routine service'}),
    cabinFilter:demoNode({label:'Cabin Air Filter',sub:`${modelLabel} passenger-compartment filtration`,img:'/twin-stage/parts/part-cabin-filter.webp',where:'HVAC fresh-air inlet / filter housing',spec:context.service?.cabin?.spec || 'Have the filter matched to the VIN and installed housing; replace sooner for weak airflow, persistent fogging, odor, heavy dust or allergens',life:'Condition and time based; no generic filter or interval is asserted when the exact manual branch is unresolved',...serviceDetails(context.service?.cabin || {},'cabin_filter','Cabin air filter')}),
    ...cabinIssueNodes,
  };
  const trees = {
    wheel:{label:'Wheel, Tire & Brakes',short:'Wheels',root:'wheelRoot',nodes:wheelNodes},
    engine:{label:'Engine',short:'Engine',root:'engineRoot',nodes:engineNodes},
    trans:{label:'Transmission',short:'Transmission',root:'trx',nodes:transmissionNodes},
    wipers:{label:context.cabinIssues?.length?'Visibility, Camera & Cabin':'Windshield Wipers',short:context.cabinIssues?.length?'Cabin & safety':'Wipers',root:'wiperRoot',nodes:wiperNodes},
  };
  trees.car={label:'Whole car',short:'Whole car',root:'car',nodes:{
    car:demoNode({label:`${twin.identity.year} ${twin.identity.make} ${twin.identity.model}`,sub:`${twin.identity.trim} · ${twin.identity.engine}`,img:twin.art.base,kids:['wheelRoot','engineRoot','trx','wiperRoot'],group:true,where:'Public demo vehicle',spec:'Sample state only; owner history is not inferred',life:'Four mapped service systems'}),
    ...wheelNodes,...engineNodes,...transmissionNodes,...wiperNodes,
  }};
  return cloneTrees(trees);
}

function applySampleState(trees, twin) {
  const unique = new Map();
  for (const tree of Object.values(trees)) for (const [id,node] of Object.entries(tree.nodes)) if (!unique.has(id)) unique.set(id,node);
  for (const node of unique.values()) {
    if (node.availability === 'unavailable') node.availability = 'sample';
    if (!node.group && (typeof node.riskAt === 'number' || node.dueDate)) node.unlogged = true;
  }
  for (const record of twin.sampleState.records) {
    const node = unique.get(record.node);
    if (!node) throw new Error(`Unknown sample node ${record.node} for ${twin.id}`);
    node.availability = 'sample';
    node.unlogged = false;
    node.servicedAt = record.lastServiceMileage;
    node.riskAt = record.intervalMiles;
    node.sampleRecord = true;
    node.intervalSource = record.intervalSource;
    node.sub = `Sample record · last at ${record.lastServiceMileage.toLocaleString()} mi · every ${record.intervalMiles.toLocaleString()} mi`;
  }
  return trees;
}

export const TWIN_TREE_RESOLVERS = {
  challenger: challengerTrees,
  murano: modelSpecificTrees,
  nautilus: modelSpecificTrees,
  xt6: modelSpecificTrees,
  kicks: modelSpecificTrees,
  mdx: modelSpecificTrees,
  aviator: modelSpecificTrees,
  camaro: modelSpecificTrees,
};

function applyCamaroTransmission(trees, transmission) {
  const fluid = trees?.trans?.nodes?.transFluid;
  const carFluid = trees?.car?.nodes?.transFluid;
  if (!fluid) return trees;
  if (transmission === 'automatic') Object.assign(fluid,{label:'10L90 Automatic Transmission Fluid',partNo:'19352619 / 10-4107',brand:'ACDelco DEXRON ULV Automatic Transmission Fluid',price:'$10.92 MSRP / qt',buyUrl:'https://parts.chevrolet.com/product/acdelco-gm-original-equipment-dexron-ulv-automatic-transmission-fluid-1-qt-19352619',spec:'10-speed ZL1 branch · DEXRON ULV only',maintenanceType:'transmission_fluid_auto'});
  if (transmission === 'manual') Object.assign(fluid,{label:'TR-6060 Manual Transmission Fluid',partNo:'88861800',brand:'GM Manual Transmission Fluid',sourceUrl:CAMARO_OWNER_MANUAL,sourceLabel:'2019 Camaro Owner Manual, p. 330',spec:'6-speed V8 manual branch · GM part 88861800; dealer/source action only until a live exact-fit product destination and current price are reviewed',maintenanceType:'transmission_fluid_manual'});
  if (!transmission) {
    delete trees.trans.nodes.transFluid;
    trees.trans.nodes.trx.kids = trees.trans.nodes.trx.kids.filter((id)=>id!=='transFluid');
    if (trees.car?.nodes) {
      delete trees.car.nodes.transFluid;
      if (trees.car.nodes.trx) trees.car.nodes.trx.kids = trees.car.nodes.trx.kids.filter((id)=>id!=='transFluid');
    }
  } else if (carFluid) Object.assign(carFluid, fluid);
  const brakeFluid = trees?.wheel?.nodes?.brakeFluid;
  if (brakeFluid) {
    if (transmission === 'automatic') brakeFluid.serviceIntervalMonths=60;
    if (transmission === 'manual') brakeFluid.serviceIntervalMonths=36;
  }
  return trees;
}

export function resolveTwinTrees(twin, options = {}) {
  const resolver = TWIN_TREE_RESOLVERS[twin?.treeResolver];
  if (!resolver) throw new Error(`No tree resolver for ${twin?.id ?? 'unknown twin'}`);
  let trees = applySampleState(resolver(twin, options.transmission), twin);
  if (twin.id === 'camaro') trees = applyCamaroTransmission(trees, options.transmission);
  if (trees.car?.nodes?.[trees.car.root]) {
    const label = `${twin.identity.year} ${twin.identity.make} ${twin.identity.model} ${twin.identity.trim}`.trim();
    trees.car.label = label;
    trees.car.nodes[trees.car.root] = {...trees.car.nodes[trees.car.root],label,img:twin.art.base};
  }
  return trees;
}

/** Build a model-specific owner tree without leaking fictional demo history. */
export function buildModelOwnerTrees(twin, records = [], miles = null, transmission = null, evaluatedAt = new Date().toISOString()) {
  const trees = modelSpecificTrees(twin);
  if (twin.id === 'camaro') {
    applyCamaroTransmission(trees, transmission);
  }
  const unique = new Map();
  for (const tree of Object.values(trees)) for (const [id,node] of Object.entries(tree.nodes)) if (!unique.has(id)) unique.set(id,node);
  // Generic legacy transmission-fluid rows are intentionally not assigned to
  // either branch. Re-selecting automatic/manual must never reinterpret old
  // history as proof that the newly selected branch was serviced.
  const aliases = (node) => [node.maintenanceType];
  for (const node of unique.values()) {
    node.availability = 'owner';
    delete node.sampleRecord; delete node.servicedAt; delete node.servicedDate; delete node.dueMileage; delete node.dueDate; delete node.overdueByDate;
    if (!node.maintenanceType) continue;
    const record = records.filter((item) => aliases(node).includes(item.type) && typeof item.mileage === 'number' && item.mileage <= miles).sort((a,b)=>b.mileage-a.mileage)[0];
    if (!record) {
      node.unlogged = true;
      if (node.firstServiceDeadline && node.serviceIntervalMiles) node.dueMileage = node.serviceIntervalMiles;
      continue;
    }
    node.unlogged = false; node.servicedAt = record.mileage; node.servicedDate = record.date;
    node.dueMileage = record.nextDueMileage ?? (node.serviceIntervalMiles ? record.mileage + node.serviceIntervalMiles : null);
    node.dueDate = record.nextDueDate || null;
    node.overdueByDate = Boolean(node.dueDate && Date.parse(node.dueDate) <= Date.parse(evaluatedAt));
  }
  return trees;
}

export function collectHotspotNodes(trees, hotspot) {
  const tree = trees[hotspot.branch];
  if (!tree) return [];
  const start = hotspot.node || tree.root;
  if (!tree.nodes[start]) return [];
  const ids = [];
  const visit = (id) => { if (ids.includes(id) || !tree.nodes[id]) return; ids.push(id); for (const child of tree.nodes[id].kids || []) visit(child); };
  visit(start);
  return ids.map((id) => ({id, ...tree.nodes[id]}));
}

export function summarizeEvidence(nodes, miles) {
  const known = nodes.filter((node) => node.knownIssue?.id);
  const validMiles = typeof miles === 'number' && Number.isFinite(miles) && miles >= 0;
  const serviceLeaves = nodes.filter((node) => (!node.group || node.maintenanceType) && (
    node.unlogged || (typeof node.riskAt === 'number' && node.riskAt > 0) || !!node.dueDate
  ));
  const firstDeadlineDue = validMiles ? serviceLeaves.filter((node) => node.unlogged && node.firstServiceDeadline && (
    (typeof node.dueMileage === 'number' && node.dueMileage < miles) || node.overdueByDate === true
  )) : [];
  const logged = validMiles ? serviceLeaves.flatMap((node) => {
    const explicit = typeof node.servicedAt === 'number' && Number.isFinite(node.servicedAt) && node.servicedAt >= 0
      ? node.servicedAt
      : null;
    // Demo trees intentionally encode their sample clock as riskAt from zero.
    // Owner trees mark an absent record `unlogged`, so they can never inherit
    // that demo baseline.
    const servicedAt = explicit ?? (!node.unlogged && node.availability !== 'unavailable' ? 0 : null);
    const hasDateEvidence = typeof node.servicedDate === 'string' && Number.isFinite(Date.parse(node.servicedDate));
    return servicedAt != null && servicedAt <= miles && (!node.dueDate || hasDateEvidence) ? [{node,servicedAt}] : [];
  }) : [];
  const complete = validMiles && serviceLeaves.length > 0 && logged.length === serviceLeaves.length;
  const observedDue = logged.filter(({node,servicedAt}) => {
    const dueMileage = typeof node.dueMileage === 'number' ? node.dueMileage : (typeof node.riskAt === 'number' ? servicedAt + node.riskAt : null);
    return node.overdueByDate || (dueMileage != null && dueMileage < miles);
  }).concat(firstDeadlineDue.map((node)=>({node,servicedAt:null})));
  const observedWatch = logged.filter(({node,servicedAt}) => {
    if (node.overdueByDate || typeof node.riskAt !== 'number') return false;
    const dueMileage = typeof node.dueMileage === 'number' ? node.dueMileage : servicedAt + node.riskAt;
    return dueMileage > miles && dueMileage - miles <= node.riskAt * .2;
  });
  const due = complete ? observedDue : [];
  const watch = complete ? observedWatch : [];
  const counts = complete ? {due:due.length,watch:watch.length} : {due:null,watch:null};
  let serviceStatus;
  let serviceLabel;
  if (!complete) {
    const unavailable = nodes.length === 0 || nodes.every((node) => node.availability === 'unavailable');
    serviceStatus = observedDue.length ? 'overdue' : unavailable ? 'unavailable' : 'unlogged';
    serviceLabel = observedDue.length
      ? `${observedDue.length} overdue · Service history incomplete`
      : unavailable ? 'Service evidence unavailable' : logged.length ? 'Service history incomplete' : 'No service event logged';
  } else if (due.length) {
    serviceStatus = 'overdue';
    serviceLabel = `${due.length} overdue`;
  } else {
    serviceStatus = 'on-track';
    serviceLabel = watch.length ? `${watch.length} to watch` : 'On track';
  }
  if (known.length) return {status:'known-issue', label:`Known issue on record · ${serviceLabel}`,serviceStatus,serviceLabel,...counts,knownIssues:known.map((node) => node.knownIssue)};
  return {status:serviceStatus,label:serviceLabel,serviceStatus,serviceLabel,...counts,knownIssues:[]};
}

/** Remove catalog controls that no longer exist in the exact owner tree. */
export function filterTwinCatalogForTrees(twin, trees) {
  return {
    ...twin,
    hotspots:twin.hotspots.filter((hotspot) => trees[hotspot.branch] && (!hotspot.node || trees[hotspot.branch].nodes[hotspot.node])),
    systems:twin.systems.filter((system) => trees[system.branch]),
  };
}

export function answerTwinQuestion(twin, trees, query) {
  const text = String(query || '').trim().toLowerCase();
  const all = Object.values(trees).flatMap((tree) => Object.values(tree.nodes));
  const selected = all.map((node) => {
    const words = String(node.label || '').toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3);
    return {node,score:words.reduce((sum,word)=>sum+(text.includes(word)?word.length:0),0)};
  }).sort((a,b)=>b.score-a.score)[0];
  if (!selected || selected.score === 0) return `${twin.identity.model}: that field is unavailable in this mapped tree.`;
  const fields = [selected.node.label, selected.node.partNo && `Part ${selected.node.partNo}`, selected.node.price, selected.node.where, selected.node.spec, selected.node.life, selected.node.buyUrl && `Buy: ${selected.node.buyUrl}`, selected.node.dueNote].filter((value) => typeof value === 'string' && value.trim());
  return `${twin.identity.model}: ${fields.join(' · ')}`;
}

export function buildDemoTwinPresentation(twin, options = {}) {
  const trees = options.trees || resolveTwinTrees(twin, {transmission:options.transmission});
  const mileage = Object.prototype.hasOwnProperty.call(options, 'miles') ? options.miles : twin.demoMileage;
  const mode = options.mode || 'demo';
  const systems = twin.systems.filter((system) => trees[system.branch]);
  const hotspots = twin.hotspots.filter((hotspot) => trees[hotspot.branch] && (!hotspot.node || trees[hotspot.branch].nodes[hotspot.node])).map((hotspot) => {
    const actual = summarizeEvidence(collectHotspotNodes(trees, hotspot), mileage);
    const evidence = actual;
    return {...hotspot, ...evidence};
  });
  const allNodes = collectHotspotNodes(trees, {branch:'car'});
  const summary = summarizeEvidence(allNodes, mileage);
  const identity = twin.identity;
  const mileageLabel = typeof mileage === 'number' ? `${mileage.toLocaleString()} mi${mode === 'demo' ? ' · sample' : ''}` : 'Mileage unavailable';
  return {
    twin, trees, identity, mileage, mileageLabel, mode, systems, hotspots, summary,
    chrome: mode === 'owner' ? `Your ${identity.year} ${identity.make} ${identity.model}` : `${identity.year} ${identity.make} ${identity.model} demo`,
    guidance:{intro:`${identity.model} mapped tree. Optional service fields remain unavailable until supported.`,answer:(query) => answerTwinQuestion(twin,trees,query)},
    nextService: options.nextService ?? null,
    recent: mode === 'owner' ? (options.recent || []) : [],
    wholeCarArt:twin.art.base,
  };
}

export function attachKnownIssueDetails(trees, issues = []) {
  const byId = new Map(issues.filter((issue) => issue?.id).map((issue) => [issue.id, issue]));
  for (const tree of Object.values(trees || {})) {
    for (const node of Object.values(tree?.nodes || {})) {
      const issue = node?.knownIssue?.id ? byId.get(node.knownIssue.id) : null;
      if (!issue) continue;
      node.knownIssue = {
        ...node.knownIssue,
        label:issue.title || node.knownIssue.label,
        href:issue.href || node.knownIssue.href,
        description:issue.description || null,
        solution:issue.solution || null,
        fixParts:Array.isArray(issue.fixParts) ? issue.fixParts : [],
      };
    }
  }
  return trees;
}

export function mergeCatalogEvidenceIntoOwnerTrees(twin, ownerTrees, miles) {
  const catalogTrees = resolveTwinTrees(twin);
  const result = cloneTrees(ownerTrees);
  for (const [branch, catalogTree] of Object.entries(catalogTrees)) {
    // An absent owner branch is meaningful (for example an unconfirmed dual
    // transmission). Catalog/demo structure must never silently add it back.
    if (!result[branch]) continue;
    for (const [id, catalogNode] of Object.entries(catalogTree.nodes)) {
      const ownerNode = result[branch].nodes[id];
      // Owner branch shape is authoritative. Catalog evidence may annotate an
      // existing node, but must never reinsert a node removed by fitment.
      if (!ownerNode) continue;
      if (catalogNode.knownIssue?.id) ownerNode.knownIssue = {...catalogNode.knownIssue};
      if (ownerNode.servicedAt > miles) { delete ownerNode.servicedAt; delete ownerNode.riskAt; ownerNode.unlogged = true; }
    }
  }
  if (result.car?.nodes?.[result.car.root]) {
    const label = `${twin.identity.year} ${twin.identity.make} ${twin.identity.model} ${twin.identity.trim}`.trim();
    result.car.label = label;
    result.car.nodes[result.car.root] = {...result.car.nodes[result.car.root],label,sub:'Owner garage vehicle',where:'Your garage'};
    delete result.car.nodes[result.car.root].partNo;
    delete result.car.nodes[result.car.root].spec;
  }
  return result;
}
