# Sezzam Project Notes

Use this file to transfer project context between machines or chats. If you open a new chat on the PC, say: "Read PROJECT_NOTES.md and continue from there."

## Stack

- SvelteKit with Svelte 5
- TypeScript
- Tailwind CSS
- shadcn-svelte components
- Neon PostgreSQL
- Drizzle ORM

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local `.env` file on every machine:

```txt
DATABASE_URL=...
ADMIN_PASSWORD=...
ADMIN_SESSION_SECRET=...
```

Never commit `.env`. Only `.env.example` should be committed.

Run the app:

```bash
npm run dev -- --host 127.0.0.1 --port 5174
```

Admin URL:

```txt
http://127.0.0.1:5174/admin
```

Current local admin password:

```txt
AdminPass123!
```

Change this before deployment.

## Current Storefront

- Products load from Neon through SvelteKit server `load`.
- Cart is client-side and persists in `localStorage`.
- Checkout submits a cash/in-person order.
- Customer order form requires name and a Bosnian phone number.
- Server recalculates order totals from database prices.
- Submitted orders reserve stock by increasing `products.reservedQuantity`.
- Public storefront only shows products where `active = true`.

## Current Admin

Admin auth:

- Single owner/admin password.
- Signed HTTP-only session cookie.
- No user table, roles, password reset, or employee accounts yet.

Admin routes:

- `/admin` - clean overview dashboard
- `/admin/orders` - order list, status filters, status updates
- `/admin/products` - product list, search, active/inactive filter, edit/delete actions
- `/admin/products/new` - create product
- `/admin/products/[id]` - edit product
- `/admin/login` - admin login
- `/admin/logout` - logout endpoint

Product management:

- Prices are entered in KM but stored as integer `priceCents`.
- Active/inactive controls storefront visibility.
- Product hard delete is allowed only when no `order_items` rows reference the product.
- If a product is already used in an order, deletion should fail and the owner should set it inactive instead.

Order statuses:

- `pending`
- `confirmed`
- `ready`
- `completed`
- `cancelled`

## Important Concepts

- Route folders map to URLs. Example: `src/routes/admin/orders/+page.svelte` becomes `/admin/orders`.
- `+layout.svelte` wraps child routes. The admin layout gives all admin pages the same header and navigation.
- `+page.server.ts` runs only on the server and can safely read/write Neon.
- SvelteKit server actions handle form submissions like create product, edit product, delete product, and update order status.
- Hard delete needs a server-side order reference check so historical orders do not break.

## Suggested Next Steps

1. Product detail pages
   - Add `/proizvodi/[id]` public pages.
   - Product cards should link to details.
   - Include product name, price, unit, availability, description, related materials, and add-to-cart controls.
   - This helps SEO and gives customers more confidence before ordering.

2. Product images
   - Replace temporary CSS-drawn product art with real uploaded or hosted images.
   - Add image fields to products, such as `imageUrl` and `imageAlt`.
   - Later, admin should allow changing product image URL or uploading images.

3. Better order workflow
   - Add clearer owner actions for orders: confirm, mark ready, complete, cancel.
   - Consider reducing reserved stock when an order is cancelled.
   - Consider deducting real stock only when an order is completed.

4. Order detail page
   - Add `/admin/orders/[id]`.
   - Show full order information, items, status history later, and customer contact actions.
   - Keep `/admin/orders` as a fast scanning/filtering page.

5. SEO polish
   - Add product detail metadata.
   - Add structured data for products where appropriate.
   - Improve Bosnian search terms and category landing sections.

6. Deployment preparation
   - Choose hosting for SvelteKit.
   - Add production environment variables.
   - Change `ADMIN_PASSWORD`.
   - Generate a new long `ADMIN_SESSION_SECRET`.
   - Verify Neon connection from production.

7. Online payment later
   - Keep cash/in-person working first.
   - Add card payment only after orders, inventory, admin, and deployment are stable.

## Validation Commands

Run these after meaningful changes:

```bash
npm run check
npm run lint
npm run build
```
