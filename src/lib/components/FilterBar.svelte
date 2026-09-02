
<script lang="ts">
	import { ArrowUpDown, Check } from '@lucide/svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import type {
		ProductAvailability,
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
		categories = [],
		selectedFilters,
		sort,
		resultCount,
		priceBounds,
		onFilterChange,
		onSortChange,
		onReset
	}: {
		categories?: { id: string; name: string }[];
		selectedFilters: ProductFilters;
		sort: ProductSort;
		resultCount: number;
		priceBounds: ProductPriceFilter;
		onFilterChange: <T extends FilterKey>(key: T, value: ProductFilters[T]) => void;
		onSortChange: (sort: ProductSort) => void;
		onReset: () => void;
	} = $props();

	let categoryOptions = $derived<FilterOption<string>[]>(
		categories && categories.length > 0
			? categories.map((c) => ({ value: c.id, label: c.name }))
			: [
					{ value: 'wpc', label: 'WPC Decking' },
					{ value: 'spc', label: 'SPC Podovi' },
					{ value: 'lvt', label: 'LVT Podovi' },
					{ value: 'tekstilne-ploce', label: 'Tekstilne ploče' }
				]
	);

	const availabilityOptions: FilterOption<ProductAvailability>[] = [
		{ value: 'in-stock', label: 'Dostupno odmah' },
		{ value: 'low-stock', label: 'Niska zaliha' },
		{ value: 'by-order', label: 'Po narudžbi' },
		{ value: 'out-of-stock', label: 'Nedostupno' }
	];

	const sortOptions: FilterOption<ProductSort>[] = [
		{ value: 'recommended', label: 'Preporučeno' },
		{ value: 'price-asc', label: 'Cijena: Najniža prvo' },
		{ value: 'price-desc', label: 'Cijena: Najviša prvo' },
		{ value: 'name-asc', label: 'Naziv: A - Z' }
	];

	let filterGroups = $derived([
		{
			key: 'category' as OptionFilterKey,
			label: 'Kategorija',
			options: categoryOptions
		},
		{
			key: 'availability' as OptionFilterKey,
			label: 'Dostupnost',
			options: availabilityOptions
		}
	]);

	let draftPriceMin = $state(0);
	let draftPriceMax = $state(0);
	let hasActiveFilters = $derived(Object.values(selectedFilters).some(Boolean));
	let priceLabel = $derived(
		selectedFilters.price
			? `${formatPrice(selectedFilters.price.min)} - ${formatPrice(selectedFilters.price.max)} KM`
			: 'Cijena'
	);

	let currentSortLabel = $derived(
		sortOptions.find((opt) => opt.value === sort)?.label ?? 'Sortiraj'
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
	class="flex flex-col gap-5 border-b border-[#c3c8c1] pb-6 lg:flex-row lg:items-center lg:justify-between"
>
	<!-- Filters list -->
	<div class="flex flex-wrap items-center gap-2.5">
		<button
			class={[
				'whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition duration-200 sm:text-sm cursor-pointer',
				hasActiveFilters
					? 'border-[#c3c8c1] bg-white text-[#1b1c1a] hover:bg-[#efeeeb]'
					: 'border-[#1b3022] bg-[#1b3022] text-white shadow-[0_8px_20px_rgba(27,48,34,0.18)]'
			]}
			onclick={onReset}
		>
			Svi proizvodi
		</button>

		{#each filterGroups as group (group.key)}
			<Popover.Root>
				<Popover.Trigger
					class={[
						'whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition duration-200 sm:text-sm',
						selectedFilters[group.key]
							? 'border-[#1b3022] bg-[#1b3022] text-white shadow-[0_8px_20px_rgba(27,48,34,0.18)]'
							: 'border-[#c3c8c1] bg-white text-[#1b1c1a] hover:bg-[#efeeeb] hover:border-[#1b3022]/40'
					]}
				>
					{getSelectedLabel(group.key, group.label)}
				</Popover.Trigger>
				<Popover.Content align="start" class="border-[#c3c8c1] bg-white p-1.5 shadow-lg rounded-lg">
					<div class="grid gap-0.5">
						{#each group.options as option (option.value)}
							<Popover.Close
								class={[
									'flex items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-xs font-medium transition duration-150 sm:text-sm',
									selectedFilters[group.key] === option.value
										? 'bg-[#1b3022] font-semibold text-white'
										: 'text-[#1b1c1a] hover:bg-[#efeeeb]'
								]}
								onclick={() => onFilterChange(group.key, getFilterValue(group.key, option.value))}
							>
								<span>{option.label}</span>
								{#if selectedFilters[group.key] === option.value}
									<Check class="size-3.5" />
								{/if}
							</Popover.Close>
						{/each}
					</div>
				</Popover.Content>
			</Popover.Root>
		{/each}

		<Popover.Root>
			<Popover.Trigger
				class={[
					'whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition duration-200 sm:text-sm',
					selectedFilters.price
						? 'border-[#1b3022] bg-[#1b3022] text-white shadow-[0_8px_20px_rgba(27,48,34,0.18)]'
						: 'border-[#c3c8c1] bg-white text-[#1b1c1a] hover:bg-[#efeeeb] hover:border-[#1b3022]/40'
				]}
			>
				{priceLabel}
			</Popover.Trigger>
			<Popover.Content align="start" class="w-80 border-[#c3c8c1] bg-white p-4 shadow-xl rounded-xl">
				<div class="grid gap-4">
					<div>
						<p class="text-sm font-semibold text-[#061b0e]">Raspon cijene</p>
						<p class="mt-1 text-xs text-[#5b5f60]">
							Katalog: {formatPrice(priceBounds.min)} - {formatPrice(priceBounds.max)} KM
						</p>
					</div>

					<div class="grid grid-cols-2 gap-3">
						<label class="grid gap-1.5 text-xs font-medium text-[#434843]">
							<span>Od (KM)</span>
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
							<span>Do (KM)</span>
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
							class="rounded-full px-3 py-1.5 text-xs font-semibold text-[#5b5f60] transition hover:bg-[#efeeeb] hover:text-[#061b0e]"
							onclick={clearPriceFilter}
						>
							Očisti
						</button>
						<Popover.Close
							class="rounded-full bg-[#1b3022] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#061b0e]"
							onclick={applyPriceFilter}
						>
							Primijeni
						</Popover.Close>
					</div>
				</div>
			</Popover.Content>
		</Popover.Root>
	</div>

	<!-- Results count & Eye-catching Sort Popover -->
	<div class="flex items-center justify-between gap-4 lg:justify-end">
		<p class="text-xs font-medium text-[#5b5f60] sm:text-sm">
			<span class="font-bold text-[#061b0e]">{resultCount}</span>
			{resultCount === 1 ? 'artikal' : 'artikala'}
		</p>

		<!-- Eye-catching Sort Dropdown / Popover -->
		<Popover.Root>
			<Popover.Trigger
				class="flex items-center gap-2 rounded-full border border-[#1b3022]/30 bg-white px-4 py-2 text-xs font-semibold text-[#061b0e] shadow-sm transition duration-200 hover:border-[#1b3022] hover:bg-[#f5f3f0] sm:text-sm"
			>
				<ArrowUpDown class="size-3.5 text-[#1b3022]" />
				<span class="text-[#5b5f60] font-normal hidden sm:inline">Sortiraj:</span>
				<span class="font-bold text-[#061b0e]">{currentSortLabel}</span>
			</Popover.Trigger>
			<Popover.Content align="end" class="w-56 border-[#c3c8c1] bg-white p-1.5 shadow-xl rounded-xl">
				<p class="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#5b5f60]">Poredaj po</p>
				<div class="grid gap-0.5">
					{#each sortOptions as option (option.value)}
						<Popover.Close
							class={[
								'flex items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-xs font-medium transition duration-150 sm:text-sm',
								sort === option.value
									? 'bg-[#1b3022] font-semibold text-white'
									: 'text-[#1b1c1a] hover:bg-[#efeeeb]'
							]}
							onclick={() => onSortChange(option.value)}
						>
							<span>{option.label}</span>
							{#if sort === option.value}
								<Check class="size-3.5" />
							{/if}
						</Popover.Close>
					{/each}
				</div>
			</Popover.Content>
		</Popover.Root>
	</div>
</div>
