import { redirect } from 'next/navigation';

export default async function MaintenanceRedirectPage({ params }: { params: Promise<{ id:string }> }) {
  const { id } = await params;
  redirect(`/garage/${encodeURIComponent(id)}/records`);
}
