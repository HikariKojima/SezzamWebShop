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
	originalPriceCents: number | null;
	unit: string;
	unitType: ProductUnitTypeValue;
	categoryId: ProductCategoryValue;
	tag: string;
	stockLabel: string;
	stockQuantity: number;
	availability: ProductAvailabilityValue;
	art: ProductArtValue;
	imageUrl: string | null;
	images: string | null;
	hasDualSide: boolean;
	active: boolean;
	sortOrder: number;
};

async function uploadSingleFile(file: File): Promise<string | null> {
	if (!file || typeof file !== 'object' || !('size' in file) || file.size === 0) {
		return null;
	}

	const ext = (file.name.split('.').pop() || 'webp').toLowerCase();
	const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(ext) ? ext : 'webp';
	const safeBaseName = file.name
		.replace(/\.[^/.]+$/, '')
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '-')
		.replace(/-+/g, '-')
		.slice(0, 40);

	const fileName = `${safeBaseName || 'proizvod'}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${safeExt}`;

	const blobToken =
		process.env.PublicBlob_READ_WRITE_TOKEN ||
		process.env.PUBLICBLOB_READ_WRITE_TOKEN ||
		process.env.BLOB_READ_WRITE_TOKEN;

	const storeId =
		process.env.PublicBlob_STORE_ID || process.env.PUBLICBLOB_STORE_ID || process.env.BLOB_STORE_ID;

	try {
		const blob = await put(`products/${fileName}`, file, {
			access: 'public',
			...(blobToken ? { token: blobToken } : {}),
			...(storeId ? { storeId } : {})
		});
		if (blob && blob.url) {
			return blob.url;
		}
	} catch (blobError) {
		console.warn(
			'Vercel Blob upload nije uspio (vjerovatno fali BLOB_READ_WRITE_TOKEN na Vercelu). Koristim Base64 fallback:',
			blobError
		);
		try {
			const buffer = Buffer.from(await file.arrayBuffer());
			const mimeType = file.type || 'image/webp';
			return `data:${mimeType};base64,${buffer.toString('base64')}`;
		} catch (fallbackError) {
			console.error('Greška pri kreiranju fallback slike:', fallbackError);
		}
	}
	return null;
}

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
	const rawOriginalPrice = parsePriceCents(formData.get('originalPrice'));
	const originalPriceCents = rawOriginalPrice && rawOriginalPrice > 0 ? rawOriginalPrice : null;
	const unit = parseRequiredText(formData, 'unit', 80);
	const unitType = parseOption(formData.get('unitType'), unitTypeValues);
	const categoryId = parseOption(formData.get('categoryId'), categoryValues);
	const tag = parseRequiredText(formData, 'tag', 80);
	const stockLabel = parseRequiredText(formData, 'stockLabel', 80);
	const stockQuantity = parseNonNegativeInteger(formData.get('stockQuantity'));
	const availability = parseOption(formData.get('availability'), availabilityValues);
	const art = parseOption(formData.get('art'), artValues);
	const sortOrder = parseNonNegativeInteger(formData.get('sortOrder'));
	const hasDualSide =
		formData.get('hasDualSide') === 'true' || formData.get('hasDualSide') === 'on';

	// Collect existing images preserved by user in the admin UI
	let existingImages: string[] = [];
	const rawExistingImages = formData.get('existingImages');
	if (typeof rawExistingImages === 'string' && rawExistingImages.trim()) {
		try {
			const parsed = JSON.parse(rawExistingImages);
			if (Array.isArray(parsed)) {
				existingImages = parsed.filter(
					(item): item is string => typeof item === 'string' && item.trim().length > 0
				);
			}
		} catch {
			existingImages = [];
		}
	}

	// Legacy or direct manual URL
	const directImageUrl = String(formData.get('imageUrl') ?? '').trim();
	if (directImageUrl && !existingImages.includes(directImageUrl)) {
		existingImages.push(directImageUrl);
	}

	// Process newly uploaded files (can be multiple files under imageFiles or imageFile)
	const rawFiles = [...formData.getAll('imageFiles'), ...formData.getAll('imageFile')];
	const uploadedUrls: string[] = [];

	for (const fileCandidate of rawFiles) {
		if (
			fileCandidate &&
			typeof fileCandidate === 'object' &&
			'size' in fileCandidate &&
			(fileCandidate as File).size > 0
		) {
			const uploadedUrl = await uploadSingleFile(fileCandidate as File);
			if (uploadedUrl) {
				uploadedUrls.push(uploadedUrl);
			}
		}
	}

	const allImages = [...existingImages, ...uploadedUrls];
	const primaryImageUrl = allImages.length > 0 ? allImages[0] : null;
	const serializedImages = allImages.length > 0 ? JSON.stringify(allImages) : null;

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
		originalPriceCents,
		unit,
		unitType,
		categoryId,
		tag,
		stockLabel,
		stockQuantity,
		availability,
		art,
		imageUrl: primaryImageUrl,
		images: serializedImages,
		hasDualSide,
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
