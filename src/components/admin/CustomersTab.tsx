import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { customers } from '@/data/mock'
import { AXIS_COLOR, GRID_COLOR, tooltipStyle } from '@/lib/chartTheme'
import { usd } from '@/lib/utils'
import { ChartCard, StatCard, inputClass } from './ChartCard'
import { useDragScroll } from '@/lib/useDragScroll'

type SortKey = 'spent' | 'orders' | 'joined'
const SORTERS: Record<SortKey, (a: (typeof customers)[number], b: (typeof customers)[number]) => number> = {
  spent: (a, b) => b.spent - a.spent,
  orders: (a, b) => b.orders - a.orders,
  joined: (a, b) => b.joined.localeCompare(a.joined),
}

const isSortKey = (value: string): value is SortKey => value in SORTERS

export function CustomersTab() {
  const { ref: tableRef } = useDragScroll<HTMLDivElement>()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('spent')

  const needle = search.trim().toLowerCase()
  const rows = customers
    .filter((c) => !needle || `${c.name} ${c.email}`.toLowerCase().includes(needle))
    .sort(SORTERS[sort])
  const totalSpent = customers.reduce((sum, c) => sum + c.spent, 0)
  const totalOrders = customers.reduce((sum, c) => sum + c.orders, 0)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Customers" value={String(customers.length)} />
        <StatCard label="Lifetime value" value={usd(totalSpent)} />
        <StatCard label="Avg per customer" value={usd(totalSpent / customers.length)} />
        <StatCard label="Orders per customer" value={(totalOrders / customers.length).toFixed(1)} />
      </div>

      <ChartCard title="Top customers by spend">
        <ResponsiveContainer>
          <BarChart data={[...customers].sort(SORTERS.spent).slice(0, 6)}>
            <CartesianGrid stroke={GRID_COLOR} />
            <XAxis dataKey="name" stroke={AXIS_COLOR} tick={{ fontSize: 11 }} />
            <YAxis stroke={AXIS_COLOR} />
            <Tooltip {...tooltipStyle} cursor={{ fill: '#ffffff10' }} />
            <Bar dataKey="spent" fill="#c6ff00" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search customers"
          placeholder="Search by name or email"
          className={`${inputClass} w-full sm:w-72`}
        />
        <select
          value={sort}
          onChange={(e) => isSortKey(e.target.value) && setSort(e.target.value)}
          aria-label="Sort customers"
          className={inputClass}
        >
          <option value="spent">Highest spend</option>
          <option value="orders">Most orders</option>
          <option value="joined">Newest</option>
        </select>
      </div>

      <div ref={tableRef} className="drag-scroll overflow-x-auto border-2 border-white/10">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs uppercase text-white/50">
            <tr>
              <th className="p-3">Customer</th>
              <th>Country</th>
              <th>Orders</th>
              <th>Spent</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((customer) => (
              <tr key={customer.email} className="border-t border-white/10">
                <td className="p-3">
                  {customer.name}
                  <span className="block text-xs text-white/50">{customer.email}</span>
                </td>
                <td>{customer.country}</td>
                <td>{customer.orders}</td>
                <td className="text-ac">{usd(customer.spent)}</td>
                <td>{customer.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
