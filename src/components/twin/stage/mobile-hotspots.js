/**
 * Mobile-only hotspot projection.
 *
 * Desktop coordinates are the reviewed catalog coordinates and must remain
 * untouched. The four generated/off-angle vehicles need a phone projection
 * that follows the visible wheel, hood, and radiator centers in their current
 * 16:9 artwork. Transmission remains available through the sidebar/tree, but
 * is deliberately not presented as a vehicle hotspot on a phone.
 */
export const MOBILE_TWIN_HOTSPOT_OVERRIDES = Object.freeze({
  challenger: Object.freeze({
    hood:[60,37], rad:[68,61],
  }),
  nautilus: Object.freeze({
    hood:[62,33], rad:[72,57],
  }),
  murano: Object.freeze({
    hood:[62,31], rad:[72,56],
  }),
  xt6: Object.freeze({
    hood:[62,32], rad:[72,57],
  }),
  kicks: Object.freeze({
    wheel:[44,71], rearwheel:[15,61], hood:[64,36], rad:[75,62],
  }),
  mdx: Object.freeze({
    wheel:[51,65], rearwheel:[19,60], hood:[63,36], rad:[74,62],
  }),
  aviator: Object.freeze({
    wheel:[52,63], rearwheel:[21,59], hood:[64,36], rad:[74,62],
  }),
  camaro: Object.freeze({
    wheel:[45,63], rearwheel:[19,53], hood:[66,34], rad:[68,61],
  }),
});

export function projectTwinHotspots(hotspots, { mobile = false, twinId = "" } = {}) {
  if (!Array.isArray(hotspots)) return [];
  if (!mobile) return hotspots;
  const overrides = MOBILE_TWIN_HOTSPOT_OVERRIDES[twinId] || {};
  return hotspots
    .filter((hotspot) => hotspot?.id !== "trans")
    .map((hotspot) => {
      const point = overrides[hotspot.id];
      return point ? { ...hotspot, x:point[0], y:point[1] } : hotspot;
    });
}
