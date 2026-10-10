# ShopiKa

Streetwear and accessories storefront built with React 18, TypeScript, Vite, React Router, Tailwind v4,
shadcn-style components, MUI, Framer Motion, Zustand and Recharts. Product data, images and reviews come from
dummyjson.com.

## Run

```bash
npm install
npm run dev
```

## Accounts

| Role   | Email               | Password    |
| ------ | ------------------- | ----------- |
| Admin  | admin@shopika.com   | admin123    |
| Member | member@shopika.com  | member123   |

Promo code `SHOPI20` gives 20% off. Admins can create more codes in the dashboard.

## Scripts

- `npm run dev`: start the dev server
- `npm run build`: type check, then build
- `npm run typecheck`: type check only
- `npm run lint`: ESLint (TypeScript and React Hooks rules)
- `npm run format` / `npm run format:check`: Prettier (`.prettierrc.json`, print width 120)

## Features

- Storefront: hero, top picks, categories, flash sale, catalog with filters, product pages with gallery, colors,
  sizes, size guide, specifications and reviews, wishlist, compare, cart, checkout and order tracking.
- Search: a large results panel with products, matching categories, related searches, recent searches and trending
  items. Keyboard shortcuts: `/` focuses the field, arrow keys move through results, Enter opens one.
- Shop page with a filter sidebar (price, rating, brand, availability), filter chips and a mobile filter sheet.
  Filters are kept in the URL, so a filtered view can be shared.
- Horizontal lists and tables can be dragged with the mouse (touch screens scroll natively).
- Smooth inertia scrolling on desktop (Lenis) and a custom scrollbar. Phones use native scrolling.
- Phone layout: bottom navigation, sticky Filter and Sort bar with bottom sheets, swipeable product photos.
- Journal with articles and comments.
- Member area with rewards tier, spending chart and order history.
- Admin dashboard: overview charts, orders (status changes and CSV export), product inventory, customers and
  promo codes that the cart accepts immediately.

## Architecture notes

- `src/store.ts` owns shared client state: the product catalog and its load status, cart, wishlist, compare list,
  orders, comments, promo codes and recent searches. Only user-owned data is persisted, and it is validated when read.
- `src/auth.ts` is a separate store for the mock accounts.
- `src/data/products.ts` fetches and validates the catalog. `src/lib/pricing.ts` is the single place for shipping,
  promo and totals. `src/lib/validation.ts` and `src/components/ui/field.tsx` are shared by every form.
- Internal navigation uses React Router `Link`. `ScrollManager` scrolls to hashes and to the top on page changes, but
  keeps the scroll position when only filters or search change.

## Deploy

- Vercel and Netlify: SPA rewrites are included (`vercel.json`, `public/_redirects`).
- GitHub Pages: push to `main`. `.github/workflows/deploy.yml` builds with the repository base path and adds a
  `404.html` fallback. Enable Pages with the source set to "GitHub Actions".

## Known limitations

- There is no backend. Authentication is mock only: accounts and passwords are stored in localStorage in plain text.
  Replace it with a real identity provider before real customers use it.
- Checkout, contact form, newsletter and order tracking are client-side only. Order tracking finds orders placed in
  this browser and the sample orders used by the dashboards.
- Dashboard charts use generated sample data (`src/data/mock.ts`). Top products and inventory use the real catalog.
  Admin stock edits last for the current session.
- Product colors are generated per product because the catalog API has no color variants.
- Footer social links point to the platform home pages and must be replaced with real profiles.
- There are no automated tests yet. ESLint and Prettier are configured but were not run when the files were written:
  run `npm run format` and `npm run lint` once and commit the result.
- Legal pages contain sample text and need review before launch.
