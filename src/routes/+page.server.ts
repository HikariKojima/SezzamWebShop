import { fail } from '@sveltejs/kit';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import {
	orderItems,
	orders,
	products as productsTable,
	categories as categoriesTable
} from '$lib/server/db/schema';
import type { CartItem } from '$lib/types/cart';
import type {
	Product,
	ProductArt,
	ProductAvailability,
	ProductCategory,
	ProductUnitType
} from '$lib/types/product';
import type { Actions } from './$types';

const MAX_ITEM_QUANTITY = 10_000;

import { products as fallbackProducts } from '$lib/data/products';

export async function load() {
	try {
		const rows = await db
			.select()
			.from(productsTable)
			.where(eq(productsTable.active, true))
			.orderBy(asc(productsTable.sortOrder));

		const catRows = await db.select().from(categoriesTable).orderBy(asc(categoriesTable.sortOrder));

		const products: Product[] = rows.map((product) => ({
			id: product.id,
			name: product.name,
			description: product.description,
			price: product.priceCents / 100,
			unit: product.unit,
			unitType: product.unitType as ProductUnitType,
			tag: product.tag,
			stock: product.stockLabel,
			stockQuantity: Math.max(product.stockQuantity - product.reservedQuantity, 0),
			category: product.categoryId as ProductCategory,
			availability: product.availability as ProductAvailability,
			art: product.art as ProductArt,
			imageUrl: product.imageUrl
		}));

		const categories = catRows.map((cat) => ({
			id: cat.id,
			name: cat.name
		}));

		return { products, categories };
	} catch (error) {
		console.error('Baza podataka nedostupna tokom pokretanja, prikazujem fallback:', error);
		return {
			products: fallbackProducts,
			categories: [
				{ id: 'wpc', name: 'WPC Decking' },
				{ id: 'spc', name: 'SPC Podovi' },
				{ id: 'lvt', name: 'LVT Podovi' },
				{ id: 'tekstilne-ploce', name: 'Tekstilne ploče' }
			]
		};
	}
}

class InsufficientStockError extends Error {
	constructor(public productName: string) {
		super(`Insufficient stock for ${productName}`);
	}
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
				quantity <= 0 ||
				quantity > MAX_ITEM_QUANTITY
			) {
				return null;
			}

			const totalQuantity = (quantities.get(productId) ?? 0) + quantity;
			if (totalQuantity > MAX_ITEM_QUANTITY) return null;
			quantities.set(productId, totalQuantity);
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
		const paymentMethodInput = String(formData.get('paymentMethod') ?? 'cash_in_person').trim();
		const paymentMethod =
			paymentMethodInput === 'bank_transfer'
				? ('bank_transfer' as const)
				: ('cash_in_person' as const);
		const companyName = String(formData.get('companyName') ?? '').trim();
		const companyId = String(formData.get('companyId') ?? '').trim();
		const companyAddress = String(formData.get('companyAddress') ?? '').trim();
		const customerEmail = String(formData.get('customerEmail') ?? '').trim();
		const orderNote = String(formData.get('orderNote') ?? '').trim();
		const cartItems = parseCartItems(formData.get('cartItems'));

		if (!customerName || !customerPhoneInput) {
			return fail(400, {
				error: 'Unesite ime i broj telefona.',
				customerName,
				customerPhone: customerPhoneInput,
				paymentMethod,
				companyName,
				companyId,
				companyAddress,
				customerEmail
			});
		}

		if (!customerPhone) {
			return fail(400, {
				error: 'Unesite ispravan broj telefona iz BiH, npr. 061 000 000 ili +387 61 000 000.',
				customerName,
				customerPhone: customerPhoneInput,
				paymentMethod,
				companyName,
				companyId,
				companyAddress,
				customerEmail
			});
		}

		if (paymentMethod === 'bank_transfer') {
			if (!companyName || !companyId || !companyAddress || !customerEmail) {
				return fail(400, {
					error:
						'Za virmansko plaćanje (žiro račun) unesite naziv firme, ID broj, adresu i email za predračun.',
					customerName,
					customerPhone: customerPhoneInput,
					paymentMethod,
					companyName,
					companyId,
					companyAddress,
					customerEmail
				});
			}
		}

		if (!cartItems || cartItems.length === 0) {
			return fail(400, {
				error: 'Korpa je prazna.',
				customerName,
				customerPhone: customerPhoneInput,
				paymentMethod
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
				customerPhone: customerPhoneInput,
				paymentMethod
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

		let order: { id: number };

		try {
			order = await db.transaction(async (tx) => {
				for (const line of orderLines) {
					const stockCondition =
						line.product.availability === 'by-order'
							? sql`true`
							: sql`${productsTable.stockQuantity} - ${productsTable.reservedQuantity} >= ${line.quantity}`;
					const reserved = await tx
						.update(productsTable)
						.set({
							reservedQuantity: sql`${productsTable.reservedQuantity} + ${line.quantity}`
						})
						.where(
							and(
								eq(productsTable.id, line.product.id),
								eq(productsTable.active, true),
								stockCondition
							)
						)
						.returning({ id: productsTable.id });

					if (reserved.length !== 1) {
						throw new InsufficientStockError(line.product.name);
					}
				}

				const [createdOrder] = await tx
					.insert(orders)
					.values({
						customerName,
						customerPhone,
						customerEmail: customerEmail || null,
						companyName: companyName || null,
						companyId: companyId || null,
						companyAddress: companyAddress || null,
						orderNote: orderNote || null,
						status: 'pending',
						paymentMethod,
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

				return createdOrder;
			});
		} catch (error) {
			if (error instanceof InsufficientStockError) {
				return fail(409, {
					error: `Proizvod „${error.productName}“ više nema traženu količinu na stanju. Osvježite korpu i pokušajte ponovo.`,
					customerName,
					customerPhone: customerPhoneInput,
					paymentMethod
				});
			}

			throw error;
		}

		return {
			success: true,
			orderId: order.id,
			paymentMethod,
			message:
				paymentMethod === 'bank_transfer'
					? `Narudžba #${order.id} je zaprimljena. Predračun sa instrukcijama za plaćanje stići će na vaš email.`
					: `Narudžba #${order.id} je poslana. Kontaktirat ćemo vas za preuzimanje i potvrdu.`
		};
	}
};
