<script lang="ts">
	import {
		Calculator,
		Info,
		Plus,
		Square,
		Circle,
		Grid
	} from '@lucide/svelte';
	import type { Product } from '$lib/types/product';

	let {
		products = [],
		initialProduct = null,
		embedded = false,
		onAddToCart
	}: {
		products?: Product[];
		initialProduct?: Product | null;
		embedded?: boolean;
		onAddToCart?: (productId: string, quantity: number) => void;
	} = $props();

	type MaterialCategory = 'laminat' | 'decking';
	type SurfaceShape = 'rectangle' | 'circle' | 'l-shape' | 'custom';

	let selectedCategory = $state<MaterialCategory>('laminat');
	let selectedShape = $state<SurfaceShape>('rectangle');

	// Rectangle inputs
	let length = $state<number>(5);
	let width = $state<number>(4);

	// Circle inputs
	let diameter = $state<number>(4);
	let isHalfCircle = $state<boolean>(false);

	// L-Shape inputs
	let lPart1Length = $state<number>(4);
	let lPart1Width = $state<number>(3);
	let lPart2Length = $state<number>(3);
	let lPart2Width = $state<number>(2);

	// Custom direct area
	let customArea = $state<number>(25);

	let selectedProductId = $state<string>('');

	// Standard packaging specs
	const LAMINAT_PACK_M2 = 2.22; // m2 per package
	const DECKING_BOARD_M2 = 0.6; // m2 per board (e.g. 4m x 0.15m)

	// Strict Category-Specific Product Filtering
	let relevantProducts = $derived(
		products.filter((p) => {
			const name = p.name.toLowerCase();
			const desc = p.description.toLowerCase();

			if (selectedCategory === 'laminat') {
				return (
					p.category === 'spc' ||
					p.category === 'lvt' ||
					p.category === 'tekstilne-ploce' ||
					name.includes('lvt') ||
					name.includes('spc') ||
					name.includes('vinil') ||
					name.includes('pod') ||
					name.includes('ploce') ||
					name.includes('laminat') ||
					name.includes('parket')
				);
			}

			if (selectedCategory === 'decking') {
				return (
					p.category === 'wpc' ||
					name.includes('decking') ||
					desc.includes('decking') ||
					name.includes('wpc') ||
					name.includes('terasa') ||
					name.includes('daska')
				);
			}

			return false;
		})
	);

	let selectedProduct = $derived(
		selectedProductId ? (products.find((p) => p.id === selectedProductId) ?? null) : null
	);

	// Calculated Net Area based on Shape
	let netArea = $derived.by(() => {
		if (selectedShape === 'rectangle') {
			return Math.max(0.1, Number((length * width).toFixed(2)));
		}
		if (selectedShape === 'circle') {
			const radius = Math.max(0.1, diameter / 2);
			const fullArea = Math.PI * radius * radius;
			return Number((isHalfCircle ? fullArea / 2 : fullArea).toFixed(2));
		}
		if (selectedShape === 'l-shape') {
			const part1 = Math.max(0.1, lPart1Length * lPart1Width);
			const part2 = Math.max(0.1, lPart2Length * lPart2Width);
			return Number((part1 + part2).toFixed(2));
		}
		return Math.max(0.1, Number(customArea || 0));
	});

	// Recommended Reserve percentage based on Shape
	let reservePercent = $derived.by(() => {
		if (selectedShape === 'circle') return 15; // Circles have high cut waste
		if (selectedShape === 'l-shape') return 12; // L-shapes have corner seams
		return 10; // Standard rectangle or custom
	});

	let reserveArea = $derived(Number((netArea * (reservePercent / 100)).toFixed(2)));
	let grossArea = $derived(Number((netArea * (1 + reservePercent / 100)).toFixed(2)));

	// Laminat breakdown
	let laminatPacks = $derived(Math.ceil(grossArea / LAMINAT_PACK_M2));
	let laminatActualM2 = $derived(Number((laminatPacks * LAMINAT_PACK_M2).toFixed(2)));
	let estimatedPerimeter = $derived.by(() => {
		if (selectedShape === 'rectangle') return Number(((length + width) * 2).toFixed(1));
		if (selectedShape === 'circle') {
			const d = diameter;
			return Number((isHalfCircle ? Math.PI * (d / 2) + d : Math.PI * d).toFixed(1));
		}
		if (selectedShape === 'l-shape') {
			return Number(((lPart1Length + lPart1Width + lPart2Length + lPart2Width) * 1.5).toFixed(1));
		}
		return Number((Math.sqrt(netArea) * 4).toFixed(1));
	});

	// Decking breakdown
	let deckingBoards = $derived(Math.ceil(grossArea / DECKING_BOARD_M2));
	let deckingSubconstructionMeters = $derived(Math.ceil(grossArea * 2.8)); // 2.8m beams per m2
	let deckingClipsCount = $derived(Math.ceil(grossArea * 22)); // 22 clips per m2

	// Price calculation if a product is selected
	let estimatedTotal = $derived(
		selectedProduct ? Number((selectedProduct.price * Math.ceil(grossArea)).toFixed(2)) : null
	);

	function formatPrice(price: number) {
		return price.toFixed(2).replace('.', ',');
	}

	function handleAdd() {
		if (!selectedProduct || !onAddToCart) return;
		const quantity = Math.ceil(grossArea);
		onAddToCart(selectedProduct.id, quantity);
	}

	function handleCategoryChange(category: MaterialCategory) {
		selectedCategory = category;
		selectedProductId = '';
	}

	$effect(() => {
		if (initialProduct) {
			selectedProductId = initialProduct.id;
			if (initialProduct.name.toLowerCase().includes('decking')) {
				selectedCategory = 'decking';
			} else {
				selectedCategory = 'laminat';
			}
		}
	});
</script>

<div
	class={embedded
		? 'w-full bg-white'
		: 'overflow-hidden rounded-2xl border border-[#c3c8c1] bg-white shadow-[0_18px_44px_rgba(27,28,26,0.06)]'}
>
	{#if !embedded}
		<!-- Top header for standalone page -->
		<div class="border-b border-[#e3e2e0] bg-[#f5f3f0] px-4 py-4 sm:px-8 sm:py-5">
			<div class="flex flex-wrap items-center justify-between gap-4">
				<div class="flex items-center gap-3">
					<div class="grid size-10 place-items-center rounded-xl bg-[#1b3022] text-white shadow-sm">
						<Calculator class="size-5" />
					</div>
					<div>
						<h3 class="text-xl font-bold text-[#061b0e]">Kalkulator potrošnje materijala</h3>
						<p class="text-xs text-[#5b5f60]">
							Automatski proračun sa građevinskom rezervom prilagođenom obliku prostora
						</p>
					</div>
				</div>

				<!-- Category Tabs -->
				<div class="flex rounded-full border border-[#c3c8c1] bg-white p-1">
					<button
						class={[
							'rounded-full px-5 py-1.5 text-xs font-bold transition sm:text-sm',
							selectedCategory === 'decking'
								? 'bg-[#1b3022] text-white shadow-sm'
								: 'text-[#434843] hover:text-[#061b0e]'
						]}
						onclick={() => handleCategoryChange('decking')}
					>
						Decking / Terase
					</button>
					<button
						class={[
							'rounded-full px-5 py-1.5 text-xs font-bold transition sm:text-sm',
							selectedCategory === 'laminat'
								? 'bg-[#1b3022] text-white shadow-sm'
								: 'text-[#434843] hover:text-[#061b0e]'
						]}
						onclick={() => handleCategoryChange('laminat')}
					>
						Podne obloge
					</button>
				</div>
			</div>
		</div>
	{:else}
		<!-- Sleek Category Switcher when embedded inside modal/sheet -->
		<div class="mb-3 flex justify-center">
			<div class="inline-flex rounded-full border border-[#c3c8c1] bg-[#f5f3f0] p-1 shadow-xs">
				<button
					type="button"
					class={[
						'rounded-full px-4 py-1 text-xs font-bold transition sm:text-sm cursor-pointer',
						selectedCategory === 'decking'
							? 'bg-[#1b3022] text-white shadow-sm'
							: 'text-[#434843] hover:text-[#061b0e]'
					]}
					onclick={() => handleCategoryChange('decking')}
				>
					WPC Decking / Terase
				</button>
				<button
					type="button"
					class={[
						'rounded-full px-4 py-1 text-xs font-bold transition sm:text-sm cursor-pointer',
						selectedCategory === 'laminat'
							? 'bg-[#1b3022] text-white shadow-sm'
							: 'text-[#434843] hover:text-[#061b0e]'
					]}
					onclick={() => handleCategoryChange('laminat')}
				>
					SPC & LVT Podovi
				</button>
			</div>
		</div>
	{/if}

	<!-- Main grid -->
	<div
		class={embedded
			? 'grid gap-5 md:grid-cols-[1.1fr_1fr] lg:gap-8'
			: 'grid gap-6 p-4 sm:p-8 md:grid-cols-[1.1fr_1fr] lg:gap-8'}
	>
		<!-- Left: Shape selection & Dimension inputs -->
		<div class="space-y-3.5 sm:space-y-4">
			<!-- 1. Visual Shape Selector -->
			<div>
				<span class="block text-xs sm:text-sm font-bold uppercase tracking-wider text-[#5b5f60]">
					1. Odaberite oblik prostorije ili terase:
				</span>
				<div class="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
					<!-- Rectangle -->
					<button
						type="button"
						class={[
							'flex min-w-0 flex-col items-center justify-center rounded-xl border p-2.5 sm:p-3.5 text-center transition active:scale-95 cursor-pointer',
							selectedShape === 'rectangle'
								? 'border-[#1b3022] bg-[#1b3022] text-white shadow-sm'
								: 'border-[#c3c8c1] bg-[#fbf9f6] text-[#1b1c1a] hover:bg-white hover:border-[#1b3022]/40'
						]}
						onclick={() => (selectedShape = 'rectangle')}
					>
						<Square class="size-5 sm:size-6 mb-1.5 shrink-0" />
						<span class="w-full truncate text-xs sm:text-sm font-bold">Pravougaonik</span>
						<span class="text-[10px] sm:text-[11px] opacity-80 mt-0.5 whitespace-nowrap">+10% rezerva</span>
					</button>

					<!-- L-Shape -->
					<button
						type="button"
						class={[
							'flex min-w-0 flex-col items-center justify-center rounded-xl border p-2.5 sm:p-3.5 text-center transition active:scale-95 cursor-pointer',
							selectedShape === 'l-shape'
								? 'border-[#1b3022] bg-[#1b3022] text-white shadow-sm'
								: 'border-[#c3c8c1] bg-[#fbf9f6] text-[#1b1c1a] hover:bg-white hover:border-[#1b3022]/40'
						]}
						onclick={() => (selectedShape = 'l-shape')}
					>
						<svg
							class="size-5 sm:size-6 mb-1.5 shrink-0"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M4 4v16h16v-7h-9V4H4z" />
						</svg>
						<span class="w-full truncate text-xs sm:text-sm font-bold">L-Oblik</span>
						<span class="text-[10px] sm:text-[11px] opacity-80 mt-0.5 whitespace-nowrap">+12% rezerva</span>
					</button>

					<!-- Circle -->
					<button
						type="button"
						class={[
							'flex min-w-0 flex-col items-center justify-center rounded-xl border p-2.5 sm:p-3.5 text-center transition active:scale-95 cursor-pointer',
							selectedShape === 'circle'
								? 'border-[#1b3022] bg-[#1b3022] text-white shadow-sm'
								: 'border-[#c3c8c1] bg-[#fbf9f6] text-[#1b1c1a] hover:bg-white hover:border-[#1b3022]/40'
						]}
						onclick={() => (selectedShape = 'circle')}
					>
						<Circle class="size-5 sm:size-6 mb-1.5 shrink-0" />
						<span class="w-full truncate text-xs sm:text-sm font-bold">Krug / Luk</span>
						<span class="text-[10px] sm:text-[11px] opacity-80 mt-0.5 whitespace-nowrap">+15% rezerva</span>
					</button>

					<!-- Custom area -->
					<button
						type="button"
						class={[
							'flex min-w-0 flex-col items-center justify-center rounded-xl border p-2.5 sm:p-3.5 text-center transition active:scale-95 cursor-pointer',
							selectedShape === 'custom'
								? 'border-[#1b3022] bg-[#1b3022] text-white shadow-sm'
								: 'border-[#c3c8c1] bg-[#fbf9f6] text-[#1b1c1a] hover:bg-white hover:border-[#1b3022]/40'
						]}
						onclick={() => (selectedShape = 'custom')}
					>
						<Grid class="size-5 sm:size-6 mb-1.5 shrink-0" />
						<span class="w-full truncate text-xs sm:text-sm font-bold">Direktan m²</span>
						<span class="text-[10px] sm:text-[11px] opacity-80 mt-0.5 whitespace-nowrap">+10% rezerva</span>
					</button>
				</div>
			</div>

			<!-- 2. Dynamic Input Fields Based on Selected Shape -->
			<div class="rounded-2xl border border-[#e3e2e0] bg-[#fbf9f6] p-4 sm:p-5">
				<span class="block text-xs sm:text-sm font-bold text-[#061b0e] mb-3"> 2. Unesite dimenzije: </span>

				{#if selectedShape === 'rectangle'}
					<div class="grid grid-cols-2 gap-4">
						<label class="grid gap-1.5 text-xs sm:text-sm font-medium text-[#434843]">
							<span>Dužina (m)</span>
							<div class="relative">
								<input
									type="number"
									min="0.5"
									max="100"
									step="0.1"
									bind:value={length}
									class="h-11 sm:h-12 w-full rounded-xl border border-[#c3c8c1] bg-white px-3.5 pr-10 text-base sm:text-lg font-bold text-[#1b1c1a] outline-none transition focus:border-[#1b3022]"
								/>
								<span
									class="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#5b5f60]"
									>m</span
								>
							</div>
						</label>

						<label class="grid gap-1.5 text-xs sm:text-sm font-medium text-[#434843]">
							<span>Širina (m)</span>
							<div class="relative">
								<input
									type="number"
									min="0.5"
									max="100"
									step="0.1"
									bind:value={width}
									class="h-11 sm:h-12 w-full rounded-xl border border-[#c3c8c1] bg-white px-3.5 pr-10 text-base sm:text-lg font-bold text-[#1b1c1a] outline-none transition focus:border-[#1b3022]"
								/>
								<span
									class="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#5b5f60]"
									>m</span
								>
							</div>
						</label>
					</div>
				{:else if selectedShape === 'l-shape'}
					<div class="space-y-3">
						<div>
							<p class="text-[11px] font-semibold text-[#5b5f60] mb-1.5">Glavni dio (Dio 1):</p>
							<div class="grid grid-cols-2 gap-2">
								<input
									type="number"
									min="0.5"
									step="0.1"
									bind:value={lPart1Length}
									placeholder="Dužina 1 (m)"
									class="h-10 rounded-lg border border-[#c3c8c1] bg-white px-3 text-xs font-semibold outline-none focus:border-[#1b3022]"
								/>
								<input
									type="number"
									min="0.5"
									step="0.1"
									bind:value={lPart1Width}
									placeholder="Širina 1 (m)"
									class="h-10 rounded-lg border border-[#c3c8c1] bg-white px-3 text-xs font-semibold outline-none focus:border-[#1b3022]"
								/>
							</div>
						</div>
						<div>
							<p class="text-[11px] font-semibold text-[#5b5f60] mb-1.5">Krak na L (Dio 2):</p>
							<div class="grid grid-cols-2 gap-2">
								<input
									type="number"
									min="0.5"
									step="0.1"
									bind:value={lPart2Length}
									placeholder="Dužina 2 (m)"
									class="h-10 rounded-lg border border-[#c3c8c1] bg-white px-3 text-xs font-semibold outline-none focus:border-[#1b3022]"
								/>
								<input
									type="number"
									min="0.5"
									step="0.1"
									bind:value={lPart2Width}
									placeholder="Širina 2 (m)"
									class="h-10 rounded-lg border border-[#c3c8c1] bg-white px-3 text-xs font-semibold outline-none focus:border-[#1b3022]"
								/>
							</div>
						</div>
					</div>
				{:else if selectedShape === 'circle'}
					<div class="space-y-3">
						<label class="grid gap-1 text-xs font-medium text-[#434843]">
							<span>Prečnik kruga / terase (m)</span>
							<div class="relative">
								<input
									type="number"
									min="0.5"
									max="50"
									step="0.1"
									bind:value={diameter}
									class="h-10 w-full rounded-lg border border-[#c3c8c1] bg-white px-3 pr-8 text-sm font-semibold text-[#1b1c1a] outline-none transition focus:border-[#1b3022]"
								/>
								<span
									class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#5b5f60]"
									>m</span
								>
							</div>
						</label>

						<div class="flex items-center gap-2 pt-1">
							<input
								type="checkbox"
								id="half-circle-toggle"
								bind:checked={isHalfCircle}
								class="size-4 rounded text-[#1b3022] focus:ring-[#1b3022]"
							/>
							<label
								for="half-circle-toggle"
								class="text-xs font-medium text-[#1b1c1a] cursor-pointer"
							>
								Ovo je polukružna terasa / balkon (podijeli površinu na pola)
							</label>
						</div>
					</div>
				{:else}
					<label class="grid gap-1 text-xs font-medium text-[#434843]">
						<span>Ukupna kvadratura (m²)</span>
						<div class="relative">
							<input
								type="number"
								min="1"
								max="1000"
								step="0.5"
								bind:value={customArea}
								placeholder="npr. 25"
								class="h-10 w-full rounded-lg border border-[#c3c8c1] bg-white px-3 pr-10 text-sm font-semibold text-[#1b1c1a] outline-none transition focus:border-[#1b3022]"
							/>
							<span
								class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#5b5f60]"
								>m²</span
							>
						</div>
					</label>
				{/if}
			</div>

			<!-- 3. Product selector -->
			<div>
				<label
					for="calculator-product-select"
					class="block text-xs font-bold uppercase tracking-wider text-[#5b5f60]"
				>
					3. Odaberite artikal iz ponude (opcionalno):
				</label>
				{#if relevantProducts.length > 0}
					<select
						id="calculator-product-select"
						bind:value={selectedProductId}
						class="mt-2 h-12 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-4 text-sm sm:text-base font-bold text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white cursor-pointer"
					>
						<option value="">-- Odaberite artikal (opcionalno) --</option>
						{#each relevantProducts as product (product.id)}
							<option value={product.id}>
								{product.name} — {formatPrice(product.price)} KM / {product.unit}
							</option>
						{/each}
					</select>
				{:else}
					<div
						class="mt-2 rounded-xl border border-[#e3e2e0] bg-[#fbf9f6] p-3 text-xs sm:text-sm text-[#5b5f60]"
					>
						Nema unesenih artikala u kategoriji {selectedCategory === 'laminat'
							? 'Laminat'
							: 'Decking'}. Možete koristiti kalkulator za izračun potrebne kvadrature i paketa.
					</div>
				{/if}
			</div>

			<!-- Industry info badge -->
			<div
				class="flex items-start gap-3 rounded-xl border border-[#d0e9d4] bg-[#f2fbf3] p-3.5 sm:p-4 text-xs sm:text-sm text-[#1b3022]"
			>
				<Info class="mt-0.5 size-5 shrink-0 text-[#1b3022]" />
				<div>
					<p class="font-bold">
						{selectedShape === 'circle'
							? 'Zašto +15% kod kružnih površina?'
							: selectedShape === 'l-shape'
								? 'Zašto +12% za L-oblik?'
								: 'Standardna rezerva +10%'}
					</p>
					<p class="mt-1 leading-relaxed text-[#2a4d33] text-xs">
						{#if selectedShape === 'circle'}
							Kružno i lučno rezanje dasaka stvara veći škart, pa se preporučuje 15% rezerve.
						{:else if selectedShape === 'l-shape'}
							Unutrašnji uglovi i preklopni spojevi zahtijevaju 12% rezerve radi preciznog uklapanja.
						{:else}
							Građevinski standard nalaže 10% rezerve za dilatacijske razmake, rezove uz zid i lom.
						{/if}
					</p>
				</div>
			</div>
		</div>

		<!-- Right: Calculation summary card -->
		<div
			class="flex flex-col justify-between rounded-2xl border border-[#c3c8c1] bg-[#fbf9f6] p-5 sm:p-6 lg:p-7 shadow-sm md:sticky md:top-0 h-fit"
		>
			<div>
				<h4 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#5b5f60]">
					Rezultati proračuna
				</h4>

				<div class="mt-4 grid grid-cols-2 gap-4 border-b border-[#e3e2e0] pb-4">
					<div>
						<p class="text-xs sm:text-sm text-[#5b5f60]">Neto površina:</p>
						<p class="text-xl sm:text-2xl font-black text-[#1b1c1a]">{netArea} m²</p>
					</div>
					<div>
						<p class="text-xs sm:text-sm text-[#5b5f60]">+{reservePercent}% Rezerva:</p>
						<p class="text-xl sm:text-2xl font-black text-[#2a6639]">+{reserveArea} m²</p>
					</div>
				</div>

				<div class="mt-4">
					<p class="text-xs sm:text-sm font-bold text-[#5b5f60]">
						Ukupno potrebno naručiti (sa rezervom):
					</p>
					<p class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#061b0e]">
						{grossArea} <span class="text-xl sm:text-2xl font-bold">m²</span>
					</p>
				</div>

				<!-- Category specific breakdowns -->
				<div
					class="mt-4 space-y-2 rounded-2xl border border-[#e3e2e0] bg-white p-4 text-xs sm:text-sm text-[#434843]"
				>
					{#if selectedCategory === 'laminat'}
						<div class="flex justify-between py-1 border-b border-[#f5f3f0]">
							<span>Preporučeno paketa (~{LAMINAT_PACK_M2} m²/pak):</span>
							<span class="font-bold text-[#061b0e]"
								>{laminatPacks} paketa ({laminatActualM2} m²)</span
							>
						</div>
						<div class="flex justify-between py-1 border-b border-[#f5f3f0]">
							<span>Podloga / spužvica:</span>
							<span class="font-bold text-[#061b0e]">{grossArea} m²</span>
						</div>
						<div class="flex justify-between py-1">
							<span>Preporučena dužina lajsni:</span>
							<span class="font-bold text-[#061b0e]">cca {estimatedPerimeter} m dužnih</span>
						</div>
					{:else}
						<div class="flex justify-between py-1 border-b border-[#f5f3f0]">
							<span>Preporučeno decking dasaka:</span>
							<span class="font-bold text-[#061b0e]">cca {deckingBoards} kom</span>
						</div>
						<div class="flex justify-between py-1 border-b border-[#f5f3f0]">
							<span>Podkonstrukcijske grede:</span>
							<span class="font-bold text-[#061b0e]"
								>cca {deckingSubconstructionMeters} m dužnih</span
							>
						</div>
						<div class="flex justify-between py-1">
							<span>Montažne kopče i vijci:</span>
							<span class="font-bold text-[#061b0e]">cca {deckingClipsCount} kom</span>
						</div>
					{/if}
				</div>

				{#if estimatedTotal !== null && selectedProduct}
					<div class="mt-4 flex items-center justify-between border-t border-[#e3e2e0] pt-4">
						<div>
							<p class="text-xs sm:text-sm font-semibold text-[#5b5f60]">
								Okvirna cijena ({Math.ceil(grossArea)} {selectedProduct.unit}):
							</p>
							<p class="text-2xl sm:text-3xl font-black text-[#061b0e]">{formatPrice(estimatedTotal)} KM</p>
						</div>
					</div>
				{:else}
					<div
						class="mt-4 rounded-xl border border-dashed border-[#c3c8c1] bg-white p-3 text-center text-xs sm:text-sm text-[#5b5f60]"
					>
						<p class="font-medium">
							Odaberite artikal iznad za izračun okvirne cijene i dodavanje u korpu.
						</p>
					</div>
				{/if}
			</div>

			<!-- Add to Cart CTA (shown when product is chosen) -->
			{#if onAddToCart && selectedProduct}
				<button
					onclick={handleAdd}
					class="mt-5 flex h-13 w-full items-center justify-center gap-2.5 rounded-full bg-[#1b3022] text-sm sm:text-base font-bold text-white shadow-[0_10px_24px_rgba(27,48,34,0.2)] transition hover:bg-[#061b0e] active:scale-98 cursor-pointer"
				>
					<Plus class="size-5" />
					<span>Dodaj {Math.ceil(grossArea)} {selectedProduct.unit} u korpu</span>
				</button>
			{/if}
		</div>
	</div>
</div>
