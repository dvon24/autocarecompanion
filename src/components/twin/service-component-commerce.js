// Source review: twin-oil-source-review-2026-09-08.md. These are exact demo
// engine branches, not permission to activate every owner with the same model.
const MOBIL_5W30 = 'https://www.mobil.com/en/lubricants/for-personal-vehicles/our-products/products/mobil-1-5w-30';
const MOBIL_0W20 = 'https://www.mobil.com/en/lubricants/for-personal-vehicles/our-products/products/mobil-1-0w-20';
const OILS = {
  '5w30': { brand:'Mobil 1 Advanced Full Synthetic 5W-30', jug:'17034372', quart:'17034357', sourceUrl:MOBIL_5W30 },
  '0w20': { brand:'Mobil 1 Advanced Fuel Economy Full Synthetic 0W-20', jug:'17034374', quart:'17034375', sourceUrl:MOBIL_0W20 },
  supercar: { brand:'Mobil 1 Supercar 0W-40', quart:'168610917', sourceUrl:'https://www.mobil.com/en/lubricants/for-personal-vehicles/our-products/products/mobil-1-supercar-0w-40' },
};

// Only these fields changed after a fresh destination check; the source
// snapshot preserves the previous filter purchase for review.
const REVIEWED_FILTER_UPDATES = {
  nautilus:{part:'BE8Z6731AB',url:'https://www.fordpartsgiant.com/parts/ford-filter-asy-oil_be8z-6731-ab.html',changes:{price:'$8.14 when reviewed'}},
  mdx:{part:'15400RTA003',url:'https://www.acurapartswarehouse.com/oem/acura~filter~oil~mahle~tennex~15400-RTA-003.html',changes:{partNo:'15400-RTA-003 → 15400-PLM-A02',price:'$6.79 when reviewed'}},
  xt6:{part:'UPF63R',url:'https://www.autozone.com/p/acdelco-engine-oil-filter-upf63r/1215335',changes:{buyUrl:'https://www.finditparts.com/products/11280436/acdelco-upf63r',price:'$14.99 when reviewed'}},
};

function matchesPurchase(product, part, url) {
  const identity = new RegExp(`(^|[^a-z0-9-])${part.split('').join('[-\\s]*')}(?=$|[^a-z0-9-])`, 'i');
  return product?.buyUrl === url && identity.test(String(product?.partNo || ''));
}

// Grouping a purchase must not discard its own hold, date or supporting
// source. A sibling's reviewed fitment is not evidence for this component.
function purchaseEvidence(product) {
  return Object.fromEntries(['commerceStatus','holdReason','sourceUrl','sourceLabel','reviewedAt','note','stock','soldQuantity','purchaseQuantity']
    .filter(key => product?.[key] !== undefined).map(key => [key, product[key]]));
}

export const TWIN_OIL_COMPONENTS = {
  nautilus: { oil:'5w30', capacity:5.5, capacityLabel:'5.5 US qt (5.2 L)', specification:'2019 2.0L EcoBoost only: SAE 5W-30, Ford WSS-M2C946-B1.', sourceUrl:'https://www.fordservicecontent.com/Ford_Content/Catalog/owner_information/2019-Lincoln-Nautilus-Owners-Manual-version-3_om_EN-US_03_2019.pdf', sourceLabel:'2019 Nautilus manual, pp.394–395' },
  murano: { oil:'0w20', capacity:5.125, capacityLabel:'5-1/8 US qt (4.8 L)', specification:'2023 3.5L VQ35DE: SAE 0W-20, API SP / ILSAC GF-6A equivalent.', sourceUrl:'https://www.nissanusa.com/content/dam/Nissan/us/manuals-and-guides/murano/2023/2023-nissan-murano-owner-manual.pdf', sourceLabel:'2023 Murano manual, p.10-2' },
  xt6: { oil:'5w30', capacity:6, capacityLabel:'6 US qt (5.7 L)', specification:'2020 3.6L LGX: full synthetic SAE 5W-30 with GM dexos1 approval.', sourceUrl:'https://cdn.dealereprocess.org/cdn/servicemanuals/cadillac/2020-xt6.pdf', sourceLabel:'2020 XT6 manual, pp.261–262 and 343' },
  kicks: { oil:'0w20', capacity:4.375, capacityLabel:'4-3/8 US qt (4.1 L)', specification:'Redesigned 2025 2.0L MR20DD only, not Kicks Play: SAE 0W-20, API SP / ILSAC GF-6A equivalent.', sourceUrl:'https://www.nissanusa.com/content/dam/Nissan/us/manuals-and-guides/kicks/2025/2025-nissan-kicks-owner-manual.pdf', sourceLabel:'2025 Kicks US manual, p.628' },
  mdx: { oil:'0w20', capacity:5.7, capacityLabel:'5.7 US qt (5.4 L)', specification:'2019 non-hybrid 3.5L MDX: API-certified premium-grade SAE 0W-20 detergent oil.', sourceUrl:'https://techinfo.honda.com/rjanisis/pubs/QS/AH/BTZ51919OG/enu/BTZ51919OG.PDF', sourceLabel:'2019 MDX US Owner’s Guide, pp.134–135 and 149' },
  aviator: { oil:'5w30', capacity:6, capacityLabel:'6 US qt (5.7 L)', specification:'2026 3.0L: SAE 5W-30 meeting Ford WSS-M2C971-A1. Confirm the current formulation on the bottle; older stock claiming only WSS-M2C961-A1 is not enough.', sourceUrl:'https://www.fordservicecontent.com/Ford_Content/Catalog/owner_information/26MY_Aviator_OM_ENG_V1.pdf', sourceLabel:'2026 Aviator manual, p.384' },
  camaro: { oil:'supercar', capacity:10, capacityLabel:'10 US qt (9.5 L)', specification:'2019 ZL1 1LE 6.2L LT4 street-use branch: Mobil 1 Supercar 0W-40 with current GM dexosR approval. Track preparation has separate requirements; this is not a track-oil recommendation.', sourceUrl:'https://www.carmanualsonline.info/chevrolet-camaro-2019-high-performance-owner-manual/5', sourceLabel:'2019 Camaro high-performance supplement, pp.34–35 and 48' },
};

// Exact retained-product refreshes. A URL alone cannot transfer a review to
// another model or part: both model and normalized part identity must match.
export const REVIEWED_RETAINED_PURCHASES = {
  'https://www.moparpartsgiant.com/parts/mopar-radiator-engine-cooling~5170742aa.html':{twins:['challenger'],part:'5170742AA',price:'$295.80 / individual radiator when reviewed',buyUrl:'https://parts.moparoriginalparts.com/oem-parts/mopar-engine-cooling-radiator-5170742aa',specAppend:'2015 catalog XDL dual-fan branch. This seller explicitly states sold in individual units and requires VIN at checkout; confirm the cooling configuration. Its copied description also mentions a wholesale pallet program, so reconfirm a one-radiator order if the checkout quantity or terms differ.'},
  'https://www.moparpartsgiant.com/parts/mopar-bolt-oil-drain~6507741aa.html':{twins:['challenger'],part:'6507741AA'},
  'https://www.moparpartsgiant.com/parts/mopar-filter-air~4861746ab.html':{twins:['challenger'],part:'4861746AB'},
  'https://www.moparpartsgiant.com/parts/mopar-antifreez-coolant~68163849ab.html':{twins:['challenger'],part:'68163849AB'},
  'https://tfswheels.com/products/voxx-replicas-hellcat-2-20x9-5-18-gloss-black-hc2-295-5115-18-gb':{twins:['challenger'],part:'HC2295511518GB',price:'$240.97 each · $963.88 for four when reviewed',specAppend:'The seller quantity selector defaults to four wheels. Select the number actually needed and confirm the final total. Seller-rated capacity is 1,600 lb per wheel; verify axle load requirements and brake clearance.'},
  'https://www.fortluft.com/mopar-chrysler-dodge-jeep-ram-8-and-9-speed-automatic-transmission-fluid-new-oem/':{twins:['challenger'],part:'68218925AB',price:'$26.17 / qt when reviewed'},
  'https://www.moparpartsgiant.com/parts/mopar-filter-cabin-air~68071668aa.html':{twins:['challenger'],part:'68071668AA',price:'$25.63 when reviewed'},
  'https://www.moparpartsgiant.com/parts/mopar-filter-engine-oil~4884899ac.html':{twins:['challenger'],part:'04884899AC'},
  'https://www.moparpartsgiant.com/parts/mopar-rear-disc-brake~68144223ad.html':{twins:['challenger'],part:'68144223AD',price:'$123.57 / four-pad axle set when reviewed'},
  'https://www.moparpartsgiant.com/parts/mopar-oil-fill~68145443ab.html':{twins:['challenger'],part:'68145443AB',price:'$16.44 when reviewed'},
  'https://www.moparpartsgiant.com/parts/mopar-caliper-disc-brake~68248388aa.html':{twins:['challenger'],part:'68248388AA',price:'$912.32 + $20 core when reviewed'},
  'https://www.moparpartsgiant.com/parts/mopar-caliper-disc-brake~68248389aa.html':{twins:['challenger'],part:'68248389AA',price:'$912.32 + $20 core when reviewed'},
  'https://www.moparpartsgiant.com/parts/mopar-caliper-disc-brake~5175108aa.html':{twins:['challenger'],part:'5175108AA',price:'$648.64 + $35 core when reviewed'},
  'https://www.moparpartsgiant.com/parts/mopar-caliper-disc-brake~5175109aa.html':{twins:['challenger'],part:'5175109AA',price:'$438.95 + $35 core when reviewed'},
  'https://www.moparpartsgiant.com/parts/mopar-rotor-brake~68184587ae.html':{twins:['challenger'],part:'68184587AE'},
  'https://www.moparpartsgiant.com/parts/mopar-rotor-brake~5290538ae.html':{twins:['challenger'],part:'5290538AE'},
  'https://www.moparpartsgiant.com/parts/mopar-nut-lug~6509873aa.html':{twins:['challenger'],part:'6509873AA'},
  'https://www.moparpartsgiant.com/parts/mopar-sensor-tire-pressure~56029400ae.html':{twins:['challenger'],part:'56029400AE'},
  'https://www.moparpartsgiant.com/parts/mopar-fluid-brake~4318080ad.html':{twins:['challenger'],part:'4318080AD'},
  'https://www.homedepot.com/p/308359257':{twins:['aviator'],part:'FA1884',price:'$19.82 when reviewed',buyUrl:'https://parts.levittownfordparts.com/oem-parts/ford-motorcraft-engine-air-filter-fa1884'},
  'https://www.carparts.com/wiper-blade/motorcraft/miww2617nh':{twins:['aviator'],part:'WW2617NH',price:'$19.25 when reviewed',buyUrl:'https://www.fordpartsgiant.com/parts/ford-blade-asy-wiper_ww-2617-nh.html'},
  'https://www.fordpartsgiant.com/parts/ford-blade-asy-wiper_ww-2114-nh.html':{twins:['aviator'],part:'WW2114NH'},
  'https://www.jegs.com/i/Motorcraft/037/XY75W85QL/10002/-1':{twins:['aviator'],part:'XY75W85QL'},
  'https://www.amazon.com/dp/B074MCWKCZ?tag=au7o-20':{twins:['murano','kicks'],part:'999MPCSHNS3',partNo:'999MP-NS300P → 999MP-CSHNS3 · 1 qt',price:'$19.23 / individual quart when reviewed',buyUrl:'https://parts.chapmannissan.com/parts/nissan-nissan-ns-3-cvt-transmission-fluid-ndash-quart-999mp-cshns3-999mpcshns3',specAppend:'This purchase is one 946 mL quart, not the former five-quart pack. Determine the actual service quantity using the exact CVT procedure; do not assume five bottles or a dry-fill capacity is the drain-and-fill amount.'},
  'https://www.autozone.com/p/motorcraft-spark-plug-sp-594/1169380':{twins:['aviator'],part:'SP594'},
  'https://www.varsityfordparts.com/oem-parts/ford-motorcraft-trade-cabin-air-filter-fp90':{twins:['aviator'],part:'FP90'},
  'https://www.autozone.com/p/stp-auto-transmission-fluid-stpdexvi1qt/811757':{twins:['xt6'],part:'STPDEXVI1QT'},
  'https://www.gmpartsgiant.com/parts/gm-filter-pass-compt-air-13508023.html':{twins:['xt6','camaro'],part:'13508023',price:'$31.15 when reviewed'},
  'https://www.gmpartsgiant.com/parts/gm-spark-plug-asm-12646780.html':{twins:['xt6'],part:'12646780',price:'$11.10 each when reviewed'},
  'https://www.gmpartsgiant.com/parts/chevrolet-spark-plug~12642722.html':{twins:['camaro'],part:'12642722',price:'$9.96 each when reviewed'},
  'https://www.gmpartsgiant.com/parts/gm-fluid-88862624.html':{twins:['xt6'],part:'88862624'},
  'https://parts.chevrolet.com/product/acdelco-gm-original-equipment-dexron-ls-75w-90-gear-oil-32-oz-88862624':{twins:['camaro'],part:'88862624',price:'$25.24 each · $50.48 for two before tax/shipping when reviewed',buyUrl:'https://www.gmpartsgiant.com/parts/gm-fluid-88862624.html'},
  'https://www.gmpartsgiant.com/parts/cadillac-blade-asm-wsw~84586337.html':{twins:['xt6'],part:'84586337',price:'$20.00 when reviewed'},
  'https://www.gmpartsgiant.com/parts/cadillac-blade-asm-wsw~84580859.html':{twins:['xt6'],part:'84580859',price:'$20.17 when reviewed'},
  'https://www.gmpartsgiant.com/parts/chevrolet-blade-asm-wsw~84613732.html':{twins:['camaro'],part:'84613732',price:'$19.66 when reviewed'},
  'https://www.gmpartsgiant.com/parts/chevrolet-blade-asm-wsw~84580859.html':{twins:['camaro'],part:'84580859',price:'$20.17 when reviewed'},
  'https://www.fordpartsgiant.com/parts/ford-element-asy-air-cleaner_ds7z-9601-d.html':{twins:['nautilus'],part:'DS7Z9601D',price:'$18.89 when reviewed'},
  'https://www.fordpartsgiant.com/parts/ford-filter-odour-and-particles_dg9z-19n619-aa.html':{twins:['nautilus'],part:'DG9Z19N619AA'},
  'https://www.fordpartsgiant.com/parts/ford-fluid-brake_pm-20.html':{twins:['nautilus','aviator'],part:'PM20'},
  'https://www.fordpartsgiant.com/parts/ford-oil-automatic-transmission_xt-12-qulv.html':{twins:['nautilus','aviator'],part:'XT12QULV',price:'$10.66 / qt when reviewed'},
  'https://www.fordpartsgiant.com/parts/ford-blade-asy-wiper_fa1z-17528-aa.html':{twins:['nautilus'],part:'FA1Z17528AA',price:'$18.96 when reviewed'},
  'https://www.fordpartsgiant.com/parts/ford-blade-asy-wiper_fa1z-17528-ba.html':{twins:['nautilus'],part:'FA1Z17528BA'},
  'https://www.nissanpartsdeal.com/parts/nissan-air-cleaner-element~16546-7lg0b.html':{twins:['kicks'],part:'165467LG0B'},
  'https://www.nissanpartsdeal.com/parts/nissan-air-filter-assy~27891-5rb0c.html':{twins:['kicks'],part:'278915RB0C'},
  'https://www.nissanpartsdeal.com/parts/nissan-element-assy-ai~16546-0z000.html':{twins:['murano'],part:'165460Z000'},
  'https://www.nissanpartsdeal.com/parts/nissan-air-filter~27277-9nm0a.html':{twins:['murano'],part:'272779NM0A'},
  'https://www.nissanpartsdeal.com/parts/nissan-plug-spark~22401-ew61c.html':{twins:['murano'],part:'22401EW61C'},
  'https://parts.nissanusa.com/parts/nissan-spark-plug-224017lg1c':{twins:['kicks'],part:'224017LG1C',price:'$21.74 each when reviewed'},
  'https://parts.nissanusa.com/parts/nissan-title-999mpa4100p':{twins:['kicks','murano'],part:'999MPA4100P',price:'$6.59 / 12 oz when reviewed'},
  'https://www.acurapartswarehouse.com/oem/acura~atf~type~3~1~08200-9017.html':{twins:['mdx'],part:'082009017'},
  'https://www.acurapartswarehouse.com/oem/acura~element~filter~80292-SDA-407.html':{twins:['mdx'],part:'80292SDA407',price:'$20.45 when reviewed'},
  'https://www.acurapartswarehouse.com/oem/acura~spark~plug~dilzkr7b11g~ngk~12290-R9P-A01.html':{twins:['mdx'],part:'12290R9PA01'},
  'https://acura.bernardiparts.com/Acura-All-Wheel-Drive-Fluid-DPSF__08200-9007A.aspx':{twins:['mdx'],part:'082009007A',price:'$14.80 each when reviewed · 2 qt required'},
  'https://acura.oempartsonline.com/oem-parts/acura-fluid-hgo-1-82009014a':{twins:['mdx'],part:'082009014A',price:'$19.49 when reviewed'},
  'https://parts.cadillac.com/product/acdelco-gm-original-equipment-dot-3-hydraulic-brake-fluid-16-oz-19353126':{twins:['xt6'],part:'19353126',price:'$5.69 / 16 oz when reviewed',buyUrl:'https://www.gmwholesaledirect.com/oem-parts/gm-dot-3-brake-fluid-19353126'},
  'https://parts.chevrolet.com/product/acdelco-gm-original-equipment-dot-3-hydraulic-brake-fluid-16-oz-19353126':{twins:['camaro'],part:'19353126',price:'$5.69 / 16 oz when reviewed',buyUrl:'https://www.gmwholesaledirect.com/oem-parts/gm-dot-3-brake-fluid-19353126'},
  'https://parts.gmparts.com/product/acdelco-gm-original-equipment-multi-purpose-electro-hydraulic-system-fluid-1-l-88901975':{twins:['xt6'],part:'88901975',price:'$24.46 / 1 L when reviewed',buyUrl:'https://www.gmpartscenter.net/oem-parts/gm-multi-purpose-electro-hydraulic-system-fluid-1-l-88901975'},
};
export function refreshReviewedPurchase(twinId, product) {
    const reviewed=REVIEWED_RETAINED_PURCHASES[product?.buyUrl];
    if(!reviewed?.twins.includes(twinId))return product;
    const identity=new RegExp(`(^|[^a-z0-9-])${reviewed.part.split('').join('[-\\s]*')}(?=$|[^a-z0-9-])`,'i');
    if(!identity.test(String(product?.partNo||'')))return product;
    return {...product,...(reviewed.price?{price:reviewed.price}:{}),...(reviewed.buyUrl?{buyUrl:reviewed.buyUrl}:{}),...(reviewed.partNo?{partNo:reviewed.partNo}:{}),...(reviewed.specAppend?{spec:[product.spec,reviewed.specAppend].filter(Boolean).join(' ')}:{}),reviewedAt:'2026-09-08'};
}
export function refreshReviewedServiceContext(twinId, context) {
  if(!context?.service)return context;
  const refresh=(product)=>refreshReviewedPurchase(twinId,product);
  return {...context,service:Object.fromEntries(Object.entries(context.service).map(([key,service])=>[key,Array.isArray(service.products)?{...refresh(service),products:service.products.map(refresh)}:refresh(service)]))};
}

export function buildOilComponentService(twinId, filterService) {
  const plan = TWIN_OIL_COMPONENTS[twinId];
  if (!plan || !filterService) return filterService;
  const oil = OILS[plan.oil];
  const filterUpdate = REVIEWED_FILTER_UPDATES[twinId];
  const reviewedFilter = filterUpdate && matchesPurchase(filterService, filterUpdate.part, filterUpdate.url)
    ? {...filterService,...filterUpdate.changes,reviewedAt:'2026-09-08'} : filterService;
  const products = [];
  const addOil = (item, quarts, quantity, price) => products.push({
    componentRole:'engine-oil', label:`Engine oil · ${quarts} US qt ${quarts === 1 ? 'bottle' : 'jug'}${quantity > 1 ? ` · ${quantity} needed for nominal refill` : ''}`,
    brand:oil.brand, partNo:`Walmart item ${item}`, price:`$${price.toFixed(2)} per ${quarts === 1 ? 'bottle' : 'jug'} when reviewed`,
    buyUrl:`https://www.walmart.com/ip/${item}`, buyLabel:quarts === 1 && oil.jug ? 'Buy supplemental quart' : 'Buy engine oil',
    soldQuarts:quarts, purchaseQuantity:quantity, reviewedAt:'2026-09-08', sourceUrl:oil.sourceUrl,
    spec:plan.specification, fitmentReviewed:true,
    note:'Sold and shipped by Walmart when reviewed; price, seller and stock vary by location. Match the named oil and approval on the delivered bottle.',
  });
  if (oil.jug) {
    addOil(oil.jug, 5, 1, 31.97);
    if (plan.capacity > 5) addOil(oil.quart, 1, 1, 9.97);
  } else addOil(oil.quart, 1, 10, 11.88);
  // Preserve the researched filter destination; never count it as engine oil.
  products.push({ ...purchaseEvidence(reviewedFilter), componentRole:'oil-filter', label:'Engine oil filter', partNo:reviewedFilter.partNo,
    brand:reviewedFilter.brand, price:reviewedFilter.price, buyUrl:reviewedFilter.buyUrl,
    buyLabel:reviewedFilter.buyLabel, spec:reviewedFilter.spec, fitmentReviewed:reviewedFilter.fitmentReviewed,
  });
  const supply = oil.jug ? plan.capacity > 5
    ? 'Buy one five-quart jug plus one supplemental quart; a jug alone is insufficient.'
    : 'One five-quart jug supplies the nominal refill; oil will remain in the jug.'
    : 'Buy ten one-quart bottles for the nominal complete refill; the listing is not a case.';
  return {
    ...filterService, partNo:undefined, brand:undefined, price:undefined, buyUrl:undefined, buyLabel:undefined,
    products, productsLabel:'Oil and filter — separate purchases', productFitmentMode:'individual',
    sourceUrl:plan.sourceUrl, sourceLabel:plan.sourceLabel, oilCapacityQuarts:plan.capacity,
    spec:`${plan.specification} Approximate oil-and-filter refill: ${plan.capacityLabel}. ${supply} Capacity is a reference, not a pour instruction: follow the manual’s level-check procedure and dipstick. For a top-up, use the measured level, not full-change capacity. Follow the factory schedule, not retailer extended-mileage claims.`,
  };
}

// Each rotor listing sells one rotor; the axle needs two when replacement is
// justified. Pad replacement and rotor replacement remain separate records.
const rotor = (partNo, brand, price, buyUrl, spec, sourceUrl) => ({
  partNo, brand, price:`$${price.toFixed(2)} each when reviewed · two per axle`, buyUrl,
  componentRole:'brake-rotor', soldQuantity:1, purchaseQuantity:2,
  reviewedAt:'2026-09-08', fitmentReviewed:true, spec:`${spec} Order two for an axle pair only after inspection confirms replacement. Pads and required service hardware are separate purchases.`, sourceUrl,
  note:'Order two for an axle pair only after inspection confirms replacement. Pads and required service hardware are separate purchases.',
});
const GM_XT6_BRAKES = 'https://www.gmpartsgiant.com/parts-list/2020-cadillac-xt6-awd/front_end_sheet_metal_heater/vehicle_maintenance.html';
const GM_CAMARO_BRAKES = 'https://www.gmpartsgiant.com/parts-list/2019-chevrolet-camaro/front_end_sheet_metal_heater/vehicle_maintenance.html';
const NISSAN_MURANO_BRAKES = 'https://www.nissanpartsdeal.com/parts-list/2023-nissan-murano/brake-components.html';
const AVIATOR_ROTOR_PURCHASE = 'https://www.tirerack.com/brakes/brakes.jsp?make=PowerStop&model=Evolution+Plain+Geomet+Fully+Coated+Rotor&group=Evolution+Plain+Geomet+Fully+Coated+Rotor&partNum=AR85204EVC&autoMake=Lincoln&autoModel=Aviator+RWD&autoYear=2026&autoModClar=255%2F55-20';
export const TWIN_ROTOR_COMPONENTS = {
  aviator:{
    front:rotor('AR85204EVC','PowerStop Evolution plain coated front rotor',84.60,AVIATOR_ROTOR_PURCHASE,'2026 Aviator Premiere RWD, 345 mm front-brake branch only, not 363 mm high-series brakes. This product page includes both axles: select two front rotors and set rear quantity to zero for a front-only job. Confirm installed rotor diameter.',AVIATOR_ROTOR_PURCHASE),
    rear:rotor('AR85205EVC','PowerStop Evolution plain coated rear rotor',82.80,AVIATOR_ROTOR_PURCHASE,'2026 Aviator Premiere RWD, 350 mm rear rotor. This product page includes both axles: select two rear rotors and set front quantity to zero for a rear-only job. Do not assume a front-brake job requires rear replacement.',AVIATOR_ROTOR_PURCHASE),
  },
  nautilus:{
    front:rotor('K2GZ-1125-B','Genuine Ford front brake rotor',111.24,'https://www.fordpartsgiant.com/parts/ford-rotor-assembly-brake_k2gz-1125-b.html','2019 Nautilus 2.0L Standard FWD demo: 18-inch front-brake package, either side. Brake-package names are not road-wheel diameters.','https://www.fordpartsgiant.com/parts-list/2019-lincoln-nautilus/chassis/front_brake_discs_and_calipers.html'),
    rear:rotor('KS7Z-2C026-A','Genuine Ford solid rear brake rotor',99.44,'https://www.fordpartsgiant.com/parts/ford-rotor-asy-brake_ks7z-2c026-a.html','2019 Nautilus Standard FWD solid-rear branch only: 316 × 11 mm. Cross-references E1GZ-2C026-C/E; do not substitute for the larger vented-rear package. Confirm VIN and installed rotor before ordering.','https://www.onlinefordpartscatalog.com/v-2019-lincoln-nautilus--black-label--2-0l-l4-gas/brakes--parking-brake'),
  },
  camaro:{
    front:rotor('84271643','Genuine GM front brake rotor',541.98,'https://www.gmpartsgiant.com/parts/gm-rotor-asm-frt-brk-84271643.html','2019 ZL1 1LE LT4 / J6H front brake package only; not SS J6G/J6M. Sold individually, either front side.',GM_CAMARO_BRAKES),
    rear:rotor('85589610','Genuine GM rear brake rotor',151.60,'https://www.gmpartsgiant.com/parts/gm-rotor-rr-brk-85589610.html','2019 ZL1 1LE / J6H rear brake package. Replaces 23369743 / 23304410; sold individually, either rear side.',GM_CAMARO_BRAKES),
  },
  xt6:{
    front:rotor('13546861','Genuine GM coated front brake rotor',123.07,'https://www.gmpartsgiant.com/parts/gm-rotor-frt-brk-ctd-13546861.html','2020 XT6 Sport AWD 3.6L; 345 × 30 mm front rotor, either side.',GM_XT6_BRAKES),
    rear:rotor('13516726','Genuine GM coated rear brake rotor',101.85,'https://www.gmpartsgiant.com/parts/gm-rotor-rr-brk-coated-13516726.html','2020 XT6 Sport AWD 3.6L rear rotor, either side; replaces 13592624.',GM_XT6_BRAKES),
  },
  murano:{
    front:rotor('40206-3JA0A','Genuine Nissan front brake rotor',103.09,'https://www.nissanpartsdeal.com/parts/nissan~rotor-disc-brak~40206-3ja0a.html','2023 Murano SV 3.5L VQ35DE front axle, either side.',NISSAN_MURANO_BRAKES),
    rear:rotor('43206-3JA0A','Genuine Nissan rear brake rotor',103.09,'https://www.nissanpartsdeal.com/parts/nissan~rotor-brake~43206-3ja0a.html','2023 Murano SV 3.5L VQ35DE rear axle, FWD/AWD, either side.',NISSAN_MURANO_BRAKES),
  },
  kicks:{
    front:rotor('40206-7LG0A','Genuine Nissan front brake rotor',85.27,'https://www.nissanpartsdeal.com/parts/nissan-rotor-disc-brake-front~40206-7lg0a.html','Redesigned 2025 Kicks SV 2.0L MR20DD front axle. Not the 1.6L Kicks Play.', 'https://www.nissanpartsdeal.com/oem-nissan-kicks-brake_disc.html'),
    rear:rotor('43206-5R00A','Genuine Nissan rear disc brake rotor',85.27,'https://www.nissanpartsdeal.com/parts/nissan-drum-brake-rear-axle~43206-5r00a.html','Redesigned 2025 Kicks SV 2.0L FWD rear disc rotor, either side. Retailer legacy title says drum; Nissan identifies this exact part as a disc rotor.', 'https://parts.nissanusa.com/v-2025-nissan-kicks--s--2-0l-l4-gas/brakes--rear-brakes'),
  },
  mdx:{
    front:rotor('45251-TK8-A02','Genuine Acura front brake rotor',108.58,'https://www.curryacuraparts.com/oem-parts/acura-disc-brake-rotor-45251tk8a02','2019 MDX Technology SH-AWD 3.5L / KA9AT, either front side; not the 3.0L Sport Hybrid.', 'https://www.acurapartswarehouse.com/parts-list/2019-acura-mdx--5dr_tech_sh_awd_ent_6p-ka9at/chassis/front_brake.html'),
    rear:rotor('42510-TZ5-H10','Genuine Acura rear brake rotor',106.68,'https://www.acurapartswarehouse.com/oem/acura~disk~rr~brake~42510-tz5-h10.html','2019 MDX Technology 3.5L / KA9AT rear axle, either side; not the 3.0L Sport Hybrid.', 'https://www.acurapartswarehouse.com/oem/acura~disk~rr~brake~42510-tz5-h10.html'),
  },
};

export function buildBrakeComponentService(twinId, axle, padService = {}) {
  const cap = axle === 'front' ? 'Front' : 'Rear';
  const pad = {...purchaseEvidence(padService),componentRole:'brake-pads',label:`${cap} pads · axle set`,partNo:padService.partNo,
    brand:padService.brand,price:padService.price,buyUrl:padService.buyUrl,buyLabel:padService.buyLabel,
    spec:padService.spec,fitmentReviewed:padService.fitmentReviewed};
  if(twinId === 'mdx' && axle === 'rear' && matchesPurchase(padService,'43022TZ5A10','https://www.acurapartswarehouse.com/oem/acura~pad~set~rr~43022-tz5-a10.html')) {
    pad.buyUrl='https://acura.bernardiparts.com/Acura-PAD-SET-RR__43022-TZ5-A10.aspx';
    pad.price='$106.67 / rear axle set when reviewed';
    pad.reviewedAt='2026-09-08';
  }
  if(twinId === 'kicks' && axle === 'rear' && matchesPurchase(padService,'D40607LG1A','https://parts.nissanusa.com/parts/nissan-disc-brake-pad-set-d40607lg1a')) Object.assign(pad,{price:'$91.85 / rear axle set when reviewed',reviewedAt:'2026-09-08'});
  if(twinId === 'aviator' && axle === 'front' && matchesPurchase(padService,'ACT2230','https://www.partcatalog.com/products/akebono-act2230-disc-brake-pad-set-front')) Object.assign(pad,{price:'$81.53 / front axle set when reviewed',reviewedAt:'2026-09-08'});
  // The old Camaro label mixed a rotor number with a pad-only destination.
  if(twinId === 'camaro' && axle === 'front' && matchesPurchase(padService,'23399101','https://www.gmpartsgiant.com/parts/chevrolet-pad-kit-frt-disc-brk~23399101.html')) {
    pad.partNo='23399101'; pad.brand='Genuine GM ZL1 front brake pad kit';
    pad.price='$311.44 / front axle set when reviewed'; pad.reviewedAt='2026-09-08';
    pad.spec='2019 Camaro ZL1 1LE / J6H six-piston front calipers; one kit covers both front sides. Rotors sold separately.';
  }
  const reviewedRotor = TWIN_ROTOR_COMPONENTS[twinId]?.[axle];
  const rotorProduct = reviewedRotor ? {...reviewedRotor,label:`${cap} rotor · one each`,buyLabel:`Buy ${axle} rotor`} : null;
  const holdReason = twinId === 'aviator'
    ? `The 2026 Aviator has 345 mm and 363 mm front-brake branches. Confirm the installed package and exact ${axle} application before ordering; earlier model-year rotor listings are not sufficient.`
    : `The exact ${axle} rotor purchase is still being reviewed for this vehicle. ${axle === 'rear' && twinId === 'nautilus' ? 'The solid-rear OEM and Brembo listings checked are currently unavailable; do not substitute the vented-rear rotor.' : 'Confirm the installed brake package before ordering.'}`;
  const parts = [pad,rotorProduct].filter(product=>product?.buyUrl);
  return {
    parent:{...padService,partNo:undefined,brand:undefined,price:undefined,buyUrl:undefined,buyLabel:undefined,
      products:parts,productsLabel:'Pads and rotors — separate purchases',productFitmentMode:'individual',
      commerceStatus:rotorProduct?undefined:'link-hold',holdReason:rotorProduct?undefined:holdReason,
      spec:'Inspect pad thickness, rotor thickness/runout, calipers and required hardware before selecting replacements. A pad replacement does not mean the rotors were replaced. Record each completed component below.'},
    pads:{...pad,commerceStatus:padService.commerceStatus,holdReason:padService.holdReason},
    rotors:rotorProduct || {componentRole:'brake-rotor',commerceStatus:'link-hold',holdReason,spec:holdReason},
  };
}

const radiator = (partNo, price, buyUrl, spec, sourceUrl) => ({
  componentRole:'engine-radiator',label:'Main engine radiator · only if replacement is diagnosed',
  partNo,brand:'Genuine OE main engine radiator',price:`$${price.toFixed(2)} each when reviewed`,buyUrl,buyLabel:'View exact radiator',
  soldQuantity:1,purchaseQuantity:1,reviewedAt:'2026-09-08',fitmentReviewed:true,spec,sourceUrl,
  note:'Not a scheduled replacement. Confirm the leak or restriction is in the radiator, not a hose, pump, cooler or another circuit. Coolant, damaged mounts/seals and required service hardware are separate.',
});
export const TWIN_RADIATOR_COMPONENTS = {
  aviator:{...radiator('L1MZ-8005-K / Motorcraft RAD286',574.60,'https://www.ford.com/product/radiator-p4000123504','Ford lists this main engine radiator for 2020–2026 Lincoln Aviator 3.0L gasoline. Have the dealer confirm your VIN, build date and cooling equipment before ordering. Not a transmission cooler or a routine fluid-service purchase.','https://www.ford.com/product/radiator-p4000123504'),brand:'Motorcraft RAD286 main engine radiator',price:'$574.60 MSRP each when reviewed',reviewedAt:'2026-09-13',note:'Not a scheduled replacement. Diagnose the actual leak or restriction first. Ford requires dealer selection for availability and ordering; MSRP is not a guaranteed local price or stock claim. Confirm VIN fitment with the dealer. Coolant, damaged mounts/seals and required service hardware are separate.'},
  camaro:radiator('86551904 (replaces 23477182 / 84947855)',476.34,'https://www.gmwholesaledirect.com/oem-parts/gm-w-s-radiator-86551904','2019 Camaro ZL1 1LE LT4 primary engine radiator with auxiliary cooling. Not LT1 radiator 86551905, supercharger heat exchanger 22879421, or auxiliary cooler 84510352.','https://www.gmwholesaledirect.com/v-2019-chevrolet-camaro--zl1--6-2l-v8-gas/cooling-system--radiator-and-components'),
  xt6:radiator('85557760 → 85797937',338.34,'https://www.gmpartsgiant.com/parts/gm-radiator-asm-eng-85557760.html','2020 XT6 Sport AWD LGX 3.6 / 9T65, radiator code AC7W. Oil in coolant requires diagnosis of the oil cooler/engine source first; this radiator alone does not fix block porosity.','https://www.gmpartsgiant.com/parts-list/2020-cadillac-xt6-awd/cooling_system_grille_oil_system/radiator_assembly.html'),
  kicks:radiator('21410-7LF0A',348.40,'https://www.nissanpartsdeal.com/parts/nissan-radiator-assy~21410-7lf0a.html','Redesigned 2025 Kicks SV 2.0L MR20DD, main engine radiator. Not the 1.6L Kicks Play.','https://www.nissanpartsdeal.com/parts-list/2025-nissan-kicks/radiator-components.html'),
  murano:radiator('21460-5AA0C',682.92,'https://www.nissanpartsdeal.com/parts/nissan-radiator-assy~21460-5aa0c.html','2023 Murano SV 3.5L VQ35DE non-hybrid main radiator; replaces 21460-5AA0A. Not the hybrid auxiliary cooling circuit.','https://parts.nissanusa.com/v-2023-nissan-murano--platinum--3-5l-v6-gas/cooling-system--radiator-and-components'),
  mdx:radiator('19010-5J6-A01',424.32,'https://acura.bernardiparts.com/Acura-RADIATOR-DENSO__19010-5J6-A01.aspx','2019 MDX Technology SH-AWD 3.5L / KA9AT main Denso radiator. Not a Sport Hybrid battery-cooling radiator.','https://www.acurapartswarehouse.com/parts-list/2019-acura-mdx--5dr_tech_sh_awd_7p-ka9at/electrical_exhaust_heater_fuel/radiator_denso.html'),
  nautilus:radiator('F2GZ-8005-G',365.96,'https://www.fordpartsgiant.com/parts/ford-radiator-assembly_f2gz-8005-g.html','2019 Nautilus 2.0L Standard FWD main radiator; replaces F2GZ-8005-B/E. This is not the EGR cooler and will not resolve a confirmed EGR-cooler leak.','https://www.fordpartsgiant.com/oem-lincoln-nautilus-radiator.html'),
};

export function buildCoolingComponentService(twinId, coolantService = {}) {
  const product = TWIN_RADIATOR_COMPONENTS[twinId];
  const coolant = {...purchaseEvidence(coolantService),componentRole:'engine-coolant',label:'Engine coolant · separate fluid purchase',
    partNo:coolantService.partNo,brand:coolantService.brand,price:coolantService.price,buyUrl:coolantService.buyUrl,
    buyLabel:coolantService.buyLabel,spec:coolantService.spec,fitmentReviewed:coolantService.fitmentReviewed};
  const holdReason = 'The exact main radiator purchase has not been reviewed for this configuration. Confirm the VIN and cooling equipment before ordering.';
  return {
    // Deliberately do not copy the coolant interval onto the radiator parent.
    products:[product,coolant].filter(p=>p?.buyUrl),productsLabel:'Conditional radiator repair and coolant',productFitmentMode:'individual',
    commerceStatus:product?undefined:'fitment-hold',holdReason:product?undefined:holdReason,
    sourceUrl:product?.sourceUrl,sourceLabel:'Exact vehicle cooling-system catalog',
    spec:'Inspect for the actual source of coolant loss, overheating or restricted flow before buying a radiator. Never open a hot pressurized cooling system. A routine coolant change does not require a new radiator; use the Engine Coolant child card for its separate schedule and fluid service. Confirm the required coolant mixture, fill quantity and air-bleeding procedure in the exact service instructions.',
  };
}
