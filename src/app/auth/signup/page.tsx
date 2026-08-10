import { redirect } from 'next/navigation';

/** Public accounts are closed; stale signup links return visitors home. */
export default function SignUpPage() {
  redirect('/');
}
