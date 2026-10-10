import type { Product } from '@/data/products'
import { discountRatio } from '@/data/products'

export type SortKey = 'featured' | 'low' | 'high' | 'rating' | 'discount'

export const SORT_OPTIONS: [SortKey, string][] = [
  ['featured', 'Featured'],
  ['low', 'Price: low to high'],
  ['high', 'Price: high to low'],
  ['rating', 'Top rated'],
  ['discount', 'Biggest discount'],
]

const SORTERS: Record<SortKey, (a: Product, b: Product) => number> = {
  featured: () => 0,
  low: (a, b) => a.price - b.price,
  high: (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating,
  discount: (a, b) => discountRatio(b) - discountRatio(a),
}

export const isSortKey = (value: string): value is SortKey => SORT_OPTIONS.some(([key]) => key === value)

/** Query string keys used by the shop page, so every filter survives a reload and can be shared as a link. */
export const PARAM = {
  category: 'cat',
  search: 'q',
  onSale: 'sale',
  inStock: 'stock',
  minRating: 'rating',
  brands: 'brands',
  minPrice: 'min',
  maxPrice: 'max',
  sort: 'sort',
} as const

export type Filters = {
  category: string
  search: string
  onSale: boolean
  inStock: boolean
  minRating: number
  brands: string[]
  minPrice: number | null
  maxPrice: number | null
  sort: SortKey
}

const toNumber = (value: string | null) => {
  if (value === null || value.trim() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function parseFilters(params: URLSearchParams): Filters {
  const sort = params.get(PARAM.sort) ?? ''
  return {
    category: params.get(PARAM.category) ?? 'All',
    search: params.get(PARAM.search) ?? '',
    onSale: params.get(PARAM.onSale) === '1',
    inStock: params.get(PARAM.inStock) === '1',
    minRating: toNumber(params.get(PARAM.minRating)) ?? 0,
    brands: (params.get(PARAM.brands) ?? '').split(',').filter(Boolean),
    minPrice: toNumber(params.get(PARAM.minPrice)),
    maxPrice: toNumber(params.get(PARAM.maxPrice)),
    sort: isSortKey(sort) ? sort : 'featured',
  }
}

export function applyFilters(products: Product[], filters: Filters) {
  const needle = filters.search.trim().toLowerCase()
  return products
    .filter(
      (p) =>
        (filters.category === 'All' || p.cat === filters.category) &&
        (filters.minPrice === null || p.price >= filters.minPrice) &&
        (filters.maxPrice === null || p.price <= filters.maxPrice) &&
        p.rating >= filters.minRating &&
        (filters.brands.length === 0 || filters.brands.includes(p.brand)) &&
        (!filters.onSale || p.old) &&
        (!filters.inStock || p.stock > 0) &&
        (!needle || `${p.name} ${p.brand} ${p.cat} ${p.tag}`.toLowerCase().includes(needle)),
    )
    .sort(SORTERS[filters.sort])
}

export type ActiveFilter = { id: string; label: string; params: string[] }

/** The removable chips shown above the results. `params` lists the query keys a chip clears. */
export function describeFilters(filters: Filters): ActiveFilter[] {
  const chips: ActiveFilter[] = []
  if (filters.search) chips.push({ id: 'search', label: `Search: ${filters.search}`, params: [PARAM.search] })
  if (filters.category !== 'All') chips.push({ id: 'category', label: filters.category, params: [PARAM.category] })
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    const label = `$${filters.minPrice ?? 0} - ${filters.maxPrice === null ? 'any' : `$${filters.maxPrice}`}`
    chips.push({ id: 'price', label, params: [PARAM.minPrice, PARAM.maxPrice] })
  }
  if (filters.minRating > 0) {
    chips.push({ id: 'rating', label: `${filters.minRating}+ stars`, params: [PARAM.minRating] })
  }
  if (filters.onSale) chips.push({ id: 'sale', label: 'On sale', params: [PARAM.onSale] })
  if (filters.inStock) chips.push({ id: 'stock', label: 'In stock', params: [PARAM.inStock] })
  filters.brands.forEach((brand) => chips.push({ id: `brand:${brand}`, label: brand, params: [PARAM.brands] }))
  return chips
}
