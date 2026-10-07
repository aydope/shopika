import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Drawer, LinearProgress } from '@mui/material'
import { Minus, Plus, Trash2, X } from 'lucide-react'
import { useStore, lines } from '@/store'
import { Button } from '@/components/ui/button'
import { usd } from '@/lib/utils'
export function Cart() {
  const { cart, cartOpen, setCart, add, dec, rm, coupon, setCoupon } = useStore(), nav = useNavigate(), [code, setCode] = useState(''), [bad, setBad] = useState(false)
  const items = lines(cart), sub = items.reduce((a, l) => a + l.p.price * l.q, 0), disc = coupon === 'SHOPI20' ? sub * 0.2 : 0, ship = sub - disc >= 150 || !sub ? 0 : 9.9, total = sub - disc + ship
  const apply = () => { const ok = code === 'SHOPI20'; setBad(!ok); if (ok) setCoupon(code) }
  return (
    <Drawer anchor="right" open={cartOpen} onClose={() => setCart(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, p: 2.5, pb: 'calc(20px + env(safe-area-inset-bottom))', border: '2px solid var(--ac)' } }}>
      <div className="mb-4 flex items-center justify-between"><h2 className="display text-xl">CART <span className="text-ac">({items.length})</span></h2><button aria-label="Close cart" className="grid h-11 w-11 place-items-center" onClick={() => setCart(false)}><X /></button></div>
      <p className="mb-1 text-xs uppercase">{sub - disc >= 150 ? 'Free shipping unlocked' : `${usd(150 - (sub - disc))} to free shipping`}</p>
      <LinearProgress variant="determinate" value={Math.min(100, ((sub - disc) / 150) * 100)} sx={{ mb: 3, height: 8, '& .MuiLinearProgress-bar': { bgcolor: 'var(--ac)' }, bgcolor: '#222' }} />
      <div className="flex-1 space-y-3 overflow-auto">
        {!items.length && <p className="py-20 text-center text-white/60">Your bag is empty. Go cop something loud.</p>}
        {items.map((l) => <div key={l.k} className="flex items-center gap-3 border border-white/10 p-3">
          <img src={l.p.img} alt="" className="h-16 w-16 bg-neutral-100 object-contain p-1" /><div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-bold">{l.p.name}</p><p className="text-xs text-white/50">{[l.size && `Size ${l.size}`, l.color].filter(Boolean).join(" | ")}</p><p className="text-ac">{usd(l.p.price * l.q)}</p></div>
          <div className="flex items-center"><button aria-label="Decrease quantity" className="grid h-11 w-9 place-items-center" onClick={() => dec(l.k)}><Minus size={16} /></button><b>{l.q}</b><button aria-label="Increase quantity" className="grid h-11 w-9 place-items-center" onClick={() => add(l.id, l.size, l.color)}><Plus size={16} /></button></div>
          <button aria-label={`Remove ${l.p.name}`} onClick={() => rm(l.k)} className="grid h-11 w-9 place-items-center text-ac2"><Trash2 size={16} /></button></div>)}
      </div>
      <div className="mt-4 space-y-2 border-t-2 border-ac pt-4 text-sm">
        <div className="flex gap-2"><input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} aria-label="Promo code" aria-invalid={bad} placeholder="Promo code" className="h-11 flex-1 border-2 border-white/20 bg-black px-3 outline-none focus:border-ac" /><Button size="sm" className="h-11" variant="outline" onClick={apply}>Apply</Button></div>
        {bad && <p role="alert" className="text-ac2">That code is not valid</p>}{disc > 0 && <p className="text-ac">Code SHOPI20 applied</p>}
        <div className="flex justify-between"><span>Subtotal</span><span>{usd(sub)}</span></div>{disc > 0 && <div className="flex justify-between text-ac"><span>Discount</span><span>-{usd(disc)}</span></div>}
        <div className="flex justify-between"><span>Shipping</span><span>{ship ? usd(ship) : 'FREE'}</span></div>
        <div className="display flex justify-between text-xl"><span>Total</span><span className="text-ac">{usd(total)}</span></div>
        <Button className="w-full" disabled={!items.length} onClick={() => { setCart(false); nav('/checkout') }}>Checkout</Button>
      </div>
    </Drawer>
  )
}
