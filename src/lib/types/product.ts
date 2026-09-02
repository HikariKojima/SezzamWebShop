export type ProductArt = 'cement' | 'steel' | 'tile' | 'insulation';
export type ProductCategory = string;
export type ProductUnitType = 'm2' | 'vreca' | 'komad';
export type ProductAvailability = 'in-stock' | 'low-stock' | 'by-order' | 'out-of-stock';
export type ProductSort = 'recommended' | 'price-asc' | 'price-desc' | 'name-asc';

export type CategoryItem = {
	id: string;
	name: string;
	sortOrder?: number;
};

export type ProductPriceFilter = {
	min: number;
	max: number;
};

export type ProductFilters = {
	category: ProductCategory | null;
	price: ProductPriceFilter | null;
	availability: ProductAvailability | null;
};

export type Product = {
	id: string;
	name: string;
	description: string;
	price: number;
	unit: string;
	unitType: ProductUnitType;
	tag: string;
	stock: string;
	stockQuantity: number;
	category: ProductCategory;
	availability: ProductAvailability;
	art: ProductArt;
	imageUrl?: string | null;
};
