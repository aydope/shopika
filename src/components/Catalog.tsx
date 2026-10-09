import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Slider, Skeleton } from '@mui/material'
import { Search } from 'lucide-react'
import { categoriesOf, discountRatio, type Product } from '@/data/products'
import { useStore } from '@/store'
import { ProductCard } from './ProductCard'
import { Button } from '@/components/ui/button'
import { usePage } from './Utils'

type SortKey = 'featured' | 'low' | 'high' | 'rating' | 'discount'
const SORTERS: Record<SortKey, (a: Product, b: Product) => number> = {
  featured: () => 0,
  low: (a, b) => a.price - b.price,
  high: (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating,
  discount: (a, b) => discountRatio(b) - discountRatio(a),
}
const SORT_OPTIONS: [SortKey, string][] = [['featured', 'Featured'], ['low', 'Price low'], ['high', 'Price high'], ['rating', 'Top rated'], ['discount', 'Biggest discount']]
const isSortKey = (value: string): value is SortKey => SORT_OPTIONS.some(([key]) => key === value)

const PAGE_SIZE = 12
const HOME_LIMIT = 8
const SKELETON_COUNT = 8
const GRID_CLASS = 'grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4'

/** Product grid. `home` shows a short preview without filters; the shop page shows everything with filters. */
export function Catalog({ home = false }: { home?: boolean }) {
  const { products, catalogStatus, loadCatalog } = useStore()
  const [params, setParams] = useSearchParams()
  const category = params.get('cat') ?? 'All'
  const search = params.get('q') ?? ''
  const onSaleOnly = params.get('sale') === '1'
  const [sort, setSort] = useState<SortKey>('featured')
  const [maxPriceChoice, setMaxPriceChoice] = useState<number | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  usePage('Shop', 'Browse shirts, dresses, shoes, watches, bags and more.', !home)

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  const categories = ['All', ...categoriesOf(products)]
  const highestPrice = Math.ceil(Math.max(0, ...products.map((p) => p.price)))
  const maxPrice = maxPriceChoice ?? highestPrice
  const needle = search.toLowerCase()
  const matches = products
    .filter((p) => (category === 'All' || p.cat === category) && p.price <= maxPrice && (!onSaleOnly || p.old) && (!needle || `${p.name} ${p.brand} ${p.tag}`.toLowerCase().includes(needle)))
    .sort(SORTERS[sort])
  const shown = home ? matches.slice(0, HOME_LIMIT) : matches.slice(0, visibleCount)

  return (
    <section id="catalog" className="mx-auto max-w-7xl px-4 pb-16 md:pb-24">
      <h2 className="display mb-6 text-3xl sm:text-4xl md:text-6xl">ALL <span className="grad">GEAR</span></h2>
      {catalogStatus === 'loading' && products.length === 0 && (
        <div className={GRID_CLASS}>
          {Array.from({ length: SKELETON_COUNT }, (_, i) => <Skeleton key={i} variant="rectangular" sx={{ bgcolor: '#151515', aspectRatio: '3/4', height: 'auto' }} />)}
        </div>
      )}
      {catalogStatus === 'error' && products.length === 0 && (
        <div role="alert" className="border-2 border-ac2 p-10 text-center">
          <p className="mb-4">We could not load the catalog. Check your connection and try again.</p>
          <Button onClick={() => void loadCatalog()}>Try again</Button>
        </div>
      )}
      {products.length > 0 && (
        <>
          <div className="mb-4 flex items-center gap-3">
            <div className="no-sb flex flex-1 gap-2 overflow-x-auto" role="tablist" aria-label="Categories">
              {categories.map((name) => (
                <button key={name} type="button" role="tab" aria-selected={category === name} onClick={() => setParam('cat', name === 'All' ? '' : name)} className={`h-10 shrink-0 border-2 px-4 text-xs font-bold uppercase ${category === name ? 'border-ac bg-ac text-black' : 'border-white/20'}`}>
                  {name}
                </button>
              ))}
            </div>
            {!home && (
              <select value={sort} onChange={(e) => isSortKey(e.target.value) && setSort(e.target.value)} aria-label="Sort products" className="h-10 border-2 border-white/20 bg-black px-2 text-xs uppercase">
                {SORT_OPTIONS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            )}
          </div>
          {!home && (
            <div className="mb-6 grid items-center gap-4 border border-white/10 p-4 md:grid-cols-[1fr_1fr_auto]">
              <label className="relative block">
                <span className="sr-only">Search products</span>
                <Search size={16} className="absolute left-3 top-3.5 text-ac" />
                <input value={search} onChange={(e) => setParam('q', e.target.value)} placeholder="Search in shop" className="h-11 w-full border-2 border-white/20 bg-black pl-9 pr-3 outline-none focus:border-ac" />
              </label>
              <div className="px-2">
                <p className="text-xs uppercase text-white/60">Max price: ${maxPrice}</p>
                <Slider value={maxPrice} min={0} max={highestPrice} onChange={(_, value) => setMaxPriceChoice(Array.isArray(value) ? value[0] : value)} aria-label="Maximum price" sx={{ color: 'var(--ac)' }} />
              </div>
              <label className="flex h-11 items-center gap-2 text-sm">
                <input type="checkbox" checked={onSaleOnly} onChange={(e) => setParam('sale', e.target.checked ? '1' : '')} className="h-5 w-5 accent-[var(--ac)]" />
                On sale only
              </label>
            </div>
          )}
          {!home && <p className="mb-4 text-sm text-white/60" role="status">{matches.length} products</p>}
          {matches.length > 0 ? (
            <div className={GRID_CLASS}>{shown.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}</div>
          ) : (
            <p className="py-16 text-center text-white/60">No products match your filters.</p>
          )}
          {home && (
            <div className="mt-8 text-center">
              <Link to="/shop"><Button variant="outline">View all {products.length} products</Button></Link>
            </div>
          )}
          {!home && matches.length > visibleCount && (
            <div className="mt-8 text-center"><Button variant="outline" onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}>Load more</Button></div>
          )}
        </>
      )}
    </section>
  )
}
