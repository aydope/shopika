import { useState, type ReactNode } from 'react'
import { Slider } from '@mui/material'
import { ChevronDown, Star } from 'lucide-react'
import type { Product } from '@/data/products'
import { PARAM, type Filters } from '@/lib/filters'

const VISIBLE_BRANDS = 6
const RATING_OPTIONS = [
  { value: 0, label: 'Any rating' },
  { value: 4, label: '4 stars & up' },
  { value: 3, label: '3 stars & up' },
]

export type FilterChange = (patch: Record<string, string>) => void

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details open className="group border-b border-white/10 py-4">
      <summary
        className="flex cursor-pointer list-none items-center justify-between text-sm font-bold uppercase tracking-wide [&::-webkit-details-marker]:hidden"
      >
        {title}
        <ChevronDown size={16} className="text-ac transition group-open:rotate-180" />
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  )
}

const checkboxClass = 'flex min-h-9 cursor-pointer items-center gap-3 text-sm hover:text-ac'
const boxClass = 'h-5 w-5 shrink-0 accent-[var(--ac)]'
const numberInputClass = 'h-10 w-full border border-white/20 bg-black px-2 text-sm outline-none focus:border-ac'

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
        sx={{ color: 'var(--ac)', mx: 1, width: 'calc(100% - 16px)' }}
      />
      <div className="mt-2 flex items-center gap-2">
        <label className="flex-1 text-xs uppercase text-white/50">
          Min ($)
          <input
            type="number"
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

type FilterPanelProps = { products: Product[]; filters: Filters; onChange: FilterChange; idPrefix: string }

/** The filter groups shared by the desktop sidebar and the mobile sheet. Every change is written to the URL. */
export function FilterPanel({ products, filters, onChange, idPrefix }: FilterPanelProps) {
  const [showAllBrands, setShowAllBrands] = useState(false)

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
        <div role="radiogroup" aria-label="Minimum rating">
          {RATING_OPTIONS.map(({ value, label }) => (
            <label key={value} className={checkboxClass}>
              <input
                type="radio"
                name={`${idPrefix}-rating`}
                checked={filters.minRating === value}
                onChange={() => onChange({ [PARAM.minRating]: value ? String(value) : '' })}
                className={boxClass}
              />
              {value > 0 && <Star size={14} className="text-ac" fill="currentColor" />}
              {label}
            </label>
          ))}
        </div>
      </Group>

      <Group title="Brand">
        {shownBrands.map(([brand, count]) => (
          <label key={brand} className={checkboxClass}>
            <input
              type="checkbox"
              checked={filters.brands.includes(brand)}
              onChange={() => toggleBrand(brand)}
              className={boxClass}
            />
            <span className="flex-1 truncate">{brand}</span>
            <span className="text-xs text-white/40">{count}</span>
          </label>
        ))}
        {brands.length > VISIBLE_BRANDS && (
          <button
            type="button"
            onClick={() => setShowAllBrands((open) => !open)}
            className="mt-1 text-xs font-bold uppercase text-ac underline"
          >
            {showAllBrands ? 'Show fewer' : `Show all ${brands.length}`}
          </button>
        )}
      </Group>

      <Group title="Availability">
        <label className={checkboxClass}>
          <input
            type="checkbox"
            checked={filters.onSale}
            onChange={(e) => onChange({ [PARAM.onSale]: e.target.checked ? '1' : '' })}
            className={boxClass}
          />
          On sale
        </label>
        <label className={checkboxClass}>
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => onChange({ [PARAM.inStock]: e.target.checked ? '1' : '' })}
            className={boxClass}
          />
          In stock
        </label>
      </Group>
    </div>
  )
}
