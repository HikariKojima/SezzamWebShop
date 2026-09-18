import { eq } from 'drizzle-orm';
import { put } from '@vercel/blob';
import { db } from '$lib/server/db';
import { siteSettings } from '$lib/server/db/schema';
import { defaultSiteSettings, type SiteSettings } from '$lib/types/settings';

export async function getSiteSettings(): Promise<SiteSettings> {
	try {
		const [row] = await db
			.select()
			.from(siteSettings)
			.where(eq(siteSettings.id, 'homepage'))
			.limit(1);

		if (!row) {
			return { ...defaultSiteSettings };
		}

		return {
			heroTagline: row.heroTagline || defaultSiteSettings.heroTagline,
			heroTitle: row.heroTitle || defaultSiteSettings.heroTitle,
			heroSubtitle: row.heroSubtitle || defaultSiteSettings.heroSubtitle,
			heroImageUrl: row.heroImageUrl || defaultSiteSettings.heroImageUrl,
			spotlightQuote: row.spotlightQuote || defaultSiteSettings.spotlightQuote,
			spotlightImageUrl: row.spotlightImageUrl || defaultSiteSettings.spotlightImageUrl,
			spotlightTitle: row.spotlightTitle || defaultSiteSettings.spotlightTitle,
			spotlightSubtitle: row.spotlightSubtitle || defaultSiteSettings.spotlightSubtitle,
			contactPhone: row.contactPhone || defaultSiteSettings.contactPhone,
			contactEmail: row.contactEmail || defaultSiteSettings.contactEmail
		};
	} catch (error) {
		console.warn('Greška pri dohvatanju postavki, koristim default:', error);
		return { ...defaultSiteSettings };
	}
}

export async function uploadBannerImage(file: File, folder: string): Promise<string | null> {
	if (!file || typeof file !== 'object' || !('size' in file) || file.size === 0) {
		return null;
	}

	const ext = (file.name.split('.').pop() || 'webp').toLowerCase();
	const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(ext) ? ext : 'webp';
	const safeBaseName = file.name
		.replace(/\.[^/.]+$/, '')
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '-')
		.slice(0, 30);

	const fileName = `${safeBaseName || 'banner'}-${Date.now()}.${safeExt}`;

	const blobToken =
		process.env.PublicBlob_READ_WRITE_TOKEN ||
		process.env.PUBLICBLOB_READ_WRITE_TOKEN ||
		process.env.BLOB_READ_WRITE_TOKEN;

	const storeId =
		process.env.PublicBlob_STORE_ID || process.env.PUBLICBLOB_STORE_ID || process.env.BLOB_STORE_ID;

	try {
		const blob = await put(`${folder}/${fileName}`, file, {
			access: 'public',
			...(blobToken ? { token: blobToken } : {}),
			...(storeId ? { storeId } : {})
		});
		if (blob && blob.url) {
			return blob.url;
		}
	} catch (blobError) {
		console.warn('Vercel Blob upload nije uspio, koristim Base64 fallback:', blobError);
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
