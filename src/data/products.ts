export type Review = { id: string; name: string; text: string; date: string; rating?: number; likes: number }
export type Product = { id: string; name: string; cat: string; kind: 'cloth' | 'shoe' | 'none'; brand: string; sku: string; price: number; old?: number; img: string; images: string[]; rating: number; count: number; desc: string; tag: string; stock: number; colors: [string, string][]; specs: [string, string][]; reviews: Review[] }
const CATS: Record<string, [string, Product['kind']]> = { 'mens-shirts': ["Men's Shirts", 'cloth'], tops: ['Tops', 'cloth'], 'womens-dresses': ['Dresses', 'cloth'], 'mens-shoes': ["Men's Shoes", 'shoe'], 'womens-shoes': ["Women's Shoes", 'shoe'], 'mens-watches': ["Men's Watches", 'none'], 'womens-watches': ["Women's Watches", 'none'], 'womens-bags': ['Bags', 'none'], 'womens-jewellery': ['Jewellery', 'none'], sunglasses: ['Sunglasses', 'none'] }
const PAL: [string, string][] = [['Black', '#111111'], ['White', '#f5f5f5'], ['Lime', '#c6ff00'], ['Magenta', '#ff2bd6'], ['Navy', '#1e3a8a'], ['Sand', '#d6c7a1']]
export const sizesFor = (p: Product) => (p.kind === 'cloth' ? ['XS', 'S', 'M', 'L', 'XL'] : p.kind === 'shoe' ? (p.cat.startsWith("Men's") ? ['40', '41', '42', '43', '44', '45', '46'] : ['36', '37', '38', '39', '40', '41']) : [])
export const products: Product[] = []
export async function loadProducts() { // real catalog from dummyjson.com
  if (products.length) return
  try {
    const d = await (await fetch('https://dummyjson.com/products?limit=0')).json()
    products.push(...d.products.filter((x: any) => CATS[x.category]).map((x: any): Product => {
      const dp = x.discountPercentage || 0, dm = x.dimensions
      return { id: 'd' + x.id, name: x.title, cat: CATS[x.category][0], kind: CATS[x.category][1], brand: x.brand || 'ShopiKa', sku: x.sku, price: x.price, old: dp >= 10 ? Math.round((x.price / (1 - dp / 100)) * 100) / 100 : undefined, img: x.thumbnail, images: x.images?.length ? x.images : [x.thumbnail], rating: x.rating, count: 20 + ((x.id * 53) % 380), desc: x.description, tag: x.tags?.[0] || 'new', stock: x.stock,
        colors: [0, 1, 2, 3].map((i) => PAL[(x.id + i) % 6]),
        specs: ([['Brand', x.brand || 'ShopiKa'], ['SKU', x.sku], ['Category', CATS[x.category][0]], ['Weight', x.weight && `${x.weight} oz`], ['Dimensions', dm && `${dm.width} x ${dm.height} x ${dm.depth} cm`], ['Warranty', x.warrantyInformation], ['Shipping', x.shippingInformation], ['Returns', x.returnPolicy], ['Availability', x.availabilityStatus], ['Minimum order', x.minimumOrderQuantity && String(x.minimumOrderQuantity)]] as [string, string][]).filter((r) => r[1]),
        reviews: (x.reviews || []).map((r: any, i: number) => ({ id: `r${x.id}-${i}`, name: r.reviewerName, text: r.comment, date: String(r.date).slice(0, 10), rating: r.rating, likes: (i * 3 + x.id) % 9 })) }
    }))
  } catch { /* handled by empty state */ }
}
