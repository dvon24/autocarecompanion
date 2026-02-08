'use client';

import { usePhase } from '@/contexts/PhaseContext';
import {
  DISCOVERY_COLORS,
  EXECUTION_COLORS,
  SEMANTIC_COLORS,
  TYPOGRAPHY,
  TOUCH_TARGET_SIZE,
} from '@/lib/design-tokens';

/**
 * Design System Demo Component
 *
 * Demonstrates the Two-Phase Design Language with:
 * - Discovery phase: Calming blues and soft grays
 * - Execution phase: High-contrast AAA for garage conditions
 *
 * This component is for verification during development.
 */

export function DesignSystemDemo() {
  const { phase, togglePhase, isDiscovery, isExecution } = usePhase();

  return (
    <div className="min-h-screen p-8">
      {/* Phase Toggle */}
      <div className="mb-8 text-center">
        <h1 className="text-heading mb-4">Au7o Design System</h1>
        <p className="text-body mb-4">
          Current Phase: <strong>{phase}</strong>
        </p>
        <button
          onClick={togglePhase}
          className="touch-target rounded-lg bg-discovery-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-discovery-secondary"
        >
          Toggle to {isDiscovery ? 'Execution' : 'Discovery'} Phase
        </button>
      </div>

      {/* Phase Demos Side by Side */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Discovery Phase Demo */}
        <div className={`rounded-xl p-6 ${isDiscovery ? 'ring-4 ring-discovery-primary' : ''} phase-discovery`}>
          <h2 className="text-heading mb-4">Discovery Phase</h2>
          <p className="text-body mb-4">
            Calm, exploratory UI for vehicle selection and symptom input. Uses calming blues and soft grays.
          </p>

          <div className="space-y-4">
            {/* Color Swatches */}
            <div className="flex flex-wrap gap-2">
              <div className="h-12 w-12 rounded-lg bg-discovery-primary" title="Primary" />
              <div className="h-12 w-12 rounded-lg bg-discovery-secondary" title="Secondary" />
              <div className="h-12 w-12 rounded-lg border border-discovery-muted bg-discovery-background" title="Background" />
            </div>

            {/* Typography */}
            <div className="space-y-2">
              <p className="text-body">Body text (16px) - NFR-A3 compliant</p>
              <p className="text-discovery-muted">Muted text for secondary information</p>
            </div>

            {/* Touch Target Demo */}
            <div>
              <button className="touch-target rounded-lg bg-discovery-primary px-4 text-white">
                Touch Target (44×44px)
              </button>
            </div>
          </div>
        </div>

        {/* Execution Phase Demo */}
        <div className={`rounded-xl p-6 ${isExecution ? 'ring-4 ring-execution-warning' : ''} phase-execution`}>
          <h2 className="text-heading mb-4">Execution Phase</h2>
          <p className="text-body mb-4">
            High-contrast AAA (7:1) for garage conditions with dirty hands and low light.
          </p>

          <div className="space-y-4">
            {/* Color Swatches */}
            <div className="flex flex-wrap gap-2">
              <div className="h-12 w-12 rounded-lg bg-execution-primary" title="Primary (White)" />
              <div className="h-12 w-12 rounded-lg bg-execution-secondary" title="Secondary" />
              <div className="h-12 w-12 rounded-lg bg-execution-warning" title="Warning" />
              <div className="h-12 w-12 rounded-lg bg-execution-safety" title="Safety" />
            </div>

            {/* Typography */}
            <div className="space-y-2">
              <p className="text-guide-step">Guide step text (18px) - NFR-A8 compliant</p>
              <p className="text-safety text-execution-safety">
                ⚠️ Safety Warning (20px bold)
              </p>
            </div>

            {/* Touch Target Demo */}
            <div>
              <button className="touch-target rounded-lg bg-execution-warning px-4 text-black">
                Touch Target (44×44px)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* NFR Compliance Summary */}
      <div className="mt-8 rounded-xl bg-gray-100 p-6">
        <h2 className="text-heading mb-4">NFR Compliance</h2>
        <ul className="text-body space-y-2">
          <li>✅ NFR-A2: AAA contrast (7:1) for safety callouts in Execution phase</li>
          <li>✅ NFR-A3: AA contrast (4.5:1) for body text (16px)</li>
          <li>✅ NFR-A7: Touch targets ≥44×44px for glove-friendly interaction</li>
          <li>✅ NFR-A8: Guide step text ≥18px for readability</li>
        </ul>
      </div>

      {/* Design Token Values (TypeScript Constants) */}
      <div className="mt-8 rounded-xl bg-gray-100 p-6">
        <h2 className="text-heading mb-4">Design Token Values</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <h3 className="font-semibold mb-2">Discovery Colors</h3>
            <ul className="text-sm space-y-1">
              <li>Primary: <code className="bg-gray-200 px-1 rounded">{DISCOVERY_COLORS.primary}</code></li>
              <li>Background: <code className="bg-gray-200 px-1 rounded">{DISCOVERY_COLORS.background}</code></li>
              <li>Text: <code className="bg-gray-200 px-1 rounded">{DISCOVERY_COLORS.text}</code></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Execution Colors</h3>
            <ul className="text-sm space-y-1">
              <li>Primary: <code className="bg-gray-200 px-1 rounded">{EXECUTION_COLORS.primary}</code></li>
              <li>Warning: <code className="bg-gray-200 px-1 rounded">{EXECUTION_COLORS.warning}</code></li>
              <li>Safety: <code className="bg-gray-200 px-1 rounded">{EXECUTION_COLORS.safety}</code></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Typography</h3>
            <ul className="text-sm space-y-1">
              <li>Body: <code className="bg-gray-200 px-1 rounded">{TYPOGRAPHY.body}</code></li>
              <li>Guide Step: <code className="bg-gray-200 px-1 rounded">{TYPOGRAPHY.guideStep}</code></li>
              <li>Touch Target: <code className="bg-gray-200 px-1 rounded">{TOUCH_TARGET_SIZE}</code></li>
            </ul>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Semantic colors available: success ({SEMANTIC_COLORS.success}), error ({SEMANTIC_COLORS.error}),
          warning ({SEMANTIC_COLORS.warning}), info ({SEMANTIC_COLORS.info})
        </p>
      </div>
    </div>
  );
}
