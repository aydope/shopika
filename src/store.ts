import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { fetchCatalog, type Product, type Review } from '@/data/products'
import { hasNumber, hasString, isRecord, isStringArray } from '@/lib/guards'

export type Order = { id: string; date: string; total: number; status: string; items: { name: string; qty: number; size: string }[] }
export type CartLine = { key: string; id: string; size: string; color: string; qty: number; product: Product }
export type CatalogStatus = 'loading' | 'ready' | 'error'

type StoreState = {
  products: Product[]
  catalogStatus: CatalogStatus
  cart: Record<string, number>
  likes: string[]
  compare: string[]
  recent: string[]
  comments: Record<string, Review[]>
  voted: string[]
  orders: Order[]
  premium: boolean
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
  addComment: (threadKey: string, comment: Review) => void
  toggleVote: (commentId: string) => void
  placeOrder: (total: number) => string
  togglePremium: () => void
  setCartOpen: (open: boolean) => void
  setCompareOpen: (open: boolean) => void
  setCoupon: (code: string) => void
}

const isReview = (v: unknown): v is Review =>
  isRecord(v) && hasString(v, 'id') && hasString(v, 'name') && hasString(v, 'text') && hasNumber(v, 'likes')
const isOrder = (v: unknown): v is Order =>
  isRecord(v) && hasString(v, 'id') && hasString(v, 'date') && hasString(v, 'status') && hasNumber(v, 'total') && Array.isArray(v.items)

/** localStorage content can be stale or edited by hand, so each persisted field is checked before it is trusted. */
function readPersisted(stored: unknown): Partial<StoreState> {
  if (!isRecord(stored)) return {}
  const restored: Partial<StoreState> = {}
  const { cart, likes, compare, recent, voted, premium, orders, comments } = stored
  if (isRecord(cart))
    restored.cart = Object.fromEntries(Object.entries(cart).filter((entry): entry is [string, number] => typeof entry[1] === 'number'))
  if (isStringArray(likes)) restored.likes = likes
  if (isStringArray(compare)) restored.compare = compare
  if (isStringArray(recent)) restored.recent = recent
  if (isStringArray(voted)) restored.voted = voted
  if (typeof premium === 'boolean') restored.premium = premium
  if (Array.isArray(orders)) restored.orders = orders.filter(isOrder)
  if (isRecord(comments)) {
    const threads: Record<string, Review[]> = {}
    for (const [key, thread] of Object.entries(comments)) {
      if (Array.isArray(thread)) threads[key] = thread.filter(isReview)
    }
    restored.comments = threads
  }
  return restored
}

const MAX_COMPARE = 3
const MAX_RECENT = 8
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

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      products: [],
      catalogStatus: 'loading',
      cart: {},
      likes: [],
      compare: [],
      recent: [],
      comments: {},
      voted: [],
      orders: [],
      premium: false,
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
      addComment: (threadKey, comment) =>
        set((s) => ({ comments: { ...s.comments, [threadKey]: [comment, ...(s.comments[threadKey] ?? [])] } })),
      toggleVote: (commentId) => set((s) => ({ voted: toggleItem(s.voted, commentId) })),
      placeOrder: (total) => {
        const id = 'SK-' + Date.now().toString().slice(-6)
        const { cart, products } = get()
        const items = cartLines(cart, products).map((l) => ({
          name: l.product.name,
          qty: l.qty,
          size: [l.size, l.color].filter(Boolean).join(', '),
        }))
        set((s) => ({
          orders: [{ id, date: new Date().toISOString().slice(0, 10), total, status: 'Processing', items }, ...s.orders],
          cart: {},
          coupon: '',
        }))
        return id
      },
      togglePremium: () => set((s) => ({ premium: !s.premium })),
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
        comments: s.comments,
        voted: s.voted,
        orders: s.orders,
        premium: s.premium,
      }),
    },
  ),
)

export const useProducts = () => useStore((s) => s.products)
