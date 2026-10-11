import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Drawer, LinearProgress } from '@mui/material'
import { Minus, Plus, Trash2, X } from 'lucide-react'
import { cartLines, useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { FREE_SHIPPING_THRESHOLD, isValidPromo, priceCart, PROMO_CODE } from '@/lib/pricing'
import { usd } from '@/lib/utils'

export function Cart() {
  const { cart, products, cartOpen, setCartOpen, addToCart, decrementLine, removeLine, coupon, setCoupon } = useStore()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [codeRejected, setCodeRejected] = useState(false)
  const lines = cartLines(cart, products)
  const { subtotal, promoApplied, discount, shipping, total, freeShippingGap } = priceCart(lines, coupon)

  const applyPromo = () => {
    const valid = isValidPromo(code)
    setCodeRejected(!valid)
    if (valid) setCoupon(PROMO_CODE)
  }
  const goToCheckout = () => {
    setCartOpen(false)
    navigate('/checkout')
  }

  return (
    <Drawer
      anchor="right"
      open={cartOpen}
      onClose={() => setCartOpen(false)}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 420 }, p: 2.5, pb: 'calc(20px + env(safe-area-inset-bottom))', border: '2px solid var(--ac)' },
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="display text-xl">
          CART <span className="text-ac">({lines.length})</span>
        </h2>
        <button type="button" aria-label="Close cart" className="grid h-11 w-11 place-items-center" onClick={() => setCartOpen(false)}>
          <X />
        </button>
      </div>
      <p className="mb-1 text-xs uppercase">
        {freeShippingGap === 0 ? 'Free shipping unlocked' : `${usd(freeShippingGap)} to free shipping`}
      </p>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, ((FREE_SHIPPING_THRESHOLD - freeShippingGap) / FREE_SHIPPING_THRESHOLD) * 100)}
        sx={{ mb: 3, height: 8, '& .MuiLinearProgress-bar': { bgcolor: 'var(--ac)' }, bgcolor: '#222' }}
      />
      <div className="flex-1 space-y-3 overflow-auto">
        {lines.length === 0 && <p className="py-20 text-center text-white/60">Your bag is empty. Go cop something loud.</p>}
        {lines.map(({ key, id, size, color, qty, product }) => (
          <div key={key} className="flex items-center gap-3 border border-white/10 p-3">
            <img src={product.img} alt="" className="h-16 w-16 bg-neutral-100 object-contain p-1" />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-bold">{product.name}</p>
              <p className="text-xs text-white/50">{[size && `Size ${size}`, color].filter(Boolean).join(' | ')}</p>
              <p className="text-ac">{usd(product.price * qty)}</p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                aria-label="Decrease quantity"
                className="grid h-11 w-9 place-items-center"
                onClick={() => decrementLine(key)}
              >
                <Minus size={16} />
              </button>
              <b>{qty}</b>
              <button
                type="button"
                aria-label="Increase quantity"
                className="grid h-11 w-9 place-items-center"
                onClick={() => addToCart(id, size, color)}
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              type="button"
              aria-label={`Remove ${product.name}`}
              onClick={() => removeLine(key)}
              className="grid h-11 w-9 place-items-center text-ac2"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2 border-t-2 border-ac pt-4 text-sm">
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            aria-label="Promo code"
            aria-invalid={codeRejected}
            placeholder="Promo code"
            className="h-11 flex-1 border-2 border-white/20 bg-black px-3 outline-none focus:border-ac"
          />
          <Button size="sm" className="h-11" variant="outline" onClick={applyPromo}>
            Apply
          </Button>
        </div>
        {codeRejected && (
          <p role="alert" className="text-ac2">
            That code is not valid
          </p>
        )}
        {promoApplied && <p className="text-ac">Code {PROMO_CODE} applied</p>}
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{usd(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-ac">
            <span>Discount</span>
            <span>-{usd(discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{shipping ? usd(shipping) : 'FREE'}</span>
        </div>
        <div className="display flex justify-between text-xl">
          <span>Total</span>
          <span className="text-ac">{usd(total)}</span>
        </div>
        <Button className="w-full" disabled={lines.length === 0} onClick={goToCheckout}>
          Checkout
        </Button>
      </div>
    </Drawer>
  )
}
