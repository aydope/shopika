import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Heart, GitCompare, Share2, Truck, ShieldCheck, RefreshCw, ChevronRight, Minus, Plus, Check, Ruler } from 'lucide-react'
import { Rating, Tab, Tabs, Skeleton, Dialog } from '@mui/material'
import { useStore } from '@/store'
import { products, sizesFor } from '@/data/products'
import { Button } from '@/components/ui/button'
import { ProductCard } from './ProductCard'
import { Comments } from './Comments'
import { usd } from '@/lib/utils'
const CLOTH = [['XS', '82-87', '66-71'], ['S', '88-93', '72-77'], ['M', '94-99', '78-83'], ['L', '100-107', '84-91'], ['XL', '108-115', '92-99']]
export default function ProductPage() {
  const { id } = useParams(), { ready, add, like, likes, cmp, compare, recent, view, comments } = useStore()
  const p = products.find((x) => x.id === id)
  const [qty, setQty] = useState(1), [tab, setTab] = useState(0), [size, setSize] = useState(''), [sizeErr, setSizeErr] = useState(false), [color, setColor] = useState(''), [im, setIm] = useState(0), [z, setZ] = useState<[number, number] | null>(null), [copied, setCopied] = useState(false), [guide, setGuide] = useState(false)
  useEffect(() => {
    if (!p) return
    view(p.id); setQty(1); setTab(0); setSize(''); setSizeErr(false); setColor(''); setIm(0)
    document.title = `${p.name} | ShopiKa`
    document.querySelector('meta[name=description]')?.setAttribute('content', p.desc.slice(0, 155))
    const s = document.createElement('script'); s.type = 'application/ld+json'
    s.text = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: p.name, image: p.images, description: p.desc, sku: p.sku, brand: { '@type': 'Brand', name: p.brand }, category: p.cat, aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.count }, offers: { '@type': 'Offer', price: p.price, priceCurrency: 'USD', availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' } })
    document.head.appendChild(s); return () => { s.remove() }
  }, [p?.id])
  if (!p) return <div className="mx-auto max-w-7xl p-10">{ready ? <p className="display text-3xl">Product not found. <Link to="/shop" className="text-ac">Back to shop</Link></p> : <Skeleton variant="rectangular" height={500} sx={{ bgcolor: '#111' }} />}</div>
  const sizes = sizesFor(p), col = color || p.colors[0][0], all = [...(comments['p:' + p.id] || []), ...p.reviews], avg = all.length ? all.reduce((a, r) => a + (r.rating || 0), 0) / all.length : p.rating
  const addQty = () => { if (sizes.length && !size) { setSizeErr(true); return } for (let i = 0; i < qty; i++) add(p.id, size, col) }
  const share = async () => { const u = location.href; if (navigator.share) await navigator.share({ title: p.name, url: u }).catch(() => {}); else { await navigator.clipboard.writeText(u); setCopied(true); setTimeout(() => setCopied(false), 1500) } }
  const eta = new Date(Date.now() + 4 * 864e5).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const rel = products.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 4), seen = recent.filter((r) => r !== p.id).map((r) => products.find((x) => x.id === r)).filter(Boolean).slice(0, 4)
  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-6 md:pb-16">
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-xs uppercase text-white/60" aria-label="Breadcrumb"><Link to="/">Home</Link><ChevronRight size={12} /><Link to={`/shop?cat=${encodeURIComponent(p.cat)}`}>{p.cat}</Link><ChevronRight size={12} /><span className="line-clamp-1 text-ac">{p.name}</span></nav>
      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <div>
          <div className="relative aspect-square cursor-zoom-in overflow-hidden border-2 border-ac bg-neutral-100" onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setZ([((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100]) }} onMouseLeave={() => setZ(null)}>
            <img src={p.images[im]} alt={`${p.name}, view ${im + 1}`} className="h-full w-full object-contain p-4 transition-transform duration-200" style={z ? { transform: 'scale(2)', transformOrigin: `${z[0]}% ${z[1]}%` } : undefined} />
            <span className="display absolute left-3 top-3 bg-ac px-3 py-1 text-xs text-black">{p.tag}</span>
          </div>
          {p.images.length > 1 && <div className="no-sb mt-3 flex gap-2 overflow-x-auto">{p.images.map((s, k) => <button key={k} aria-label={`Show image ${k + 1}`} aria-current={im === k} onClick={() => setIm(k)} className={`h-20 w-20 shrink-0 border-2 bg-neutral-100 ${im === k ? 'border-ac' : 'border-white/10'}`}><img src={s} alt="" loading="lazy" className="h-full w-full object-contain" /></button>)}</div>}
        </div>
        <div className="space-y-5">
          <p className="text-sm font-bold uppercase text-ac">{p.brand}</p>
          <h1 className="display text-2xl sm:text-4xl">{p.name}</h1>
          <div className="flex items-center gap-2"><Rating value={avg} precision={0.1} readOnly /><button onClick={() => setTab(3)} className="text-sm text-white/60 underline">{avg.toFixed(1)} ({all.length} reviews)</button></div>
          <p className="flex items-end gap-3"><b className="display text-4xl text-ac">{usd(p.price)}</b>{p.old && <><s className="text-white/50">{usd(p.old)}</s><span className="bg-ac2 px-2 py-1 text-xs font-bold text-black">-{Math.round((1 - p.price / p.old) * 100)}%</span></>}</p>
          <p className="line-clamp-4 text-white/80">{p.desc}</p>
          <div role="radiogroup" aria-label="Color"><p className="mb-2 text-sm font-bold uppercase">Color: <span className="font-normal text-white/70">{col}</span></p><div className="flex gap-3">{p.colors.map(([n, h]) => <button key={n} role="radio" aria-checked={col === n} aria-label={n} title={n} onClick={() => setColor(n)} className={`grid h-11 w-11 place-items-center rounded-full border-2 ${col === n ? 'border-ac' : 'border-white/20'}`}><span className="h-7 w-7 rounded-full border border-white/30" style={{ background: h }} /></button>)}</div></div>
          {!!sizes.length && <div role="radiogroup" aria-label="Size"><div className="mb-2 flex items-center justify-between"><p className="text-sm font-bold uppercase">Size {sizeErr && <span role="alert" className="ml-2 font-normal normal-case text-ac2">Please select a size</span>}</p><button onClick={() => setGuide(true)} className="flex items-center gap-1 text-sm text-ac underline"><Ruler size={14} />Size guide</button></div><div className="flex flex-wrap gap-2">{sizes.map((s) => <button key={s} role="radio" aria-checked={size === s} onClick={() => { setSize(s); setSizeErr(false) }} className={`h-11 min-w-11 border-2 px-3 font-bold ${size === s ? 'border-ac bg-ac text-black' : 'border-white/20'}`}>{s}</button>)}</div></div>}
          <p className={`text-sm ${p.stock <= 5 ? 'font-bold text-ac2' : 'text-white/70'}`}>{p.stock <= 5 ? `Only ${p.stock} left in stock` : 'In stock'} · Order today, arrives by {eta}</p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-12 items-center border-2 border-white/20"><button aria-label="Decrease quantity" className="grid h-12 w-11 place-items-center" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus size={16} /></button><b className="w-8 text-center">{qty}</b><button aria-label="Increase quantity" className="grid h-12 w-11 place-items-center" onClick={() => setQty((q) => Math.min(p.stock, q + 1))}><Plus size={16} /></button></div>
            <Button className="hidden flex-1 md:inline-flex" onClick={addQty}>Add to cart</Button>
            <Button variant="outline" size="icon" className="h-12 w-12" aria-label="Wishlist" aria-pressed={likes.includes(p.id)} onClick={() => like(p.id)}><Heart fill={likes.includes(p.id) ? 'currentColor' : 'none'} /></Button>
            <Button variant="outline" size="icon" className="h-12 w-12" aria-label="Compare" aria-pressed={compare.includes(p.id)} onClick={() => cmp(p.id)}><GitCompare className={compare.includes(p.id) ? 'text-ac2' : ''} /></Button>
            <Button variant="outline" size="icon" className="h-12 w-12" aria-label="Share" onClick={share}>{copied ? <Check /> : <Share2 />}</Button>
          </div>
          <ul className="grid grid-cols-3 gap-2 text-center text-[11px] uppercase">{[[Truck, 'Free ship $150+'], [RefreshCw, '30-day returns'], [ShieldCheck, 'Secure pay']].map(([I, t]: any) => <li key={t} className="border border-white/10 p-3"><I className="mx-auto mb-1 text-ac" size={20} />{t}</li>)}</ul>
        </div>
      </div>
      <div className="mt-12"><Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" sx={{ '& .MuiTabs-indicator': { bgcolor: 'var(--ac)' }, '& .Mui-selected': { color: 'var(--ac) !important' } }}><Tab label="Details" /><Tab label="Specifications" /><Tab label="Shipping" /><Tab label={`Reviews (${all.length})`} /></Tabs>
        <div className="py-6">
          {tab === 0 && <div className="max-w-3xl space-y-3 text-white/80"><p>{p.desc}</p></div>}
          {tab === 1 && <dl className="grid max-w-3xl gap-px bg-white/10 sm:grid-cols-2">{p.specs.map(([k, v]) => <div key={k} className="bg-black p-3"><dt className="text-xs uppercase text-white/50">{k}</dt><dd>{v}</dd></div>)}</dl>}
          {tab === 2 && <div className="max-w-3xl space-y-3 text-white/80"><p>Ships within 24 hours. Standard delivery takes 3 to 7 business days, express 1 to 3. Free standard shipping on orders over $150, otherwise $9.90.</p><p>{p.specs.find((s) => s[0] === 'Returns')?.[1] || 'Free returns within 30 days.'}</p></div>}
          {tab === 3 && <div className="grid gap-8 md:grid-cols-[240px_1fr]"><div><b className="display text-5xl text-ac">{avg.toFixed(1)}</b><Rating value={avg} precision={0.1} readOnly /><div className="mt-4 space-y-1">{[5, 4, 3, 2, 1].map((n) => { const c = all.filter((r) => Math.round(r.rating || 0) === n).length; return <div key={n} className="flex items-center gap-2 text-xs"><span className="w-3">{n}</span><div className="h-2 flex-1 bg-white/10"><div className="h-full bg-ac" style={{ width: `${all.length ? (c / all.length) * 100 : 0}%` }} /></div><span className="w-4 text-right text-white/60">{c}</span></div> })}</div></div><Comments k={'p:' + p.id} seed={p.reviews} rated /></div>}
        </div></div>
      {!!rel.length && <><h2 className="display mb-6 mt-10 text-2xl sm:text-4xl">YOU MAY ALSO <span className="grad">LIKE</span></h2><div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{rel.map((x, i) => <ProductCard key={x.id} p={x} i={i} />)}</div></>}
      {!!seen.length && <><h2 className="display mb-6 mt-14 text-xl sm:text-2xl">RECENTLY VIEWED</h2><div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{seen.map((x, i) => <ProductCard key={x!.id} p={x!} i={i} />)}</div></>}
      <Dialog open={guide} onClose={() => setGuide(false)} maxWidth="xs" fullWidth><div className="p-5"><h2 className="display mb-3 text-lg">Size guide</h2>
        {p.kind === 'cloth' ? <table className="w-full text-left text-sm"><thead className="text-xs uppercase text-white/50"><tr><th className="py-2">Size</th><th>Chest (cm)</th><th>Waist (cm)</th></tr></thead><tbody>{CLOTH.map((r) => <tr key={r[0]} className="border-t border-white/10">{r.map((c, i) => <td key={i} className="py-2">{c}</td>)}</tr>)}</tbody></table>
          : <table className="w-full text-left text-sm"><thead className="text-xs uppercase text-white/50"><tr><th className="py-2">EU size</th><th>Foot length (cm)</th></tr></thead><tbody>{sizes.map((s) => <tr key={s} className="border-t border-white/10"><td className="py-2">{s}</td><td>{(Number(s) / 1.5 - 1.5).toFixed(1)}</td></tr>)}</tbody></table>}
        <p className="mt-3 text-xs text-white/60">Between sizes? Size up for a relaxed fit.</p><Button className="mt-4 w-full" onClick={() => setGuide(false)}>Close</Button></div></Dialog>
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t-2 border-ac bg-black/95 p-3 md:hidden" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}><b className="display text-xl text-ac">{usd(p.price * qty)}</b><Button className="flex-1" onClick={addQty}>Add to cart</Button></div>
    </div>
  )
}
