import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { signinHref } from '@/lib/auth-callback';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Welcome to Au7o',
  description: "Set up Au7o — your car's co-pilot.",
};

// Compatibility entry for old links. Account owns enrollment and product routing.
export default async function OnboardingPage() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    redirect(signinHref('/account'));
  }
  redirect('/account');
}
