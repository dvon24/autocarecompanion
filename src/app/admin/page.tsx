'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface EmailEntry {
  timestamp: string;
  email: string;
}

interface FeedbackEntry {
  timestamp: string;
  type: string;
  message: string;
  email: string | null;
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

export default function AdminPage() {
  const [emails, setEmails] = useState<EmailEntry[]>([]);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [vehicleFeedback, setVehicleFeedback] = useState<VehicleFeedback[]>([]);
  const [symptomPatterns, setSymptomPatterns] = useState<SymptomPattern[]>([]);
  const [issueReports, setIssueReports] = useState<IssueReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'emails' | 'feedback' | 'vehicle' | 'patterns' | 'reports'>('emails');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch general admin data
        const response = await fetch('/api/admin/data');
        if (response.ok) {
          const data = await response.json();
          setEmails(data.emails || []);
          setFeedback(data.feedback || []);
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {emails.map((entry, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{entry.email}</td>
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
              feedback.map((entry, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
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
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{entry.message}</p>
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
      </main>
    </div>
  );
}
