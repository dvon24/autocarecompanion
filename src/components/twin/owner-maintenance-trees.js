import { buildTwinTrees, servicedFromRecords } from './twin-trees';
import { getTwinByFulfillmentId } from '../../lib/vehicle-twin-catalog';
import { sameTwinVehicleIdentity } from '../../lib/twin-fulfillment';
import { applyOwnerMaintenanceIntervals } from '../../lib/vehicle-maintenance-intervals';
import { mergeCatalogEvidenceIntoOwnerTrees, buildModelOwnerTrees } from './demo-trees';
import { REVIEWED_OWNER_EQUIPMENT, ownerEquipmentReady, ownerEquipmentFitmentKey } from '../../lib/twin-owner-equipment';
import { attachXt6OwnerIssueNodes } from '../../lib/twin-owner-issue-nodes';

const OWNER_TWIN_TREE_BUILDERS = {
  ...Object.fromEntries(REVIEWED_OWNER_EQUIPMENT.map(profile => [profile.catalogId, (data, catalog) =>
    buildModelOwnerTrees(catalog, data.records, data.miles, data.transmission, data.evaluatedAt)])),
  challenger(data, catalog) {
    const serviced = servicedFromRecords(data.records, data.miles, data.transmission, data.evaluatedAt);
    const liveTrees = buildTwinTrees(serviced, data.miles, data.transmission, data.evaluatedAt);
    return mergeCatalogEvidenceIntoOwnerTrees(catalog, liveTrees, data.miles, data.transmission);
  },
  camaro(data, catalog) {
    return buildModelOwnerTrees(catalog, data.records, data.miles, data.transmission, data.evaluatedAt);
  },
};

function sameIdentity(catalog, vehicle) {
  return sameTwinVehicleIdentity(catalog.identity, vehicle);
}

export function ownerInstalledParts(data, catalog) {
  const expectedFitmentKey = ownerEquipmentFitmentKey(catalog.id, data.transmission, data.vehicle);
  // New equipment-scoped owners cannot inherit installations from an unknown
  // or different configuration. Legacy two-model filtering stays unchanged.
  const equipmentScoped = REVIEWED_OWNER_EQUIPMENT.some(profile => profile.catalogId === catalog.id);
  return (data.installedParts || []).filter(part => (!equipmentScoped && part.nodeId !== "transFluid") || part.fitmentKey === expectedFitmentKey);
}

/** Final owner clocks shared by the Hub and server reminders. */
export function buildOwnerMaintenanceTrees(data) {
  const catalog = getTwinByFulfillmentId(data?.fulfillmentId);
  const builder = catalog && OWNER_TWIN_TREE_BUILDERS[catalog.treeResolver];
  if (!catalog?.ownerReady || !builder || !data?.vehicle || !sameIdentity(catalog, data.vehicle)) return null;
  if (!ownerEquipmentReady(data.vehicle)) return null;
  const trees = builder(data, catalog);
  if (catalog.id === 'xt6') attachXt6OwnerIssueNodes(trees, data.issues || []);
  applyOwnerMaintenanceIntervals(trees, data.records || [], { ...data.vehicle, transmission:data.transmission }, data.miles, data.evaluatedAt);
  const latestByNode = new Map();
  for (const part of ownerInstalledParts(data, catalog)) {
    if (part.kind !== 'known-issue-note' && !latestByNode.has(part.nodeId)) latestByNode.set(part.nodeId, part);
  }
  for (const tree of Object.values(trees)) {
    for (const [nodeId, node] of Object.entries(tree.nodes)) {
      const latest = latestByNode.get(nodeId);
      if (latest?.lifespanMiles && Number.isFinite(latest.installedAtMileage)) {
        node.serviceIntervalMiles = latest.lifespanMiles;
        node.riskAt = latest.lifespanMiles;
        node.servicedAt = latest.installedAtMileage;
        node.servicedDate = latest.installDate;
        node.dueMileage = latest.installedAtMileage + latest.lifespanMiles;
        node.unlogged = false;
        delete node.firstServiceDeadline;
        delete node.dueDate;
        delete node.overdueByDate;
        delete node.dueNote;
      }
    }
  }
  return trees;
}
