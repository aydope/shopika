import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HeartOff, CheckCircle2, ShoppingBag, Frown, type LucideIcon } from 'lucide-react'
import { cartLines, useStore } from '@/store'
import { useAuth } from '@/auth'
import { findPromo, priceCart } from '@/lib/pricing'
import { hasErrors, hasMinLength, isEmail, type FormErrors } from '@/lib/validation'
import { usd } from '@/lib/utils'
import { ProductCard } from './ProductCard'
import { Button, ButtonLink } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { usePage } from './Utils'

function EmptyState({ Icon, title, to, action }: { Icon: LucideIcon; title: string; to: string; action: string }) {
  return (
    <div className="mx-auto max-w-md px-4 py-28 text-center">
      <Icon className="mx-auto mb-4 text-ac" size={56} />
      <h1 className="display mb-6 text-2xl">{title}</h1>
      <ButtonLink to={to}>{action}</ButtonLink>
    </div>
  )
}

export function Wishlist() {
  usePage('Wishlist', 'Your saved ShopiKa products.')
  const { likes, products } = useStore()
  const saved = products.filter((p) => likes.includes(p.id))
  if (saved.length === 0) return (
    <EmptyState Icon={HeartOff} title="Nothing saved yet" to="/shop" action="Browse gear" />
  )
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="display mb-6 text-3xl sm:text-5xl">WISH<span className="grad">LIST</span></h1>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {saved.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
      </div>
    </div>
  )
}

export const NotFound = () => <EmptyState Icon={Frown} title="404: page not found" to="/" action="Go home" />

type CheckoutField = 'name' | 'email' | 'address' | 'city' | 'zip'
const CHECKOUT_FIELDS: { name: CheckoutField; label: string; type?: 'email'; autoComplete: string }[] = [
  { name: 'name', label: 'Full name', autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'address', label: 'Street address', autoComplete: 'street-address' },
  { name: 'city', label: 'City', autoComplete: 'address-level2' },
  { name: 'zip', label: 'Postal code', autoComplete: 'postal-code' },
]

function validateCheckout(form: Record<CheckoutField, string>): FormErrors<CheckoutField> {
  const errors: FormErrors<CheckoutField> = {}
  if (!hasMinLength(form.name, 2)) errors.name = 'Please enter your name'
  if (!isEmail(form.email)) errors.email = 'Please enter a valid email'
  if (!hasMinLength(form.address, 5)) errors.address = 'Please enter your street address'
  if (!hasMinLength(form.city, 2)) errors.city = 'Please enter your city'
  if (!hasMinLength(form.zip, 4)) errors.zip = 'Please enter your postal code'
  return errors
}

export function Checkout() {
  usePage('Checkout', 'Complete your ShopiKa order.')
  const { cart, products, promos, coupon, placeOrder } = useStore()
  const user = useAuth((s) => s.user)
  const [form, setForm] = useState<Record<CheckoutField, string>>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    address: '',
    city: '',
    zip: '',
  })
  const [errors, setErrors] = useState<FormErrors<CheckoutField>>({})
  const [orderId, setOrderId] = useState('')
  const lines = cartLines(cart, products)
  const { subtotal, promoCode, discount, shipping, total } = priceCart(lines, findPromo(promos, coupon))

  if (orderId) {
    return (
      <div className="mx-auto max-w-md px-4 py-28 text-center">
        <CheckCircle2 className="mx-auto mb-4 text-ac" size={64} />
        <h1 className="display mb-2 text-3xl">ORDER CONFIRMED</h1>
        <p className="text-white/70">
          Order{' '}
          <b className="text-ac">{orderId}</b>
          is being prepared. We sent a confirmation to{' '}
          {form.email}
          .
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink to="/track" variant="outline">
            Track order
          </ButtonLink>
          <ButtonLink to="/">Keep shopping</ButtonLink>
        </div>
      </div>
    )
  }
  if (lines.length === 0) return (
    <EmptyState Icon={ShoppingBag} title="Your bag is empty" to="/shop" action="Shop now" />
  )

  const submit = () => {
    const found = validateCheckout(form)
    setErrors(found)
    if (!hasErrors(found)) setOrderId(placeOrder(total))
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[1fr_380px]">
      <form noValidate onSubmit={(e) => { e.preventDefault(); submit() }}>
        <h1 className="display mb-6 text-3xl sm:text-4xl">CHECK<span className="grad">OUT</span></h1>
        {!user && (
          <p className="mb-4 text-sm text-white/60">
            Have an account?{' '}
            <Link to="/login" className="text-ac underline">Sign in</Link>
            for faster checkout.
          </p>
        )}
        <div className="space-y-4">
          {CHECKOUT_FIELDS.map(({ name, label, type, autoComplete }) => (
            
              <Field
                key={name}
                label={label}
                type={type}
                autoComplete={autoComplete}
                value={form[name]}
                onChange={(value) => setForm({ ...form, [name]: value })}
                error={errors[name]}
              />
            
          ))}
        </div>
        <Button type="submit" className="mt-6 w-full">Place order · {usd(total)}</Button>
        <p className="mt-3 text-center text-xs text-white/50">
          By placing your order you accept our{' '}
          <Link to="/terms" className="underline">Terms</Link>
          and{' '}
          <Link to="/privacy" className="underline">Privacy Policy</Link>
          .
        </p>
      </form>
      <aside className="h-fit border-2 border-ac p-4">
        <h2 className="display mb-3">SUMMARY</h2>
        {lines.map(({ key, size, color, qty, product }) => {
          const options = [size, color].filter(Boolean).join(', ')
          return (
            <div key={key} className="flex items-center gap-3 py-2 text-sm">
              <img src={product.img} alt="" className="h-12 w-12 bg-neutral-100 object-contain p-1" />
              <span className="line-clamp-2 flex-1">{product.name}{options && ` (${options})`} x {qty}</span>
              <b>{usd(product.price * qty)}</b>
            </div>
          )
        })}
        <div className="mt-3 space-y-1 border-t border-white/20 pt-3 text-sm">
          <div className="flex justify-between"><span>Subtotal</span>{usd(subtotal)}</div>
          {discount > 0 && <div className="flex justify-between text-ac"><span>{promoCode}</span>-{usd(discount)}</div>}
          <div className="flex justify-between"><span>Shipping</span>{shipping ? usd(shipping) : 'FREE'}</div>
        </div>
      </aside>
    </div>
  )
}
