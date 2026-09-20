import Link from 'next/link';
import AccountPrivacyActions from './AccountPrivacyActions';
import MobileSignOut from './MobileSignOut';
import { SelectedCheckoutClient, type SelectedCheckoutProps } from '@/components/subscribe/SelectedCheckoutClient';

export function EnrollmentCompletion({ email, product, hubHref, billingControls, ...checkout }: SelectedCheckoutProps & {
  email: string; product: 'visual' | 'hub'; hubHref?: string; billingControls?: React.ReactNode;
}) {
  return <main className="min-h-screen bg-[#F7F6F2] px-5 py-10 text-[#0B1220]"><div className="mx-auto grid max-w-xl min-w-0 gap-6 rounded-2xl border border-[#E3DFD4] bg-white p-5 sm:p-8">
    <Link href="/" className="text-xl font-bold">Au7o</Link>
    {product === 'visual' ? <SelectedCheckoutClient {...checkout} /> : <section className="grid gap-4"><h1 className="text-3xl font-semibold">Complete your Hub subscription</h1><p>Your account is ready. Finish your vehicle details and checkout to continue.</p>{checkout.unavailable ? <p role="status">{checkout.unavailable}</p> : <Link className="rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white" href={hubHref || '/subscribe?product=hub'}>Continue with Hub</Link>}</section>}
    {billingControls}
    <details className="min-w-0 border-t border-[#E3DFD4] pt-4">
      <summary className="min-h-11 cursor-pointer font-semibold">Account &amp; billing</summary>
      <div className="grid gap-3 text-sm text-slate-600">
        <p className="break-words">Signed in as <strong>{email}</strong>.</p>
        <p>Your selected plan is {product === 'visual' ? 'Visual' : 'Hub'}. Use the subscription controls above to continue or check your payment status.</p>
        <p>Opening help or the privacy policy does not change your subscription. Privacy, data export, account deletion, and sign out are available below.</p>
      </div>
    </details>
    <nav aria-label="Account help" className="flex flex-wrap gap-5 text-sm font-semibold text-blue-700"><a className="inline-flex min-h-11 items-center underline" href="mailto:support@au7o.io" aria-describedby="enrollment-support-help">Contact support</a><Link className="inline-flex min-h-11 items-center underline" href="/privacy?from=checkout">Privacy policy</Link></nav>
    <p id="enrollment-support-help" className="text-sm text-slate-600">Contact support opens your email app to write to support@au7o.io.</p>
    <details className="min-w-0 border-t border-[#E3DFD4] pt-4"><summary className="min-h-11 cursor-pointer font-semibold">Privacy &amp; Data</summary><AccountPrivacyActions email={email} /></details>
    <MobileSignOut />
  </div></main>;
}
