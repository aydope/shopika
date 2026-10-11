import { Store, GitCompare, ShoppingBag } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Badge } from '@mui/material'
import { cartLines, useStore } from '@/store'
import { priceCart } from '@/lib/pricing'
import { usd } from '@/lib/utils'

const ITEM_CLASS = 'flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold uppercase active:text-ac'

export function MobileBar() {
  const { pathname } = useLocation()
  const { cart, products, coupon, compare, setCartOpen, setCompareOpen } = useStore()
  // The product page has its own sticky "Add to cart" bar.
  if (pathname.startsWith('/product')) return null
  const { subtotal } = priceCart(cartLines(cart, products), coupon)
  return (
    <nav
      aria-label="Quick actions"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t-2 border-ac bg-black/90 backdrop-blur md:hidden"
    >
      <a href="/shop" className={ITEM_CLASS}>
        <Store size={20} />
        Shop
      </a>
      <button type="button" onClick={() => setCompareOpen(true)} className={ITEM_CLASS}>
        <Badge badgeContent={compare.length} color="secondary">
          <GitCompare size={20} />
        </Badge>
        Compare
      </button>
      <button type="button" onClick={() => setCartOpen(true)} className={ITEM_CLASS}>
        <ShoppingBag size={20} />
        {usd(subtotal)}
      </button>
    </nav>
  )
}
