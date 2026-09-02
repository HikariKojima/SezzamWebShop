import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	integer,
	pgTable,
	serial,
	text,
	timestamp,
	varchar
} from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
	id: varchar('id', { length: 64 }).primaryKey(),
	name: varchar('name', { length: 120 }).notNull(),
	sortOrder: integer('sort_order').notNull().default(0)
});

export const products = pgTable(
	'products',
	{
		id: varchar('id', { length: 120 }).primaryKey(),
		categoryId: varchar('category_id', { length: 64 })
			.notNull()
			.references(() => categories.id),
		name: varchar('name', { length: 180 }).notNull(),
		description: text('description').notNull(),
		priceCents: integer('price_cents').notNull(),
		unit: varchar('unit', { length: 80 }).notNull(),
		unitType: varchar('unit_type', { length: 40 }).notNull(),
		tag: varchar('tag', { length: 80 }).notNull(),
		stockLabel: varchar('stock_label', { length: 80 }).notNull(),
		stockQuantity: integer('stock_quantity').notNull().default(0),
		reservedQuantity: integer('reserved_quantity').notNull().default(0),
		availability: varchar('availability', { length: 40 }).notNull(),
		art: varchar('art', { length: 40 }).notNull(),
		imageUrl: text('image_url'),
		active: boolean('active').notNull().default(true),
		sortOrder: integer('sort_order').notNull().default(0),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		index('products_active_sort_idx').on(table.active, table.sortOrder),
		index('products_category_idx').on(table.categoryId),
		index('products_price_idx').on(table.priceCents)
	]
);

export const orders = pgTable(
	'orders',
	{
		id: serial('id').primaryKey(),
		customerName: varchar('customer_name', { length: 160 }).notNull(),
		customerPhone: varchar('customer_phone', { length: 80 }).notNull(),
		customerEmail: varchar('customer_email', { length: 180 }),
		companyName: varchar('company_name', { length: 180 }),
		companyId: varchar('company_id', { length: 80 }),
		companyAddress: text('company_address'),
		orderNote: text('order_note'),
		status: varchar('status', { length: 40 }).notNull().default('pending'),
		paymentMethod: varchar('payment_method', { length: 40 }).notNull().default('cash_in_person'),
		subtotalCents: integer('subtotal_cents').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		index('orders_status_created_idx').on(table.status, table.createdAt),
		index('orders_phone_idx').on(table.customerPhone)
	]
);

export const orderItems = pgTable(
	'order_items',
	{
		id: serial('id').primaryKey(),
		orderId: integer('order_id')
			.notNull()
			.references(() => orders.id),
		productId: varchar('product_id', { length: 120 })
			.notNull()
			.references(() => products.id),
		productName: varchar('product_name', { length: 180 }).notNull(),
		productUnit: varchar('product_unit', { length: 80 }).notNull(),
		quantity: integer('quantity').notNull(),
		unitPriceCents: integer('unit_price_cents').notNull(),
		lineTotalCents: integer('line_total_cents').notNull()
	},
	(table) => [
		index('order_items_order_idx').on(table.orderId),
		index('order_items_product_idx').on(table.productId)
	]
);

export const categoriesRelations = relations(categories, ({ many }) => ({
	products: many(products)
}));

export const productsRelations = relations(products, ({ one }) => ({
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.id]
	})
}));

export const ordersRelations = relations(orders, ({ many }) => ({
	items: many(orderItems)
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.id]
	})
}));
