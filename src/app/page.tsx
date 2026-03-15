import type { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'Au7o - Know Your Car\'s Weak Spots | 2,300+ Documented Vehicle Problems',
  description: 'Browse 2,300+ documented vehicle problems across 500+ models and 20 makes. Symptoms, repair costs, and real solutions from 6M+ owner reports. Free AI-powered DIY repair guides.',
  openGraph: {
    title: 'Au7o - Know Your Car\'s Weak Spots',
    description: 'Browse 2,300+ documented vehicle problems across 500+ models. Symptoms, repair costs, and solutions from real owner reports.',
    url: 'https://au7o.io',
    siteName: 'Au7o',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Au7o - Know Your Car\'s Weak Spots',
    description: '2,300+ documented vehicle problems with symptoms, costs, and DIY solutions.',
  },
  alternates: {
    canonical: 'https://au7o.io',
  },
};

export default function HomePage() {
  return <LandingPage />;
}
