import Link from 'next/link';
import Image from 'next/image';
import TermlyEmbed from '@/components/consent/TermlyEmbed';
import PolicyFooter from '@/components/shared/PolicyFooter';

export const metadata = {
  title: 'Cookie Policy | Au7o',
  description: 'Cookie Policy for Au7o - How we use cookies and similar technologies',
};

export default function CookiesPage() {
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
        <TermlyEmbed dataId="e4393253-ab9f-4656-993e-b9f0694a0330" />
      </main>

      <PolicyFooter />
    </div>
  );
}
