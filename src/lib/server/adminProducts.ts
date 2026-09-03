import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { put } from '@vercel/blob';

import {
	availabilityOptions,
	productArtOptions,
	productCategoryOptions,
	productUnitTypeOptions,
	type ProductArtValue,
	type ProductAvailabilityValue,
	type ProductCategoryValue,
	type ProductUnitTypeValue
} from '$lib/adminOptions';
import { db } from '$lib/server/db';
import { products } from '$lib/server/db/schema';

type ProductFormValues = {
	name: string;
	description: string;
	priceCents: number;
	unit: string;
	unitType: ProductUnitTypeValue;
	categoryId: ProductCategoryValue;
	tag: string;
	stockLabel: string;
	stockQuantity: number;
	availability: ProductAvailabilityValue;
	art: ProductArtValue;
	imageUrl: string | null;
	active: boolean;
	sortOrder: number;
};

const availabilityValues = availabilityOptions.map((option) => option.value);
const categoryValues = productCategoryOptions.map((option) => option.value);
const unitTypeValues = productUnitTypeOptions.map((option) => option.value);
const artValues = productArtOptions.map((option) => option.value);

function parseRequiredText(formData: FormData, key: string, maxLength: number) {
	const value = String(formData.get(key) ?? '').trim();
	if (!value || value.length > maxLength) return null;
	return value;
}

function parsePriceCents(value: FormDataEntryValue | null) {
	if (typeof value !== 'string') return null;

	const normalized = value.trim().replace(',', '.');
	if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;

	const amount = Number(normalized);
	if (!Number.isFinite(amount) || amount < 0) return null;

	return Math.round(amount * 100);
}

function parseNonNegativeInteger(value: FormDataEntryValue | null) {
	if (typeof value !== 'string' || !/^\d+$/.test(value.trim())) return null;
	return Number(value);
}

function parseOption<T extends string>(
	value: FormDataEntryValue | null,
	allowedValues: readonly T[]
) {
	if (typeof value !== 'string') return null;
	return allowedValues.includes(value as T) ? (value as T) : null;
}

export async function parseProductForm(formData: FormData) {
	const name = parseRequiredText(formData, 'name', 180);
	const description = parseRequiredText(formData, 'description', 2000);
	const priceCents = parsePriceCents(formData.get('price'));
	const unit = parseRequiredText(formData, 'unit', 80);
	const unitType = parseOption(formData.get('unitType'), unitTypeValues);
	const categoryId = parseOption(formData.get('categoryId'), categoryValues);
	const tag = parseRequiredText(formData, 'tag', 80);
	const stockLabel = parseRequiredText(formData, 'stockLabel', 80);
	const stockQuantity = parseNonNegativeInteger(formData.get('stockQuantity'));
	const availability = parseOption(formData.get('availability'), availabilityValues);
	const art = parseOption(formData.get('art'), artValues);
	const sortOrder = parseNonNegativeInteger(formData.get('sortOrder'));

	let imageUrl = String(formData.get('imageUrl') ?? '').trim() || null;

	const imageFile = formData.get('imageFile');
	if (
		imageFile &&
		typeof imageFile === 'object' &&
		'size' in imageFile &&
		(imageFile as File).size > 0
	) {
		try {
			const file = imageFile as File;

			const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
			const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(ext) ? ext : 'jpg';
			const safeBaseName = file.name
				.replace(/\.[^/.]+$/, '')
				.toLowerCase()
				.replace(/[^a-z0-9]/g, '-')
				.replace(/-+/g, '-')
				.slice(0, 40);

			const fileName = `${safeBaseName || 'proizvod'}-${Date.now()}.${safeExt}`;

			// Upload na Vercel Blob
			const blob = await put(`products/${fileName}`, file, { access: 'public' });
			imageUrl = blob.url; // Vraća nam trajni public URL
		} catch (uploadError) {
			console.error('Greška pri uploadu slike na Vercel Blob:', uploadError);
		}
	}

	if (
		!name ||
		!description ||
		priceCents === null ||
		!unit ||
		!unitType ||
		!categoryId ||
		!tag ||
		!stockLabel ||
		stockQuantity === null ||
		!availability ||
		!art ||
		sortOrder === null
	) {
		return fail(400, { error: 'Provjerite podatke proizvoda.' });
	}

	const values: ProductFormValues = {
		name,
		description,
		priceCents,
		unit,
		unitType,
		categoryId,
		tag,
		stockLabel,
		stockQuantity,
		availability,
		art,
		imageUrl,
		sortOrder,
		active: formData.has('active')
	};

	return values;
}

function slugify(value: string) {
	const slug = value
		.toLowerCase()
		.replace(/đ/g, 'dj')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 90);

	return slug || 'proizvod';
}

export async function generateProductId(name: string) {
	const baseSlug = slugify(name);
	let candidate = baseSlug;
	let suffix = 2;

	while (true) {
		const existingProduct = await db
			.select({ id: products.id })
			.from(products)
			.where(eq(products.id, candidate))
			.limit(1);

		if (existingProduct.length === 0) return candidate;

		candidate = `${baseSlug}-${suffix}`;
		suffix += 1;
	}
}
