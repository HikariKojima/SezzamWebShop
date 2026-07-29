import { fail } from '@sveltejs/kit';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';

import { orderStatusOptions } from '$lib/adminOptions';
import { requireAdminSession } from '$lib/server/adminAuth';
import { db } from '$lib/server/db';
import { orderItems, orders, products } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

const orderStatusValues = orderStatusOptions.map((option) => option.value);
const activeStatuses = new Set(['pending', 'ready']);
const terminalStatuses = new Set(['completed', 'cancelled']);

class InventoryUpdateError extends Error {}

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
			return fail(400, { error: 'Status narudžbe nije ispravan.' });
		}

		try {
			const result = await db.transaction(async (tx) => {
				const [order] = await tx
					.select({ status: orders.status })
					.from(orders)
					.where(eq(orders.id, orderId))
					.limit(1);

				if (!order) return 'missing' as const;
				if (order.status === status) return 'unchanged' as const;
				if (terminalStatuses.has(order.status)) return 'terminal' as const;

				const items = await tx
					.select({ productId: orderItems.productId, quantity: orderItems.quantity })
					.from(orderItems)
					.where(eq(orderItems.orderId, orderId));

				if (activeStatuses.has(order.status) && terminalStatuses.has(status)) {
					for (const item of items) {
						const updated = await tx
							.update(products)
							.set(
								status === 'completed'
									? {
											stockQuantity: sql`${products.stockQuantity} - ${item.quantity}`,
											reservedQuantity: sql`${products.reservedQuantity} - ${item.quantity}`
										}
									: {
											reservedQuantity: sql`${products.reservedQuantity} - ${item.quantity}`
										}
							)
							.where(
								and(
									eq(products.id, item.productId),
									sql`${products.reservedQuantity} >= ${item.quantity}`,
									status === 'completed'
										? sql`${products.stockQuantity} >= ${item.quantity}`
										: sql`true`
								)
							)
							.returning({ id: products.id });

						if (updated.length !== 1) throw new InventoryUpdateError();
					}
				}

				const changedOrder = await tx
					.update(orders)
					.set({ status, updatedAt: new Date() })
					.where(and(eq(orders.id, orderId), eq(orders.status, order.status)))
					.returning({ id: orders.id });

				if (changedOrder.length !== 1) throw new InventoryUpdateError();

				return 'updated' as const;
			});

			if (result === 'missing') return fail(404, { error: 'Narudžba nije pronađena.' });
			if (result === 'terminal') {
				return fail(409, {
					error: 'Završena ili otkazana narudžba ne može se ponovo otvoriti.'
				});
			}
		} catch (error) {
			if (error instanceof InventoryUpdateError) {
				return fail(409, {
					error: 'Zaliha za ovu narudžbu nije usklađena. Status nije promijenjen.'
				});
			}

			throw error;
		}

		return { success: true, message: `Narudžba #${orderId} je ažurirana.` };
	}
};
