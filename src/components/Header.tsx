import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, GitCompare, Menu, X, Heart, User, Search } from 'lucide-react'
import { Badge, Drawer } from '@mui/material'
import { cartLines, useStore } from '@/store'
import { useAuth, homeFor } from '@/auth'
import { categoriesOf } from '@/data/products'
import { priceCart } from '@/lib/pricing'
import { Button } from '@/components/ui/button'
import { Logo } from './Logo'
import { SearchBox } from './SearchBox'

const DRAWER_LINK = 'block py-3 text-lg font-bold uppercase hover:text-ac'
const NAV_LINK = 'hover:text-ac'
const DRAWER_PAPER = { width: '82%', maxWidth: 340, p: 3, border: '2px solid var(--ac)' }

export function Header() {
  const { products, cart, likes, compare, setCartOpen, setCompareOpen } = useStore()
  const user = useAuth((s) => s.user)
  const [searchOpen, setSearchOpen] = useState(false) // mobile only: the field is always visible from md up
  const [megaOpen, setMegaOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const categories = categoriesOf(products)
  const { itemCount } = priceCart(cartLines(cart, products))
  const accountPath = user ? homeFor(user) : '/login'
  const closeMega = () => setMegaOpen(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header
      className="sticky top-0 z-40 border-b-2 border-ac bg-black/80 backdrop-blur"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
      onMouseLeave={closeMega}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 p-3 sm:gap-4 sm:p-4">
        <button
          type="button"
          className="grid h-10 w-10 place-items-center md:hidden"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu />
        </button>
        <Logo />

        <nav className="hidden gap-6 text-sm font-bold uppercase md:flex" aria-label="Main">
          <Link
            to="/shop"
            className={NAV_LINK}
            onMouseEnter={() => setMegaOpen(true)}
            onFocus={() => setMegaOpen(true)}
          >
            Shop
          </Link>
          <Link to="/#deals" className={NAV_LINK}>
            Deals
          </Link>
          <Link to="/#about" className={NAV_LINK}>
            About
          </Link>
          <Link to="/blog" className={NAV_LINK}>
            Journal
          </Link>
        </nav>

        <SearchBox mobileOpen={searchOpen} />

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle search"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((open) => !open)}
          >
            <Search size={20} />
          </Button>
          <Link
            to={accountPath}
            aria-label={user ? 'My account' : 'Sign in'}
            className="hidden h-11 w-11 place-items-center hover:text-ac md:grid"
          >
            <User size={20} />
          </Link>
          <Link to="/wishlist" aria-label="Wishlist" className="hidden h-11 w-11 place-items-center md:grid">
            <Badge badgeContent={likes.length} color="secondary">
              <Heart size={20} />
            </Badge>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
            aria-label="Compare"
            onClick={() => setCompareOpen(true)}
          >
            <Badge badgeContent={compare.length} color="secondary">
              <GitCompare size={20} />
            </Badge>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Open cart" onClick={() => setCartOpen(true)}>
            <Badge badgeContent={itemCount} color="primary">
              <ShoppingBag size={20} />
            </Badge>
          </Button>
        </div>
      </div>

      {megaOpen && (
        <div className="hidden border-t border-white/10 bg-black md:block">
          <div className="mx-auto grid max-w-7xl grid-cols-4 gap-6 p-8">
            {categories.map((category) => (
              <div key={category}>
                <h4 className="display mb-3 text-ac">
                  <Link to={`/shop?cat=${encodeURIComponent(category)}`} onClick={closeMega}>
                    {category}
                  </Link>
                </h4>
                {products
                  .filter((p) => p.cat === category)
                  .map((p) => (
                    <Link
                      key={p.id}
                      to={`/product/${p.id}`}
                      onClick={closeMega}
                      className="block py-1 text-sm hover:translate-x-1 hover:text-ac2"
                    >
                      {p.name}
                    </Link>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <Drawer anchor="left" open={menuOpen} onClose={closeMenu} PaperProps={{ sx: DRAWER_PAPER }}>
        <div className="mb-4 flex items-center justify-between">
          <Logo />
          <button
            type="button"
            aria-label="Close menu"
            className="grid h-11 w-11 place-items-center"
            onClick={closeMenu}
          >
            <X />
          </button>
        </div>
        {/* Link clicks bubble up here so the drawer closes after any navigation. */}
        <nav onClick={closeMenu} aria-label="Menu">
          <Link to="/shop" className={DRAWER_LINK}>
            Shop all
          </Link>
          <Link to="/wishlist" className={DRAWER_LINK}>
            Wishlist
          </Link>
          <Link to={accountPath} className={DRAWER_LINK}>
            {user ? 'My account' : 'Sign in'}
          </Link>
          <Link to="/blog" className={DRAWER_LINK}>
            Journal
          </Link>
          <Link to="/track" className={DRAWER_LINK}>
            Track order
          </Link>
          <Link to="/contact" className={DRAWER_LINK}>
            Contact
          </Link>
          <Link to="/#deals" className={DRAWER_LINK}>
            Deals
          </Link>
          <Link to="/#about" className={DRAWER_LINK}>
            About
          </Link>
          <p className="display mb-1 mt-6 text-xs text-ac">CATEGORIES</p>
          {categories.map((category) => (
            <Link key={category} to={`/shop?cat=${encodeURIComponent(category)}`} className="block py-2 text-white/70">
              {category}
            </Link>
          ))}
        </nav>
      </Drawer>
    </header>
  )
}
