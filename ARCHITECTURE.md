# SezzamWebShop - Codebase Architecture & File Guide

A complete guide to all files, folders, and interactions in this project.

---

## 1. High-Level Technology Stack

- **Framework**: [SvelteKit 2](https://kit.svelte.dev/) with **Svelte 5 Runes** (`$state`, `$derived`, `$props`, `$effect`).
- **Styling**: Tailwind CSS + Custom CSS Variables + Lucide Svelte Icons.
- **Database**: PostgreSQL (via [Neon Serverless](https://neon.tech/)) managed with [Drizzle ORM](https://orm.drizzle.team/).
- **Storage**: Vercel Blob (with Base64 automatic fallback for local/offline development).
- **TypeScript**: Strict type checking across API routes, server actions, and UI components.

---

## 2. Directory Map at a Glance

```
sadmirApp/
├── .agents/                    # Agent instructions & workspace rules
├── drizzle/                    # SQL database migrations & schema snapshots
├── scripts/                    # Database seeding and migration utilities
├── static/                     # Static public assets (logos, favicons, textures)
│   ├── images/
│   │   ├── logo/               # Vector & raster brand logos, pyramid icons
│   │   └── showcase/           # High-res WPC textures & terrace photos
│   └── favicon.*               # Root browser fallback icons
└── src/                        # Main application source code
    ├── app.html                # HTML root template & SEO head tags
    ├── app.d.ts                # Ambient TypeScript definitions (Locals, PageData)
    ├── routes/                 # SvelteKit file-based routing
    │   ├── +layout.svelte      # Global layout: Header, Footer, Cart Drawer
    │   ├── +page.svelte        # Public Homepage: Hero, Showcase, Catalog
    │   ├── admin/              # Protected admin portal (Dashboard, Products, Settings)
    │   └── sitemap.xml/        # Dynamic search engine XML sitemap
    └── lib/                    # Shared library code (imported via '$lib/...')
        ├── components/         # Reusable Svelte components (Cards, Forms, Modals)
        │   └── ui/             # Reusable UI primitives (Buttons, Inputs, Dialogs)
        ├── server/             # Server-only logic (Database, Auth, Image storage)
        │   └── db/             # Drizzle connection & table definitions
        └── types/              # TypeScript interfaces (Product, Cart, Settings)
```

---

## 3. Detailed File-by-File Breakdown

### `src/routes/` (Pages & Endpoints)

SvelteKit uses file-based routing where folders represent URL paths:

#### Public Routes
- **`src/routes/+layout.svelte`**
  - The master layout wrapping every public page.
  - Renders the global `Header.svelte`, `Footer.svelte`, mobile navigation drawer, and sliding Cart Drawer.
  - Holds reactive cart state in local storage so visitor carts persist across sessions.
- **`src/routes/+page.server.ts`**
  - Runs **on the server** before the homepage renders.
  - Queries products, categories, and live site settings from PostgreSQL in parallel.
  - Handles server actions such as placing an order (`checkout`) or submitting a quote request.
- **`src/routes/+page.svelte`**
  - The storefront homepage.
  - Combines:
    1. **Hero**: Headline, tagline, CTA buttons, visual background.
    2. **DualSideShowcase**: Interactive "Dva lica savršenstva" decking preview.
    3. **Product Catalog**: Live search, category filtering, price sorting, and responsive product grid.
    4. **MaterialCalculator**: Decking & clips area calculator for terrace projects.
    5. **FAQ & Contact**: Common questions and inquiry form.
- **`src/routes/sitemap.xml/+server.ts`**
  - Generates a dynamic XML sitemap listing all active products and categories for Google indexing.

#### Admin Routes (`/admin`)
- **`src/routes/admin/+layout.server.ts`**
  - Server-side guard: checks if the admin session cookie is valid. Redirects unauthenticated visitors to `/admin/login`.
- **`src/routes/admin/+layout.svelte`**
  - Admin dashboard navigation wrapper.
  - Displays top navigation on desktop and bottom bar on mobile with links to:
    - **Nadzorna ploča** (`/admin`)
    - **Proizvodi** (`/admin/products`)
    - **Kategorije** (`/admin/categories`)
    - **Narudžbe** (`/admin/orders`)
    - **Početna** (`/admin/homepage`)
- **`src/routes/admin/+page.svelte`**
  - Admin dashboard analytics: total revenue, pending orders, product count, and recent activity.
- **`src/routes/admin/homepage/+page.svelte`**
  - Dedicated CMS panel to modify the public storefront's Hero text, images, showcase quote, and phone/email without touching code.
- **`src/routes/admin/products/+page.svelte`**
  - Inventory management table: lists products with stock, pricing, category, and direct edit/delete links.
- **`src/routes/admin/products/new/` & `src/routes/admin/products/[id]/`**
  - Product creation and editing pages using `AdminProductForm.svelte`.
- **`src/routes/admin/orders/+page.svelte`**
  - Order management: view customer details, ordered items, delivery addresses, and change order status (Pending / Processing / Completed).
- **`src/routes/admin/login/` & `src/routes/admin/logout/`**
  - Secure login with bcrypt password hashing and session cookie issuance.

---

### `src/lib/components/` (Frontend UI Components)

- **`Hero.svelte`**:
  - Renders the primary above-the-fold banner.
  - Dynamically takes title, tagline, description, and visual from database settings.
- **`DualSideShowcase.svelte`**:
  - Displays the "Dva lica savršenstva" presentation.
  - Provides the interactive surface switcher: **Lice A (3D Godovi)**, **Lice B (Ripne / Linije)**, or **50/50 Split** with texture zoom.
- **`ProductCard.svelte`**:
  - Renders individual product cards in the catalog.
  - **Auto-Slideshow**: Native Svelte 5 carousel that automatically cycles through product photos.
  - **Dual-Side Split Card**: If `hasDualSide` is enabled, slide 0 is an interactive 50/50 split preview showing both faces.
  - **Zero CPU Idle**: Built with `IntersectionObserver` so timers pause when off-screen or hovered.
- **`ProductQuickViewModal.svelte`**:
  - Lightbox modal that opens when a customer clicks "Brzi pregled".
  - Shows full-resolution image carousel, thumbnails bar, specs list, dual-face badges, and quantity picker.
- **`AdminProductForm.svelte`**:
  - The unified form used for both creating and editing products.
  - Supports multi-image file selection, client-side canvas WebP compression, drag & drop, cover selection ("Postavi kao glavnu"), and the "Dvostrani dizajn (2-u-1)" switch.
- **`MaterialCalculator.svelte`**:
  - Interactive calculator where customers input terrace length & width.
  - Calculates the exact number of WPC decking boards, sub-structure aluminum/WPC beams, clips, and screws needed.
- **`Header.svelte` & `Footer.svelte`**:
  - Top navigation bar (sticky with glassmorphism blur) and comprehensive footer.
- **`SEO.svelte`**:
  - Injects OpenGraph meta tags, canonical URL, twitter card data, and Schema.org JSON-LD structured data for search engines.

---

### `src/lib/server/` (Backend & Database Services)

Code in `src/lib/server/` only runs on the server:

- **`db/schema.ts`**:
  - Drizzle ORM schema defining PostgreSQL tables:
    - `products`: id, title, slug, description, price, categoryId, inStock, `images` (JSON array of strings), `hasDualSide` (boolean), `imageUrl` (primary cover).
    - `categories`: id, name, slug, description, image.
    - `orders`: id, customerName, email, phone, address, totalAmount, status, createdAt.
    - `orderItems`: orderId, productId, quantity, unitPrice.
    - `siteSettings`: key-value / record table storing Hero text, showcase quotes, and contact info.
- **`db/client.ts` & `db/index.ts`**:
  - Establishes connection to the Neon serverless PostgreSQL database using connection pooling.
- **`adminAuth.ts`**:
  - Manages admin credentials, password verification, cookie issuance, and `requireAdminSession` middleware.
- **`adminProducts.ts`**:
  - Helper functions for product CRUD: image upload processing (handling Vercel Blob / Base64 fallback), formatting JSON image arrays, and database mutations.
- **`siteSettings.ts`**:
  - Reads and upserts the global site configuration from `site_settings`. Returns fallbacks if database rows are empty.

---

### `static/` (Public Static Assets)

Files here are served directly at the root URL (e.g., `static/favicon.ico` → `https://sezzam.ba/favicon.ico`):

- **`static/images/logo/`**:
  - `logo.png`, `logo-square.png`, `sezzam-logo-full.png`, `sezzam-logo-white.png`: Official high-res logo variations.
  - `pyramid-icon-512.png`: High-res 512×512 pure Mayan pyramid mark.
  - `favicon.svg`, `favicon-32x32.png`, `favicon-48x48.png`, `favicon.png`, `apple-touch-icon.png`, `favicon.ico`: Formatted favicons.
- **`static/images/showcase/`**:
  - `wpc-dual-terrace.jpg`: Premium terrace decking showcase photography.
  - `texture-3d-wood.jpg`: Macro 3D embossed wood grain texture.
  - `texture-grooved.jpg`: Macro clean grooved lines texture.
- **`static/favicon.*`**:
  - Root copies of the pure pyramid favicon for standard browser auto-discovery.

---

## 4. Summary Cheat-Sheet

| If you want to change... | Look into this file: |
|---|---|
| **Store logo or favicon** | `static/images/logo/` & `src/app.html` |
| **Homepage Hero text or Showcase quote** | Admin panel `/admin/homepage` OR `src/lib/server/siteSettings.ts` |
| **Dual-Face showcase visual or text** | `src/lib/components/DualSideShowcase.svelte` |
| **Product card carousel or split card styling** | `src/lib/components/ProductCard.svelte` |
| **Add/edit fields on products** | `src/lib/server/db/schema.ts` & `src/lib/components/AdminProductForm.svelte` |
| **Material calculation formulas** | `src/lib/components/MaterialCalculator.svelte` |
| **Checkout and order placement logic** | `src/routes/+page.server.ts` (action `checkout`) |
| **Global colors, typography, or Tailwind styles** | `src/routes/layout.css` & `tailwind.config.js` |
