'use client';

import { useState, useCallback } from 'react';
import { CarViewer, type WheelConfig, type SuspensionConfig } from './CarViewer';

interface WheelCustomizerProps {
  bodyType?: 'sedan' | 'coupe' | 'truck' | 'suv' | 'hatchback';
  initialColor?: string;
  onSave?: (config: { wheel: WheelConfig; suspension: SuspensionConfig; color: string }) => void;
}

const WHEEL_FINISHES = [
  { id: 'black', name: 'Gloss Black', color: '#1a1a1a' },
  { id: 'gunmetal', name: 'Gunmetal', color: '#4a4a4a' },
  { id: 'silver', name: 'Silver', color: '#c0c0c0' },
  { id: 'bronze', name: 'Bronze', color: '#cd7f32' },
  { id: 'gold', name: 'Gold', color: '#ffd700' },
  { id: 'chrome', name: 'Chrome', color: '#e8e8e8' },
];

const CAR_COLORS = [
  { id: 'black', name: 'Black', color: '#1a1a1a' },
  { id: 'white', name: 'White', color: '#f5f5f5' },
  { id: 'silver', name: 'Silver', color: '#a8a8a8' },
  { id: 'red', name: 'Red', color: '#cc0000' },
  { id: 'blue', name: 'Blue', color: '#0055cc' },
  { id: 'green', name: 'Racing Green', color: '#004d00' },
  { id: 'orange', name: 'Orange', color: '#ff6600' },
  { id: 'purple', name: 'Purple', color: '#6600cc' },
];

/**
 * Wheel Customizer Component
 *
 * Epic 5, Story 5.7: Modification Visualizer
 * Allows users to customize wheel size, offset, finish, and suspension.
 */
export function WheelCustomizer({
  bodyType = 'sedan',
  initialColor = '#1a1a1a',
  onSave,
}: WheelCustomizerProps) {
  const [carColor, setCarColor] = useState(initialColor);
  const [wheelConfig, setWheelConfig] = useState<WheelConfig>({
    diameter: 18,
    width: 8,
    offset: 35,
    style: 'sport',
    finish: '#4a4a4a',
  });
  const [suspensionConfig, setSuspensionConfig] = useState<SuspensionConfig>({
    drop: 0,
  });

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave({
        wheel: wheelConfig,
        suspension: suspensionConfig,
        color: carColor,
      });
    }
  }, [onSave, wheelConfig, suspensionConfig, carColor]);

  return (
    <div className="w-full">
      {/* 3D Viewer */}
      <CarViewer
        bodyType={bodyType}
        color={carColor}
        wheelConfig={wheelConfig}
        suspensionConfig={suspensionConfig}
        className="mb-6"
      />

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Car & Wheels */}
        <div className="space-y-6">
          {/* Car Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Car Color
            </label>
            <div className="flex flex-wrap gap-2">
              {CAR_COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCarColor(c.color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    carColor === c.color ? 'border-blue-500 scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Wheel Finish */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wheel Finish
            </label>
            <div className="flex flex-wrap gap-2">
              {WHEEL_FINISHES.map((f) => (
                <button
                  key={f.id}
                  onClick={() =>
                    setWheelConfig((prev) => ({ ...prev, finish: f.color }))
                  }
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    wheelConfig.finish === f.color
                      ? 'border-blue-500 scale-110'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: f.color }}
                  title={f.name}
                />
              ))}
            </div>
          </div>

          {/* Wheel Diameter */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                Wheel Diameter
              </label>
              <span className="text-sm font-bold text-gray-900">
                {wheelConfig.diameter}"
              </span>
            </div>
            <input
              type="range"
              min={16}
              max={22}
              value={wheelConfig.diameter}
              onChange={(e) =>
                setWheelConfig((prev) => ({
                  ...prev,
                  diameter: parseInt(e.target.value),
                }))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>16"</span>
              <span>22"</span>
            </div>
          </div>
        </div>

        {/* Right Column - Dimensions */}
        <div className="space-y-6">
          {/* Wheel Width */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                Wheel Width
              </label>
              <span className="text-sm font-bold text-gray-900">
                {wheelConfig.width}"
              </span>
            </div>
            <input
              type="range"
              min={7}
              max={12}
              step={0.5}
              value={wheelConfig.width}
              onChange={(e) =>
                setWheelConfig((prev) => ({
                  ...prev,
                  width: parseFloat(e.target.value),
                }))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>7"</span>
              <span>12"</span>
            </div>
          </div>

          {/* Wheel Offset */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                Wheel Offset
              </label>
              <span className="text-sm font-bold text-gray-900">
                {wheelConfig.offset > 0 ? '+' : ''}
                {wheelConfig.offset}mm
              </span>
            </div>
            <input
              type="range"
              min={-20}
              max={50}
              value={wheelConfig.offset}
              onChange={(e) =>
                setWheelConfig((prev) => ({
                  ...prev,
                  offset: parseInt(e.target.value),
                }))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>-20mm</span>
              <span>+50mm</span>
            </div>
          </div>

          {/* Suspension */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                Suspension
              </label>
              <span className="text-sm font-bold text-gray-900">
                {suspensionConfig.drop === 0
                  ? 'Stock'
                  : suspensionConfig.drop > 0
                  ? `Lowered ${suspensionConfig.drop}"`
                  : `Lifted ${Math.abs(suspensionConfig.drop)}"`}
              </span>
            </div>
            <input
              type="range"
              min={-3}
              max={3}
              step={0.5}
              value={suspensionConfig.drop}
              onChange={(e) =>
                setSuspensionConfig({ drop: parseFloat(e.target.value) })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Lifted 3"</span>
              <span>Stock</span>
              <span>Lowered 3"</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spec Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Current Specs</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Size:</span>{' '}
            <span className="font-medium">{wheelConfig.diameter}x{wheelConfig.width}</span>
          </div>
          <div>
            <span className="text-gray-500">Offset:</span>{' '}
            <span className="font-medium">{wheelConfig.offset > 0 ? '+' : ''}{wheelConfig.offset}mm</span>
          </div>
          <div>
            <span className="text-gray-500">Drop:</span>{' '}
            <span className="font-medium">
              {suspensionConfig.drop === 0
                ? 'Stock'
                : `${suspensionConfig.drop > 0 ? '-' : '+'}${Math.abs(suspensionConfig.drop)}"`}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Tire:</span>{' '}
            <span className="font-medium">
              {Math.round(225 + (wheelConfig.width - 8) * 10)}/{Math.round(45 - (wheelConfig.diameter - 18) * 2.5)}R{wheelConfig.diameter}
            </span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      {onSave && (
        <div className="mt-6">
          <button
            onClick={handleSave}
            className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Save Configuration
          </button>
        </div>
      )}
    </div>
  );
}
