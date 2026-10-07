import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, Crown, GitCompare, Menu, X, Heart, User } from 'lucide-react'
import { Badge, Drawer } from '@mui/material'
import { useStore } from '@/store'
import { useAuth } from '@/auth'
import { products } from '@/data/products'
import { usd } from '@/lib/utils'
import { Button } from '@/components/ui/button'
const getCats = () => [...new Set(products.map((p) => p.cat))]
export const Logo = () => <a href="#top" className="display text-xl font-black sm:text-2xl" aria-label="ShopiKa home">SHOPI<span className="grad">KA</span><span className="text-ac">*</span></a>
const hl = (t: string, q: string) => { const i = t.toLowerCase().indexOf(q.toLowerCase()); return i < 0 || !q ? t : <>{t.slice(0, i)}<mark className="bg-ac text-black">{t.slice(i, i + q.length)}</mark>{t.slice(i + q.length)}</> }
export function Header() {
  const { cart, likes, premium, togglePremium, setCart, add, compare, setCmp } = useStore()
  const [q, setQ] = useState(''), [mega, setMega] = useState(false), [focus, setFocus] = useState(false), [nav, setNav] = useState(false), [sOpen, setSOpen] = useState(false)
  const ref = useRef<HTMLInputElement>(null), cats = getCats(), user = useAuth((s) => s.user), navigate = useNavigate()
  const n = Object.values(cart).reduce((a, b) => a + b, 0)
  const res = useMemo(() => q.trim() ? products.filter((p) => `${p.name} ${p.cat} ${p.tag}`.toLowerCase().includes(q.toLowerCase())).slice(0, 5) : [], [q])
  useEffect(() => { const f = (e: KeyboardEvent) => { if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') { e.preventDefault(); ref.current?.focus() } }; addEventListener('keydown', f); return () => removeEventListener('keydown', f) }, [])
  const link = 'block py-3 text-lg font-bold uppercase hover:text-ac'
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ac bg-black/80 backdrop-blur" style={{ paddingTop: 'env(safe-area-inset-top)' }} onMouseLeave={() => setMega(false)}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 p-3 sm:gap-4 sm:p-4">
        <button className="grid h-10 w-10 place-items-center md:hidden" aria-label="Open menu" onClick={() => setNav(true)}><Menu /></button>
        <Logo />
        <nav className="hidden gap-6 text-sm font-bold uppercase md:flex" aria-label="Main">
          <a href="/shop" onMouseEnter={() => setMega(true)} onFocus={() => setMega(true)} className="hover:text-ac">Shop</a>
          <a href="#deals" className="hover:text-ac">Deals</a><a href="#about" className="hover:text-ac">About</a><a href="/blog" className="hover:text-ac">Journal</a>
        </nav>
        <div className={`relative order-last w-full md:order-none md:ml-auto md:block md:max-w-sm ${sOpen ? 'block' : 'hidden'}`}>
          <Search size={16} className="absolute left-3 top-3.5 text-ac" />
          <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && q.trim()) { navigate(`/shop?q=${encodeURIComponent(q.trim())}`); setFocus(false); (e.target as HTMLInputElement).blur() } }} onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)} placeholder="Search drops…  ( / )" aria-label="Search products" className="h-11 w-full border-2 border-white/20 bg-black pl-9 pr-3 outline-none focus:border-ac" />
          {focus && q && <ul className="absolute z-50 mt-1 w-full border-2 border-ac bg-black">
            {res.length ? res.map((p) => <li key={p.id} className="flex items-center justify-between p-3 text-sm hover:bg-white/10"><a href={`/product/${p.id}`} className="flex items-center gap-2"><img src={p.img} alt="" className="h-8 w-8 bg-neutral-100 object-contain" />{hl(p.name, q)}</a><span className="shrink-0 text-xs font-bold text-ac">{usd(p.price)}</span></li>) : <li className="p-3 text-sm text-white/50">No results for “{q}”</li>}</ul>}
        </div>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Toggle search" onClick={() => { setSOpen((o) => !o); setTimeout(() => ref.current?.focus(), 50) }}><Search size={20} /></Button>
          <a href={user ? (user.role === 'admin' ? '/admin' : '/account') : '/login'} aria-label={user ? 'My account' : 'Sign in'} className="hidden h-11 w-11 place-items-center hover:text-ac md:grid"><User size={20} /></a>
          <a href="/wishlist" aria-label="Wishlist" className="hidden h-10 w-10 place-items-center md:grid"><Badge badgeContent={likes.length} color="secondary"><Heart size={20} /></Badge></a>
          <Button variant="ghost" size="icon" className="hidden md:inline-flex" aria-label="Compare" onClick={() => setCmp(true)}><Badge badgeContent={compare.length} color="secondary"><GitCompare size={20} /></Badge></Button>
          <Button variant={premium ? 'solid' : 'outline'} size="sm" onClick={togglePremium} aria-pressed={premium} aria-label="Toggle VIP gold theme"><Crown size={14} /><span className="hidden sm:inline">{premium ? 'Gold' : 'VIP'}</span></Button>
          <Button variant="ghost" size="icon" aria-label="Open cart" onClick={() => setCart(true)}><Badge badgeContent={n} color="primary"><ShoppingBag size={20} /></Badge></Button>
        </div>
      </div>
      {mega && <div className="hidden border-t border-white/10 bg-black md:block"><div className="mx-auto grid max-w-7xl grid-cols-4 gap-6 p-8">
        {cats.map((c) => <div key={c}><h4 className="display mb-3 text-ac">{c}</h4>{products.filter((p) => p.cat === c).map((p) => <a key={p.id} href="/shop" className="block py-1 text-sm hover:translate-x-1 hover:text-ac2">{p.name}</a>)}</div>)}</div></div>}
      <Drawer anchor="left" open={nav} onClose={() => setNav(false)} PaperProps={{ sx: { width: '82%', maxWidth: 340, p: 3, border: '2px solid var(--ac)' } }}>
        <div className="mb-4 flex items-center justify-between"><Logo /><button aria-label="Close menu" onClick={() => setNav(false)}><X /></button></div>
        <nav onClick={() => setNav(false)}>
          <a href="/shop" className={link}>Shop all</a><a href="/wishlist" className={link}>Wishlist</a><a href={user ? '/account' : '/login'} className={link}>{user ? 'My account' : 'Sign in'}</a><a href="/blog" className={link}>Journal</a><a href="/track" className={link}>Track order</a><a href="/contact" className={link}>Contact</a><a href="#deals" className={link}>Deals</a><a href="#about" className={link}>About</a>
          <p className="display mb-1 mt-6 text-xs text-ac">CATEGORIES</p>
          {cats.map((c) => <a key={c} href="#catalog" className="block py-2 text-white/70">{c}</a>)}
        </nav>
      </Drawer>
    </header>
  )
}
