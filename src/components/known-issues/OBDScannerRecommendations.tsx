import { obdScanners, type ScannerTier } from '@/data/obd-scanners';

const tierConfig: Record<ScannerTier, { label: string; color: string }> = {
  budget: { label: 'Budget Pick', color: 'bg-green-100 text-green-700' },
  midrange: { label: 'Best Value', color: 'bg-blue-100 text-blue-700' },
  advanced: { label: 'Advanced', color: 'bg-purple-100 text-purple-700' },
  professional: { label: 'Professional', color: 'bg-gray-900 text-white' },
};

interface OBDScannerRecommendationsProps {
  dtcCode: string;
}

export function OBDScannerRecommendations({ dtcCode }: OBDScannerRecommendationsProps) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Diagnostic Tools</h2>
      <p className="text-gray-500 text-sm mb-6">
        To diagnose {dtcCode}, you&apos;ll need an OBD-II scanner. Here are our recommendations at every price point.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {obdScanners.map((scanner) => {
          const tier = tierConfig[scanner.tier];
          return (
            <div
              key={scanner.name}
              className="border border-gray-200 rounded-xl p-5 bg-white hover:border-gray-300 transition-colors flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tier.color}`}>
                  {tier.label}
                </span>
                <span className="text-sm font-bold text-gray-900">{scanner.priceRange}</span>
              </div>

              {/* Name & Brand */}
              <h3 className="text-base font-semibold text-gray-900 mb-1">{scanner.name}</h3>
              <p className="text-xs text-gray-500 mb-2">by {scanner.brand}</p>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{scanner.description}</p>

              {/* Features */}
              <ul className="space-y-1.5 mb-5 flex-1">
                {scanner.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg
                      className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={scanner.amazonUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Check Price on Amazon
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 mt-4">
        As an Amazon Associate, we earn from qualifying purchases. Prices are approximate and may vary.
      </p>
    </section>
  );
}
