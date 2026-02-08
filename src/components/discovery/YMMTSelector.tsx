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

type DropdownProps<T> = {
  label: string;
  value: T | null;
  options: T[];
  onChange: (value: T | null) => void;
  disabled?: boolean;
  placeholder?: string;
  displayValue?: (value: T) => string;
};

function Dropdown<T extends string | number>({
  label,
  value,
  options,
  onChange,
  disabled = false,
  placeholder = 'Select...',
  displayValue = (v) => String(v),
}: DropdownProps<T>) {
  return (
    <div className="w-full">
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <Listbox.Label className="block text-sm font-medium text-discovery-text mb-1">
          {label}
        </Listbox.Label>
        <div className="relative">
          <Listbox.Button
            className={`
              relative w-full min-h-[44px] py-3 px-4
              text-left rounded-lg border
              ${disabled
                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border-gray-300 text-discovery-text hover:border-discovery-primary cursor-pointer'
              }
              focus:outline-none focus:ring-2 focus:ring-discovery-primary focus:border-transparent
              transition-colors duration-150
            `}
          >
            <span className={`block truncate ${!value ? 'text-gray-400' : ''}`}>
              {value ? displayValue(value) : placeholder}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDownIcon
                className={`h-5 w-5 ${disabled ? 'text-gray-300' : 'text-gray-400'}`}
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
              className="
                absolute z-10 mt-1 w-full max-h-60
                overflow-auto rounded-lg bg-white
                py-1 shadow-lg ring-1 ring-black ring-opacity-5
                focus:outline-none
              "
            >
              {options.length === 0 ? (
                <div className="px-4 py-3 text-gray-400 text-sm">
                  No options available
                </div>
              ) : (
                options.map((option, index) => (
                  <Listbox.Option
                    key={`${option}-${index}`}
                    value={option}
                    className={({ active, selected }) =>
                      `relative cursor-pointer select-none py-3 px-4 min-h-[44px]
                       ${active ? 'bg-discovery-background text-discovery-text' : 'text-gray-900'}
                       ${selected ? 'font-medium' : 'font-normal'}
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
};

export function YMMTSelector({ onComplete }: YMMTSelectorProps) {
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

  const handleContinue = () => {
    confirmVehicle();
    onComplete?.();
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="flex items-center justify-center space-x-2 text-discovery-muted">
          <LoadingSpinner />
          <span>Loading vehicle data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Failed to load vehicle data</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            type="button"
            onClick={retry}
            className="
              mt-3 min-h-[44px] px-4 py-2
              bg-red-600 hover:bg-red-700 text-white
              rounded-lg font-medium
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
            "
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
        />

        {/* Make Selection */}
        <Dropdown<string>
          label="Make"
          value={selectedMake}
          options={availableMakes}
          onChange={setMake}
          disabled={!selectedYear}
          placeholder={selectedYear ? 'Select Make' : 'Select Year first'}
        />

        {/* Model Selection */}
        <Dropdown<string>
          label="Model"
          value={selectedModel}
          options={availableModels}
          onChange={setModel}
          disabled={!selectedMake}
          placeholder={selectedMake ? 'Select Model' : 'Select Make first'}
        />

        {/* Trim Selection */}
        <Dropdown<string>
          label="Trim"
          value={selectedTrim}
          options={availableTrims}
          onChange={setTrim}
          disabled={!selectedModel}
          placeholder={selectedModel ? 'Select Trim' : 'Select Model first'}
        />

        {/* Continue Button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!isComplete}
            className={`
              w-full min-h-[44px] py-3 px-6
              rounded-lg font-medium text-white
              transition-all duration-200
              ${isComplete
                ? 'bg-discovery-primary hover:bg-blue-600 cursor-pointer shadow-md hover:shadow-lg'
                : 'bg-gray-300 cursor-not-allowed'
              }
              focus:outline-none focus:ring-2 focus:ring-discovery-primary focus:ring-offset-2
            `}
          >
            {isComplete ? 'Continue' : 'Complete all selections to continue'}
          </button>
        </div>

        {/* Selection Preview */}
        {isComplete && (
          <div className="mt-4 p-4 bg-discovery-background rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-discovery-text">Selected Vehicle:</p>
            <p className="text-lg text-discovery-text mt-1">
              {selectedYear} {selectedMake} {selectedModel} {selectedTrim}
            </p>
          </div>
        )}
      </div>
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
