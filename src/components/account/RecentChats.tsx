import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { ChatTypeIcon } from './ChatTypeIcon';

interface ChatMessagePreview {
  role: string;
  content: string;
  vision?: unknown;
  video?: unknown;
}

interface DiagnosisPreview {
  title?: string;
  confidence?: string;
}

interface ChatRow {
  id: string;
  createdAt: Date;
  messages: unknown;
  diagnosis: unknown;
  vehicleId?: string | null;
}

/**
 * Detects the visual type of a chat from its first user message
 * payload. The hub stores vision/video attachments alongside text in
 * the messages jsonb, so we sniff for those shapes first. Anything
 * else falls back to text.
 */
function deriveChatType(msgs: ChatMessagePreview[]): 'text' | 'photo' | 'video' {
  for (const m of msgs) {
    if (m.role !== 'user') continue;
    if (m.video) return 'video';
    if (m.vision) return 'photo';
    const c = (m.content || '').toLowerCase();
    if (c.includes('uploaded a video')) return 'video';
    if (c.includes('uploaded a photo') || c.includes('uploaded an image')) return 'photo';
    break;
  }
  return 'text';
}

/**
 * "Recent Chats" body. BMAD provides the row visual (ChatTypeIcon +
 * first-user-message ellipsis + N messages + timeAgo + chevron).
 *
 * IMPORTANT (adversarial-verify fix): the prior /account page rendered
 * the linked diagnosis title (`→ {diag.title}`) underneath each chat's
 * first user message — that's load-bearing context showing what the
 * chat resulted in. This component preserves that affordance below the
 * BMAD title row so the redesign isn't a silent feature drop.
 *
 * Each row is a Link to /vehicle/[slug]?session={id} — that's the hub
 * page that hydrates the seeded thread (same handoff path used by the
 * Recent threads list inside VehicleHub). The chat session itself
 * doesn't carry the slug on this query (only vehicleId), so when
 * vehicleSlug is unknown the row falls back to non-clickable.
 */
export function RecentChats({
  chats,
  vehicleSlugById,
  formatAgo,
}: {
  chats: ChatRow[];
  vehicleSlugById: Record<string, string | undefined>;
  formatAgo: (d: Date) => string;
}) {
  if (chats.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No chats yet.{' '}
        <Link href="/symptom-chat" className="text-blue-600 hover:text-blue-700 font-medium">
          Start one →
        </Link>
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {chats.map((c, i) => {
        const msgs = (c.messages as unknown as ChatMessagePreview[]) || [];
        const firstUser = msgs.find((m) => m.role === 'user');
        const diag = c.diagnosis as unknown as DiagnosisPreview | null;
        const type = deriveChatType(msgs);
        const slug = c.vehicleId ? vehicleSlugById[c.vehicleId] : undefined;
        const href = slug ? `/vehicle/${slug}?session=${c.id}` : null;
        const isLast = i === chats.length - 1;
        const title = firstUser?.content?.trim() || '(empty)';

        const inner = (
          <div
            className="flex items-center gap-3 py-2.5"
            style={{
              borderBottom: isLast ? 'none' : '1px solid #E5E7EB',
            }}
          >
            <ChatTypeIcon type={type} />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-slate-900 truncate">
                {title}
              </div>
              {diag?.title && (
                <div className="text-[11px] text-blue-600 font-medium truncate mt-0.5">
                  → {diag.title}
                </div>
              )}
              <div className="text-[11.5px] text-slate-500 mt-0.5">
                {msgs.length} message{msgs.length === 1 ? '' : 's'}
              </div>
            </div>
            <span className="text-[11.5px] text-slate-400 flex-shrink-0">
              {formatAgo(c.createdAt)}
            </span>
            {href && (
              <span className="text-slate-300 flex-shrink-0">
                <Icon name="chevron" size={11} />
              </span>
            )}
          </div>
        );

        return href ? (
          <Link
            key={c.id}
            href={href}
            className="block hover:bg-stone-50/60 -mx-2 px-2 rounded transition-colors"
          >
            {inner}
          </Link>
        ) : (
          <div key={c.id}>{inner}</div>
        );
      })}
    </div>
  );
}
