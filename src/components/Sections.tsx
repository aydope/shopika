import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { discountRatio } from '@/data/products'
import { useProducts } from '@/store'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/pricing'
import { useDragScroll } from '@/lib/useDragScroll'
import { Button, ButtonLink } from '@/components/ui/button'
import { ProductCard } from './ProductCard'

const MARQUEE_WORDS = ['LIMITED DROP', 'NO RESTOCKS', 'WEAR THE FUTURE', `FREE SHIP $${FREE_SHIPPING_THRESHOLD}+`]
const SLIDER_STEP = 320
const SLIDER_ITEMS = 10
const DEAL_ITEMS = 8
const HERO_ART_ITEMS = 3

/** Floating product photos next to the hero headline. They are hidden on small screens. */
function HeroArt() {
  const products = useProducts()
  const featured = [...products].sort((a, b) => b.rating - a.rating).slice(0, HERO_ART_ITEMS)
  if (featured.length === 0) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-6 top-1/2 hidden h-[26rem] w-64 -translate-y-1/2 md:block lg:right-16 lg:w-80"
    >
      {featured.map((product, index) => (
        <motion.img
          key={product.id}
          src={product.img}
          alt=""
          animate={{ y: [0, index % 2 ? 10 : -12, 0] }}
          transition={{ duration: 5 + index, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-44 border-2 border-ac bg-neutral-100 object-contain shadow-2xl lg:w-56"
          style={{ top: index * 100, left: index * 40 - 20, rotate: (index - 1) * 7 }}
        />
      ))}
    </div>
  )
}

export function Hero() {
  const marquee = [...MARQUEE_WORDS, ...MARQUEE_WORDS, ...MARQUEE_WORDS, ...MARQUEE_WORDS]
  return (
    <section id="top" className="relative grid min-h-[88svh] place-items-center overflow-hidden">
      <HeroArt />
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 font-bold uppercase tracking-[.4em] text-ac2"
        >
          Season 26 // Merch from 2099
        </motion.p>
        <motion.h1
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="display text-[clamp(2.6rem,13vw,10rem)] font-black leading-[.85]"
        >
          WEAR
          <br />
          <span className="grad">LOUD.</span>
          <br />
          BE SEEN.
        </motion.h1>
        <div className="mt-8 flex flex-wrap gap-3 pb-24">
          <ButtonLink to="/#drops" className="flex-1 sm:flex-none">
            Shop the drop
          </ButtonLink>
          <ButtonLink to="/#deals" variant="outline" className="flex-1 sm:flex-none">
            Flash deals
          </ButtonLink>
        </div>
      </div>
      <div className="absolute bottom-0 w-full overflow-hidden border-y-2 border-ac bg-black py-3">
        <div className="marquee display text-xl">
          {marquee.map((word, index) => (
            <span key={index} className="mx-6 text-ac">
              {word} ✦
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Slider() {
  const products = useProducts()
  const { ref: trackRef, element: track } = useDragScroll<HTMLDivElement>()
  const scrollBy = (direction: number) =>
    track?.scrollBy({ left: direction * SLIDER_STEP, behavior: 'smooth' })
  if (products.length === 0) return null

  const topRated = [...products].sort((a, b) => b.rating - a.rating).slice(0, SLIDER_ITEMS)
  return (
    <section id="drops" className="mx-auto max-w-7xl px-4 py-16 md:py-24">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="display text-4xl md:text-6xl">
          TOP <span className="grad">PICKS</span>
        </h2>
        <div className="hidden gap-2 sm:flex">
          <Button variant="outline" size="icon" aria-label="Previous products" onClick={() => scrollBy(-1)}>
            <ArrowLeft />
          </Button>
          <Button variant="outline" size="icon" aria-label="Next products" onClick={() => scrollBy(1)}>
            <ArrowRight />
          </Button>
        </div>
      </div>
      <div
        ref={trackRef}
        className="drag-scroll no-sb flex snap-x snap-mandatory items-stretch gap-5 overflow-x-auto pb-4"
      >
        {topRated.map((product, index) => (
          <div key={product.id} className="w-[72vw] max-w-[290px] shrink-0 snap-start">
            <ProductCard p={product} i={index} />
          </div>
        ))}
      </div>
    </section>
  )
}

const SALE_DURATION_SECONDS = 6 * 3600 + 23 * 60
const pad = (value: number) => String(value).padStart(2, '0')

/** The countdown is a visual element only: it restarts when it reaches zero. */
function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(seconds)
  useEffect(() => {
    const timer = setInterval(() => setRemaining((left) => (left > 0 ? left - 1 : seconds)), 1000)
    return () => clearInterval(timer)
  }, [seconds])
  return `${pad(Math.floor(remaining / 3600))}:${pad(Math.floor((remaining % 3600) / 60))}:${pad(remaining % 60)}`
}

export function Deals() {
  const products = useProducts()
  const countdown = useCountdown(SALE_DURATION_SECONDS)
  if (products.length === 0) return null

  const deals = products
    .filter((p) => p.old)
    .sort((a, b) => discountRatio(b) - discountRatio(a))
    .slice(0, DEAL_ITEMS)
  return (
    <section id="deals" className="bg-ac py-16 text-black md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="display text-3xl sm:text-4xl md:text-7xl">FLASH SALE</h2>
          <p className="display bg-black px-4 py-2 text-2xl text-ac sm:text-3xl" aria-label="Time left">
            {countdown}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 [&_article]:text-white">
          {deals.map((product, index) => (
            <ProductCard key={product.id} p={product} i={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

const ABOUT_STATS = [
  ['120K', 'Fits shipped'],
  ['48', 'Countries'],
  ['4.8★', 'Avg rating'],
]

export function About() {
  return (
    <section id="about" className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:py-28">
      <motion.h2
        initial={{ x: -60, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="display text-4xl sm:text-5xl md:text-7xl"
      >
        WE MAKE <span className="grad">NOISE</span> WEARABLE.
      </motion.h2>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="space-y-5 text-base text-white/70 md:text-lg"
      >
        <p>
          ShopiKa started in a garage with one screen-printer and zero chill. Today we ship limited-run merch built on
          maximalist graphics, reflective fabrics and obsessive details.
        </p>
        <div className="grid grid-cols-3 gap-4 pt-4 text-center">
          {ABOUT_STATS.map(([value, label]) => (
            <div key={label} className="border-2 border-ac p-4">
              <b className="display text-2xl text-ac">{value}</b>
              <p className="text-xs uppercase">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
