<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import type {
		ProductAvailability,
		ProductCategory,
		ProductFilters,
		ProductPriceFilter,
		ProductSort
	} from '$lib/types/product';

	type FilterKey = keyof ProductFilters;
	type OptionFilterKey = Exclude<FilterKey, 'price'>;
	type FilterOption<T extends string> = {
		value: T;
		label: string;
	};

	let {
		selectedFilters,
		sort,
		resultCount,
		priceBounds,
		onFilterChange,
		onSortChange,
		onReset
	}: {
		selectedFilters: ProductFilters;
		sort: ProductSort;
		resultCount: number;
		priceBounds: ProductPriceFilter;
		onFilterChange: <T extends FilterKey>(key: T, value: ProductFilters[T]) => void;
		onSortChange: (sort: ProductSort) => void;
		onReset: () => void;
	} = $props();

	const categoryOptions: FilterOption<ProductCategory>[] = [
		{ value: 'cement', label: 'Cement' },
		{ value: 'armatura', label: 'Armatura' },
		{ value: 'plocice', label: 'Pločice' },
		{ value: 'izolacija', label: 'Izolacija' }
	];

	const availabilityOptions: FilterOption<ProductAvailability>[] = [
		{ value: 'in-stock', label: 'Na stanju' },
		{ value: 'low-stock', label: 'Niska zaliha' },
		{ value: 'by-order', label: 'Po narudžbi' },
		{ value: 'out-of-stock', label: 'Nema na stanju' }
	];

	const sortOptions: FilterOption<ProductSort>[] = [
		{ value: 'recommended', label: 'Preporučeno' },
		{ value: 'price-asc', label: 'Cijena rastuće' },
		{ value: 'stock-desc', label: 'Najveće zalihe' }
	];

	const filterGroups = [
		{
			key: 'category',
			label: 'Vrsta materijala',
			options: categoryOptions
		},
		{
			key: 'availability',
			label: 'Dostupnost',
			options: availabilityOptions
		}
	] satisfies {
		key: OptionFilterKey;
		label: string;
		options: FilterOption<string>[];
	}[];

	let draftPriceMin = $state(0);
	let draftPriceMax = $state(0);
	let hasActiveFilters = $derived(Object.values(selectedFilters).some(Boolean));
	let priceLabel = $derived(
		selectedFilters.price
			? `${formatPrice(selectedFilters.price.min)} - ${formatPrice(selectedFilters.price.max)} KM`
			: 'Cijena'
	);

	$effect(() => {
		draftPriceMin = selectedFilters.price?.min ?? priceBounds.min;
		draftPriceMax = selectedFilters.price?.max ?? priceBounds.max;
	});

	function getSelectedLabel(key: OptionFilterKey, fallback: string) {
		const group = filterGroups.find((item) => item.key === key);
		const selectedValue = selectedFilters[key];
		return group?.options.find((option) => option.value === selectedValue)?.label ?? fallback;
	}

	function getFilterValue(key: OptionFilterKey, value: string) {
		if (selectedFilters[key] === value) return null;
		return value as ProductFilters[typeof key];
	}

	function formatPrice(price: number) {
		return price.toFixed(0);
	}

	function applyPriceFilter() {
		const rawMin = Number.isFinite(draftPriceMin) ? draftPriceMin : priceBounds.min;
		const rawMax = Number.isFinite(draftPriceMax) ? draftPriceMax : priceBounds.max;
		const orderedMin = Math.min(rawMin, rawMax);
		const orderedMax = Math.max(rawMin, rawMax);
		const min = Math.max(priceBounds.min, orderedMin);
		const max = Math.min(priceBounds.max, orderedMax);

		if (min === priceBounds.min && max === priceBounds.max) {
			onFilterChange('price', null);
			return;
		}

		onFilterChange('price', { min, max });
	}

	function clearPriceFilter() {
		draftPriceMin = priceBounds.min;
		draftPriceMax = priceBounds.max;
		onFilterChange('price', null);
	}
</script>

<div
	class="flex flex-col gap-5 border-b border-[#c3c8c1] pb-5 lg:flex-row lg:items-center lg:justify-between"
>
	<div class="flex gap-3 overflow-x-auto pb-2">
		<button
			class={[
				'whitespace-nowrap rounded-full border px-5 py-2 text-sm font-medium transition duration-200',
				hasActiveFilters
					? 'border-[#c3c8c1] bg-white text-[#1b1c1a] hover:bg-[#efeeeb]'
					: 'border-[#1b3022] bg-[#1b3022] text-white shadow-[0_10px_24px_rgba(27,48,34,0.14)]'
			]}
			onclick={onReset}
		>
			Svi filteri
		</button>

		{#each filterGroups as group (group.key)}
			<Popover.Root>
				<Popover.Trigger
					class={[
						'whitespace-nowrap rounded-full border px-5 py-2 text-sm font-medium transition duration-200',
						selectedFilters[group.key]
							? 'border-[#1b3022] bg-[#1b3022] text-white shadow-[0_10px_24px_rgba(27,48,34,0.14)]'
							: 'border-[#c3c8c1] bg-white text-[#1b1c1a] hover:bg-[#efeeeb]'
					]}
				>
					{getSelectedLabel(group.key, group.label)}
				</Popover.Trigger>
				<Popover.Content align="start" class="border-[#c3c8c1] bg-white p-2">
					<div class="grid gap-1">
						{#each group.options as option (option.value)}
							<Popover.Close
								class={[
									'rounded-md px-3 py-2 text-left text-sm transition duration-150',
									selectedFilters[group.key] === option.value
										? 'bg-[#1b3022] font-semibold text-white'
										: 'text-[#1b1c1a] hover:bg-[#efeeeb]'
								]}
								onclick={() => onFilterChange(group.key, getFilterValue(group.key, option.value))}
							>
								{option.label}
							</Popover.Close>
						{/each}
					</div>
				</Popover.Content>
			</Popover.Root>
		{/each}

		<Popover.Root>
			<Popover.Trigger
				class={[
					'whitespace-nowrap rounded-full border px-5 py-2 text-sm font-medium transition duration-200',
					selectedFilters.price
						? 'border-[#1b3022] bg-[#1b3022] text-white shadow-[0_10px_24px_rgba(27,48,34,0.14)]'
						: 'border-[#c3c8c1] bg-white text-[#1b1c1a] hover:bg-[#efeeeb]'
				]}
			>
				{priceLabel}
			</Popover.Trigger>
			<Popover.Content align="start" class="w-80 border-[#c3c8c1] bg-white p-4">
				<div class="grid gap-4">
					<div>
						<p class="text-sm font-semibold text-[#061b0e]">Raspon cijene</p>
						<p class="mt-1 text-xs text-[#5b5f60]">
							Katalog: {formatPrice(priceBounds.min)} - {formatPrice(priceBounds.max)} KM
						</p>
					</div>

					<div class="grid grid-cols-2 gap-3">
						<label class="grid gap-1.5 text-xs font-medium text-[#434843]">
							<span>Od</span>
							<input
								class="h-10 rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-3 text-sm font-semibold text-[#1b1c1a] outline-none transition focus:border-[#1b3022]"
								type="number"
								min={priceBounds.min}
								max={priceBounds.max}
								step="1"
								value={draftPriceMin}
								oninput={(event) => (draftPriceMin = event.currentTarget.valueAsNumber)}
							/>
						</label>
						<label class="grid gap-1.5 text-xs font-medium text-[#434843]">
							<span>Do</span>
							<input
								class="h-10 rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-3 text-sm font-semibold text-[#1b1c1a] outline-none transition focus:border-[#1b3022]"
								type="number"
								min={priceBounds.min}
								max={priceBounds.max}
								step="1"
								value={draftPriceMax}
								oninput={(event) => (draftPriceMax = event.currentTarget.valueAsNumber)}
							/>
						</label>
					</div>

					<div class="flex items-center justify-between gap-3">
						<button
							class="rounded-full px-3 py-2 text-sm font-semibold text-[#5b5f60] transition hover:bg-[#efeeeb] hover:text-[#061b0e]"
							onclick={clearPriceFilter}
						>
							Očisti
						</button>
						<Popover.Close
							class="rounded-full bg-[#1b3022] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#061b0e]"
							onclick={applyPriceFilter}
						>
							Primijeni
						</Popover.Close>
					</div>
				</div>
			</Popover.Content>
		</Popover.Root>
	</div>

	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
		<p class="text-sm font-medium text-[#434843]">
			{resultCount}
			{resultCount === 1 ? 'proizvod' : 'proizvoda'}
		</p>

		<label class="flex items-center gap-3 text-sm text-[#434843]">
			<span>Sortiraj:</span>
			<select
				class="rounded-full border border-transparent bg-[#fbf9f6] py-2 pl-3 pr-9 font-medium text-[#1b1c1a] transition focus:border-[#1b3022] focus:ring-0"
				value={sort}
				onchange={(event) => onSortChange(event.currentTarget.value as ProductSort)}
			>
				{#each sortOptions as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</label>
	</div>
</div>
