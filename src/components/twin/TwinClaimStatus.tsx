import Link from 'next/link';

export function TwinClaimStatus({expired,reason,vehicle='Your vehicle'}:{expired:boolean;reason:string;vehicle?:string}) {
  const unresolved=reason==='existing-transmission-unconfirmed';
  if (reason === 'reservation-canceled') return <div style={{maxWidth:560,padding:28,borderRadius:20,border:'1px solid #DCE3EA',background:'#fff',color:'#172033'}}><h1>This vehicle request was canceled</h1><p>Your account and saved service history are unchanged. Contact support@au7o.io if you want to request this vehicle again.</p><Link href="/account" style={{color:'#1D4ED8'}}>Return to account</Link></div>;
  return <div style={{maxWidth:560,padding:28,borderRadius:20,border:'1px solid #DCE3EA',background:'#fff',textAlign:'center'}}>
    <h1 style={{margin:'0 0 10px',fontSize:28,color:'#172033'}}>{unresolved?'Confirm your saved vehicle transmission':expired?'Your beta access has ended':'Your vehicle twin is not ready yet'}</h1>
    <p style={{margin:0,color:'#667085',lineHeight:1.6}}>{unresolved
      ? `Your saved ${vehicle} still needs its Automatic or Manual transmission confirmed. Contact Au7o for help confirming that existing vehicle before activating this offer. Your mileage, service history and trial clock are unchanged.`
      : expired?'Thanks for testing the Au7o vehicle twin. We will let you know when the next access window opens.':'We will email you when your exact vehicle twin and beta access window are ready.'}</p>
    {unresolved&&<p style={{display:'flex',justifyContent:'center',flexWrap:'wrap',gap:16,margin:'20px 0 0'}}><Link href="/account" style={{padding:12,color:'#1D4ED8'}}>Return to account</Link><Link href="/about" style={{padding:12,color:'#1D4ED8'}}>Contact Au7o</Link></p>}
  </div>;
}
