<script lang="ts">
	import { resolve } from '$app/paths';
	import { PhoneCall, ShoppingCart, Search, X, Calculator } from '@lucide/svelte';

	import * as Command from '$lib/components/ui/command/index.js';
	import type { Product } from '$lib/types/product';

	let {
		cartCount,
		searchQuery,
		searchResults,
		onCartOpen,
		onSearchChange,
		onSearchResultSelect,
		onOpenCalculator
	}: {
		cartCount: number;
		searchQuery: string;
		searchResults: Product[];
		onCartOpen: () => void;
		onSearchChange: (value: string) => void;
		onSearchResultSelect: (productId: string) => void;
		onOpenCalculator?: () => void;
	} = $props();

	let searchFocused = $state(false);
	let showSearchDropdown = $derived(searchFocused && searchQuery.trim().length > 0);

	const phoneHref = 'tel:+38761069798';

	function formatPrice(price: number) {
		return price.toFixed(2).replace('.', ',');
	}

	function getAvailabilityLabel(product: Product) {
		if (product.availability === 'in-stock') return 'Dostupno';
		if (product.availability === 'low-stock') return 'Niska zaliha';
		if (product.availability === 'by-order') return 'Po narudžbi';
		return 'Nedostupno';
	}

	function selectSearchResult(productId: string) {
		searchFocused = false;
		onSearchResultSelect(productId);
	}

	function selectFirstSearchResult(event: KeyboardEvent) {
		if (event.key !== 'Enter' || !showSearchDropdown || searchResults.length === 0) return;

		event.preventDefault();
		selectSearchResult(searchResults[0].id);
	}

	function closeSearchSoon() {
		setTimeout(() => {
			searchFocused = false;
		}, 180);
	}
</script>

<div class="bg-[#1b3022] px-4 py-2 text-center text-xs font-medium text-white sm:py-2.5 sm:text-sm">
	WPC decking sistemi, SPC/LVT podne i zidne obloge sa brzom isporukom u BiH
</div>

<header class="border-b border-[#c3c8c1] bg-[#fbf9f6] sticky top-0 z-40 backdrop-blur-md">
	<div
		class="mx-auto flex flex-col gap-3.5 px-4 py-3.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 xl:gap-8 lg:px-12 max-w-7xl"
	>
		<!-- Left: Logo & Mobile Actions -->
		<div class="flex items-center justify-between gap-4 shrink-0">
			<a
				href={resolve('/')}
				class="text-2xl sm:text-[26px] font-bold tracking-tight text-[#061b0e] transition hover:opacity-85"
				aria-label="Sezzam početna"
			>
				Sezzam
			</a>
			<div class="flex items-center gap-2 lg:hidden">
				<a
					href={phoneHref}
					class="grid size-10 place-items-center rounded-full border border-[#c3c8c1] bg-white text-[#1b3022]"
					aria-label="Pozovite nas"
				>
					<PhoneCall class="size-4.5" />
				</a>
				<button
					class="relative grid size-10 place-items-center rounded-full border border-[#c3c8c1] bg-white text-lg transition active:scale-95"
					aria-label="Otvori korpu"
					onclick={onCartOpen}
				>
					<ShoppingCart class="size-4.5 text-[#061b0e]" />
					{#if cartCount > 0}
						<span
							class="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#1b3022] text-[11px] font-bold text-white shadow-sm animate-pulse"
						>
							{cartCount}
						</span>
					{/if}
				</button>
			</div>
		</div>

		<!-- Center: Search input -->
		<div
			class="relative w-full lg:max-w-xs xl:max-w-sm"
			onfocusin={() => (searchFocused = true)}
			onfocusout={closeSearchSoon}
		>
			<label class="relative block">
				<span class="sr-only">Pretraga decking sistema i podnih obloga</span>
				<Search class="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#5b5f60]" />
				<input
					class="h-10.5 w-full rounded-full border border-[#c3c8c1] bg-[#f5f3f0] pl-11 pr-10 text-sm text-[#1b1c1a] placeholder:text-[#5b5f60] transition focus:border-[#1b3022] focus:bg-white focus:ring-0"
					placeholder="Pretraži WPC decking, SPC/LVT, zidne obloge..."
					value={searchQuery}
					autocomplete="off"
					oninput={(event) => onSearchChange(event.currentTarget.value)}
					onkeydown={selectFirstSearchResult}
				/>
			</label>
			{#if searchQuery}
				<button
					class="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-[#434843] transition hover:bg-white hover:text-[#061b0e]"
					aria-label="Očisti pretragu"
					onclick={() => onSearchChange('')}
				>
					<X class="size-3.5" />
				</button>
			{/if}

			{#if showSearchDropdown}
				<div
					class="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-lg border border-[#c3c8c1] bg-white shadow-[0_24px_54px_rgba(27,28,26,0.12)]"
					role="presentation"
					onpointerdown={(event) => event.preventDefault()}
				>
					<Command.Root shouldFilter={false} class="max-h-80 rounded-lg bg-white p-1">
						<Command.List>
							{#if searchResults.length > 0}
								<Command.Group>
									{#each searchResults as product (product.id)}
										<Command.Item
											class="cursor-pointer rounded-md px-3 py-2.5"
											value={product.id}
											keywords={[
												product.name,
												product.description,
												product.category,
												product.tag,
												product.unit
											]}
											onSelect={() => selectSearchResult(product.id)}
										>
											<div class="min-w-0 flex-1">
												<p class="truncate text-sm font-semibold text-[#061b0e]">{product.name}</p>
												<p class="mt-0.5 truncate text-xs text-[#5b5f60]">
													{#if product.originalPrice && product.originalPrice > product.price}
														<span class="line-through text-[#8a8f8a] mr-1">{formatPrice(product.originalPrice)} KM</span>
														<span class="font-bold text-[#ba1a1a]">{formatPrice(product.price)} KM</span>
													{:else}
														<span>{formatPrice(product.price)} KM</span>
													{/if}
													<span> / {product.unit}</span>
												</p>
											</div>
											<span
												class="rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-2 py-0.5 text-xs font-semibold text-[#434843]"
											>
												{getAvailabilityLabel(product)}
											</span>
										</Command.Item>
									{/each}
								</Command.Group>
							{:else}
								<Command.Empty class="px-4 py-6 text-center text-sm text-[#5b5f60]">
									Nema rezultata za ovu pretragu.
								</Command.Empty>
							{/if}
						</Command.List>
					</Command.Root>
				</div>
			{/if}
		</div>

		<!-- Right: Navigation and Actions (All in single horizontal line) -->
		<nav
			class="flex items-center justify-between lg:justify-end gap-4 xl:gap-6 shrink-0"
			aria-label="Glavna navigacija"
		>
			<!-- Mobile pill navigation -->
			<div
				class="inline-flex items-center rounded-full border border-[#d6d1c7] bg-[#f0ede6] p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] lg:hidden mx-auto"
			>
				<a
					class="rounded-full px-3.5 py-1.5 text-xs font-semibold text-[#434843] transition-all hover:bg-white hover:text-[#061b0e] whitespace-nowrap"
					href={resolve('/#materijali')}
				>
					Proizvodi
				</a>
				{#if onOpenCalculator}
					<button
						type="button"
						onclick={onOpenCalculator}
						class="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#1b3022] shadow-xs transition-all hover:bg-[#1b3022] hover:text-white whitespace-nowrap"
					>
						<Calculator class="size-3" />
						<span>Kalkulator</span>
					</button>
				{:else}
					<a
						class="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-[#1b3022] transition-all hover:bg-white hover:text-[#061b0e] whitespace-nowrap"
						href={resolve('/#materijali')}
					>
						<Calculator class="size-3" />
						<span>Kalkulator</span>
					</a>
				{/if}
				<a
					class="rounded-full px-3.5 py-1.5 text-xs font-semibold text-[#434843] transition-all hover:bg-white hover:text-[#061b0e] whitespace-nowrap"
					href={resolve('/#lokacija')}
				>
					Lokacija
				</a>
			</div>

			<!-- Desktop classic navigation links (never wraps, clean spacing) -->
			<div
				class="hidden items-center gap-6 xl:gap-8 text-sm font-medium text-[#434843] lg:flex whitespace-nowrap shrink-0"
			>
				<a
					class="transition hover:text-[#061b0e] hover:underline hover:underline-offset-4 whitespace-nowrap"
					href={resolve('/#materijali')}
				>
					Proizvodi
				</a>
				{#if onOpenCalculator}
					<button
						type="button"
						onclick={onOpenCalculator}
						class="flex items-center gap-1.5 font-semibold text-[#1b3022] transition hover:text-[#061b0e] hover:underline hover:underline-offset-4 cursor-pointer whitespace-nowrap"
					>
						<Calculator class="size-4 text-[#1b3022]" />
						<span>Kalkulator utroška</span>
					</button>
				{:else}
					<a
						class="flex items-center gap-1.5 font-semibold text-[#1b3022] transition hover:text-[#061b0e] hover:underline hover:underline-offset-4 whitespace-nowrap"
						href={resolve('/#materijali')}
					>
						<Calculator class="size-4 text-[#1b3022]" />
						<span>Kalkulator utroška</span>
					</a>
				{/if}
				<a
					class="transition hover:text-[#061b0e] hover:underline hover:underline-offset-4 whitespace-nowrap"
					href={resolve('/#lokacija')}
				>
					Lokacija
				</a>
			</div>

			<!-- Desktop call CTA & Cart -->
			<div class="hidden items-center gap-3 lg:flex shrink-0">
				<a
					href={phoneHref}
					class="inline-flex items-center gap-2 rounded-full border border-[#1b3022] bg-[#1b3022] px-4.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#061b0e] active:scale-95 whitespace-nowrap shrink-0"
				>
					<PhoneCall class="size-3.5 text-[#d0e9d4]" />
					<span>Pozovite nas</span>
				</a>
				<button
					class="relative grid size-10 place-items-center rounded-full border border-[#c3c8c1] bg-white text-xl transition hover:border-[#1b3022] active:scale-95 shrink-0"
					aria-label="Otvori korpu"
					onclick={onCartOpen}
				>
					<ShoppingCart class="size-5 text-[#061b0e]" />
					{#if cartCount > 0}
						<span
							class="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#1b3022] text-xs font-bold text-white shadow-sm"
						>
							{cartCount}
						</span>
					{/if}
				</button>
			</div>
		</nav>
	</div>
</header>
