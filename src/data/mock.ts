const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const sales = M.map((m, i) => ({
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
export const topProducts = [
  ['Neon Rider Hoodie', 412],
  ['Running Shoes', 366],
  ['Pixel Ghost Tee', 301],
  ['Glitch High Top', 254],
  ['Holo Dad Cap', 198],
].map(([name, units]) => ({ name, units }))
export const funnel = [
  ['Visits', 48200],
  ['Product views', 21400],
  ['Add to cart', 6900],
  ['Checkout', 3100],
  ['Paid', 2250],
].map(([step, v]) => ({ step, v }))
export const adminOrders = [
  ['SK-104233', 'Mika Laine', 189, 'Shipped', '2026-10-08'],
  ['SK-104232', 'Ari Salo', 89, 'Processing', '2026-10-08'],
  ['SK-104231', 'Noor Hassan', 312, 'Delivered', '2026-10-07'],
  ['SK-104230', 'Lena Koch', 45, 'Shipped', '2026-10-07'],
  ['SK-104229', 'Tomas Reyes', 249, 'Processing', '2026-10-06'],
  ['SK-104228', 'Yuki Tanaka', 138, 'Delivered', '2026-10-05'],
].map(([id, customer, total, status, date]) => ({ id, customer, total, status, date })) as {
  id: string
  customer: string
  total: number
  status: string
  date: string
}[]
export const spend = M.slice(0, 10).map((m, i) => ({ m, spent: 40 + ((i * 61) % 9) * 35 }))
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
  { id: 'SK-102477', date: '2026-06-02', total: 139, status: 'Delivered', items: [{ name: 'Running Shoes', qty: 1, size: '42' }] },
]
