const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export type SalesMonth = { m: string; revenue: number; orders: number; visitors: number }
export type SampleOrder = { id: string; customer: string; total: number; status: string; date: string }
export type Customer = { name: string; email: string; orders: number; spent: number; joined: string; country: string }
export type Activity = { time: string; text: string }

export const sales: SalesMonth[] = MONTHS.map((m, i) => ({
  m,
  revenue: 14000 + i * 2100 + ((i * 53) % 7) * 900,
  orders: 180 + i * 24 + ((i * 31) % 6) * 9,
  visitors: 5200 + i * 640 + ((i * 17) % 5) * 300,
}))

export const catSales = [
  { name: 'Tops', value: 30 },
  { name: 'Dresses', value: 22 },
  { name: 'Shoes', value: 20 },
  { name: 'Watches', value: 16 },
  { name: 'Accessories', value: 12 },
]

export const trafficSources = [
  { name: 'Search', value: 38 },
  { name: 'Direct', value: 26 },
  { name: 'Social', value: 21 },
  { name: 'Email', value: 15 },
]

export const funnel = [
  { step: 'Visits', v: 48200 },
  { step: 'Product views', v: 21400 },
  { step: 'Add to cart', v: 6900 },
  { step: 'Checkout', v: 3100 },
  { step: 'Paid', v: 2250 },
]

export const adminOrders: SampleOrder[] = [
  { id: 'SK-104233', customer: 'Mika Laine', total: 189, status: 'Shipped', date: '2026-10-08' },
  { id: 'SK-104232', customer: 'Ari Salo', total: 89, status: 'Processing', date: '2026-10-08' },
  { id: 'SK-104231', customer: 'Noor Hassan', total: 312, status: 'Delivered', date: '2026-10-07' },
  { id: 'SK-104230', customer: 'Lena Koch', total: 45, status: 'Shipped', date: '2026-10-07' },
  { id: 'SK-104229', customer: 'Tomas Reyes', total: 249, status: 'Processing', date: '2026-10-06' },
  { id: 'SK-104228', customer: 'Yuki Tanaka', total: 138, status: 'Delivered', date: '2026-10-05' },
  { id: 'SK-104227', customer: 'Amira Saleh', total: 76, status: 'Packed', date: '2026-10-05' },
  { id: 'SK-104226', customer: 'Jonas Berg', total: 204, status: 'Delivered', date: '2026-10-04' },
]

export const customers: Customer[] = [
  { name: 'Noor Hassan', email: 'noor@example.com', orders: 14, spent: 2210, joined: '2025-11-02', country: 'FI' },
  { name: 'Yuki Tanaka', email: 'yuki@example.com', orders: 11, spent: 1675, joined: '2025-12-19', country: 'JP' },
  { name: 'Mika Laine', email: 'member@shopika.com', orders: 9, spent: 1342, joined: '2026-01-08', country: 'FI' },
  { name: 'Amira Saleh', email: 'amira@example.com', orders: 7, spent: 980, joined: '2026-02-14', country: 'AE' },
  { name: 'Jonas Berg', email: 'jonas@example.com', orders: 6, spent: 864, joined: '2026-03-03', country: 'SE' },
  { name: 'Lena Koch', email: 'lena@example.com', orders: 4, spent: 512, joined: '2026-05-21', country: 'DE' },
  { name: 'Tomas Reyes', email: 'tomas@example.com', orders: 3, spent: 447, joined: '2026-06-30', country: 'ES' },
  { name: 'Ari Salo', email: 'ari@example.com', orders: 2, spent: 178, joined: '2026-08-12', country: 'FI' },
]

export const activity: Activity[] = [
  { time: '2 min ago', text: 'Mika Laine placed order SK-104233' },
  { time: '18 min ago', text: 'New customer registered: Ari Salo' },
  { time: '1 h ago', text: 'Low stock alert on a top selling product' },
  { time: '3 h ago', text: 'Order SK-104231 was delivered' },
  { time: 'Yesterday', text: 'Promo code SHOPI20 was used 14 times' },
]

export const spend = MONTHS.slice(0, 10).map((m, i) => ({ m, spent: 40 + ((i * 61) % 9) * 35 }))

export const pastOrders = [
  {
    id: 'SK-103118',
    date: '2026-08-14',
    total: 128,
    status: 'Delivered',
    items: [
      { name: 'Classic Shirt', qty: 1, size: 'L' },
      { name: 'Leather Bag', qty: 1, size: '' },
    ],
  },
  {
    id: 'SK-102477',
    date: '2026-06-02',
    total: 139,
    status: 'Delivered',
    items: [{ name: 'Running Shoes', qty: 1, size: '42' }],
  },
]
