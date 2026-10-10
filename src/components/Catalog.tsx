import { useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Badge, Drawer, Skeleton } from '@mui/material'
import { ArrowDownUp, SlidersHorizontal, X } from 'lucide-react'
import { categoriesOf } from '@/data/products'
import { useStore } from '@/store'
import { PARAM, SORT_OPTIONS, applyFilters, describeFilters, isSortKey, parseFilters } from '@/lib/filters'
import { LENIS_PREVENT } from '@/lib/smoothScroll'
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
const SHEET_PAPER = { maxHeight: '88vh', borderTop: '2px solid var(--ac)', ...LENIS_PREVENT }

type Sheet = 'filters' | 'sort' | null

/** Bottom sheet used on phones: a drag handle, a title row, scrollable content and an optional pinned footer. */
function BottomSheet({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <Drawer anchor="bottom" open={open} onClose={onClose} PaperProps={{ sx: SHEET_PAPER }}>
      <div aria-hidden className="mx-auto mt-2 h-1 w-10 shrink-0 bg-white/30" />
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 pb-2 pt-1">
        <h2 className="display text-lg">{title}</h2>
        <button
          type="button"
          aria-label={`Close ${title.toLowerCase()}`}
          className="grid h-11 w-11 place-items-center"
          onClick={onClose}
        >
          <X />
        </button>
      </div>
      <div className="no-sb min-h-0 flex-1 overflow-y-auto px-4">{children}</div>
      {footer && (
        <div
          className="shrink-0 border-t border-white/10 p-4"
          style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}
        >
          {footer}
        </div>
      )}
    </Drawer>
  )
}

/** Product grid. `home` shows a short preview; the shop page adds the filter sidebar, sorting and paging. */
export function Catalog({ home = false }: { home?: boolean }) {
  const { products, catalogStatus, loadCatalog } = useStore()
  const [params, setParams] = useSearchParams()
  const { ref: categoriesRef } = useDragScroll<HTMLDivElement>()
  const { ref: activeFiltersRef } = useDragScroll<HTMLDivElement>()
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [sheet, setSheet] = useState<Sheet>(null)
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
  const closeSheet = () => setSheet(null)

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
            ref={categoriesRef}
            className="drag-scroll no-sb mb-4 flex gap-2 overflow-x-auto"
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
                  'h-11 shrink-0 border-2 px-4 text-xs font-bold uppercase',
                  filters.category === name ? 'border-ac bg-ac text-black' : 'border-white/20 hover:border-ac',
                )}
              >
                {name}
              </button>
            ))}
          </div>

          {!home && (
            <>
              {/* Phones: a sticky bar with the two actions people use most, like most fashion stores. */}
              <div
                className="sticky top-[4.5rem] z-30 -mx-4 mb-4 flex items-center gap-2 border-b border-white/10 bg-black/90 px-4 py-2 backdrop-blur lg:hidden"
              >
                <Button variant="outline" size="sm" className="h-11 flex-1" onClick={() => setSheet('filters')}>
                  <Badge badgeContent={filterCount} color="secondary">
                    <SlidersHorizontal size={16} />
                  </Badge>
                  <span className="ml-2">Filter</span>
                </Button>
                <Button variant="outline" size="sm" className="h-11 flex-1" onClick={() => setSheet('sort')}>
                  <ArrowDownUp size={16} />
                  <span className="truncate">Sort</span>
                </Button>
                <p className="shrink-0 text-xs text-white/60" role="status">
                  {matches.length} items
                </p>
              </div>

              {/* Desktop: result count and a sort menu. */}
              <div className="mb-4 hidden items-center gap-3 lg:flex">
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

              {/* Always mounted so the drag scrolling hook can attach; hidden while there are no active filters. */}
              <div
                ref={activeFiltersRef}
                className={cn(
                  'drag-scroll no-sb mb-5 flex items-center gap-2 overflow-x-auto lg:flex-wrap',
                  activeFilters.length === 0 && 'hidden',
                )}
              >
                {activeFilters.map(({ id, label, params: keys }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => removeFilter(id, keys)}
                    aria-label={`Remove filter ${label}`}
                    className="inline-flex h-9 shrink-0 items-center gap-1 border border-ac px-3 text-xs text-ac hover:bg-ac hover:text-black"
                  >
                    {label}
                    <X size={12} />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearAll}
                  className="h-9 shrink-0 px-2 text-xs font-bold uppercase text-white/60 underline"
                >
                  Clear all
                </button>
              </div>
            </>
          )}

          <div className={home ? undefined : 'lg:grid lg:grid-cols-[16rem_1fr] lg:gap-10'}>
            {!home && (
              <aside className="hidden lg:block" aria-label="Filters">
                <div
                  data-lenis-prevent
                  className="no-sb scroll-fade sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pb-8 pr-1"
                >
                  <h3 className="display mb-1 flex items-center gap-2 text-sm">
                    <SlidersHorizontal size={16} className="text-ac" />
                    FILTERS
                  </h3>
                  <FilterPanel products={products} filters={filters} onChange={update} variant="sidebar" />
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
            <>
              <BottomSheet
                open={sheet === 'filters'}
                title="Filters"
                onClose={closeSheet}
                footer={
                  <div className="flex gap-3">
                    <Button variant="outline" className="h-12" onClick={clearAll}>
                      Clear all
                    </Button>
                    <Button className="flex-1" onClick={closeSheet}>
                      Show {matches.length} results
                    </Button>
                  </div>
                }
              >
                <FilterPanel products={products} filters={filters} onChange={update} variant="sheet" />
              </BottomSheet>

              <BottomSheet open={sheet === 'sort'} title="Sort by" onClose={closeSheet}>
                <div role="radiogroup" aria-label="Sort by" className="pb-4">
                  {SORT_OPTIONS.map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={filters.sort === key}
                      onClick={() => {
                        update({ [PARAM.sort]: key === 'featured' ? '' : key })
                        closeSheet()
                      }}
                      className={cn(
                        'flex h-14 w-full items-center justify-between border-b border-white/10 text-left text-base',
                        filters.sort === key && 'font-bold text-ac',
                      )}
                    >
                      {label}
                      {filters.sort === key && <span aria-hidden>✓</span>}
                    </button>
                  ))}
                </div>
              </BottomSheet>
            </>
          )}
        </>
      )}
    </section>
  )
}
