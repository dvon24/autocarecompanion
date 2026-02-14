'use client';

import { useState } from 'react';
import { type Diagnosis } from '@/schemas/chat.schema';

/**
 * DiagnosisCard - Display diagnosis result with action buttons
 *
 * Follows Architecture patterns:
 * - Touch targets 44x44px minimum (NFR-A7)
 * - Discovery phase styling
 * - Named exports only
 * - Story 1.5: Show alternatives with confidence levels
 */

type DiagnosisCardProps = {
  diagnosis: Diagnosis;
  alternativeDiagnoses?: Diagnosis[];
  onGenerateGuide?: () => void;
  onSelectAlternative?: (diagnosis: Diagnosis) => void;
  isGeneratingGuide?: boolean;
};

export function DiagnosisCard({
  diagnosis,
  alternativeDiagnoses = [],
  onGenerateGuide,
  onSelectAlternative,
  isGeneratingGuide = false,
}: DiagnosisCardProps) {
  const [showAlternatives, setShowAlternatives] = useState(false);

  const getConfidenceColor = (confidence: 'high' | 'medium' | 'low') => ({
    high: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-orange-100 text-orange-800 border-orange-200',
  }[confidence]);

  const confidenceColor = getConfidenceColor(diagnosis.confidence);

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

        {/* Confidence Guidance */}
        {diagnosis.confidence !== 'high' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              {diagnosis.confidence === 'medium'
                ? 'This diagnosis has medium confidence. Consider reviewing the alternatives below before proceeding.'
                : 'This diagnosis has low confidence. We recommend reviewing alternatives or consulting a mechanic.'}
            </p>
          </div>
        )}

        {/* Alternative Diagnoses */}
        {alternativeDiagnoses.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => setShowAlternatives(!showAlternatives)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-transform ${showAlternatives ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Alternative Diagnoses ({alternativeDiagnoses.length})
            </button>

            {showAlternatives && (
              <div className="mt-3 space-y-3">
                {alternativeDiagnoses.map((alt) => (
                  <div
                    key={alt.id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-gray-900">{alt.title}</h5>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium border ${getConfidenceColor(alt.confidence)}`}
                          >
                            {alt.confidence}
                          </span>
                        </div>
                        {alt.description && (
                          <p className="text-sm text-gray-600">{alt.description}</p>
                        )}
                      </div>
                      {onSelectAlternative && (
                        <button
                          type="button"
                          onClick={() => onSelectAlternative(alt)}
                          className="
                            flex-shrink-0 min-h-[36px] px-3 py-1.5
                            text-sm text-blue-600 font-medium
                            hover:bg-blue-50 rounded-lg transition-colors
                            focus:outline-none focus:ring-2 focus:ring-blue-500
                          "
                        >
                          Select
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {onGenerateGuide && (
            <button
              type="button"
              onClick={onGenerateGuide}
              disabled={isGeneratingGuide}
              className={`
                flex-1 min-h-[44px] py-3 px-4
                font-medium rounded-lg
                transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${isGeneratingGuide
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
                }
              `}
            >
              {isGeneratingGuide ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Guide...
                </span>
              ) : (
                'Generate Repair Guide'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
