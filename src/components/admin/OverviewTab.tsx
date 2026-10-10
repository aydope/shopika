import { useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useStore } from '@/store'
import { activity, catSales, funnel, sales, trafficSources } from '@/data/mock'
import { AXIS_COLOR, CHART_COLORS, GRID_COLOR, tooltipStyle } from '@/lib/chartTheme'
import { usd } from '@/lib/utils'
import { ChartCard, StatCard } from './ChartCard'

const RANGES = [3, 6, 12]

function DonutChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
          {data.map((slice, index) => (
            <Cell key={slice.name} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function OverviewTab() {
  const products = useStore((s) => s.products)
  const [range, setRange] = useState(12)

  const months = sales.slice(-range)
  const revenue = months.reduce((sum, m) => sum + m.revenue, 0)
  const orders = months.reduce((sum, m) => sum + m.orders, 0)
  const visitors = months.reduce((sum, m) => sum + m.visitors, 0)
  const topProducts = [...products]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((p) => ({ name: p.name.slice(0, 20), units: p.count * 4 }))

  return (
    <div className="space-y-5">
      <div role="group" aria-label="Date range" className="flex gap-2">
        {RANGES.map((months) => (
          <button
            key={months}
            type="button"
            aria-pressed={range === months}
            onClick={() => setRange(months)}
            className={`h-10 border-2 px-4 text-xs font-bold uppercase ${
              range === months ? 'border-ac bg-ac text-black' : 'border-white/20'
            }`}
          >
            {months}M
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Revenue" value={usd(revenue)} hint="+12.4% vs prev." />
        <StatCard label="Orders" value={orders.toLocaleString()} hint="+8.1% vs prev." />
        <StatCard label="Visitors" value={visitors.toLocaleString()} hint="+15.2% vs prev." />
        <StatCard label="Conversion" value={`${((orders / visitors) * 100).toFixed(2)}%`} hint="+0.4% vs prev." />
        <StatCard label="Avg order value" value={usd(revenue / orders)} hint="+3.1% vs prev." />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <ChartCard title="Revenue and orders" className="lg:col-span-2">
          <ResponsiveContainer>
            <AreaChart data={months}>
              <CartesianGrid stroke={GRID_COLOR} />
              <XAxis dataKey="m" stroke={AXIS_COLOR} />
              <YAxis yAxisId="revenue" stroke={AXIS_COLOR} />
              <YAxis yAxisId="orders" orientation="right" stroke={AXIS_COLOR} />
              <Tooltip {...tooltipStyle} />
              <Area yAxisId="revenue" dataKey="revenue" stroke="#c6ff00" fill="#c6ff0033" />
              <Line yAxisId="orders" dataKey="orders" stroke="#ff2bd6" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Sales by category">
          <DonutChart data={catSales} />
        </ChartCard>
        <ChartCard title="Top products (units)">
          <ResponsiveContainer>
            <BarChart data={topProducts} layout="vertical" margin={{ left: 40 }}>
              <XAxis type="number" stroke={AXIS_COLOR} />
              <YAxis type="category" dataKey="name" stroke={AXIS_COLOR} width={110} tick={{ fontSize: 11 }} />
              <Tooltip {...tooltipStyle} cursor={{ fill: '#ffffff10' }} />
              <Bar dataKey="units" fill="#ff2bd6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Conversion funnel">
          <ResponsiveContainer>
            <BarChart data={funnel}>
              <CartesianGrid stroke={GRID_COLOR} />
              <XAxis dataKey="step" stroke={AXIS_COLOR} tick={{ fontSize: 11 }} />
              <YAxis stroke={AXIS_COLOR} />
              <Tooltip {...tooltipStyle} cursor={{ fill: '#ffffff10' }} />
              <Bar dataKey="v" fill="#22d3ee" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Traffic sources (%)">
          <DonutChart data={trafficSources} />
        </ChartCard>
      </div>

      <section className="border-2 border-white/10 p-4">
        <h2 className="display mb-3 text-sm">Recent activity</h2>
        <ul className="divide-y divide-white/10 text-sm">
          {activity.map((entry) => (
            <li key={entry.text} className="flex justify-between gap-4 py-2">
              <span>{entry.text}</span>
              <span className="shrink-0 text-white/50">{entry.time}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
