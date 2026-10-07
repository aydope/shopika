import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, GitCompare, Plus } from 'lucide-react'
import { Rating } from '@mui/material'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { cn, usd } from '@/lib/utils'
import type { Product } from '@/data/products'
export function ProductCard({ p, i = 0 }: { p: Product; i?: number }) {
  const { likes, compare, like, cmp, add } = useStore(), nav = useNavigate(), sized = p.kind !== 'none'
  const liked = likes.includes(p.id), cm = compare.includes(p.id)
  return (
    <motion.article initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 4) * 0.05 }} whileHover={{ y: -8 }} className="group w-full border-2 border-white/10 bg-card hover:border-ac">
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <Link to={`/product/${p.id}`} aria-label={p.name}><img src={p.img} alt={p.name} loading="lazy" className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-110" /></Link>
        <span className="display absolute left-2 top-2 bg-ac px-2 py-1 text-[10px] text-black">{p.tag}</span>{p.stock <= 5 && <span className="absolute bottom-2 left-2 bg-ac2 px-2 py-1 text-[10px] font-bold uppercase text-black">Only {p.stock} left</span>}
        <div className="absolute right-2 top-2 flex flex-col gap-2">
          <button aria-label="Like" onClick={() => like(p.id)} className={cn('grid h-10 w-10 place-items-center bg-black/80 text-white', liked && 'text-ac2')}><Heart size={18} fill={liked ? 'currentColor' : 'none'} /></button>
          <button aria-label="Compare" onClick={() => cmp(p.id)} className={cn('grid h-10 w-10 place-items-center bg-black/80 text-white', cm && 'text-ac')}><GitCompare size={18} /></button>
        </div>
      </div>
      <div className="space-y-2 p-3 sm:p-4">
        <p className="text-xs uppercase text-white/50">{p.brand}</p>
        <Link to={`/product/${p.id}`} className="display line-clamp-2 block min-h-[2.5rem] text-sm hover:text-ac sm:text-base">{p.name}</Link>
        <Rating value={p.rating} precision={0.1} readOnly size="small" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p><b className="text-lg text-ac sm:text-xl">{usd(p.price)}</b>{p.old && <s className="ml-2 text-sm text-white/40">{usd(p.old)}</s>}</p>
          <Button size="sm" onClick={() => (sized ? nav('/product/' + p.id) : add(p.id, '', p.colors[0][0]))} aria-label={sized ? `Choose size for ${p.name}` : `Add ${p.name} to cart`}><Plus size={14} /><span className="hidden sm:inline">{sized ? 'Select' : 'Add'}</span></Button>
        </div>
      </div>
    </motion.article>
  )
}
