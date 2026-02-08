'use client';

import { type Diagnosis } from '@/schemas/chat.schema';

/**
 * DiagnosisCard - Display diagnosis result with action buttons
 *
 * Follows Architecture patterns:
 * - Touch targets 44x44px minimum (NFR-A7)
 * - Discovery phase styling
 * - Named exports only
 */

type DiagnosisCardProps = {
  diagnosis: Diagnosis;
  onGenerateGuide?: () => void;
  onViewAlternatives?: () => void;
};

export function DiagnosisCard({
  diagnosis,
  onGenerateGuide,
  onViewAlternatives,
}: DiagnosisCardProps) {
  const confidenceColor = {
    high: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-orange-100 text-orange-800 border-orange-200',
  }[diagnosis.confidence];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-50 px-4 py-3 border-b border-blue-100">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-blue-900">Diagnosis</h3>
          <span
            className={`px-2 py-1 rounded text-xs font-medium border ${confidenceColor}`}
          >
            {diagnosis.confidence} confidence
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900">
            {diagnosis.title}
          </h4>
          {diagnosis.description && (
            <p className="text-gray-600 mt-1">{diagnosis.description}</p>
          )}
        </div>

        {/* Possible Causes */}
        {diagnosis.possibleCauses.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              Possible Causes
            </h5>
            <ul className="space-y-1">
              {diagnosis.possibleCauses.map((cause, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-600"
                >
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendation */}
        {diagnosis.recommendedAction && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h5 className="text-sm font-medium text-gray-700 mb-1">
              Recommendation
            </h5>
            <p className="text-sm text-gray-600">{diagnosis.recommendedAction}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {onGenerateGuide && (
            <button
              type="button"
              onClick={onGenerateGuide}
              className="
                flex-1 min-h-[44px] py-3 px-4
                bg-gray-900 text-white font-medium rounded-lg
                hover:bg-gray-800 transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              "
            >
              Generate Repair Guide
            </button>
          )}
          {onViewAlternatives && (
            <button
              type="button"
              onClick={onViewAlternatives}
              className="
                flex-1 min-h-[44px] py-3 px-4
                border border-gray-300 text-gray-700 font-medium rounded-lg
                hover:bg-gray-50 transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              "
            >
              View Alternatives
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
