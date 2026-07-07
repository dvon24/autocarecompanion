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
 * Provenance of a surfaced part's data / part number — HIGHEST TRUST FIRST.
 * Set server-side; drives the callout's trust badge and is the first question
 * when debugging a wrong-part report ("which path served it?").
 *   known_issue          — from a matched KnownIssue.fixParts (human/DB-verified,
 *                           curated against the actual failure). Top of the stack.
 *   ebay_verified        — PN agreed on by ≥3 DISTINCT live-eBay sellers.
 *   ebay_reported        — PN agreed on by ≥2 distinct sellers (softer tier).
 *   catalog              — PN corroborated by our own VehiclePartLookup catalog.
 *   model_search_fallback— model-emitted PN, not corroborated → search links only.
 */
export type PartSource = 'known_issue' | 'ebay_verified' | 'ebay_reported' | 'catalog' | 'model_search_fallback';

/**
 * A buyable part attached to a MATCHED known issue (KnownIssue.fixParts). This
 * is the curated, double-verified, already-affiliate-tagged fix — surfaced
 * ABOVE anything the model or eBay resolver re-derives from the image. A single
 * issue's fixParts is the natural "repair kit" (hose + clamps + coolant).
 */
export interface IssuePart {
  name: string;
  oemPartNumber?: string;
  priceLow?: number;
  priceHigh?: number;
  note?: string;
  /** Vendor buy links stored on the issue — already affiliate-tagged. */
  buyLinks: Array<{ vendor: string; url: string }>;
  source: 'known_issue';
}

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
  /** Approximate location of the part IN the photo as percentages of
   *  image width/height (0-100, origin top-left). Drives the annotated
   *  detection pins drawn on the user's photo. Absent for parts not
   *  visible in the frame. */
  box?: { x: number; y: number; w: number; h: number };
  /** Condition the model read for THIS part — drives the pin color and
   *  the callout's status line. ok=healthy, warn=worn/aging,
   *  critical=failed/unsafe, info=identified only. */
  condition?: 'ok' | 'warn' | 'critical' | 'info';
  /** Short condition phrase for the callout, e.g. 'Pads healthy · no
   *  fluid weeping' or '~4/32" tread — plan ahead'. */
  finding?: string;
  /** True when oemPartNumbers[0] was CORROBORATED by ≥2 agreeing live eBay
   *  listings (the fabrication gate), not just emitted by the model. Drives a
   *  "verified" tick in the callout. */
  partNumberVerified?: boolean;
  /** Live eBay listings for real buy links (affiliate-tagged via EPN when
   *  configured). Present only when the eBay resolver ran for this part. */
  ebayListings?: Array<{ title: string; price: number | null; currency: string; condition: string; url: string }>;
  /** Provenance of this part's data / PN (see PartSource). Set server-side. */
  source?: PartSource;
}

// ─── Vehicle-match verdict ─────────────────────────────────────────

export type VehicleMatch = 'confident' | 'uncertain' | 'likely_mismatch';

// ─── Top-level response shape ─────────────────────────────────────

export interface VisionResultV2 {
  schemaVersion: 2;
  /** Which input flavor produced this response. */
  mode?: 'photo' | 'video';
  /** Whisper-1 transcript of the audio track when mode==='video' and
   *  audio was extracted. Empty string / undefined otherwise. */
  transcript?: string;
  /** Number of frames analyzed when mode==='video'. */
  framesAnalyzed?: number;
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
