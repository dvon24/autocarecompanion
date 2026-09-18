import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import NotificationPreferences from '@/components/account/NotificationPreferences';

export const dynamic = 'force-dynamic';
export default async function NotificationPreferencesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/signin?callbackUrl=%2Faccount%2Fnotifications');
  return <div style={{minHeight:'100dvh',background:'#FAF7F0',color:'#0F172A'}}><main style={{maxWidth:640,margin:'0 auto',padding:'32px 20px',fontSize:16,lineHeight:1.5}}>
    <Link href="/account" style={{color:'#1D4ED8',display:'inline-block',padding:'10px 0'}}>← Account</Link>
    <h1 style={{fontSize:28,margin:'24px 0'}}>Notification preferences</h1>
    <NotificationPreferences />
  </main></div>;
}
