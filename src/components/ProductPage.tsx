import { useEffect, useState, type MouseEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Heart,
  GitCompare,
  Share2,
  Truck,
  ShieldCheck,
  RefreshCw,
  ChevronRight,
  Minus,
  Plus,
  Check,
  Ruler,
  type LucideIcon,
} from 'lucide-react'
import { Rating, Tab, Tabs, Skeleton, Dialog } from '@mui/material'
import { useStore } from '@/store'
import { sizesFor, type Product, type Review } from '@/data/products'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/pricing'
import { cn, usd } from '@/lib/utils'
import { LENIS_PREVENT } from '@/lib/smoothScroll'
import { useDragScroll } from '@/lib/useDragScroll'
import { Button } from '@/components/ui/button'
import { ProductCard } from './ProductCard'
import { Comments } from './Comments'
import { useJsonLd, usePage, useTransientFlag } from './Utils'

const CLOTH_SIZES: [size: string, chest: string, waist: string][] = [
  ['XS', '82-87', '66-71'],
  ['S', '88-93', '72-77'],
  ['M', '94-99', '78-83'],
  ['L', '100-107', '84-91'],
  ['XL', '108-115', '92-99'],
]
const GUARANTEES: { Icon: LucideIcon; label: string }[] = [
  { Icon: Truck, label: `Free ship $${FREE_SHIPPING_THRESHOLD}+` },
  { Icon: RefreshCw, label: '30-day returns' },
  { Icon: ShieldCheck, label: 'Secure pay' },
]
const DELIVERY_DAYS = 4
const MS_PER_DAY = 86_400_000
const ZOOM_SCALE = 2
const META_DESCRIPTION_LENGTH = 155
const LOW_STOCK_THRESHOLD = 5
const RELATED_LIMIT = 4
const FEEDBACK_MS = 1500

const TAB_STYLE = {
  '& .MuiTabs-indicator': { bgcolor: 'var(--ac)' },
  '& .Mui-selected': { color: 'var(--ac) !important' },
}

type ZoomPoint = { x: number; y: number }
const TAB_REVIEWS = 3

/** Resolves the product from the URL and shows loading, error or not-found states. */
export default function ProductPage() {
  const { id } = useParams()
  const { products, catalogStatus, loadCatalog } = useStore()
  const product = products.find((p) => p.id === id)
  // Keying by product id remounts the detail view, so selections reset without an effect.
  if (product) return <ProductDetail key={product.id} product={product} />
  return (
    <div className="mx-auto max-w-7xl p-10">
      {catalogStatus === 'loading' && <Skeleton variant="rectangular" height={500} sx={{ bgcolor: '#111' }} />}
      {catalogStatus === 'error' && (
        <div role="alert">
          <p className="display mb-4 text-2xl">We could not load this product.</p>
          <Button onClick={() => void loadCatalog()}>Try again</Button>
        </div>
      )}
      {catalogStatus === 'ready' && (
        <p className="display text-3xl">
          Product not found.{' '}
          <Link to="/shop" className="text-ac">Back to shop</Link>
        </p>
      )}
    </div>
  )
}

function Gallery({ product }: { product: Product }) {
  const { ref: thumbsRef } = useDragScroll<HTMLDivElement>()
  const [index, setIndex] = useState(0)
  const [slide, setSlide] = useState(0)
  const [zoom, setZoom] = useState<ZoomPoint | null>(null)
  const photoCount = product.images.length
  const trackPointer = (event: MouseEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    setZoom({ x: ((event.clientX - box.left) / box.width) * 100, y: ((event.clientY - box.top) / box.height) * 100 })
  }

  return (
    <div>
      {/* Phones: swipe through the photos, with dots showing the position. */}
      <div className="md:hidden">
        <div className="relative">
          <div
            className="no-sb flex snap-x snap-mandatory overflow-x-auto border-2 border-ac bg-neutral-100"
            onScroll={(e) => setSlide(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          >
            {product.images.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`${product.name}, photo ${i + 1} of ${photoCount}`}
                loading={i === 0 ? 'eager' : 'lazy'}
                className="aspect-square w-full shrink-0 snap-center object-contain p-4"
              />
            ))}
          </div>
          <span className="display absolute left-3 top-3 bg-ac px-3 py-1 text-xs text-black">{product.tag}</span>
        </div>
        {photoCount > 1 && (
          <div className="mt-3 flex justify-center gap-2" aria-hidden>
            {product.images.map((src, i) => (
              <span key={src} className={cn('h-2 w-2 rounded-full', slide === i ? 'bg-ac' : 'bg-white/25')} />
            ))}
          </div>
        )}
      </div>

      {/* Larger screens: hover to zoom, with clickable thumbnails. */}
      <div className="hidden md:block">
        <div
          className="relative aspect-square cursor-zoom-in overflow-hidden border-2 border-ac bg-neutral-100"
          onMouseMove={trackPointer}
          onMouseLeave={() => setZoom(null)}
        >
          <img
            src={product.images[index]}
            alt={`${product.name}, view ${index + 1}`}
            className="h-full w-full object-contain p-4 transition-transform duration-200"
            style={zoom ? { transform: `scale(${ZOOM_SCALE})`, transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
          />
          <span className="display absolute left-3 top-3 bg-ac px-3 py-1 text-xs text-black">{product.tag}</span>
        </div>
        {photoCount > 1 && (
          <div ref={thumbsRef} className="drag-scroll no-sb mt-3 flex gap-2 overflow-x-auto">
            {product.images.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`Show image ${i + 1}`}
                aria-current={index === i}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-20 w-20 shrink-0 border-2 bg-neutral-100',
                  index === i ? 'border-ac' : 'border-white/10',
                )}
              >
                <img src={src} alt="" loading="lazy" className="h-full w-full object-contain" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

type SizeGuideProps = { product: Product; sizes: string[]; open: boolean; onClose: () => void }

function SizeGuide({ product, sizes, open, onClose }: SizeGuideProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={LENIS_PREVENT}>
      <div className="p-5">
        <h2 className="display mb-3 text-lg">Size guide</h2>
        {product.kind === 'cloth' ? (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-white/50">
              <tr><th className="py-2">Size</th><th>Chest (cm)</th><th>Waist (cm)</th></tr>
            </thead>
            <tbody>
              {CLOTH_SIZES.map(([size, chest, waist]) => (
                <tr key={size} className="border-t border-white/10">
                  <td className="py-2">{size}</td>
                  <td>{chest}</td>
                  <td>{waist}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-white/50">
              <tr><th className="py-2">EU size</th><th>Foot length (cm)</th></tr>
            </thead>
            <tbody>
              {sizes.map((size) => (
                <tr key={size} className="border-t border-white/10">
                  <td className="py-2">{size}</td>
                  <td>{(Number(size) / 1.5 - 1.5).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="mt-3 text-xs text-white/60">Between sizes? Size up for a relaxed fit.</p>
        <Button className="mt-4 w-full" onClick={onClose}>Close</Button>
      </div>
    </Dialog>
  )
}

function RatingSummary({ average, ratings }: { average: number; ratings: number[] }) {
  return (
    <div>
      <b className="display text-5xl text-ac">{average.toFixed(1)}</b>
      <Rating value={average} precision={0.1} readOnly />
      <div className="mt-4 space-y-1">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = ratings.filter((r) => Math.round(r) === stars).length
          return (
            <div key={stars} className="flex items-center gap-2 text-xs">
              <span className="w-3">{stars}</span>
              <div className="h-2 flex-1 bg-white/10">
                <div
                  className="h-full bg-ac"
                  style={{ width: `${ratings.length ? (count / ratings.length) * 100 : 0}%` }}
                />
              </div>
              <span className="w-4 text-right text-white/60">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProductDetail({ product }: { product: Product }) {
  const { products, likes, compare, recent, comments, addToCart, toggleLike, toggleCompare, markViewed } = useStore()
  const [quantity, setQuantity] = useState(1)
  const [tab, setTab] = useState(0)
  const [size, setSize] = useState('')
  const [sizeMissing, setSizeMissing] = useState(false)
  const [colorChoice, setColorChoice] = useState('')
  const [guideOpen, setGuideOpen] = useState(false)
  const [linkCopied, showLinkCopied] = useTransientFlag(FEEDBACK_MS)
  const [shareFailed, showShareFailed] = useTransientFlag(FEEDBACK_MS)

  usePage(product.name, product.desc.slice(0, META_DESCRIPTION_LENGTH))
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.desc,
    sku: product.sku,
    brand: { '@type': 'Brand', name: product.brand },
    category: product.cat,
    aggregateRating: { '@type': 'AggregateRating', ratingValue: product.rating, reviewCount: product.count },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  })
  useEffect(() => {
    markViewed(product.id)
  }, [product.id, markViewed])

  const sizes = sizesFor(product)
  const color = colorChoice || product.colors[0][0]
  const thread: Review[] = [...(comments[`p:${product.id}`] ?? []), ...product.reviews]
  const ratings = thread.flatMap((r) => (r.rating ? [r.rating] : []))
  const average = ratings.length ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : product.rating
  const arrival = new Date(Date.now() + DELIVERY_DAYS * MS_PER_DAY)
  const arrivalDate = arrival.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const related = products.filter((p) => p.cat === product.cat && p.id !== product.id).slice(0, RELATED_LIMIT)
  const recentlyViewed = recent
    .filter((id) => id !== product.id)
    .flatMap((id) => products.find((p) => p.id === id) ?? [])
    .slice(0, RELATED_LIMIT)
  const lowStock = product.stock <= LOW_STOCK_THRESHOLD

  const addSelection = () => {
    if (sizes.length > 0 && !size) {
      setSizeMissing(true)
      return
    }
    addToCart(product.id, size, color, quantity)
  }
  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url })
      } else {
        await navigator.clipboard.writeText(url)
        showLinkCopied()
      }
    } catch (error) {
      // Dismissing the native share sheet rejects with AbortError, which is not a failure.
      if (error instanceof DOMException && error.name === 'AbortError') return
      showShareFailed()
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-6 md:pb-16">
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-xs uppercase text-white/60" aria-label="Breadcrumb">
        <Link to="/">Home</Link><ChevronRight size={12} />
        <Link to={`/shop?cat=${encodeURIComponent(product.cat)}`}>{product.cat}</Link><ChevronRight size={12} />
        <span className="line-clamp-1 text-ac">{product.name}</span>
      </nav>
      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <Gallery product={product} />
        <div className="space-y-5">
          <p className="text-sm font-bold uppercase text-ac">{product.brand}</p>
          <h1 className="display text-2xl sm:text-4xl">{product.name}</h1>
          <div className="flex items-center gap-2">
            <Rating value={average} precision={0.1} readOnly />
            <button type="button" onClick={() => setTab(TAB_REVIEWS)} className="text-sm text-white/60 underline">
              {average.toFixed(1)}
              (
              {thread.length}
              reviews)
            </button>
          </div>
          <p className="flex items-end gap-3">
            <b className="display text-4xl text-ac">{usd(product.price)}</b>
            {product.old && (
              <>
                <s className="text-white/50">{usd(product.old)}</s>
                <span className="bg-ac2 px-2 py-1 text-xs font-bold text-black">
                  -
                  {Math.round((1 - product.price / product.old) * 100)}
                  %
                </span>
              </>
            )}
          </p>
          <p className="line-clamp-4 text-white/80">{product.desc}</p>
          <div role="radiogroup" aria-label="Color">
            <p className="mb-2 text-sm font-bold uppercase">
              Color:{' '}
              <span className="font-normal text-white/70">{color}</span>
            </p>
            <div className="flex gap-3">
              {product.colors.map(([name, hex]) => (
                <button
                  key={name}
                  type="button"
                  role="radio"
                  aria-checked={color === name}
                  aria-label={name}
                  title={name}
                  onClick={() => setColorChoice(name)}
                  className={cn(
                    'grid h-11 w-11 place-items-center rounded-full border-2',
                    color === name ? 'border-ac' : 'border-white/20',
                  )}
                >
                  <span className="h-7 w-7 rounded-full border border-white/30" style={{ background: hex }} />
                </button>
              ))}
            </div>
          </div>
          {sizes.length > 0 && (
            <div role="radiogroup" aria-label="Size">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-bold uppercase">
                  Size{' '}
                  {sizeMissing && (
                    <span role="alert" className="ml-2 font-normal normal-case text-ac2">
                      Please select a size
                    </span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setGuideOpen(true)}
                  className="flex items-center gap-1 text-sm text-ac underline"
                >
                  <Ruler size={14} />
                  Size guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((option) => (
                  
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={size === option}
                      onClick={() => { setSize(option); setSizeMissing(false) }}
                      className={cn(
                        'h-11 min-w-11 border-2 px-3 font-bold',
                        size === option ? 'border-ac bg-ac text-black' : 'border-white/20',
                      )}
                    >
                      {option}
                    </button>
                  
                ))}
              </div>
            </div>
          )}
          <p className={`text-sm ${lowStock ? 'font-bold text-ac2' : 'text-white/70'}`}>
            {lowStock ? `Only ${product.stock} left in stock` : 'In stock'}
            · Order today, arrives by{' '}
            {arrivalDate}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-12 items-center border-2 border-white/20">
              <button
                type="button"
                aria-label="Decrease quantity"
                className="grid h-12 w-11 place-items-center"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus size={16} />
              </button>
              <b className="w-8 text-center">{quantity}</b>
              <button
                type="button"
                aria-label="Increase quantity"
                className="grid h-12 w-11 place-items-center"
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              >
                <Plus size={16} />
              </button>
            </div>
            <Button className="hidden flex-1 md:inline-flex" onClick={addSelection}>Add to cart</Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12"
              aria-label="Wishlist"
              aria-pressed={likes.includes(product.id)}
              onClick={() => toggleLike(product.id)}
            >
              <Heart fill={likes.includes(product.id) ? 'currentColor' : 'none'} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12"
              aria-label="Compare"
              aria-pressed={compare.includes(product.id)}
              onClick={() => toggleCompare(product.id)}
            >
              <GitCompare className={compare.includes(product.id) ? 'text-ac2' : ''} />
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12" aria-label="Share" onClick={() => void share()}>
              {linkCopied ? <Check /> : <Share2 />}
            </Button>
          </div>
          {shareFailed && <p role="alert" className="text-sm text-ac2">Could not share or copy the link.</p>}
          <ul className="grid grid-cols-3 gap-2 text-center text-[11px] uppercase">
            {GUARANTEES.map(({ Icon, label }) => (
              <li key={label} className="border border-white/10 p-3">
                <Icon className="mx-auto mb-1 text-ac" size={20} />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-12">
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          variant="scrollable"
          sx={TAB_STYLE}
        >
          <Tab label="Details" />
          <Tab label="Specifications" />
          <Tab label="Shipping" />
          <Tab label={`Reviews (${thread.length})`} />
        </Tabs>
        <div className="py-6">
          {tab === 0 && <p className="max-w-3xl text-white/80">{product.desc}</p>}
          {tab === 1 && (
            <dl className="grid max-w-3xl gap-px bg-white/10 sm:grid-cols-2">
              {product.specs.map(([name, value]) => (
                <div key={name} className="bg-black p-3">
                  <dt className="text-xs uppercase text-white/50">{name}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}
          {tab === 2 && (
            <div className="max-w-3xl space-y-3 text-white/80">
              <p>
                Ships within 24 hours. Standard delivery takes 3 to 7 business days, express 1 to 3. Free standard
                shipping on orders over ${FREE_SHIPPING_THRESHOLD}, otherwise $9.90.
              </p>
              <p>{product.specs.find(([name]) => name === 'Returns')?.[1] ?? 'Free returns within 30 days.'}</p>
            </div>
          )}
          {tab === TAB_REVIEWS && (
            <div className="grid gap-8 md:grid-cols-[240px_1fr]">
              <RatingSummary average={average} ratings={ratings} />
              <Comments threadKey={`p:${product.id}`} initialReviews={product.reviews} rated />
            </div>
          )}
        </div>
      </div>
      {related.length > 0 && (
        <>
          <h2 className="display mb-6 mt-10 text-2xl sm:text-4xl">YOU MAY ALSO <span className="grad">LIKE</span></h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {related.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
          </div>
        </>
      )}
      {recentlyViewed.length > 0 && (
        <>
          <h2 className="display mb-6 mt-14 text-xl sm:text-2xl">RECENTLY VIEWED</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {recentlyViewed.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
          </div>
        </>
      )}
      <SizeGuide product={product} sizes={sizes} open={guideOpen} onClose={() => setGuideOpen(false)} />
      <div
        className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t-2 border-ac bg-black/95 p-3 md:hidden"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
      >
        <b className="display text-xl text-ac">{usd(product.price * quantity)}</b>
        <Button className="flex-1" onClick={addSelection}>Add to cart</Button>
      </div>
    </div>
  )
}
