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
const NAUTILUS_OWNER_MANUAL = 'https://cdn.dealereprocess.org/cdn/servicemanuals/lincoln/2019-nautilus.pdf';
const MURANO_OWNER_MANUAL = 'https://www.nissanusa.com/content/dam/Nissan/us/manuals-and-guides/murano/2023/2023-nissan-murano-owner-manual.pdf';
const KICKS_OWNER_MANUAL = 'https://www.nissan.ca/content/dam/Nissan/Canada/manuals-and-guides/kicks/2025/2025-Nissan-Kicks.pdf';
const MDX_OWNER_MANUAL = 'https://owners.acura.com/utility/download?path=/static/pdfs/2019/MDX/2019_MDX_Owners_Manual.pdf';
const AVIATOR_OWNER_MANUAL = 'https://www.fordservicecontent.com/Ford_Content/Catalog/owner_information/26MY_Aviator_OM_ENG_V1.pdf';
const BRAKE_INSPECTION = 'Service when pads reach their published minimum, rotors reach the minimum thickness stamped on the rotor, or inspection finds scoring, heat cracks, excessive runout, a fluid leak, sticking hardware, squeal/grinding, pedal pulsation, steering-wheel vibration, pulling or increased stopping distance.';
const TIRE_INSPECTION = 'Replace for exposed cord/fabric, sidewall cracks/cuts, a bulge or split, repeated pressure loss, three or more visible wear indicators, or tread at the legal/service limit; investigate vibration, pulling and irregular wear before ordering.';
const UNCONFIRMED_BRAKE_FLUID = {brand:'Qualified brake-fluid service',spec:'Read the reservoir cap and exact owner manual before service; test moisture/condition and use a clean sealed container. No fluid product is asserted until the vehicle-specific DOT specification is confirmed.'};
const DEMO_TREE_CONTEXT = {
  nautilus:{
    engine:'2.0L EcoBoost turbocharged I4', transmission:'8-speed SelectShift automatic',
    wheel:'2019 Nautilus wheel and tire package',
    service:{
      oil:{interval:10000,partNo:'BE8Z-6731-AB / FL-910S',brand:'Genuine Ford / Motorcraft engine oil filter',price:'$10.28 when reviewed',buyUrl:'https://www.fordpartsgiant.com/parts/ford-filter-asy-oil_be8z-6731-ab.html',buyLabel:'Buy exact engine oil filter',spec:'2019 Nautilus 2.0L EcoBoost fitment; use SAE 5W-30 meeting the owner-manual Ford specification'},
      air:{interval:30000,partNo:'DS7Z-9601-D / FA-1912',brand:'Genuine Ford engine air-cleaner element',price:'$22.75 when reviewed',buyUrl:'https://www.fordpartsgiant.com/parts/ford-element-asy-air-cleaner_ds7z-9601-d.html',buyLabel:'Buy exact engine air filter',spec:'Current direct-fit service element for the 2019 Nautilus 2.0L airbox'},
      cabin:{intervalMonths:24,partNo:'DG9Z-19N619-AA',brand:'Genuine Ford cabin air filter',price:'$21.75 when reviewed',buyUrl:'https://www.fordpartsgiant.com/parts/ford-filter-odour-and-particles_dg9z-19n619-aa.html',buyLabel:'Buy exact cabin air filter',spec:'2019 Nautilus passenger-compartment filter; install in the airflow direction marked on the element'},
      coolant:{interval:100000,partNo:'VC-13DL-G · 1 gal',brand:'Motorcraft Yellow Prediluted Antifreeze/Coolant',price:'$25.95 / gal when reviewed',buyUrl:'https://www.idparts.com/fordorangepredilutedantifreezecoolant-13dl-p-10475.html',buyLabel:'Buy exact Motorcraft coolant',spec:'Prediluted Motorcraft Yellow coolant; do not mix incompatible coolant chemistry'},
      trans:{interval:150000,partNo:'XT-12-QULV',brand:'Motorcraft MERCON ULV',price:'$9.61 / qt when reviewed',buyUrl:'https://www.fordpartsgiant.com/parts/ford-oil-automatic-transmission_xt-12-qulv.html',buyLabel:'Buy exact MERCON ULV fluid',spec:'8F35 automatic; use the manual level-temperature procedure'},
      driveline:{label:'FWD Final Drive (Integrated)',interval:150000,separateService:true,partNo:'XT-12-QULV',brand:'Motorcraft MERCON ULV',price:'$9.61 / qt when reviewed',buyUrl:'https://www.fordpartsgiant.com/parts/ford-oil-automatic-transmission_xt-12-qulv.html',buyLabel:'Buy exact integrated-final-drive fluid',sourceUrl:NAUTILUS_OWNER_MANUAL,sourceLabel:'2019 Lincoln Nautilus Owner Manual',spec:'This completed demo is the Standard FWD branch. It has no PTU or rear differential; the final drive is integrated into the 8F35 and uses the same MERCON ULV service fluid and level-temperature procedure.'},
      tire:{interval:10000,partNo:'245/60R18 109V XL · Discount Tire item 149583',brand:'Michelin CrossClimate2',price:'$263.00 each when reviewed',buyUrl:'https://www.discounttire.com/buy-tires/michelin-crossclimate2/p/149583',buyLabel:'View exact 245/60R18 tire',spec:'Completed Standard FWD demo uses the factory 18-inch package. Confirm 245/60R18 on the door placard before ordering; the reviewed 109V XL replacement meets/exceeds the original service description.'},
      brake:{partNo:'F2GZ-2001-K → F2GZ-2001-P',brand:'Genuine Lincoln front brake pad kit',price:'$87.10 / front axle set when reviewed',buyUrl:'https://www.fordpartsgiant.com/parts/ford-kit-brake-lining_f2gz-2001-k.html',buyLabel:'Buy exact 17-inch-rear-package front pads',spec:'Completed demo uses the standard 18-inch wheel / 17-inch solid-rear brake package. This kit is the catalog branch for 18-inch front vented and 17-inch solid rear brakes.'},
      rearBrake:{partNo:'DG9Z-2200-P',brand:'Genuine Lincoln rear brake pad kit',price:'$67.33 / rear axle set when reviewed',buyUrl:'https://www.fordpartsgiant.com/parts/lincoln-pad-brake_dg9z-2200-p.html',buyLabel:'Buy exact Nautilus rear pad kit',spec:'2019–2023 Nautilus rear pad set; inspect rotor thickness/runout, caliper slide operation and parking brake before ordering.'},
      brakeFluid:{partNo:'PM-20 · 16 fl oz',brand:'Motorcraft DOT 4 LV High Performance brake fluid',price:'$11.63 when reviewed',buyUrl:'https://www.fordpartsgiant.com/parts/ford-fluid-brake_pm-20.html',buyLabel:'Buy exact DOT 4 LV brake fluid',sourceUrl:NAUTILUS_OWNER_MANUAL,sourceLabel:'2019 Lincoln Nautilus Owner Manual',spec:'Use DOT 4 LV meeting Ford WSS-M6C65-A2 from a new sealed container; do not use generic non-LV DOT 4 as a fitment shortcut.'},
      spark:{interval:100000,partNo:'CYFS-12Y-PCT → CYFS-12Y-PCTX · quantity 4',brand:'Genuine Ford / Motorcraft spark plug',price:'$12.57 each when reviewed',buyUrl:'https://www.fordpartsgiant.com/oem-2019-lincoln-nautilus-spark_plug.html',buyLabel:'Buy exact 2.0L EcoBoost spark plugs',sourceUrl:NAUTILUS_OWNER_MANUAL,sourceLabel:'2019 Lincoln Nautilus Owner Manual',spec:'Exact 2.0L EcoBoost catalog branch; four plugs required. Do not use the 2.7L or 3.7L plug branch.'},
      wipers:{products:[{label:'Driver wiper · 23 inch',partNo:'FA1Z-17528-A → FA1Z-17528-AA',brand:'Genuine Ford wiper blade',price:'$19.76 when reviewed',buyUrl:'https://www.fordpartsgiant.com/parts/ford-blade-asy-wiper_fa1z-17528-aa.html',buyLabel:'Buy driver blade'},{label:'Passenger wiper · 17 inch',partNo:'FA1Z-17528-B → FA1Z-17528-BA',brand:'Genuine Ford wiper blade',price:'$18.96 when reviewed',buyUrl:'https://www.fordpartsgiant.com/parts/ford-blade-asy-wiper_fa1z-17528-ba.html',buyLabel:'Buy passenger blade'}],spec:'Exact 2019 Nautilus front pair: 23-inch driver and 17-inch passenger blades.'},
    },
    radiatorIssue:{id:'lincoln-nautilus-2-0l-ecoboost-coolant-loss-egr-cooler-leak-low-coolant-white',label:'2.0L EcoBoost coolant loss / EGR cooler leak'},
    engineIssues:[{key:'startStop',id:'lincoln-nautilus-auto-start-stop-malfunction-engine-won-t-auto-restart',label:'Auto Start-Stop / 12V battery malfunction',sub:'2019 Nautilus may fail to restart after an automatic stop',where:'12V battery, charging system and powertrain controls'}],
    transmissionIssues:[{key:'transShudder',id:'lincoln-nautilus-8f35-8-speed-automatic-shudder-buck-jerk-under-35-mph',label:'8F35 low-speed shudder',sub:'Shudder, buck or jerk below 35 mph',where:'8F35 transmission and calibration branch'}],
    cabinIssues:[{key:'sync',id:'lincoln-nautilus-sync-3-apim-infotainment-freezes-black-screens-reboots',label:'SYNC 3 / APIM freezes and reboots',sub:'2019 Standard-trim infotainment issue',where:'Center display and APIM behind the instrument panel'}],
  },
  murano:{engine:'3.5L VQ35DE V6',transmission:'Xtronic continuously variable transmission',wheel:'2023 Murano SV wheel and tire package',service:{
    oil:{interval:7500,partNo:'15208-65F0E',brand:'Genuine Nissan oil filter',price:'$6.58 when reviewed',buyUrl:'https://www.nissanpartsdeal.com/parts/nissan-oil-filter~15208-65f0e.html',buyLabel:'Buy exact Nissan oil filter',spec:'SAE 0W-20; verify capacity in the 2023 Owner\'s Manual'},
    air:{interval:30000,partNo:'16546-0Z000',brand:'Genuine Nissan engine air filter',price:'$26.27 when reviewed',buyUrl:'https://www.nissanpartsdeal.com/parts/nissan-element-assy-ai~16546-0z000.html',buyLabel:'Buy exact Murano engine air filter',spec:'Exact 2015–2024 Murano 3.5L air-filter branch; 16546-5AA1A is not used because it is an inlet-duct number, not the filter element'},
    cabin:{intervalMonths:24,partNo:'27277-9NM0A',brand:'Genuine Nissan cabin air filter',price:'$29.03 when reviewed',buyUrl:'https://www.nissanpartsdeal.com/parts/nissan-air-filter~27277-9nm0a.html',buyLabel:'Buy exact Murano cabin air filter',spec:'Exact 2017–2024 Murano passenger-compartment filter'},
    coolant:{interval:105000,partNo:'999MP-L25500P',brand:'Nissan Blue Long Life Antifreeze/Coolant',price:'$20.54 / gal when reviewed',buyUrl:'https://www.nissanpartsdeal.com/parts/nissan-long-lif~999mp-l25500p.html',buyLabel:'Buy exact Nissan Blue coolant'},
    trans:{interval:60000,partNo:'999MP-NS300P → 999MP-CSHNS3 · 5 qt',brand:'Genuine Nissan NS-3 CVT Fluid',price:'$76.95 / 5 qt when reviewed',buyUrl:'https://www.amazon.com/dp/B074MCWKCZ?tag=au7o-20',buyLabel:'Buy exact Nissan NS-3 fluid',spec:'NS-3 only; use the temperature-dependent level procedure'},
    driveline:{label:'FWD Final Drive (Integrated)',interval:60000,separateService:true,partNo:'999MP-NS300P → 999MP-CSHNS3 · 5 qt',brand:'Genuine Nissan NS-3 CVT Fluid',price:'$76.95 / 5 qt when reviewed',buyUrl:'https://www.amazon.com/dp/B074MCWKCZ?tag=au7o-20',buyLabel:'Buy integrated-final-drive NS-3 fluid',sourceUrl:MURANO_OWNER_MANUAL,sourceLabel:'2023 Nissan Murano Owner Manual',spec:'This completed SV demo uses FWD. It has no transfer case or rear differential; its final drive is integrated with the CVT and shares Nissan NS-3 fluid.'},
    tire:{interval:7500,partNo:'235/65R18 · Discount Tire item 91007',brand:'Michelin CrossClimate2',price:'$251.00 each when reviewed',buyUrl:'https://www.discounttire.com/buy-tires/michelin-crossclimate2/p/91007',buyLabel:'View exact 235/65R18 tire',spec:'Factory SV FWD 18-inch branch. Confirm the door placard; match or exceed its load and speed service description.'},
    brake:{partNo:'D1060-9UH0A',brand:'Genuine Nissan front disc brake pad kit',price:'$72.40 / front axle set when reviewed',buyUrl:'https://www.nissanpartsdeal.com/parts/nissan-pad-kit-disc-brake~d1060-9uh0a.html',buyLabel:'Buy exact Murano front pad kit',spec:'Exact 2023 Murano SV 3.5L front pad set; inspect rotor thickness/runout and caliper operation before ordering'},
    rearBrake:{partNo:'D4060-9UH0A',brand:'Genuine Nissan rear disc brake pad kit',price:'$87.75 / rear axle set when reviewed',buyUrl:'https://www.nissanpartsdeal.com/parts/nissan-pad-kit-disc-brake~d4060-9uh0a.html',buyLabel:'Buy exact Murano rear pad kit',spec:'Exact 2023 Murano SV 3.5L rear pad set; inspect rotor thickness/runout, parking-brake hardware and caliper operation before ordering'},
    brakeFluid:{partNo:'999MP-A4100P · 12 oz',brand:'Genuine Nissan DOT 3 brake fluid',price:'$8.99 MSRP when reviewed',buyUrl:'https://parts.nissanusa.com/parts/nissan-title-999mpa4100p',buyLabel:'Buy exact Nissan DOT 3 fluid',sourceUrl:MURANO_OWNER_MANUAL,sourceLabel:'2023 Nissan Murano Owner Manual',spec:'Nissan DOT 3 from a clean sealed container; inspect for moisture, leaks and a soft/spongy pedal before service.'},
    spark:{interval:105000,partNo:'22401-EW61C · quantity 6',brand:'Genuine Nissan spark plug',price:'$20.25 each when reviewed',buyUrl:'https://www.nissanpartsdeal.com/parts/nissan-plug-spark~22401-ew61c.html',buyLabel:'Buy exact VQ35DE spark plugs',spec:'Exact 2023 Murano SV 3.5L VQ35DE branch; six plugs required and the product is sold individually.'},
    wipers:{partNo:'SET-R495079281-2-F · 26 + 18 inch pair',brand:'Rain-X Latitude Water Repellency 2-in-1 front wiper set',price:'$51.49 / pair when reviewed',buyUrl:'https://www.carparts.com/details/Nissan/Murano/Rain-X/Wiper_Blade/2023/SET-R495079281-2-F.html',buyLabel:'Buy exact-fit Murano wiper pair',spec:'Vehicle-specific 2023 Murano set: 26-inch driver, 18-inch passenger, 9×3 hook.'},
  },cabinIssues:[
    {key:'aeb',id:'nissan-murano-automatic-emergency-braking-forward-collision-phantom-activa',label:'AEB phantom activation',sub:'Forward-collision system may brake without a true obstacle',where:'Forward driver-assistance sensing and control system'},
    {key:'battery',id:'nissan-murano-battery-drain-and-no-start-2021',label:'Battery drain / no-start',sub:'Telematics or infotainment modules may remain awake',where:'12V battery and module sleep-current circuit'},
    {key:'seatTrack',id:'nissan-murano-front-driver-seat-frametrack-2021',label:'Driver-seat frame / track movement',sub:'Seat may rock, click or move unexpectedly',where:'Front driver-seat frame and floor-mounted track'},
    {key:'frontRadar',id:'nissan-murano-front-radarsensor-malfunctions-triggering-2021',label:'Front radar / sensor malfunction',sub:'AEB, ICC and forward-collision warnings may appear',where:'Front radar sensor and its mounting/alignment branch'},
    {key:'rearCamera',id:'nissan-murano-rearview-camera-image-blank-2021',label:'Rear-view camera image failure',sub:'Camera image may be blank, distorted or intermittent',where:'Liftgate camera, harness and AV control unit'},
  ]},
  xt6:{
    engine:'3.6L naturally aspirated V6',transmission:'9-speed automatic transmission',wheel:'2020 XT6 Sport wheel and tire package',
    service:{
      oil:{interval:7500,partNo:'12693541 / UPF63R',brand:'ACDelco Ultraguard engine oil filter',price:'$18.49 when reviewed',buyUrl:'https://www.autozone.com/p/acdelco-engine-oil-filter-upf63r/1215335',buyLabel:'Buy exact UPF63R oil filter',sourceUrl:XT6_OWNER_MANUAL,sourceLabel:'2020 Cadillac XT6 Owner Manual, pp. 339–340',spec:'SAE 5W-30 dexos1 full synthetic · 6.0 qt with filter; the owner manual identifies 12693541 / UPF63R'},
      air:{interval:45000,intervalMonths:48,partNo:'23321606 / A3212C',brand:'ACDelco GM Original Equipment engine air filter',price:'$78.76 MSRP when reviewed',buyUrl:'https://parts.cadillac.com/product/acdelco-gm-original-equipment-air-filter-23321606',sourceUrl:XT6_OWNER_MANUAL,sourceLabel:'2020 Cadillac XT6 Owner Manual, pp. 332–340',spec:'Exact 2020–2025 XT6 Luxury, Premium Luxury and Sport fitment; replace by the filter-life monitor or four years when not equipped with the monitor, sooner in dust'},
      cabin:{intervalMonths:24,partNo:'13508023 / CF185',brand:'ACDelco passenger-compartment air filter',price:'$30.31 when reviewed',buyUrl:'https://www.gmpartsgiant.com/parts/gm-filter-pass-compt-air-13508023.html',buyLabel:'Buy exact XT6 cabin air filter',sourceUrl:XT6_OWNER_MANUAL,sourceLabel:'2020 Cadillac XT6 Owner Manual, pp. 332–340',spec:'Owner-manual replacement part; replace every two years or sooner for reduced airflow, window fogging, odor, heavy traffic, dust or allergens'},
      spark:{interval:97500,partNo:'12646780 / 41-130 · quantity 6',brand:'ACDelco GM Original Equipment iridium spark plugs',price:'$10.80 each when reviewed',buyUrl:'https://www.gmpartsgiant.com/parts/gm-spark-plug-asm-12646780.html',buyLabel:'Buy exact XT6 spark plug',sourceUrl:XT6_OWNER_MANUAL,sourceLabel:'2020 Cadillac XT6 Owner Manual, pp. 332–340',spec:'Six plugs for the 3.6L V6; use the owner-manual 97,500-mile schedule'},
      coolant:{interval:150000,intervalMonths:60,partNo:'12346290 / 10-101',brand:'ACDelco GM Original Equipment DEX-COOL concentrate',price:'$19.08 / gal when reviewed',buyUrl:'https://www.gmpartsgiant.com/parts/gm-coolant-12346290.html',buyLabel:'Buy exact DEX-COOL coolant',sourceUrl:XT6_OWNER_MANUAL,sourceLabel:'2020 Cadillac XT6 Owner Manual, pp. 332–343',spec:'50/50 DEX-COOL mixture only · 12.0 qt without rear A/C or 13.6 qt with rear A/C; this product is concentrate, so mix with the correct water per label/manual and confirm equipment before filling'},
      trans:{interval:45000,partNo:'STPDEXVI1QT',brand:'STP DEXRON-VI automatic transmission fluid',price:'$11.99 / qt when reviewed',buyUrl:'https://www.autozone.com/p/stp-auto-transmission-fluid-stpdexvi1qt/811757',buyLabel:'Buy DEXRON-VI transmission fluid',sourceUrl:XT6_OWNER_MANUAL,sourceLabel:'2020 Cadillac XT6 Owner Manual, pp. 263, 334 and 339',spec:'The 2020 XT6 manual specifies DEXRON-VI—not DEXRON ULV—for its 9-speed automatic. The 45,000-mile change is the severe-use branch; have the level-temperature procedure performed with the VIN-confirmed transmission.'},
      driveline:{label:'AWD Rear Axle & Active Twin-Clutch Fluid',interval:150000,separateService:true,manualFirstDeadline:false,img:'/twin-stage/parts/part-power-transfer-unit.webp',sourceUrl:XT6_OWNER_MANUAL,sourceLabel:'2020 Cadillac XT6 Owner Manual, pp. 330–339',products:[{label:'Rear axle gear oil',partNo:'88862624 / 10-4034 · 32 oz',brand:'ACDelco DEXRON LS 75W-90 gear oil',price:'$25.24 when reviewed',buyUrl:'https://www.gmpartsgiant.com/parts/gm-fluid-88862624.html',buyLabel:'Buy rear-axle gear oil',spec:'For the rear gear case; do not put it in the electro-hydraulic clutch circuit.'},{label:'Active twin-clutch hydraulic fluid',partNo:'88901975 · 1 L',brand:'ACDelco / Pentosin CHF-11S electro-hydraulic fluid',price:'$23.78 when reviewed',buyUrl:'https://parts.gmparts.com/product/acdelco-gm-original-equipment-multi-purpose-electro-hydraulic-system-fluid-1-l-88901975',buyLabel:'Buy clutch-system fluid',spec:'For the active twin-clutch electro-hydraulic circuit; do not substitute gear oil.'}],spec:'The Sport is AWD with an Active Twin-Clutch rear drive module. Change rear-axle fluid at 150,000 miles normal or 60,000/150,000 severe use; inspect PTU, axle and output seals and diagnose vibration, whining, popping, clunking or AWD faults before opening either circuit.'},
      tire:{interval:7500,partNo:'235/55R20 102H OE minimum · 235 mm section width · Discount Tire replacement item 103603 is 102V SL',brand:'Pirelli Scorpion AS Plus 3 235/55R20 102V SL',price:'$245.00 each when reviewed',buyUrl:'https://www.discounttire.com/buy-tires/pirelli-scorpion-all-season-plus-3/p/103603',buyLabel:'View exact 235/55R20 tire at Discount Tire',spec:'Recommendation applies only to a Sport carrying the standard 235/55R20 placard: 235 mm nominal section width, 55 aspect ratio, 20-inch rim and approximately 9.65 in section width; the reviewed 102V replacement meets or exceeds the 102H service description. Optional 21-inch wheels use a different size—verify the door placard and installed sidewall.'},
      brake:{partNo:'85153469',brand:'Genuine Cadillac front disc brake pad kit',price:'$99.97 / front axle set when reviewed',buyUrl:'https://www.gmpartsgiant.com/parts/cadillac-pad-kit-frt-disc-brk~85153469.html',buyLabel:'Buy exact XT6 front pad kit',spec:'Exact 2020 XT6 Sport 3.6L front pad set; inspect rotor thickness/runout and caliper operation before ordering'},
      rearBrake:{partNo:'84769879',brand:'Genuine Cadillac rear disc brake pad kit',price:'$90.45 / rear axle set when reviewed',buyUrl:'https://www.gmpartsgiant.com/parts/cadillac-pad-kit-rear-disc-brk~84769879.html',buyLabel:'Buy exact XT6 rear pad kit',spec:'Exact 2020 XT6 Sport 3.6L rear pad set; inspect rotor thickness/runout, parking-brake hardware and caliper operation before ordering'},
      brakeFluid:{intervalMonths:60,partNo:'19353126 / 10-4110',brand:'ACDelco GM Original Equipment DOT 3 brake fluid',price:'$10.29 MSRP / 16 oz when reviewed',buyUrl:'https://parts.cadillac.com/product/acdelco-gm-original-equipment-dot-3-hydraulic-brake-fluid-16-oz-19353126',sourceUrl:XT6_OWNER_MANUAL,sourceLabel:'2020 Cadillac XT6 Owner Manual, pp. 270–271, 333 and 339',spec:'GM-approved DOT 3 from a clean sealed container; replace every five years. Low level can indicate lining wear or a hydraulic leak—do not top off to hide the cause.'},
      wipers:{products:[{label:'Driver wiper blade',partNo:'84586337',brand:'Genuine Cadillac windshield wiper blade',price:'$19.46 when reviewed',buyUrl:'https://www.gmpartsgiant.com/parts/cadillac-blade-asm-wsw~84586337.html',buyLabel:'Buy driver blade'},{label:'Passenger wiper blade',partNo:'84580859',brand:'Genuine Cadillac windshield wiper blade',price:'$19.62 when reviewed',buyUrl:'https://www.gmpartsgiant.com/parts/cadillac-blade-asm-wsw~84580859.html',buyLabel:'Buy passenger blade'}],spec:'Exact 2020 XT6 front blade branch; replace as a pair when streaking, chatter, splits or poor visibility appear.'},
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
    service:{
      oil:{interval:10000,partNo:'15208-65F0E',brand:'Genuine Nissan oil filter',price:'$6.58 when reviewed',buyUrl:'https://www.nissanpartsdeal.com/parts/nissan-oil-filter~15208-65f0e.html',buyLabel:'Buy exact Nissan oil filter',spec:'Use the oil viscosity and capacity printed in the 2025 Owner\'s Manual for the confirmed trim'},
      air:{interval:40000,partNo:'16546-7LG0B',brand:'Genuine Nissan engine air filter',price:'$24.35 when reviewed',buyUrl:'https://www.nissanpartsdeal.com/parts/nissan-air-cleaner-element~16546-7lg0b.html',buyLabel:'Buy exact 2025 Kicks engine air filter'},
      cabin:{intervalMonths:24,partNo:'27891-5RB0C',brand:'Genuine Nissan cabin air filter',price:'$32.42 when reviewed',buyUrl:'https://www.nissanpartsdeal.com/parts/nissan-air-filter-assy~27891-5rb0c.html',buyLabel:'Buy exact 2025 Kicks cabin filter',spec:'Exact 2025 Kicks S/SV/SR 2.0L passenger-compartment filter'},
      coolant:{interval:100000,partNo:'999MP-L25500P',brand:'Nissan Blue Long Life Antifreeze/Coolant',price:'$20.54 / gal when reviewed',buyUrl:'https://www.nissanpartsdeal.com/parts/nissan-long-lif~999mp-l25500p.html',buyLabel:'Buy exact Nissan Blue coolant',spec:'Blue long-life premix; confirm capacity in the 2025 Owner\'s Manual'},
      trans:{interval:60000,partNo:'999MP-NS300P → 999MP-CSHNS3 · 5 qt',brand:'Genuine Nissan NS-3 CVT Fluid',price:'$76.95 / 5 qt when reviewed',buyUrl:'https://www.amazon.com/dp/B074MCWKCZ?tag=au7o-20',buyLabel:'Buy exact Nissan NS-3 fluid',spec:'NS-3 only; level procedure and capacity require the exact CVT'},
      driveline:{label:'FWD Final Drive (Integrated)',interval:60000,separateService:true,partNo:'999MP-NS300P → 999MP-CSHNS3 · 5 qt',brand:'Genuine Nissan NS-3 CVT Fluid',price:'$76.95 / 5 qt when reviewed',buyUrl:'https://www.amazon.com/dp/B074MCWKCZ?tag=au7o-20',buyLabel:'Buy integrated-final-drive NS-3 fluid',sourceUrl:KICKS_OWNER_MANUAL,sourceLabel:'2025 Nissan Kicks Owner Manual',spec:'This completed SV demo uses FWD. Its final drive is integrated with the CVT; there is no AWD coupling or separately filled rear final drive.'},
      tire:{interval:10000,partNo:'215/60R17 100V XL · Discount Tire item 37737',brand:'Falken Pro G5 CSV',price:'$158.00 each when reviewed',buyUrl:'https://www.discounttire.com/buy-tires/falken-pro-g5-csv/p/37737',buyLabel:'View exact 215/60R17 tire',spec:'Completed SV FWD demo uses the 215/60R17 factory branch. Reviewed replacement has a 60,000-mile warranty and a 100V XL service description; inflate to the door placard, not the sidewall maximum.'},
      brake:{partNo:'D1060-7LG0A',brand:'Genuine Nissan front disc brake pad kit',price:'$119.08 / front axle set when reviewed',buyUrl:'https://www.nissanpartsdeal.com/parts/nissan-pad-kit-disc-brake-front~d1060-7lg0a.html',buyLabel:'Buy exact 2025 Kicks front pad kit',spec:'Exact redesigned 2025 Kicks 2.0L front pad set; do not substitute the 2025 Kicks Play / 1.6L D1060-5EA0A kit'},
      rearBrake:{partNo:'D4060-7LG1A',brand:'Genuine Nissan rear disc brake pad kit',price:'$89.93 MSRP when reviewed',buyUrl:'https://parts.nissanusa.com/parts/nissan-disc-brake-pad-set-d40607lg1a',buyLabel:'Buy exact Kicks SV FWD rear pads',spec:'Completed 2025 SV FWD demo branch; inspect rotor thickness/runout, caliper operation and parking brake before ordering.'},
      brakeFluid:{partNo:'999MP-A4100P · 12 oz',brand:'Genuine Nissan DOT 3 brake fluid',price:'$8.99 MSRP when reviewed',buyUrl:'https://parts.nissanusa.com/parts/nissan-title-999mpa4100p',buyLabel:'Buy exact Nissan DOT 3 fluid',sourceUrl:KICKS_OWNER_MANUAL,sourceLabel:'2025 Nissan Kicks Owner Manual',spec:'Use Nissan DOT 3 from a clean sealed container; diagnose leaks or a soft/spongy pedal before service.'},
      spark:{interval:105000,partNo:'22401-7LG1C · quantity 4',brand:'Genuine Nissan iridium spark plug',price:'$21.93 each when reviewed',buyUrl:'https://parts.nissanusa.com/parts/nissan-spark-plug-224017lg1c',buyLabel:'Buy exact 2.0L Kicks spark plugs',sourceUrl:KICKS_OWNER_MANUAL,sourceLabel:'2025 Nissan Kicks Owner Manual',spec:'Completed redesigned 2025 2.0L branch; four plugs required and sold individually.'},
      wipers:{products:[{label:'Driver wiper · 24 inch',partNo:'EN24 / SKU 783988',brand:'Bosch Envision beam blade',price:'$37.99 when reviewed',buyUrl:'https://www.autozone.com/p/bosch-envision-wiper-blade-en24/783988',buyLabel:'Buy driver blade'},{label:'Passenger wiper · 16 inch',partNo:'EN16 / SKU 784721',brand:'Bosch Envision beam blade',price:'$37.99 when reviewed',buyUrl:'https://www.autozone.com/p/bosch-envision-wiper-blade-en16/784721',buyLabel:'Buy passenger blade'}],spec:'AutoZone fitment result for the redesigned 2025 Kicks: 24-inch driver and 16-inch passenger.'},
    },
    cabinIssues:[
      {key:'cluster',id:'nissan-kicks-blank-partial-instrument-cluster-cold-start',label:'Instrument cluster blank on cold start',sub:'Published cluster/recall concern for the redesigned Kicks',where:'Instrument cluster and vehicle communication network'},
      {key:'camera',id:'nissan-kicks-center-display-goes-blank-reverse-no-backup-camera-image',label:'Backup-camera display may go blank',sub:'Published rear-visibility recall concern',where:'Center display, rear camera and video path'},
      {key:'infotainment',id:'nissan-kicks-infotainment-touchscreen-freezing-rebooting-carplay-disconne',label:'Infotainment freezes or reboots',sub:'Touchscreen and phone projection may disconnect',where:'Center display and infotainment control unit'},
    ],
  },
  mdx:{
    engine:'3.5L SOHC i-VTEC V6',transmission:'ZF 9-speed automatic',wheel:'2019 MDX Technology wheel and tire package',
    service:{
      oil:{interval:7500,partNo:'15400-RTA-003',brand:'Genuine Honda/Acura engine oil filter',price:'$8.76 when reviewed',buyUrl:'https://www.acurapartswarehouse.com/oem/acura~filter~oil~mahle~tennex~15400-RTA-003.html',buyLabel:'Buy exact Acura oil filter',spec:'Follow Maintenance Minder oil-life indication; verify oil capacity by drivetrain'},
      air:{interval:30000,partNo:'17220-5J6-A10 / STP SA12061',brand:'2019 MDX direct-fit engine air filter',price:'$21.99 when reviewed',buyUrl:'https://www.autozone.com/p/stp-engine-air-filter-sa12061/629176',buyLabel:'Buy exact-fit MDX engine air filter',spec:'Exact 2019 MDX 3.5L filter geometry; 17220-5J2-A00 was removed because it belongs to a different Acura airbox branch'},
      cabin:{intervalMonths:24,partNo:'80292-SDA-407',brand:'Genuine Acura cabin air filter',price:'$19.97 when reviewed',buyUrl:'https://www.acurapartswarehouse.com/oem/acura~element~filter~80292-SDA-407.html',buyLabel:'Buy exact Acura cabin air filter'},
      coolant:{interval:100000,partNo:'0L999-9011A',brand:'Honda Type 2 coolant',price:'$21.75 / gal when reviewed',buyUrl:'https://acura.bernardiparts.com/Products/COOLANT-%28TYPE-2%29__0L999-9011A.aspx',buyLabel:'Buy exact Honda Type 2 coolant',spec:'Premixed Honda Type 2; never mix incompatible coolant chemistry'},
      trans:{interval:30000,partNo:'08200-9017',brand:'Genuine Acura ATF Type 3.1',price:'$21.89 / qt when reviewed',buyUrl:'https://www.acurapartswarehouse.com/oem/acura~atf~type~3~1~08200-9017.html',buyLabel:'Buy exact Type 3.1 ATF',spec:'ZF 9-speed Type 3.1 branch; do not substitute DW-1 or the obsolete Type 3.0 number 08200-9016A'},
      driveline:{label:'SH-AWD Transfer Assembly & Rear Differential',interval:30000,separateService:true,img:'/twin-stage/parts/part-differential.webp',sourceUrl:MDX_OWNER_MANUAL,sourceLabel:'2019 Acura MDX Owner Manual',products:[{label:'Rear differential fluid · 2 qt required',partNo:'08200-9007A',brand:'Acura All-Wheel Drive Fluid (DPSF)',price:'$13.62 each when reviewed · 2 qt required',buyUrl:'https://acura.bernardiparts.com/Acura-All-Wheel-Drive-Fluid-DPSF__08200-9007A.aspx',buyLabel:'Buy rear differential fluid',spec:'Use only in the SH-AWD rear differential; service requires two US quarts.'},{label:'Transfer assembly gear oil',partNo:'08200-9014A',brand:'Acura Hypoid Gear Oil HGO-1',price:'$25.60 MSRP when reviewed',buyUrl:'https://acura.oempartsonline.com/oem-parts/acura-fluid-hgo-1-82009014a',buyLabel:'Buy transfer gear oil',spec:'Use only in the transfer assembly; approximate change capacity is 0.45 US qt.'}],spec:'Completed Technology demo uses SH-AWD. The transfer assembly and rear differential are separate circuits with different fluids; never interchange HGO-1 and DPSF.'},
      tire:{interval:7500,partNo:'245/50R20 105V XL · Discount Tire item 149584',brand:'Michelin CrossClimate2',price:'$300.00 each when reviewed',buyUrl:'https://www.discounttire.com/buy-tires/michelin-crossclimate2/p/149584',buyLabel:'View exact 245/50R20 tire',spec:'Technology SH-AWD 20-inch branch. Confirm the door placard; the reviewed 105V XL replacement meets/exceeds the original service description.'},
      brake:{partNo:'45022-TZ5-A01 → 45022-TZ5-A02',brand:'Genuine Acura front disc brake pad set',price:'$79.75 / front axle set when reviewed',buyUrl:'https://www.acurapartswarehouse.com/oem/acura~pad~set~fr~45022-tz5-a01.html',buyLabel:'Buy exact MDX front pad set',spec:'2019 MDX front-axle pad set; confirm VIN before choosing the alternate 45022-TZ5-A10 branch'},
      rearBrake:{partNo:'43022-TZ5-A10',brand:'Genuine Acura rear disc brake pad set',price:'$76.03 / rear axle set when reviewed',buyUrl:'https://www.acurapartswarehouse.com/oem/acura~pad~set~rr~43022-tz5-a10.html',buyLabel:'Buy exact MDX rear pad set',spec:'2019 MDX rear-axle pad set; inspect rotor thickness/runout, parking-brake operation and caliper operation before ordering'},
      brakeFluid:{partNo:'08798-9008 · 12 oz',brand:'Genuine Honda/Acura DOT 3 brake fluid',price:'$14.94 when reviewed',buyUrl:'https://partlimit.com/products/genuine-honda-08798-9008-brake-fluid-dot-3',buyLabel:'Buy exact Honda/Acura DOT 3 fluid',sourceUrl:MDX_OWNER_MANUAL,sourceLabel:'2019 Acura MDX Owner Manual',spec:'Use DOT 3 from a clean sealed container. Low fluid requires pad/leak inspection, not blind topping off.'},
      spark:{interval:105000,partNo:'12290-R9P-A01 / NGK DILZKR7B11G · quantity 6',brand:'Genuine Acura spark plug',price:'$40.65 each when reviewed',buyUrl:'https://www.acurapartswarehouse.com/oem/acura~spark~plug~dilzkr7b11g~ngk~12290-R9P-A01.html',buyLabel:'Buy exact MDX spark plugs',sourceUrl:MDX_OWNER_MANUAL,sourceLabel:'2019 Acura MDX Owner Manual',spec:'Exact 2019 MDX 3.5L branch; six plugs required and sold individually.'},
      wipers:{partNo:'SET-5079277-2 · 26 + 20 inch pair',brand:'Rain-X Latitude Water Repellency 2-in-1 front wiper set',price:'$51.49 / pair when reviewed',buyUrl:'https://www.carparts.com/details/Acura/MDX/Rain-X/Wiper_Blade/2019/SET-5079277-2.html',buyLabel:'Buy exact-fit MDX wiper pair',spec:'Vehicle-specific 2019 MDX set: 26-inch driver, 20-inch passenger, 9×3 hook.'},
    },
    engineIssues:[{key:'fuelPump',id:'acura-mdx-fuel-pump-impeller-deformation-causing-stall',label:'Fuel-pump impeller recall',sub:'Deformed impeller may cause stall or no-start',where:'In-tank fuel pump module'}],
    transmissionIssues:[
      {key:'zfHesitation',id:'acura-mdx-zf-9-speed-transmission-hesitation-hard-shifts-stalling',label:'ZF 9-speed hesitation / harsh shifts',sub:'Published shift-quality concern',where:'ZF 9-speed transmission and software branch'},
      {key:'converter',id:'acura-mdx-torque-converter-shudder-2014',label:'Torque-converter shudder',sub:'Judder under light throttle',where:'Transmission torque converter and fluid branch'},
    ],
    cabinIssues:[{key:'infotainment',id:'acura-mdx-infotainment-reboot-2014',label:'Infotainment freezes or reboots',sub:'Display/audio system may restart unexpectedly',where:'Center display and infotainment network'}],
  },
  aviator:{
    engine:'3.0L twin-turbocharged V6',transmission:'10-speed SelectShift automatic',wheel:'2026 Aviator Premiere wheel and tire package',
    service:{
      oil:{interval:10000,partNo:'FL-2062-A',brand:'Motorcraft engine oil filter element and gasket kit',price:'$10.55 when reviewed',buyUrl:'https://www.fordpartsgiant.com/parts/ford-kit-element-gasket-oil-filter_fl-2062-a.html',buyLabel:'Buy exact Motorcraft oil filter',spec:'Confirm oil grade/capacity in the 2026 Owner\'s Manual'},
      air:{interval:30000,partNo:'FA-1884',brand:'Motorcraft engine air filter',price:'$26.67 when reviewed',buyUrl:'https://www.homedepot.com/p/308359257',buyLabel:'Buy exact Motorcraft air filter',sourceUrl:AVIATOR_OWNER_MANUAL,sourceLabel:'2026 Lincoln Aviator Owner Manual',spec:'The 2026 owner manual explicitly names FA-1884 for the 3.0L Aviator.'},
      cabin:{intervalMonths:24,partNo:'FP-90',brand:'Motorcraft high-efficiency cabin air filter',price:'$47.94 when reviewed',buyUrl:'https://www.varsityfordparts.com/oem-parts/ford-motorcraft-trade-cabin-air-filter-fp90',buyLabel:'Buy exact Motorcraft cabin filter',sourceUrl:AVIATOR_OWNER_MANUAL,sourceLabel:'2026 Lincoln Aviator Owner Manual',spec:'The 2026 owner manual explicitly names FP-90; replace sooner for reduced airflow, persistent fogging, odor, heavy dust or allergens.'},
      coolant:{interval:100000,partNo:'VC-13DL-G · 1 gal',brand:'Motorcraft Yellow Prediluted Antifreeze/Coolant',price:'$25.95 / gal when reviewed',buyUrl:'https://www.idparts.com/fordorangepredilutedantifreezecoolant-13dl-p-10475.html',buyLabel:'Buy exact Motorcraft coolant',spec:'Use only the coolant specification printed in the 2026 Owner\'s Manual'},
      trans:{interval:150000,partNo:'XT-12-QULV',brand:'Motorcraft MERCON ULV',price:'$9.61 / qt when reviewed',buyUrl:'https://www.fordpartsgiant.com/parts/ford-oil-automatic-transmission_xt-12-qulv.html',buyLabel:'Buy exact MERCON ULV fluid',spec:'10R transmission; severe use may shorten interval'},
      driveline:{label:'RWD Rear Differential',interval:150000,separateService:true,img:'/twin-stage/parts/part-differential.webp',partNo:'XY-75W85-QL · 1 qt',brand:'Motorcraft SAE 75W-85 Premium Synthetic Hypoid Gear Lubricant',price:'$31.99 / qt when reviewed',buyUrl:'https://www.jegs.com/i/Motorcraft/037/XY75W85QL/10002/-1',buyLabel:'Buy exact Motorcraft rear-axle oil',sourceUrl:AVIATOR_OWNER_MANUAL,sourceLabel:'2026 Lincoln Aviator Owner Manual',spec:'Completed Premiere demo uses RWD; no front PTU/axle fluid is present. Use only WSS-M2C942-A 75W-85 in the rear axle and confirm capacity/limited-slip equipment before a complete refill.'},
      tire:{interval:10000,partNo:'255/55R20 110V XL · Discount Tire product 106982',brand:'Michelin CrossClimate2',price:'$320.00 each when reviewed',buyUrl:'https://www.discounttire.com/buy-tires/michelin-crossclimate2/p/106982',buyLabel:'View exact 255/55R20 tire',spec:'Completed Premiere RWD demo uses the standard 20-inch package. Confirm the door placard before ordering.'},
      brake:{partNo:'ACT2230',brand:'Akebono ProACT ceramic front brake pad set',price:'$79.13 / front axle set when reviewed',buyUrl:'https://www.partcatalog.com/products/akebono-act2230-disc-brake-pad-set-front',buyLabel:'Buy exact Aviator RWD front pads',spec:'ACT2230 is an exact 2026 Aviator RWD 255/55R20 fitment result; inspect rotor thickness/runout and the installed brake package before ordering.'},
      rearBrake:{partNo:'ACT2231',brand:'Akebono ProACT ceramic rear brake pad set',price:'$76.82 / rear axle set when reviewed',buyUrl:'https://thmotorsports.com/19212515-akebono-act2231',buyLabel:'Buy exact Aviator RWD rear pads',spec:'ACT2231 is an exact 2026 Aviator RWD 255/55R20 fitment result; inspect rotor thickness/runout, caliper operation and parking brake before ordering.'},
      brakeFluid:{partNo:'PM-20 · 16 fl oz',brand:'Motorcraft DOT 4 LV High Performance brake fluid',price:'$11.63 when reviewed',buyUrl:'https://www.fordpartsgiant.com/parts/ford-fluid-brake_pm-20.html',buyLabel:'Buy exact DOT 4 LV brake fluid',sourceUrl:AVIATOR_OWNER_MANUAL,sourceLabel:'2026 Lincoln Aviator Owner Manual',spec:'Use DOT 4 LV meeting WSS-M6C65-A2 / ISO 4925 Class 6 from a new sealed container.'},
      spark:{interval:100000,partNo:'SP-594 / CYFS-12Y-RT3 · quantity 6',brand:'Motorcraft spark plug',price:'$14.49 each when reviewed',buyUrl:'https://www.autozone.com/p/motorcraft-spark-plug-sp-594/1169380',buyLabel:'Buy exact 2026 Aviator spark plugs',sourceUrl:AVIATOR_OWNER_MANUAL,sourceLabel:'2026 Lincoln Aviator Owner Manual',spec:'The 2026 owner manual explicitly names SP-594; six plugs required for the 3.0L V6.'},
      wipers:{products:[{label:'Driver wiper blade',partNo:'WW-2617-NH',brand:'Motorcraft heated-washer-compatible blade',price:'$22.19 when reviewed',buyUrl:'https://www.carparts.com/wiper-blade/motorcraft/miww2617nh',buyLabel:'Buy driver blade'},{label:'Passenger wiper blade',partNo:'WW-2114-NH',brand:'Motorcraft heated-washer-compatible blade',price:'$19.25 when reviewed',buyUrl:'https://www.fordpartsgiant.com/parts/ford-blade-asy-wiper_ww-2114-nh.html',buyLabel:'Buy passenger blade'}],sourceUrl:AVIATOR_OWNER_MANUAL,sourceLabel:'2026 Lincoln Aviator Owner Manual',spec:'The owner manual names WW-2617-NH driver and WW-2114-NH passenger. The Aviator uses washer-jet/heated-arm-specific blades; do not substitute generic hook blades.'},
    },
  },
  camaro:{
    engine:'6.2L supercharged LT4 V8',transmission:'TR-6060 6-speed manual or 10L90 10-speed automatic',wheel:'2019 Camaro ZL1 1LE staggered wheel and tire package',
    service:{
      oil:{interval:7500,partNo:'12640445 / PF64 → 25206377',brand:'ACDelco GM Original Equipment oil filter',price:'$5.55 when reviewed',buyUrl:'https://www.gmpartsgiant.com/parts/gm-filter-12640445.html',spec:'Use dexosR-approved SAE 0W-40; 10 qt with filter'},
      air:{interval:45000,partNo:'23323508 / A3223C',brand:'ACDelco GM Original Equipment engine air filter',price:'$81.00 MSRP',buyUrl:'https://parts.chevrolet.com/product/acdelco-gm-original-equipment-air-filter-23323508',spec:'2016–2024 Camaro ZL1/LT4 direct-fit branch; confirm the installed airbox remains stock'},
      cabin:{intervalMonths:24,partNo:'13508023 / CF185',brand:'ACDelco passenger-compartment air filter',price:'$30.31 when reviewed',buyUrl:'https://www.gmpartsgiant.com/parts/gm-filter-pass-compt-air-13508023.html',buyLabel:'Buy exact Camaro cabin air filter',sourceUrl:CAMARO_OWNER_MANUAL,sourceLabel:'2019 Chevrolet Camaro Owner Manual, pp. 321–330',spec:'Owner-manual replacement part; replace every two years or sooner for reduced airflow, window fogging, odor, heavy traffic, dust or allergens'},
      spark:{interval:97500,partNo:'12642722 · quantity 8',brand:'Genuine Chevrolet LT4 spark plug',price:'$9.69 each when reviewed',buyUrl:'https://www.gmpartsgiant.com/parts/chevrolet-spark-plug~12642722.html',buyLabel:'Buy exact ZL1 LT4 spark plugs',sourceUrl:CAMARO_HIGH_PERFORMANCE_SUPPLEMENT,sourceLabel:'2019 Camaro High Performance supplement',spec:'Direct-fit 2017–2024 Camaro high-performance 6.2L branch; eight pre-gapped plugs required and sold individually.'},
      coolant:{interval:150000,partNo:'12346290 / 10-101',brand:'ACDelco GM Original Equipment DEX-COOL coolant',price:'$33.48 MSRP / gal',buyUrl:'https://parts.chevrolet.com/product/acdelco-gm-original-equipment-dex-cool-extended-life-engine-coolant-1-gal-12346290',spec:'DEX-COOL; mix only to the concentration required by the owner manual and never mix incompatible chemistry'},
      trans:{interval:45000,brand:'Transmission-specific GM fluid service',spec:'The 10L90 and TR-6060 use different fluids. Choose the installed transmission before the tree exposes a product or part number.'},
      driveline:{label:'Electronic Limited-Slip Differential',interval:45000,separateService:true,img:'/twin-stage/parts/part-differential.webp',where:'Rear electronic limited-slip differential gear housing',partNo:'88862624 / 10-4034 · 2 × 32 oz bottles',brand:'ACDelco GM Original Equipment DEXRON LS 75W-90 gear oil',price:'$44.28 MSRP each · $88.56 for two before tax/shipping when reviewed',buyUrl:'https://parts.chevrolet.com/product/acdelco-gm-original-equipment-dexron-ls-75w-90-gear-oil-32-oz-88862624',buyLabel:'Buy exact rear-axle gear oil',sourceUrl:CAMARO_OWNER_MANUAL,sourceLabel:'2019 Camaro Owner Manual, pp. 322 and 330; High Performance supplement, p. 48',capacitySourceUrl:CAMARO_HIGH_PERFORMANCE_SUPPLEMENT,spec:'Exact 2019 ZL1 1LE coupe eLSD gear-case service: DEXRON LS 75W-90, GM 88862624 / ACDelco 10-4034, approximately 1.5 L (1.6 qt), so two 32 oz bottles cover the published approximate capacity. Change at 45,000-mile intervals. The separate eLSD clutch hydraulic circuit holds 160 mL (5.4 oz); this purchase is not for that circuit, which requires its own service procedure.'},
      tire:{rotationAllowed:false,partNo:'305/30ZR19 98Y front · 325/30ZR19 101Y rear · Discount Tire items 38704/38720',brand:'Goodyear Eagle F1 SuperCar 3R',price:'$458.00 front · $480.00 rear when reviewed',buyUrl:'https://www.discounttire.com/buy-tires/goodyear-eagle-f1-supercar-3r/p/38704/rearProduct/38720',buyLabel:'View the exact staggered ZL1 1LE tire set',spec:'Factory staggered ZL1 1LE sizes; front-to-rear rotation is not permitted. Replace by measured tread/condition and verify both installed sidewalls before ordering.'},
      brake:{partNo:'84271643 rotor / 23399101 pad kit',brand:'GM ZL1 six-piston Brembo front brake service parts',price:'$311.44 front pad kit when reviewed; rotor price is intentionally not published without a reviewed direct destination',buyUrl:'https://www.gmpartsgiant.com/parts/chevrolet-pad-kit-frt-disc-brk~23399101.html',buyLabel:'Buy exact front pad kit',spec:'J6H/ZL1 heavy-duty front branch: 390 × 36 mm rotor and pad kit for both front sides. The purchase action is for pad kit 23399101 only; confirm VIN/RPO and rotor minimum thickness before ordering rotors.'},
      rearBrake:{partNo:'89047744',brand:'Genuine Chevrolet ZL1 rear disc brake pad kit',price:'$98.59 / rear axle set when reviewed',buyUrl:'https://www.gmpartsgiant.com/parts/chevrolet-pad-kit-rear-disc-brk~89047744.html',buyLabel:'Buy exact ZL1 rear pad kit',spec:'2019 Camaro J6H/ZL1 rear pad set; inspect rotor thickness/runout and rear caliper operation before ordering'},
      brakeFluid:{partNo:'19353126 / 10-4110',brand:'ACDelco GM Original Equipment DOT 3 brake fluid',price:'$10.29 MSRP / 16 oz when reviewed',buyUrl:'https://parts.chevrolet.com/product/acdelco-gm-original-equipment-dot-3-hydraulic-brake-fluid-16-oz-19353126',sourceUrl:CAMARO_OWNER_MANUAL,sourceLabel:'2019 Chevrolet Camaro Owner Manual, pp. 256–257 and 321–329',spec:'Street service uses GM-approved DOT 3 from a clean sealed container. Replace every five years with the automatic or every three years with the manual because the manual shares the brake/clutch reservoir. Track preparation has a separate high-temperature fluid requirement; no track fluid product is asserted here.'},
      wipers:{products:[{label:'Driver wiper blade',partNo:'84613732',brand:'Genuine Chevrolet windshield wiper blade',price:'$19.12 when reviewed',buyUrl:'https://www.gmpartsgiant.com/parts/chevrolet-blade-asm-wsw~84613732.html',buyLabel:'Buy driver blade'},{label:'Passenger wiper blade',partNo:'84580859',brand:'Genuine Chevrolet windshield wiper blade',price:'$19.62 when reviewed',buyUrl:'https://www.gmpartsgiant.com/parts/chevrolet-blade-asm-wsw~84580859.html',buyLabel:'Buy passenger blade'}],spec:'Exact 2019 Camaro front blade branch; replace when streaking, chatter, splits or poor visibility appear.'},
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
    const diffFluid=trees.trans.nodes.diffFluid;
    if(diffFluid){
      Object.assign(diffFluid,{
        partNo:'68232947AD + 04318060AD',
        brand:'Genuine Mopar 75W-85 base gear oil + Mopar limited-slip friction modifier',
        price:'$50.13 reviewed set price',
        stock:'Two 1-qt base-oil bottles plus one 4-oz modifier bottle; current product pages had add-to-cart when reviewed',
        spec:'SAE 75W-85 API GL-5 base oil + one complete 4 fl oz Mopar MS-10111 limited-slip modifier bottle · service sequence: add the modifier first, then fill with base oil to the specified level; the modifier counts toward the 1.16 qt nominal capacity, so do not pour both full quarts',
        products:[
          {label:'Genuine Mopar 75W-85 axle lubricant · quantity 2',brand:'MoparPartsGiant',partNo:'68232947AD',price:'$34.14 for two 1-qt bottles',buyUrl:'https://www.moparpartsgiant.com/parts/mopar-lubricant-gear~68232947ad.html',buyLabel:'Buy two base-oil bottles',spec:'2015 Challenger fitment is listed; one bottle is not enough supply for a 1.16 qt fill, but only the amount needed after the modifier is installed goes into the axle'},
          {label:'Genuine Mopar limited-slip friction modifier · 4 fl oz',brand:'Epic Auto Market',partNo:'04318060AD',price:'$15.99 each',buyUrl:'https://www.epicautomarket.com/products/genuine-mopar-04318060ad-limited-slip-additive-friction-modifier-4-oz',buyLabel:'Buy one modifier bottle',spec:'Mopar MS-10111 limited-slip additive; one complete 4 oz bottle for this reviewed service set'},
        ],
      });
      delete diffFluid.buyUrl;
    }
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
  if (trees.oil.nodes.oilFilter) Object.assign(trees.oil.nodes.oilFilter,{
    partNo:'04884899AB → 04884899AC / MO-899',price:'$6.99 when reviewed',
    buyUrl:'https://www.moparpartsgiant.com/parts/mopar-filter-engine-oil~4884899ac.html',
    buyLabel:'Buy exact 6.4L HEMI oil filter',
    spec:'6.4L HEMI fitment · lubricate the gasket and follow the filter installation instructions',
  });
  if (trees.wheel.nodes.lugs) Object.assign(trees.wheel.nodes.lugs,{
    partNo:'6509873AA',brand:'Genuine Mopar capped lug nut',price:'$16.43 each when reviewed',stock:'MoparPartsGiant · add-to-cart live when reviewed',
    buyUrl:'https://www.moparpartsgiant.com/parts/mopar-nut-lug~6509873aa.html',buyLabel:'Buy exact Challenger lug nut',
    spec:'M14 × 1.5 · 5 per corner · verify the wheel-seat profile before ordering; 6509064AA was removed because it is not a Challenger lug nut',
  });
  if (trees.wheel.nodes.tpms) Object.assign(trees.wheel.nodes.tpms,{
    partNo:'56029400AE → 68374924AB',brand:'Genuine Mopar tire-pressure sensor',price:'$66.38 each when reviewed',stock:'MoparPartsGiant · add-to-cart live when reviewed',
    buyUrl:'https://www.moparpartsgiant.com/parts/mopar-sensor-tire-pressure~56029400ae.html',buyLabel:'Buy exact Challenger TPMS sensor',
    spec:'2013–2020 Challenger fitment · relearn required after installation; 68239720AA was removed because it belongs to a different vehicle branch',
  });
  if (trees.engine.nodes.coolant) Object.assign(trees.engine.nodes.coolant,{
    partNo:'68163849AB → 68163849AC',price:'$14.39 / gal when reviewed',stock:'MoparPartsGiant · add-to-cart live when reviewed',
    buyUrl:'https://www.moparpartsgiant.com/parts/mopar-antifreez-coolant~68163849ab.html',buyLabel:'Buy exact Mopar OAT coolant',
    spec:'US 50/50 OAT premix · MS-12106 · do not mix with green or orange HOAT',
  });
  if (trees.trans.nodes.transFluid) Object.assign(trees.trans.nodes.transFluid,{
    partNo:'68218925AA → 68218925AB',price:'$23.71 / qt when reviewed',stock:'Exact 8/9-speed Mopar fluid product',
    buyUrl:'https://www.fortluft.com/mopar-chrysler-dodge-jeep-ram-8-and-9-speed-automatic-transmission-fluid-new-oem/',buyLabel:'Buy exact Mopar 8/9-speed ATF',
    spec:'ZF 8HP70 · set the level using the exact temperature procedure · never substitute ATF+4',
  });
  if (trees.trans.nodes.transPan) Object.assign(trees.trans.nodes.transPan,{
    price:'$243.08 when reviewed',stock:'Mopar Genuine Parts · VIN confirmation at checkout',
    buyUrl:'https://parts.mopargenuineparts.com/oem-parts/mopar-transmission-pan-and-filter-assembly-68225344aa',buyLabel:'Buy exact 8HP70 pan and filter',
  });
  if (trees.wheel.nodes.wheelA) Object.assign(trees.wheel.nodes.wheelA,{
    partNo:'HC2 295-5115-18 GB',brand:'Voxx Replicas Hellcat 2 gloss-black wheel',price:'$257.66 each when reviewed · $1,030.64 set of 4',stock:'TFS Wheels · add-to-cart live when reviewed',
    buyUrl:'https://tfswheels.com/products/voxx-replicas-hellcat-2-20x9-5-18-gloss-black-hc2-295-5115-18-gb',buyLabel:'Buy exact-size replacement wheel',
    spec:'20 × 9.5 · 5×115 · +18 mm offset · 71.6 mm hub · aftermarket replacement for the SRT 392 factory 20×9.5 package; confirm brake clearance and installed wheel-seat hardware before ordering',
  });
  if (trees.wheel.nodes.wheelA) { delete trees.wheel.nodes.wheelA.commerceStatus; delete trees.wheel.nodes.wheelA.holdReason; }
  if (trees.oil.nodes.oilPlug) Object.assign(trees.oil.nodes.oilPlug,{
    partNo:'6507741AA',brand:'Genuine Mopar oil drain plug with gasket',price:'$11.07 when reviewed',
    buyUrl:'https://www.moparpartsgiant.com/parts/mopar-bolt-oil-drain~6507741aa.html',buyLabel:'Buy exact 6.4L oil drain plug',
    spec:'2015 Challenger 6.4L oil-pan branch · M14 × 1.5 · plug includes its sealing gasket; 6506305AA was removed because it is not the documented SRT 392 drain plug',
  });
  if (trees.wipers.nodes.wipL) Object.assign(trees.wipers.nodes.wipL,{
    partNo:'Rain-X 870122Z · 22 in',brand:'Rain-X Truck & SUV beam wiper replacement option',price:'$39.99 when reviewed',
    buyUrl:'https://www.autozone.com/p/rain-x-truck-suv-wiper-blade-870122z/1204216',buyLabel:'Buy 22-inch driver wiper',
    spec:'22-inch driver-side replacement option · adapter included; confirm the installed arm connector before opening the package',
  });
  if (trees.wipers.nodes.wipR) Object.assign(trees.wipers.nodes.wipR,{
    partNo:'Rain-X 860120 · 20 in',brand:'Rain-X Ready Match conventional wiper replacement option',price:'$14.99 when reviewed',
    buyUrl:'https://www.autozone.com/p/rain-x-wiper-blade-860120/1525511',buyLabel:'Buy 20-inch passenger wiper',
    spec:'20-inch passenger-side replacement option · confirm the installed arm connector before opening the package',
  });
  if (trees.wipers.nodes.wipFluid) Object.assign(trees.wipers.nodes.wipFluid,{
    partNo:'SPWW20 · 1 gal',brand:'ShopPro -20 °F windshield washer fluid',price:'$4.99 / gal when reviewed',
    buyUrl:'https://www.autozone.com/p/shoppro-windshield-washer-fluid-spww20/690800',buyLabel:'Buy -20 °F washer fluid',
    spec:'Use full strength · climate-rated to -20 °F · do not substitute engine coolant or plain water in freezing weather',
  });
  if (trees.trans.nodes.transPlug) Object.assign(trees.trans.nodes.transPlug,{
    partNo:'68145443AA → 68145443AB',brand:'Genuine Mopar 8HP70 oil fill plug',price:'$15.49 when reviewed',stock:'MoparPartsGiant · add-to-cart live when reviewed',
    buyUrl:'https://www.moparpartsgiant.com/parts/mopar-oil-fill~68145443ab.html',buyLabel:'Buy exact 8HP70 fill plug',
    spec:'2015–2020 Challenger 6.4L / SRT 392 automatic branch · use the exact fill-level temperature procedure and published torque',
  });
  if (trees.trans.nodes.transPlug) { delete trees.trans.nodes.transPlug.commerceStatus; delete trees.trans.nodes.transPlug.holdReason; }
  if (trees.wheel.nodes.caliper) Object.assign(trees.wheel.nodes.caliper,{
    products:[
      {label:'Passenger-side front caliper · red 6-piston',partNo:'68248388AA',brand:'Genuine Mopar / Brembo front disc-brake caliper',price:'$912.32 when reviewed',buyUrl:'https://www.moparpartsgiant.com/parts/mopar-caliper-disc-brake~68248388aa.html',buyLabel:'Buy passenger front caliper',spec:'BR7 red six-piston front branch for the 2015 SRT 392; passenger/right side.'},
      {label:'Driver-side front caliper · red 6-piston',partNo:'68248389AA',brand:'Genuine Mopar / Brembo front disc-brake caliper',price:'$912.32 when reviewed',buyUrl:'https://www.moparpartsgiant.com/parts/mopar-caliper-disc-brake~68248389aa.html',buyLabel:'Buy driver front caliper',spec:'BR7 red six-piston front branch for the 2015 SRT 392; driver/left side.'},
    ],
    spec:'BR7 red six-piston fixed front calipers; left and right are separate parts. Confirm the red-caliper BR7 equipment code before ordering.',
  });
  if (trees.wheel.nodes.caliperR) Object.assign(trees.wheel.nodes.caliperR,{
    products:[
      {label:'Passenger-side rear caliper · red 4-piston',partNo:'5175108AA',brand:'Genuine Mopar / Brembo rear disc-brake caliper',price:'$648.64 when reviewed',buyUrl:'https://www.moparpartsgiant.com/parts/mopar-caliper-disc-brake~5175108aa.html',buyLabel:'Buy passenger rear caliper',spec:'Red four-piston rear branch for the 2015 SRT 392; passenger/right side.'},
      {label:'Driver-side rear caliper · red 4-piston',partNo:'5175109AA',brand:'Genuine Mopar / Brembo rear disc-brake caliper',price:'$438.95 when reviewed',buyUrl:'https://www.moparpartsgiant.com/parts/mopar-caliper-disc-brake~5175109aa.html',buyLabel:'Buy driver rear caliper',spec:'Red four-piston rear branch for the 2015 SRT 392; driver/left side.'},
    ],
    spec:'Red four-piston fixed rear calipers; left and right are separate parts. Confirm the installed red-caliper equipment branch before ordering.',
  });
  if (trees.wheel.nodes.brakeFluid) Object.assign(trees.wheel.nodes.brakeFluid,{
    partNo:'04318080AD / 4318080AD · 12 oz',brand:'Genuine Mopar DOT 3 brake fluid',price:'$9.49 when reviewed',stock:'MoparPartsGiant · add-to-cart live when reviewed',
    buyUrl:'https://www.moparpartsgiant.com/parts/mopar-fluid-brake~4318080ad.html',buyLabel:'Buy exact Mopar DOT 3 fluid',
    spec:'SAE J1703 DOT 3 factory branch · use fluid from a new sealed container; DOT 4 is permitted only when DOT 3 is unavailable, per the owner manual',
  });
  for (const id of ['caliper','caliperR','brakeFluid']) {
    const node=trees.wheel.nodes[id];
    if (!node) continue;
    delete node.commerceStatus; delete node.holdReason;
    if (Array.isArray(node.products)) { delete node.partNo; delete node.buyUrl; delete node.price; delete node.stock; }
  }
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
    tire:demoNode({label:context.service?.tire?.rotationAllowed===false?'Staggered Tires':'Tires & Rotation',sub:`${modelLabel} installed-tire ${context.service?.tire?.rotationAllowed===false?'condition':'and rotation'} record`,img:'/twin-stage/parts/part-tire.webp',where:'All four corners',spec:context.service?.tire?.spec || 'Verify the driver-door placard and every installed sidewall before ordering; record the installed tire and expected lifespan here',life:TIRE_INSPECTION,commerceStatus:context.service?.tire?.buyUrl?undefined:'fitment-hold',holdReason:context.service?.tire?.buyUrl?undefined:'Enter the exact door-placard size, load/speed rating and installed wheel package before a tire product is offered.',...serviceDetails(context.service?.tire,context.service?.tire?.rotationAllowed===false?'tire_replacement':'tire_rotation',context.service?.tire?.rotationAllowed===false?'Tire inspection / replacement':'Tire rotation / inspection')}),
    brakes:demoNode({label:'Brake System',sub:`${modelLabel} pads, rotors, calipers and hydraulic fluid`,img:'/twin-stage/parts/part-caliper.webp',kids:['frontRotor','rearBrake','brakeFluid'],group:true,where:'Front and rear axles plus master-cylinder hydraulic circuit',spec:`Inspect all four ${twin.identity.model} brake corners and the hydraulic circuit; an axle-level symptom is not proof that a particular product is required`,life:'Pads and rotors are condition-based; brake fluid follows its documented time interval'}),
    frontRotor:demoNode({label:'Front Rotors & Pads',sub:`${modelLabel} front-axle brake service`,img:'/twin-stage/parts/part-rotor.webp',where:'Front axle, both sides',spec:context.service?.brake?.spec || 'Measure both front pad sets, rotor thickness and runout; record the actual installed parts before replacement',life:BRAKE_INSPECTION,...serviceDetails({...context.service?.brake,manualFirstDeadline:false},'brake_service','Front brake inspection / service')}),
    rearBrake:demoNode({label:'Rear Rotors & Pads',sub:`${modelLabel} rear-axle brake service`,img:'/twin-stage/parts/part-rotor.webp',where:'Rear axle, both sides, including parking-brake hardware as equipped',spec:context.service?.rearBrake?.spec || 'Measure both rear pad sets and rotor thickness/runout; inspect caliper operation and parking-brake hardware. No rear part number or purchase link is asserted without axle/RPO-level fitment.',life:BRAKE_INSPECTION,commerceStatus:context.service?.rearBrake?.buyUrl?context.service?.rearBrake?.commerceStatus:(context.service?.rearBrake?.commerceStatus || 'fitment-hold'),holdReason:context.service?.rearBrake?.buyUrl?context.service?.rearBrake?.holdReason:(context.service?.rearBrake?.holdReason || 'Confirm the rear brake package, rotor size and drivetrain/VIN branch before a rear pad or rotor product is offered.'),...serviceDetails({...context.service?.rearBrake,manualFirstDeadline:false},'brake_service','Rear brake inspection / service')}),
    brakeFluid:demoNode({label:'Brake Fluid',sub:`${modelLabel} hydraulic brake-fluid circuit`,img:'/twin-stage/parts/part-brake-fluid.webp',where:'Master-cylinder reservoir, hydraulic lines, ABS modulator and all four calipers',spec:context.service?.brakeFluid?.spec || UNCONFIRMED_BRAKE_FLUID.spec,life:'Inspect for leaks, contamination, moisture and a soft/spongy pedal; replace only to the confirmed factory time/specification branch',...serviceDetails(context.service?.brakeFluid || UNCONFIRMED_BRAKE_FLUID,'brake_fluid','Brake fluid service')}),
  };
  const engineIssueNodes=Object.fromEntries((context.engineIssues||[]).map((issue)=>[issue.key,issueNode(twin,issue,ISSUE_COMPONENT_ART[issue.key] || '/twin-stage/parts/part-engine.webp')]));
  const hoodKids=['oil','airFilter','sparkPlugs',...(context.timingIssue?['timing']:[]),...Object.keys(engineIssueNodes)];
  const engineNodes = {
    engineRoot:demoNode({label:'Engine',sub:context.engine,img:'/twin-stage/parts/part-engine.webp',kids:['hoodRoot','rad'],group:true,where:'Under the hood',spec:`${context.engine} · exact service fluids remain manual/VIN dependent`,life:'Follow the cited sample schedule; no Challenger specifications are reused'}),
    hoodRoot:demoNode({label:'Engine Service & Issues',sub:`${modelLabel} · ${context.engine}`,img:'/twin-stage/parts/part-engine.webp',kids:hoodKids,group:true,where:'Under the hood and engine controls',spec:'Service records and published engine issues for this exact demo identity',life:'Intervals are shown only where cited sample evidence exists'}),
    oil:demoNode({label:'Engine Oil & Filter',sub:`${modelLabel} · ${context.engine} scheduled service`,img:'/twin-stage/parts/part-oil-filter.webp',where:'Engine lubrication system',spec:context.service?.oil?.spec || `Confirm exact ${twin.identity.model} viscosity, approval and capacity in the owner manual`,life:'Service by the cited factory interval or oil-life monitor',...serviceDetails(context.service?.oil,'oil_change','Engine oil and filter')}),
    airFilter:demoNode({label:'Engine Air Filter',sub:`${modelLabel} dry replacement filter element`,img:'/twin-stage/parts/part-air-filter.webp',where:'Engine intake airbox',spec:context.service?.air?.spec || `Verify filter shape and part number against VIN`,life:'Inspect sooner in dust',...serviceDetails(context.service?.air,'air_filter','Engine air filter')}),
    sparkPlugs:demoNode({label:'Spark Plugs',sub:`${modelLabel} ignition service`,img:'/twin-stage/parts/part-spark-plug.webp',unlogged:Boolean(context.service?.spark),where:'Cylinder heads beneath the ignition coils',spec:context.service?.spark?.spec || 'Have the exact engine/VIN matched to the owner-manual plug specification and supersession before ordering; the component image is illustrative and is not a fitment claim.',life:'Replace at the exact owner-manual interval; diagnose misfire, hard starting, rough idle or damaged coils before treating plugs as the cause',commerceStatus:context.service?.spark?.buyUrl?undefined:(context.service?.spark?.commerceStatus || 'fitment-hold'),holdReason:context.service?.spark?.buyUrl?undefined:(context.service?.spark?.holdReason || 'Confirm the exact engine, VIN and current spark-plug supersession before a product is offered.'),...serviceDetails(context.service?.spark || {},'spark_plugs','Spark-plug service')}),
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
    wiperBlades:demoNode({label:'Front Wiper Blades',sub:`${modelLabel} driver and passenger pair`,img:'/twin-stage/parts/part-wiper-driver.webp',where:'Front wiper arms',spec:context.service?.wipers?.spec || `Verify both ${twin.identity.model} blade lengths and connectors before installation`,life:'Replace for streaking, chatter, split rubber, poor contact or impaired wet-weather visibility',...serviceDetails(context.service?.wipers,'wiper_blades','Front wiper blades')}),
    washerFluid:demoNode({label:'Washer Fluid',sub:`${modelLabel} windshield washer reservoir`,img:'/twin-stage/parts/part-washer-fluid.webp',where:'Under-hood washer reservoir',partNo:'SPWW20 · 1 gal',brand:'ShopPro -20 °F windshield washer fluid',price:'$4.99 / gal when reviewed',buyUrl:'https://www.autozone.com/p/shoppro-windshield-washer-fluid-spww20/690800',buyLabel:'Buy -20 °F washer fluid',spec:'Use full strength · climate-rated to -20 °F; choose a lower freeze-point product if local winter temperatures require it and never substitute engine coolant',life:'Check level during routine service'}),
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
  if (transmission === 'manual') Object.assign(fluid,{label:'TR-6060 Manual Transmission Fluid',partNo:'88861800 → 19540137',brand:'Genuine GM manual transmission fluid',price:'$7.36 / qt when reviewed',buyUrl:'https://www.gmpartsgiant.com/parts/gm-fluid-88861800.html',buyLabel:'Buy exact TR-6060 manual fluid',sourceUrl:CAMARO_OWNER_MANUAL,sourceLabel:'2019 Camaro Owner Manual, p. 330',spec:'6-speed V8 manual branch · the owner manual names GM 88861800 and the live product record supplies the current supersession; do not substitute the 10L90 automatic fluid',maintenanceType:'transmission_fluid_manual'});
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
  const products = Array.isArray(selected.node.products)
    ? selected.node.products.map((product) => [product.label, product.partNo && `Part ${product.partNo}`, product.price, product.buyUrl && `Buy: ${product.buyUrl}`].filter(Boolean).join(' · ')).join(' ; ')
    : '';
  const fields = [selected.node.label, selected.node.partNo && `Part ${selected.node.partNo}`, selected.node.price, selected.node.where, selected.node.spec, selected.node.life, selected.node.buyUrl && `Buy: ${selected.node.buyUrl}`, products, selected.node.dueNote].filter((value) => typeof value === 'string' && value.trim());
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
