import {
  codeFamilyOf,
  scannersForCodeFamily,
  type CodeFamily,
  type DiagnosticTool,
} from '@/data/diagnostic-tools';

/**
 * What this code takes to READ, and where the job stops being a driveway job.
 *
 * The previous component listed the same four scanners on every code page in
 * price order. On 840 of 3,197 pages the cheapest one cannot read the code the
 * page is about — a basic reader polls powertrain codes only. So the set is
 * filtered by capability first, and the page says plainly when a job needs a
 * shop, even though that costs us the click.
 */

const FAMILY_NOTE: Record<CodeFamily, string> = {
  P: 'This is a powertrain code, so a basic OBD-II reader can read it.',
  B: 'This is a body code. A basic engine-code reader will not show it — you need a scanner that reads body modules.',
  C: 'This is a chassis code. A basic engine-code reader will not show it — you need a scanner that reads chassis modules.',
  U: 'This is a network/communication code. A basic engine-code reader will not show it — you need a scanner that reads all modules.',
};

/** Work that is not a driveway job, whatever tool you own. */
const SHOP_WORK = [
  'Module programming or software updates — needs the manufacturer software or a J2534 pass-through with a paid subscription.',
  'Replacing a control module — most are VIN-programmed and immobilizer-registered, so a new one does nothing until it is coded to your car.',
  'Airbag/SRS component work — a stored fault can deploy a live device.',
];

export function DiagnosticToolGuidance({ dtcCode }: { dtcCode: string }) {
  const family = codeFamilyOf(dtcCode);
  const scanners = scannersForCodeFamily(family);
  // Never render a buy button for a link we have not audited. Naming the tool
  // is honest; linking one we have not verified is the thing we refuse to do.
  const linkable = (tool: DiagnosticTool) => Boolean(tool.productUrl);

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-[#0B1220] mb-2">Diagnostic Tools</h2>
      <p className="text-[#64748B] text-sm mb-6">
        {FAMILY_NOTE[family]} {scanners.length > 0 && 'These read '}
        {scanners.length > 0 && <span className="font-medium">{dtcCode}</span>}
        {scanners.length > 0 && '.'}
      </p>

      {family !== 'P' && (
        // True of every scanner on the market, so it belongs once on the page
        // rather than as a per-product asterisk: only the generic powertrain set
        // is standardised across manufacturers. Everything else is enhanced
        // coverage, and how deep it goes depends on the make and model year.
        <p className="text-sm text-[#475569] leading-relaxed mb-6 border-l-2 border-[#E3DFD4] pl-3">
          One caveat that applies to every scanner: only powertrain codes are standardised across
          manufacturers. Body, chassis and network coverage is &quot;enhanced&quot; diagnostics, and
          how deep it goes varies by make and model year — check your specific vehicle against the
          tool&apos;s coverage list before buying.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {scanners.map((scanner) => (
          <div
            key={scanner.id}
            className="border border-[#E3DFD4] rounded-xl p-5 bg-white flex flex-col"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                Reads {family} codes
              </span>
              <span className="text-sm font-bold text-[#0B1220]">{scanner.priceRange}</span>
            </div>

            <h3 className="text-base font-semibold text-[#0B1220] mb-1">{scanner.name}</h3>
            <p className="text-xs text-[#64748B] mb-2">by {scanner.brand}</p>
            <p className="text-sm text-[#475569] leading-relaxed mb-4">{scanner.description}</p>

            <ul className="space-y-1.5 mb-5 flex-1">
              {scanner.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-[#475569]">
                  <span aria-hidden className="text-green-500 mt-0.5">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            {linkable(scanner) ? (
              <a
                href={scanner.productUrl as string}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#0B1220] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Check Price on Amazon
              </a>
            ) : (
              <p className="text-xs text-[#64748B] text-center py-2.5">
                Search this model at your preferred retailer.
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 border border-[#E3DFD4] rounded-xl p-5 bg-[#FAF9F6]">
        <h3 className="text-base font-semibold text-[#0B1220] mb-2">
          What you can do yourself, and what needs a shop
        </h3>
        <p className="text-sm text-[#475569] leading-relaxed mb-3">
          Reading the code, clearing it, and watching whether it returns is a driveway job with the
          right scanner. These steps are not:
        </p>
        <ul className="space-y-2">
          {SHOP_WORK.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-[#475569]">
              <span aria-hidden className="text-[#B45309] mt-0.5">•</span>
              {item}
            </li>
          ))}
        </ul>
        <p className="text-sm text-[#475569] leading-relaxed mt-3">
          If the vehicle is still under warranty, check for an open recall or technical service
          bulletin before buying anything — the repair may already be covered.
        </p>
      </div>

      <p className="text-xs text-[#64748B] mt-4">
        As an Amazon Associate, we earn from qualifying purchases. Prices are approximate and may vary.
      </p>
    </section>
  );
}
