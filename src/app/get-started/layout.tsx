import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Started',
  description: 'Enter your vehicle information to get personalized AI-powered repair guides. Scan your VIN or select year, make, model manually.',
  openGraph: {
    title: 'Get Started with Au7o',
    description: 'Enter your vehicle information to get personalized AI-powered repair guides.',
  },
};

export default function GetStartedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
