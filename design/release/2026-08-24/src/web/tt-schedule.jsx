/* Au7o — the tech tree's Schedule view.
   Desktop: mileage lanes across the top, each hanging a small category tree of part cards.
   Phone: one lane per screen, swiped, with the mileage rail above it.
   Node cards use the tech tree's own vocabulary — thumbnail, label, sub-line.
   Lanes are the 6,000-mi service stops; each item repeats on its own interval and is snapped
   to the nearest stop, which is what a shop actually does. */

const TS_CATS = {
  engine: { label:"Engine",         hex:"#2563EB" },
  brakes: { label:"Brakes",         hex:"#A62B22" },
  tires:  { label:"Tires & Wheels", hex:"#2B3038" },
  drive:  { label:"Drivetrain",     hex:"#6D28D9" },
  wipers: { label:"Glass & Wipers", hex:"#D9822B" },
};
const TS_CAT_ORDER = ["engine","brakes","tires","drive","wipers"];

/* every = owner's-manual interval. node = the tech-tree part this row opens. */
const TS_ITEMS = [
  { id:"oilFluid", cat:"engine", label:"Engine oil & filter",  every:6000,   node:"oilFluid",    cost:44,   mins:45,  src:"0W-40 · MS-12633", qty:"7 qt + filter" },
  { id:"rotate",   cat:"tires",  label:"Tire rotation",        every:6000,   node:"tire",        cost:25,   mins:30,  src:"Front to rear, same size all round", labour:true },
  { id:"binspect", cat:"brakes", label:"Brake inspection",     every:12000,  node:"pads",        cost:0,    mins:20,  src:"Pads, rotors, lines, hoses", labour:true },
  { id:"wipers",   cat:"wipers", label:"Wiper blades",         every:12000,  node:"wipL",        nodes:["wipL","wipR"], cost:36,   mins:10,  src:"Pair · 22\" / 20\"", qty:"×2" },
  { id:"cabin",    cat:"engine", label:"Cabin air filter",     every:20000,  node:"cabinFilter", cost:22,   mins:10,  src:"Behind the glovebox" },
  { id:"air",      cat:"engine", label:"Engine air filter",    every:30000,  node:"airFilter",   cost:28,   mins:15,  src:"Panel · dry media" },
  { id:"bfluid",   cat:"brakes", label:"Brake fluid flush",    every:30000,  node:"brakeFluid",  cost:120,  mins:60,  src:"Or every 2 years, whichever first" },
  { id:"plugs",    cat:"engine", label:"Spark plugs",          every:30000,  node:null,          cost:180,  mins:120, src:"16 plugs on the 392", qty:"×16" },
  { id:"tireset",  cat:"tires",  label:"Tires — full set",     every:40000,  node:"tire",        cost:1196, mins:120, src:"275/40ZR20 · four", qty:"×4" },
  { id:"pads",     cat:"brakes", label:"Front pads & rotors",  every:45000,  node:"pads",        cost:560,  mins:180, src:"6-piston fitment" },
  { id:"trans",    cat:"drive",  label:"Trans fluid & filter", every:60000,  node:"transFluid", nodes:["transFluid","transPan"], cost:340,  mins:120, src:"8HP70 · ZF Lifeguard 8", qty:"7 qt + pan" },
  { id:"axle",     cat:"drive",  label:"Rear axle fluid",      every:60000,  node:null,          cost:120,  mins:60,  src:"Limited-slip additive required" },
  { id:"belt",     cat:"engine", label:"Accessory drive belt", every:60000,  node:null,          cost:145,  mins:90,  src:"Inspect · replace if cracked" },
  { id:"pcv",      cat:"engine", label:"PCV valve",            every:90000,  node:null,          cost:62,   mins:45,  src:"Common oil-consumption cause" },
  { id:"coolant",  cat:"engine", label:"Coolant flush",        every:150000, node:"coolant",     cost:180,  mins:90,  src:"10 yr / 150k from new, then 5 yr", qty:"3 gal" },
];

const TS_STOP = 6000, TS_N = 9;
const tsFmt = n => n.toLocaleString();
const tsK = n => (n % 1000 === 0 ? (n / 1000) + "k" : tsFmt(n));
const tsStops = miles => { const first = Math.floor(miles / TS_STOP) * TS_STOP; return Array.from({ length: TS_N }, (_, i) => first + i * TS_STOP); };
/* exactly one stop is "next" — the first the odometer hasn't reached */
const tsState = (mi, miles) => mi < miles ? "past" : mi < miles + TS_STOP ? "next" : "ahead";
const tsWhen = (mi, miles) => mi < miles ? "behind you" : mi < miles + TS_STOP ? `next up · in ${tsFmt(mi - miles)} mi` : `in ${tsFmt(mi - miles)} mi`;
const tsBig = it => it.every > 12000;
const tsCost = items => items.reduce((s,i) => s + i.cost, 0);
const tsHours = items => Math.round(items.reduce((s,i) => s + i.mins, 0) / 6) / 10;

function tsLanes(miles) {
  const stops = tsStops(miles);
  const hi = stops[stops.length - 1] + TS_STOP / 2, lo = stops[0] - TS_STOP / 2;
  const lanes = stops.map(m => ({ mi:m, items:[] }));
  TS_ITEMS.forEach(it => {
    for (let k = 1; k * it.every <= hi; k++) {
      const at = k * it.every;
      if (at < lo) continue;
      const idx = Math.round((at - stops[0]) / TS_STOP);
      if (idx < 0 || idx >= stops.length) continue;
      lanes[idx].items.push({ ...it, nth:k, at });
    }
  });
  lanes.forEach(l => l.items.sort((a,b) => TS_CAT_ORDER.indexOf(a.cat) - TS_CAT_ORDER.indexOf(b.cat) || a.every - b.every));
  return lanes;
}
const tsGroups = items => TS_CAT_ORDER.map(cid => ({ cid, items: items.filter(i => i.cat === cid) })).filter(g => g.items.length);
const tsNode = it => (it.node ? TT_TREES.car.nodes[it.node] : null);

/* ── Buy list ──
   A lane is a shopping trip. Every item that consumes a part becomes a line with a part number
   and a destination; the part number and vendor come from the tech tree, so the list and the
   tree can't disagree. Items Au7o has no part record for get an honest search line instead of
   an invented number. Labour-only items are held back so the list stays a list of things to buy. */
const TS_CAR_Q = "2015 Dodge Challenger SRT 392";
const tsPrice = (str, fallback) => { const n = parseFloat(String(str || "").replace(/[^0-9.]/g, "")); return isFinite(n) && n > 0 ? n : fallback; };
const tsBuyLine = it => {
  if (!it.cost || it.labour) return null;
  const ids = it.nodes || (it.node ? [it.node] : []);
  const nds = ids.map(id => TT_TREES.car.nodes[id]).filter(nd => nd && ttPartLink(nd));
  if (nds.length) return nds.map(nd => {
    const l = ttPartLink(nd);
    const stocked = nd.stock ? nd.stock.split("·")[0].trim() : null;
    return { key: it.id + "-" + nd.partNo, label:nd.label, note:nd.brand || it.src, partNo:nd.partNo, node:nd,
      vendor: l.name || (stocked ? stocked + " · search" : "Pick a source"), href:l.href,
      price: nds.length > 1 ? tsPrice(nd.price, it.cost / nds.length) : it.cost, qty: nds.length > 1 ? null : it.qty };
  });
  return [{ key:it.id, label:it.label, note:it.src, partNo:null, node:null, vendor:"Part number not on file yet", href:"https://www.google.com/search?q=" + encodeURIComponent(TS_CAR_Q + " " + it.label), price:it.cost, qty:it.qty }];
};
const tsBuyList = items => {
  const lines = items.reduce((a, it) => a.concat(tsBuyLine(it) || []), []);
  const seen = {};
  const buy = lines.filter(l => (seen[l.key] ? false : (seen[l.key] = true)));
  const shop = items.filter(i => !i.cost || i.labour);
  const byVendor = [];
  buy.forEach(l => { let g = byVendor.find(g => g.vendor === l.vendor); if (!g) byVendor.push(g = { vendor:l.vendor, lines:[] }); g.lines.push(l); });
  return { buy, shop, byVendor, total: buy.reduce((s,l) => s + l.price, 0) };
};
const tsListText = (mi, list) => [`Au7o · ${TS_CAR_Q} · ${tsFmt(mi)} mi service`, ""]
  .concat(list.buy.map(l => `- ${l.label}${l.qty ? " (" + l.qty + ")" : ""}${l.partNo ? " · " + l.partNo : ""} · $${tsFmt(l.price)} · ${l.href}`))
  .concat(list.shop.length ? ["", "No parts needed: " + list.shop.map(i => i.label).join(", ")] : [])
  .concat(["", `Parts total $${tsFmt(list.total)}`]).join("\n");

/* One list across the whole car: everything the odometer has already passed plus the next stop,
   deduped, so "what do I actually need to order" is one place instead of a lane-by-lane hunt. */
function tsDueList(miles) {
  const seen = {};
  const items = tsLanes(miles).filter(l => tsState(l.mi, miles) !== "ahead")
    .reduce((a, l) => a.concat(l.items), [])
    .filter(it => (seen[it.id] ? false : (seen[it.id] = true)));
  return { mi: miles, items, all: true, title: "Everything to order",
    note: "Every part the odometer has already passed, plus the stop you're about to hit — one order, one list. Tick what you already have on the shelf." };
}

function TSCart({ mi, items, miles, onClose, sheet, title, note }) {
  const list = React.useMemo(() => tsBuyList(items), [items]);
  const [have, setHave] = React.useState({});
  const [copied, setCopied] = React.useState(false);
  const toggle = k => setHave(h => ({ ...h, [k]:!h[k] }));
  const left = list.buy.filter(l => !have[l.key]);
  const copy = () => { const txt = tsListText(mi, list); if (navigator.clipboard) navigator.clipboard.writeText(txt).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false), 1800); }); };
  const openAll = () => left.forEach((l,i) => setTimeout(()=>window.open(l.href, "_blank", "noopener"), i * 120));
  const head = (
    <div style={{ padding:"12px 14px", borderBottom:"1px solid var(--ki-line)", background:"var(--ki-band)", display:"flex", alignItems:"center", gap:9 }}>
      <span className="eyebrow" style={{ fontSize:10, color:"var(--ki-band-ink)" }}>{title || tsK(mi) + " parts list"}</span>
      <span className="mono" style={{ marginLeft:"auto", fontSize:10, fontWeight:700, color:"var(--ki-band-ink)" }}>{left.length} to buy · ${tsFmt(left.reduce((s,l)=>s+l.price,0))}</span>
      <button onClick={onClose} aria-label="Close parts list" style={{ background:"transparent", border:"none", color:"var(--slate-400)", cursor:"pointer", display:"flex", padding:2 }}><Icon name="x" size={14}/></button>
    </div>
  );
  const body = (
    <div style={{ padding:"12px 14px 4px" }}>
      <div style={{ fontSize:11.5, color:"var(--slate-500)", lineHeight:1.45, textWrap:"pretty" }}>{note || `Everything the ${tsFmt(mi)} mi stop consumes, with the part number and where it's sold. Tick what you already have on the shelf.`}</div>
      {list.byVendor.map(g => (
        <div key={g.vendor} style={{ marginTop:13 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:7 }}>
            <span className="eyebrow" style={{ fontSize:9.5 }}>{g.vendor}</span>
            <span style={{ flex:1, height:1, background:"var(--ki-line)" }}/>
            <span className="mono" style={{ fontSize:9.5, color:"var(--slate-500)" }}>{g.lines.length}</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {g.lines.map(l => {
              const on = !!have[l.key];
              return (
                <div key={l.key} style={{ display:"flex", alignItems:"flex-start", gap:9, padding:"9px 10px", borderRadius:11, background: on ? "var(--ki-page)" : "var(--ki-card)", border:"1px solid var(--ki-line)", opacity: on ? .6 : 1 }}>
                  <button onClick={()=>toggle(l.key)} aria-pressed={on} aria-label={on ? "Mark as needed" : "I already have this"} style={{ flexShrink:0, marginTop:1, width:17, height:17, borderRadius:5, display:"grid", placeItems:"center", cursor:"pointer", background: on ? "var(--ki-ok-ink)" : "transparent", border:`1.5px solid ${on ? "var(--ki-ok-ink)" : "var(--ki-line)"}`, color:"var(--ki-card)", padding:0 }}>
                    {on && <svg width="9" height="9" viewBox="0 0 10 10"><path d="M1.6 5.2l2.2 2.2L8.4 2.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
                  </button>
                  <div style={{ minWidth:0, flex:1 }}>
                    <div style={{ display:"flex", alignItems:"baseline", gap:7 }}>
                      <span style={{ minWidth:0, flex:1, fontSize:12.5, fontWeight:600, letterSpacing:"-0.01em", textDecoration: on ? "line-through" : "none", textWrap:"pretty" }}>{l.label}</span>
                      <span className="mono" style={{ flexShrink:0, fontSize:12, fontWeight:600 }}>${tsFmt(l.price)}</span>
                    </div>
                    <div style={{ fontSize:10.5, color:"var(--slate-500)", marginTop:2, lineHeight:1.4 }}>{l.note}{l.qty ? " · " + l.qty : ""}</div>
                    <div style={{ marginTop:5 }}>
                      {l.node
                        ? <TTPartNo node={l.node} size={11} weight={600}/>
                        : <a href={l.href} target="_blank" rel="noreferrer noopener" style={{ fontSize:11, fontWeight:600, color:"var(--au7o-blue-600)", textDecoration:"underline", textDecorationStyle:"dotted", textUnderlineOffset:3 }}>Find the part number</a>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {list.shop.length > 0 && (
        <div style={{ marginTop:13, padding:"10px 12px", borderRadius:11, background:"var(--ki-page)", border:"1px solid var(--ki-line)" }}>
          <div className="eyebrow" style={{ fontSize:9.5 }}>Nothing to buy</div>
          <div style={{ fontSize:11.5, color:"var(--slate-500)", marginTop:4, lineHeight:1.45 }}>{list.shop.map(i => i.label).join(" · ")} — labour or inspection only, no parts to order.</div>
        </div>
      )}
    </div>
  );
  const foot = (
    <div style={{ flexShrink:0, borderTop:"1px solid var(--ki-line)", padding:"11px 14px 13px", display:"flex", flexDirection:"column", gap:8 }}>
      <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
        <span style={{ fontSize:11, color:"var(--slate-500)" }}>Parts still to buy</span>
        <span className="mono" style={{ marginLeft:"auto", fontSize:16, fontWeight:700, letterSpacing:"-0.02em" }}>${tsFmt(left.reduce((s,l)=>s+l.price,0))}</span>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={copy} style={{ flex:"0 0 auto", minHeight:40, padding:"0 13px", borderRadius:11, border:"1px solid var(--ki-line)", background:"var(--ki-card)", color:"var(--ink)", fontFamily:"var(--font-sans)", fontSize:12.5, fontWeight:600, cursor:"pointer" }}>{copied ? "Copied" : "Copy list"}</button>
        <button onClick={openAll} disabled={!left.length} style={{ flex:1, minHeight:40, borderRadius:11, border:"none", background: left.length ? "var(--ink)" : "var(--ki-line)", color: left.length ? "var(--ki-card)" : "var(--slate-400)", fontFamily:"var(--font-sans)", fontSize:12.5, fontWeight:600, cursor: left.length ? "pointer" : "default", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>Open {left.length || ""} {left.length === 1 ? "link" : "links"}</button>
      </div>
    </div>
  );
  if (sheet) return (
    <div style={{ position:"absolute", inset:0, zIndex:24, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(11,18,32,.42)" }}/>
      <div className="tt-rise" style={{ position:"relative", maxHeight:"86%", margin:"0 9px 9px", background:"var(--ki-card)", border:"1px solid var(--ki-line)", borderRadius:22, display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 -18px 44px rgba(11,18,32,.26)" }}>
        {head}
        <div className="web-scroll" style={{ flex:1, minHeight:0, overflowY:"auto" }}>{body}</div>
        {foot}
      </div>
    </div>
  );
  return (
    <aside style={{ width:322, flex:"0 0 322px", borderLeft:"1px solid var(--ki-line)", background:"var(--ki-card)", display:"flex", flexDirection:"column", minHeight:0 }}>
      {head}
      <div className="web-scroll" style={{ flex:1, minHeight:0, overflowY:"auto" }}>{body}</div>
      {foot}
    </aside>
  );
}

/* the lane's own trigger — the list is a property of a mileage stop, not a separate place */
function TSCartButton({ lane, onOpen, next, wide }) {
  const n = tsBuyList(lane.items).buy.length;
  if (!n) return null;
  return (
    <button onClick={e => { e.stopPropagation(); onOpen(lane); }} style={{ width: wide ? "100%" : "auto", marginTop:8, minHeight: wide ? 40 : 28, padding: wide ? "0 12px" : "0 9px", borderRadius:9, cursor:"pointer", fontFamily:"var(--font-sans)", fontSize: wide ? 12.5 : 10.5, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
      background: next ? "rgba(255,255,255,.16)" : "var(--ki-page)", color: next ? "#fff" : "var(--ink)", border:`1px solid ${next ? "rgba(255,255,255,.35)" : "var(--ki-line)"}` }}>
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 2h1.7l1.6 6.4h6.1l1.6-4.6H4"/><circle cx="5.6" cy="11.4" r="1.1"/><circle cx="10.6" cy="11.4" r="1.1"/></svg>
      Parts list · {n}
    </button>
  );
}

/* ── the part card — the tech tree's node, in flow ── */
function TSNode({ item, selected, onPick, dense }) {
  const nd = tsNode(item);
  const thumb = dense ? 30 : 34;
  return (
    <button onClick={()=>onPick(item)} style={{ position:"relative", width:"100%", minHeight: dense ? 52 : 56, textAlign:"left", cursor:"pointer", fontFamily:"var(--font-sans)", color:"var(--ink)",
      display:"flex", alignItems:"center", gap: dense ? 9 : 10, padding: dense ? "8px 10px" : "9px 11px", borderRadius:13, background:"var(--ki-card)",
      border:`${selected ? 2 : 1}px solid ${selected ? "var(--ink)" : "var(--ki-line)"}`, boxShadow: selected ? "0 0 0 3px color-mix(in oklab, var(--ink) 12%, transparent)" : "var(--shadow-1)" }}>
      <span style={{ position:"absolute", left:-13, top:"50%", width:13, height:1.5, background:"var(--ki-line)" }}/>
      <span style={{ position:"relative", width:thumb, height:thumb, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span style={{ position:"absolute", inset:0, borderRadius:9, overflow:"hidden", background: nd && nd.img ? "#0d1017" : "var(--ki-page)", border:"1px solid var(--ki-line)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          {nd && nd.img
            ? <img src={ttThumb(nd.img)} alt="" draggable="false" style={{ width:"126%", height:"126%", objectFit:"contain", filter:"brightness(1.55) contrast(1.1)" }}/>
            : <Icon name="wrench" size={14} style={{ color:"var(--slate-400)" }}/>}
        </span>
      </span>
      <span style={{ minWidth:0, flex:1 }}>
        <span style={{ display:"block", fontSize: dense ? 12.5 : 12, fontWeight:600, letterSpacing:"-0.01em", lineHeight:1.25, textWrap:"pretty" }}>{item.label}</span>
        <span className="mono" style={{ display:"block", fontSize:9.5, color:"var(--slate-500)", marginTop:2 }}>↻ every {tsK(item.every)}{item.cost ? " · $" + tsFmt(item.cost) : " · check"}</span>
      </span>
    </button>
  );
}

/* ── Desktop · lanes over the tree ── */
function TSDesktop({ miles, picked, onPick, onCart }) {
  const lanes = tsLanes(miles);
  return (
    <div className="web-scroll dotted-grid" style={{ flex:1, minHeight:0, overflow:"auto", background:"var(--ki-page)" }}>
      <div style={{ display:"flex", alignItems:"flex-start", minWidth:"max-content", paddingBottom:24 }}>
        {lanes.map((l, li) => {
          const st = tsState(l.mi, miles), next = st === "next";
          return (
            <div key={l.mi} style={{ flex:"0 0 230px", position:"relative", opacity: st === "past" ? .55 : 1 }}>
              <div style={{ position:"absolute", inset:0, background: next ? "color-mix(in oklab, var(--au7o-blue) 6%, transparent)" : li % 2 ? "color-mix(in oklab, var(--ink) 2.5%, transparent)" : "transparent", borderLeft: next ? "2px solid var(--au7o-blue)" : "1px solid var(--ki-line)", pointerEvents:"none" }}/>
              <div style={{ position:"sticky", top:0, zIndex:3, margin:"0 11px", padding:"11px 12px", background: next ? "var(--au7o-blue)" : "var(--ki-card)", color: next ? "#fff" : "var(--ink)", border:`1.5px solid ${next ? "var(--au7o-blue)" : "var(--ki-line)"}`, borderRadius:12, boxShadow:"var(--shadow-1)" }}>
                <div className="mono" style={{ fontSize:17, fontWeight:700, letterSpacing:"-0.03em" }}>{tsK(l.mi)}</div>
                <div style={{ fontSize:9.5, color: next ? "rgba(255,255,255,.82)" : "var(--slate-500)", marginTop:1 }}>{tsWhen(l.mi, miles)} · <span className="mono">${tsFmt(tsCost(l.items))}</span></div>
                <TSCartButton lane={l} onOpen={onCart} next={next}/>
              </div>
              <div style={{ position:"relative", padding:"14px 11px 0", display:"flex", flexDirection:"column", gap:13 }}>
                {tsGroups(l.items).map(g => {
                  const c = TS_CATS[g.cid];
                  return (
                    <div key={g.cid}>
                      <div style={{ display:"flex", alignItems:"center", gap:7, padding:"5px 9px", borderRadius:9, background:"color-mix(in oklab, " + c.hex + " 11%, var(--ki-card))", border:`1px solid color-mix(in oklab, ${c.hex} 30%, transparent)` }}>
                        <span style={{ width:7, height:7, borderRadius:"50%", background:c.hex, flexShrink:0 }}/>
                        <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", color:c.hex }}>{c.label}</span>
                      </div>
                      <div style={{ position:"relative", marginLeft:13, paddingLeft:13, paddingTop:8, display:"flex", flexDirection:"column", gap:6 }}>
                        <span style={{ position:"absolute", left:0, top:0, bottom:16, width:1.5, background:`color-mix(in oklab, ${c.hex} 26%, transparent)` }}/>
                        {g.items.map(it => <TSNode key={it.id} item={it} selected={picked && picked.id === it.id} onPick={onPick}/>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Phone · one lane per screen, swiped ── */
function TSPhone({ miles, picked, onPick, onCart }) {
  const lanes = tsLanes(miles);
  const nextIdx = Math.max(0, lanes.findIndex(l => tsState(l.mi, miles) === "next"));
  const [idx, setIdx] = React.useState(nextIdx);
  const trackRef = React.useRef(null);
  const lock = React.useRef(true);
  React.useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el || !el.clientWidth) return;
    el.scrollLeft = nextIdx * el.clientWidth;
    const t = setTimeout(() => { lock.current = false; }, 60);
    return () => clearTimeout(t);
  }, []);
  const goTo = i => { setIdx(i); const el = trackRef.current; if (el) { lock.current = true; el.scrollTo({ left: i * el.clientWidth, behavior:"smooth" }); setTimeout(() => { lock.current = false; }, 420); } };
  const onScroll = e => { if (lock.current) return; const el = e.currentTarget; const i = Math.round(el.scrollLeft / el.clientWidth); if (i !== idx) setIdx(i); };
  return (
    <div style={{ flex:1, minWidth:0, minHeight:0, display:"flex", flexDirection:"column", background:"var(--ki-page)" }}>
      <div className="web-scroll" style={{ flexShrink:0, minWidth:0, display:"flex", gap:7, overflowX:"auto", padding:"10px 14px 11px", background:"var(--ki-card)", borderBottom:"1px solid var(--ki-line)" }}>
        {lanes.map((ln, i) => {
          const st = tsState(ln.mi, miles), on = i === idx;
          return (
            <button key={ln.mi} onClick={()=>goTo(i)} style={{ flexShrink:0, minWidth:62, minHeight:46, padding:"6px 10px", borderRadius:12, cursor:"pointer", fontFamily:"var(--font-sans)", textAlign:"left",
              background: on ? "var(--ink)" : st === "next" ? "color-mix(in oklab, var(--au7o-blue) 12%, var(--ki-page))" : "var(--ki-page)",
              color: on ? "var(--ki-card)" : st === "past" ? "var(--slate-400)" : "var(--ink)",
              border:`1.5px solid ${on ? "var(--ink)" : st === "next" ? "color-mix(in oklab, var(--au7o-blue) 45%, transparent)" : "var(--ki-line)"}` }}>
              <div className="mono" style={{ fontSize:14.5, fontWeight:700, letterSpacing:"-0.03em" }}>{tsK(ln.mi)}</div>
              <div style={{ fontSize:9, opacity:.72, marginTop:1 }}>{ln.items.length} items</div>
            </button>
          );
        })}
      </div>
      <div ref={trackRef} onScroll={onScroll} className="web-scroll" style={{ flex:1, minWidth:0, minHeight:0, display:"flex", overflowX:"auto", overflowY:"hidden", scrollSnapType:"x mandatory" }}>
        {lanes.map(ln => (
          <div key={ln.mi} className="web-scroll" style={{ flex:"0 0 100%", scrollSnapAlign:"start", overflowY:"auto", padding:"12px 14px 22px", minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:8, flexWrap:"wrap" }}>
              <span className="mono" style={{ fontSize:22, fontWeight:700, letterSpacing:"-0.04em" }}>{tsFmt(ln.mi)}</span>
              <span style={{ fontSize:12, color:"var(--slate-500)" }}>mi · {tsWhen(ln.mi, miles)}</span>
            </div>
            <div className="mono" style={{ display:"flex", alignItems:"center", gap:9, marginTop:8, fontSize:11.5, fontWeight:600, color:"var(--slate-500)", flexWrap:"wrap" }}>
              <span style={{ color:"var(--ink)" }}>${tsFmt(tsCost(ln.items))}</span>
              <span style={{ width:3, height:3, borderRadius:"50%", background:"var(--slate-400)" }}/>
              <span>{tsHours(ln.items)} h</span>
              <span style={{ width:3, height:3, borderRadius:"50%", background:"var(--slate-400)" }}/>
              <span>{ln.items.length} items</span>
            </div>
            <TSCartButton lane={ln} onOpen={onCart} wide/>
            {tsGroups(ln.items).map(g => {
              const c = TS_CATS[g.cid];
              return (
                <div key={g.cid} style={{ marginTop:13 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8 }}>
                    <span style={{ width:8, height:8, borderRadius:2, background:c.hex }}/>
                    <span style={{ fontSize:10, fontWeight:700, letterSpacing:".06em", textTransform:"uppercase", color:c.hex }}>{c.label}</span>
                    <span style={{ flex:1, height:1, background:`color-mix(in oklab, ${c.hex} 22%, transparent)` }}/>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                    {g.items.map(it => <TSNode key={it.id} item={it} dense selected={picked && picked.id === it.id} onPick={onPick}/>)}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Detail — drawer on desktop, sheet on the phone ── */
function TSDetail({ item, miles, onClose, sheet }) {
  if (!item) return null;
  const nd = tsNode(item);
  const c = TS_CATS[item.cat];
  const rows = [["Interval", "every " + tsK(item.every)], ["Parts", item.cost ? "$" + tsFmt(item.cost) : "Inspection"], ["Labour", item.mins + " min"], ["Next", tsFmt(Math.ceil((miles + 1) / item.every) * item.every) + " mi"]];
  const body = (
    <React.Fragment>
      {nd && nd.img && (
        <div style={{ height:118, background:"#0d1017", borderRadius: sheet ? 16 : 0, border: sheet ? "1px solid var(--ki-line)" : "none", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", padding:14, marginBottom: sheet ? 12 : 0 }}>
          <img src={nd.img} alt="" style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain", filter:"brightness(1.45)" }}/>
        </div>
      )}
      <div style={{ padding: sheet ? 0 : "13px 15px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ width:8, height:8, borderRadius:2, background:c.hex }}/>
          <span className="eyebrow" style={{ fontSize:9.5, color:c.hex }}>{c.label}</span>
        </div>
        <div style={{ fontSize: sheet ? 17.5 : 16.5, fontWeight:600, letterSpacing:"-0.02em", marginTop:6, textWrap:"pretty" }}>{item.label}</div>
        <div style={{ fontSize:12.5, color:"var(--slate-500)", marginTop:2 }}>{item.src}</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:13 }}>
          {rows.map(([k,v]) => (
            <div key={k} style={{ padding:"9px 10px", borderRadius:11, background:"var(--ki-page)", border:"1px solid var(--ki-line)" }}>
              <div style={{ fontSize:8.5, fontWeight:600, letterSpacing:".07em", textTransform:"uppercase", color:"var(--slate-500)" }}>{k}</div>
              <div className="mono" style={{ fontSize:12.5, fontWeight:600, marginTop:2 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:13 }}>
          <div className="eyebrow" style={{ fontSize:9.5, marginBottom:7 }}>Repeats at</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
            {[1,2,3,4].map(k => item.every * k).map(m => (
              <span key={m} className="mono" style={{ fontSize:10, fontWeight:600, padding:"4px 9px", borderRadius:999, background: m <= miles ? "var(--ki-ok-bg)" : "var(--ki-page)", color: m <= miles ? "var(--ki-ok-ink)" : "var(--slate-700)", border:"1px solid var(--ki-line)" }}>{tsK(m)}</span>
            ))}
          </div>
        </div>
        {nd && (
          <div style={{ marginTop:13, padding:"11px 12px", borderRadius:11, background:"var(--ki-page)", border:"1px solid var(--ki-line)" }}>
            <div className="eyebrow" style={{ fontSize:9.5 }}>In the tech tree</div>
            <div style={{ fontSize:12.5, fontWeight:600, marginTop:5 }}>{nd.label}</div>
            <div style={{ fontSize:11, color:"var(--slate-500)", marginTop:2, lineHeight:1.45 }}>{nd.where}</div>
            {nd.partNo && nd.partNo !== "—" && <div className="mono" style={{ fontSize:10, marginTop:6, fontWeight:600 }}>{nd.partNo}</div>}
          </div>
        )}
        {nd && nd.issue && (
          <div style={{ marginTop:10, padding:"11px 12px", borderRadius:11, background:"var(--ki-crit-bg)" }}>
            <div className="eyebrow" style={{ fontSize:9.5, color:"var(--ki-crit)" }}>Known issue</div>
            <div style={{ fontSize:12, lineHeight:1.5, marginTop:5, textWrap:"pretty" }}>{nd.issue}</div>
          </div>
        )}
        {!nd && (
          <div style={{ marginTop:13, padding:"11px 12px", borderRadius:11, background:"var(--ki-mod-bg)", color:"var(--ki-mod-ink)", fontSize:11.5, lineHeight:1.45 }}>
            Not in the tech tree yet — owner's manual schedule only.
          </div>
        )}
      </div>
    </React.Fragment>
  );
  if (sheet) return (
    <div style={{ position:"absolute", inset:0, zIndex:20, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(11,18,32,.42)" }}/>
      <div className="tt-rise" style={{ position:"relative", maxHeight:"80%", margin:"0 9px 9px", background:"var(--ki-card)", border:"1px solid var(--ki-line)", borderRadius:22, display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 -18px 44px rgba(11,18,32,.26)" }}>
        <div style={{ flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", padding:"9px 0 3px" }}><span style={{ width:38, height:4, borderRadius:999, background:"var(--ki-line)" }}/></div>
        <div className="web-scroll" style={{ flex:1, minHeight:0, overflowY:"auto", padding:"6px 15px 14px" }}>{body}</div>
        <div style={{ flexShrink:0, borderTop:"1px solid var(--ki-line)", padding:"11px 14px 13px" }}>
          <button onClick={onClose} style={{ width:"100%", minHeight:46, background:"var(--ki-card)", border:"1px solid var(--ki-line)", borderRadius:12, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"var(--font-sans)", color:"var(--ink)" }}>Close</button>
        </div>
      </div>
    </div>
  );
  return (
    <aside style={{ width:300, flex:"0 0 300px", borderLeft:"1px solid var(--ki-line)", background:"var(--ki-card)", display:"flex", flexDirection:"column", minHeight:0 }}>
      <div style={{ padding:"12px 14px", borderBottom:"1px solid var(--ki-line)", background:"var(--ki-band)", display:"flex", alignItems:"center", gap:9 }}>
        <span className="eyebrow" style={{ fontSize:10, color:"var(--ki-band-ink)" }}>Service item</span>
        <button onClick={onClose} style={{ marginLeft:"auto", background:"transparent", border:"none", color:"var(--slate-400)", cursor:"pointer", display:"flex", padding:2 }}><Icon name="x" size={14}/></button>
      </div>
      <div className="web-scroll" style={{ flex:1, minHeight:0, overflowY:"auto" }}>{body}</div>
    </aside>
  );
}

/* ── The view the tech tree mounts ── */
function TTSchedule({ miles, phone, startStop, startList }) {
  const [picked, setPicked] = React.useState(null);
  const [cart, setCart] = React.useState(null);
  const openCart = lane => { setPicked(null); setCart(lane); };
  React.useEffect(() => {
    if (!startList && startStop == null) return;
    if (startStop === "all") { setCart(tsDueList(miles)); return; }
    const lanes = tsLanes(miles);
    const want = startStop != null ? Number(startStop) : null;
    const lane = (want != null && lanes.find(l => l.mi === want)) || lanes.find(l => tsState(l.mi, miles) === "next") || lanes[0];
    if (lane && startList) setCart(lane);
  }, []);
  const due = React.useMemo(() => tsDueList(miles), [miles]);
  const dueN = React.useMemo(() => tsBuyList(due.items).buy.length, [due]);
  return (
    <div style={{ flex:1, minHeight:0, display:"flex", position:"relative" }}>
      {phone
        ? <React.Fragment>
            <TSPhone miles={miles} picked={picked} onPick={setPicked} onCart={openCart}/>
            <TSDetail item={picked} miles={miles} sheet onClose={()=>setPicked(null)}/>
            {cart && <TSCart mi={cart.mi} items={cart.items} miles={miles} title={cart.title} note={cart.note} sheet onClose={()=>setCart(null)}/>}
          </React.Fragment>
        : <React.Fragment>
            <TSDesktop miles={miles} picked={picked} onPick={it => { setCart(null); setPicked(it); }} onCart={openCart}/>
            {cart
              ? <TSCart mi={cart.mi} items={cart.items} miles={miles} title={cart.title} note={cart.note} onClose={()=>setCart(null)}/>
              : picked && <TSDetail item={picked} miles={miles} onClose={()=>setPicked(null)}/>}
          </React.Fragment>}
      {!cart && dueN > 0 && (
        <button onClick={()=>{ setPicked(null); setCart(due); }} style={{ position:"absolute", right: phone ? 14 : 18, bottom: phone ? 14 : 16, zIndex:12, minHeight:40, padding:"0 15px", borderRadius:999, border:"none", cursor:"pointer", fontFamily:"var(--font-sans)", fontSize:12.5, fontWeight:600, background:"var(--ink)", color:"var(--ki-card)", boxShadow:"var(--shadow-2)", display:"flex", alignItems:"center", gap:7 }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1.5 2h1.7l1.6 6.4h6.1l1.6-4.6H4"/><circle cx="5.6" cy="11.4" r="1.1"/><circle cx="10.6" cy="11.4" r="1.1"/></svg>
          Everything to order · {dueN}
        </button>
      )}
    </div>
  );
}

Object.assign(window, { TS_CATS, TS_ITEMS, TS_CAT_ORDER, TS_STOP, tsStops, tsLanes, tsState, tsWhen, tsFmt, tsK, tsCost, tsHours, tsGroups, tsBig, tsBuyLine, tsBuyList, tsDueList, tsListText, TSCart, TSCartButton, TSNode, TSDesktop, TSPhone, TSDetail, TTSchedule });
