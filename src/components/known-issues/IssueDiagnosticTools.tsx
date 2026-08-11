import {
  proceduresInSolution,
  toolsForProcedures,
  scannersForCodeFamily,
  codeFamilyOf,
  type DiagnosticTool,
} from '@/data/diagnostic-tools';

/**
 * Tools for an issue whose fix is a DIAGNOSTIC PROCEDURE rather than a part.
 *
 * 6,939 of 7,642 published issues carry no fixParts, and 644 of those have a
 * solution that explicitly calls for a test — parasitic draw, smoke test,
 * compression test, fuel pressure. For those the honest answer to "what do I
 * buy" was never a part. It is the instrument the procedure requires, and the
 * page offered nothing at all.
 *
 * MATCHED FROM THE ARTICLE'S OWN WORDING, never inferred from the category. A
 * solution that names no procedure renders nothing — an empty section is
 * correct, a guessed one is not.
 *
 * THE CLAIM IS DELIBERATELY NARROWER THAN A PART'S. A part asserts "this
 * repairs your car" and must earn that through catalog fitment plus human
 * approval of repair role. A tool asserts only "the procedure above needs this
 * instrument", which stays true whichever module turns out to be at fault, and
 * needs no fitment at all. They are separate sections for that reason.
 */

interface IssueDiagnosticToolsProps {
  solution: string;
  /** Codes on the issue, so a page naming one also gets a scanner that reads it. */
  dtcCodes?: string[] | null;
}

export function IssueDiagnosticTools({ solution, dtcCodes }: IssueDiagnosticToolsProps) {
  const procedures = proceduresInSolution(solution);
  const tools: DiagnosticTool[] = [...toolsForProcedures(procedures)];

  // If the issue names codes, the reader also needs something that can READ
  // them — and for a body or network code that is emphatically not a $20 reader.
  const families = [...new Set((dtcCodes || []).map(codeFamilyOf))];
  const capable = families
    .flatMap((f) => scannersForCodeFamily(f))
    .sort((a, b) => a.priceAnchor - b.priceAnchor)[0];
  if (capable && !tools.some((t) => t.id === capable.id)) tools.push(capable);

  if (tools.length === 0) return null;
  const nonPowertrain = families.filter((f) => f !== 'P');
  // Whether the ARTICLE asked for a test, versus us offering a reader because
  // the page happens to name a code. The two justify different claims.
  const matchedProcedure = procedures.length > 0;

  return (
    <div className="rounded-lg border border-[#D8D1C3] bg-[#EFEDE6] p-3">
      <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#0B1220]">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        {matchedProcedure ? 'What you need to diagnose it' : 'What reads this code'}
      </h4>
      <p className="mb-3 text-xs leading-relaxed text-[#475569]">
        {matchedProcedure
          // Only say the fix STARTS WITH A TEST when the article's own solution
          // actually calls for one. Saying it on a page that already carries a
          // confirmed part would contradict the repair sitting right below it.
          ? 'The fix here starts with a test, not a part — which repair you need depends on what the test finds.'
          : 'This issue is identified by a stored code. To confirm it is what your car actually has, you need a scanner that can read it.'}
        {nonPowertrain.length > 0 && (
          <span className="mt-1 block text-[#64748B]">
            This issue involves {nonPowertrain.join('/')} codes, which a basic engine-code reader
            cannot see.
          </span>
        )}
      </p>

      <ul className="space-y-2">
        {tools.map((tool) => (
          <li key={tool.id} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#0B1220]">{tool.name}</p>
              <p className="text-xs leading-relaxed text-[#475569]">{tool.features[0]}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-xs font-semibold text-[#0B1220]">{tool.priceRange}</span>
              {tool.productUrl && (
                <a
                  href={tool.productUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="rounded-md bg-[#0B1220] px-2.5 py-1 text-xs font-medium text-white hover:opacity-90"
                >
                  View
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs leading-relaxed text-[#64748B]">
        {matchedProcedure
          ? 'Testing and isolating the fault is DIY work. Replacing or reprogramming a control module is not — most are VIN-programmed, so a new one does nothing until a shop codes it to your car. '
          : 'Reading and clearing the code is DIY work. Module replacement or reprogramming is not — most modules are VIN-programmed, so a new one does nothing until a shop codes it to your car. '}
        Check for an open recall or service bulletin before buying anything.
      </p>
    </div>
  );
}
