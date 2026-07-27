import 'dotenv/config';

import { createDatabaseClient } from '../src/lib/server/db/client';
import { categories, products } from '../src/lib/server/db/schema';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL is required');
}

const { client, db } = createDatabaseClient(databaseUrl);

const categorySeed = [
	{ id: 'cement', name: 'Cement', sortOrder: 10 },
	{ id: 'armatura', name: 'Armatura', sortOrder: 20 },
	{ id: 'plocice', name: 'Pločice', sortOrder: 30 },
	{ id: 'izolacija', name: 'Izolacija', sortOrder: 40 }
];

const productSeed = [
	{
		id: 'sivi-cement-m-500',
		categoryId: 'cement',
		name: 'Sivi cement M-500',
		description: 'Visokootporni cement za ploče, temelje i zidarske radove.',
		priceCents: 1290,
		unit: 'vreća 25 kg',
		unitType: 'vreca',
		tag: 'Na stanju',
		stockLabel: '128 vreća',
		stockQuantity: 128,
		availability: 'in-stock',
		art: 'cement',
		active: true,
		sortOrder: 10
	},
	{
		id: 'armaturna-mreza-q188',
		categoryId: 'armatura',
		name: 'Armaturna mreža Q188',
		description: 'Standardna čelična mreža za ojačanje betonskih površina.',
		priceCents: 3450,
		unit: 'komad',
		unitType: 'komad',
		tag: 'Najprodavanije',
		stockLabel: '42 kom',
		stockQuantity: 42,
		availability: 'in-stock',
		art: 'steel',
		active: true,
		sortOrder: 20
	},
	{
		id: 'porculanska-plocica-beton',
		categoryId: 'plocice',
		name: 'Porculanska pločica beton',
		description: 'Mat završna obrada za poslovne i stambene prostore.',
		priceCents: 2800,
		unit: 'm2',
		unitType: 'm2',
		tag: 'Premium',
		stockLabel: '86 m2',
		stockQuantity: 86,
		availability: 'by-order',
		art: 'tile',
		active: true,
		sortOrder: 30
	},
	{
		id: 'fasadna-izolacija-eps-10',
		categoryId: 'izolacija',
		name: 'Fasadna izolacija EPS 10',
		description: 'Lagana termoizolaciona ploča za energetski efikasne objekte.',
		priceCents: 740,
		unit: 'm2',
		unitType: 'm2',
		tag: 'Niska zaliha',
		stockLabel: '19 m2',
		stockQuantity: 19,
		availability: 'low-stock',
		art: 'insulation',
		active: true,
		sortOrder: 40
	}
];

for (const category of categorySeed) {
	await db.insert(categories).values(category).onConflictDoUpdate({
		target: categories.id,
		set: category
	});
}

for (const product of productSeed) {
	await db.insert(products).values(product).onConflictDoUpdate({
		target: products.id,
		set: product
	});
}

await client.end();

console.log(`Seeded ${categorySeed.length} categories and ${productSeed.length} products.`);
