import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { discountRatio } from '@/data/products'
import { useProducts } from '@/store'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/pricing'
import { ProductCard } from './ProductCard'
import { Button } from '@/components/ui/button'
const words = ['LIMITED DROP', 'NO RESTOCKS', 'WEAR THE FUTURE', `FREE SHIP $${FREE_SHIPPING_THRESHOLD}+`, 'GOLD CLUB']
function HeroArt() {
  const products = useProducts()
  const top = [...products].sort((a, b) => b.rating - a.rating).slice(0, 3)
  if (!top.length) return null
  return <div className="pointer-events-none absolute right-6 top-1/2 hidden h-[26rem] w-64 -translate-y-1/2 md:block lg:right-16 lg:w-80" aria-hidden>{top.map((p, i) => <motion.img key={p.id} src={p.img} alt="" animate={{ y: [0, i % 2 ? 10 : -12, 0] }} transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut' }} className="absolute w-44 border-2 border-ac bg-neutral-100 object-contain shadow-2xl lg:w-56" style={{ top: i * 100, left: i * 40 - 20, rotate: (i - 1) * 7 }} />)}</div>
}
export function Hero() {
  return (
    <section id="top" className="relative grid min-h-[88svh] place-items-center overflow-hidden">
      <HeroArt />
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 font-bold uppercase tracking-[.4em] text-ac2">Season 26 // Merch from 2099</motion.p>
        <motion.h1 initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="display text-[clamp(2.6rem,13vw,10rem)] font-black leading-[.85]">WEAR<br /><span className="grad">LOUD.</span><br />BE SEEN.</motion.h1>
        <div className="mt-8 flex flex-wrap gap-3 pb-24"><a href="#drops"><Button>Shop the drop</Button></a><a href="#deals"><Button variant="outline">Deals −40%</Button></a></div>
      </div>
      <div className="absolute bottom-0 w-full overflow-hidden border-y-2 border-ac bg-black py-3"><div className="marquee display text-xl">{[...words, ...words, ...words, ...words].map((w, i) => <span key={i} className="mx-6 text-ac">{w} ✦</span>)}</div></div>
    </section>
  )
}
export function Slider() {
  const products = useProducts()
  const ref = useRef<HTMLDivElement>(null), go = (d: number) => ref.current?.scrollBy({ left: d * 320, behavior: 'smooth' })
  if (!products.length) return null
  return (
    <section id="drops" className="mx-auto max-w-7xl px-4 py-16 md:py-24">
      <div className="mb-8 flex items-end justify-between"><h2 className="display text-4xl md:text-6xl">TOP <span className="grad">PICKS</span></h2><div className="hidden gap-2 sm:flex"><Button variant="outline" size="icon" aria-label="Prev" onClick={() => go(-1)}><ArrowLeft /></Button><Button variant="outline" size="icon" aria-label="Next" onClick={() => go(1)}><ArrowRight /></Button></div></div>
      <div ref={ref} className="no-sb flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4">{[...products].sort((a, b) => b.rating - a.rating).slice(0, 10).map((p, i) => <div key={p.id} className="w-[72vw] max-w-[290px] shrink-0 snap-start"><ProductCard p={p} i={i} /></div>)}</div>
    </section>
  )
}
export function Deals() {
  const products = useProducts()
  const [t, setT] = useState(() => 6 * 3600 + 23 * 60)
  useEffect(() => { const id = setInterval(() => setT((s) => (s > 0 ? s - 1 : 6 * 3600)), 1000); return () => clearInterval(id) }, [])
  const f = (n: number) => String(n).padStart(2, '0')
  if (!products.length) return null
  return (
    <section id="deals" className="bg-ac py-16 text-black md:py-24"><div className="mx-auto max-w-7xl px-4">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4"><h2 className="display text-3xl sm:text-4xl md:text-7xl">FLASH SALE</h2><p className="display bg-black px-4 py-2 text-2xl sm:text-3xl text-ac" aria-label="Time left">{f(Math.floor(t / 3600))}:{f(Math.floor((t % 3600) / 60))}:{f(t % 60)}</p></div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 [&_article]:text-white">{products.filter((p) => p.old).sort((a, b) => discountRatio(b) - discountRatio(a)).slice(0, 8).map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}</div>
    </div></section>
  )
}
export function About() {
  return (
    <section id="about" className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:py-28 md:grid-cols-2">
      <motion.h2 initial={{ x: -60, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} className="display text-4xl sm:text-5xl md:text-7xl">WE MAKE <span className="grad">NOISE</span> WEARABLE.</motion.h2>
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="space-y-5 text-base md:text-lg text-white/70">
        <p>ShopiKa started in a garage with one screen-printer and zero chill. Today we ship limited-run merch built on maximalist graphics, reflective fabrics and obsessive details.</p>
        <p>Flip on <b className="text-ac">VIP Gold</b> mode for early access aesthetics, reserved for our inner circle.</p>
        <div className="grid grid-cols-3 gap-4 pt-4 text-center">{[['120K', 'Fits shipped'], ['48', 'Countries'], ['4.8★', 'Avg rating']].map(([a, b]) => <div key={b} className="border-2 border-ac p-4"><b className="display text-2xl text-ac">{a}</b><p className="text-xs uppercase">{b}</p></div>)}</div>
      </motion.div>
    </section>
  )
}

