const DEFAULT_STEP = 6000;

export function nextRoutineMileage(miles, interval, firstDeadline = interval) {
  if (!Number.isFinite(interval) || interval <= 0) return null;
  const current = Number.isFinite(miles) && miles >= 0 ? miles : 0;
  const first = Number.isFinite(firstDeadline) && firstDeadline > 0 ? firstDeadline : interval;
  if (current <= first) return first;
  return first + Math.ceil((current - first) / interval) * interval;
}

export function categoryFor(id, node) {
  const type = `${node.maintenanceType || ""} ${id}`.toLowerCase();
  if (/brake|pad|rotor/.test(type)) return { id:"brakes", label:"Brakes", color:"#B42318", tint:"#FEF3F2" };
  if (/tire|wheel|rotation|tpms|(?:^|[\s_])lug(?:_nuts?)?(?:$|[\s_])/.test(type)) return { id:"wheels", label:"Tires & wheels", color:"#344054", tint:"#F2F4F7" };
  if (/wiper|washer|glass|cabin_filter/.test(type)) return { id:"glass", label:"Interior", color:"#C45A00", tint:"#FFF7ED" };
  if (/steering|suspension|chassis/.test(type)) return { id:"chassis", label:"Chassis & steering", color:"#344054", tint:"#F2F4F7" };
  if (/trans|differential|transfer|gear|driveline|driveshaft|halfshaft|rear_axle|awd_clutch/.test(type)) return { id:"driveline", label:"Transmission & driveline", color:"#6941C6", tint:"#F4F3FF" };
  if (/cool|radiator|antifreeze/.test(type)) return { id:"cooling", label:"Cooling", color:"#087E8B", tint:"#ECFDFF" };
  if (/key_battery/.test(type)) return { id:"keys", label:"Keys & access", color:"#6941C6", tint:"#F4F3FF" };
  return { id:"engine", label:"Engine", color:"#175CD3", tint:"#EFF8FF" };
}

function priceFor(node) {
  const direct = String(node.price || "").trim();
  if (direct && direct !== "—") return direct;
  const product = Array.isArray(node.products) ? node.products.find((item) => item?.price) : null;
  return product?.price || null;
}

function purchaseKeys(id, node) {
  const keys = [];
  if (node.buyUrl) keys.push(`${id}:primary:${node.buyUrl}`);
  if (Array.isArray(node.products)) {
    for (const [index, product] of node.products.entries()) {
      if (product?.buyUrl) keys.push(`${id}:product:${product.partNo || product.buyUrl || index}`);
    }
  }
  return keys;
}

function needsReplacementProduct(node) {
  return node.serviceAction !== 'inspect' && node.serviceAction !== 'rotate'
    && !/rotation|inspection/.test(node.maintenanceType || '');
}

export function buildTwinMaintenanceSchedule(trees, miles, columnCount = 5) {
  const car = trees?.car;
  const current = Number.isFinite(miles) && miles >= 0 ? miles : 0;
  if (!car?.nodes) return { columns:[], requirements:[], nextService:[], orderCount:0, step:DEFAULT_STEP };

  const requirementsByType = new Map();
  for (const [id,node] of Object.entries(car.nodes)) {
    // Secondary system views open the same full job; the schedule retains its
    // canonical node destination and must never duplicate that job.
    if (node.maintenanceType && node.canonicalRequirementId && node.canonicalRequirementId !== id) continue;
    if (!node.maintenanceType && !node.manualRequirement) continue;
    if (!node.manualRequirement && !node.serviceTiming && !(node.serviceIntervalMonths > 0) && !(node.serviceFirstIntervalMonths > 0)) continue;
    if (!node.manualRequirement && !(node.serviceIntervalMonths > 0) && !(node.serviceFirstIntervalMonths > 0)
      && node.serviceIntervalMiles > 0 && !['monitor','minder','equipment'].includes(node.serviceTiming)) continue;
    const key = node.maintenanceType || id;
    if (requirementsByType.has(key)) continue;
    const recorded = node.unlogged !== true && node.servicedAt != null;
    requirementsByType.set(key, {
      id,label:node.serviceLabel || node.label,image:node.img || null,
      timing:node.serviceTiming || (node.serviceIntervalMonths > 0 ? 'calendar' : 'condition'),
      action:node.serviceAction || 'service',guidance:node.serviceGuidance || node.life || 'Follow the cited service procedure.',
      severeGuidance:node.serviceSevereGuidance,equipmentGuidance:node.serviceEquipmentGuidance,
      dueDate:recorded ? node.dueDate || null : null,dueMileage:recorded ? node.dueMileage ?? null : null,
      status:node.manualRequirement && node.serviceLogHold ? 'coverage-hold' : !recorded ? 'never-logged' : node.overdueByDate || (typeof node.dueMileage === 'number' && node.dueMileage < current) ? 'overdue' : 'recorded',
      logHold:node.serviceLogHold || null,sourceUrl:node.serviceSourceUrl,sourceLabel:node.serviceSourceLabel,
    });
  }
  const priority = item => item.logHold ? 3 : ['monitor','minder','equipment'].includes(item.timing) ? 0 : item.timing === 'condition' ? 2 : 1;
  const requirements = [...requirementsByType.values()].sort((a,b)=>priority(a)-priority(b));

  const entries = Object.entries(car.nodes).filter(([id, node]) => id !== car.root
    && (!node.canonicalRequirementId || node.canonicalRequirementId === id)
    && (!node.group || node.maintenanceType)
    && node.maintenanceType
    && !['monitor','minder','equipment'].includes(node.serviceTiming)
    && Number.isFinite(node.serviceIntervalMiles)
    && node.serviceIntervalMiles > 0);
  // Only jobs with no exact mileage belong in the non-mileage lane. A fixed
  // job's date/condition remains on its mileage card and complete detail.
  const fixedTypes = new Set(entries.map(([,node])=>node.maintenanceType));
  const nextService = requirements.filter(item=>!fixedTypes.has(car.nodes[item.id].maintenanceType));
  if (!entries.length) return { columns:[], requirements, nextService, orderCount:0, step:DEFAULT_STEP };

  const step = Math.min(...entries.map(([, node]) => node.serviceIntervalMiles));
  const count = Number.isFinite(columnCount) ? Math.max(3, Math.min(24, Math.floor(columnCount))) : 5;
  const columnsByMileage = new Map();
  const scheduledActions = new Map();
  for (const [id, node] of entries) {
    const interval = node.serviceIntervalMiles;
    const unlogged = node.unlogged === true || node.servicedAt == null;
    const first = Number.isFinite(node.dueMileage) && node.dueMileage > 0 ? node.dueMileage : node.serviceFirstIntervalMiles || interval;
    const due = unlogged
      ? nextRoutineMileage(current, interval, first)
      : (Number.isFinite(node.dueMileage) ? node.dueMileage : node.servicedAt + interval);
    if (!Number.isFinite(due) || due < 0) continue;
    const actuallyOverdue = !unlogged && (node.overdueByDate === true || due < current);

    // Keep one outstanding recorded deadline, not every missed historical cycle.
    const occurrences = [due];
    let next = due < current ? due + Math.max(1, Math.ceil((current - due) / interval)) * interval : due + interval;
    while (occurrences.length < count && Number.isFinite(next) && next > occurrences[occurrences.length - 1]) {
      occurrences.push(next);
      next += interval;
    }

    for (const occurrence of occurrences) {
      const actionKey = `${node.maintenanceType}:${occurrence}`;
      const linked = needsReplacementProduct(node) ? purchaseKeys(id, node) : [];
      const existing = scheduledActions.get(actionKey);
      if (existing) {
        existing.purchaseKeys = [...new Set([...existing.purchaseKeys, ...linked])];
        existing.purchaseCount = existing.purchaseKeys.length;
        existing.purchasable = existing.purchaseCount > 0;
        continue;
      }
      let column = columnsByMileage.get(occurrence);
      if (!column) {
        column = { mileage:occurrence, groups:[] };
        columnsByMileage.set(occurrence, column);
      }
      const category = categoryFor(id, node);
      let group = column.groups.find((item) => item.id === category.id);
      if (!group) {
        group = { ...category, items:[] };
        column.groups.push(group);
      }
      const item = {
        id,
        label:node.serviceLabel || node.label,
        image:node.img || null,
        interval,
        dueMileage:occurrence,
        dueDate:occurrence === due ? node.dueDate || null : null,
        calendarMonths:unlogged && occurrence===(node.serviceFirstIntervalMiles || interval)
          ? node.serviceFirstIntervalMonths || node.serviceIntervalMonths || null
          : node.serviceIntervalMonths || null,
        price:needsReplacementProduct(node) ? priceFor(node) : null,
        purchasable:linked.length > 0,
        purchaseKeys:linked,
        purchaseCount:linked.length,
        status:unlogged ? "never-logged" : actuallyOverdue && occurrence === due ? "overdue" : "scheduled",
      };
      group.items.push(item);
      scheduledActions.set(actionKey, item);
    }
  }

  const orderedColumns = [...columnsByMileage.values()].sort((a,b)=>a.mileage-b.mileage);
  // The display window may limit projections, never real outstanding work.
  // Each past column contains one saved deadline per canonical job, not a
  // fabricated list of every missed cycle. Keep a next stop available too.
  const outstanding = orderedColumns.filter(column=>column.mileage < current
    || column.groups.some(group=>group.items.some(item=>item.status==='overdue' || item.dueDate)));
  const prospective = orderedColumns.filter(column=>!outstanding.includes(column));
  const columns = [...outstanding, ...prospective.slice(0, Math.max(1, count-outstanding.length))].sort((a,b)=>a.mileage-b.mileage);
  const orderable = new Set(columns.flatMap(column=>column.groups.flatMap(group=>group.items.flatMap(item=>item.purchaseKeys))));
  return { columns, requirements, nextService, orderCount:orderable.size, step };
}
