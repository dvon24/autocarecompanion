import Link from 'next/link';
import Image from 'next/image';
import { FeedbackForm } from '@/components/ui/FeedbackForm';

export const metadata = {
  title: 'Send Feedback | Au7o',
  description: 'Share your feedback to help us improve Au7o',
};

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
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
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">
            Send us feedback
          </h1>
          <p className="text-gray-500">
            Help us make Au7o better. We read every piece of feedback.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <FeedbackForm />
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Your feedback helps us prioritize features and fix issues.
        </p>
      </main>
    </div>
  );
}
