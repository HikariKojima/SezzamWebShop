export const availabilityOptions = [
	{ value: 'in-stock', label: 'Na stanju' },
	{ value: 'low-stock', label: 'Niska zaliha' },
	{ value: 'by-order', label: 'Po narudzbi' },
	{ value: 'out-of-stock', label: 'Nema na stanju' }
] as const;

export const orderStatusOptions = [
	{ value: 'pending', label: 'Nova' },
	{ value: 'ready', label: 'Spremna' },
	{ value: 'completed', label: 'Završena' },
	{ value: 'cancelled', label: 'Otkazana' }
] as const;

export const productCategoryOptions = [
	{ value: 'cement', label: 'Cement' },
	{ value: 'armatura', label: 'Armatura' },
	{ value: 'plocice', label: 'Plocice' },
	{ value: 'izolacija', label: 'Izolacija' }
] as const;

export const productUnitTypeOptions = [
	{ value: 'm2', label: 'm2' },
	{ value: 'vreca', label: 'Vreca' },
	{ value: 'komad', label: 'Komad' }
] as const;

export const productArtOptions = [
	{ value: 'cement', label: 'Cement' },
	{ value: 'steel', label: 'Armatura' },
	{ value: 'tile', label: 'Plocice' },
	{ value: 'insulation', label: 'Izolacija' }
] as const;

export type ProductAvailabilityValue = (typeof availabilityOptions)[number]['value'];
export type OrderStatusValue = (typeof orderStatusOptions)[number]['value'];
export type ProductCategoryValue = (typeof productCategoryOptions)[number]['value'];
export type ProductUnitTypeValue = (typeof productUnitTypeOptions)[number]['value'];
export type ProductArtValue = (typeof productArtOptions)[number]['value'];

export function getOrderStatusLabel(status: string) {
	return orderStatusOptions.find((option) => option.value === status)?.label ?? status;
}

export function getAvailabilityLabel(availability: string) {
	return availabilityOptions.find((option) => option.value === availability)?.label ?? availability;
}
