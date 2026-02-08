/**
 * Design Tokens for Two-Phase Design Language
 *
 * Discovery Phase: Calm, exploratory, low-stress colors for vehicle selection and symptom input
 * Execution Phase: High-contrast AAA (7:1) for garage conditions with dirty hands and low light
 *
 * These TypeScript definitions provide type safety when referencing design tokens.
 * The actual CSS custom properties are defined in globals.css.
 */

// Phase type for the Two-Phase Design Language
export type Phase = 'discovery' | 'execution';

// Discovery Phase Colors - Calming blues and soft grays
export const DISCOVERY_COLORS = {
  primary: '#3B82F6',      // Blue-500
  secondary: '#60A5FA',    // Blue-400
  background: '#EBF4FF',   // Blue-50
  text: '#1E3A5F',         // Dark blue-gray
  muted: '#475569',        // Slate-600 - darker for better mobile contrast
} as const;

// Execution Phase Colors - High-contrast AAA (7:1 ratio)
export const EXECUTION_COLORS = {
  primary: '#FFFFFF',      // White on black
  secondary: '#E5E7EB',    // Gray-200
  background: '#000000',   // Black
  text: '#FFFFFF',         // White
  warning: '#FCD34D',      // Amber-300 for visibility
  safety: '#EF4444',       // Red-500 for critical warnings
} as const;

// Shared semantic tokens
export const SEMANTIC_COLORS = {
  success: '#22C55E',      // Green-500
  error: '#EF4444',        // Red-500
  warning: '#F59E0B',      // Amber-500
  info: '#3B82F6',         // Blue-500
} as const;

// Typography scale (NFR compliance)
export const TYPOGRAPHY = {
  body: '1rem',            // 16px - NFR-A3
  guideStep: '1.125rem',   // 18px minimum - NFR-A8
  safety: '1.25rem',       // 20px bold - Safety callouts
  heading: '1.5rem',       // 24px
  lineHeightRelaxed: 1.625, // Discovery phase
  lineHeightTight: 1.375,   // Execution phase - more steps visible
} as const;

// Touch target size (NFR-A7)
export const TOUCH_TARGET_SIZE = '44px';

// CSS class names for phase-specific styling
export const PHASE_CLASSES = {
  discovery: {
    background: 'bg-discovery-background',
    text: 'text-discovery-text',
    primary: 'bg-discovery-primary',
    muted: 'text-discovery-muted',
  },
  execution: {
    background: 'bg-execution-background',
    text: 'text-execution-text',
    primary: 'bg-execution-primary',
    warning: 'text-execution-warning',
    safety: 'text-execution-safety',
  },
} as const;

// Type for phase-specific color keys
export type DiscoveryColorKey = keyof typeof DISCOVERY_COLORS;
export type ExecutionColorKey = keyof typeof EXECUTION_COLORS;
export type SemanticColorKey = keyof typeof SEMANTIC_COLORS;
