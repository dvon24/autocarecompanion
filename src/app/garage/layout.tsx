import { GarageProvider } from '@/contexts/GarageContext';

export default function GarageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The index/settings page retains its account-wide guard. Nested service
  // history checks the exact vehicle, so a beta never gains account-wide rights.
  return <GarageProvider>{children}</GarageProvider>;
}
