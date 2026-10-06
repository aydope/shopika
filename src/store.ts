import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { products, type Product, type Review } from '@/data/products'
export type Order = { id: string; date: string; total: number; status: string; items: { name: string; qty: number; size: string }[] }
type S = { cart: Record<string, number>; likes: string[]; compare: string[]; recent: string[]; comments: Record<string, Review[]>; voted: string[]; orders: Order[]; premium: boolean; cartOpen: boolean; cmpOpen: boolean; coupon: string; ready: boolean
  add: (id: string, size?: string, color?: string) => void; addComment: (k: string, c: Review) => void; vote: (id: string) => void; dec: (k: string) => void; rm: (k: string) => void; like: (id: string) => void; cmp: (id: string) => void; view: (id: string) => void; placeOrder: (total: number) => string
  togglePremium: () => void; setCart: (b: boolean) => void; setCmp: (b: boolean) => void; setCoupon: (c: string) => void; setReady: () => void }
const tog = (a: string[], id: string, max = 99) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id].slice(-max))
export type Line = { k: string; id: string; size: string; color: string; q: number; p: Product }
export const lines = (cart: Record<string, number>) => Object.entries(cart).map(([k, q]) => { const [id, size, color] = k.split(':'); return { k, id, size, color, q, p: products.find((x) => x.id === id) } }).filter((l) => !!l.p) as Line[]
export const useStore = create<S>()(persist((set, get) => ({
  cart: {}, likes: [], compare: [], recent: [], comments: {}, voted: [], orders: [], premium: false, cartOpen: false, cmpOpen: false, coupon: '', ready: false,
  addComment: (k, c) => set((s) => ({ comments: { ...s.comments, [k]: [c, ...(s.comments[k] || [])] } })), vote: (id) => set((s) => ({ voted: tog(s.voted, id) })),
  add: (id, size = '', color = '') => set((s) => { const k = `${id}:${size}:${color}`; return { cart: { ...s.cart, [k]: (s.cart[k] || 0) + 1 }, cartOpen: true } }),
  dec: (k) => set((s) => { const c = { ...s.cart }; c[k] > 1 ? c[k]-- : delete c[k]; return { cart: c } }),
  rm: (k) => set((s) => { const c = { ...s.cart }; delete c[k]; return { cart: c } }),
  like: (id) => set((s) => ({ likes: tog(s.likes, id) })), cmp: (id) => set((s) => ({ compare: tog(s.compare, id, 3) })),
  view: (id) => set((s) => ({ recent: [id, ...s.recent.filter((x) => x !== id)].slice(0, 8) })),
  placeOrder: (total) => { const id = 'SK-' + Date.now().toString().slice(-6); set((s) => ({ orders: [{ id, date: new Date().toISOString().slice(0, 10), total, status: 'Processing', items: lines(get().cart).map((l) => ({ name: l.p.name, qty: l.q, size: [l.size, l.color].filter(Boolean).join(', ') })) }, ...s.orders], cart: {}, coupon: '' })); return id },
  togglePremium: () => set((s) => ({ premium: !s.premium })), setCart: (b) => set({ cartOpen: b }), setCmp: (b) => set({ cmpOpen: b }), setCoupon: (coupon) => set({ coupon }), setReady: () => set({ ready: true }),
}), { name: 'shopika', partialize: (s) => ({ cart: s.cart, likes: s.likes, compare: s.compare, recent: s.recent, comments: s.comments, voted: s.voted, orders: s.orders, premium: s.premium }) }))
