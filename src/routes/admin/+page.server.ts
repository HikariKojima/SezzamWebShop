import { desc } from 'drizzle-orm';

import { requireAdminSession } from '$lib/server/adminAuth';
import { db } from '$lib/server/db';
import { orders, products } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

const activeOrderStatuses = new Set(['pending', 'ready']);

export const load: PageServerLoad = async ({ cookies }) => {
	requireAdminSession(cookies);

	const [productRows, orderRows] = await Promise.all([
		db
			.select({
				id: products.id,
				name: products.name,
				active: products.active,
				stockQuantity: products.stockQuantity,
				reservedQuantity: products.reservedQuantity
			})
			.from(products),
		db
			.select({
				id: orders.id,
				customerName: orders.customerName,
				status: orders.status,
				subtotalCents: orders.subtotalCents,
				createdAt: orders.createdAt
			})
			.from(orders)
			.orderBy(desc(orders.createdAt))
	]);

	const completedOrders = orderRows.filter((order) => order.status === 'completed');
	const activeOrders = orderRows.filter((order) => activeOrderStatuses.has(order.status));
	const revenueCents = completedOrders.reduce((total, order) => total + order.subtotalCents, 0);

	const statusCounts = {
		pending: orderRows.filter((order) => order.status === 'pending').length,
		ready: orderRows.filter((order) => order.status === 'ready').length,
		completed: completedOrders.length,
		cancelled: orderRows.filter((order) => order.status === 'cancelled').length
	};

	return {
		activeProducts: productRows.filter((product) => product.active).length,
		inactiveProducts: productRows.filter((product) => !product.active).length,
		totalOrders: orderRows.length,
		statusCounts,
		revenueCents,
		activeOrderValueCents: activeOrders.reduce((total, order) => total + order.subtotalCents, 0),
		averageOrderCents:
			completedOrders.length > 0 ? Math.round(revenueCents / completedOrders.length) : 0,
		recentOrders: orderRows.slice(0, 5),
		lowStockProducts: productRows
			.filter(
				(product) =>
					product.active && Math.max(product.stockQuantity - product.reservedQuantity, 0) <= 5
			)
			.map((product) => ({
				id: product.id,
				name: product.name,
				availableQuantity: Math.max(product.stockQuantity - product.reservedQuantity, 0)
			}))
			.sort((first, second) => first.availableQuantity - second.availableQuantity)
			.slice(0, 5)
	};
};
