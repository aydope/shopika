import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Clock, Flame, Search, Star, Tag, X } from 'lucide-react'
import { categoriesOf, type Product } from '@/data/products'
import { useStore } from '@/store'
import { cn, usd } from '@/lib/utils'
import { isTypingTarget } from './Utils'

const MAX_PRODUCT_RESULTS = 6
const MAX_CATEGORY_RESULTS = 5
const MAX_TAG_RESULTS = 6
const MAX_TRENDING = 4

function highlightMatch(text: string, query: string) {
  const start = text.toLowerCase().indexOf(query.toLowerCase())
  if (start < 0 || !query) return text
  const end = start + query.length
  return (
    <>
      {text.slice(0, start)}
      <mark className="bg-ac text-black">{text.slice(start, end)}</mark>
      {text.slice(end)}
    </>
  )
}

const SectionTitle = ({ children }: { children: string }) => (
  <p className="display mb-2 text-[11px] uppercase tracking-wide text-ac">{children}</p>
)

const chipClass = 'inline-flex h-9 items-center gap-1 border border-white/20 px-3 text-xs hover:border-ac hover:text-ac'

type ProductRowProps = { product: Product; query: string; active: boolean; id: string; onOpen: () => void }

function ProductRow({ product, query, active, id, onOpen }: ProductRowProps) {
  return (
    <li id={id} role="option" aria-selected={active}>
      <Link
        to={`/product/${product.id}`}
        onClick={onOpen}
        className={`flex items-center gap-3 p-2 ${active ? 'bg-white/10' : 'hover:bg-white/5'}`}
      >
        <img src={product.img} alt="" className="h-14 w-14 shrink-0 bg-neutral-100 object-contain" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold">{highlightMatch(product.name, query)}</span>
          <span className="flex items-center gap-2 text-xs text-white/50">
            {product.brand} · {product.cat}
            <span className="flex items-center gap-0.5 text-ac">
              <Star size={11} fill="currentColor" />
              {product.rating.toFixed(1)}
            </span>
          </span>
        </span>
        <span className="shrink-0 text-right">
          <b className="block text-sm text-ac">{usd(product.price)}</b>
          {product.old && <s className="text-xs text-white/40">{usd(product.old)}</s>}
        </span>
      </Link>
    </li>
  )
}

/** Search field with a large results panel: products, matching categories, tags, recent searches and trending items. */
export function SearchBox({ mobileOpen }: { mobileOpen: boolean }) {
  const { products, recentSearches, rememberSearch, clearSearches } = useStore()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const needle = query.trim().toLowerCase()
  const matches = needle
    ? products.filter((p) => `${p.name} ${p.brand} ${p.cat} ${p.tag}`.toLowerCase().includes(needle))
    : []
  const results = matches.slice(0, MAX_PRODUCT_RESULTS)
  const allCategories = categoriesOf(products)
  const matchedCategories = [
    ...new Set([...allCategories.filter((c) => c.toLowerCase().includes(needle)), ...matches.map((p) => p.cat)]),
  ].slice(0, MAX_CATEGORY_RESULTS)
  const matchedTags = [...new Set(matches.map((p) => p.tag))].slice(0, MAX_TAG_RESULTS)
  const trending = [...products].sort((a, b) => b.rating - a.rating).slice(0, MAX_TRENDING)

  useEffect(() => {
    const focusOnSlash = (event: globalThis.KeyboardEvent) => {
      if (event.key !== '/' || isTypingTarget(event.target)) return
      event.preventDefault()
      inputRef.current?.focus()
    }
    window.addEventListener('keydown', focusOnSlash)
    return () => window.removeEventListener('keydown', focusOnSlash)
  }, [])

  useEffect(() => {
    if (mobileOpen) inputRef.current?.focus()
  }, [mobileOpen])

  const close = () => {
    setOpen(false)
    setActiveIndex(-1)
  }
  const searchFor = (term: string) => {
    if (!term.trim()) return
    rememberSearch(term)
    navigate(`/shop?q=${encodeURIComponent(term.trim())}`)
    setQuery(term)
    close()
    inputRef.current?.blur()
  }
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (results.length === 0) return
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((index) => (index + step + results.length) % results.length)
    } else if (event.key === 'Enter') {
      const chosen = results[activeIndex]
      if (chosen) {
        rememberSearch(query)
        navigate(`/product/${chosen.id}`)
        close()
        inputRef.current?.blur()
      } else {
        searchFor(query)
      }
    } else if (event.key === 'Escape') {
      close()
      inputRef.current?.blur()
    }
  }

  return (
    <div
      className={cn(
        'relative order-last w-full md:order-none md:ml-auto md:block md:max-w-sm',
        mobileOpen ? 'block' : 'hidden',
      )}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close()
      }}
    >
      <Search size={16} className="absolute left-3 top-3.5 text-ac" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setActiveIndex(-1)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        aria-label="Search products"
        placeholder="Search products, brands, categories...  ( / )"
        className="h-11 w-full border-2 border-white/20 bg-black pl-9 pr-9 outline-none focus:border-ac"
      />
      {query && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setQuery('')
            inputRef.current?.focus()
          }}
          className="absolute right-0 top-0 grid h-11 w-11 place-items-center text-white/60 hover:text-white"
        >
          <X size={16} />
        </button>
      )}

      {open && (
        // Keeping focus on the input while pressing inside the panel stops the blur
        // from closing it before a click lands.
        <div
          data-lenis-prevent
          onMouseDown={(e) => e.preventDefault()}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[75vh] overflow-y-auto border-2 border-ac bg-black md:left-auto md:w-[46rem]"
        >
          {needle ? (
            <div className="grid md:grid-cols-[1fr_15rem]">
              <div className="p-3">
                <SectionTitle>{`Products (${matches.length})`}</SectionTitle>
                {results.length > 0 ? (
                  <ul id={listId} role="listbox" aria-label="Product results">
                    {results.map((product, index) => (
                      <ProductRow
                        key={product.id}
                        product={product}
                        query={query.trim()}
                        active={index === activeIndex}
                        id={`${listId}-${index}`}
                        onOpen={() => {
                          rememberSearch(query)
                          close()
                        }}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="p-2 text-sm text-white/60">No products found for “{query.trim()}”.</p>
                )}
              </div>
              <div className="space-y-4 border-t border-white/10 p-3 md:border-l md:border-t-0">
                {matchedCategories.length > 0 && (
                  <div>
                    <SectionTitle>Categories</SectionTitle>
                    <div className="flex flex-wrap gap-2">
                      {matchedCategories.map((category) => (
                        <Link
                          key={category}
                          to={`/shop?cat=${encodeURIComponent(category)}`}
                          onClick={close}
                          className={chipClass}
                        >
                          <Tag size={12} />
                          {category}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {matchedTags.length > 0 && (
                  <div>
                    <SectionTitle>Related searches</SectionTitle>
                    <div className="flex flex-wrap gap-2">
                      {matchedTags.map((tag) => (
                        <button key={tag} type="button" onClick={() => searchFor(tag)} className={chipClass}>
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {matches.length > 0 && (
                <button
                  type="button"
                  onClick={() => searchFor(query)}
                  className="col-span-full border-t border-white/10 bg-ac p-3 text-sm font-bold uppercase text-black hover:brightness-110"
                >
                  See all {matches.length} results for “{query.trim()}”
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 p-3 md:grid-cols-2">
              <div className="space-y-4">
                {recentSearches.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <SectionTitle>Recent searches</SectionTitle>
                      <button
                        type="button"
                        onClick={clearSearches}
                        className="text-xs text-white/50 underline hover:text-white"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term) => (
                        <button key={term} type="button" onClick={() => searchFor(term)} className={chipClass}>
                          <Clock size={12} />
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <SectionTitle>Popular categories</SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {allCategories.slice(0, MAX_CATEGORY_RESULTS + 2).map((category) => (
                      <Link
                        key={category}
                        to={`/shop?cat=${encodeURIComponent(category)}`}
                        onClick={close}
                        className={chipClass}
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              {trending.length > 0 && (
                <div>
                  <SectionTitle>Trending now</SectionTitle>
                  <ul>
                    {trending.map((product) => (
                      <li key={product.id}>
                        <Link
                          to={`/product/${product.id}`}
                          onClick={close}
                          className="flex items-center gap-3 p-2 hover:bg-white/5"
                        >
                          <img src={product.img} alt="" className="h-12 w-12 shrink-0 bg-neutral-100 object-contain" />
                          <span className="min-w-0 flex-1 truncate text-sm">{product.name}</span>
                          <Flame size={14} className="shrink-0 text-ac2" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
