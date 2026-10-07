import { Store, GitCompare, ShoppingBag } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Badge } from '@mui/material'
import { useStore, lines } from '@/store'
import { usd } from '@/lib/utils'
export function MobileBar() {
  const loc = useLocation()
  const { cart, compare, setCart, setCmp } = useStore()
  const total = lines(cart).reduce((a, l) => a + l.p.price * l.q, 0)
  if (loc.pathname.startsWith('/product')) return null
  const c = 'flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold uppercase active:text-ac'
  return (
    <nav aria-label="Quick actions" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t-2 border-ac bg-black/90 backdrop-blur md:hidden">
      <a href="/shop" className={c}><Store size={20} />Shop</a>
      <button onClick={() => setCmp(true)} className={c}><Badge badgeContent={compare.length} color="secondary"><GitCompare size={20} /></Badge>Compare</button>
      <button onClick={() => setCart(true)} className={c}><ShoppingBag size={20} />{usd(total)}</button>
    </nav>
  )
}
