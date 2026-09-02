import { redirect } from '@sveltejs/kit';
import { asc } from 'drizzle-orm';

import { requireAdminSession } from '$lib/server/adminAuth';
import { db } from '$lib/server/db';
import { categories, products } from '$lib/server/db/schema';
import { generateProductId, parseProductForm } from '$lib/server/adminProducts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	requireAdminSession(cookies);

	const allCategories = await db
		.select({
			id: categories.id,
			name: categories.name
		})
		.from(categories)
		.orderBy(asc(categories.sortOrder));

	return { categories: allCategories };
};

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		requireAdminSession(cookies);

		const formData = await request.formData();
		const parsedProduct = await parseProductForm(formData);

		if ('status' in parsedProduct) return parsedProduct;

		const productId = await generateProductId(parsedProduct.name);

		await db.insert(products).values({
			id: productId,
			...parsedProduct
		});

		redirect(303, `/admin/products/${productId}`);
	}
};
