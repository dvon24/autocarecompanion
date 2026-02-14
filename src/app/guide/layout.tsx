import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Repair Guide',
  description: 'Follow step-by-step repair instructions with progress tracking, safety tips, and parts lists tailored to your vehicle.',
  openGraph: {
    title: 'Step-by-Step Repair Guide | Au7o',
    description: 'Follow detailed repair instructions with progress tracking and safety tips.',
  },
};

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
