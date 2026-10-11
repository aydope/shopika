import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useStore } from './store'
import { Header } from './components/Header'
import { Hero, Slider, Deals, About } from './components/Sections'
import { Catalog } from './components/Catalog'
import { BlogList, BlogPost } from './components/Blog'
import { Categories, Usp, Testimonials, Faq, Newsletter, Footer } from './components/Extra'
import { Wishlist, Checkout, NotFound } from './components/Pages'
import { Legal, Contact, Track } from './components/Legal'
import { Login, Register } from './components/Auth'
import ProductPage from './components/ProductPage'
import { Cart } from './components/Cart'
import { Compare } from './components/Compare'
import { MobileBar } from './components/MobileBar'
import { ScrollManager, ScrollUI, CookieBanner, AnnounceBar, useJsonLd } from './components/Utils'

const Account = lazy(() => import('./components/Account'))
const Admin = lazy(() => import('./components/Admin'))

const Home = () => (
  <>
    <Hero />
    <Slider />
    <Categories />
    <Catalog home />
    <Deals />
    <Usp />
    <About />
    <Testimonials />
    <Faq />
    <Newsletter />
  </>
)

export default function App() {
  const premium = useStore((s) => s.premium)
  const products = useStore((s) => s.products)
  const loadCatalog = useStore((s) => s.loadCatalog)

  useEffect(() => {
    document.documentElement.dataset.theme = premium ? 'premium' : 'dark'
  }, [premium])

  useEffect(() => {
    const controller = new AbortController()
    void loadCatalog(controller.signal)
    return () => controller.abort()
  }, [loadCatalog])

  useJsonLd(
    products.length
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name })),
        }
      : null,
  )

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <ScrollManager />
      <ScrollUI />
      <AnnounceBar />
      <Header />
      <main id="main">
        <Suspense fallback={<p className="p-20 text-center text-white/60">Loading...</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/shop"
              element={
                <div className="pt-10">
                  <Catalog />
                </div>
              }
            />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/account" element={<Account />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/track" element={<Track />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Legal doc="privacy" />} />
            <Route path="/terms" element={<Legal doc="terms" />} />
            <Route path="/shipping" element={<Legal doc="shipping" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <Cart />
      <Compare />
      <MobileBar />
      <CookieBanner />
    </>
  )
}
