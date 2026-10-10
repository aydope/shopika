import type { CartLine } from '@/store'

export const FREE_SHIPPING_THRESHOLD = 150
export const SHIPPING_FEE = 9.9

export type Promo = { code: string; rate: number; active: boolean }

export const DEFAULT_PROMOS: Promo[] = [{ code: 'SHOPI20', rate: 0.2, active: true }]

/** Returns the active promo that matches the typed code, ignoring case and surrounding spaces. */
export function findPromo(promos: Promo[], code: string) {
  const normalized = code.trim().toUpperCase()
  return promos.find((promo) => promo.active && promo.code === normalized)
}

export function priceCart(lines: CartLine[], promo?: Promo) {
  const itemCount = lines.reduce((sum, line) => sum + line.qty, 0)
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.qty, 0)
  const discount = promo ? subtotal * promo.rate : 0
  const discounted = subtotal - discount
  const isFreeShipping = lines.length === 0 || discounted >= FREE_SHIPPING_THRESHOLD
  const shipping = isFreeShipping ? 0 : SHIPPING_FEE

  return {
    itemCount,
    subtotal,
    promoCode: promo?.code,
    discount,
    shipping,
    total: discounted + shipping,
    freeShippingGap: Math.max(0, FREE_SHIPPING_THRESHOLD - discounted),
  }
}
