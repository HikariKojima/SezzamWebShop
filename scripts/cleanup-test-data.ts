import 'dotenv/config';
import { eq, inArray, isNull, or } from 'drizzle-orm';
import { createDatabaseClient } from '../src/lib/server/db/client';
import { products, orders, orderItems } from '../src/lib/server/db/schema';

async function cleanup() {
	const url = process.env.DATABASE_URL;
	if (!url) {
		console.error('DATABASE_URL is not set.');
		process.exit(1);
	}

	const { client, db } = createDatabaseClient(url);

	console.log('Starting cleanup...');

	// 1. Delete all test orders and their order items
	await db.delete(orderItems);
	console.log('Deleted all test order items.');

	await db.delete(orders);
	console.log('Deleted all test orders.');

	// 2. Identify products without images
	const prodsToDelete = await db
		.select({ id: products.id, name: products.name })
		.from(products)
		.where(
			or(
				isNull(products.imageUrl),
				eq(products.imageUrl, ''),
				eq(products.imageUrl, 'null')
			)
		);

	console.log(`Found ${prodsToDelete.length} products without images to delete:`, prodsToDelete.map((p) => p.name));

	if (prodsToDelete.length > 0) {
		const ids = prodsToDelete.map((p) => p.id);
		await db.delete(products).where(inArray(products.id, ids));
		console.log(`Deleted ${ids.length} products:`, ids);
	}

	// 3. Confirm remaining products
	const remainingProducts = await db
		.select({ id: products.id, name: products.name, imageUrl: products.imageUrl })
		.from(products);

	console.log('\n--- CLEANUP COMPLETE ---');
	console.log(`Remaining active products in database (${remainingProducts.length}):`);
	for (const p of remainingProducts) {
		console.log(`- [${p.id}] "${p.name}" (Image: ${p.imageUrl ? 'YES' : 'NO'})`);
	}

	const remainingOrders = await db.select().from(orders);
	console.log(`Remaining orders in database: ${remainingOrders.length}`);

	await client.end();
}

cleanup().catch((err) => {
	console.error('Cleanup failed:', err);
	process.exit(1);
});
