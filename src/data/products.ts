export type Review = { id: string; name: string; text: string; date: string; rating?: number; likes: number }
export type ProductKind = 'cloth' | 'shoe' | 'none'
export type Product = {
  id: string
  name: string
  cat: string
  kind: ProductKind
  brand: string
  sku: string
  price: number
  old?: number
  img: string
  images: string[]
  rating: number
  count: number
  desc: string
  tag: string
  stock: number
  colors: [string, string][]
  specs: [string, string][]
  reviews: Review[]
}

import { hasNumber, hasString, isRecord } from '@/lib/guards'

const CATALOG_URL = 'https://dummyjson.com/products?limit=0'
const CATEGORIES = new Map<string, { label: string; kind: ProductKind }>([
  ['mens-shirts', { label: "Men's Shirts", kind: 'cloth' }],
  ['tops', { label: 'Tops', kind: 'cloth' }],
  ['womens-dresses', { label: 'Dresses', kind: 'cloth' }],
  ['mens-shoes', { label: "Men's Shoes", kind: 'shoe' }],
  ['womens-shoes', { label: "Women's Shoes", kind: 'shoe' }],
  ['mens-watches', { label: "Men's Watches", kind: 'none' }],
  ['womens-watches', { label: "Women's Watches", kind: 'none' }],
  ['womens-bags', { label: 'Bags', kind: 'none' }],
  ['womens-jewellery', { label: 'Jewellery', kind: 'none' }],
  ['sunglasses', { label: 'Sunglasses', kind: 'none' }],
])
// The API has no color variants, so each product gets a deterministic set from this palette.
const PALETTE: [string, string][] = [
  ['Black', '#111111'],
  ['White', '#f5f5f5'],
  ['Lime', '#c6ff00'],
  ['Magenta', '#ff2bd6'],
  ['Navy', '#1e3a8a'],
  ['Sand', '#d6c7a1'],
]

interface ApiReview { reviewerName: string; comment: string; date: string; rating: number }
interface ApiProduct {
  id: number
  title: string
  description: string
  category: string
  price: number
  discountPercentage?: number
  rating: number
  stock: number
  thumbnail: string
  tags?: string[]
  brand?: string
  sku?: string
  weight?: number
  dimensions?: { width: number; height: number; depth: number }
  warrantyInformation?: string
  shippingInformation?: string
  availabilityStatus?: string
  returnPolicy?: string
  minimumOrderQuantity?: number
  images?: string[]
  reviews?: ApiReview[]
}

/** Only the fields every consumer relies on are validated; optional fields are handled in toProduct. */
function isApiProduct(value: unknown): value is ApiProduct {
  return (
    isRecord(value) &&
    hasNumber(value, 'id') &&
    hasString(value, 'title') &&
    hasString(value, 'category') &&
    hasNumber(value, 'price') &&
    hasString(value, 'thumbnail')
  )
}

export const categoriesOf = (products: Product[]) => [...new Set(products.map((p) => p.cat))]

export const discountRatio = (p: Product) => (p.old ? p.old / p.price : 0)

const MEN_SHOE_SIZES = ['40', '41', '42', '43', '44', '45', '46']
const WOMEN_SHOE_SIZES = ['36', '37', '38', '39', '40', '41']

export const sizesFor = (p: Product) => {
  if (p.kind === 'cloth') return ['XS', 'S', 'M', 'L', 'XL']
  if (p.kind === 'shoe') return p.cat.startsWith("Men's") ? MEN_SHOE_SIZES : WOMEN_SHOE_SIZES
  return []
}

function toProduct(api: ApiProduct, label: string, kind: ProductKind): Product {
  const discount = api.discountPercentage ?? 0
  const specs: [string, string][] = []
  const addSpec = (name: string, value: string | number | undefined) => {
    if (value !== undefined && value !== '') specs.push([name, String(value)])
  }
  addSpec('Brand', api.brand ?? 'ShopiKa')
  addSpec('SKU', api.sku)
  addSpec('Category', label)
  addSpec('Weight', api.weight === undefined ? undefined : `${api.weight} oz`)
  const size = api.dimensions
  addSpec('Dimensions', size && `${size.width} x ${size.height} x ${size.depth} cm`)
  addSpec('Warranty', api.warrantyInformation)
  addSpec('Shipping', api.shippingInformation)
  addSpec('Returns', api.returnPolicy)
  addSpec('Availability', api.availabilityStatus)
  addSpec('Minimum order', api.minimumOrderQuantity)
  return {
    id: `d${api.id}`,
    name: api.title,
    cat: label,
    kind,
    brand: api.brand ?? 'ShopiKa',
    sku: api.sku ?? `SK-${api.id}`,
    price: api.price,
    old: discount >= 10 ? Math.round((api.price / (1 - discount / 100)) * 100) / 100 : undefined,
    img: api.thumbnail,
    images: api.images?.length ? api.images : [api.thumbnail],
    rating: api.rating,
    count: 20 + ((api.id * 53) % 380),
    desc: api.description,
    tag: api.tags?.[0] ?? 'new',
    stock: api.stock,
    colors: [0, 1, 2, 3].map((offset) => PALETTE[(api.id + offset) % PALETTE.length]),
    specs,
    reviews: (api.reviews ?? []).map((r, i) => ({
      id: `r${api.id}-${i}`,
      name: r.reviewerName,
      text: r.comment,
      date: String(r.date).slice(0, 10),
      rating: r.rating,
      likes: (i * 3 + api.id) % 9,
    })),
  }
}

/** Fetches the fashion catalog. Rejects on network errors, HTTP errors and unexpected payloads. */
export async function fetchCatalog(signal?: AbortSignal): Promise<Product[]> {
  const response = await fetch(CATALOG_URL, { signal })
  if (!response.ok) throw new Error(`Catalog request failed with status ${response.status}`)
  const body: unknown = await response.json()
  if (!isRecord(body) || !Array.isArray(body.products)) throw new Error('Catalog response has an unexpected shape')
  return body.products.filter(isApiProduct).flatMap((api) => {
    const category = CATEGORIES.get(api.category)
    return category ? [toProduct(api, category.label, category.kind)] : []
  })
}
