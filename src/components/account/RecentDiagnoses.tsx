import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

interface DiagnosisRow {
  id: string;
  year: number | null;
  make: string | null;
  model: string | null;
  title: string | null;
  confidence: string | null;
  createdAt: Date;
}

/**
 * "Recent Diagnoses" body. BMAD provides the empty-state visual
 * (blue camera circle + "Start a diagnosis" CTA → /symptom-chat).
 * Populated state extends that with the prior list rendering.
 */
export function RecentDiagnoses({
  diagnoses,
  formatAgo,
}: {
  diagnoses: DiagnosisRow[];
  formatAgo: (d: Date) => string;
}) {
  if (diagnoses.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center"
        style={{ padding: '22px 0' }}
      >
        <span
          className="inline-flex items-center justify-center text-blue-600"
          style={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            background: '#DBEAFE',
            marginBottom: 12,
          }}
        >
          <Icon name="camera" size={21} />
        </span>
        <div className="text-[13.5px] font-semibold text-slate-900">No diagnoses yet</div>
        <div className="text-[12.5px] text-slate-500 mt-1">
          Start a chat to diagnose a symptom — by photo, video, or description.
        </div>
        <Link
          href="/symptom-chat"
          className="inline-flex items-center gap-2 mt-3.5 bg-blue-600 text-white rounded-xl font-semibold text-[13px] hover:bg-blue-700 transition-colors"
          style={{ padding: '9px 18px' }}
        >
          <Icon name="camera" size={14} /> Start a diagnosis
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {diagnoses.map((d) => (
        <li
          key={d.id}
          className="rounded-xl border border-stone-200 bg-stone-50/40"
          style={{ padding: '12px 14px' }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 truncate">{d.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {d.year} {d.make} {d.model}
                {d.confidence && (
                  <span
                    className="ml-2 inline-block bg-blue-50 text-blue-700 text-[10px] font-medium uppercase rounded"
                    style={{ padding: '1px 6px' }}
                  >
                    {d.confidence}
                  </span>
                )}
              </p>
            </div>
            <span className="text-xs text-slate-400 flex-shrink-0">{formatAgo(d.createdAt)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
