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
    radiatorIssue:{id:'lincoln-nautilus-2-0l-ecoboost-coolant-loss-egr-cooler-leak-low-coolant-white',label:'2.0L EcoBoost coolant loss / EGR cooler leak'},
    engineIssues:[{key:'startStop',id:'lincoln-nautilus-auto-start-stop-malfunction-engine-won-t-auto-restart',label:'Auto Start-Stop / 12V battery malfunction',sub:'2019 Nautilus may fail to restart after an automatic stop',where:'12V battery, charging system and powertrain controls'}],
    transmissionIssues:[{key:'transShudder',id:'lincoln-nautilus-8f35-8-speed-automatic-shudder-buck-jerk-under-35-mph',label:'8F35 low-speed shudder',sub:'Shudder, buck or jerk below 35 mph',where:'8F35 transmission and calibration branch'}],
    cabinIssues:[{key:'sync',id:'lincoln-nautilus-sync-3-apim-infotainment-freezes-black-screens-reboots',label:'SYNC 3 / APIM freezes and reboots',sub:'2019 Standard-trim infotainment issue',where:'Center display and APIM behind the instrument panel'}],
  },
  murano:{engine:'3.5L VQ35DE V6',transmission:'Xtronic continuously variable transmission',wheel:'2023 Murano SV wheel and tire package',cabinIssues:[
    {key:'aeb',id:'nissan-murano-automatic-emergency-braking-forward-collision-phantom-activa',label:'AEB phantom activation',sub:'Forward-collision system may brake without a true obstacle',where:'Forward driver-assistance sensing and control system'},
    {key:'battery',id:'nissan-murano-battery-drain-and-no-start-2021',label:'Battery drain / no-start',sub:'Telematics or infotainment modules may remain awake',where:'12V battery and module sleep-current circuit'},
    {key:'seatTrack',id:'nissan-murano-front-driver-seat-frametrack-2021',label:'Driver-seat frame / track movement',sub:'Seat may rock, click or move unexpectedly',where:'Front driver-seat frame and floor-mounted track'},
    {key:'frontRadar',id:'nissan-murano-front-radarsensor-malfunctions-triggering-2021',label:'Front radar / sensor malfunction',sub:'AEB, ICC and forward-collision warnings may appear',where:'Front radar sensor and its mounting/alignment branch'},
    {key:'rearCamera',id:'nissan-murano-rearview-camera-image-blank-2021',label:'Rear-view camera image failure',sub:'Camera image may be blank, distorted or intermittent',where:'Liftgate camera, harness and AV control unit'},
  ]},
  xt6:{
    engine:'3.6L naturally aspirated V6',transmission:'9-speed automatic transmission',wheel:'2020 XT6 Sport wheel and tire package',
    timingIssue:{id:'cadillac-xt6-timing-chain-2020',label:'3.6L V6 timing-chain concern'},
    engineIssues:[{key:'startStop',id:'cadillac-xt6-auto-stop-2020',label:'Auto Start-Stop harshness / battery issue',sub:'Restart harshness and battery-related stop/start faults',where:'12V battery, starter system and powertrain controls'}],
    transmissionIssues:[
      {key:'trans9Speed',id:'cadillac-xt6-9speed-transmission-2020',label:'9-speed shudder and hesitation',sub:'Published 9-speed shift-quality issue',where:'9-speed automatic transmission and calibration branch'},
      {key:'transHarsh',id:'cadillac-xt6-transmission-shudder-2020',label:'Transmission shudder / harsh shifts',sub:'Separate published XT6 transmission-shudder record',where:'9-speed automatic transmission and fluid/control branch'},
      {key:'ptuLeak',id:'cadillac-xt6-ptu-leak-2020',label:'AWD power-transfer-unit fluid leak',sub:'Sport AWD driveline may leak at the PTU',where:'Power transfer unit between transmission and rear driveline'},
    ],
  },
};

const demoNode = ({label,sub,img,kids=[],where,spec,life,group=false,knownIssue,unlogged=!group}) => ({
  label,sub,img,kids,where,spec,life,group,knownIssue,unlogged,
  availability:'sample',partNo:UNSOURCED,price:'Price not sourced for this demo',
});
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
    tire:demoNode({label:'Tires & Rotation',sub:`${modelLabel} four-tire rotation · sample history`,img:'/twin-stage/parts/part-tire.webp',where:'All four corners',spec:`${modelLabel} exact tire size is wheel-package dependent and remains explicitly unsourced; verify the driver-door placard`,life:'Rotate on the vehicle-specific interval recorded in this demo'}),
    brakes:demoNode({label:'Brake System',sub:`${modelLabel} pads, rotors, calipers and fluid`,img:'/twin-stage/parts/part-caliper.webp',where:'Front and rear axles',spec:`Measure ${twin.identity.model} pad thickness and rotor condition; no replacement part is asserted here`,life:'Condition-based inspection; this demo has no logged brake replacement'}),
  };
  const engineIssueNodes=Object.fromEntries((context.engineIssues||[]).map((issue)=>[issue.key,issueNode(twin,issue,'/twin-stage/parts/part-engine.webp')]));
  const hoodKids=['oil','airFilter',...(context.timingIssue?['timing']:[]),...Object.keys(engineIssueNodes)];
  const engineNodes = {
    engineRoot:demoNode({label:'Engine',sub:context.engine,img:'/twin-stage/parts/part-engine.webp',kids:['hoodRoot','rad'],group:true,where:'Under the hood',spec:`${context.engine} · exact service fluids remain manual/VIN dependent`,life:'Follow the cited sample schedule; no Challenger specifications are reused'}),
    hoodRoot:demoNode({label:'Engine Service & Issues',sub:`${modelLabel} · ${context.engine}`,img:'/twin-stage/parts/part-engine.webp',kids:hoodKids,group:true,where:'Under the hood and engine controls',spec:'Service records and published engine issues for this exact demo identity',life:'Intervals are shown only where cited sample evidence exists'}),
    oil:demoNode({label:'Engine Oil & Filter',sub:`${modelLabel} · ${context.engine} scheduled service`,img:'/twin-stage/parts/part-oil-filter.webp',where:'Engine lubrication system',spec:`The exact ${twin.identity.model} viscosity, approval and capacity remain owner-manual dependent in this demo`,life:'The demo clock comes only from the cited owner schedule'}),
    airFilter:demoNode({label:'Engine Air Filter',sub:`${modelLabel} dry replacement filter element`,img:'/twin-stage/parts/part-air-filter.webp',where:'Engine intake airbox',spec:`The ${context.engine} filter shape and part number remain explicitly unsourced pending VIN confirmation`,life:'Inspect sooner in dust; the cited sample record supplies any shown interval'}),
    rad:demoNode({label:'Radiator & Coolant',sub:`${modelLabel} cooling circuit inspection`,img:'/twin-stage/parts/part-radiator.webp',kids:['coolant'],group:true,where:'Front cooling module and engine coolant circuit',spec:`Pressure-test the ${context.engine} cooling circuit and verify exact coolant chemistry before service`,life:'Inspect level, hoses and visible joints; no replacement interval is invented',knownIssue:context.radiatorIssue?{...context.radiatorIssue,href:issueHref(twin,context.radiatorIssue.id)}:undefined}),
    coolant:demoNode({label:'Engine Coolant',sub:`${modelLabel} chemistry requires manual/VIN confirmation`,img:'/twin-stage/parts/part-antifreeze.webp',where:'Cooling circuit and expansion reservoir',spec:`Never mix coolant chemistries; no ${twin.identity.model} product fit is asserted in this demo`,life:'Condition and schedule based; no sample coolant service is logged'}),
    ...(context.timingIssue?{timing:demoNode({label:'Timing Chain System',sub:`${modelLabel} 3.6L V6 chain, guides and tensioners`,img:'/twin-stage/parts/part-engine.webp',where:'Front and upper engine timing drive',spec:'Diagnose correlation faults and mechanical timing before parts replacement',life:'Known-issue evidence is model/engine specific; no replacement mileage is invented',knownIssue:{...context.timingIssue,href:issueHref(twin,context.timingIssue.id)}})}:{}),
    ...engineIssueNodes,
  };
  const transmissionIssueNodes=Object.fromEntries((context.transmissionIssues||[]).map((issue)=>[issue.key,issueNode(twin,issue,'/twin-stage/parts/part-transmission.webp')]));
  const transmissionNodes = {
    trx:demoNode({label:'Transmission',sub:`${modelLabel} · ${context.transmission}`,img:'/twin-stage/parts/part-transmission.webp',kids:['transFluid',...Object.keys(transmissionIssueNodes)],group:true,where:'Powertrain driveline',spec:`${context.transmission} · confirm VIN before any parts or fluid order`,life:'Use the cited vehicle schedule and operating-condition branch'}),
    transFluid:demoNode({label:twin.id==='murano'?'CVT Fluid Service':'Automatic Transmission Fluid',sub:`${modelLabel} fluid-service branch · exact product not asserted`,img:'/twin-stage/parts/part-transmission.webp',where:'Transmission sump and fill/check circuit',spec:`Fluid type, level temperature and procedure must match this ${context.transmission}`,life:'The sample clock comes only from a cited schedule; severe use may differ'}),
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
  const serviceLeaves = nodes.filter((node) => !node.group && (
    node.unlogged || (typeof node.riskAt === 'number' && node.riskAt > 0) || !!node.dueDate
  ));
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
    return node.overdueByDate || (dueMileage != null && dueMileage <= miles);
  });
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
