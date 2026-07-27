import { redirect } from '@sveltejs/kit';

import { requireAdminSession } from '$lib/server/adminAuth';
import { db } from '$lib/server/db';
import { products } from '$lib/server/db/schema';
import { generateProductId, parseProductForm } from '$lib/server/adminProducts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	requireAdminSession(cookies);
};

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		requireAdminSession(cookies);

		const formData = await request.formData();
		const parsedProduct = parseProductForm(formData);

		if ('status' in parsedProduct) return parsedProduct;

		const productId = await generateProductId(parsedProduct.name);

		await db.insert(products).values({
			id: productId,
			...parsedProduct
		});

		redirect(303, `/admin/products/${productId}`);
	}
};
