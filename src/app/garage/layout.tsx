'use client';

import { GarageProvider } from '@/contexts/GarageContext';

export default function GarageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GarageProvider>{children}</GarageProvider>;
}
