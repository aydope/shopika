import type { ReactNode } from 'react'

type ChartCardProps = { title: string; children: ReactNode; className?: string }

export function ChartCard({ title, children, className = '' }: ChartCardProps) {
  return (
    <section className={`border-2 border-white/10 p-4 ${className}`}>
      <h2 className="display mb-3 text-sm">{title}</h2>
      <div className="h-60">{children}</div>
    </section>
  )
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border-2 border-white/10 p-4">
      <p className="text-xs uppercase text-white/50">{label}</p>
      <b className="display text-xl sm:text-2xl">{value}</b>
      {hint && <p className="text-xs text-ac">{hint}</p>}
    </div>
  )
}

export const inputClass = 'h-11 border-2 border-white/20 bg-black px-3 outline-none focus:border-ac'
