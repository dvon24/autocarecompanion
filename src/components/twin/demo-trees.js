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

const STRUCTURE = {
  car:{label:'Whole car',short:'Whole car',root:'car',nodes:{
    car:{label:'Whole car',group:true,kids:['wheelRoot','engineRoot','wiperRoot'],availability:'unavailable'},
    wheelRoot:{label:'Wheel, Tire & Brakes',group:true,kids:['tire'],availability:'unavailable'},
    tire:{label:'Tire',kids:[],availability:'unavailable'},
    engineRoot:{label:'Engine',group:true,kids:['oil','rad','airFilter'],availability:'unavailable'},
    oil:{label:'Engine oil',kids:[],availability:'unavailable'},rad:{label:'Radiator & Coolant',kids:[],availability:'unavailable'},
    airFilter:{label:'Engine Air Filter',kids:[],availability:'unavailable'},
    wiperRoot:{label:'Windshield Wipers',group:true,kids:['wipL'],availability:'unavailable'},wipL:{label:'Wiper blades',kids:[],availability:'unavailable'},
  }},
  wheel:{label:'Wheel, Tire & Brakes',short:'Wheels',root:'wheelRoot',nodes:{}},
  engine:{label:'Engine',short:'Engine',root:'engineRoot',nodes:{}},
  wipers:{label:'Windshield Wipers',short:'Wipers',root:'wiperRoot',nodes:{}},
};
for (const branch of ['wheel','engine','wipers']) {
  const root = STRUCTURE[branch].root;
  const ids = [root, ...STRUCTURE.car.nodes[root].kids];
  STRUCTURE[branch].nodes = Object.fromEntries(ids.map((id) => [id, STRUCTURE.car.nodes[id]]));
}

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
  const trees = cloneTrees(STRUCTURE);
  const transmission = {label:'Transmission',short:'Transmission',root:'trx',nodes:{
    trx:{label:'Transmission',group:true,kids:['transFluid'],availability:'sample'},
    transFluid:{label:twin.id === 'murano' ? 'Xtronic CVT fluid' : 'Automatic transmission fluid',kids:[],availability:'sample'},
  }};
  trees.trans = transmission;
  trees.car.nodes.car.kids.push('trx'); Object.assign(trees.car.nodes, transmission.nodes);
  if (twin.id === 'nautilus') {
    const issue = {id:'lincoln-nautilus-2-0l-ecoboost-coolant-loss-egr-cooler-leak-low-coolant-white',label:'Published known issue'};
    trees.engine.nodes.rad.knownIssue = issue;
    trees.car.nodes.rad.knownIssue = issue;
    const transIssue = {id:'lincoln-nautilus-8f35-8-speed-automatic-shudder-buck-jerk-under-35-mph',label:'Published known issue'};
    trees.trans.nodes.transFluid.knownIssue = transIssue;
    trees.car.nodes.transFluid.knownIssue = transIssue;
  }
  if (twin.id === 'xt6') {
    const timing = {label:'3.6L V6 timing system',kids:[],availability:'sample',knownIssue:{id:'cadillac-xt6-timing-chain-2020',label:'Published known issue'}};
    trees.engine.nodes.engineRoot.kids.push('timing');
    trees.engine.nodes.timing = timing;
    trees.car.nodes.timing = timing;
    const transIssue = {id:'cadillac-xt6-9speed-transmission-2020',label:'Published known issue'};
    trees.trans.nodes.transFluid.knownIssue = transIssue;
    trees.car.nodes.transFluid.knownIssue = transIssue;
  }
  return trees;
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
    if (!node) continue;
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
