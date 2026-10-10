import { useState, type ReactNode } from 'react'
import { Slider } from '@mui/material'
import { ChevronDown, Star } from 'lucide-react'
import type { Product } from '@/data/products'
import { PARAM, type Filters } from '@/lib/filters'
import { cn } from '@/lib/utils'

const VISIBLE_BRANDS = 6
const RATING_OPTIONS = [
  { value: 0, label: 'Any rating', short: 'Any' },
  { value: 4, label: '4 stars & up', short: '4+' },
  { value: 3, label: '3 stars & up', short: '3+' },
]

export type FilterChange = (patch: Record<string, string>) => void
type Variant = 'sidebar' | 'sheet'

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details open className="group border-b border-white/10 py-4">
      <summary
        className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-bold uppercase tracking-wide [&::-webkit-details-marker]:hidden"
      >
        {title}
        <ChevronDown size={16} className="text-ac transition group-open:rotate-180" />
      </summary>
      <div className="mt-2">{children}</div>
    </details>
  )
}

/** Large rounded-off toggle used on phones, where small checkboxes are hard to hit. */
type PillProps = { active: boolean; onClick: () => void; children: ReactNode; role?: 'radio' }

function Pill({ active, onClick, children, role }: PillProps) {
  return (
    <button
      type="button"
      role={role}
      aria-pressed={role ? undefined : active}
      aria-checked={role ? active : undefined}
      onClick={onClick}
      className={cn(
        'inline-flex h-11 items-center gap-1.5 border-2 px-4 text-sm font-bold',
        active ? 'border-ac bg-ac text-black' : 'border-white/20 active:border-ac',
      )}
    >
      {children}
    </button>
  )
}

const rowClass = 'flex min-h-9 cursor-pointer items-center gap-3 text-sm hover:text-ac'
const boxClass = 'h-5 w-5 shrink-0 accent-[var(--ac)]'
const numberInputClass =
  'h-11 w-full border border-white/20 bg-black px-2 text-base outline-none focus:border-ac md:h-10 md:text-sm'
const SLIDER_STYLE = {
  color: 'var(--ac)',
  mx: 1.5,
  width: 'calc(100% - 24px)',
  '& .MuiSlider-thumb': { width: 24, height: 24, borderRadius: 0 },
  '& .MuiSlider-rail': { opacity: 0.25 },
}

type PriceFilterProps = {
  lowest: number
  highest: number
  min: number | null
  max: number | null
  onCommit: FilterChange
}

/** Remounted (via `key`) when the URL values change, so the local draft always starts from the applied range. */
function PriceFilter({ lowest, highest, min, max, onCommit }: PriceFilterProps) {
  const [range, setRange] = useState<[number, number]>([min ?? lowest, max ?? highest])

  const commit = ([from, to]: [number, number]) =>
    onCommit({
      [PARAM.minPrice]: from <= lowest ? '' : String(from),
      [PARAM.maxPrice]: to >= highest ? '' : String(to),
    })
  const setEnd = (index: 0 | 1, raw: string) => {
    const value = Math.min(highest, Math.max(lowest, Number(raw) || 0))
    setRange(index === 0 ? [Math.min(value, range[1]), range[1]] : [range[0], Math.max(value, range[0])])
  }

  return (
    <div>
      <Slider
        value={range}
        min={lowest}
        max={highest}
        disableSwap
        onChange={(_, value) => Array.isArray(value) && setRange([value[0], value[1]])}
        onChangeCommitted={(_, value) => Array.isArray(value) && commit([value[0], value[1]])}
        getAriaLabel={(index) => (index === 0 ? 'Minimum price' : 'Maximum price')}
        sx={SLIDER_STYLE}
      />
      <div className="mt-2 flex items-center gap-2">
        <label className="flex-1 text-xs uppercase text-white/50">
          Min ($)
          <input
            type="number"
            inputMode="numeric"
            value={range[0]}
            onChange={(e) => setEnd(0, e.target.value)}
            onBlur={() => commit(range)}
            className={numberInputClass}
          />
        </label>
        <label className="flex-1 text-xs uppercase text-white/50">
          Max ($)
          <input
            type="number"
            inputMode="numeric"
            value={range[1]}
            onChange={(e) => setEnd(1, e.target.value)}
            onBlur={() => commit(range)}
            className={numberInputClass}
          />
        </label>
      </div>
    </div>
  )
}

type FilterPanelProps = { products: Product[]; filters: Filters; onChange: FilterChange; variant: Variant }

/**
 * The filter groups. The sidebar variant (desktop) uses compact checkbox rows; the sheet variant (phones) uses large
 * toggle buttons with 44px touch targets. Every change is written to the URL by the parent.
 */
export function FilterPanel({ products, filters, onChange, variant }: FilterPanelProps) {
  const [showAllBrands, setShowAllBrands] = useState(false)
  const sheet = variant === 'sheet'

  const prices = products.map((p) => p.price)
  const lowest = Math.floor(Math.min(...prices))
  const highest = Math.ceil(Math.max(...prices))
  const brandCounts = new Map<string, number>()
  products.forEach((p) => brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1))
  const brands = [...brandCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  const shownBrands = showAllBrands ? brands : brands.slice(0, VISIBLE_BRANDS)

  const toggleBrand = (brand: string) => {
    const next = filters.brands.includes(brand) ? filters.brands.filter((b) => b !== brand) : [...filters.brands, brand]
    onChange({ [PARAM.brands]: next.join(',') })
  }
  const setRating = (value: number) => onChange({ [PARAM.minRating]: value ? String(value) : '' })
  const toggleFlag = (key: string, current: boolean) => onChange({ [key]: current ? '' : '1' })

  return (
    <div>
      <Group title="Price">
        <PriceFilter
          key={`${filters.minPrice}-${filters.maxPrice}`}
          lowest={lowest}
          highest={highest}
          min={filters.minPrice}
          max={filters.maxPrice}
          onCommit={onChange}
        />
      </Group>

      <Group title="Rating">
        <div role="radiogroup" aria-label="Minimum rating" className={sheet ? 'flex flex-wrap gap-2' : undefined}>
          {RATING_OPTIONS.map(({ value, label, short }) =>
            sheet ? (
              <Pill key={value} role="radio" active={filters.minRating === value} onClick={() => setRating(value)}>
                {value > 0 && <Star size={14} fill="currentColor" />}
                {short}
              </Pill>
            ) : (
              <label key={value} className={rowClass}>
                <input
                  type="radio"
                  name={`${variant}-rating`}
                  checked={filters.minRating === value}
                  onChange={() => setRating(value)}
                  className={boxClass}
                />
                {value > 0 && <Star size={14} className="text-ac" fill="currentColor" />}
                {label}
              </label>
            ),
          )}
        </div>
      </Group>

      <Group title="Brand">
        <div className={sheet ? 'flex flex-wrap gap-2' : undefined}>
          {shownBrands.map(([brand, count]) =>
            sheet ? (
              <Pill key={brand} active={filters.brands.includes(brand)} onClick={() => toggleBrand(brand)}>
                {brand}
                <span className="text-xs opacity-60">{count}</span>
              </Pill>
            ) : (
              <label key={brand} className={rowClass}>
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className={boxClass}
                />
                <span className="flex-1 truncate">{brand}</span>
                <span className="text-xs text-white/40">{count}</span>
              </label>
            ),
          )}
        </div>
        {brands.length > VISIBLE_BRANDS && (
          <button
            type="button"
            onClick={() => setShowAllBrands((open) => !open)}
            className="mt-2 min-h-11 text-xs font-bold uppercase text-ac underline"
          >
            {showAllBrands ? 'Show fewer' : `Show all ${brands.length}`}
          </button>
        )}
      </Group>

      <Group title="Availability">
        {sheet ? (
          <div className="flex flex-wrap gap-2">
            <Pill active={filters.onSale} onClick={() => toggleFlag(PARAM.onSale, filters.onSale)}>
              On sale
            </Pill>
            <Pill active={filters.inStock} onClick={() => toggleFlag(PARAM.inStock, filters.inStock)}>
              In stock
            </Pill>
          </div>
        ) : (
          <>
            <label className={rowClass}>
              <input
                type="checkbox"
                checked={filters.onSale}
                onChange={() => toggleFlag(PARAM.onSale, filters.onSale)}
                className={boxClass}
              />
              On sale
            </label>
            <label className={rowClass}>
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={() => toggleFlag(PARAM.inStock, filters.inStock)}
                className={boxClass}
              />
              In stock
            </label>
          </>
        )}
      </Group>
    </div>
  )
}
