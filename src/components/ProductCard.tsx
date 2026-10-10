import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { GitCompare, Heart, Plus, Star } from 'lucide-react'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { cn, usd } from '@/lib/utils'
import type { Product } from '@/data/products'

const LOW_STOCK_THRESHOLD = 5
const SHOWN_COLORS = 4

/** Products with sizes need a choice first, so they open the product page; the rest go straight to the cart. */
export const needsOptions = (product: Product) => product.kind !== 'none'

export function useQuickAdd() {
  const navigate = useNavigate()
  const addToCart = useStore((s) => s.addToCart)
  return (product: Product) =>
    needsOptions(product) ? navigate(`/product/${product.id}`) : addToCart(product.id, '', product.colors[0][0])
}

const ROUND_BUTTON =
  'grid h-9 w-9 place-items-center rounded-full bg-black/85 text-white shadow transition hover:scale-110'

/**
 * Card layout: a photo panel with badges and quick actions, then a text block that grows to fill the card.
 * The price row is pinned to the bottom so prices and buy buttons line up across a grid row. On hover the photo
 * swaps to the second image and a quick-add bar slides up (desktop only; touch screens use the price row button).
 */
export function ProductCard({ p, i = 0 }: { p: Product; i?: number }) {
  const { likes, compare, toggleLike, toggleCompare } = useStore()
  const quickAdd = useQuickAdd()
  const liked = likes.includes(p.id)
  const comparing = compare.includes(p.id)
  const selecting = needsOptions(p)
  const discount = p.old ? Math.round((1 - p.price / p.old) * 100) : 0
  const hoverImage = p.images[1]
  const addLabel = selecting ? 'Select options' : 'Quick add'

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (i % 4) * 0.05 }}
      className="group relative flex h-full w-full flex-col bg-card outline outline-1 outline-white/10 transition duration-300 hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--ac)] hover:outline-ac"
    >
      <div className="relative aspect-square shrink-0 overflow-hidden bg-[#f1f1ee]">
        <Link to={`/product/${p.id}`} aria-label={p.name} className="block h-full w-full">
          <img
            src={p.img}
            alt={p.name}
            loading="lazy"
            className={cn(
              'absolute inset-0 h-full w-full object-contain p-6 transition duration-500 group-hover:scale-105',
              hoverImage && 'group-hover:opacity-0',
            )}
          />
          {hoverImage && (
            <img
              src={hoverImage}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-contain p-6 opacity-0 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
            />
          )}
        </Link>

        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {discount > 0 && <span className="bg-ac2 px-2 py-1 text-[11px] font-bold text-black">-{discount}%</span>}
          <span className="display bg-black px-2 py-1 text-[10px] uppercase text-ac">{p.tag}</span>
        </div>

        <div className="absolute right-2 top-2 flex flex-col gap-2">
          <button
            type="button"
            aria-label="Like"
            aria-pressed={liked}
            onClick={() => toggleLike(p.id)}
            className={cn(ROUND_BUTTON, liked && 'text-ac2')}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <button
            type="button"
            aria-label="Compare"
            aria-pressed={comparing}
            onClick={() => toggleCompare(p.id)}
            className={cn(ROUND_BUTTON, comparing && 'text-ac')}
          >
            <GitCompare size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => quickAdd(p)}
          className="absolute inset-x-0 bottom-0 hidden translate-y-full bg-ac py-3 text-xs font-bold uppercase tracking-wide text-black transition duration-300 focus-visible:translate-y-0 group-hover:translate-y-0 md:block"
        >
          {addLabel}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-wide text-white/50">
          <span className="truncate">{p.brand}</span>
          <span className="flex shrink-0 items-center gap-1 text-white/70">
            <Star size={12} className="text-ac" fill="currentColor" />
            {p.rating.toFixed(1)}
            <span className="text-white/40">({p.count})</span>
          </span>
        </div>

        <Link to={`/product/${p.id}`} className="display line-clamp-2 min-h-[2.5rem] text-sm hover:text-ac">
          {p.name}
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex gap-1.5" aria-label="Available colors">
            {p.colors.slice(0, SHOWN_COLORS).map(([name, hex]) => (
              
                <span
                  key={name}
                  title={name}
                  className="h-3.5 w-3.5 rounded-full border border-white/30"
                  style={{ background: hex }}
                />
              
            ))}
          </div>
          {p.stock <= LOW_STOCK_THRESHOLD && (
            <span className="text-[11px] font-bold text-ac2">
              Only{' '}
              {p.stock}
              left
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <p className="min-w-0 leading-tight">
            <b className="block text-xl text-ac">{usd(p.price)}</b>
            <span className="block h-4 text-xs text-white/40">{p.old && <s>{usd(p.old)}</s>}</span>
          </p>
          <Button
            size="icon"
            className="shrink-0 md:hidden"
            onClick={() => quickAdd(p)}
            aria-label={selecting ? `Choose options for ${p.name}` : `Add ${p.name} to cart`}
          >
            <Plus size={18} />
          </Button>
        </div>
      </div>
    </motion.article>
  )
}
