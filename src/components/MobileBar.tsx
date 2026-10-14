import { GitCompare, Heart, Home, LucideIcon, ShoppingBag, Store } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Badge } from '@mui/material'
import { cartLines, useStore } from '@/store'
import { priceCart } from '@/lib/pricing'
import { cn } from '@/lib/utils'

const ITEM_CLASS = 'relative flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-bold uppercase'
const MIN_COMPARE = 2

type BarLinkProps = { to: string; active: boolean; Icon: LucideIcon; label: string; count?: number }

function BarLink({ to, active, Icon, label, count = 0 }: BarLinkProps) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={cn(ITEM_CLASS, active ? 'text-ac' : 'text-white/70')}
    >
      <Badge badgeContent={count} color="secondary">
        <Icon size={22} />
      </Badge>
      {label}
    </Link>
  )
}

/** Bottom navigation for phones: the four places people go most, with the current page highlighted. */
export function MobileBar() {
  const { pathname } = useLocation()
  const { cart, products, likes, compare, setCartOpen, setCompareOpen } = useStore()
  // The product page has its own sticky "Add to cart" bar.
  if (pathname.startsWith('/product')) return null
  const { itemCount } = priceCart(cartLines(cart, products))

  return (
    <>
      {compare.length >= MIN_COMPARE && (
        <button
          type="button"
          onClick={() => setCompareOpen(true)}
          className="fixed left-1/2 z-40 flex h-11 -translate-x-1/2 items-center gap-2 bg-ac px-5 text-xs font-bold uppercase text-black shadow-lg md:hidden"
          style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom))' }}
        >
          <GitCompare size={16} />
          Compare ({compare.length})
        </button>
      )}
      <nav
        aria-label="Quick actions"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t-2 border-ac bg-black/95 backdrop-blur md:hidden"
      >
        <BarLink to="/" active={pathname === '/'} Icon={Home} label="Home" />
        <BarLink to="/shop" active={pathname.startsWith('/shop')} Icon={Store} label="Shop" />
        <BarLink to="/wishlist" active={pathname === '/wishlist'} Icon={Heart} label="Saved" count={likes.length} />
        <button type="button" onClick={() => setCartOpen(true)} className={cn(ITEM_CLASS, 'text-white/70')}>
          <Badge badgeContent={itemCount} color="primary">
            <ShoppingBag size={22} />
          </Badge>
          Cart
        </button>
      </nav>
    </>
  )
}
