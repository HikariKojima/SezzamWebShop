import { requireAdminSession } from '$lib/server/adminAuth';
import { db } from '$lib/server/db';
import { orders, products } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	requireAdminSession(cookies);

	const [productRows, orderRows] = await Promise.all([
		db.select({ active: products.active }).from(products),
		db.select({ status: orders.status }).from(orders)
	]);

	return {
		activeProducts: productRows.filter((product) => product.active).length,
		inactiveProducts: productRows.filter((product) => !product.active).length,
		totalOrders: orderRows.length,
		pendingOrders: orderRows.filter((order) => order.status === 'pending').length
	};
};
