import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Tab, Tabs } from '@mui/material'
import { useAuth } from '@/auth'
import { usePage } from './Utils'
import { OverviewTab } from './admin/OverviewTab'
import { OrdersTab } from './admin/OrdersTab'
import { ProductsTab } from './admin/ProductsTab'
import { CustomersTab } from './admin/CustomersTab'
import { PromotionsTab } from './admin/PromotionsTab'

const TABS = [
  { id: 'overview', label: 'Overview', Panel: OverviewTab },
  { id: 'orders', label: 'Orders', Panel: OrdersTab },
  { id: 'products', label: 'Products', Panel: ProductsTab },
  { id: 'customers', label: 'Customers', Panel: CustomersTab },
  { id: 'promotions', label: 'Promotions', Panel: PromotionsTab },
]

const TAB_STYLE = {
  mb: 3,
  '& .MuiTabs-indicator': { bgcolor: 'var(--ac)' },
  '& .Mui-selected': { color: 'var(--ac) !important' },
}

export default function Admin() {
  usePage('Admin dashboard', 'Store analytics and operations.')
  const user = useAuth((s) => s.user)
  const [activeId, setActiveId] = useState(TABS[0].id)

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') {
    return (
      <div className="px-4 py-24 text-center">
        <h1 className="display text-2xl">Admin access only</h1>
        <p className="mt-2 text-white/60">Sign in with an admin account to view this page.</p>
      </div>
    )
  }

  const active = TABS.find((tab) => tab.id === activeId) ?? TABS[0]

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="display mb-6 text-3xl sm:text-4xl">
        ADMIN <span className="grad">PANEL</span>
      </h1>
      <Tabs value={active.id} onChange={(_, value) => setActiveId(value)} variant="scrollable" sx={TAB_STYLE}>
        {TABS.map((tab) => (
          <Tab key={tab.id} value={tab.id} label={tab.label} />
        ))}
      </Tabs>
      <active.Panel />
    </div>
  )
}
