import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Tab, Tabs, LinearProgress, Chip } from '@mui/material'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Award, Package, Heart, LogOut } from 'lucide-react'
import { useAuth } from '@/auth'
import { useStore } from '@/store'
import { pastOrders, spend } from '@/data/mock'
import { Button } from '@/components/ui/button'
import { usd } from '@/lib/utils'
import { usePage } from './Utils'
const tiers = [['Bronze', 0], ['Silver', 1500], ['Gold', 3000], ['Black', 6000]] as const
export default function Account() {
  usePage('My account', 'Your orders, rewards and profile.')
  const { user, logout } = useAuth(), { orders, likes } = useStore(), [tab, setTab] = useState(0)
  if (!user) return <Navigate to="/login" replace />
  const all = [...orders, ...pastOrders], pts = 1240 + Math.round(orders.reduce((a, o) => a + o.total, 0) * 10)
  const ti = tiers.reduce((a, t, i) => (pts >= t[1] ? i : a), 0), next = tiers[ti + 1], pct = next ? ((pts - tiers[ti][1]) / (next[1] - tiers[ti][1])) * 100 : 100
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-white/50">Welcome back</p><h1 className="display text-3xl sm:text-4xl">{user.name}</h1></div><Button variant="outline" onClick={logout}><LogOut size={16} />Sign out</Button></div>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" sx={{ mb: 3, '& .MuiTabs-indicator': { bgcolor: 'var(--ac)' }, '& .Mui-selected': { color: 'var(--ac) !important' } }}><Tab label="Overview" /><Tab label="Orders" /><Tab label="Profile" /></Tabs>
      {tab === 0 && <div className="grid gap-5 md:grid-cols-3">
        <div className="border-2 border-ac p-5 md:col-span-2"><p className="mb-1 flex items-center gap-2 text-sm text-white/60"><Award size={16} className="text-ac" />Rewards tier</p><p className="display text-3xl text-ac">{tiers[ti][0]}</p><p className="mb-3 text-sm text-white/60">{pts.toLocaleString()} points{next ? `, ${(next[1] - pts).toLocaleString()} to ${next[0]}` : ', top tier reached'}</p><LinearProgress variant="determinate" value={pct} sx={{ height: 8, bgcolor: '#222', '& .MuiLinearProgress-bar': { bgcolor: 'var(--ac)' } }} /></div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-1">{[[Package, all.length, 'Orders', '/track'], [Heart, likes.length, 'Wishlist', '/wishlist']].map(([I, n, l, to]: any) => <Link key={l} to={to} className="border-2 border-white/10 p-4 hover:border-ac"><I className="mb-1 text-ac" size={18} /><b className="display text-2xl">{n}</b><p className="text-xs uppercase text-white/50">{l}</p></Link>)}</div>
        <div className="border-2 border-white/10 p-5 md:col-span-3"><h2 className="display mb-4 text-lg">Spending by month</h2><div className="h-56" role="img" aria-label="Area chart of monthly spending"><ResponsiveContainer><AreaChart data={spend}><CartesianGrid stroke="#ffffff15" /><XAxis dataKey="m" stroke="#888" /><YAxis stroke="#888" /><Tooltip contentStyle={{ background: '#000', border: '1px solid #444' }} /><Area dataKey="spent" stroke="#c6ff00" fill="#c6ff0033" /></AreaChart></ResponsiveContainer></div></div></div>}
      {tab === 1 && <div className="space-y-3">{all.map((o) => <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 border-2 border-white/10 p-4"><div><b>{o.id}</b><p className="text-sm text-white/50">{o.date} · {o.items.map((i) => `${i.name}${i.size ? ` (${i.size})` : ''} x${i.qty}`).join(', ')}</p></div><div className="flex items-center gap-3"><Chip label={o.status} size="small" sx={{ bgcolor: o.status === 'Delivered' ? '#14532d' : '#713f12', color: '#fff' }} /><b className="text-ac">{usd(o.total)}</b></div></div>)}</div>}
      {tab === 2 && <dl className="grid max-w-md gap-4 border-2 border-white/10 p-5"><div><dt className="text-xs uppercase text-white/50">Name</dt><dd>{user.name}</dd></div><div><dt className="text-xs uppercase text-white/50">Email</dt><dd>{user.email}</dd></div><div><dt className="text-xs uppercase text-white/50">Account type</dt><dd className="capitalize">{user.role}</dd></div></dl>}
    </div>
  )
}
