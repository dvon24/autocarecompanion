'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface EmailEntry {
  id: string;
  timestamp: string;
  email: string;
  context?: string | null;
  lastNotifiedAt?: string | null;
  unsubscribedAt?: string | null;
}

// Humanize the captured lead context, e.g. "known-issues:Chevrolet Camaro" ->
// "Chevrolet Camaro · Known issues"; "diagnose" -> "Diagnose". This is what the
// lead actually asked to be alerted about — the hook for following up.
function formatLeadContext(ctx?: string | null): string {
  if (!ctx) return '—';
  const [sourceRaw, ...rest] = ctx.split(':');
  const subject = rest.join(':').trim();
  const sourceLabel: Record<string, string> = {
    'known-issues': 'Known issues',
    'diagnose': 'Diagnose',
    'dtc': 'DTC code',
    'recall': 'Recall alert',
    'alert': 'Alert',
  };
  const src = sourceLabel[sourceRaw.trim().toLowerCase()] || sourceRaw.trim();
  return subject ? `${subject} · ${src}` : src;
}

interface FeedbackEntry {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  email: string | null;
}

interface UserEntry {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  provider: string;
  tier: string | null;
  subscriptionStatus: string | null;
  vehicleCount: number;
}

interface VehicleFeedback {
  timestamp: string;
  userInput: string;
  aiParsed: {
    year: number;
    make: string;
    model: string;
    trim?: string;
    engine?: string;
  };
  userCorrection: string;
}

interface SymptomPattern {
  id: string;
  vehicle: {
    year: number;
    make: string;
    model: string;
    trim?: string;
  };
  symptoms: string[];
  obdCodes: string[];
  diagnosisTitle: string | null;
  count: number;
  lastSeen: string;
  status: 'pending' | 'approved' | 'dismissed';
}

interface IssueReport {
  id: string;
  timestamp: string;
  vehicle: {
    year: number;
    make: string;
    model: string;
    trim?: string;
  };
  description: string;
  severity: 'high' | 'medium' | 'low';
  mileage?: number;
  existingIssueId?: string;
}

interface CachedGuideEntry {
  id: string;
  cacheKey: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  maintenanceType: string;
  title: string;
  status: string;
  version: number;
  hitCount: number;
  lastHitAt: string | null;
  generationCostUsd: number | null;
  createdAt: string;
  updatedAt: string;
}

interface GuideCacheData {
  guides: CachedGuideEntry[];
  total: number;
  page: number;
  pageSize: number;
  stats: {
    totalCached: number;
    totalHits: number;
    totalMisses: number;
    hitRate: number;
    totalSavings: number;
    pendingReview: number;
  };
}

interface CostEntry {
  timestamp: string;
  feature: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  model?: string;
}

interface CostData {
  summary: {
    totalCost: number;
    byFeature: Record<string, number>;
    byDay: Record<string, number>;
    budgetUsedPercent: number;
    warningLevel: string;
    remainingBudget: number;
    isRateLimited: boolean;
  };
  budgetStatus: {
    used: number;
    total: number;
    percent: number;
    level: string;
    daysRemaining: number;
    monthName: string;
  };
  warning: {
    warning: boolean;
    level: string;
    message: string | null;
  };
  stats: {
    totalCalls: number;
    avgCostPerCall: number;
    dailyAverage: number;
    projectedMonthly: number;
    uniqueDays: number;
  };
  recentEntries: CostEntry[];
}

export default function AdminPage() {
  const [emails, setEmails] = useState<EmailEntry[]>([]);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [vehicleFeedback, setVehicleFeedback] = useState<VehicleFeedback[]>([]);
  const [symptomPatterns, setSymptomPatterns] = useState<SymptomPattern[]>([]);
  const [issueReports, setIssueReports] = useState<IssueReport[]>([]);
  const [costData, setCostData] = useState<CostData | null>(null);
  const [reviewRecommendations, setReviewRecommendations] = useState<any[]>([]);
  const [researchingIssue, setResearchingIssue] = useState<string | null>(null);
  const [affiliateStats, setAffiliateStats] = useState<any>(null);
  const [guideCacheData, setGuideCacheData] = useState<GuideCacheData | null>(null);
  const [guideCachePage, setGuideCachePage] = useState(1);
  const [guideCacheFilter, setGuideCacheFilter] = useState<{ status: string; make: string; type: string }>({ status: '', make: '', type: '' });
  const [editingGuide, setEditingGuide] = useState<CachedGuideEntry | null>(null);
  const [editGuideJson, setEditGuideJson] = useState('');
  const [editGuideStatus, setEditGuideStatus] = useState('');
  const [editGuideNotes, setEditGuideNotes] = useState('');
  const [savingGuide, setSavingGuide] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingEmailId, setRemovingEmailId] = useState<string | null>(null);
  const [removingFeedbackId, setRemovingFeedbackId] = useState<string | null>(null);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);
  const [sentReplyIds, setSentReplyIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'emails' | 'users' | 'feedback' | 'vehicle' | 'patterns' | 'reports' | 'costs' | 'review' | 'affiliates' | 'guides'>('emails');

  // Remove a lead from the active list (suppress = set unsubscribedAt). Used to
  // honor a "take me off" request. Optimistically marks the row unsubscribed.
  async function removeEmail(entry: EmailEntry) {
    if (entry.unsubscribedAt) return;
    if (!confirm(`Remove ${entry.email} from the interest list? They'll get no more emails.`)) return;
    setRemovingEmailId(entry.id);
    try {
      const res = await fetch('/api/admin/interest/remove', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: entry.id }),
      });
      if (res.ok) {
        const now = new Date().toISOString();
        setEmails((prev) => prev.map((e) => (e.id === entry.id ? { ...e, unsubscribedAt: now } : e)));
      } else {
        alert('Could not remove — try again.');
      }
    } catch { alert('Could not remove — try again.'); }
    finally { setRemovingEmailId(null); }
  }

  // Dismiss a feedback item once it's been read/acted on (hard-delete — feedback
  // is a triage inbox, not a suppression record like leads).
  async function removeFeedback(entry: FeedbackEntry) {
    if (!confirm('Dismiss this feedback? This permanently deletes it.')) return;
    setRemovingFeedbackId(entry.id);
    try {
      const res = await fetch('/api/admin/feedback/remove', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: entry.id }),
      });
      if (res.ok) {
        setFeedback((prev) => prev.filter((f) => f.id !== entry.id));
      } else {
        alert('Could not dismiss — try again.');
      }
    } catch { alert('Could not dismiss — try again.'); }
    finally { setRemovingFeedbackId(null); }
  }

  // ── In-admin reply: compose + send an email to the feedback submitter from
  // au7o's own sender (no mailto handoff). Their response routes back to you.
  async function sendReply(entry: FeedbackEntry) {
    const body = (replyDraft[entry.id] || '').trim();
    if (!body) return;
    setSendingReplyId(entry.id);
    try {
      const res = await fetch('/api/admin/feedback/reply', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: entry.id, message: body }),
      });
      if (res.ok) {
        setSentReplyIds((prev) => new Set(prev).add(entry.id));
        setReplyingId(null);
        setReplyDraft((prev) => { const n = { ...prev }; delete n[entry.id]; return n; });
      } else {
        const j = await res.json().catch(() => ({}));
        alert(j.error || 'Could not send reply — check email config.');
      }
    } catch { alert('Could not send reply — try again.'); }
    finally { setSendingReplyId(null); }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch general admin data
        const response = await fetch('/api/admin/data');
        if (response.ok) {
          const data = await response.json();
          setEmails(data.emails || []);
          setFeedback(data.feedback || []);
          setUsers(data.users || []);
        }

        // Fetch vehicle feedback
        const vehicleResponse = await fetch('/api/feedback/vehicle');
        if (vehicleResponse.ok) {
          const vehicleData = await vehicleResponse.json();
          setVehicleFeedback(vehicleData.feedback || []);
        }

        // Fetch symptom patterns
        const patternsResponse = await fetch('/api/admin/patterns');
        if (patternsResponse.ok) {
          const patternsData = await patternsResponse.json();
          setSymptomPatterns(patternsData.patterns || []);
        }

        // Fetch issue reports
        const reportsResponse = await fetch('/api/admin/reports');
        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json();
          setIssueReports(reportsData.reports || []);
        }

        // Fetch cost data
        const costsResponse = await fetch('/api/admin/costs');
        if (costsResponse.ok) {
          const costsData = await costsResponse.json();
          setCostData(costsData);
        }

        // Fetch recommendations needing review
        const reviewResponse = await fetch('/api/admin/recommendations');
        if (reviewResponse.ok) {
          const reviewData = await reviewResponse.json();
          setReviewRecommendations(reviewData.issues || []);
        }

        // Fetch affiliate stats
        const affiliateResponse = await fetch('/api/admin/affiliates/track');
        if (affiliateResponse.ok) {
          const affiliateData = await affiliateResponse.json();
          setAffiliateStats(affiliateData);
        }

        // Fetch guide cache data
        const guidesResponse = await fetch('/api/admin/guides');
        if (guidesResponse.ok) {
          const guidesData = await guidesResponse.json();
          setGuideCacheData(guidesData);
        }
      } catch {
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/og-image.png"
              alt="Au7o mascot"
              width={28}
              height={28}
              className="rounded-lg"
            />
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              Au<span className="text-blue-600">7</span>o
            </span>
          </Link>
          <span className="text-sm text-gray-500">Admin</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('emails')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'emails'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Interest Emails ({emails.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-green-700 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Signups ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'feedback'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Feedback ({feedback.length})
          </button>
          <button
            onClick={() => setActiveTab('vehicle')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'vehicle'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Vehicle Corrections ({vehicleFeedback.length})
          </button>
          <button
            onClick={() => setActiveTab('patterns')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'patterns'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Symptom Patterns ({symptomPatterns.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'reports'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Issue Reports ({issueReports.length})
          </button>
          <button
            onClick={() => setActiveTab('costs')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'costs'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            API Costs {costData ? `($${costData.summary.totalCost.toFixed(2)})` : ''}
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'review'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Review Recommendations ({reviewRecommendations.length})
          </button>
          <button
            onClick={() => setActiveTab('affiliates')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'affiliates'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            🛒 Affiliate Stats {affiliateStats ? `(${affiliateStats.totalClicks} clicks)` : ''}
          </button>
          <button
            onClick={() => setActiveTab('guides')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'guides'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Guide Cache {guideCacheData ? `(${guideCacheData.stats.totalCached})` : ''}
          </button>
        </div>

        {loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            Loading...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && activeTab === 'emails' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {emails.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No emails submitted yet
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interested in</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last emailed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Removed</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {emails.map((entry) => (
                    <tr key={entry.id} className={`hover:bg-gray-50 ${entry.unsubscribedAt ? 'opacity-50' : ''}`}>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{entry.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{formatLeadContext(entry.context)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {entry.lastNotifiedAt ? new Date(entry.lastNotifiedAt).toLocaleDateString() : <span className="text-gray-400">Never</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {entry.unsubscribedAt ? new Date(entry.unsubscribedAt).toLocaleDateString() : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        {entry.unsubscribedAt ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">Unsubscribed</span>
                        ) : (
                          <button
                            onClick={() => removeEmail(entry)}
                            disabled={removingEmailId === entry.id}
                            className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-40"
                          >
                            {removingEmailId === entry.id ? 'Removing…' : 'Remove'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {!loading && !error && activeTab === 'users' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {users.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No account signups yet
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Signed up</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Via</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Vehicles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(u.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {u.email}
                        {u.name && <span className="text-gray-400"> · {u.name}</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">{u.provider}</td>
                      <td className="px-6 py-4 text-sm">
                        {u.subscriptionStatus === 'active' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 capitalize">{u.tier || 'paid'}</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">free</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600">{u.vehicleCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {!loading && !error && activeTab === 'feedback' && (
          <div className="space-y-4">
            {feedback.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                No feedback submitted yet
              </div>
            ) : (
              feedback.map((entry) => (
                <div key={entry.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      entry.type === 'bug' ? 'bg-red-100 text-red-700' :
                      entry.type === 'feature' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {entry.type}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                    {entry.email && (
                      <span className="text-sm text-gray-500">
                        from {entry.email}
                      </span>
                    )}
                    <button
                      onClick={() => removeFeedback(entry)}
                      disabled={removingFeedbackId === entry.id}
                      className="ml-auto text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-40"
                    >
                      {removingFeedbackId === entry.id ? 'Dismissing…' : 'Dismiss'}
                    </button>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{entry.message}</p>
                  {entry.email && (
                    <div className="mt-3">
                      {sentReplyIds.has(entry.id) ? (
                        <span className="text-xs font-medium text-green-600">✓ Reply sent to {entry.email}</span>
                      ) : replyingId === entry.id ? (
                        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                          <div className="text-xs text-gray-500 mb-2">Reply to <span className="font-medium">{entry.email}</span> (sent from au7o; their reply comes back to you)</div>
                          <textarea
                            autoFocus
                            value={replyDraft[entry.id] || ''}
                            onChange={(e) => setReplyDraft((prev) => ({ ...prev, [entry.id]: e.target.value }))}
                            rows={4}
                            placeholder="Type your reply…"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                          />
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => sendReply(entry)}
                              disabled={sendingReplyId === entry.id || !(replyDraft[entry.id] || '').trim()}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-40"
                            >
                              {sendingReplyId === entry.id ? 'Sending…' : 'Send reply'}
                            </button>
                            <button
                              onClick={() => setReplyingId(null)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingId(entry.id)}
                          className="inline-block text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          Reply by email →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {!loading && !error && activeTab === 'vehicle' && (
          <div className="space-y-4">
            {vehicleFeedback.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                No vehicle corrections submitted yet
              </div>
            ) : (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-amber-800">
                    <strong>Use these corrections</strong> to improve the AI prompt in{' '}
                    <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">
                      src/app/api/vehicle/validate/route.ts
                    </code>
                  </p>
                </div>
                {vehicleFeedback.slice().reverse().map((entry, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">User Input</p>
                        <p className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded">
                          {entry.userInput}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">AI Parsed As</p>
                        <p className="text-red-700 font-mono text-sm bg-red-50 p-2 rounded">
                          {entry.aiParsed.year} {entry.aiParsed.make} {entry.aiParsed.model}
                          {entry.aiParsed.trim && ` ${entry.aiParsed.trim}`}
                          {entry.aiParsed.engine && ` (${entry.aiParsed.engine})`}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">User Correction</p>
                      <p className="text-green-700 font-mono text-sm bg-green-50 p-2 rounded">
                        {entry.userCorrection}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {!loading && !error && activeTab === 'patterns' && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                <strong>Symptom Patterns</strong> are aggregated from anonymous chat conversations.
                Use these to identify common issues and create new Known Issues.
              </p>
            </div>
            {symptomPatterns.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                No symptom patterns captured yet. Patterns will appear as users chat about vehicle issues.
              </div>
            ) : (
              symptomPatterns.map((pattern) => (
                <div key={pattern.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        pattern.status === 'approved' ? 'bg-green-100 text-green-700' :
                        pattern.status === 'dismissed' ? 'bg-gray-100 text-gray-500' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {pattern.status}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {pattern.vehicle.year} {pattern.vehicle.make} {pattern.vehicle.model}
                        {pattern.vehicle.trim && ` ${pattern.vehicle.trim}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium">
                        {pattern.count} occurrences
                      </span>
                      <span>Last: {new Date(pattern.lastSeen).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {pattern.diagnosisTitle && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Diagnosis</p>
                      <p className="text-gray-900 font-medium">{pattern.diagnosisTitle}</p>
                    </div>
                  )}

                  {pattern.symptoms.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Symptoms</p>
                      <div className="flex flex-wrap gap-2">
                        {pattern.symptoms.map((symptom, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {pattern.obdCodes.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">OBD Codes</p>
                      <div className="flex flex-wrap gap-2">
                        {pattern.obdCodes.map((code, i) => (
                          <span key={i} className="px-2 py-1 bg-red-50 text-red-700 text-sm rounded font-mono">
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {!loading && !error && activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Issue Reports</strong> are submitted by users via the &quot;I have this issue too&quot; button.
                Review these to identify trends and validate Known Issues.
              </p>
            </div>
            {issueReports.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                No issue reports submitted yet.
              </div>
            ) : (
              issueReports.slice().reverse().map((report) => (
                <div key={report.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        report.severity === 'high' ? 'bg-red-100 text-red-700' :
                        report.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {report.severity}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {report.vehicle.year} {report.vehicle.make} {report.vehicle.model}
                        {report.vehicle.trim && ` ${report.vehicle.trim}`}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(report.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-gray-700 whitespace-pre-wrap mb-3">{report.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {report.mileage && (
                      <span>Mileage: {report.mileage.toLocaleString()}</span>
                    )}
                    {report.existingIssueId && (
                      <span className="text-purple-600">
                        Related to existing issue
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && !error && activeTab === 'costs' && (
          <div className="space-y-6">
            {/* Budget Warning Banner */}
            {costData?.warning.warning && (
              <div className={`rounded-lg p-4 ${
                costData.warning.level === 'exceeded' ? 'bg-red-50 border border-red-200' :
                costData.warning.level === 'high' ? 'bg-orange-50 border border-orange-200' :
                costData.warning.level === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <p className={`text-sm font-medium ${
                  costData.warning.level === 'exceeded' ? 'text-red-800' :
                  costData.warning.level === 'high' ? 'text-orange-800' :
                  costData.warning.level === 'medium' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>
                  {costData.warning.message}
                </p>
              </div>
            )}

            {/* Budget Overview */}
            {costData && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {costData.budgetStatus.monthName} Budget
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Used</span>
                    <span className="font-medium text-gray-900">
                      ${costData.budgetStatus.used.toFixed(2)} / ${costData.budgetStatus.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full ${
                        costData.budgetStatus.percent >= 100 ? 'bg-red-500' :
                        costData.budgetStatus.percent >= 75 ? 'bg-orange-500' :
                        costData.budgetStatus.percent >= 50 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, costData.budgetStatus.percent)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{costData.budgetStatus.percent.toFixed(1)}% used</span>
                    <span className="text-gray-500">{costData.budgetStatus.daysRemaining} days remaining</span>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            {costData && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Total Calls</p>
                  <p className="text-2xl font-semibold text-gray-900">{costData.stats.totalCalls}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Avg Cost/Call</p>
                  <p className="text-2xl font-semibold text-gray-900">${costData.stats.avgCostPerCall.toFixed(4)}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Daily Avg</p>
                  <p className="text-2xl font-semibold text-gray-900">${costData.stats.dailyAverage.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Projected</p>
                  <p className={`text-2xl font-semibold ${
                    costData.stats.projectedMonthly > costData.budgetStatus.total ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    ${costData.stats.projectedMonthly.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Cost by Feature */}
            {costData && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost by Feature</h2>
                <div className="space-y-3">
                  {Object.entries(costData.summary.byFeature)
                    .filter(([, cost]) => cost > 0)
                    .sort(([, a], [, b]) => b - a)
                    .map(([feature, cost]) => (
                      <div key={feature} className="flex items-center justify-between">
                        <span className="text-gray-700 capitalize">{feature.replace(/_/g, ' ')}</span>
                        <span className="font-medium text-gray-900">${cost.toFixed(2)}</span>
                      </div>
                    ))}
                  {Object.values(costData.summary.byFeature).every(v => v === 0) && (
                    <p className="text-gray-500 text-center py-4">No API costs recorded yet</p>
                  )}
                </div>
              </div>
            )}

            {/* Recent API Calls */}
            {costData && costData.recentEntries.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Recent API Calls</h2>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feature</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tokens</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {costData.recentEntries.map((entry, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-500">
                          {new Date(entry.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-900 capitalize">
                          {entry.feature.replace(/_/g, ' ')}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500">
                          {entry.inputTokens + entry.outputTokens}
                        </td>
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">
                          ${entry.estimatedCost.toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!costData && (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                Unable to load cost data
              </div>
            )}
          </div>
        )}

        {!loading && !error && activeTab === 'review' && (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                <strong>Review AI-Generated Recommendations</strong> - These were auto-generated from issue descriptions.
                Click &quot;Approve&quot; to remove the needsReview flag and make them production-ready.
              </p>
            </div>
            {reviewRecommendations.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                No recommendations needing review. All recommendations have been approved!
              </div>
            ) : (
              reviewRecommendations.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.vehicle}</p>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          setResearchingIssue(item.id);
                          try {
                            const response = await fetch('/api/admin/recommendations/research', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                issueId: item.id,
                                title: item.title,
                                vehicle: item.vehicle,
                                category: item.category,
                                description: item.description
                              }),
                            });
                            if (response.ok) {
                              const data = await response.json();
                              // Refresh the recommendations list
                              const reviewResponse = await fetch('/api/admin/recommendations');
                              if (reviewResponse.ok) {
                                const reviewData = await reviewResponse.json();
                                setReviewRecommendations(reviewData.issues || []);
                              }
                            }
                          } catch (error) {
                            console.error('Error researching:', error);
                          } finally {
                            setResearchingIssue(null);
                          }
                        }}
                        disabled={researchingIssue === item.id}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {researchingIssue === item.id ? '🔍 Researching...' : '🔍 Deep Research'}
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/admin/recommendations', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ issueId: item.id }),
                            });
                            if (response.ok) {
                              // Remove from local state
                              setReviewRecommendations(prev => prev.filter(i => i.id !== item.id));
                            }
                          } catch (error) {
                            console.error('Error approving:', error);
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        ✓ Approve All
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase">Recommendations ({item.recommendations.length} needing review)</p>
                    {item.recommendations.map((rec: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-start gap-2">
                          <span className={`flex-shrink-0 px-1.5 py-0.5 text-xs font-medium rounded ${
                            rec.type === 'part' ? 'bg-purple-100 text-purple-700' :
                            rec.type === 'warning' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {rec.type === 'part' ? 'Part' : rec.type === 'warning' ? 'Warning' : 'Tip'}
                          </span>
                          <span className="text-sm text-gray-700 flex-1">{rec.content}</span>
                        </div>
                        <div className="ml-16 mt-1 space-y-1">
                          {rec.partBrand && (
                            <p className="text-xs text-gray-500">Brand: <span className="font-medium">{rec.partBrand}</span></p>
                          )}
                          {rec.partName && (
                            <p className="text-xs text-gray-500">Product: <span className="font-medium">{rec.partName}</span></p>
                          )}
                          {rec.partNumber && (
                            <p className="text-xs text-gray-500">Part #: <span className="font-mono font-medium">{rec.partNumber}</span></p>
                          )}
                          {rec.amazonLink && (
                            <a
                              href={rec.amazonLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              🛒 Amazon Link {rec.clickCount !== undefined && `(${rec.clickCount} clicks)`}
                            </a>
                          )}
                          {rec.sourceUrl && (
                            <a
                              href={rec.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-700 hover:underline ml-3"
                            >
                              📄 Source
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && !error && activeTab === 'affiliates' && (
          <div className="space-y-4">
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-1">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">{affiliateStats?.totalClicks || 0}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-1">Unique Parts</p>
                <p className="text-2xl font-bold text-gray-900">{affiliateStats?.uniqueParts || 0}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-sm text-gray-500 mb-1">Top Part</p>
                <p className="text-sm font-semibold text-gray-900">
                  {affiliateStats?.topParts?.[0]?.name || 'None yet'}
                </p>
                <p className="text-xs text-gray-500">
                  {affiliateStats?.topParts?.[0]?.clicks || 0} clicks
                </p>
              </div>
            </div>

            {/* By Brand + By Vendor — partner-reporting numbers ("we sent N clicks
                to DiabloSport / Mopar", and to which store). */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-3 border-b border-gray-200">
                  <h2 className="text-base font-semibold text-gray-900">Clicks by Brand</h2>
                  <p className="text-xs text-gray-500">What you&apos;re directing people to (show partners)</p>
                </div>
                {affiliateStats?.byBrand?.length ? (
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-100">
                      {affiliateStats.byBrand.map((b: { brand: string; clicks: number }, i: number) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-2.5 text-sm text-gray-900">{b.brand}</td>
                          <td className="px-6 py-2.5 text-sm text-right">
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">{b.clicks}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <div className="p-6 text-center text-gray-400 text-sm">No clicks yet</div>}
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-3 border-b border-gray-200">
                  <h2 className="text-base font-semibold text-gray-900">Clicks by Destination</h2>
                  <p className="text-xs text-gray-500">Which store the click went to</p>
                </div>
                {affiliateStats?.byVendor?.length ? (
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-100">
                      {affiliateStats.byVendor.map((v: { vendor: string; clicks: number }, i: number) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-2.5 text-sm text-gray-900">{v.vendor}</td>
                          <td className="px-6 py-2.5 text-sm text-right">
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{v.clicks}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <div className="p-6 text-center text-gray-400 text-sm">No clicks yet</div>}
              </div>
            </div>

            {/* Top Parts Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Top Affiliate Links</h2>
                <p className="text-sm text-gray-500 mt-1">Track which parts users are most interested in</p>
              </div>
              {affiliateStats?.topParts && affiliateStats.topParts.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicks</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Clicked</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {affiliateStats.topParts.map((part: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          #{index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {part.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {part.brand}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            {part.clicks} clicks
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(part.lastClicked).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No affiliate clicks tracked yet
                </div>
              )}
            </div>

            {/* Recent Clicks */}
            {affiliateStats?.recentClicks && affiliateStats.recentClicks.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Clicks</h2>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Known issue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {affiliateStats.recentClicks.map((click: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-500 whitespace-nowrap">
                          {new Date(click.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-900">
                          {click.partName}
                          {click.partBrand && <span className="text-gray-400"> · {click.partBrand}</span>}
                        </td>
                        <td className="px-6 py-3 text-sm">
                          {click.issueId ? (
                            <a href={`/known-issues/${click.issueId}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline max-w-[220px] inline-block truncate align-bottom">{click.issueId}</a>
                          ) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-6 py-3 text-sm">
                          {click.deepLinked ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">✓ Deep link</span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Search — fix</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* FIX LIST — known issues whose clicks landed on SEARCH links (not
                a product page). These are the pages to upgrade to a verified /dp/
                deep link (and whose clickers could be notified once fixed). */}
            {affiliateStats?.needsDeepLink?.length > 0 && (
              <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-amber-200 bg-amber-50">
                  <h2 className="text-lg font-semibold text-amber-900">🔧 Needs deep-link fix ({affiliateStats.searchLinkedClicks} of {affiliateStats.totalClicks} clicks hit search pages)</h2>
                  <p className="text-sm text-amber-700 mt-1">These issue pages got clicks but sent people to an Amazon search, not the product. Upgrade them to a verified /dp/ link — biggest conversion lever.</p>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Known issue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last part clicked</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Search clicks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {affiliateStats.needsDeepLink.map((n: { issueId: string; searchClicks: number; lastPart: string }, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm">
                          <a href={`/known-issues/${n.issueId}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{n.issueId}</a>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-700">{n.lastPart || '—'}</td>
                        <td className="px-6 py-3 text-sm text-right">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{n.searchClicks}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {!loading && !error && activeTab === 'guides' && (
          <div className="space-y-6">
            {/* Stats Banner */}
            {guideCacheData && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Cached</p>
                  <p className="text-2xl font-semibold text-gray-900">{guideCacheData.stats.totalCached}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Hit Rate</p>
                  <p className="text-2xl font-semibold text-green-600">{guideCacheData.stats.hitRate.toFixed(1)}%</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Hits / Misses</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {guideCacheData.stats.totalHits} / {guideCacheData.stats.totalMisses}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">$ Saved</p>
                  <p className="text-2xl font-semibold text-green-600">${guideCacheData.stats.totalSavings.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-500">Pending Review</p>
                  <p className="text-2xl font-semibold text-orange-600">{guideCacheData.stats.pendingReview}</p>
                </div>
              </div>
            )}

            {/* Filter Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 flex-wrap">
              <select
                value={guideCacheFilter.status}
                onChange={(e) => setGuideCacheFilter(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Statuses</option>
                <option value="auto-generated">Auto-generated</option>
                <option value="reviewed">Reviewed</option>
                <option value="verified">Verified</option>
              </select>
              <input
                type="text"
                placeholder="Filter by make..."
                value={guideCacheFilter.make}
                onChange={(e) => setGuideCacheFilter(prev => ({ ...prev, make: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder="Filter by type..."
                value={guideCacheFilter.type}
                onChange={(e) => setGuideCacheFilter(prev => ({ ...prev, type: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <button
                onClick={async () => {
                  const params = new URLSearchParams();
                  if (guideCacheFilter.status) params.set('status', guideCacheFilter.status);
                  if (guideCacheFilter.make) params.set('make', guideCacheFilter.make);
                  if (guideCacheFilter.type) params.set('type', guideCacheFilter.type);
                  params.set('page', String(guideCachePage));
                  const res = await fetch(`/api/admin/guides?${params.toString()}`);
                  if (res.ok) {
                    setGuideCacheData(await res.json());
                  }
                }}
                className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700"
              >
                Filter
              </button>
            </div>

            {/* Guide List Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {guideCacheData && guideCacheData.guides.length > 0 ? (
                <>
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">YMMT</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hits</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {guideCacheData.guides.map((g) => (
                        <tr key={g.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate">{g.title}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {g.year} {g.make} {g.model}{g.trim ? ` ${g.trim}` : ''}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{g.maintenanceType.replace(/_/g, ' ')}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                              g.status === 'verified' ? 'bg-green-100 text-green-700' :
                              g.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {g.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{g.hitCount}</td>
                          <td className="px-4 py-3 flex gap-2">
                            <button
                              onClick={async () => {
                                // Fetch full guide JSON for editing
                                const res = await fetch(`/api/admin/guides?status=&make=&type=&page=1`);
                                // We need the full guideJson - fetch the specific guide
                                setEditingGuide(g);
                                setEditGuideStatus(g.status);
                                setEditGuideNotes('');
                                // Fetch full guide to get JSON
                                const fullRes = await fetch(`/api/admin/guides?make=${g.make}&type=${g.maintenanceType}`);
                                if (fullRes.ok) {
                                  const fullData = await fullRes.json();
                                  const fullGuide = fullData.guides.find((fg: CachedGuideEntry) => fg.id === g.id);
                                  if (fullGuide) {
                                    setEditGuideJson(JSON.stringify(fullGuide, null, 2));
                                  }
                                }
                              }}
                              className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Delete cached guide "${g.title}"?`)) {
                                  const res = await fetch('/api/admin/guides', {
                                    method: 'DELETE',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ ids: [g.id] }),
                                  });
                                  if (res.ok) {
                                    setGuideCacheData(prev => prev ? {
                                      ...prev,
                                      guides: prev.guides.filter(x => x.id !== g.id),
                                      total: prev.total - 1,
                                      stats: { ...prev.stats, totalCached: prev.stats.totalCached - 1 },
                                    } : null);
                                  }
                                }
                              }}
                              className="px-3 py-1 text-xs font-medium bg-red-50 text-red-700 rounded hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {guideCacheData.total > guideCacheData.pageSize && (
                    <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Page {guideCacheData.page} of {Math.ceil(guideCacheData.total / guideCacheData.pageSize)}
                        {' '}({guideCacheData.total} total)
                      </span>
                      <div className="flex gap-2">
                        <button
                          disabled={guideCacheData.page <= 1}
                          onClick={async () => {
                            const newPage = guideCachePage - 1;
                            setGuideCachePage(newPage);
                            const params = new URLSearchParams();
                            if (guideCacheFilter.status) params.set('status', guideCacheFilter.status);
                            if (guideCacheFilter.make) params.set('make', guideCacheFilter.make);
                            if (guideCacheFilter.type) params.set('type', guideCacheFilter.type);
                            params.set('page', String(newPage));
                            const res = await fetch(`/api/admin/guides?${params.toString()}`);
                            if (res.ok) setGuideCacheData(await res.json());
                          }}
                          className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                        >
                          Prev
                        </button>
                        <button
                          disabled={guideCacheData.page >= Math.ceil(guideCacheData.total / guideCacheData.pageSize)}
                          onClick={async () => {
                            const newPage = guideCachePage + 1;
                            setGuideCachePage(newPage);
                            const params = new URLSearchParams();
                            if (guideCacheFilter.status) params.set('status', guideCacheFilter.status);
                            if (guideCacheFilter.make) params.set('make', guideCacheFilter.make);
                            if (guideCacheFilter.type) params.set('type', guideCacheFilter.type);
                            params.set('page', String(newPage));
                            const res = await fetch(`/api/admin/guides?${params.toString()}`);
                            if (res.ok) setGuideCacheData(await res.json());
                          }}
                          className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No cached guides yet. Guides are cached automatically when users generate them.
                </div>
              )}
            </div>

            {/* Edit Modal */}
            {editingGuide && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Edit Cached Guide</h2>
                    <button onClick={() => setEditingGuide(null)} className="text-gray-400 hover:text-gray-600 text-xl">
                      &times;
                    </button>
                  </div>

                  {/* Metadata (read-only) */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-600 space-y-1">
                    <p><strong>Cache Key:</strong> {editingGuide.cacheKey}</p>
                    <p><strong>Hits:</strong> {editingGuide.hitCount} | <strong>Version:</strong> {editingGuide.version}</p>
                    <p><strong>Created:</strong> {new Date(editingGuide.createdAt).toLocaleString()}</p>
                  </div>

                  {/* Status */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editGuideStatus}
                      onChange={(e) => setEditGuideStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="auto-generated">Auto-generated</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="verified">Verified</option>
                    </select>
                  </div>

                  {/* Review Notes */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Review Notes</label>
                    <textarea
                      value={editGuideNotes}
                      onChange={(e) => setEditGuideNotes(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Notes about changes made..."
                    />
                  </div>

                  {/* Guide JSON Editor */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guide JSON</label>
                    <textarea
                      value={editGuideJson}
                      onChange={(e) => setEditGuideJson(e.target.value)}
                      rows={16}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setEditingGuide(null)}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={savingGuide}
                      onClick={async () => {
                        setSavingGuide(true);
                        try {
                          let parsedJson;
                          try {
                            parsedJson = JSON.parse(editGuideJson);
                          } catch {
                            alert('Invalid JSON. Please fix syntax errors.');
                            setSavingGuide(false);
                            return;
                          }

                          const res = await fetch('/api/admin/guides', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              id: editingGuide.id,
                              guideJson: parsedJson,
                              status: editGuideStatus,
                              reviewNotes: editGuideNotes || null,
                            }),
                          });

                          if (res.ok) {
                            const data = await res.json();
                            // Update local state
                            setGuideCacheData(prev => prev ? {
                              ...prev,
                              guides: prev.guides.map(g =>
                                g.id === editingGuide.id
                                  ? { ...g, status: editGuideStatus, version: data.guide.version, title: data.guide.title }
                                  : g
                              ),
                            } : null);
                            setEditingGuide(null);
                          } else {
                            const errData = await res.json();
                            alert(`Save failed: ${errData.error}${errData.details ? '\n' + errData.details.join('\n') : ''}`);
                          }
                        } catch (err) {
                          alert('Save failed. Check console for details.');
                          console.error(err);
                        } finally {
                          setSavingGuide(false);
                        }
                      }}
                      className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
                    >
                      {savingGuide ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
