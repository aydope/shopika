import { useState } from 'react'
import { Download } from 'lucide-react'
import { useStore } from '@/store'
import { adminOrders, type SampleOrder } from '@/data/mock'
import { downloadCsv } from '@/lib/csv'
import { usd } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { StatCard, inputClass } from './ChartCard'
import { useDragScroll } from '@/lib/useDragScroll'

const STATUSES = ['Processing', 'Packed', 'Shipped', 'Delivered']

/** Orders placed in this browser come first, followed by the sample orders. */
export function OrdersTab() {
  const { ref: tableRef } = useDragScroll<HTMLDivElement>()
  const { orders: placedOrders, setOrderStatus } = useStore()
  const [sampleStatus, setSampleStatus] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')

  const rows: SampleOrder[] = [
    ...placedOrders.map((o) => ({
      id: o.id,
      customer: 'Online customer',
      total: o.total,
      status: o.status,
      date: o.date,
    })),
    ...adminOrders.map((o) => ({ ...o, status: sampleStatus[o.id] ?? o.status })),
  ]
  const needle = search.trim().toLowerCase()
  const visible = rows.filter(
    (o) =>
      (status === 'All' || o.status === status) &&
      (!needle || `${o.id} ${o.customer}`.toLowerCase().includes(needle)),
  )
  const revenue = visible.reduce((sum, o) => sum + o.total, 0)

  const changeStatus = (order: SampleOrder, next: string) => {
    if (placedOrders.some((o) => o.id === order.id)) setOrderStatus(order.id, next)
    else setSampleStatus((current) => ({ ...current, [order.id]: next }))
  }
  const exportCsv = () =>
    downloadCsv(
      'orders.csv',
      ['Order', 'Customer', 'Date', 'Status', 'Total'],
      visible.map((o) => [o.id, o.customer, o.date, o.status, o.total]),
    )

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Orders shown" value={String(visible.length)} />
        <StatCard label="Revenue shown" value={usd(revenue)} />
        {['Processing', 'Shipped'].map((s) => (
          <StatCard key={s} label={s} value={String(rows.filter((o) => o.status === s).length)} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search orders"
          placeholder="Search by order or customer"
          className={`${inputClass} w-full sm:w-72`}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
          className={inputClass}
        >
          <option>All</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <Button variant="outline" size="sm" className="h-11 sm:ml-auto" onClick={exportCsv}>
          <Download size={14} />
          Export CSV
        </Button>
      </div>

      <div ref={tableRef} className="drag-scroll overflow-x-auto border-2 border-white/10">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs uppercase text-white/50">
            <tr>
              <th className="p-3">Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((order) => (
              <tr key={order.id} className="border-t border-white/10">
                <td className="p-3">{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.date}</td>
                <td className="text-ac">{usd(order.total)}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => changeStatus(order, e.target.value)}
                    aria-label={`Status of ${order.id}`}
                    className="h-9 border border-white/20 bg-black px-2"
                  >
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <p className="p-6 text-center text-white/60">No orders match your filters.</p>}
      </div>
    </div>
  )
}
