import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ShowcaseLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user && !session.user.capabilities?.garage) redirect('/account');
  return children;
}
