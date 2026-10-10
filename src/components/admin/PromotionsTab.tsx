import { useState } from 'react'
import { useStore } from '@/store'
import { hasErrors, type FormErrors } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { useDragScroll } from '@/lib/useDragScroll'

type PromoField = 'code' | 'percent'
const CODE_PATTERN = /^[A-Z0-9]{3,12}$/
const MAX_PERCENT = 90

/** Codes created here are stored with the shop data and are accepted by the cart immediately. */
export function PromotionsTab() {
  const { ref: tableRef } = useDragScroll<HTMLDivElement>()
  const { promos, addPromo, togglePromo } = useStore()
  const [code, setCode] = useState('')
  const [percent, setPercent] = useState('10')
  const [errors, setErrors] = useState<FormErrors<PromoField>>({})

  const submit = () => {
    const found: FormErrors<PromoField> = {}
    const rate = Number(percent)
    if (!CODE_PATTERN.test(code)) found.code = 'Use 3 to 12 letters or numbers'
    else if (promos.some((promo) => promo.code === code)) found.code = 'This code already exists'
    if (!Number.isInteger(rate) || rate < 1 || rate > MAX_PERCENT) {
      found.percent = `Enter a whole number from 1 to ${MAX_PERCENT}`
    }
    setErrors(found)
    if (hasErrors(found)) return
    addPromo({ code, rate: rate / 100, active: true })
    setCode('')
    setPercent('10')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div ref={tableRef} className="drag-scroll overflow-x-auto border-2 border-white/10">
        <table className="w-full min-w-[360px] text-left text-sm">
          <thead className="text-xs uppercase text-white/50">
            <tr>
              <th className="p-3">Code</th>
              <th>Discount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {promos.map((promo) => (
              <tr key={promo.code} className="border-t border-white/10">
                <td className="p-3 font-bold">{promo.code}</td>
                <td>{Math.round(promo.rate * 100)}%</td>
                <td>
                  <button
                    type="button"
                    aria-pressed={promo.active}
                    aria-label={`${promo.active ? 'Pause' : 'Activate'} ${promo.code}`}
                    onClick={() => togglePromo(promo.code)}
                    className={`h-9 border px-3 text-xs font-bold uppercase ${
                      promo.active ? 'border-ac text-ac' : 'border-white/20 text-white/50'
                    }`}
                  >
                    {promo.active ? 'Active' : 'Paused'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {promos.length === 0 && <p className="p-6 text-center text-white/60">No promo codes yet.</p>}
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="h-fit space-y-4 border-2 border-white/10 p-4"
      >
        <h2 className="display text-sm">New promo code</h2>
        <Field label="Code" value={code} onChange={(value) => setCode(value.toUpperCase())} error={errors.code} />
        <Field label="Discount (%)" value={percent} onChange={setPercent} error={errors.percent} />
        <Button type="submit" className="w-full">
          Create code
        </Button>
      </form>
    </div>
  )
}
