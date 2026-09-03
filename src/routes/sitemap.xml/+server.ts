import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { products as productsTable, categories as categoriesTable } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import { products as fallbackProducts } from '$lib/data/products';
import { env } from '$env/dynamic/public';

export const GET: RequestHandler = async () => {
	const siteUrl = (env.PUBLIC_SITE_URL || 'https://sezzam.ba').replace(/\/$/, '');
	const currentDate = new Date().toISOString().split('T')[0];

	let productList: { id: string; updatedAt?: Date | null }[];
	let categoryList: { id: string }[];

	try {
		const dbProducts = await db
			.select({ id: productsTable.id, updatedAt: productsTable.updatedAt })
			.from(productsTable)
			.where(eq(productsTable.active, true))
			.orderBy(asc(productsTable.sortOrder));

		const dbCategories = await db
			.select({ id: categoriesTable.id })
			.from(categoriesTable)
			.orderBy(asc(categoriesTable.sortOrder));

		productList = dbProducts;
		categoryList = dbCategories;
	} catch (err) {
		console.warn('sitemap.xml: Database unavailable, using fallback products:', err);
		productList = fallbackProducts.map((p) => ({ id: p.id }));
		categoryList = [
			{ id: 'wpc' },
			{ id: 'spc' },
			{ id: 'lvt' },
			{ id: 'fasade' },
			{ id: 'izolacija' },
			{ id: 'ljepila' }
		];
	}

	const urls = [
		// Glavna stranica
		`  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`
	];

	// Kategorije
	for (const cat of categoryList) {
		urls.push(`  <url>
    <loc>${siteUrl}/?category=${encodeURIComponent(cat.id)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
	}

	// Proizvodi
	for (const prod of productList) {
		const modDate = prod.updatedAt
			? new Date(prod.updatedAt).toISOString().split('T')[0]
			: currentDate;
		urls.push(`  <url>
    <loc>${siteUrl}/#product-${encodeURIComponent(prod.id)}</loc>
    <lastmod>${modDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
	}

	const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`.trim();

	return new Response(sitemapXml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=3600'
		}
	});
};
