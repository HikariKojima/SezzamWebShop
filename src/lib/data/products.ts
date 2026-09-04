import type { Product } from '$lib/types/product';

export const products: Product[] = [
	{
		id: 'wpc-decking-premium-antracit',
		name: 'WPC Decking Premium Antracit 4m',
		description:
			'Visokokvalitetne kompozitne daske za terase i bazene sa protukliznom strukturom i UV zaštitom.',
		price: 48.0,
		originalPrice: 56.0,
		unit: 'm2',
		unitType: 'm2',
		tag: 'Novo',
		stock: '150 m2',
		stockQuantity: 150,
		category: 'wpc',
		availability: 'in-stock',
		art: 'insulation'
	},
	{
		id: 'wpc-decking-natur-teak',
		name: 'WPC Decking Natur Teak 4m',
		description:
			'Topla nijansa tikovine, otporna na vremenske uticaje, vlagu i habanje bez potrebe za lakiranjem.',
		price: 48.0,
		unit: 'm2',
		unitType: 'm2',
		tag: 'Preporučeno',
		stock: '120 m2',
		stockQuantity: 120,
		category: 'wpc',
		availability: 'in-stock',
		art: 'insulation'
	},
	{
		id: 'lvt-akusticni-vinil-klik-hrast',
		name: 'LVT Akustični Vinil Klik Hrast 5mm',
		description:
			'Akustični LVT vinil sa integrisanom zvučnom podlogom i patentiranim klik sistemom za brzu ugradnju.',
		price: 45.0,
		originalPrice: 52.0,
		unit: 'm2',
		unitType: 'm2',
		tag: 'Najprodavanije',
		stock: '320 m2',
		stockQuantity: 320,
		category: 'lvt',
		availability: 'in-stock',
		art: 'tile'
	},
	{
		id: 'spc-vinil-klik-kamen-sivi',
		name: 'SPC Vinil Klik Kamen Sivi 5mm',
		description:
			'100% vodootporan SPC pod sa kamenim dekorom i visokom klasom otpornosti za stambene i poslovne prostore.',
		price: 45.0,
		unit: 'm2',
		unitType: 'm2',
		tag: 'Dostupno odmah',
		stock: '200 m2',
		stockQuantity: 200,
		category: 'spc',
		availability: 'in-stock',
		art: 'tile'
	},
	{
		id: 'tekstilne-modularne-ploce-antracit',
		name: 'Tekstilne modularne ploče 50x50 cm',
		description:
			'Izdržljive tepih kocke za kancelarije i poslovne prostore sa jednostavnom zamjenom oštećenih dijelova.',
		price: 32.0,
		unit: 'm2',
		unitType: 'm2',
		tag: 'Premium',
		stock: '180 m2',
		stockQuantity: 180,
		category: 'tekstilne-ploce',
		availability: 'in-stock',
		art: 'tile'
	}
];
