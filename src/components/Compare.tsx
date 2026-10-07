import { Dialog, useMediaQuery } from '@mui/material'
import { X } from 'lucide-react'
import { useStore } from '@/store'
import { products } from '@/data/products'
import { Button } from '@/components/ui/button'
import { usd } from '@/lib/utils'
export function Compare() {
  const mob = useMediaQuery('(max-width:640px)')
  const { compare, cmpOpen, setCmp, cmp, add } = useStore()
  const list = products.filter((p) => compare.includes(p.id)), min = Math.min(...list.map((p) => p.price))
  const rows: [string, (p: (typeof list)[0]) => React.ReactNode][] = [['Price', (p) => <b className={p.price === min ? 'text-ac' : ''}>{usd(p.price)}{p.price === min && ' ✓ best'}</b>], ['Was', (p) => (p.old ? usd(p.old) : '-')], ['Category', (p) => p.cat], ['Rating', (p) => `★ ${p.rating}`], ['Style', (p) => p.tag]]
  return (
    <Dialog open={cmpOpen} onClose={() => setCmp(false)} maxWidth="md" fullWidth fullScreen={mob}>
      <div className="p-4 sm:p-6"><div className="mb-4 flex items-center justify-between"><h2 className="display text-xl">COMPARE <span className="text-ac">({list.length}/3)</span></h2><button aria-label="Close" onClick={() => setCmp(false)}><X /></button></div>
        {list.length < 2 ? <p className="py-10 text-center text-white/50">Tap the compare icon on 2-3 products.</p> :
          <div className="overflow-x-auto"><table className="w-full min-w-[480px] text-left text-sm"><thead><tr><th />{list.map((p) => <th key={p.id} className="p-3"><img src={p.img} alt="" className="mb-2 h-16 w-16 bg-neutral-100 object-contain p-1" />{p.name}<button onClick={() => cmp(p.id)} className="ml-2 text-xs text-ac2">remove</button></th>)}</tr></thead>
            <tbody>{rows.map(([l, f]) => <tr key={l} className="border-t border-white/10"><td className="p-3 uppercase text-white/50">{l}</td>{list.map((p) => <td key={p.id} className="p-3">{f(p)}</td>)}</tr>)}
              <tr><td />{list.map((p) => <td key={p.id} className="p-3"><Button size="sm" onClick={() => add(p.id)}>Add</Button></td>)}</tr></tbody></table></div>}
      </div>
    </Dialog>
  )
}
