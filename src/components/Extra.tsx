import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import { Shirt, Sparkles, Gem, Footprints, Watch, ShoppingBag, Glasses, Tag, Truck, RefreshCw, ShieldCheck, Headphones, ChevronDown, Quote, Check, ArrowUpRight } from 'lucide-react'
import { FaInstagram, FaTiktok, FaXTwitter, FaDiscord } from 'react-icons/fa6'
import { products } from '@/data/products'
import { Button } from '@/components/ui/button'
import { Logo } from './Header'
const ico: Record<string, any> = { "Men's Shirts": Shirt, Tops: Shirt, Dresses: Sparkles, "Men's Shoes": Footprints, "Women's Shoes": Footprints, "Men's Watches": Watch, "Women's Watches": Watch, Bags: ShoppingBag, Jewellery: Gem, Sunglasses: Glasses }
export function Categories() {
  const cats = [...new Set(products.map((p) => p.cat))]
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 md:pb-24">
      <h2 className="display mb-6 text-3xl sm:text-4xl md:text-6xl">SHOP BY <span className="grad">VIBE</span></h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">{cats.slice(0, 8).map((c) => { const I = ico[c] || Tag, p = products.find((x) => x.cat === c)!
        return <Link key={c} to={`/shop?cat=${encodeURIComponent(c)}`} className="group relative block aspect-square overflow-hidden border-2 border-white/10 bg-neutral-100 hover:border-ac">
          <img src={p.img} alt="" loading="lazy" className="h-full w-full object-contain p-6 transition duration-500 group-hover:scale-110" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black p-3"><span className="display flex items-center gap-2 text-sm"><I size={18} className="text-ac" />{c}</span><ArrowUpRight size={18} className="text-ac" /></div></Link> })}</div>
    </section>
  )
}
export const Usp = () => (
  <section className="border-y-2 border-ac bg-black"><ul className="mx-auto grid max-w-7xl grid-cols-2 gap-4 p-6 md:grid-cols-4">
    {[[Truck, 'Free shipping', 'Orders over $150'], [RefreshCw, '30-day returns', 'No questions asked'], [ShieldCheck, 'Secure checkout', '256-bit encrypted'], [Headphones, '24/7 support', 'Real humans']].map(([I, a, b]: any) => <li key={a} className="flex items-center gap-3"><I className="shrink-0 text-ac" size={28} /><div><b className="block text-sm uppercase">{a}</b><span className="text-xs text-white/50">{b}</span></div></li>)}</ul></section>
)
export function Testimonials() {
  const t = products.flatMap((p) => p.reviews.filter((r) => (r.rating || 0) >= 5).map((r) => ({ ...r, product: p.name }))).slice(0, 3)
  if (!t.length) return null
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
      <h2 className="display mb-8 text-3xl sm:text-4xl md:text-6xl">THE <span className="grad">CREW</span> SAYS</h2>
      <div className="grid gap-5 md:grid-cols-3">{t.map((r) => <figure key={r.id} className="border-2 border-white/10 bg-card p-6"><Quote className="mb-3 text-ac2" /><blockquote className="mb-4 text-white/70">{r.text}</blockquote><figcaption className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center bg-ac font-black text-black">{r.name[0]}</span><div><b className="block text-sm">{r.name}</b><span className="line-clamp-1 text-xs text-white/50">on {r.product}</span></div></figcaption></figure>)}</div>
    </section>
  )
}
const faq = [['How long does shipping take?', 'Orders ship within 24h. Delivery takes 3-7 business days in most regions.'], ['Can I return an item?', 'Yes. Free returns within 30 days, as long as the item is unworn with tags.'], ['What is VIP Gold mode?', 'A premium theme for inner-circle customers. Toggle it with the crown button in the header.'], ['Do you restock drops?', 'Never. When a limited piece is gone, it is gone.']]
export const Faq = () => (
  <section id="faq" className="mx-auto max-w-3xl px-4 pb-16 md:pb-24"><h2 className="display mb-6 text-3xl sm:text-4xl">FAQ</h2>
    {faq.map(([q, a]) => <Accordion key={q} disableGutters sx={{ bgcolor: 'transparent', border: '1px solid #ffffff22', mb: 1, '&:before': { display: 'none' } }}><AccordionSummary expandIcon={<ChevronDown className="text-ac" />}><b>{q}</b></AccordionSummary><AccordionDetails className="text-white/70">{a}</AccordionDetails></Accordion>)}</section>
)
export function Newsletter() {
  const [e, setE] = useState(''), [ok, setOk] = useState(false), [err, setErr] = useState('')
  const go = () => (/^\S+@\S+\.\S+$/.test(e) ? (setOk(true), setErr('')) : setErr('Enter a valid email'))
  return (
    <section className="bg-ac2 py-16 text-black"><div className="mx-auto max-w-3xl px-4 text-center"><h2 className="display text-3xl sm:text-5xl">JOIN THE DROP LIST</h2><p className="my-4">Early access + 10% off your first order.</p>
      {ok ? <p className="display inline-flex items-center gap-2 bg-black px-5 py-3 text-ac"><Check size={18} />You're in.</p> : <><div className="flex flex-col gap-2 sm:flex-row"><input value={e} onChange={(x) => setE(x.target.value)} onKeyDown={(x) => x.key === 'Enter' && go()} type="email" aria-label="Email" placeholder="you@email.com" className="h-12 flex-1 border-2 border-black bg-white px-4 outline-none" /><Button className="bg-black text-white" onClick={go}>Subscribe</Button></div>{err && <p className="mt-2 text-sm font-bold">{err}</p>}</>}</div></section>
  )
}
export const Footer = () => (
  <footer className="border-t-2 border-ac px-4 pb-28 pt-12 md:pb-10"><div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
    <div><Logo /><p className="mt-3 text-sm text-white/50">Loud streetwear from the future.</p><div className="mt-4 flex gap-4 text-xl text-ac">{[FaInstagram, FaTiktok, FaXTwitter, FaDiscord].map((I, i) => <a key={i} href="https://example.com" target="_blank" rel="noreferrer" aria-label="Social"><I /></a>)}</div></div>
    {[['Shop', [['All gear', '/shop'], ['Deals', '/#deals'], ['Wishlist', '/wishlist'], ['Track order', '/track']]], ['Support', [['Journal', '/blog'], ['Contact', '/contact'], ['Shipping and returns', '/shipping'], ['FAQ', '/#faq'], ['About', '/#about']]], ['Legal', [['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['Sign in', '/login'], ['Create account', '/register']]]].map(([h, l]: any) => <div key={h}><h4 className="display mb-3 text-ac">{h}</h4>{l.map(([n, to]: string[]) => <a key={n} href={to} className="block py-1 text-sm text-white/60 hover:text-white">{n}</a>)}</div>)}
    </div><p className="mx-auto mt-10 max-w-7xl text-xs text-white/50">&copy; 2026 ShopiKa. All rights reserved. Product data and reviews via dummyjson.com.</p></footer>
)
