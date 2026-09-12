import type { KnownIssue } from '@/schemas/knownIssue.schema';
import { externalHttpUrl } from '@/lib/external-http-url';

export function DtcIssueSources({ citations }: { citations: KnownIssue['citations'] }) {
  const sources = new Map<string, { title: string; type: string }>();
  for (const citation of Array.isArray(citations) ? citations : []) {
    if (!citation || typeof citation !== 'object') continue;
    const url = externalHttpUrl(citation.url);
    if (url && !sources.has(url)) sources.set(url, {
      title: typeof citation.title === 'string' && citation.title.trim() ? citation.title : url,
      type: typeof citation.type === 'string' ? citation.type : '',
    });
  }
  if (sources.size === 0) return null;
  return (
    <details className="border-t border-[#E3DFD4] pt-3" data-dtc-issue-sources open>
      <summary className="cursor-pointer text-sm font-medium text-[#0B1220]">Sources for this issue ({sources.size})</summary>
      <ul className="mt-2 space-y-2">
        {[...sources].map(([url, source]) => (
          <li key={url} className="text-sm">
            <a href={url} target="_blank" rel="nofollow noopener noreferrer" className="text-[#3B82F6] hover:underline break-words">
              {source.title}
            </a>
            {source.type && <span className="ml-2 text-xs uppercase text-[#64748B]">{source.type}</span>}
          </li>
        ))}
      </ul>
    </details>
  );
}
