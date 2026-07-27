import { fail } from '@sveltejs/kit';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { orderItems, orders, products as productsTable } from '$lib/server/db/schema';
import type { CartItem } from '$lib/types/cart';
import type {
	Product,
	ProductArt,
	ProductAvailability,
	ProductCategory,
	ProductUnitType
} from '$lib/types/product';
import type { Actions } from './$types';

export async function load() {
	const rows = await db
		.select()
		.from(productsTable)
		.where(eq(productsTable.active, true))
		.orderBy(asc(productsTable.sortOrder));

	const products: Product[] = rows.map((product) => ({
		id: product.id,
		name: product.name,
		description: product.description,
		price: product.priceCents / 100,
		unit: product.unit,
		unitType: product.unitType as ProductUnitType,
		tag: product.tag,
		stock: product.stockLabel,
		stockQuantity: product.stockQuantity,
		category: product.categoryId as ProductCategory,
		availability: product.availability as ProductAvailability,
		art: product.art as ProductArt
	}));

	return { products };
}

function parseCartItems(value: FormDataEntryValue | null) {
	if (typeof value !== 'string') return null;

	try {
		const parsed = JSON.parse(value) as unknown;
		if (!Array.isArray(parsed)) return null;

		const quantities = new Map<string, number>();

		for (const item of parsed) {
			if (
				typeof item !== 'object' ||
				item === null ||
				!('productId' in item) ||
				!('quantity' in item)
			) {
				return null;
			}

			const productId = item.productId;
			const quantity = item.quantity;

			if (
				typeof productId !== 'string' ||
				productId.trim().length === 0 ||
				!Number.isInteger(quantity) ||
				quantity <= 0
			) {
				return null;
			}

			quantities.set(productId, (quantities.get(productId) ?? 0) + quantity);
		}

		return Array.from(quantities, ([productId, quantity]): CartItem => ({ productId, quantity }));
	} catch {
		return null;
	}
}

function normalizeBosnianPhone(value: string) {
	const compactPhone = value.replace(/[\s()./-]/g, '');
	const internationalPhone = compactPhone.startsWith('00')
		? `+${compactPhone.slice(2)}`
		: compactPhone;

	if (/^\+387[3-6]\d{7}$/.test(internationalPhone)) {
		return internationalPhone;
	}

	if (/^0[3-6]\d{7}$/.test(internationalPhone)) {
		return `+387${internationalPhone.slice(1)}`;
	}

	return null;
}

export const actions: Actions = {
	submitOrder: async ({ request }) => {
		const formData = await request.formData();
		const customerName = String(formData.get('customerName') ?? '').trim();
		const customerPhoneInput = String(formData.get('customerPhone') ?? '').trim();
		const customerPhone = normalizeBosnianPhone(customerPhoneInput);
		const cartItems = parseCartItems(formData.get('cartItems'));

		if (!customerName || !customerPhoneInput) {
			return fail(400, {
				error: 'Unesite ime i broj telefona.',
				customerName,
				customerPhone: customerPhoneInput
			});
		}

		if (!customerPhone) {
			return fail(400, {
				error: 'Unesite ispravan broj telefona iz BiH, npr. 061 000 000 ili +387 61 000 000.',
				customerName,
				customerPhone: customerPhoneInput
			});
		}

		if (!cartItems || cartItems.length === 0) {
			return fail(400, {
				error: 'Korpa je prazna.',
				customerName,
				customerPhone: customerPhoneInput
			});
		}

		const productIds = cartItems.map((item) => item.productId);
		const activeProducts = await db
			.select()
			.from(productsTable)
			.where(and(eq(productsTable.active, true), inArray(productsTable.id, productIds)));

		if (activeProducts.length !== productIds.length) {
			return fail(400, {
				error: 'Neki proizvodi više nisu dostupni.',
				customerName,
				customerPhone: customerPhoneInput
			});
		}

		const productsById = new Map(activeProducts.map((product) => [product.id, product]));
		const orderLines = cartItems.map((item) => {
			const product = productsById.get(item.productId);

			if (!product) {
				throw new Error(`Missing validated product ${item.productId}`);
			}

			return {
				product,
				quantity: item.quantity,
				lineTotalCents: product.priceCents * item.quantity
			};
		});
		const subtotalCents = orderLines.reduce((total, item) => total + item.lineTotalCents, 0);

		const order = await db.transaction(async (tx) => {
			const [createdOrder] = await tx
				.insert(orders)
				.values({
					customerName,
					customerPhone,
					status: 'pending',
					paymentMethod: 'cash_in_person',
					subtotalCents
				})
				.returning({ id: orders.id });

			await tx.insert(orderItems).values(
				orderLines.map((line) => ({
					orderId: createdOrder.id,
					productId: line.product.id,
					productName: line.product.name,
					productUnit: line.product.unit,
					quantity: line.quantity,
					unitPriceCents: line.product.priceCents,
					lineTotalCents: line.lineTotalCents
				}))
			);

			for (const line of orderLines) {
				await tx
					.update(productsTable)
					.set({
						reservedQuantity: sql`${productsTable.reservedQuantity} + ${line.quantity}`
					})
					.where(eq(productsTable.id, line.product.id));
			}

			return createdOrder;
		});

		return {
			success: true,
			orderId: order.id,
			message: `Narudžba #${order.id} je poslana. Kontaktirat ćemo vas za potvrdu.`
		};
	}
};
