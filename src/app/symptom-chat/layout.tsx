import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Symptom Diagnosis',
  description: 'Describe your car problems and get AI-powered diagnosis. Find out what might be wrong and get repair recommendations.',
  openGraph: {
    title: 'AI Car Symptom Diagnosis | Au7o',
    description: 'Describe your car problems and get AI-powered diagnosis with repair recommendations.',
  },
};

export default function SymptomChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
