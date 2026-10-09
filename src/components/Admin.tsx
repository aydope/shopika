import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'
import { DollarSign, ShoppingCart, Users, TrendingUp, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/auth'
import { products } from '@/data/products'
import { sales, catSales, funnel, adminOrders } from '@/data/mock'
import { usd } from '@/lib/utils'
import { usePage } from './Utils'
const tip = { contentStyle: { background: '#000', border: '1px solid #444' } }, COL = ['#c6ff00', '#ff2bd6', '#22d3ee', '#f59e0b', '#a78bfa']
const Card = ({ t, children, cls = '' }: { t: string; children: React.ReactNode; cls?: string }) => <section className={`border-2 border-white/10 p-4 ${cls}`}><h2 className="display mb-3 text-sm">{t}</h2><div className="h-60">{children}</div></section>
export default function Admin() {
  usePage('Admin dashboard', 'Store analytics and operations.')
  const { user } = useAuth(), [range, setRange] = useState(12)
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <div className="px-4 py-24 text-center"><h1 className="display text-2xl">Admin access only</h1><p className="mt-2 text-white/60">Sign in with an admin account to view this page.</p></div>
  const d = sales.slice(-range), rev = d.reduce((a, x) => a + x.revenue, 0), ord = d.reduce((a, x) => a + x.orders, 0), vis = d.reduce((a, x) => a + x.visitors, 0)
  const kpi = [[DollarSign, 'Revenue', usd(rev), '+12.4%'], [ShoppingCart, 'Orders', ord.toLocaleString(), '+8.1%'], [Users, 'Visitors', vis.toLocaleString(), '+15.2%'], [TrendingUp, 'Conversion', ((ord / vis) * 100).toFixed(2) + '%', '+0.4%']]
  const low = [...products].sort((a, b) => a.stock - b.stock).slice(0, 6), top = [...products].sort((a, b) => b.count - a.count).slice(0, 5).map((p) => ({ name: p.name.slice(0, 20), units: p.count * 4 }))
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="display text-3xl sm:text-4xl">ADMIN <span className="grad">PANEL</span></h1>
        <div role="group" aria-label="Date range" className="flex gap-2">{[3, 6, 12].map((r) => <button key={r} aria-pressed={range === r} onClick={() => setRange(r)} className={`h-10 border-2 px-4 text-xs font-bold uppercase ${range === r ? 'border-ac bg-ac text-black' : 'border-white/20'}`}>{r}M</button>)}</div></div>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">{kpi.map(([I, l, v, c]: any) => <div key={l} className="border-2 border-white/10 p-4"><I className="mb-2 text-ac" size={18} /><p className="text-xs uppercase text-white/50">{l}</p><b className="display text-xl sm:text-2xl">{v}</b><p className="text-xs text-ac">{c} vs prev.</p></div>)}</div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Card t="Revenue" cls="lg:col-span-2"><ResponsiveContainer><AreaChart data={d}><CartesianGrid stroke="#ffffff15" /><XAxis dataKey="m" stroke="#888" /><YAxis stroke="#888" /><Tooltip {...tip} /><Area dataKey="revenue" stroke="#c6ff00" fill="#c6ff0033" /></AreaChart></ResponsiveContainer></Card>
        <Card t="Sales by category"><ResponsiveContainer><PieChart><Pie data={catSales} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>{catSales.map((_, i) => <Cell key={i} fill={COL[i]} stroke="none" />)}</Pie><Tooltip {...tip} /><Legend /></PieChart></ResponsiveContainer></Card>
        <Card t="Top products (units)"><ResponsiveContainer><BarChart data={top} layout="vertical" margin={{ left: 40 }}><XAxis type="number" stroke="#888" /><YAxis type="category" dataKey="name" stroke="#888" width={110} tick={{ fontSize: 11 }} /><Tooltip {...tip} /><Bar dataKey="units" fill="#ff2bd6" /></BarChart></ResponsiveContainer></Card>
        <Card t="Conversion funnel" cls="lg:col-span-2"><ResponsiveContainer><BarChart data={funnel}><CartesianGrid stroke="#ffffff15" /><XAxis dataKey="step" stroke="#888" /><YAxis stroke="#888" /><Tooltip {...tip} /><Bar dataKey="v" fill="#22d3ee" /></BarChart></ResponsiveContainer></Card>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="overflow-x-auto border-2 border-white/10 p-4"><h2 className="display mb-3 text-sm">Recent orders</h2><table className="w-full min-w-[420px] text-left text-sm"><thead className="text-xs uppercase text-white/50"><tr><th className="py-2">Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead><tbody>{adminOrders.map((o) => <tr key={o.id} className="border-t border-white/10"><td className="py-2">{o.id}</td><td>{o.customer}</td><td className="text-ac">{usd(o.total)}</td><td>{o.status}</td></tr>)}</tbody></table></section>
        <section className="overflow-x-auto border-2 border-white/10 p-4"><h2 className="display mb-3 flex items-center gap-2 text-sm"><AlertTriangle size={16} className="text-ac2" />Low stock</h2><table className="w-full min-w-[320px] text-left text-sm"><thead className="text-xs uppercase text-white/50"><tr><th className="py-2">Product</th><th>Category</th><th>Stock</th></tr></thead><tbody>{low.map((p) => <tr key={p.id} className="border-t border-white/10"><td className="py-2">{p.name}</td><td>{p.cat}</td><td className={p.stock <= 5 ? 'font-bold text-ac2' : ''}>{p.stock}</td></tr>)}</tbody></table></section>
      </div>
    </div>
  )
}
