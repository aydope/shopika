import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Chip, LinearProgress, Tab, Tabs } from '@mui/material'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Award, Heart, LogOut, Package, type LucideIcon } from 'lucide-react'
import { useAuth } from '@/auth'
import { useStore } from '@/store'
import { pastOrders, spend } from '@/data/mock'
import { AXIS_COLOR, GRID_COLOR, tooltipStyle } from '@/lib/chartTheme'
import { usd } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { usePage } from './Utils'

const TIERS = [
  { name: 'Bronze', from: 0 },
  { name: 'Silver', from: 1500 },
  { name: 'Gold', from: 3000 },
  { name: 'Black', from: 6000 },
]
const STARTING_POINTS = 1240
const POINTS_PER_DOLLAR = 10

const TAB_STYLE = {
  mb: 3,
  '& .MuiTabs-indicator': { bgcolor: 'var(--ac)' },
  '& .Mui-selected': { color: 'var(--ac) !important' },
}

const statusColor = (status: string) => (status === 'Delivered' ? '#14532d' : '#713f12')

export default function Account() {
  usePage('My account', 'Your orders, rewards and profile.')
  const { user, logout } = useAuth()
  const { orders, likes } = useStore()
  const [tab, setTab] = useState(0)

  if (!user) return <Navigate to="/login" replace />

  const allOrders = [...orders, ...pastOrders]
  const points = STARTING_POINTS + Math.round(orders.reduce((sum, o) => sum + o.total, 0) * POINTS_PER_DOLLAR)
  const tierIndex = TIERS.reduce((current, tier, index) => (points >= tier.from ? index : current), 0)
  const tier = TIERS[tierIndex]
  const nextTier = TIERS[tierIndex + 1]
  const progress = nextTier ? ((points - tier.from) / (nextTier.from - tier.from)) * 100 : 100
  const stats: { Icon: LucideIcon; value: number; label: string; to: string }[] = [
    { Icon: Package, value: allOrders.length, label: 'Orders', to: '/track' },
    { Icon: Heart, value: likes.length, label: 'Wishlist', to: '/wishlist' },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-white/50">Welcome back</p>
          <h1 className="display text-3xl sm:text-4xl">{user.name}</h1>
        </div>
        <Button variant="outline" onClick={logout}>
          <LogOut size={16} />
          Sign out
        </Button>
      </div>

      <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" sx={TAB_STYLE}>
        <Tab label="Overview" />
        <Tab label="Orders" />
        <Tab label="Profile" />
      </Tabs>

      {tab === 0 && (
        <div className="grid gap-5 md:grid-cols-3">
          <div className="border-2 border-ac p-5 md:col-span-2">
            <p className="mb-1 flex items-center gap-2 text-sm text-white/60">
              <Award size={16} className="text-ac" />
              Rewards tier
            </p>
            <p className="display text-3xl text-ac">{tier.name}</p>
            <p className="mb-3 text-sm text-white/60">
              {points.toLocaleString()} points
              {nextTier ? `, ${(nextTier.from - points).toLocaleString()} to ${nextTier.name}` : ', top tier reached'}
            </p>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 8, bgcolor: '#222', '& .MuiLinearProgress-bar': { bgcolor: 'var(--ac)' } }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
            {stats.map(({ Icon, value, label, to }) => (
              <Link key={label} to={to} className="border-2 border-white/10 p-4 hover:border-ac">
                <Icon className="mb-1 text-ac" size={18} />
                <b className="display text-2xl">{value}</b>
                <p className="text-xs uppercase text-white/50">{label}</p>
              </Link>
            ))}
          </div>
          <div className="border-2 border-white/10 p-5 md:col-span-3">
            <h2 className="display mb-4 text-lg">Spending by month</h2>
            <div className="h-56" role="img" aria-label="Area chart of monthly spending">
              <ResponsiveContainer>
                <AreaChart data={spend}>
                  <CartesianGrid stroke={GRID_COLOR} />
                  <XAxis dataKey="m" stroke={AXIS_COLOR} />
                  <YAxis stroke={AXIS_COLOR} />
                  <Tooltip {...tooltipStyle} />
                  <Area dataKey="spent" stroke="#c6ff00" fill="#c6ff0033" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === 1 && (
        <div className="space-y-3">
          {allOrders.map((order) => (
            <div
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-3 border-2 border-white/10 p-4"
            >
              <div>
                <b>{order.id}</b>
                <p className="text-sm text-white/50">
                  {order.date} ·{' '}
                  {order.items
                    .map((item) => `${item.name}${item.size ? ` (${item.size})` : ''} x${item.qty}`)
                    .join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Chip label={order.status} size="small" sx={{ bgcolor: statusColor(order.status), color: '#fff' }} />
                <b className="text-ac">{usd(order.total)}</b>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 2 && (
        <dl className="grid max-w-md gap-4 border-2 border-white/10 p-5">
          <div>
            <dt className="text-xs uppercase text-white/50">Name</dt>
            <dd>{user.name}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-white/50">Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-white/50">Account type</dt>
            <dd className="capitalize">{user.role}</dd>
          </div>
        </dl>
      )}
    </div>
  )
}
