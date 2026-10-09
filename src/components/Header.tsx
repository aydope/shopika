import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, Crown, GitCompare, Menu, X, Heart, User } from 'lucide-react'
import { Badge, Drawer } from '@mui/material'
import { cartLines, useStore } from '@/store'
import { useAuth } from '@/auth'
import { categoriesOf } from '@/data/products'
import { priceCart } from '@/lib/pricing'
import { usd } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { isTypingTarget } from './Utils'

const MAX_SEARCH_RESULTS = 5
const DRAWER_LINK_CLASS = 'block py-3 text-lg font-bold uppercase hover:text-ac'

export const Logo = () => (
  <a href="#top" className="display text-xl font-black sm:text-2xl" aria-label="ShopiKa home">
    SHOPI<span className="grad">KA</span>
    <span className="text-ac">*</span>
  </a>
)

function highlightMatch(text: string, query: string) {
  const start = text.toLowerCase().indexOf(query.toLowerCase())
  if (start < 0 || !query) return text
  const end = start + query.length
  return (
    <>
      {text.slice(0, start)}
      <mark className="bg-ac text-black">{text.slice(start, end)}</mark>
      {text.slice(end)}
    </>
  )
}

export function Header() {
  const { products, cart, coupon, likes, compare, premium, togglePremium, setCartOpen, setCompareOpen } = useStore()
  const user = useAuth((s) => s.user)
  const navigate = useNavigate()
  const searchRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false) // mobile only: the field is always visible from md up
  const [megaOpen, setMegaOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const categories = categoriesOf(products)
  const { itemCount } = priceCart(cartLines(cart, products), coupon)
  const needle = query.trim().toLowerCase()
  const results = needle ? products.filter((p) => `${p.name} ${p.cat} ${p.tag}`.toLowerCase().includes(needle)).slice(0, MAX_SEARCH_RESULTS) : []
  const accountHref = user ? (user.role === 'admin' ? '/admin' : '/account') : '/login'

  useEffect(() => {
    const focusOnSlash = (event: KeyboardEvent) => {
      if (event.key !== '/' || isTypingTarget(event.target)) return
      event.preventDefault()
      searchRef.current?.focus()
    }
    window.addEventListener('keydown', focusOnSlash)
    return () => window.removeEventListener('keydown', focusOnSlash)
  }, [])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const submitSearch = () => {
    if (!query.trim()) return
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`)
    setSearchFocused(false)
    searchRef.current?.blur()
  }

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ac bg-black/80 backdrop-blur" style={{ paddingTop: 'env(safe-area-inset-top)' }} onMouseLeave={() => setMegaOpen(false)}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 p-3 sm:gap-4 sm:p-4">
        <button type="button" className="grid h-10 w-10 place-items-center md:hidden" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu /></button>
        <Logo />
        <nav className="hidden gap-6 text-sm font-bold uppercase md:flex" aria-label="Main">
          <a href="/shop" onMouseEnter={() => setMegaOpen(true)} onFocus={() => setMegaOpen(true)} className="hover:text-ac">Shop</a>
          <a href="#deals" className="hover:text-ac">Deals</a>
          <a href="#about" className="hover:text-ac">About</a>
          <a href="/blog" className="hover:text-ac">Journal</a>
        </nav>
        <div className={`relative order-last w-full md:order-none md:ml-auto md:block md:max-w-sm ${searchOpen ? 'block' : 'hidden'}`}>
          <Search size={16} className="absolute left-3 top-3.5 text-ac" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search drops...  ( / )"
            aria-label="Search products"
            className="h-11 w-full border-2 border-white/20 bg-black pl-9 pr-3 outline-none focus:border-ac"
          />
          {searchFocused && query && (
            // Keeping focus on the input while pressing a result stops the blur from closing the list before the click lands.
            <ul onMouseDown={(e) => e.preventDefault()} className="absolute z-50 mt-1 w-full border-2 border-ac bg-black">
              {results.length ? (
                results.map((p) => (
                  <li key={p.id} className="flex items-center justify-between p-3 text-sm hover:bg-white/10">
                    <a href={`/product/${p.id}`} className="flex items-center gap-2">
                      <img src={p.img} alt="" className="h-8 w-8 bg-neutral-100 object-contain" />
                      {highlightMatch(p.name, query)}
                    </a>
                    <span className="shrink-0 text-xs font-bold text-ac">{usd(p.price)}</span>
                  </li>
                ))
              ) : (
                <li className="p-3 text-sm text-white/50">No results for “{query}”</li>
              )}
            </ul>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Toggle search" aria-expanded={searchOpen} onClick={() => setSearchOpen((open) => !open)}><Search size={20} /></Button>
          <a href={accountHref} aria-label={user ? 'My account' : 'Sign in'} className="hidden h-11 w-11 place-items-center hover:text-ac md:grid"><User size={20} /></a>
          <a href="/wishlist" aria-label="Wishlist" className="hidden h-11 w-11 place-items-center md:grid"><Badge badgeContent={likes.length} color="secondary"><Heart size={20} /></Badge></a>
          <Button variant="ghost" size="icon" className="hidden md:inline-flex" aria-label="Compare" onClick={() => setCompareOpen(true)}><Badge badgeContent={compare.length} color="secondary"><GitCompare size={20} /></Badge></Button>
          <Button variant={premium ? 'solid' : 'outline'} size="sm" onClick={togglePremium} aria-pressed={premium} aria-label="Toggle VIP gold theme"><Crown size={14} /><span className="hidden sm:inline">{premium ? 'Gold' : 'VIP'}</span></Button>
          <Button variant="ghost" size="icon" aria-label="Open cart" onClick={() => setCartOpen(true)}><Badge badgeContent={itemCount} color="primary"><ShoppingBag size={20} /></Badge></Button>
        </div>
      </div>
      {megaOpen && (
        <div className="hidden border-t border-white/10 bg-black md:block">
          <div className="mx-auto grid max-w-7xl grid-cols-4 gap-6 p-8">
            {categories.map((category) => (
              <div key={category}>
                <h4 className="display mb-3 text-ac"><a href={`/shop?cat=${encodeURIComponent(category)}`}>{category}</a></h4>
                {products.filter((p) => p.cat === category).map((p) => (
                  <a key={p.id} href={`/product/${p.id}`} className="block py-1 text-sm hover:translate-x-1 hover:text-ac2">{p.name}</a>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      <Drawer anchor="left" open={menuOpen} onClose={() => setMenuOpen(false)} PaperProps={{ sx: { width: '82%', maxWidth: 340, p: 3, border: '2px solid var(--ac)' } }}>
        <div className="mb-4 flex items-center justify-between">
          <Logo />
          <button type="button" aria-label="Close menu" className="grid h-11 w-11 place-items-center" onClick={() => setMenuOpen(false)}><X /></button>
        </div>
        {/* Link clicks bubble up here so the drawer closes after any navigation. */}
        <nav onClick={() => setMenuOpen(false)} aria-label="Menu">
          <a href="/shop" className={DRAWER_LINK_CLASS}>Shop all</a>
          <a href="/wishlist" className={DRAWER_LINK_CLASS}>Wishlist</a>
          <a href={accountHref} className={DRAWER_LINK_CLASS}>{user ? 'My account' : 'Sign in'}</a>
          <a href="/blog" className={DRAWER_LINK_CLASS}>Journal</a>
          <a href="/track" className={DRAWER_LINK_CLASS}>Track order</a>
          <a href="/contact" className={DRAWER_LINK_CLASS}>Contact</a>
          <a href="#deals" className={DRAWER_LINK_CLASS}>Deals</a>
          <a href="#about" className={DRAWER_LINK_CLASS}>About</a>
          <p className="display mb-1 mt-6 text-xs text-ac">CATEGORIES</p>
          {categories.map((category) => (
            <a key={category} href={`/shop?cat=${encodeURIComponent(category)}`} className="block py-2 text-white/70">{category}</a>
          ))}
        </nav>
      </Drawer>
    </header>
  )
}
