const DEFAULT_STEP = 6000;

export function nextRoutineMileage(miles, interval, firstDeadline = interval) {
  if (!Number.isFinite(interval) || interval <= 0) return null;
  const current = Number.isFinite(miles) && miles >= 0 ? miles : 0;
  const first = Number.isFinite(firstDeadline) && firstDeadline > 0 ? firstDeadline : interval;
  if (current <= first) return first;
  return first + Math.ceil((current - first) / interval) * interval;
}

function categoryFor(id, node) {
  const type = `${node.maintenanceType || ""} ${id}`.toLowerCase();
  if (/brake|pad|rotor/.test(type)) return { id:"brakes", label:"Brakes", color:"#B42318", tint:"#FEF3F2" };
  if (/tire|wheel|rotation|tpms|lug/.test(type)) return { id:"wheels", label:"Tires & wheels", color:"#344054", tint:"#F2F4F7" };
  if (/wiper|washer|glass/.test(type)) return { id:"glass", label:"Glass & wipers", color:"#C45A00", tint:"#FFF7ED" };
  if (/trans|differential|transfer|gear|driveline/.test(type)) return { id:"driveline", label:"Transmission & driveline", color:"#6941C6", tint:"#F4F3FF" };
  if (/cool|radiator|antifreeze/.test(type)) return { id:"cooling", label:"Cooling", color:"#087E8B", tint:"#ECFDFF" };
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

export function buildTwinMaintenanceSchedule(trees, miles, columnCount = 5) {
  const car = trees?.car;
  const current = Number.isFinite(miles) && miles >= 0 ? miles : 0;
  if (!car?.nodes) return { columns:[], orderCount:0, step:DEFAULT_STEP };

  const entries = Object.entries(car.nodes).filter(([id, node]) => id !== car.root
    && (!node.group || node.maintenanceType)
    && node.maintenanceType
    && Number.isFinite(node.serviceIntervalMiles)
    && node.serviceIntervalMiles > 0);
  if (!entries.length) return { columns:[], orderCount:0, step:DEFAULT_STEP };

  const minimum = Math.min(...entries.map(([, node]) => node.serviceIntervalMiles));
  const step = Math.max(3000, Math.min(15000, Math.round(minimum / 1000) * 1000 || DEFAULT_STEP));
  const base = Math.floor(current / step) * step;
  const mileages = Array.from({ length:Math.max(3, columnCount) }, (_, index) => base + index * step);
  const end = mileages[mileages.length - 1];
  const orderable = new Set();

  const columns = mileages.map((mileage) => ({ mileage, groups:[] }));
  const scheduledActions = new Map();
  for (const [id, node] of entries) {
    const interval = node.serviceIntervalMiles;
    const unlogged = node.unlogged === true || node.servicedAt == null;
    const first = Number.isFinite(node.dueMileage) && node.dueMileage > 0 ? node.dueMileage : interval;
    let due = unlogged
      ? nextRoutineMileage(current, interval, first)
      : (Number.isFinite(node.dueMileage) ? node.dueMileage : node.servicedAt + interval);
    const actuallyOverdue = !unlogged && (node.overdueByDate === true || due < current);
    if (actuallyOverdue && due < base) due = base;
    while (due < base) due += interval;

    for (let occurrence = due; occurrence <= end; occurrence += interval) {
      const actionKey = `${node.maintenanceType}:${occurrence}`;
      const linked = purchaseKeys(id, node);
      for (const key of linked) orderable.add(key);
      const existing = scheduledActions.get(actionKey);
      if (existing) {
        existing.purchaseKeys = [...new Set([...existing.purchaseKeys, ...linked])];
        existing.purchaseCount = existing.purchaseKeys.length;
        existing.purchasable = existing.purchaseCount > 0;
        continue;
      }
      const index = Math.max(0, Math.min(columns.length - 1, Math.round((occurrence - base) / step)));
      const column = columns[index];
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
        price:priceFor(node),
        purchasable:linked.length > 0,
        purchaseKeys:linked,
        purchaseCount:linked.length,
        status:unlogged ? "never-logged" : actuallyOverdue && occurrence === base ? "overdue" : "scheduled",
      };
      group.items.push(item);
      scheduledActions.set(actionKey, item);
    }
  }

  return { columns, orderCount:orderable.size, step };
}
