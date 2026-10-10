import type { ReactNode } from 'react'
import { Dialog, useMediaQuery } from '@mui/material'
import { X } from 'lucide-react'
import { useStore } from '@/store'
import type { Product } from '@/data/products'
import { Button } from '@/components/ui/button'
import { usd } from '@/lib/utils'
import { useDragScroll } from '@/lib/useDragScroll'
import { needsOptions, useQuickAdd } from './ProductCard'

const MOBILE_QUERY = '(max-width:640px)'

export function Compare() {
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const { products, compare, compareOpen, setCompareOpen, toggleCompare } = useStore()
  const quickAdd = useQuickAdd()
  const tableRef = useDragScroll<HTMLDivElement>()

  const selected = products.filter((p) => compare.includes(p.id))
  const lowestPrice = Math.min(...selected.map((p) => p.price))
  const rows: [label: string, render: (p: Product) => ReactNode][] = [
    [
      'Price',
      (p) => (
        <b className={p.price === lowestPrice ? 'text-ac' : ''}>
          {usd(p.price)}
          {p.price === lowestPrice && ' ✓ best'}
        </b>
      ),
    ],
    ['Was', (p) => (p.old ? usd(p.old) : '-')],
    ['Category', (p) => p.cat],
    ['Rating', (p) => `★ ${p.rating}`],
    ['Style', (p) => p.tag],
  ]

  return (
    <Dialog
      open={compareOpen}
      onClose={() => setCompareOpen(false)}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      <div className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="display text-xl">
            COMPARE <span className="text-ac">({selected.length}/3)</span>
          </h2>
          <button type="button" aria-label="Close" onClick={() => setCompareOpen(false)}>
            <X />
          </button>
        </div>

        {selected.length < 2 ? (
          <p className="py-10 text-center text-white/50">Tap the compare icon on 2-3 products.</p>
        ) : (
          <div ref={tableRef} className="drag-scroll overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr>
                  <th />
                  {selected.map((product) => (
                    <th key={product.id} className="p-3">
                      <img src={product.img} alt="" className="mb-2 h-16 w-16 bg-neutral-100 object-contain p-1" />
                      {product.name}
                      <button
                        type="button"
                        onClick={() => toggleCompare(product.id)}
                        className="ml-2 text-xs text-ac2"
                      >
                        remove
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, render]) => (
                  <tr key={label} className="border-t border-white/10">
                    <td className="p-3 uppercase text-white/50">{label}</td>
                    {selected.map((product) => (
                      <td key={product.id} className="p-3">
                        {render(product)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td />
                  {selected.map((product) => (
                    <td key={product.id} className="p-3">
                      <Button size="sm" onClick={() => quickAdd(product)}>
                        {needsOptions(product) ? 'Select' : 'Add'}
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Dialog>
  )
}
