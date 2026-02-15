'use client';

import { useVinDecode } from '@/hooks/useVinDecode';
import { triggerHaptic } from '@/hooks/useHaptic';

/**
 * VINInput - VIN Entry and Decode Component
 *
 * Provides a 17-character VIN input with validation and NHTSA decode.
 *
 * Follows Architecture patterns:
 * - Headless UI patterns for accessibility
 * - Touch targets 44x44px minimum (NFR-A7)
 * - Discovery phase styling (calm, exploratory)
 * - Named exports only
 */

type VINInputProps = {
  onComplete?: () => void;
  onSwitchToManual?: () => void;
};

export function VINInput({ onComplete, onSwitchToManual }: VINInputProps) {
  const {
    vin,
    setVin,
    validationError,
    isValidVin,
    status,
    decodedVehicle,
    decodeError,
    decodeVin,
    confirmVehicle,
    reset,
    needsTrimSelection,
    selectTrim,
  } = useVinDecode();

  const isDecoding = status === 'decoding';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidVin && !isDecoding) {
      await decodeVin();
    }
  };

  const handleConfirm = () => {
    triggerHaptic('success');
    confirmVehicle();
    onComplete?.();
  };

  const handleTryAgain = () => {
    triggerHaptic('light');
    reset();
  };

  // Success state with decoded vehicle
  if (isSuccess && decodedVehicle && !needsTrimSelection) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="space-y-4">
          {/* Success message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-green-800">VIN Decoded Successfully</span>
            </div>
            <p className="text-lg text-green-900">
              {decodedVehicle.year} {decodedVehicle.make} {decodedVehicle.model}
              {decodedVehicle.trim && ` ${decodedVehicle.trim}`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full min-h-[44px] py-3 px-6 rounded-lg font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Continue with This Vehicle
            </button>
            <button
              type="button"
              onClick={handleTryAgain}
              className="w-full min-h-[44px] py-3 px-6 rounded-lg font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Enter Different VIN
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Need trim selection (VIN decoded but trim is ambiguous)
  if (needsTrimSelection && decodedVehicle) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="font-medium text-blue-900 mb-1">Vehicle Found</p>
            <p className="text-blue-800">
              {decodedVehicle.year} {decodedVehicle.make} {decodedVehicle.model}
            </p>
            <p className="text-sm text-blue-600 mt-2">
              Please select your trim level to continue.
            </p>
          </div>

          {/* Trim input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trim Level
            </label>
            <input
              type="text"
              placeholder="e.g., EX, Sport, Limited"
              className="w-full min-h-[44px] py-3 px-4 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => selectTrim(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="words"
              spellCheck={false}
              data-form-type="other"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full min-h-[44px] py-3 px-6 rounded-lg font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={onSwitchToManual}
              className="w-full min-h-[44px] py-3 px-6 rounded-lg font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Use Manual Selection Instead
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* VIN Input */}
        <div>
          <label htmlFor="vin-input" className="block text-sm font-medium text-gray-700 mb-1">
            Vehicle Identification Number (VIN)
          </label>
          <input
            id="vin-input"
            type="text"
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            placeholder="Enter 17-character VIN"
            maxLength={17}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck={false}
            data-form-type="other"
            disabled={isDecoding}
            className={`
              w-full min-h-[44px] py-3 px-4 rounded-lg border text-gray-900
              placeholder-gray-400 font-mono tracking-wider uppercase
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-colors
              ${validationError ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
              ${isDecoding ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          />

          {/* Character count */}
          <div className="flex justify-between items-center mt-1">
            <div className="min-h-[20px]">
              {validationError && (
                <p className="text-sm text-red-600">{validationError}</p>
              )}
              {isError && decodeError && (
                <p className="text-sm text-red-600">{decodeError}</p>
              )}
            </div>
            <p className={`text-sm ${vin.length === 17 ? 'text-green-600' : 'text-gray-400'}`}>
              {vin.length}/17
            </p>
          </div>
        </div>

        {/* Where to find VIN */}
        <details className="text-sm text-gray-500">
          <summary className="cursor-pointer hover:text-gray-700 transition-colors">
            Where can I find my VIN?
          </summary>
          <div className="mt-2 pl-4 space-y-1 text-gray-600">
            <p>• Driver's side dashboard (visible through windshield)</p>
            <p>• Driver's door jamb sticker</p>
            <p>• Vehicle registration or insurance card</p>
            <p>• Title documents</p>
          </div>
        </details>

        {/* Submit button */}
        <button
          type="submit"
          disabled={!isValidVin || isDecoding}
          className={`
            w-full min-h-[44px] py-3 px-6 rounded-lg font-semibold text-white
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${isValidVin && !isDecoding
              ? 'bg-gray-900 hover:bg-gray-800 cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isDecoding ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner />
              Decoding VIN...
            </span>
          ) : (
            'Decode VIN'
          )}
        </button>

        {/* Switch to manual */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onSwitchToManual}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Or select vehicle manually
          </button>
        </div>
      </form>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
