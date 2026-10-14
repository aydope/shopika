# ShopiKa

ShopiKa is a streetwear and accessories storefront built as a full single-page application. It covers the whole
shopping journey (browse, search, filter, compare, cart, checkout, order tracking) and adds member and admin
dashboards, a journal with comments, and a responsive design that was shaped for phones as much as for desktop.
Everything runs in the browser, so the project is a self-contained front-end showcase.

The look is bold and neon: a near-black base, lime and magenta accents, hard edges, large display type and motion
that stays out of the way when people ask for less of it.

## Features

### Storefront

- Landing page with an animated hero, top picks slider, category tiles, flash sale, perks strip, about section,
  testimonials built from real product reviews, FAQ and newsletter signup.
- Product cards with a discount badge, second photo on hover, quick add, color dots, rating with review count,
  wishlist and compare buttons. Prices and buy buttons line up across every card in a row.
- Product pages with a photo gallery (hover zoom on desktop, swipeable carousel on phones), color and size
  selection, a size guide, stock and delivery estimate, specification table, shipping tab, rating breakdown,
  reviews, related products and recently viewed items.
- Wishlist, side-by-side product comparison, cart drawer with free-shipping progress, and a checkout form with
  validation and an order confirmation.
- Order tracking with a status stepper, plus contact, shipping, privacy and terms pages.

### Search and filtering

- Search panel with product results (photo, price, rating, highlighted match), matching categories, related
  searches, recent searches and trending items. Keyboard control: `/` to focus, arrows to move, Enter to open,
  Escape to close.
- Shop filters for price range, rating, brand, on sale and in stock, with sorting, removable filter chips and paging.
  Every filter lives in the URL, so a filtered view can be shared or reloaded.
- On phones the filters open in a bottom sheet with large touch targets, next to a sticky Filter and Sort bar.

### Accounts and dashboards

- Sign in and registration with validation and a password reveal toggle.
- Member area with a rewards tier and progress bar, spending chart and order history.
- Admin dashboard with five tabs: overview analytics (revenue, orders, visitors, conversion, category and traffic
  charts, funnel, activity), orders (search, status changes, CSV export), inventory with editable stock, customers
  with a spend chart, and promo code management. Codes created there are accepted by the cart immediately.

### Content

- Journal with articles, reading time, related products and a comment system.
- Comments and star reviews with validation, helpful votes and rating distribution.

### Interaction and motion

- Smooth inertia scrolling for mouse wheels and trackpads, with native scrolling kept for touch screens and for
  people who prefer reduced motion.
- Drag-to-scroll with the mouse (with momentum) on sliders, chips, thumbnails and wide tables.
- Scroll progress bar, back to top button, scroll-triggered reveals and a custom store-style scrollbar.

### Mobile experience

- Bottom navigation with the current page highlighted, a floating compare shortcut, full-width calls to action,
  44px minimum touch targets, safe-area spacing for notched phones and sticky add to cart on product pages.

### Resilience

- If the live catalog cannot be reached (offline use, blocked network), the app falls back to a bundled sample
  catalog with drawn product illustrations and shows a notice with a retry button.

## Technology

| Area              | Choice                                                                         | Used for                                                         |
| ----------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| Framework         | React 18 with TypeScript (strict)                                              | Components, hooks, type safety                                   |
| Build tool        | Vite                                                                           | Dev server, bundling, code splitting                             |
| Routing           | React Router 6                                                                 | SPA routes, URL-driven filters, hash scrolling                   |
| State             | Zustand with `persist`                                                         | Catalog, cart, wishlist, orders, promo codes, comments, accounts |
| Styling           | Tailwind CSS v4                                                                | Layout, design tokens, responsive utilities                      |
| UI primitives     | shadcn-style components (`class-variance-authority`, `clsx`, `tailwind-merge`) | Buttons and form fields                                          |
| Component library | MUI                                                                            | Drawers, dialogs, tabs, sliders, ratings, steppers, skeletons    |
| Animation         | Framer Motion, Lenis                                                           | Reveals and hero motion, inertia scrolling                       |
| Charts            | Recharts                                                                       | Admin and member analytics                                       |
| Icons             | lucide-react, react-icons                                                      | Interface and brand icons                                        |
| Data              | dummyjson.com API plus a bundled offline catalog                               | Products, photos, specifications, reviews                        |
| Quality           | ESLint, Prettier, EditorConfig, strict `tsconfig`                              | Linting, formatting, unused code checks                          |
| Automation        | GitHub Actions, Dependabot                                                     | Build checks on every push, dependency updates                   |

## Project structure

```
src/
  components/
    admin/        Admin dashboard tabs (overview, orders, products, customers, promotions)
    shop/         Filter panel used by the shop page
    ui/           Button, ButtonLink and Field primitives
    ...           Header, SearchBox, Catalog, ProductCard, ProductPage, Cart, Checkout pages, Blog, Comments
  data/           Catalog loading and validation, offline sample catalog, journal posts, dashboard sample data
  lib/            Pricing, filters, validation, CSV export, drag scrolling, smooth scrolling, chart theme
  store.ts        Shared client state
  auth.ts         Account state
```

## How it is built

- **One source of truth.** The product catalog, its loading state and all user-owned data live in one store.
  Components read from it instead of keeping copies.
- **Pricing in one place.** Shipping, free-shipping threshold, promo codes and totals are computed by a single
  module that the cart, checkout and header all use.
- **URL as state.** Category, search, price, rating, brands, availability and sort are query parameters, which makes
  filtered views linkable and keeps the back button predictable.
- **Validated external data.** The catalog response and everything restored from localStorage are checked at runtime
  before use, so stale or edited data cannot break the app.
- **Shared forms.** Checkout, contact, login, registration, comments and promo creation use one accessible `Field`
  component and one set of validation helpers.
- **Type safety.** No `any`, no non-null assertions, unused code is a compile error, and errors are handled instead
  of swallowed.
- **Performance.** Dashboards and account pages are lazy loaded, vendor code is split into chunks, images are lazy
  loaded and long lists are paged.

## Design and accessibility

- Dark theme with lime (`#c6ff00`) and magenta (`#ff2bd6`) accents, Unbounded for display type and Space Grotesk for
  text, all defined as design tokens.
- Semantic landmarks, a skip link, visible focus rings, labelled controls, error messages tied to their fields,
  `aria-pressed` and `aria-current` states, and live regions for results and confirmations.
- Interface follows mobile guidelines: thumb-reachable navigation, 44px targets, 16px inputs to avoid zoom on iOS,
  bottom sheets instead of cramped dropdowns and respect for `prefers-reduced-motion`.
- SEO basics: per-page titles and descriptions, canonical and social tags, and JSON-LD for the site, products,
  the catalog list and articles.

## Test accounts

| Role   | Email              | Password  |
| ------ | ------------------ | --------- |
| Admin  | admin@shopika.com  | admin123  |
| Member | member@shopika.com | member123 |

The promo code `SHOPI20` gives 20% off.

## Limitations

- There is no backend. Authentication is mock only and stores accounts and passwords in localStorage in plain
  text, so it must be replaced with a real identity provider before real customers use it.
- Checkout, the contact form, the newsletter and order tracking are client-side only. Tracking finds orders placed in
  this browser and the sample orders used by the dashboards.
- Dashboard charts use generated sample data. Top products and inventory use the catalog. Admin stock edits last for
  the current session.
- Product colors are generated per product because the catalog API has no color variants.
- Footer social links point to the platform home pages and need real profiles.
- There are no automated tests yet, and the legal pages contain sample text that needs review before launch.

## License

MIT
