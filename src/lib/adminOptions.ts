export const availabilityOptions = [
	{ value: 'in-stock', label: 'Na stanju' },
	{ value: 'low-stock', label: 'Niska zaliha' },
	{ value: 'by-order', label: 'Po narudžbi' },
	{ value: 'out-of-stock', label: 'Nema na stanju' }
] as const;

export const orderStatusOptions = [
	{ value: 'pending', label: 'Nova' },
	{ value: 'ready', label: 'Spremna' },
	{ value: 'completed', label: 'Završena' },
	{ value: 'cancelled', label: 'Otkazana' }
] as const;

export const defaultCategoryOptions = [
	{ value: 'wpc', label: 'WPC Decking' },
	{ value: 'spc', label: 'SPC Podovi' },
	{ value: 'lvt', label: 'LVT Podovi' },
	{ value: 'tekstilne-ploce', label: 'Tekstilne ploče' }
] as const;

export const productCategoryOptions = defaultCategoryOptions;

export const productUnitTypeOptions = [
	{ value: 'm2', label: 'm2' },
	{ value: 'komad', label: 'Komad' },
	{ value: 'vreca', label: 'Vreća' }
] as const;

export const productArtOptions = [
	{ value: 'tile', label: 'Podna obloga / Ploča' },
	{ value: 'insulation', label: 'Decking / Daska' },
	{ value: 'cement', label: 'Vreća / Materijal' },
	{ value: 'steel', label: 'Metal / Konstrukcija' }
] as const;

export type ProductAvailabilityValue = (typeof availabilityOptions)[number]['value'];
export type OrderStatusValue = (typeof orderStatusOptions)[number]['value'];
export type ProductCategoryValue = string;
export type ProductUnitTypeValue = (typeof productUnitTypeOptions)[number]['value'];
export type ProductArtValue = (typeof productArtOptions)[number]['value'];

export function getOrderStatusLabel(status: string) {
	return orderStatusOptions.find((option) => option.value === status)?.label ?? status;
}

export function getAvailabilityLabel(availability: string) {
	return availabilityOptions.find((option) => option.value === availability)?.label ?? availability;
}
