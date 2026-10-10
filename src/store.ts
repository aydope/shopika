import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { fetchCatalog, type Product, type Review } from '@/data/products'
import { hasNumber, hasString, isRecord, isStringArray } from '@/lib/guards'
import { DEFAULT_PROMOS, type Promo } from '@/lib/pricing'

export type OrderItem = { name: string; qty: number; size: string }
export type Order = { id: string; date: string; total: number; status: string; items: OrderItem[] }
export type CartLine = { key: string; id: string; size: string; color: string; qty: number; product: Product }
export type CatalogStatus = 'loading' | 'ready' | 'error'

type StoreState = {
  products: Product[]
  catalogStatus: CatalogStatus
  cart: Record<string, number>
  likes: string[]
  compare: string[]
  recent: string[]
  recentSearches: string[]
  comments: Record<string, Review[]>
  voted: string[]
  orders: Order[]
  promos: Promo[]
  cartOpen: boolean
  compareOpen: boolean
  coupon: string
  loadCatalog: (signal?: AbortSignal) => Promise<void>
  addToCart: (id: string, size?: string, color?: string, quantity?: number) => void
  decrementLine: (key: string) => void
  removeLine: (key: string) => void
  toggleLike: (id: string) => void
  toggleCompare: (id: string) => void
  markViewed: (id: string) => void
  rememberSearch: (term: string) => void
  clearSearches: () => void
  addComment: (threadKey: string, comment: Review) => void
  toggleVote: (commentId: string) => void
  placeOrder: (total: number) => string
  setOrderStatus: (orderId: string, status: string) => void
  addPromo: (promo: Promo) => void
  togglePromo: (code: string) => void
  setCartOpen: (open: boolean) => void
  setCompareOpen: (open: boolean) => void
  setCoupon: (code: string) => void
}

const MAX_COMPARE = 3
const MAX_RECENT = 8
const MAX_RECENT_SEARCHES = 5

const toggleItem = (list: string[], item: string, max = Infinity) =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item].slice(-max)

/** Cart keys have the form `productId:size:color`. Lines whose product is not in the catalog are dropped. */
export function cartLines(cart: Record<string, number>, products: Product[]): CartLine[] {
  const lines: CartLine[] = []
  for (const [key, qty] of Object.entries(cart)) {
    const [id, size = '', color = ''] = key.split(':')
    const product = products.find((p) => p.id === id)
    if (product) lines.push({ key, id, size, color, qty, product })
  }
  return lines
}

const isReview = (value: unknown): value is Review =>
  isRecord(value) &&
  hasString(value, 'id') &&
  hasString(value, 'name') &&
  hasString(value, 'text') &&
  hasNumber(value, 'likes')

const isOrder = (value: unknown): value is Order =>
  isRecord(value) &&
  hasString(value, 'id') &&
  hasString(value, 'date') &&
  hasString(value, 'status') &&
  hasNumber(value, 'total') &&
  Array.isArray(value.items)

const isPromo = (value: unknown): value is Promo =>
  isRecord(value) && hasString(value, 'code') && hasNumber(value, 'rate') && typeof value.active === 'boolean'

/** localStorage content can be stale or edited by hand, so each persisted field is checked before it is trusted. */
function readPersisted(stored: unknown): Partial<StoreState> {
  if (!isRecord(stored)) return {}
  const restored: Partial<StoreState> = {}
  const { cart, likes, compare, recent, recentSearches, voted, orders, comments, promos } = stored

  if (isRecord(cart)) {
    restored.cart = Object.fromEntries(
      Object.entries(cart).filter((entry): entry is [string, number] => typeof entry[1] === 'number'),
    )
  }
  if (isStringArray(likes)) restored.likes = likes
  if (isStringArray(compare)) restored.compare = compare
  if (isStringArray(recent)) restored.recent = recent
  if (isStringArray(recentSearches)) restored.recentSearches = recentSearches
  if (isStringArray(voted)) restored.voted = voted
  if (Array.isArray(orders)) restored.orders = orders.filter(isOrder)
  if (Array.isArray(promos)) restored.promos = promos.filter(isPromo)
  if (isRecord(comments)) {
    const threads: Record<string, Review[]> = {}
    for (const [key, thread] of Object.entries(comments)) {
      if (Array.isArray(thread)) threads[key] = thread.filter(isReview)
    }
    restored.comments = threads
  }
  return restored
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      products: [],
      catalogStatus: 'loading',
      cart: {},
      likes: [],
      compare: [],
      recent: [],
      recentSearches: [],
      comments: {},
      voted: [],
      orders: [],
      promos: DEFAULT_PROMOS,
      cartOpen: false,
      compareOpen: false,
      coupon: '',

      loadCatalog: async (signal) => {
        set({ catalogStatus: 'loading' })
        try {
          set({ products: await fetchCatalog(signal), catalogStatus: 'ready' })
        } catch (error) {
          if (signal?.aborted) return
          console.error('Could not load the product catalog', error)
          set({ catalogStatus: 'error' })
        }
      },

      addToCart: (id, size = '', color = '', quantity = 1) =>
        set((s) => {
          const key = `${id}:${size}:${color}`
          return { cart: { ...s.cart, [key]: (s.cart[key] ?? 0) + quantity }, cartOpen: true }
        }),

      decrementLine: (key) =>
        set((s) => {
          const { [key]: qty = 0, ...rest } = s.cart
          return { cart: qty > 1 ? { ...rest, [key]: qty - 1 } : rest }
        }),

      removeLine: (key) =>
        set((s) => {
          const { [key]: _removed, ...rest } = s.cart
          return { cart: rest }
        }),

      toggleLike: (id) => set((s) => ({ likes: toggleItem(s.likes, id) })),
      toggleCompare: (id) => set((s) => ({ compare: toggleItem(s.compare, id, MAX_COMPARE) })),
      markViewed: (id) => set((s) => ({ recent: [id, ...s.recent.filter((x) => x !== id)].slice(0, MAX_RECENT) })),

      rememberSearch: (term) =>
        set((s) => {
          const clean = term.trim()
          if (!clean) return {}
          const withoutDuplicate = s.recentSearches.filter((x) => x.toLowerCase() !== clean.toLowerCase())
          return { recentSearches: [clean, ...withoutDuplicate].slice(0, MAX_RECENT_SEARCHES) }
        }),
      clearSearches: () => set({ recentSearches: [] }),

      addComment: (threadKey, comment) =>
        set((s) => ({ comments: { ...s.comments, [threadKey]: [comment, ...(s.comments[threadKey] ?? [])] } })),
      toggleVote: (commentId) => set((s) => ({ voted: toggleItem(s.voted, commentId) })),

      placeOrder: (total) => {
        const id = 'SK-' + Date.now().toString().slice(-6)
        const { cart, products } = get()
        const items = cartLines(cart, products).map((line) => ({
          name: line.product.name,
          qty: line.qty,
          size: [line.size, line.color].filter(Boolean).join(', '),
        }))
        const order: Order = { id, date: new Date().toISOString().slice(0, 10), total, status: 'Processing', items }
        set((s) => ({ orders: [order, ...s.orders], cart: {}, coupon: '' }))
        return id
      },
      setOrderStatus: (orderId, status) =>
        set((s) => ({ orders: s.orders.map((order) => (order.id === orderId ? { ...order, status } : order)) })),

      addPromo: (promo) => set((s) => ({ promos: [...s.promos, promo] })),
      togglePromo: (code) =>
        set((s) => ({
          promos: s.promos.map((promo) => (promo.code === code ? { ...promo, active: !promo.active } : promo)),
        })),

      setCartOpen: (cartOpen) => set({ cartOpen }),
      setCompareOpen: (compareOpen) => set({ compareOpen }),
      setCoupon: (coupon) => set({ coupon }),
    }),
    {
      name: 'shopika',
      merge: (stored, current) => ({ ...current, ...readPersisted(stored) }),
      partialize: (s) => ({
        cart: s.cart,
        likes: s.likes,
        compare: s.compare,
        recent: s.recent,
        recentSearches: s.recentSearches,
        comments: s.comments,
        voted: s.voted,
        orders: s.orders,
        promos: s.promos,
      }),
    },
  ),
)

export const useProducts = () => useStore((s) => s.products)
