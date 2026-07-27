import type { Product } from '$lib/types/product';

export const products: Product[] = [
	{
		id: 'sivi-cement-m-500',
		name: 'Sivi cement M-500',
		description: 'Visokootporni cement za ploče, temelje i zidarske radove.',
		price: 12.9,
		unit: 'vreća 25 kg',
		unitType: 'vreca',
		tag: 'Na stanju',
		stock: '128 vreća',
		stockQuantity: 128,
		category: 'cement',
		availability: 'in-stock',
		art: 'cement'
	},
	{
		id: 'armaturna-mreza-q188',
		name: 'Armaturna mreža Q188',
		description: 'Standardna čelična mreža za ojačanje betonskih površina.',
		price: 34.5,
		unit: 'komad',
		unitType: 'komad',
		tag: 'Najprodavanije',
		stock: '42 kom',
		stockQuantity: 42,
		category: 'armatura',
		availability: 'in-stock',
		art: 'steel'
	},
	{
		id: 'porculanska-plocica-beton',
		name: 'Porculanska pločica beton',
		description: 'Mat završna obrada za poslovne i stambene prostore.',
		price: 28,
		unit: 'm2',
		unitType: 'm2',
		tag: 'Premium',
		stock: '86 m2',
		stockQuantity: 86,
		category: 'plocice',
		availability: 'by-order',
		art: 'tile'
	},
	{
		id: 'fasadna-izolacija-eps-10',
		name: 'Fasadna izolacija EPS 10',
		description: 'Lagana termoizolaciona ploča za energetski efikasne objekte.',
		price: 7.4,
		unit: 'm2',
		unitType: 'm2',
		tag: 'Niska zaliha',
		stock: '19 m2',
		stockQuantity: 19,
		category: 'izolacija',
		availability: 'low-stock',
		art: 'insulation'
	}
];
