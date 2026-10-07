import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Slider, Skeleton } from '@mui/material'
import { Search } from 'lucide-react'
import { products } from '@/data/products'
import { useStore } from '@/store'
import { ProductCard } from './ProductCard'
import { Button } from '@/components/ui/button'
import { usePage } from './Utils'
export function Catalog({ home }: { home?: boolean }) {
  const [sp, setSp] = useSearchParams(), ready = useStore((s) => s.ready)
  const c = sp.get('cat') || 'All', q = sp.get('q') || '', sale = sp.get('sale') === '1'
  const [s, setS] = useState('featured'), [max, setMax] = useState<number | null>(null), [n, setN] = useState(12)
  if (!home) usePage('Shop', 'Browse shirts, dresses, shoes, watches, bags and more.')
  const set = (k: string, v: string) => { const x = new URLSearchParams(sp); v ? x.set(k, v) : x.delete(k); setSp(x) }
  const cats = ['All', ...new Set(products.map((p) => p.cat))], top = Math.ceil(Math.max(0, ...products.map((p) => p.price))), lim = max ?? top
  const list = products.filter((p) => (c === 'All' || p.cat === c) && p.price <= lim && (!sale || p.old) && (!q || `${p.name} ${p.brand} ${p.tag}`.toLowerCase().includes(q.toLowerCase()))).sort((a, b) => (s === 'low' ? a.price - b.price : s === 'high' ? b.price - a.price : s === 'rating' ? b.rating - a.rating : s === 'discount' ? (b.old ? b.old / b.price : 0) - (a.old ? a.old / a.price : 0) : 0))
  const shown = home ? list.slice(0, 8) : list.slice(0, n), grid = 'grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4'
  return (
    <section id="catalog" className="mx-auto max-w-7xl px-4 pb-16 md:pb-24">
      <h2 className="display mb-6 text-3xl sm:text-4xl md:text-6xl">ALL <span className="grad">GEAR</span></h2>
      {!ready && !products.length ? <div className={grid}>{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} variant="rectangular" sx={{ bgcolor: '#151515', aspectRatio: '3/4', height: 'auto' }} />)}</div> :
      ready && !products.length ? <div className="border-2 border-ac2 p-10 text-center"><p className="mb-4">We could not load the catalog. Check your connection and try again.</p><Button onClick={() => location.reload()}>Try again</Button></div> : <>
        <div className="mb-4 flex items-center gap-3">
          <div className="no-sb flex flex-1 gap-2 overflow-x-auto" role="tablist" aria-label="Categories">{cats.map((k) => <button key={k} role="tab" aria-selected={c === k} onClick={() => set('cat', k === 'All' ? '' : k)} className={`h-10 shrink-0 border-2 px-4 text-xs font-bold uppercase ${c === k ? 'border-ac bg-ac text-black' : 'border-white/20'}`}>{k}</button>)}</div>
          {!home && <select value={s} onChange={(e) => setS(e.target.value)} aria-label="Sort products" className="h-10 border-2 border-white/20 bg-black px-2 text-xs uppercase"><option value="featured">Featured</option><option value="low">Price low</option><option value="high">Price high</option><option value="rating">Top rated</option><option value="discount">Biggest discount</option></select>}
        </div>
        {!home && <div className="mb-6 grid items-center gap-4 border border-white/10 p-4 md:grid-cols-[1fr_1fr_auto]">
          <label className="relative block"><span className="sr-only">Search products</span><Search size={16} className="absolute left-3 top-3.5 text-ac" /><input value={q} onChange={(e) => set('q', e.target.value)} placeholder="Search in shop" className="h-11 w-full border-2 border-white/20 bg-black pl-9 pr-3 outline-none focus:border-ac" /></label>
          <div className="px-2"><p className="text-xs uppercase text-white/60">Max price: ${lim}</p><Slider value={lim} min={0} max={top} onChange={(_, v) => setMax(v as number)} aria-label="Maximum price" sx={{ color: 'var(--ac)' }} /></div>
          <label className="flex h-11 items-center gap-2 text-sm"><input type="checkbox" checked={sale} onChange={(e) => set('sale', e.target.checked ? '1' : '')} className="h-5 w-5 accent-[var(--ac)]" />On sale only</label>
        </div>}
        {!home && <p className="mb-4 text-sm text-white/60" role="status">{list.length} products</p>}
        {list.length ? <div className={grid}>{shown.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}</div> : <p className="py-16 text-center text-white/60">No products match your filters.</p>}
        {home ? <div className="mt-8 text-center"><Link to="/shop"><Button variant="outline">View all {products.length} products</Button></Link></div> : list.length > n && <div className="mt-8 text-center"><Button variant="outline" onClick={() => setN(n + 12)}>Load more</Button></div>}
      </>}
    </section>
  )
}
