import Link from 'next/link';
import Image from 'next/image';
import TermlyEmbed from '@/components/consent/TermlyEmbed';
import PolicyFooter from '@/components/shared/PolicyFooter';

export const metadata = {
  title: 'Privacy Policy | Au7o',
  description: 'Privacy Policy for Au7o - How we collect, use, and protect your data',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
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
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <TermlyEmbed dataId="e726c597-24aa-4113-99da-fce3e9bf5a6a" />
      </main>

      <PolicyFooter />
    </div>
  );
}
