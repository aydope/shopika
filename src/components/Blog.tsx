import { Link, useParams } from 'react-router-dom'
import { Clock, ArrowUpRight } from 'lucide-react'
import { posts } from '@/data/blog'
import { useProducts } from '@/store'
import { ProductCard } from './ProductCard'
import { Comments } from './Comments'
import { Newsletter } from './Extra'
import { useJsonLd, usePage } from './Utils'
const Cover = ({ i, tag, big }: { i: number; tag: string; big?: boolean }) => (
  <div
    className={`display grid place-items-center overflow-hidden text-black ${big ? 'h-64 text-6xl sm:h-80 sm:text-8xl' : 'h-44 text-4xl'}`}
    style={{ background: `linear-gradient(135deg, hsl(${(i * 55 + 70) % 360} 100% 60%), hsl(${(i * 55 + 190) % 360} 100% 55%))` }}
    aria-hidden
  >
    {tag.toUpperCase()}
  </div>
)
export function BlogList() {
  usePage('Journal', 'Style tips, care guides and product picks from ShopiKa.')
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="display mb-8 text-4xl sm:text-6xl">
        THE <span className="grad">JOURNAL</span>
      </h1>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p, i) => (
          <article key={p.slug} className={`group border-2 border-white/10 bg-card hover:border-ac ${i === 0 ? 'lg:col-span-2' : ''}`}>
            <Link to={`/blog/${p.slug}`} aria-label={p.title}>
              <Cover i={i} tag={p.tag} big={i === 0} />
            </Link>
            <div className="space-y-2 p-5">
              <p className="flex items-center gap-3 text-xs uppercase text-white/50">
                <span className="text-ac">{p.tag}</span>
                {p.date}
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {p.read} min
                </span>
              </p>
              <h2 className="display text-xl">
                <Link to={`/blog/${p.slug}`} className="hover:text-ac">
                  {p.title}
                </Link>
              </h2>
              <p className="text-white/70">{p.excerpt}</p>
              <Link to={`/blog/${p.slug}`} className="inline-flex items-center gap-1 text-sm font-bold text-ac">
                Read article <ArrowUpRight size={16} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
export function BlogPost() {
  const products = useProducts()
  const { slug } = useParams(),
    i = posts.findIndex((p) => p.slug === slug),
    p = posts[i]
  usePage(p?.title || 'Article not found', p?.excerpt || 'This article could not be found.')
  useJsonLd(
    p
      ? {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: p.title,
          datePublished: p.date,
          author: { '@type': 'Person', name: p.author },
        }
      : null,
  )
  if (!p)
    return (
      <div className="px-4 py-24 text-center">
        <h1 className="display mb-4 text-2xl">Article not found</h1>
        <Link to="/blog" className="text-ac underline">
          Back to the journal
        </Link>
      </div>
    )
  const related = products.filter((x) => x.cat === p.cat).slice(0, 2)
  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-10">
        <nav className="mb-4 text-xs uppercase text-white/50" aria-label="Breadcrumb">
          <Link to="/blog" className="hover:text-ac">
            Journal
          </Link>{' '}
          / <span className="text-ac">{p.tag}</span>
        </nav>
        <h1 className="display mb-4 text-3xl sm:text-5xl">{p.title}</h1>
        <p className="mb-6 flex flex-wrap items-center gap-3 text-sm text-white/60">
          By {p.author}
          <time dateTime={p.date}>{p.date}</time>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {p.read} min read
          </span>
        </p>
        <Cover i={i} tag={p.tag} big />
        <div className="my-8 space-y-5 text-lg leading-relaxed text-white/80">
          {p.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {related.length > 0 && (
          <>
            <h2 className="display mb-4 text-xl text-ac">SHOP THIS STORY</h2>
            <div className="mb-12 grid grid-cols-2 gap-3 sm:gap-5">
              {related.map((x, k) => (
                <ProductCard key={x.id} p={x} i={k} />
              ))}
            </div>
          </>
        )}
        <Comments threadKey={`b:${p.slug}`} initialReviews={p.comments} />
        <nav className="mt-10 flex justify-between gap-4 text-sm" aria-label="More articles">
          {[posts[i - 1], posts[i + 1]].map((n, k) =>
            n ? (
              <Link
                key={n.slug}
                to={`/blog/${n.slug}`}
                className={`max-w-[48%] border border-white/20 p-3 hover:border-ac ${k ? 'ml-auto text-right' : ''}`}
              >
                <span className="block text-xs uppercase text-white/50">{k ? 'Next' : 'Previous'}</span>
                {n.title}
              </Link>
            ) : (
              <span key={k} />
            ),
          )}
        </nav>
      </article>
      <Newsletter />
    </>
  )
}
