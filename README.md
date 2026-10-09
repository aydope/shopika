
## Scripts
- `npm run dev`: start the dev server
- `npm run build`: type check, then build
- `npm run typecheck`: type check only
- `npm run format` / `npm run format:check`: Prettier (run `format` once and commit the result as a separate style commit)

## Architecture notes
- `src/store.ts` owns shared client state: the product catalog and its load status, cart, wishlist, compare list, orders, comments and theme. Only the user-owned parts are persisted, and persisted data is validated when it is read back.
- `src/auth.ts` is a separate store for the mock accounts.
- `src/data/products.ts` fetches and validates the dummyjson catalog. `src/lib/pricing.ts` is the single place for shipping, promo code and totals. `src/lib/validation.ts` and `src/components/ui/field.tsx` are shared by every form.

## Known limitations
- There is no backend. Authentication is mock only: accounts and passwords are stored in localStorage in plain text. Replace it with a real identity provider before real customers use it.
- Checkout, contact form, newsletter and order tracking are client-side only and send nothing anywhere. Order tracking only finds orders placed in this browser and the sample orders used by the dashboards.
- The dashboards use generated sample data (`src/data/mock.ts`); only low stock and top products use the real catalog.
- Product colors are generated per product because the catalog API has no color variants.
- Social links in the footer point to the platform home pages and must be replaced with real profiles.
- No automated tests and no ESLint configuration yet. Large parts of the older JSX are still written in a compact style until Prettier is run.
- Legal pages contain sample text and need review before launch.
