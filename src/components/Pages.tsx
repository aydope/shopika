import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HeartOff, CheckCircle2, ShoppingBag, Frown } from 'lucide-react'
import { useStore, lines } from '@/store'
import { useAuth } from '@/auth'
import { products } from '@/data/products'
import { ProductCard } from './ProductCard'
import { Button } from '@/components/ui/button'
import { usd } from '@/lib/utils'
import { usePage } from './Utils'
const Empty = ({ I, t, to, c }: any) => <div className="mx-auto max-w-md px-4 py-28 text-center"><I className="mx-auto mb-4 text-ac" size={56} /><h1 className="display mb-6 text-2xl">{t}</h1><Link to={to}><Button>{c}</Button></Link></div>
export function Wishlist() {
  usePage('Wishlist', 'Your saved ShopiKa products.')
  const likes = useStore((s) => s.likes), l = products.filter((p) => likes.includes(p.id))
  if (!l.length) return <Empty I={HeartOff} t="Nothing saved yet" to="/shop" c="Browse gear" />
  return <div className="mx-auto max-w-7xl px-4 py-10"><h1 className="display mb-6 text-3xl sm:text-5xl">WISH<span className="grad">LIST</span></h1><div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{l.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}</div></div>
}
export const NotFound = () => <Empty I={Frown} t="404: page not found" to="/" c="Go home" />
const F: [string, string, string, string][] = [['name', 'Full name', 'text', 'name'], ['email', 'Email', 'email', 'email'], ['address', 'Street address', 'text', 'street-address'], ['city', 'City', 'text', 'address-level2'], ['zip', 'Postal code', 'text', 'postal-code']]
export function Checkout() {
  usePage('Checkout', 'Complete your ShopiKa order.')
  const { cart, coupon, placeOrder } = useStore(), user = useAuth((s) => s.user)
  const [f, setF] = useState<Record<string, string>>({ name: user?.name || '', email: user?.email || '', address: '', city: '', zip: '' }), [err, setErr] = useState<Record<string, string>>({}), [order, setOrder] = useState('')
  const items = lines(cart), sub = items.reduce((a, l) => a + l.p.price * l.q, 0), disc = coupon === 'SHOPI20' ? sub * 0.2 : 0, ship = sub - disc >= 150 ? 0 : 9.9, total = sub - disc + ship
  if (order) return <div className="mx-auto max-w-md px-4 py-28 text-center"><CheckCircle2 className="mx-auto mb-4 text-ac" size={64} /><h1 className="display mb-2 text-3xl">ORDER CONFIRMED</h1><p className="text-white/70">Order <b className="text-ac">{order}</b> is being prepared. We sent a confirmation to {f.email}.</p><div className="mt-6 flex justify-center gap-3"><Link to="/track"><Button variant="outline">Track order</Button></Link><Link to="/"><Button>Keep shopping</Button></Link></div></div>
  if (!items.length) return <Empty I={ShoppingBag} t="Your bag is empty" to="/shop" c="Shop now" />
  const submit = () => {
    const e: Record<string, string> = {}
    if (f.name.trim().length < 2) e.name = 'Please enter your name'; if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Please enter a valid email'; if (f.address.trim().length < 5) e.address = 'Please enter your street address'; if (f.city.trim().length < 2) e.city = 'Please enter your city'; if (f.zip.trim().length < 4) e.zip = 'Please enter your postal code'
    setErr(e); if (!Object.keys(e).length) setOrder(placeOrder(total))
  }
  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[1fr_380px]">
      <form noValidate onSubmit={(e) => { e.preventDefault(); submit() }}><h1 className="display mb-6 text-3xl sm:text-4xl">CHECK<span className="grad">OUT</span></h1>
        {!user && <p className="mb-4 text-sm text-white/60">Have an account? <Link to="/login" className="text-ac underline">Sign in</Link> for faster checkout.</p>}
        <div className="space-y-4">{F.map(([k, l, t, ac]) => <label key={k} className="block text-sm text-white/80">{l}<input type={t} autoComplete={ac} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} aria-invalid={!!err[k]} className={`mt-1 h-12 w-full border-2 bg-black px-3 text-white outline-none focus:border-ac ${err[k] ? 'border-ac2' : 'border-white/20'}`} />{err[k] && <span role="alert" className="text-ac2">{err[k]}</span>}</label>)}</div>
        <Button type="submit" className="mt-6 w-full">Place order · {usd(total)}</Button><p className="mt-3 text-center text-xs text-white/50">By placing your order you accept our <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.</p></form>
      <aside className="h-fit border-2 border-ac p-4"><h2 className="display mb-3">SUMMARY</h2>{items.map((l) => <div key={l.k} className="flex items-center gap-3 py-2 text-sm"><img src={l.p.img} alt="" className="h-12 w-12 bg-neutral-100 object-contain p-1" /><span className="line-clamp-2 flex-1">{l.p.name}{(l.size || l.color) && ` (${[l.size, l.color].filter(Boolean).join(', ')})`} x {l.q}</span><b>{usd(l.p.price * l.q)}</b></div>)}
        <div className="mt-3 space-y-1 border-t border-white/20 pt-3 text-sm"><div className="flex justify-between"><span>Subtotal</span>{usd(sub)}</div>{disc > 0 && <div className="flex justify-between text-ac"><span>SHOPI20</span>-{usd(disc)}</div>}<div className="flex justify-between"><span>Shipping</span>{ship ? usd(ship) : 'FREE'}</div></div></aside>
    </div>
  )
}
