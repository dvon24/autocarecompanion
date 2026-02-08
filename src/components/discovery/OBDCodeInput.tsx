'use client';

import { useState, type KeyboardEvent } from 'react';
import { isValidOBDCode } from '@/schemas/obd.schema';
import { getOBDCodeDescription } from '@/lib/obdCodes';
import type { OBDCodeEntry } from '@/schemas/obd.schema';

/**
 * OBDCodeInput - OBD-II Code Entry Component
 *
 * Allows users to enter and validate OBD-II diagnostic codes.
 *
 * Follows Architecture patterns:
 * - Touch targets 44x44px minimum (NFR-A7)
 * - Discovery phase styling (calm, exploratory)
 * - Named exports only
 */

type OBDCodeInputProps = {
  codes: OBDCodeEntry[];
  onAddCode: (code: OBDCodeEntry) => void;
  onRemoveCode: (code: string) => void;
  onSkip?: () => void;
  onContinue?: () => void;
  disabled?: boolean;
};

export function OBDCodeInput({
  codes,
  onAddCode,
  onRemoveCode,
  onSkip,
  onContinue,
  disabled = false,
}: OBDCodeInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (value: string) => {
    // Only allow alphanumeric, auto-uppercase
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    setInputValue(cleaned.slice(0, 5));
    setError(null);
  };

  const handleAddCode = () => {
    if (!inputValue) return;

    // Validate format
    if (!isValidOBDCode(inputValue)) {
      setError('Invalid format. Use P, B, C, or U followed by 4 digits (e.g., P0300)');
      return;
    }

    // Check for duplicates
    if (codes.some((c) => c.code === inputValue)) {
      setError('This code has already been added');
      return;
    }

    // Get description and add
    const description = getOBDCodeDescription(inputValue);
    onAddCode({
      code: inputValue,
      description,
      addedAt: new Date().toISOString(),
    });

    setInputValue('');
    setError(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCode();
    }
  };

  const canAddCode = inputValue.length === 5 && !disabled;
  const hasCodes = codes.length > 0;

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          OBD-II Codes (Optional)
        </h3>
        <p className="text-sm text-gray-500">
          If you have a code reader, enter any trouble codes to improve diagnosis accuracy.
        </p>
      </div>

      {/* Input field */}
      <div>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., P0300"
            maxLength={5}
            disabled={disabled}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            className={`
              flex-1 min-h-[44px] py-3 px-4 rounded-lg border text-gray-900
              placeholder-gray-400 font-mono tracking-wider uppercase
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-colors
              ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
              ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          />
          <button
            type="button"
            onClick={handleAddCode}
            disabled={!canAddCode}
            className={`
              min-h-[44px] min-w-[44px] px-4 rounded-lg font-medium
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${canAddCode
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            Add
          </button>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-600 mt-1">{error}</p>
        )}

        {/* Format hint */}
        <p className="text-xs text-gray-400 mt-1">
          Format: P, B, C, or U + 4 digits (e.g., P0171, B1234)
        </p>
      </div>

      {/* Code list */}
      {hasCodes && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Added Codes ({codes.length})
          </p>
          <div className="space-y-2">
            {codes.map((entry) => (
              <OBDCodeItem
                key={entry.code}
                entry={entry}
                onRemove={() => onRemoveCode(entry.code)}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        {hasCodes ? (
          <button
            type="button"
            onClick={onContinue}
            disabled={disabled}
            className={`
              w-full min-h-[44px] py-3 px-6 rounded-lg font-semibold text-white
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${disabled
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-900 hover:bg-gray-800'
              }
            `}
          >
            Continue with {codes.length} Code{codes.length > 1 ? 's' : ''}
          </button>
        ) : (
          <button
            type="button"
            onClick={onSkip}
            disabled={disabled}
            className="w-full min-h-[44px] py-3 px-6 rounded-lg font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Skip - I don&apos;t have any codes
          </button>
        )}
      </div>
    </div>
  );
}

type OBDCodeItemProps = {
  entry: OBDCodeEntry;
  onRemove: () => void;
  disabled?: boolean;
};

function OBDCodeItem({ entry, onRemove, disabled }: OBDCodeItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      {/* Code badge */}
      <span className="flex-shrink-0 px-2 py-1 bg-blue-100 text-blue-800 font-mono font-semibold text-sm rounded">
        {entry.code}
      </span>

      {/* Description */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 leading-tight">
          {entry.description}
        </p>
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className={`
          flex-shrink-0 min-w-[32px] min-h-[32px] p-1.5 rounded-full
          text-gray-400 hover:text-red-600 hover:bg-red-50
          transition-colors focus:outline-none focus:ring-2 focus:ring-red-500
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        aria-label={`Remove ${entry.code}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
