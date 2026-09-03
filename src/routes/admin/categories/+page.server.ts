import { fail } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';

import { requireAdminSession } from '$lib/server/adminAuth';
import { db } from '$lib/server/db';
import { categories, products } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

function slugify(value: string) {
	return (
		value
			.toLowerCase()
			.replace(/đ/g, 'dj')
			.replace(/č/g, 'c')
			.replace(/ć/g, 'c')
			.replace(/š/g, 's')
			.replace(/ž/g, 'z')
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 60) || 'kategorija'
	);
}

export const load: PageServerLoad = async ({ cookies }) => {
	requireAdminSession(cookies);

	const allCategories = await db
		.select({
			id: categories.id,
			name: categories.name,
			sortOrder: categories.sortOrder
		})
		.from(categories)
		.orderBy(asc(categories.sortOrder));

	const allProducts = await db
		.select({
			categoryId: products.categoryId
		})
		.from(products);

	const categoriesWithCount = allCategories.map((cat) => ({
		...cat,
		productCount: allProducts.filter((p) => p.categoryId === cat.id).length
	}));

	return { categories: categoriesWithCount };
};

export const actions: Actions = {
	create: async ({ cookies, request }) => {
		requireAdminSession(cookies);

		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const customId = String(formData.get('id') ?? '').trim();
		const sortOrder = Number(formData.get('sortOrder') ?? 10);

		if (!name) {
			return fail(400, { error: 'Naziv kategorije je obavezan.' });
		}

		const categoryId = customId || slugify(name);

		const [existing] = await db
			.select({ id: categories.id })
			.from(categories)
			.where(eq(categories.id, categoryId))
			.limit(1);

		if (existing) {
			return fail(400, { error: `Kategorija sa identifikatorom '${categoryId}' već postoji.` });
		}

		await db.insert(categories).values({
			id: categoryId,
			name,
			sortOrder: Number.isFinite(sortOrder) ? sortOrder : 10
		});

		return { success: true, message: `Kategorija '${name}' je uspješno dodata.` };
	},

	delete: async ({ cookies, request }) => {
		requireAdminSession(cookies);

		const formData = await request.formData();
		const id = String(formData.get('id') ?? '').trim();

		if (!id) {
			return fail(400, { error: 'ID kategorije nedostaje.' });
		}

		const [productInCat] = await db
			.select({ id: products.id })
			.from(products)
			.where(eq(products.categoryId, id))
			.limit(1);

		if (productInCat) {
			return fail(400, {
				error:
					'Nije moguće obrisati kategoriju u kojoj već postoje proizvodi. Prvo premjestite ili obrišite proizvode.'
			});
		}

		await db.delete(categories).where(eq(categories.id, id));

		return { success: true, message: 'Kategorija je uspješno obrisana.' };
	}
};
