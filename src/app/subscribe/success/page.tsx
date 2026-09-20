import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { PaymentReturnClient } from '@/components/subscribe/PaymentReturnClient';
export const dynamic = 'force-dynamic';
export default async function PaymentReturn({ searchParams }: { searchParams: Promise<{ product?: string; intent?: string; vehicleId?: string }> }) {
  const params = await searchParams;
  const product = params.product === 'hub' || params.intent === 'upgrade' ? 'hub' : 'visual';
  const query = new URLSearchParams({ product, ...(params.vehicleId ? { vehicleId: params.vehicleId } : {}) }).toString();
  const session = await auth();
  if (!session?.user?.id) redirect(`/auth/signin?callbackUrl=${encodeURIComponent(`/subscribe/success?${query}`)}`);
  return <PaymentReturnClient query={query} product={product} />;
}
