import { useState } from 'react'
import { useStore } from '@/store'
import { categoriesOf } from '@/data/products'
import { usd } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { StatCard, inputClass } from './ChartCard'
import { useDragScroll } from '@/lib/useDragScroll'

const LOW_STOCK = 10
const PAGE_SIZE = 15

function stockLabel(stock: number) {
  if (stock === 0) return { text: 'Out of stock', className: 'text-ac2' }
  if (stock <= LOW_STOCK) return { text: 'Low stock', className: 'text-yellow-400' }
  return { text: 'In stock', className: 'text-ac' }
}

/** Inventory view of the live catalog. Stock edits are kept for this session only. */
export function ProductsTab() {
  const { ref: tableRef } = useDragScroll<HTMLDivElement>()
  const products = useStore((s) => s.products)
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({})
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [lowOnly, setLowOnly] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const stockOf = (id: string, fallback: number) => stockEdits[id] ?? fallback
  const needle = search.trim().toLowerCase()
  const filtered = products.filter(
    (p) =>
      (category === 'All' || p.cat === category) &&
      (!lowOnly || stockOf(p.id, p.stock) <= LOW_STOCK) &&
      (!needle || `${p.name} ${p.sku} ${p.brand}`.toLowerCase().includes(needle)),
  )
  const inventoryValue = products.reduce((sum, p) => sum + p.price * stockOf(p.id, p.stock), 0)
  const lowCount = products.filter((p) => stockOf(p.id, p.stock) <= LOW_STOCK).length

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Products" value={String(products.length)} />
        <StatCard label="Inventory value" value={usd(inventoryValue)} />
        <StatCard label="Low or out of stock" value={String(lowCount)} />
        <StatCard label="Categories" value={String(categoriesOf(products).length)} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search products"
          placeholder="Search by name, SKU or brand"
          className={`${inputClass} w-full sm:w-72`}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          className={inputClass}
        >
          <option>All</option>
          {categoriesOf(products).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <label className="flex h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={(e) => setLowOnly(e.target.checked)}
            className="h-5 w-5 accent-[var(--ac)]"
          />
          Low stock only
        </label>
      </div>

      <div ref={tableRef} className="drag-scroll overflow-x-auto border-2 border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs uppercase text-white/50">
            <tr>
              <th className="p-3">Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, visibleCount).map((product) => {
              const stock = stockOf(product.id, product.stock)
              const label = stockLabel(stock)
              return (
                <tr key={product.id} className="border-t border-white/10">
                  <td className="flex items-center gap-3 p-3">
                    <img src={product.img} alt="" className="h-10 w-10 bg-neutral-100 object-contain" />
                    <span>
                      {product.name}
                      <span className="block text-xs text-white/50">{product.sku}</span>
                    </span>
                  </td>
                  <td>{product.cat}</td>
                  <td>{usd(product.price)}</td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      value={stock}
                      onChange={(e) =>
                        setStockEdits({ ...stockEdits, [product.id]: Math.max(0, Number(e.target.value) || 0) })
                      }
                      aria-label={`Stock for ${product.name}`}
                      className="h-9 w-20 border border-white/20 bg-black px-2"
                    />
                  </td>
                  <td className={label.className}>{label.text}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-6 text-center text-white/60">No products match your filters.</p>}
      </div>
      {filtered.length > visibleCount && (
        <div className="text-center">
          <Button variant="outline" onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}>
            Show more
          </Button>
        </div>
      )}
    </div>
  )
}
