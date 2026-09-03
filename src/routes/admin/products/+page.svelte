<script lang="ts">
	import { resolve } from '$app/paths';
	import { Plus, Edit3, Trash2, Package, Search } from '@lucide/svelte';

	import { getAvailabilityLabel } from '$lib/adminOptions';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let searchQuery = $state('');
	let statusFilter = $state<'all' | 'active' | 'inactive'>('all');
	let filteredProducts = $derived(
		data.products.filter((product) => {
			const query = searchQuery.trim().toLowerCase();
			const matchesSearch =
				!query ||
				product.name.toLowerCase().includes(query) ||
				product.id.toLowerCase().includes(query);
			const matchesStatus =
				statusFilter === 'all' ||
				(statusFilter === 'active' && product.active) ||
				(statusFilter === 'inactive' && !product.active);

			return matchesSearch && matchesStatus;
		})
	);

	function formatPrice(value: number) {
		return value.toFixed(2).replace('.', ',');
	}
</script>

<svelte:head>
	<title>Proizvodi | Sezzam admin</title>
</svelte:head>

<!-- Header & Add Button -->
<section class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
	<div>
		<p class="text-xs font-bold uppercase tracking-wider text-[#5b5f60]">Katalog</p>
		<h1 class="mt-1 text-2xl sm:text-3xl font-bold text-[#061b0e]">Proizvodi</h1>
		<p class="mt-1.5 text-xs sm:text-sm text-[#5b5f60]">
			Upravljanje artiklima, cijenama, zalihama i vidljivošću u webshopu.
		</p>
	</div>
	<a
		class="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#1b3022] px-6 text-sm font-bold text-white shadow-xs transition hover:bg-[#061b0e] active:scale-98"
		href={resolve('/admin/products/new')}
	>
		<Plus class="size-4.5" />
		<span>Novi proizvod</span>
	</a>
</section>

{#if form?.message}
	<p
		class="mt-4 rounded-xl border border-[#bad5bf] bg-[#f2fbf3] px-4 py-3 text-sm font-semibold text-[#1b5e20]"
	>
		{form.message}
	</p>
{/if}

{#if form?.error}
	<p
		class="mt-4 rounded-xl border border-[#f1b9b9] bg-[#fff5f5] px-4 py-3 text-sm font-semibold text-[#8f1010]"
	>
		{form.error}
	</p>
{/if}

<!-- Search & Status Filters -->
<section class="mt-5 rounded-2xl border border-[#d6d1c8] bg-white p-3.5 sm:p-4 shadow-2xs">
	<div class="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
		<div class="relative">
			<Search class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#5b5f60]" />
			<input
				class="h-11 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] pl-10 pr-3 text-sm font-medium text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white"
				placeholder="Pretraži po nazivu ili ID-u..."
				bind:value={searchQuery}
			/>
		</div>
		<div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
			{#each ['all', 'active', 'inactive'] as status (status)}
				<button
					class={[
						'h-9 rounded-full px-4 text-xs font-bold transition shrink-0 cursor-pointer',
						statusFilter === status
							? 'bg-[#1b3022] text-white shadow-xs'
							: 'border border-[#c3c8c1] bg-white text-[#434843] hover:bg-[#f5f3f0]'
					]}
					type="button"
					onclick={() => (statusFilter = status as typeof statusFilter)}
				>
					{status === 'all' ? 'Svi' : status === 'active' ? 'Aktivni' : 'Neaktivni'}
				</button>
			{/each}
		</div>
	</div>
</section>

<!-- Products Display -->
<section class="mt-5">
	{#if filteredProducts.length > 0}
		<!-- Desktop Table View (lg and up) -->
		<div
			class="hidden lg:block overflow-hidden rounded-2xl border border-[#d6d1c8] bg-white shadow-2xs"
		>
			<div
				class="grid grid-cols-[1.4fr_0.7fr_0.6fr_0.6fr_180px] gap-4 border-b border-[#e1ddd5] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[#5b5f60] bg-[#fbf9f6]"
			>
				<p>Proizvod</p>
				<p>Cijena</p>
				<p>Zaliha</p>
				<p>Status</p>
				<p class="text-right">Akcije</p>
			</div>

			{#each filteredProducts as product (product.id)}
				<article
					class="grid grid-cols-[1.4fr_0.7fr_0.6fr_0.6fr_180px] gap-4 items-center border-b border-[#e1ddd5] px-5 py-4 last:border-b-0 hover:bg-[#fcfbf9] transition"
				>
					<div class="flex items-center gap-3">
						{#if product.imageUrl}
							<img
								src={product.imageUrl}
								alt={product.name}
								class="size-11 rounded-lg border border-[#e3e2e0] object-cover shrink-0"
							/>
						{:else}
							<div
								class="grid size-11 place-items-center rounded-lg border border-[#e3e2e0] bg-[#f5f3f0] text-[#737973] shrink-0"
							>
								<Package class="size-5" />
							</div>
						{/if}
						<div class="min-w-0">
							<p class="font-bold text-[#061b0e] truncate">{product.name}</p>
							<p class="mt-0.5 text-xs text-[#5b5f60]">{product.id}</p>
						</div>
					</div>

					<div>
						<p class="text-sm font-bold text-[#061b0e]">{formatPrice(product.price)} KM</p>
						<p class="text-xs text-[#5b5f60]">po {product.unit}</p>
					</div>

					<p class="text-sm font-medium text-[#434843]">{product.stockLabel}</p>

					<div class="flex flex-wrap gap-1.5 text-xs font-semibold">
						<span class="rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-2 py-0.5 text-[11px]">
							{getAvailabilityLabel(product.availability)}
						</span>
						<span
							class={[
								'rounded-md px-2 py-0.5 text-[11px]',
								product.active ? 'bg-[#f2fbf3] text-[#1b5e20]' : 'bg-[#fff5f5] text-[#8f1010]'
							]}
						>
							{product.active ? 'Aktivan' : 'Neaktivan'}
						</span>
					</div>

					<div class="flex items-center justify-end gap-2">
						<a
							class="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#c3c8c1] bg-white px-3.5 text-xs font-bold text-[#061b0e] transition hover:bg-[#f5f3f0]"
							href={resolve('/admin/products/[id]', { id: product.id })}
						>
							<Edit3 class="size-3.5" />
							<span>Uredi</span>
						</a>
						<form
							method="POST"
							action="?/deleteProduct"
							onsubmit={(event) => {
								if (
									!confirm(
										`Trajno obrisati proizvod "${product.name}"? Ova radnja se ne može poništiti.`
									)
								) {
									event.preventDefault();
								}
							}}
						>
							<input type="hidden" name="productId" value={product.id} />
							<button
								class="grid size-9 place-items-center rounded-full border border-red-200 bg-white text-red-700 transition hover:bg-red-50 cursor-pointer"
								type="submit"
								title="Obriši"
							>
								<Trash2 class="size-3.5" />
							</button>
						</form>
					</div>
				</article>
			{/each}
		</div>

		<!-- Mobile Touch Cards (< lg) -->
		<div class="lg:hidden flex flex-col gap-3">
			{#each filteredProducts as product (product.id)}
				<article class="rounded-2xl border border-[#d6d1c8] bg-white p-4 shadow-2xs">
					<!-- Top Row: Thumbnail + Title + Price -->
					<div class="flex gap-3.5">
						{#if product.imageUrl}
							<img
								src={product.imageUrl}
								alt={product.name}
								class="size-16 rounded-xl border border-[#e3e2e0] object-cover shrink-0"
							/>
						{:else}
							<div
								class="grid size-16 place-items-center rounded-xl border border-[#e3e2e0] bg-[#f5f3f0] text-[#737973] shrink-0"
							>
								<Package class="size-7" />
							</div>
						{/if}

						<div class="min-w-0 flex-1">
							<div class="flex items-start justify-between gap-2">
								<h2 class="text-sm font-bold text-[#061b0e] line-clamp-2 leading-tight">
									{product.name}
								</h2>
								<span
									class={[
										'rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0',
										product.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
									]}
								>
									{product.active ? 'Aktivan' : 'Neaktivan'}
								</span>
							</div>

							<div class="mt-1.5 flex items-baseline gap-1.5">
								<span class="text-base font-extrabold text-[#061b0e]">
									{formatPrice(product.price)} KM
								</span>
								<span class="text-xs text-[#5b5f60]">/ {product.unit}</span>
							</div>

							<div class="mt-1 flex items-center gap-2 text-xs text-[#5b5f60]">
								<span>Zaliha: <strong class="text-[#1b1c1a]">{product.stockLabel}</strong></span>
								<span>·</span>
								<span>{getAvailabilityLabel(product.availability)}</span>
							</div>
						</div>
					</div>

					<!-- Bottom Row: Touch Action Buttons -->
					<div class="mt-3.5 flex items-center gap-2 border-t border-[#f0eee9] pt-3">
						<a
							class="flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#c3c8c1] bg-white text-xs font-bold text-[#061b0e] transition active:scale-98"
							href={resolve('/admin/products/[id]', { id: product.id })}
						>
							<Edit3 class="size-4" />
							<span>Uredi proizvod</span>
						</a>

						<form
							method="POST"
							action="?/deleteProduct"
							onsubmit={(event) => {
								if (
									!confirm(
										`Trajno obrisati proizvod "${product.name}"? Ova radnja se ne može poništiti.`
									)
								) {
									event.preventDefault();
								}
							}}
						>
							<input type="hidden" name="productId" value={product.id} />
							<button
								class="grid size-10 place-items-center rounded-xl border border-red-200 bg-white text-red-700 transition active:scale-95 cursor-pointer"
								type="submit"
								title="Obriši"
							>
								<Trash2 class="size-4" />
							</button>
						</form>
					</div>
				</article>
			{/each}
		</div>
	{:else}
		<div class="rounded-2xl border border-[#d6d1c8] bg-white px-6 py-12 text-center shadow-2xs">
			<Package class="mx-auto size-10 text-[#a3a19b]" />
			<p class="mt-3 text-base font-bold text-[#061b0e]">Nema proizvoda za ovaj prikaz</p>
			<p class="mt-1 text-xs text-[#5b5f60]">Promijenite filter ili pretragu.</p>
		</div>
	{/if}
</section>
