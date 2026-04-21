import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { PageLayout } from '@/components/ui/PageLayout';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Account',
  description: 'Your Au7o account, chat history, and vehicle insights.',
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

interface ChatMessagePreview {
  role: string;
  content: string;
  timestamp?: string;
}

interface DiagnosisPreview {
  title?: string;
  confidence?: string;
}

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/account');
  }

  const userId = session.user.id;

  const [chats, diagnoses, partSearches, vehicles] = await Promise.all([
    prisma.chatSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, messages: true, diagnosis: true, createdAt: true, vehicleId: true },
    }),
    prisma.vehicleInsight.findMany({
      where: { userId, insightType: 'diagnosis' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, year: true, make: true, model: true, title: true, confidence: true, createdAt: true },
    }),
    prisma.vehicleInsight.findMany({
      where: { userId, insightType: 'part_demand' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, year: true, make: true, model: true, title: true, createdAt: true },
    }),
    prisma.vehicle.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { id: true, year: true, make: true, model: true, trim: true, nickname: true },
    }),
  ]);

  return (
    <PageLayout backLink={{ href: '/', label: 'Home' }}>
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Your Account</h1>
          <p className="text-gray-600 mt-1">{session.user.email}</p>
        </header>

        {/* Garage summary */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My Garage</h2>
            <Link href="/garage" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Manage →
            </Link>
          </div>
          {vehicles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
              <p className="text-gray-600 text-sm">No vehicles yet.</p>
              <Link href="/garage" className="text-blue-600 hover:text-blue-700 font-medium text-sm mt-2 inline-block">
                Add a vehicle →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {vehicles.map((v) => (
                <Link
                  key={v.id}
                  href={`/garage/${v.id}`}
                  className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {v.nickname || `${v.year} ${v.make} ${v.model}`}
                  </p>
                  {v.nickname && (
                    <p className="text-xs text-gray-500 truncate">
                      {v.year} {v.make} {v.model} {v.trim}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent diagnoses */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Diagnoses</h2>
          {diagnoses.length === 0 ? (
            <p className="text-sm text-gray-500">No diagnoses yet. Start a chat to diagnose a symptom.</p>
          ) : (
            <ul className="space-y-2">
              {diagnoses.map((d) => (
                <li key={d.id} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{d.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {d.year} {d.make} {d.model}
                        {d.confidence && <span className="ml-2 inline-block px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-medium uppercase">{d.confidence}</span>}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(d.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent chats */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Chats</h2>
          {chats.length === 0 ? (
            <p className="text-sm text-gray-500">
              No chats yet. <Link href="/symptom-chat" className="text-blue-600 hover:text-blue-700 font-medium">Start one →</Link>
            </p>
          ) : (
            <ul className="space-y-2">
              {chats.map((c) => {
                const msgs = (c.messages as unknown as ChatMessagePreview[]) || [];
                const firstUser = msgs.find((m) => m.role === 'user');
                const diag = c.diagnosis as unknown as DiagnosisPreview | null;
                return (
                  <li key={c.id} className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-900 line-clamp-2">
                          {firstUser?.content || '(empty)'}
                        </p>
                        {diag?.title && (
                          <p className="text-xs text-blue-600 font-medium mt-1">
                            → {diag.title}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {msgs.length} message{msgs.length === 1 ? '' : 's'}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(c.createdAt)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Recent parts searches */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Parts Searches</h2>
          {partSearches.length === 0 ? (
            <p className="text-sm text-gray-500">
              No searches yet. <Link href="/parts" className="text-blue-600 hover:text-blue-700 font-medium">Try the Parts Finder →</Link>
            </p>
          ) : (
            <ul className="space-y-2">
              {partSearches.map((p) => (
                <li key={p.id} className="rounded-xl border border-gray-200 bg-white p-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 capitalize truncate">{p.title.replace(/^freetext:/, '')}</p>
                    <p className="text-xs text-gray-500 truncate">{p.year} {p.make} {p.model}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(p.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PageLayout>
  );
}
