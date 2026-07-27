import { fail } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';

import { requireAdminSession } from '$lib/server/adminAuth';
import { db } from '$lib/server/db';
import { orderItems, products } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	requireAdminSession(cookies);

	const productRows = await db.select().from(products).orderBy(asc(products.sortOrder));

	return {
		products: productRows.map((product) => ({
			...product,
			price: product.priceCents / 100
		}))
	};
};

export const actions: Actions = {
	deleteProduct: async ({ cookies, request }) => {
		requireAdminSession(cookies);

		const formData = await request.formData();
		const productId = String(formData.get('productId') ?? '').trim();

		if (!productId) {
			return fail(400, { error: 'Proizvod nije pronadjen.' });
		}

		const referencedItems = await db
			.select({ id: orderItems.id })
			.from(orderItems)
			.where(eq(orderItems.productId, productId))
			.limit(1);

		if (referencedItems.length > 0) {
			return fail(400, {
				error: 'Proizvod je vec u narudzbama i ne moze se obrisati. Postavite ga kao neaktivan.'
			});
		}

		await db.delete(products).where(eq(products.id, productId));

		return { success: true, message: 'Proizvod je trajno obrisan.' };
	}
};
