import { Link, useParams } from 'react-router-dom'
import { ArrowUpRight, Clock } from 'lucide-react'
import { posts } from '@/data/blog'
import { useProducts } from '@/store'
import { ProductCard } from './ProductCard'
import { Comments } from './Comments'
import { Newsletter } from './Extra'
import { useJsonLd, usePage } from './Utils'

const RELATED_LIMIT = 2

function Cover({ index, tag, large = false }: { index: number; tag: string; large?: boolean }) {
  const size = large ? 'h-64 text-6xl sm:h-80 sm:text-8xl' : 'h-44 text-4xl'
  const hue = (index * 55 + 70) % 360
  return (
    <div
      aria-hidden
      className={`display grid place-items-center overflow-hidden text-black ${size}`}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 100% 60%), hsl(${(hue + 120) % 360} 100% 55%))` }}
    >
      {tag.toUpperCase()}
    </div>
  )
}

export function BlogList() {
  usePage('Journal', 'Style tips, care guides and product picks from ShopiKa.')
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="display mb-8 text-4xl sm:text-6xl">
        THE <span className="grad">JOURNAL</span>
      </h1>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <article
            key={post.slug}
            className={`group border-2 border-white/10 bg-card hover:border-ac ${index === 0 ? 'lg:col-span-2' : ''}`}
          >
            <Link to={`/blog/${post.slug}`} aria-label={post.title}>
              <Cover index={index} tag={post.tag} large={index === 0} />
            </Link>
            <div className="space-y-2 p-5">
              <p className="flex items-center gap-3 text-xs uppercase text-white/50">
                <span className="text-ac">{post.tag}</span>
                {post.date}
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {post.read} min
                </span>
              </p>
              <h2 className="display text-xl">
                <Link to={`/blog/${post.slug}`} className="hover:text-ac">
                  {post.title}
                </Link>
              </h2>
              <p className="text-white/70">{post.excerpt}</p>
              <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-1 text-sm font-bold text-ac">
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
  const { slug } = useParams()
  const products = useProducts()
  const index = posts.findIndex((p) => p.slug === slug)
  const post = posts[index]

  usePage(post?.title ?? 'Article not found', post?.excerpt ?? 'This article could not be found.')
  useJsonLd(
    post
      ? {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          datePublished: post.date,
          author: { '@type': 'Person', name: post.author },
        }
      : null,
  )

  if (!post) {
    return (
      <div className="px-4 py-24 text-center">
        <h1 className="display mb-4 text-2xl">Article not found</h1>
        <Link to="/blog" className="text-ac underline">
          Back to the journal
        </Link>
      </div>
    )
  }

  const related = products.filter((p) => p.cat === post.cat).slice(0, RELATED_LIMIT)
  const neighbours = [
    { post: posts[index - 1], label: 'Previous', align: '' },
    { post: posts[index + 1], label: 'Next', align: 'ml-auto text-right' },
  ]

  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-10">
        <nav className="mb-4 text-xs uppercase text-white/50" aria-label="Breadcrumb">
          <Link to="/blog" className="hover:text-ac">
            Journal
          </Link>{' '}
          / <span className="text-ac">{post.tag}</span>
        </nav>
        <h1 className="display mb-4 text-3xl sm:text-5xl">{post.title}</h1>
        <p className="mb-6 flex flex-wrap items-center gap-3 text-sm text-white/60">
          By {post.author}
          <time dateTime={post.date}>{post.date}</time>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {post.read} min read
          </span>
        </p>
        <Cover index={index} tag={post.tag} large />
        <div className="my-8 space-y-5 text-lg leading-relaxed text-white/80">
          {post.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {related.length > 0 && (
          <>
            <h2 className="display mb-4 text-xl text-ac">SHOP THIS STORY</h2>
            <div className="mb-12 grid grid-cols-2 gap-3 sm:gap-5">
              {related.map((product, i) => (
                <ProductCard key={product.id} p={product} i={i} />
              ))}
            </div>
          </>
        )}

        <Comments threadKey={`b:${post.slug}`} initialReviews={post.comments} />

        <nav className="mt-10 flex justify-between gap-4 text-sm" aria-label="More articles">
          {neighbours.map(({ post: neighbour, label, align }) =>
            neighbour ? (
              <Link
                key={neighbour.slug}
                to={`/blog/${neighbour.slug}`}
                className={`max-w-[48%] border border-white/20 p-3 hover:border-ac ${align}`}
              >
                <span className="block text-xs uppercase text-white/50">{label}</span>
                {neighbour.title}
              </Link>
            ) : (
              <span key={label} />
            ),
          )}
        </nav>
      </article>
      <Newsletter />
    </>
  )
}
