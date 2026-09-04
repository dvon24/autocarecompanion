import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Symptom Diagnosis',
  description: 'Describe your car problems and get AI-powered diagnosis. Find out what might be wrong and get repair recommendations.',
  openGraph: {
    title: 'AI Car Symptom Diagnosis | Au7o',
    description: 'Describe your car problems and get AI-powered diagnosis with repair recommendations.',
  },
  // ?make=&model= only prefills the chat — every variant is the same page.
  // Without a canonical Google collected ~80 of them and filed each as
  // "Duplicate without user-selected canonical" (GSC, 2026-09-04), spending
  // crawl budget on a surface that has one indexable version.
  alternates: {
    canonical: 'https://au7o.io/symptom-chat',
  },
};

export default function SymptomChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
