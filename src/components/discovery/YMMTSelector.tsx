'use client';

import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { useVehicle } from '@/hooks/useVehicle';

/**
 * YMMTSelector - Vehicle Selection via Cascading Dropdowns
 *
 * Year/Make/Model/Trim cascading selector using Headless UI for accessibility.
 *
 * Follows Architecture patterns:
 * - Headless UI Listbox for accessible dropdowns (NFR-A4, NFR-A5)
 * - Touch targets 44x44px minimum (NFR-A7)
 * - Discovery phase styling (calm, exploratory)
 * - Named exports only
 */

type Variant = 'light' | 'dark';

type DropdownProps<T> = {
  label: string;
  value: T | null;
  options: T[];
  onChange: (value: T | null) => void;
  disabled?: boolean;
  placeholder?: string;
  displayValue?: (value: T) => string;
  variant?: Variant;
};

function Dropdown<T extends string | number>({
  label,
  value,
  options,
  onChange,
  disabled = false,
  placeholder = 'Select...',
  displayValue = (v) => String(v),
  variant = 'light',
}: DropdownProps<T>) {
  const isLight = variant === 'light';

  return (
    <div className="w-full">
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <Listbox.Label className={`block text-sm font-medium mb-1 ${isLight ? 'text-gray-700' : 'text-white/80'}`}>
          {label}
        </Listbox.Label>
        <div className="relative">
          <Listbox.Button
            className={`
              relative w-full min-h-[44px] py-3 px-4
              text-left rounded-lg border
              ${disabled
                ? isLight
                  ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                : isLight
                  ? 'bg-white border-gray-300 text-gray-900 hover:border-gray-400 cursor-pointer'
                  : 'bg-white/10 border-white/20 text-white hover:border-blue-400/50 cursor-pointer'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-colors duration-150
            `}
          >
            <span className={`block truncate ${!value ? (isLight ? 'text-gray-400' : 'text-white/40') : ''}`}>
              {value ? displayValue(value) : placeholder}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDownIcon
                className={`h-5 w-5 ${disabled ? (isLight ? 'text-gray-300' : 'text-white/20') : (isLight ? 'text-gray-400' : 'text-white/40')}`}
                aria-hidden={true}
              />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className={`
                absolute z-10 mt-1 w-full max-h-60
                overflow-auto rounded-lg
                py-1 shadow-lg
                focus:outline-none
                ${isLight
                  ? 'bg-white border border-gray-200'
                  : 'bg-[#1a1a2e] border border-white/10 backdrop-blur-xl'
                }
              `}
            >
              {options.length === 0 ? (
                <div className={`px-4 py-3 text-sm ${isLight ? 'text-gray-400' : 'text-white/40'}`}>
                  No options available
                </div>
              ) : (
                options.map((option, index) => (
                  <Listbox.Option
                    key={`${option}-${index}`}
                    value={option}
                    className={({ active, selected }) =>
                      `relative cursor-pointer select-none py-3 px-4 min-h-[44px]
                       ${active
                         ? isLight ? 'bg-blue-50 text-gray-900' : 'bg-blue-500/20 text-white'
                         : isLight ? 'text-gray-700' : 'text-white/80'
                       }
                       ${selected
                         ? isLight ? 'font-medium bg-blue-50' : 'font-medium bg-blue-500/10'
                         : 'font-normal'
                       }
                      `
                    }
                  >
                    {({ selected }) => (
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {displayValue(option)}
                      </span>
                    )}
                  </Listbox.Option>
                ))
              )}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}

function ChevronDownIcon({ className, ...props }: { className?: string; 'aria-hidden'?: boolean }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

type YMMTSelectorProps = {
  onComplete?: () => void;
  variant?: Variant;
};

export function YMMTSelector({ onComplete, variant = 'light' }: YMMTSelectorProps) {
  const {
    selectedYear,
    selectedMake,
    selectedModel,
    selectedTrim,
    availableYears,
    availableMakes,
    availableModels,
    availableTrims,
    setYear,
    setMake,
    setModel,
    setTrim,
    isComplete,
    confirmVehicle,
    isLoading,
    error,
    retry,
  } = useVehicle();

  const isLight = variant === 'light';

  const handleContinue = () => {
    confirmVehicle();
    onComplete?.();
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className={`flex items-center justify-center space-x-2 ${isLight ? 'text-gray-500' : 'text-white/60'}`}>
          <LoadingSpinner />
          <span>Loading vehicle data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className={`rounded-lg p-4 ${isLight ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-red-500/10 border border-red-500/30 text-red-300'}`}>
          <p className="font-medium">Failed to load vehicle data</p>
          <p className={`text-sm mt-1 ${isLight ? 'text-red-600' : 'text-red-300/80'}`}>{error}</p>
          <button
            type="button"
            onClick={retry}
            className={`
              mt-3 min-h-[44px] px-4 py-2
              rounded-lg font-medium text-white
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
              ${isLight ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-400'}
            `}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-4">
        {/* Year Selection */}
        <Dropdown<number>
          label="Year"
          value={selectedYear}
          options={availableYears}
          onChange={setYear}
          placeholder="Select Year"
          displayValue={(year) => year.toString()}
          variant={variant}
        />

        {/* Make Selection */}
        <Dropdown<string>
          label="Make"
          value={selectedMake}
          options={availableMakes}
          onChange={setMake}
          disabled={!selectedYear}
          placeholder={selectedYear ? 'Select Make' : 'Select Year first'}
          variant={variant}
        />

        {/* Model Selection */}
        <Dropdown<string>
          label="Model"
          value={selectedModel}
          options={availableModels}
          onChange={setModel}
          disabled={!selectedMake}
          placeholder={selectedMake ? 'Select Model' : 'Select Make first'}
          variant={variant}
        />

        {/* Trim Selection */}
        <Dropdown<string>
          label="Trim"
          value={selectedTrim}
          options={availableTrims}
          onChange={setTrim}
          disabled={!selectedModel}
          placeholder={selectedModel ? 'Select Trim' : 'Select Model first'}
          variant={variant}
        />
      </div>

        {/* Continue Button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!isComplete}
            className={`
              w-full min-h-[44px] py-3 px-6
              rounded-lg font-semibold text-white
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${isComplete
                ? 'bg-gray-900 hover:bg-gray-800 cursor-pointer'
                : isLight
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }
            `}
          >
            {isComplete ? 'Continue' : 'Complete all selections to continue'}
          </button>
        </div>

        {/* Selection Preview */}
        {isComplete && (
        <div className={`mt-4 p-4 rounded-lg border ${isLight ? 'bg-blue-50 border-blue-100' : 'bg-white/5 border-white/10'}`}>
          <p className={`text-sm font-medium ${isLight ? 'text-gray-600' : 'text-white/60'}`}>Selected Vehicle:</p>
          <p className={`text-lg mt-1 ${isLight ? 'text-gray-900' : 'text-white'}`}>
            {selectedYear} {selectedMake} {selectedModel} {selectedTrim}
          </p>
        </div>
      )}
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
