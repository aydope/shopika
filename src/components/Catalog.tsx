import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Badge, Drawer, Skeleton } from '@mui/material'
import { SlidersHorizontal, X } from 'lucide-react'
import { categoriesOf } from '@/data/products'
import { useStore } from '@/store'
import { PARAM, SORT_OPTIONS, applyFilters, describeFilters, isSortKey, parseFilters } from '@/lib/filters'
import { cn } from '@/lib/utils'
import { useDragScroll } from '@/lib/useDragScroll'
import { Button, ButtonLink } from '@/components/ui/button'
import { ProductCard } from './ProductCard'
import { FilterPanel } from './shop/FilterPanel'
import { usePage } from './Utils'

const PAGE_SIZE = 12
const HOME_LIMIT = 8
const SKELETON_COUNT = 8
const HOME_GRID = 'grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4'
const SHOP_GRID = 'grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3'

/** Product grid. `home` shows a short preview; the shop page adds the filter sidebar, sorting and paging. */
export function Catalog({ home = false }: { home?: boolean }) {
  const { products, catalogStatus, loadCatalog } = useStore()
  const [params, setParams] = useSearchParams()
  const chipsRef = useDragScroll<HTMLDivElement>()
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [sheetOpen, setSheetOpen] = useState(false)
  usePage('Shop', 'Browse shirts, dresses, shoes, watches, bags and more.', !home)

  const filters = parseFilters(params)
  const matches = applyFilters(products, filters)
  const shown = home ? matches.slice(0, HOME_LIMIT) : matches.slice(0, visibleCount)
  const activeFilters = describeFilters(filters)
  const filterCount = activeFilters.filter((chip) => chip.id !== 'category' && chip.id !== 'search').length

  // Replacing keeps the back button from stepping through every filter change.
  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setParams(next, { replace: true })
  }
  const removeFilter = (id: string, keys: string[]) => {
    if (id.startsWith('brand:')) {
      update({ [PARAM.brands]: filters.brands.filter((brand) => `brand:${brand}` !== id).join(',') })
    } else {
      update(Object.fromEntries(keys.map((key) => [key, ''])))
    }
  }
  const clearAll = () => setParams({}, { replace: true })

  const categories = ['All', ...categoriesOf(products)]
  const loading = catalogStatus === 'loading' && products.length === 0
  const failed = catalogStatus === 'error' && products.length === 0

  return (
    <section id="catalog" className="mx-auto max-w-7xl px-4 pb-16 md:pb-24">
      <h2 className="display mb-6 text-3xl sm:text-4xl md:text-6xl">
        ALL <span className="grad">GEAR</span>
      </h2>

      {loading && (
        <div className={home ? HOME_GRID : SHOP_GRID}>
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <Skeleton key={i} variant="rectangular" sx={{ bgcolor: '#151515', aspectRatio: '3/4', height: 'auto' }} />
          ))}
        </div>
      )}
      {failed && (
        <div role="alert" className="border-2 border-ac2 p-10 text-center">
          <p className="mb-4">We could not load the catalog. Check your connection and try again.</p>
          <Button onClick={() => void loadCatalog()}>Try again</Button>
        </div>
      )}

      {products.length > 0 && (
        <>
          <div
            ref={chipsRef}
            className="drag-scroll no-sb mb-5 flex gap-2 overflow-x-auto"
            role="tablist"
            aria-label="Categories"
          >
            {categories.map((name) => (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={filters.category === name}
                onClick={() => update({ [PARAM.category]: name === 'All' ? '' : name })}
                className={cn(
                  'h-10 shrink-0 border-2 px-4 text-xs font-bold uppercase',
                  filters.category === name ? 'border-ac bg-ac text-black' : 'border-white/20 hover:border-ac',
                )}
              >
                {name}
              </button>
            ))}
          </div>

          {!home && (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setSheetOpen(true)}>
                  <Badge badgeContent={filterCount} color="secondary">
                    <SlidersHorizontal size={16} />
                  </Badge>
                  <span className="ml-2">Filters</span>
                </Button>
                <p className="text-sm text-white/60" role="status">
                  {matches.length} products
                </p>
                <label className="ml-auto flex items-center gap-2 text-xs uppercase text-white/50">
                  Sort
                  <select
                    value={filters.sort}
                    onChange={(e) => isSortKey(e.target.value) && update({ [PARAM.sort]: e.target.value })}
                    className="h-10 border-2 border-white/20 bg-black px-2 text-sm normal-case text-white"
                  >
                    {SORT_OPTIONS.map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {activeFilters.length > 0 && (
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  {activeFilters.map(({ id, label, params: keys }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => removeFilter(id, keys)}
                      aria-label={`Remove filter ${label}`}
                      className="inline-flex h-8 items-center gap-1 border border-ac px-3 text-xs text-ac hover:bg-ac hover:text-black"
                    >
                      {label}
                      <X size={12} />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-xs font-bold uppercase text-white/60 underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </>
          )}

          <div className={home ? undefined : 'lg:grid lg:grid-cols-[16rem_1fr] lg:gap-10'}>
            {!home && (
              <aside className="hidden lg:block" aria-label="Filters">
                <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
                  <h3 className="display mb-1 flex items-center gap-2 text-sm">
                    <SlidersHorizontal size={16} className="text-ac" />
                    FILTERS
                  </h3>
                  <FilterPanel products={products} filters={filters} onChange={update} idPrefix="side" />
                </div>
              </aside>
            )}

            <div>
              {matches.length > 0 ? (
                <div className={home ? HOME_GRID : SHOP_GRID}>
                  {shown.map((p, i) => (
                    <ProductCard key={p.id} p={p} i={i} />
                  ))}
                </div>
              ) : (
                <div className="border-2 border-white/10 p-12 text-center">
                  <p className="mb-4 text-white/70">No products match your filters.</p>
                  <Button variant="outline" onClick={clearAll}>
                    Clear all filters
                  </Button>
                </div>
              )}
              {home && (
                <div className="mt-8 text-center">
                  <ButtonLink to="/shop" variant="outline">
                    View all {products.length} products
                  </ButtonLink>
                </div>
              )}
              {!home && matches.length > visibleCount && (
                <div className="mt-8 text-center">
                  <Button variant="outline" onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}>
                    Load more
                  </Button>
                </div>
              )}
            </div>
          </div>

          {!home && (
            <Drawer
              anchor="bottom"
              open={sheetOpen}
              onClose={() => setSheetOpen(false)}
              PaperProps={{ sx: { maxHeight: '88vh', borderTop: '2px solid var(--ac)' } }}
            >
              <div className="flex items-center justify-between border-b border-white/10 p-4">
                <h2 className="display text-lg">FILTERS</h2>
                <button
                  type="button"
                  aria-label="Close filters"
                  className="grid h-11 w-11 place-items-center"
                  onClick={() => setSheetOpen(false)}
                >
                  <X />
                </button>
              </div>
              <div className="overflow-y-auto px-4">
                <FilterPanel products={products} filters={filters} onChange={update} idPrefix="sheet" />
              </div>
              <div
                className="flex gap-3 border-t border-white/10 p-4"
                style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}
              >
                <Button variant="outline" onClick={clearAll}>
                  Clear all
                </Button>
                <Button className="flex-1" onClick={() => setSheetOpen(false)}>
                  Show {matches.length} results
                </Button>
              </div>
            </Drawer>
          )}
        </>
      )}
    </section>
  )
}
