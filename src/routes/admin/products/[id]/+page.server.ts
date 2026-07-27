import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { requireAdminSession } from '$lib/server/adminAuth';
import { parseProductForm } from '$lib/server/adminProducts';
import { db } from '$lib/server/db';
import { products } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, params }) => {
	requireAdminSession(cookies);

	const [product] = await db.select().from(products).where(eq(products.id, params.id)).limit(1);

	if (!product) {
		error(404, 'Proizvod nije pronadjen.');
	}

	return {
		product: {
			...product,
			price: product.priceCents / 100
		}
	};
};

export const actions: Actions = {
	default: async ({ cookies, params, request }) => {
		requireAdminSession(cookies);

		const formData = await request.formData();
		const parsedProduct = parseProductForm(formData);

		if ('status' in parsedProduct) return parsedProduct;

		await db
			.update(products)
			.set({
				...parsedProduct,
				updatedAt: new Date()
			})
			.where(eq(products.id, params.id));

		return { success: true, message: 'Proizvod je sacuvan.' };
	}
};
