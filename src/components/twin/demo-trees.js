import { TT_TREES } from './stage/TechTree';

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

const UNSOURCED = 'Not sourced for this demo';
const DEMO_TREE_CONTEXT = {
  nautilus:{
    engine:'2.0L EcoBoost turbocharged I4', transmission:'8-speed SelectShift automatic',
    wheel:'2019 Nautilus wheel and tire package',
    service:{oil:{interval:10000,partNo:'FL-910S',brand:'Motorcraft engine oil filter',price:'Verify current retailer price',spec:'Use SAE 5W-30 meeting the owner-manual Ford specification'},air:{interval:30000,partNo:'FA-1912',brand:'Motorcraft engine air filter',price:'Verify current retailer price'},coolant:{interval:100000,partNo:'VC-13DL-G',brand:'Motorcraft Yellow Prediluted Antifreeze/Coolant',price:'Verify current retailer price'},trans:{interval:150000,partNo:'XT-12-QULV',brand:'Motorcraft MERCON ULV',price:'Verify current retailer price',spec:'8F35 automatic; use the manual level-temperature procedure'},driveline:{label:'PTU / Rear Differential',interval:100000,partNo:'Drivetrain confirmation required',brand:'Motorcraft driveline fluid branch',price:'—',spec:'FWD and AWD paths differ; no rear differential product is asserted until drivetrain is confirmed'},tire:{interval:10000},brake:{interval:40000}},
    radiatorIssue:{id:'lincoln-nautilus-2-0l-ecoboost-coolant-loss-egr-cooler-leak-low-coolant-white',label:'2.0L EcoBoost coolant loss / EGR cooler leak'},
    engineIssues:[{key:'startStop',id:'lincoln-nautilus-auto-start-stop-malfunction-engine-won-t-auto-restart',label:'Auto Start-Stop / 12V battery malfunction',sub:'2019 Nautilus may fail to restart after an automatic stop',where:'12V battery, charging system and powertrain controls'}],
    transmissionIssues:[{key:'transShudder',id:'lincoln-nautilus-8f35-8-speed-automatic-shudder-buck-jerk-under-35-mph',label:'8F35 low-speed shudder',sub:'Shudder, buck or jerk below 35 mph',where:'8F35 transmission and calibration branch'}],
    cabinIssues:[{key:'sync',id:'lincoln-nautilus-sync-3-apim-infotainment-freezes-black-screens-reboots',label:'SYNC 3 / APIM freezes and reboots',sub:'2019 Standard-trim infotainment issue',where:'Center display and APIM behind the instrument panel'}],
  },
  murano:{engine:'3.5L VQ35DE V6',transmission:'Xtronic continuously variable transmission',wheel:'2023 Murano SV wheel and tire package',service:{oil:{interval:7500,partNo:'15208-65F0E',brand:'Genuine Nissan oil filter',price:'$9.53 MSRP',buyUrl:'https://parts.nissanusa.com/v-2023-nissan-murano--sv--3-5l-v6-gas/engine--engine-parts',spec:'SAE 0W-20; verify capacity in the 2023 Owner\'s Manual'},air:{interval:30000,partNo:'16546-5AA1A',brand:'Genuine Nissan engine air filter',price:'Verify current dealer price'},coolant:{interval:105000,partNo:'999MP-L25500P',brand:'Nissan Blue Long Life Antifreeze/Coolant',price:'Verify current retailer price'},trans:{interval:60000,partNo:'999MP-NS300P',brand:'Nissan NS-3 CVT Fluid',price:'Verify current retailer price',spec:'NS-3 only; use the temperature-dependent level procedure'},driveline:{label:'Transfer Case / Rear Differential',interval:60000,partNo:'AWD confirmation required',brand:'Nissan driveline fluid branch',price:'—',spec:'FWD has no rear final-drive service; AWD requires separate transfer/rear final-drive checks'},tire:{interval:7500},brake:{interval:40000}},cabinIssues:[
    {key:'aeb',id:'nissan-murano-automatic-emergency-braking-forward-collision-phantom-activa',label:'AEB phantom activation',sub:'Forward-collision system may brake without a true obstacle',where:'Forward driver-assistance sensing and control system'},
    {key:'battery',id:'nissan-murano-battery-drain-and-no-start-2021',label:'Battery drain / no-start',sub:'Telematics or infotainment modules may remain awake',where:'12V battery and module sleep-current circuit'},
    {key:'seatTrack',id:'nissan-murano-front-driver-seat-frametrack-2021',label:'Driver-seat frame / track movement',sub:'Seat may rock, click or move unexpectedly',where:'Front driver-seat frame and floor-mounted track'},
    {key:'frontRadar',id:'nissan-murano-front-radarsensor-malfunctions-triggering-2021',label:'Front radar / sensor malfunction',sub:'AEB, ICC and forward-collision warnings may appear',where:'Front radar sensor and its mounting/alignment branch'},
    {key:'rearCamera',id:'nissan-murano-rearview-camera-image-blank-2021',label:'Rear-view camera image failure',sub:'Camera image may be blank, distorted or intermittent',where:'Liftgate camera, harness and AV control unit'},
  ]},
  xt6:{
    engine:'3.6L naturally aspirated V6',transmission:'9-speed automatic transmission',wheel:'2020 XT6 Sport wheel and tire package',
    service:{oil:{interval:7500,partNo:'PF63 / 12707246',brand:'ACDelco GM Original Equipment oil filter',price:'Verify current retailer price',spec:'SAE 5W-30 dexos1; verify capacity in the 2020 Owner\'s Manual'},air:{interval:45000,partNo:'A3248C',brand:'ACDelco engine air filter',price:'Verify current retailer price'},coolant:{interval:150000,partNo:'12378390',brand:'ACDelco DEX-COOL 50/50 premix',price:'Verify current retailer price'},trans:{interval:45000,partNo:'10-4107 / 19417577',brand:'ACDelco DEXRON ULV automatic transmission fluid',price:'Verify current retailer price',spec:'9T65 branch; verify exact fluid bulletin/VIN before purchase'},driveline:{label:'Power Transfer Unit / Rear Drive Module',interval:45000,partNo:'AWD confirmation required',brand:'GM driveline fluid branch',price:'—',spec:'Sport drivetrain must be confirmed before selecting PTU or rear-drive-module fluid'},tire:{interval:7500},brake:{interval:40000}},
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
    service:{oil:{interval:10000,partNo:'15208-65F0E',brand:'Genuine Nissan oil filter',price:'$9.53 MSRP',buyUrl:'https://parts.nissanusa.com/v-2025-nissan-kicks--sv--2-0l-l4-gas/engine--hardware-fasteners-and-fittings',spec:'Use the oil viscosity and capacity printed in the 2025 Owner\'s Manual for the confirmed trim'},air:{interval:40000,partNo:'16546-7LG0B',brand:'Genuine Nissan engine air filter',price:'$35.20 MSRP',buyUrl:'https://parts.nissanusa.com/v-2025-nissan-kicks--sv--2-0l-l4-gas/air-and-fuel-delivery--carburetion'},coolant:{interval:100000,partNo:'999MP-L25500P',brand:'Nissan Blue Long Life Antifreeze/Coolant',price:'Verify current retailer price',spec:'Blue long-life premix; confirm capacity in the 2025 Owner\'s Manual'},trans:{interval:60000,partNo:'999MP-NS300P',brand:'Nissan NS-3 CVT Fluid',price:'Verify current retailer price',spec:'NS-3 only; level procedure and capacity require the exact CVT'},driveline:{label:'AWD Coupling / FWD Transaxle',interval:20000,partNo:'Configuration required',brand:'No product until FWD/AWD is confirmed',price:'—',spec:'AWD coupling fluid is a separate severe-use branch; FWD has no rear coupling service'},tire:{interval:10000},brake:{interval:40000}},
    cabinIssues:[
      {key:'cluster',id:'nissan-kicks-blank-partial-instrument-cluster-cold-start',label:'Instrument cluster blank on cold start',sub:'Published cluster/recall concern for the redesigned Kicks',where:'Instrument cluster and vehicle communication network'},
      {key:'camera',id:'nissan-kicks-center-display-goes-blank-reverse-no-backup-camera-image',label:'Backup-camera display may go blank',sub:'Published rear-visibility recall concern',where:'Center display, rear camera and video path'},
      {key:'infotainment',id:'nissan-kicks-infotainment-touchscreen-freezing-rebooting-carplay-disconne',label:'Infotainment freezes or reboots',sub:'Touchscreen and phone projection may disconnect',where:'Center display and infotainment control unit'},
    ],
  },
  mdx:{
    engine:'3.5L SOHC i-VTEC V6',transmission:'ZF 9-speed automatic',wheel:'2019 MDX Technology wheel and tire package',
    service:{oil:{interval:7500,partNo:'15400-RTA-003',brand:'Genuine Honda/Acura engine oil filter',price:'Verify current dealer price',spec:'Follow Maintenance Minder oil-life indication; verify oil capacity by drivetrain'},air:{interval:30000,partNo:'17220-5J2-A00',brand:'Genuine Acura engine air filter',price:'Verify current dealer price'},coolant:{interval:100000,partNo:'OL999-9011',brand:'Honda Type 2 coolant',price:'Verify current dealer price',spec:'Premixed Honda Type 2; never mix incompatible coolant chemistry'},trans:{interval:30000,partNo:'08200-9016A',brand:'Honda ATF Type 3.1',price:'Verify current dealer price',spec:'ZF 9-speed Type 3.1 branch; do not substitute DW-1'},driveline:{label:'Transfer Case / Rear Differential',interval:30000,partNo:'08200-9007A / 08200-9008',brand:'Honda HGO-1 / Acura DPSF-II',price:'Configuration required',spec:'FWD omits SH-AWD rear differential service; confirm VIN/drivetrain before purchase'},tire:{interval:7500},brake:{interval:40000}},
    engineIssues:[{key:'fuelPump',id:'acura-mdx-fuel-pump-impeller-deformation-causing-stall',label:'Fuel-pump impeller recall',sub:'Deformed impeller may cause stall or no-start',where:'In-tank fuel pump module'}],
    transmissionIssues:[
      {key:'zfHesitation',id:'acura-mdx-zf-9-speed-transmission-hesitation-hard-shifts-stalling',label:'ZF 9-speed hesitation / harsh shifts',sub:'Published shift-quality concern',where:'ZF 9-speed transmission and software branch'},
      {key:'converter',id:'acura-mdx-torque-converter-shudder-2014',label:'Torque-converter shudder',sub:'Judder under light throttle',where:'Transmission torque converter and fluid branch'},
    ],
    cabinIssues:[{key:'infotainment',id:'acura-mdx-infotainment-reboot-2014',label:'Infotainment freezes or reboots',sub:'Display/audio system may restart unexpectedly',where:'Center display and infotainment network'}],
  },
  aviator:{
    engine:'3.0L twin-turbocharged V6',transmission:'10-speed SelectShift automatic',wheel:'2026 Aviator Premiere wheel and tire package',
    service:{oil:{interval:10000,partNo:'FL-2062-A',brand:'Motorcraft engine oil filter',price:'Verify current retailer price',spec:'Confirm oil grade/capacity in the 2026 Owner\'s Manual'},air:{interval:30000,partNo:'VIN confirmation required',brand:'Motorcraft engine air filter',price:'—'},coolant:{interval:100000,partNo:'VC-13DL-G',brand:'Motorcraft Yellow Prediluted Antifreeze/Coolant',price:'Verify current retailer price',spec:'Use only the coolant specification printed in the 2026 Owner\'s Manual'},trans:{interval:150000,partNo:'XT-12-QULV',brand:'Motorcraft MERCON ULV',price:'Verify current retailer price',spec:'10R transmission; severe use may shorten interval'},driveline:{label:'Rear Differential / AWD PTU',interval:100000,partNo:'Drivetrain confirmation required',brand:'Motorcraft driveline fluid branch',price:'—',spec:'RWD and AWD service paths differ; no fluid is asserted until drivetrain is confirmed'},tire:{interval:10000},brake:{interval:40000}},
  },
  camaro:{
    engine:'6.2L supercharged LT4 V8',transmission:'TR-6060 6-speed manual or 10L90 10-speed automatic',wheel:'2019 Camaro ZL1 1LE staggered wheel and tire package',
    service:{
      oil:{interval:7500,partNo:'12640445 / PF64 → 25206377',brand:'ACDelco GM Original Equipment oil filter',price:'$5.55 when reviewed',buyUrl:'https://www.gmpartsgiant.com/parts/gm-filter-12640445.html',spec:'Use dexosR-approved SAE 0W-40; 10 qt with filter'},
      air:{interval:45000,partNo:'23323508 / A3223C',brand:'ACDelco GM Original Equipment engine air filter',price:'$81.00 MSRP',buyUrl:'https://parts.chevrolet.com/product/acdelco-gm-original-equipment-air-filter-23323508',spec:'2016–2024 Camaro ZL1/LT4 direct-fit branch; confirm the installed airbox remains stock'},
      coolant:{interval:150000,partNo:'12346290 / 10-101',brand:'ACDelco GM Original Equipment DEX-COOL coolant',price:'$33.48 MSRP / gal',buyUrl:'https://parts.chevrolet.com/product/acdelco-gm-original-equipment-dex-cool-extended-life-engine-coolant-1-gal-12346290',spec:'DEX-COOL; mix only to the concentration required by the owner manual and never mix incompatible chemistry'},
      trans:{interval:45000,partNo:'Transmission choice required',brand:'DEXRON ULV (automatic) or GM 88861800 (manual)',price:'Choose transmission',spec:'The 10L90 and TR-6060 use different fluids; user must select transmission'},
      driveline:{label:'Electronic Limited-Slip Differential',interval:45000,separateService:true,partNo:'88862624 / 10-4034',brand:'ACDelco DEXRON LS 75W-90 gear oil',price:'$44.28 MSRP',buyUrl:'https://parts.chevrolet.com/product/acdelco-gm-original-equipment-dexron-ls-75w-90-gear-oil-32-oz-88862624',spec:'eLSD rear axle; approximately 1.6 qt plus separate eLSD hydraulic circuit'},
      tire:{interval:7500,partNo:'305/30ZR19 front · 325/30ZR19 rear',brand:'Goodyear Eagle F1 SuperCar 3R',price:'$457.99 front · $479.99 rear when reviewed',buyUrl:'https://www.tirerack.com/tires/tires.jsp?autoMake=Chevrolet&autoModClar=&autoModel=Camaro+ZL1+1LE&autoYear=2019&fromCompare1=yes&frontTire=03YR9F1S3R&partnum=03YR9F1S3R&rearTire=23YR9F1S3R&tireMake=Goodyear&tireModel=Eagle+F1+Supercar+3R&vehicleSearch=true',spec:'Factory staggered ZL1 1LE sizes; tires cannot be rotated front-to-rear. Record the actual installed tire and its tread-life expectation.'},
      brake:{interval:30000,partNo:'84271643 rotor / 23399101 pad kit',brand:'GM ZL1 six-piston Brembo front brake service parts',price:'$544.36 rotor ea · $311.44 pad kit when reviewed',buyUrl:'https://www.gmpartsgiant.com/parts-list/2019-chevrolet-camaro/brakes/brake_caliper_front.html',spec:'ZL1 heavy-duty 390 mm front brake branch; confirm RPO/track-package fitment before ordering'},
    },
    transmissionIssues:[{key:'diffNoise',id:'chevy-camaro-rear-differential-noise',label:'Rear differential groan or chatter',sub:'Published eLSD/differential fluid concern',where:'Rear electronic limited-slip differential'}],
    cabinIssues:[{key:'hmi',id:'chevrolet-camaro-mylink-hmi-infotainment-module-failure',label:'MyLink screen freezes or reboots',sub:'Infotainment HMI may become intermittent',where:'Center display and HMI module'}],
  },
};

const demoNode = ({label,sub,img,kids=[],where,spec,life,group=false,knownIssue,unlogged=!group,...details}) => ({
  label,sub,img,kids,where,spec,life,group,knownIssue,unlogged,
  availability:'sample',partNo:details.partNo ?? UNSOURCED,price:details.price ?? 'Price not sourced for this demo',...details,
});
const serviceDetails = (service, maintenanceType, serviceLabel) => service ? ({
  ...service,maintenanceType,serviceLabel,serviceIntervalMiles:service.interval,
  riskAt:service.interval,firstServiceDeadline:service.manualFirstDeadline !== false,
}) : {};
const issueHref = (twin, id) => `/known-issues/${`${twin.identity.make}-${twin.identity.model}`.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}#${id}`;
const issueNode = (twin, issue, img) => demoNode({
  label:issue.label,sub:issue.sub,img,kids:[],where:issue.where,
  spec:`Published for the ${twin.identity.year} ${twin.identity.make} ${twin.identity.model}${twin.identity.trim?` ${twin.identity.trim}`:''}; diagnose the named system before replacing parts`,
  life:'Known-issue evidence only; no maintenance interval or replacement part is inferred',
  knownIssue:{id:issue.id,label:issue.label,href:issueHref(twin,issue.id)},unlogged:false,
});

function challengerTrees() {
  const trees = cloneTrees(TT_TREES);
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
    tire:demoNode({label:'Tires & Rotation',sub:`${modelLabel} installed-tire and rotation record`,img:'/twin-stage/parts/part-tire.webp',where:'All four corners',spec:`Verify the driver-door placard and the actual sidewall before ordering; users can record their installed tire and expected lifespan here`,life:'Rotation uses the vehicle schedule; replacement remains tread, age, climate and usage dependent',...serviceDetails(context.service?.tire,'tire_rotation','Tire rotation / inspection')}),
    brakes:demoNode({label:'Brake System',sub:`${modelLabel} pads, rotors, calipers and fluid`,img:'/twin-stage/parts/part-caliper.webp',kids:['frontRotor'],group:true,where:'Front and rear axles',spec:`Measure ${twin.identity.model} pad thickness and rotor condition before ordering`,life:'Condition-based inspection'}),
    frontRotor:demoNode({label:'Front Rotors & Pads',sub:`${modelLabel} front-axle brake service`,img:'/twin-stage/parts/part-rotor.webp',where:'Front axle, both sides',spec:'Record the actual installed pad/rotor brand and part number; replacement is condition-based',life:'Inspect thickness, runout and friction material at every tire service',...serviceDetails(context.service?.brake && {...context.service.brake,manualFirstDeadline:false},'brake_service','Front brake inspection / service')}),
  };
  const engineIssueNodes=Object.fromEntries((context.engineIssues||[]).map((issue)=>[issue.key,issueNode(twin,issue,'/twin-stage/parts/part-engine.webp')]));
  const hoodKids=['oil','airFilter',...(context.timingIssue?['timing']:[]),...Object.keys(engineIssueNodes)];
  const engineNodes = {
    engineRoot:demoNode({label:'Engine',sub:context.engine,img:'/twin-stage/parts/part-engine.webp',kids:['hoodRoot','rad'],group:true,where:'Under the hood',spec:`${context.engine} · exact service fluids remain manual/VIN dependent`,life:'Follow the cited sample schedule; no Challenger specifications are reused'}),
    hoodRoot:demoNode({label:'Engine Service & Issues',sub:`${modelLabel} · ${context.engine}`,img:'/twin-stage/parts/part-engine.webp',kids:hoodKids,group:true,where:'Under the hood and engine controls',spec:'Service records and published engine issues for this exact demo identity',life:'Intervals are shown only where cited sample evidence exists'}),
    oil:demoNode({label:'Engine Oil & Filter',sub:`${modelLabel} · ${context.engine} scheduled service`,img:'/twin-stage/parts/part-oil-filter.webp',where:'Engine lubrication system',spec:context.service?.oil?.spec || `Confirm exact ${twin.identity.model} viscosity, approval and capacity in the owner manual`,life:'Service by the cited factory interval or oil-life monitor',...serviceDetails(context.service?.oil,'oil_change','Engine oil and filter')}),
    airFilter:demoNode({label:'Engine Air Filter',sub:`${modelLabel} dry replacement filter element`,img:'/twin-stage/parts/part-air-filter.webp',where:'Engine intake airbox',spec:context.service?.air?.spec || `Verify filter shape and part number against VIN`,life:'Inspect sooner in dust',...serviceDetails(context.service?.air,'air_filter','Engine air filter')}),
    rad:demoNode({label:'Radiator & Coolant',sub:`${modelLabel} cooling circuit`,img:'/twin-stage/parts/part-radiator.webp',kids:['coolant'],group:true,where:'Front cooling module and engine coolant circuit',spec:`Pressure-test the ${context.engine} cooling circuit and verify exact coolant chemistry before service`,life:'Radiator replacement is condition-based; coolant follows its own factory interval',knownIssue:context.radiatorIssue?{...context.radiatorIssue,href:issueHref(twin,context.radiatorIssue.id)}:undefined,...serviceDetails(context.service?.coolant,'cooling_system_service','Cooling-system / radiator service')}),
    coolant:demoNode({label:'Engine Coolant',sub:`${modelLabel} factory coolant chemistry`,img:'/twin-stage/parts/part-antifreeze.webp',where:'Cooling circuit and expansion reservoir',spec:context.service?.coolant?.spec || 'Never mix coolant chemistries; verify the exact manual/VIN branch',life:'Use the factory time-and-mileage schedule',...serviceDetails(context.service?.coolant,'coolant_flush','Engine coolant')}),
    ...(context.timingIssue?{timing:demoNode({label:'Timing Chain System',sub:`${modelLabel} 3.6L V6 chain, guides and tensioners`,img:'/twin-stage/parts/part-engine.webp',where:'Front and upper engine timing drive',spec:'Diagnose correlation faults and mechanical timing before parts replacement',life:'Known-issue evidence is model/engine specific; no replacement mileage is invented',knownIssue:{...context.timingIssue,href:issueHref(twin,context.timingIssue.id)}})}:{}),
    ...engineIssueNodes,
  };
  const transmissionIssueNodes=Object.fromEntries((context.transmissionIssues||[]).map((issue)=>[issue.key,issueNode(twin,issue,'/twin-stage/parts/part-transmission.webp')]));
  const transmissionNodes = {
    trx:demoNode({label:'Transmission & Driveline',sub:`${modelLabel} · ${context.transmission}`,img:'/twin-stage/parts/part-transmission.webp',kids:['transFluid','driveline',...Object.keys(transmissionIssueNodes)],group:true,where:'Powertrain driveline',spec:`${context.transmission} · confirm VIN/drivetrain before any parts or fluid order`,life:'Use the cited vehicle schedule and operating-condition branch'}),
    transFluid:demoNode({label:twin.id==='murano'||twin.id==='kicks'?'CVT Fluid Service':'Transmission Fluid',sub:`${modelLabel} transmission fluid branch`,img:'/twin-stage/parts/part-transmission.webp',where:'Transmission sump and fill/check circuit',spec:context.service?.trans?.spec || `Fluid type, level temperature and procedure must match this ${context.transmission}`,life:'Severe use may shorten the factory interval',...serviceDetails(context.service?.trans,'transmission_fluid_auto','Transmission fluid')}),
    driveline:demoNode({label:context.service?.driveline?.label || 'Differential / Driveline',sub:`${modelLabel} drivetrain-specific service branch`,img:'/twin-stage/parts/part-transmission.webp',where:'Final drive, differential, transfer case or integrated transaxle as equipped',spec:context.service?.driveline?.spec || 'Configuration must be confirmed before fluid or parts selection',life:'A separate node is retained for every Twin, but service logging is enabled only when a separate fluid branch is confirmed',...(context.service?.driveline?.separateService ? serviceDetails(context.service.driveline,'differential_fluid','Differential / driveline fluid') : context.service?.driveline)}),
    ...transmissionIssueNodes,
  };
  const cabinIssueNodes=Object.fromEntries((context.cabinIssues||[]).map((issue)=>[issue.key,issueNode(twin,issue,twin.art.base)]));
  const wiperNodes = {
    wiperRoot:demoNode({label:context.cabinIssues?.length?'Visibility, Camera & Cabin':'Windshield Wipers',sub:`${modelLabel} front visibility system`,img:'/twin-stage/parts/part-wipers.webp',kids:['wiperBlades','washerFluid',...Object.keys(cabinIssueNodes)],group:true,where:'Windshield, cowl and applicable cabin/driver-assistance systems',spec:`Exact ${twin.identity.model} blade lengths and connectors remain explicitly unsourced`,life:'Inspect for streaking, chatter and torn rubber'}),
    wiperBlades:demoNode({label:'Front Wiper Blades',sub:`${modelLabel} driver and passenger pair`,img:'/twin-stage/parts/part-wiper-driver.webp',where:'Front wiper arms',spec:`No ${twin.identity.model} blade length or connector fitment is asserted in this demo`,life:'Replace when visibility degrades; no sample service is logged'}),
    washerFluid:demoNode({label:'Washer Fluid',sub:`${modelLabel} windshield washer reservoir`,img:'/twin-stage/parts/part-washer-fluid.webp',where:'Under-hood washer reservoir',spec:'Use climate-appropriate washer fluid; do not substitute engine coolant',life:'Check level during routine service'}),
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

export function resolveTwinTrees(twin) {
  const resolver = TWIN_TREE_RESOLVERS[twin?.treeResolver];
  if (!resolver) throw new Error(`No tree resolver for ${twin?.id ?? 'unknown twin'}`);
  const trees = applySampleState(resolver(twin), twin);
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
    const fluid = trees.trans.nodes.transFluid;
    if (transmission === 'automatic') Object.assign(fluid,{label:'10L90 Automatic Transmission Fluid',partNo:'19352619 / 10-4107',brand:'ACDelco DEXRON ULV Automatic Transmission Fluid',price:'$10.92 MSRP / qt',buyUrl:'https://parts.chevrolet.com/product/acdelco-gm-original-equipment-dexron-ulv-automatic-transmission-fluid-1-qt-19352619',spec:'10-speed ZL1 branch · DEXRON ULV only',maintenanceType:'transmission_fluid_auto'});
    if (transmission === 'manual') Object.assign(fluid,{label:'TR-6060 Manual Transmission Fluid',partNo:'88861800',brand:'GM Manual Transmission Fluid',price:'Verify current dealer price',sourceUrl:'https://contentdelivery.ext.gm.com/content/dam/cope/en_us/public/pdf_assets/active/owners_manuals_browse/19_CHEV_Camaro_HP_SUP_en_US_U_84075508B_2018NOV13_2P.pdf',sourceLabel:'2019 Camaro High Performance supplement',spec:'6-speed V8 manual branch · GM part 88861800',maintenanceType:'transmission_fluid_manual'});
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
    if (!node.maintenanceType || !node.serviceIntervalMiles) continue;
    const record = records.filter((item) => aliases(node).includes(item.type) && typeof item.mileage === 'number' && item.mileage <= miles).sort((a,b)=>b.mileage-a.mileage)[0];
    if (!record) {
      node.unlogged = true;
      if (node.firstServiceDeadline) node.dueMileage = node.serviceIntervalMiles;
      continue;
    }
    node.unlogged = false; node.servicedAt = record.mileage; node.servicedDate = record.date;
    node.dueMileage = record.nextDueMileage ?? record.mileage + node.serviceIntervalMiles;
    node.dueDate = record.nextDueDate || null;
    node.overdueByDate = Boolean(node.dueDate && Date.parse(node.dueDate) <= Date.parse(evaluatedAt));
  }
  if (twin.id === 'camaro') {
    if (!transmission) {
      delete trees.trans.nodes.transFluid;
      trees.trans.nodes.trx.kids = trees.trans.nodes.trx.kids.filter((id)=>id!=='transFluid');
      delete trees.car.nodes.transFluid;
      trees.car.nodes.trx.kids = trees.car.nodes.trx.kids.filter((id)=>id!=='transFluid');
    }
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
  const selected = all.find((node) => String(node.label || '').toLowerCase().split(/\s+/).some((word) => word.length > 3 && text.includes(word)));
  if (!selected) return `${twin.identity.model}: that field is unavailable in this mapped tree.`;
  const fields = [selected.label, selected.where, selected.spec, selected.life, selected.dueNote].filter((value) => typeof value === 'string' && value.trim());
  return `${twin.identity.model}: ${fields.join(' · ')}`;
}

export function buildDemoTwinPresentation(twin, options = {}) {
  const trees = options.trees || resolveTwinTrees(twin);
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
