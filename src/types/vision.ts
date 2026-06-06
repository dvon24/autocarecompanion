/**
 * Shared types for the /api/vision response shape and the
 * VisionResultCard renderer. Used by both server (route.ts +
 * vendor-resolver.ts) and client (VisionResultCard.tsx) — preventing
 * drift between what the resolver emits and what the renderer expects.
 *
 * SchemaVersion strategy: the route returns BOTH the new v2 shape
 * (identifiedParts + per-part vendorLinks + schemaVersion:2) AND the
 * legacy v1 shape (primaryPart + kitItems + consumables + amazonUrl)
 * via a deterministic server-side projection. Clients pinned to v1
 * (older mobile builds, conversation-history replays of saved
 * results) continue to render unchanged; the new card opts in by
 * checking `schemaVersion === 2`.
 */

// ─── Vendor primitives ─────────────────────────────────────────────

export type VendorKey =
  | 'amazon'
  | 'rockauto'
  | 'tire_rack'
  | 'autozone'
  | 'napa_online'
  | 'mopar_parts_giant'
  | 'gm_parts_giant'
  | 'oreilly'
  | 'advance_auto'
  | 'ebay_motors'
  | 'american_muscle'
  | 'summit_racing';

export interface VendorLink {
  vendor: VendorKey;
  displayName: string;
  /** Affiliate / search / part-number URL. Server-built, never trusted
   *  from the AI model. */
  url: string;
  /** What we asked the vendor for — kept for debugging + UX tooltip. */
  searchQuery: string;
  /** 'deep' = direct PDP URL (future, when we have part numbers that
   *  resolve to /parts/{part_number} on Mopar/GM Parts Giant).
   *  'search' = SERP fallback (most common today). */
  linkType: 'search' | 'deep';
  /** 1 = primary CTA (full-width orange button), 2+ = secondary buttons
   *  in the 2-col grid below. */
  priority: number;
  /** Optional explanation of why this vendor surfaced for this part. */
  rationale?: string;
}

// ─── Part primitives ───────────────────────────────────────────────

export type PartRole = 'primary' | 'consumable' | 'fastener' | 'related';

/**
 * Part category enum used by the vendor resolver to intersect with
 * each vendor's `bestForCategories` list. The AI model populates this
 * field; the resolver does the vendor selection. Keeps the model out
 * of the vendor-routing business.
 */
export type PartCategory =
  | 'rotor'
  | 'brake_pad'
  | 'caliper'
  | 'tire'
  | 'wheel'
  | 'lug_nut'
  | 'tpms'
  | 'filter'
  | 'fluid'
  | 'wiper'
  | 'bulb'
  | 'battery'
  | 'spark_plug'
  | 'sensor'
  | 'belt'
  | 'hose'
  | 'suspension'
  | 'ignition'
  | 'fuel_pump'
  | 'alternator'
  | 'starter'
  | 'body_panel'
  | 'trim'
  | 'badge'
  | 'emblem'
  | 'bracket'
  | 'interior'
  | 'accessory'
  | 'tool'
  | 'oem_specific'
  | 'other';

export interface IdentifiedPart {
  /** Stable client-side key (server-generated, e.g. 'p_a3b4c5d6'). */
  id: string;
  /** Drives UI prominence. A single wheel photo can yield multiple
   *  role:'primary' parts (rotor + pads + caliper + tire + wheel) —
   *  that's the multi-part fix. Fasteners/consumables render as
   *  condensed rows. */
  role: PartRole;
  /** Drives vendor selection on the server. */
  category: PartCategory;
  /** Specific, identifiable name e.g. "Front brake rotor (vented, 360mm)". */
  name: string;
  /** Spec line e.g. "vented, 360mm × 32mm, 5-lug, fits Brembo 6-piston". */
  spec?: string;
  /** Spatial qualifier when relevant: 'front-left', 'rear-right',
   *  'driver-side', 'passenger-side', 'both'. */
  position?: string;
  /** Per-part confidence 0..1. Used to dim/hide low-confidence parts. */
  confidence: number;
  /** True for parts visibly in the photo. False for parts the model
   *  recommends as needed for the job but that aren't shown (brake
   *  fluid, anti-seize). UI groups visible vs recommended separately. */
  visibleInPhoto: boolean;
  /** Brand if known (e.g. "Brembo", "OEM Mopar"). */
  brand?: string;
  /** OEM part numbers — FIRST-CLASS array. Plural because: left vs
   *  right rotors have different numbers, kits are 2-piece, numbers
   *  get superseded over time. UI surfaces these prominently with
   *  copy-to-clipboard — every parts counter asks for OEM first. */
  oemPartNumbers: string[];
  /** Aftermarket cross-references. Separate so OEM stays visually
   *  dominant (display "OEM: 68249841AA" boldly, then a smaller
   *  "Cross: Brembo 09.C394.11 · EBC RK7677"). */
  aftermarketPartNumbers?: Array<{ brand: string; partNumber: string }>;
  /** Server-resolved vendor links. Ordered by priority. */
  vendorLinks: VendorLink[];
  /** Optional model-estimated price hint (not authoritative, for UX
   *  prefetch only). Pro tier "Find best deals" replaces with live
   *  prices in a future iteration. */
  estimatedPriceUsd?: { low: number; high: number };
  /** Free-form helper text e.g. "Replace as axle pair — never one
   *  side only". */
  notes?: string;
}

// ─── Vehicle-match verdict ─────────────────────────────────────────

export type VehicleMatch = 'confident' | 'uncertain' | 'likely_mismatch';

// ─── Top-level response shape ─────────────────────────────────────

export interface VisionResultV2 {
  schemaVersion: 2;
  summary: string;
  /** Overall confidence, weighted across parts. */
  confidence: number;
  isCarRelated: boolean;
  vehicleMatch: VehicleMatch;
  vehicleMatchNote: string;
  /** Flat array of every buyable part the model identified. Each one
   *  is independently card-worthy. Order = importance (role='primary'
   *  first, then by confidence). */
  identifiedParts: IdentifiedPart[];
  /** Hero pointer to the most likely "this is what you came for" part.
   *  References an id present in identifiedParts. Null when
   *  isCarRelated=false or vehicleMatch='likely_mismatch'. */
  primaryPartId: string | null;
  toolsNeeded: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTimeMinutes: number | null;
  warnings: string[];
  relatedIssues: VisionRelatedIssue[];

  // ─── Backward-compat shims (server-populated via legacy projection) ───
  /** @deprecated Use identifiedParts[primaryPartId]. Populated server-
   *  side from the new shape so VisionResultCard v1 keeps rendering. */
  primaryPart: LegacyVisionItem | null;
  /** @deprecated Use identifiedParts.filter(p => p.role === 'fastener'). */
  kitItems: LegacyVisionItem[];
  /** @deprecated Use identifiedParts.filter(p => p.role === 'consumable'). */
  consumables: LegacyVisionItem[];

  quotaRemaining?: number;
  quotaResetAt?: string;
  imagePreviewUrl?: string;
}

export interface VisionRelatedIssue {
  id: string;
  title: string;
  severity: string;
}

/**
 * Legacy single-vendor part shape kept for v1 renderers and saved
 * conversation history. Deprecated — new code reads IdentifiedPart.
 */
export interface LegacyVisionItem {
  name: string;
  spec: string;
  brand: string;
  partNumber: string;
  amazonUrl: string | null;
}

/**
 * Public alias used by the renderer. Anything that imports VisionResult
 * gets both v1 and v2 fields available (v2 just adds identifiedParts
 * + schemaVersion + vendorLinks-on-parts), so existing destructuring
 * code keeps compiling. The renderer fans out on schemaVersion.
 */
export type VisionResult = VisionResultV2;
