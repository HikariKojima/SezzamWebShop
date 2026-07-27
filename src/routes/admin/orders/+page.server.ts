import { fail } from '@sveltejs/kit';
import { desc, eq, inArray } from 'drizzle-orm';

import { orderStatusOptions } from '$lib/adminOptions';
import { requireAdminSession } from '$lib/server/adminAuth';
import { db } from '$lib/server/db';
import { orderItems, orders } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

const orderStatusValues = orderStatusOptions.map((option) => option.value);

function parseOrderId(value: FormDataEntryValue | null) {
	if (typeof value !== 'string' || !/^\d+$/.test(value.trim())) return null;
	return Number(value);
}

export const load: PageServerLoad = async ({ cookies, url }) => {
	requireAdminSession(cookies);

	const statusParam = url.searchParams.get('status') ?? 'all';
	const statusFilter = orderStatusValues.includes(statusParam as (typeof orderStatusValues)[number])
		? statusParam
		: 'all';

	const orderRows =
		statusFilter === 'all'
			? await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(100)
			: await db
					.select()
					.from(orders)
					.where(eq(orders.status, statusFilter))
					.orderBy(desc(orders.createdAt))
					.limit(100);

	const items =
		orderRows.length > 0
			? await db
					.select()
					.from(orderItems)
					.where(
						inArray(
							orderItems.orderId,
							orderRows.map((order) => order.id)
						)
					)
			: [];

	return {
		statusFilter,
		orders: orderRows.map((order) => ({
			...order,
			subtotal: order.subtotalCents / 100,
			items: items
				.filter((item) => item.orderId === order.id)
				.map((item) => ({
					...item,
					unitPrice: item.unitPriceCents / 100,
					lineTotal: item.lineTotalCents / 100
				}))
		}))
	};
};

export const actions: Actions = {
	updateOrderStatus: async ({ cookies, request }) => {
		requireAdminSession(cookies);

		const formData = await request.formData();
		const orderId = parseOrderId(formData.get('orderId'));
		const status = String(formData.get('status') ?? '');

		if (!orderId || !orderStatusValues.includes(status as (typeof orderStatusValues)[number])) {
			return fail(400, { error: 'Status narudzbe nije ispravan.' });
		}

		await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, orderId));

		return { success: true, message: `Narudzba #${orderId} je azurirana.` };
	}
};
