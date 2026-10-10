import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import {
  Shirt,
  Sparkles,
  Gem,
  Footprints,
  Watch,
  ShoppingBag,
  Glasses,
  Tag,
  Truck,
  RefreshCw,
  ShieldCheck,
  Headphones,
  ChevronDown,
  Quote,
  Check,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react'
import { FaInstagram, FaTiktok, FaXTwitter, FaDiscord } from 'react-icons/fa6'
import type { IconType } from 'react-icons'
import { categoriesOf } from '@/data/products'
import { useProducts } from '@/store'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/pricing'
import { isEmail } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Logo } from './Logo'

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Men's Shirts": Shirt,
  Tops: Shirt,
  Dresses: Sparkles,
  "Men's Shoes": Footprints,
  "Women's Shoes": Footprints,
  "Men's Watches": Watch,
  "Women's Watches": Watch,
  Bags: ShoppingBag,
  Jewellery: Gem,
  Sunglasses: Glasses,
}
const MAX_CATEGORY_TILES = 8
const MAX_TESTIMONIALS = 3

export function Categories() {
  const products = useProducts()
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 md:pb-24">
      <h2 className="display mb-6 text-3xl sm:text-4xl md:text-6xl">SHOP BY <span className="grad">VIBE</span></h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
        {categoriesOf(products).slice(0, MAX_CATEGORY_TILES).map((category) => {
          const Icon = CATEGORY_ICONS[category] ?? Tag
          const cover = products.find((p) => p.cat === category)
          if (!cover) return null
          return (
            <Link
              key={category}
              to={`/shop?cat=${encodeURIComponent(category)}`}
              className="group relative block aspect-square overflow-hidden border-2 border-white/10 bg-neutral-100 hover:border-ac"
            >
              <img
                src={cover.img}
                alt=""
                loading="lazy"
                className="h-full w-full object-contain p-6 transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black p-3">
                <span className="display flex items-center gap-2 text-sm">
                  <Icon size={18} className="text-ac" />
                  {category}
                </span>
                <ArrowUpRight size={18} className="text-ac" />
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

const PERKS: { Icon: LucideIcon; title: string; detail: string }[] = [
  { Icon: Truck, title: 'Free shipping', detail: `Orders over $${FREE_SHIPPING_THRESHOLD}` },
  { Icon: RefreshCw, title: '30-day returns', detail: 'No questions asked' },
  { Icon: ShieldCheck, title: 'Secure checkout', detail: '256-bit encrypted' },
  { Icon: Headphones, title: '24/7 support', detail: 'Real humans' },
]

export const Usp = () => (
  <section className="border-y-2 border-ac bg-black">
    <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-4 p-6 md:grid-cols-4">
      {PERKS.map(({ Icon, title, detail }) => (
        <li key={title} className="flex items-center gap-3">
          <Icon className="shrink-0 text-ac" size={28} />
          <div>
            <b className="block text-sm uppercase">{title}</b>
            <span className="text-xs text-white/50">{detail}</span>
          </div>
        </li>
      ))}
    </ul>
  </section>
)

export function Testimonials() {
  const products = useProducts()
  const quotes = products
    .flatMap((p) => p.reviews.filter((r) => (r.rating ?? 0) >= 5).map((r) => ({ ...r, product: p.name })))
    .slice(0, MAX_TESTIMONIALS)
  if (!quotes.length) return null
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
      <h2 className="display mb-8 text-3xl sm:text-4xl md:text-6xl">THE <span className="grad">CREW</span> SAYS</h2>
      <div className="grid gap-5 md:grid-cols-3">
        {quotes.map((quote) => (
          <figure key={quote.id} className="border-2 border-white/10 bg-card p-6">
            <Quote className="mb-3 text-ac2" />
            <blockquote className="mb-4 text-white/70">{quote.text}</blockquote>
            <figcaption className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center bg-ac font-black text-black">
                {quote.name[0]}
              </span>
              <div>
                <b className="block text-sm">{quote.name}</b>
                <span className="line-clamp-1 text-xs text-white/50">on {quote.product}</span>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

const FAQ: [question: string, answer: string][] = [
  ['How long does shipping take?', 'Orders ship within 24h. Delivery takes 3-7 business days in most regions.'],
  ['Can I return an item?', 'Yes. Free returns within 30 days, as long as the item is unworn with tags.'],
  ['Can I track my order?', 'Yes. Enter your order number on the Track order page to see its current status.'],
  ['Do you restock drops?', 'Never. When a limited piece is gone, it is gone.'],
]

export const Faq = () => (
  <section id="faq" className="mx-auto max-w-3xl px-4 pb-16 md:pb-24">
    <h2 className="display mb-6 text-3xl sm:text-4xl">FAQ</h2>
    {FAQ.map(([question, answer]) => (
      <Accordion
        key={question}
        disableGutters
        sx={{ bgcolor: 'transparent', border: '1px solid #ffffff22', mb: 1, '&:before': { display: 'none' } }}
      >
        <AccordionSummary expandIcon={<ChevronDown className="text-ac" />}><b>{question}</b></AccordionSummary>
        <AccordionDetails className="text-white/70">{answer}</AccordionDetails>
      </Accordion>
    ))}
  </section>
)

/** The form has no backend: a valid address only switches the UI to its confirmation state. */
export function Newsletter() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [error, setError] = useState('')
  const subscribe = () => {
    if (isEmail(email)) {
      setSubscribed(true)
      setError('')
    } else {
      setError('Enter a valid email')
    }
  }
  return (
    <section className="bg-ac2 py-16 text-black">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="display text-3xl sm:text-5xl">JOIN THE DROP LIST</h2>
        <p className="my-4">Early access + 10% off your first order.</p>
        {subscribed ? (
          
            <p role="status" className="display inline-flex items-center gap-2 bg-black px-5 py-3 text-ac">
              <Check size={18} />
              You're in.
            </p>
          
        ) : (
          <>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && subscribe()}
                type="email"
                autoComplete="email"
                aria-label="Email"
                aria-invalid={Boolean(error)}
                placeholder="you@email.com"
                className="h-12 flex-1 border-2 border-black bg-white px-4 outline-none"
              />
              <Button className="bg-black text-white" onClick={subscribe}>Subscribe</Button>
            </div>
            {error && <p role="alert" className="mt-2 text-sm font-bold">{error}</p>}
          </>
        )}
      </div>
    </section>
  )
}

// Replace these platform home pages with the real brand profiles before launch.
const SOCIAL_LINKS: { name: string; href: string; Icon: IconType }[] = [
  { name: 'Instagram', href: 'https://www.instagram.com/', Icon: FaInstagram },
  { name: 'TikTok', href: 'https://www.tiktok.com/', Icon: FaTiktok },
  { name: 'X', href: 'https://x.com/', Icon: FaXTwitter },
  { name: 'Discord', href: 'https://discord.com/', Icon: FaDiscord },
]
const FOOTER_LINKS: { heading: string; links: [label: string, href: string][] }[] = [
  {
    heading: 'Shop',
    links: [
      ['All gear', '/shop'],
      ['Deals', '/#deals'],
      ['Wishlist', '/wishlist'],
      ['Track order', '/track'],
    ],
  },
  {
    heading: 'Support',
    links: [
      ['Journal', '/blog'],
      ['Contact', '/contact'],
      ['Shipping and returns', '/shipping'],
      ['FAQ', '/#faq'],
      ['About', '/#about'],
    ],
  },
  {
    heading: 'Legal',
    links: [
      ['Privacy Policy', '/privacy'],
      ['Terms of Service', '/terms'],
      ['Sign in', '/login'],
      ['Create account', '/register'],
    ],
  },
]

export const Footer = () => (
  <footer className="border-t-2 border-ac px-4 pb-28 pt-12 md:pb-10">
    <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
      <div>
        <Logo />
        <p className="mt-3 text-sm text-white/50">Loud streetwear from the future.</p>
        <div className="mt-4 flex gap-4 text-xl text-ac">
          {SOCIAL_LINKS.map(({ name, href, Icon }) => (
            <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={name}><Icon /></a>
          ))}
        </div>
      </div>
      {FOOTER_LINKS.map(({ heading, links }) => (
        <div key={heading}>
          <h4 className="display mb-3 text-ac">{heading}</h4>
          {links.map(([label, href]) => (
            <Link key={label} to={href} className="block py-1 text-sm text-white/60 hover:text-white">
              {label}
            </Link>
          ))}
        </div>
      ))}
    </div>
    <p className="mx-auto mt-10 max-w-7xl text-xs text-white/50">
      &copy; 2026 ShopiKa. All rights reserved. Product data and reviews via dummyjson.com.
    </p>
  </footer>
)
