<script lang="ts">
	import { resolve } from '$app/paths';

	import * as Command from '$lib/components/ui/command/index.js';
	import type { Product } from '$lib/types/product';

	let {
		cartCount,
		searchQuery,
		searchResults,
		onCartOpen,
		onSearchChange,
		onSearchResultSelect
	}: {
		cartCount: number;
		searchQuery: string;
		searchResults: Product[];
		onCartOpen: () => void;
		onSearchChange: (value: string) => void;
		onSearchResultSelect: (productId: string) => void;
	} = $props();

	let searchFocused = $state(false);
	let showSearchDropdown = $derived(searchFocused && searchQuery.trim().length > 0);

	function formatPrice(price: number) {
		return price.toFixed(2).replace('.', ',');
	}

	function getAvailabilityLabel(product: Product) {
		if (product.availability === 'in-stock') return 'Na stanju';
		if (product.availability === 'low-stock') return 'Niska zaliha';
		if (product.availability === 'by-order') return 'Po narudžbi';
		return 'Nema na stanju';
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

<div class="bg-[#1b3022] px-4 py-3 text-center text-sm font-medium text-white sm:text-base">
	Kvalitetni materijali dostupni za preuzimanje i narudžbe u BiH
</div>

<header class="border-b border-[#c3c8c1] bg-[#fbf9f6]">
	<div
		class="mx-auto grid max-w-[1280px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[170px_minmax(340px,520px)_1fr] lg:items-center lg:px-12"
	>
		<div class="flex items-center justify-between gap-4">
			<a
				href={resolve('/')}
				class="text-2xl font-semibold text-[#061b0e]"
				aria-label="Sezzam početna"
			>
				Sezzam
			</a>
			<div class="flex items-center gap-3 lg:hidden">
				<button
					class="relative grid size-11 place-items-center rounded-full border border-[#c3c8c1] bg-white text-lg"
					aria-label="Otvori korpu"
					onclick={onCartOpen}
				>
					<svg
						class="size-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M6.5 6.5h14l-1.6 8.2a2 2 0 0 1-2 1.6H9.2a2 2 0 0 1-2-1.7L6 3.8H3.5" />
						<circle cx="9.5" cy="20" r="1" />
						<circle cx="17" cy="20" r="1" />
					</svg>
					{#if cartCount > 0}
						<span
							class="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#ba1a1a] text-xs font-semibold text-white"
							>{cartCount}</span
						>
					{/if}
				</button>
			</div>
		</div>

		<div
			class="relative w-full lg:mx-auto lg:max-w-[520px]"
			onfocusin={() => (searchFocused = true)}
			onfocusout={closeSearchSoon}
		>
			<label>
				<span class="sr-only">Pretraga materijala</span>
				<input
					class="h-12 w-full rounded-full border border-[#c3c8c1] bg-[#f5f3f0] px-6 pr-12 text-sm text-[#1b1c1a] placeholder:text-[#5b5f60] focus:border-[#1b3022] focus:bg-white focus:ring-0"
					placeholder="Pretraži materijale, kategorije..."
					value={searchQuery}
					autocomplete="off"
					oninput={(event) => onSearchChange(event.currentTarget.value)}
					onkeydown={selectFirstSearchResult}
				/>
			</label>
			{#if searchQuery}
				<button
					class="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-[#434843] transition hover:bg-white hover:text-[#061b0e]"
					aria-label="Očisti pretragu"
					onclick={() => onSearchChange('')}
				>
					<svg
						class="size-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				</button>
			{/if}

			{#if showSearchDropdown}
				<div
					class="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-lg border border-[#c3c8c1] bg-white shadow-[0_24px_54px_rgba(27,28,26,0.12)]"
					role="presentation"
					onpointerdown={(event) => event.preventDefault()}
				>
					<Command.Root shouldFilter={false} class="max-h-[320px] rounded-lg bg-white p-1">
						<Command.List>
							{#if searchResults.length > 0}
								<Command.Group>
									{#each searchResults as product (product.id)}
										<Command.Item
											class="cursor-pointer rounded-md px-3 py-3"
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
												<p class="mt-1 truncate text-xs text-[#5b5f60]">
													{formatPrice(product.price)} KM / {product.unit}
												</p>
											</div>
											<span
												class="rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-2 py-1 text-xs font-semibold text-[#434843]"
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

		<nav
			class="flex flex-1 items-center justify-between gap-5 lg:justify-end"
			aria-label="Glavna navigacija"
		>
			<div class="flex gap-5 text-sm text-[#434843]">
				<a class="font-semibold text-[#061b0e]" href={resolve('/')}>Materijali</a>
				<a class="hover:text-[#061b0e]" href={resolve('/')}>Projekti</a>
				<a class="hover:text-[#061b0e]" href={resolve('/')}>Resursi</a>
			</div>
			<div class="hidden items-center gap-4 lg:flex">
				<button
					class="grid size-11 place-items-center rounded-full border border-transparent hover:border-[#c3c8c1] hover:bg-white"
					aria-label="Korisnički račun"
				>
					<svg
						class="size-6"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<circle cx="12" cy="8" r="3.5" />
						<path d="M5 20a7 7 0 0 1 14 0" />
					</svg>
				</button>
				<button
					class="relative grid size-11 place-items-center rounded-full border border-[#c3c8c1] bg-white text-xl"
					aria-label="Otvori korpu"
					onclick={onCartOpen}
				>
					<svg
						class="size-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M6.5 6.5h14l-1.6 8.2a2 2 0 0 1-2 1.6H9.2a2 2 0 0 1-2-1.7L6 3.8H3.5" />
						<circle cx="9.5" cy="20" r="1" />
						<circle cx="17" cy="20" r="1" />
					</svg>
					{#if cartCount > 0}
						<span
							class="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#ba1a1a] text-xs font-semibold text-white"
							>{cartCount}</span
						>
					{/if}
				</button>
			</div>
		</nav>
	</div>
</header>
