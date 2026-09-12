import Link from 'next/link';
import { FAQJsonLd } from '@/components/seo/JsonLd';

interface DtcReferenceCardProps {
  code: string;
  faqs: { question: string; answer: string }[];
  relatedCodes?: { code: string; name: string }[];
}

/** Shared code context appears once; vehicle evidence stays in its issue card. */
export function DtcReferenceCard({ code, faqs, relatedCodes = [] }: DtcReferenceCardProps) {
  const supportedFaqs = faqs.filter(faq => faq.question.trim() && faq.answer.trim());
  if (supportedFaqs.length === 0 && relatedCodes.length === 0) return null;

  return (
    <section id="code-reference" aria-labelledby="code-reference-heading" className="my-8 rounded-lg border border-[#E3DFD4] bg-[#FBFAF6] p-4 sm:p-5 break-words">
      <h2 id="code-reference-heading" className="text-lg font-semibold text-[#0B1220] mb-2">{code} code reference</h2>
      <p className="text-sm text-[#64748B] mb-4">General diagnostic-code context. The code alone does not confirm a cause for your vehicle; use the applicable issue card and its sources.</p>
      {supportedFaqs.length > 0 && (
        <div id="faq" className="scroll-mt-20">
          <h3 className="text-sm font-semibold text-[#0B1220] mb-3">Frequently asked questions</h3>
          <div className="divide-y divide-[#E3DFD4]">
            {supportedFaqs.map(faq => (
              <details key={faq.question} className="py-3 first:pt-0" open>
                <summary className="cursor-pointer text-sm font-medium text-[#334155]">{faq.question}</summary>
                <p className="text-sm leading-relaxed text-[#475569] mt-2">{faq.answer}</p>
              </details>
            ))}
          </div>
          <FAQJsonLd questions={supportedFaqs} />
        </div>
      )}
      {relatedCodes.length > 0 && (
        <nav aria-label="Related diagnostic codes" className="mt-4 border-t border-[#E3DFD4] pt-4">
          <h3 className="text-sm font-semibold text-[#0B1220] mb-3">Related codes</h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {relatedCodes.map(related => (
              <li key={related.code} className="min-w-0">
                <Link href={`/known-issues/dtc/${related.code.toLowerCase()}`} className="block rounded-lg border border-[#E3DFD4] px-3 py-2 text-sm text-[#475569] hover:border-[#3B82F6]">
                  <span className="font-mono font-semibold text-[#334155]">{related.code}</span> · {related.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </section>
  );
}
