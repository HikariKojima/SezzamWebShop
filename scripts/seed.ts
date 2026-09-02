import 'dotenv/config';

import { createDatabaseClient } from '../src/lib/server/db/client';
import { categories, products, orderItems } from '../src/lib/server/db/schema';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL is required');
}

const { client, db } = createDatabaseClient(databaseUrl);

const categorySeed = [
	{ id: 'wpc', name: 'WPC Decking', sortOrder: 10 },
	{ id: 'spc', name: 'SPC Podovi', sortOrder: 20 },
	{ id: 'lvt', name: 'LVT Podovi', sortOrder: 30 },
	{ id: 'tekstilne-ploce', name: 'Tekstilne ploče', sortOrder: 40 }
];

const productSeed = [
	{
		id: 'wpc-decking-premium-antracit',
		categoryId: 'wpc',
		name: 'WPC Decking Premium Antracit 4m',
		description: 'Visokokvalitetne kompozitne daske za terase i bazene sa protukliznom strukturom i UV zaštitom.',
		priceCents: 4800,
		unit: 'm2',
		unitType: 'm2',
		tag: 'Novo',
		stockLabel: '150 m2',
		stockQuantity: 150,
		availability: 'in-stock',
		art: 'insulation',
		active: true,
		sortOrder: 10
	},
	{
		id: 'wpc-decking-natur-teak',
		categoryId: 'wpc',
		name: 'WPC Decking Natur Teak 4m',
		description: 'Topla nijansa tikovine, otporna na vremenske uticaje, vlagu i habanje bez potrebe za lakiranjem.',
		priceCents: 4800,
		unit: 'm2',
		unitType: 'm2',
		tag: 'Preporučeno',
		stockLabel: '120 m2',
		stockQuantity: 120,
		availability: 'in-stock',
		art: 'insulation',
		active: true,
		sortOrder: 20
	},
	{
		id: 'lvt-akusticni-vinil-klik-hrast',
		categoryId: 'lvt',
		name: 'LVT Akustični Vinil Klik Hrast 5mm',
		description: 'Akustični LVT vinil sa integrisanom zvučnom podlogom i patentiranim klik sistemom za brzu ugradnju.',
		priceCents: 4500,
		unit: 'm2',
		unitType: 'm2',
		tag: 'Najprodavanije',
		stockLabel: '320 m2',
		stockQuantity: 320,
		availability: 'in-stock',
		art: 'tile',
		active: true,
		sortOrder: 30
	},
	{
		id: 'spc-vinil-klik-kamen-sivi',
		categoryId: 'spc',
		name: 'SPC Vinil Klik Kamen Sivi 5mm',
		description: '100% vodootporan SPC pod sa kamenim dekorom i visokom klasom otpornosti za stambene i poslovne prostore.',
		priceCents: 4500,
		unit: 'm2',
		unitType: 'm2',
		tag: 'Dostupno odmah',
		stockLabel: '200 m2',
		stockQuantity: 200,
		availability: 'in-stock',
		art: 'tile',
		active: true,
		sortOrder: 40
	},
	{
		id: 'tekstilne-modularne-ploce-antracit',
		categoryId: 'tekstilne-ploce',
		name: 'Tekstilne modularne ploče 50x50 cm',
		description: 'Izdržljive tepih kocke za kancelarije i poslovne prostore sa jednostavnom zamjenom oštećenih dijelova.',
		priceCents: 3200,
		unit: 'm2',
		unitType: 'm2',
		tag: 'Premium',
		stockLabel: '180 m2',
		stockQuantity: 180,
		availability: 'in-stock',
		art: 'tile',
		active: true,
		sortOrder: 50
	}
];

// Clean old products
await db.delete(orderItems);
await db.delete(products);
await db.delete(categories);

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

console.log(`Seeded ${categorySeed.length} new categories and ${productSeed.length} new products.`);
