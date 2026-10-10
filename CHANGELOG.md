# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com), versioning follows [SemVer](https://semver.org).

## [1.2.0] - 2026-10-10
### Added
- Drag scrolling with the mouse (with momentum) on the top picks slider, category chips, product thumbnails, compare
  table and admin tables. Touch screens keep native finger scrolling.
- Shop filter sidebar with price range, rating, brand, on sale and in stock, removable filter chips, clear all and a
  bottom sheet on phones. Every filter and the sort order are stored in the URL.

### Changed
- Product card redesign: round action buttons, discount badge, second photo on hover, quick-add bar, color dots, rating
  with review count and a hard offset hover shadow.

## [1.1.0] - 2026-10-10
### Added
- SVG logo and favicon.
- Search results panel with products, categories, related and recent searches, trending items and keyboard control.
- Admin dashboard tabs: overview, orders (status changes, CSV export), products, customers and promo codes.
- Promo codes are stored with the shop data and used by the cart and checkout.
- ESLint configuration and a `lint` script.
- `ButtonLink` for links that look like buttons.

### Changed
- Product cards use a column layout so the buy button always lines up at the bottom of the card.
- All internal links use React Router instead of intercepted anchors.
- The VIP/Gold theme toggle and its styles were removed.
- Source files are wrapped to 120 columns and written one property per line instead of compressed one-liners.

### Fixed
- Chart tooltips showed dark text on a black box.
- Category, filter and search changes jumped back to the top of the page.
- Links that should stay on the page caused a reload or jump to the top.
- Controls nested inside links (a button inside an anchor).

## [1.0.1] - 2026-10-09
### Changed
- The product catalog now lives in the store with an explicit loading, ready and error status instead of a mutable module array.
- Cart pricing, shipping and promo rules are defined once and shared by cart, checkout and the mobile bar.
- All forms use one `Field` component and shared validation helpers.
- Compiler checks are stricter (`noUnusedLocals`, `noUnusedParameters`, `isolatedModules`).

### Fixed
- Conditional hook call in the catalog page.
- Duplicate products possible in development because two catalog requests could both append.
- Login redirected by guessing the role from the email text.
- Mega menu and mobile category links did not open the matching category or product.
- Compare dialog added sized products to the cart without a size.
- Order tracking invented a status for unknown order numbers.
- HTTP errors from the catalog API were not detected.
- Search results, copy feedback and scroll handling relied on arbitrary timeouts.
- Footer social links shared one placeholder URL and had no accessible names.

### Added
- Runtime validation of the catalog response and of data restored from localStorage.
- Explicit `type` on every button, accessible names for form errors, Prettier and EditorConfig.

## [1.0.0] - 2026-10-09
### Added
- CI workflow, GitHub Pages deployment and Dependabot configuration.
- MIT license and changelog.

## [0.4.0]
### Added
- Login and registration, member dashboard and admin dashboard with charts.
- Checkout, wishlist, order tracking, contact, privacy, terms and shipping pages.

## [0.3.0]
### Added
- Product page with gallery, color and size selection, size guide and specifications.
- Reviews and comments system, journal with six articles.

## [0.2.0]
### Added
- Real catalog from dummyjson.com, product cards, filters and sorting.
- Cart drawer, compare dialog, live search, mega menu and mobile navigation.
- Landing page sections: hero, top picks, categories, flash sale, about, testimonials, FAQ, newsletter.

## [0.1.0]
### Added
- Vite, React, TypeScript project setup with Tailwind v4, MUI and shadcn-style primitives.
