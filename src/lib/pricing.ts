import type { CartLine } from '@/store'

export const FREE_SHIPPING_THRESHOLD = 150
export const SHIPPING_FEE = 9.9
export const PROMO_CODE = 'SHOPI20'
export const PROMO_RATE = 0.2

export const isValidPromo = (code: string) => code.trim().toUpperCase() === PROMO_CODE

export function priceCart(lines: CartLine[], coupon: string) {
  const itemCount = lines.reduce((sum, l) => sum + l.qty, 0)
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0)
  const promoApplied = isValidPromo(coupon)
  const discount = promoApplied ? subtotal * PROMO_RATE : 0
  const discounted = subtotal - discount
  const shipping = lines.length === 0 || discounted >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  return {
    itemCount,
    subtotal,
    promoApplied,
    discount,
    shipping,
    total: discounted + shipping,
    freeShippingGap: Math.max(0, FREE_SHIPPING_THRESHOLD - discounted),
  }
}
