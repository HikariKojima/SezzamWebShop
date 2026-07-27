<script lang="ts">
	import { resolve } from '$app/paths';

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

<section class="flex flex-wrap items-end justify-between gap-4">
	<div>
		<p class="text-sm font-semibold uppercase text-[#5b5f60]">Katalog</p>
		<h1 class="mt-1 text-3xl font-semibold text-[#061b0e]">Proizvodi</h1>
		<p class="mt-3 max-w-2xl text-sm leading-6 text-[#434843]">
			Pregled proizvoda je odvojen od forme za uredjivanje da lista ostane citljiva.
		</p>
	</div>
	<a
		class="rounded-full bg-[#1b3022] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#061b0e]"
		href={resolve('/admin/products/new')}
	>
		Dodaj proizvod
	</a>
</section>

{#if form?.message}
	<p
		class="mt-6 rounded-md border border-[#bad5bf] bg-[#f2fbf3] px-4 py-3 text-sm font-semibold text-[#1b5e20]"
	>
		{form.message}
	</p>
{/if}

{#if form?.error}
	<p
		class="mt-6 rounded-md border border-[#f1b9b9] bg-[#fff5f5] px-4 py-3 text-sm font-semibold text-[#8f1010]"
	>
		{form.error}
	</p>
{/if}

<section class="mt-6 rounded-lg border border-[#d6d1c8] bg-white p-4">
	<div class="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
		<label>
			<span class="sr-only">Pretraga proizvoda</span>
			<input
				class="h-11 w-full rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-3 text-sm outline-none focus:border-[#1b3022] focus:bg-white"
				placeholder="Pretrazi po nazivu ili ID-u"
				bind:value={searchQuery}
			/>
		</label>
		<div class="flex flex-wrap gap-2">
			{#each ['all', 'active', 'inactive'] as status (status)}
				<button
					class={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
						statusFilter === status
							? 'border-[#1b3022] bg-[#1b3022] text-white'
							: 'border-[#c3c8c1] bg-white text-[#061b0e] hover:bg-[#f5f3f0]'
					}`}
					type="button"
					onclick={() => (statusFilter = status as typeof statusFilter)}
				>
					{status === 'all' ? 'Svi' : status === 'active' ? 'Aktivni' : 'Neaktivni'}
				</button>
			{/each}
		</div>
	</div>
</section>

<section class="mt-5 overflow-hidden rounded-lg border border-[#d6d1c8] bg-white">
	{#if filteredProducts.length > 0}
		<div
			class="hidden grid-cols-[1.4fr_0.7fr_0.6fr_0.6fr_190px] gap-4 border-b border-[#e1ddd5] px-4 py-3 text-xs font-semibold uppercase text-[#5b5f60] lg:grid"
		>
			<p>Proizvod</p>
			<p>Cijena</p>
			<p>Zaliha</p>
			<p>Status</p>
			<p>Akcije</p>
		</div>
		{#each filteredProducts as product (product.id)}
			<article
				class="grid gap-4 border-b border-[#e1ddd5] px-4 py-4 last:border-b-0 lg:grid-cols-[1.4fr_0.7fr_0.6fr_0.6fr_190px] lg:items-center"
			>
				<div>
					<p class="font-semibold text-[#061b0e]">{product.name}</p>
					<p class="mt-1 text-xs text-[#5b5f60]">{product.id}</p>
				</div>
				<p class="text-sm font-semibold">{formatPrice(product.price)} KM / {product.unit}</p>
				<p class="text-sm">{product.stockLabel}</p>
				<div class="flex flex-wrap gap-2 text-xs font-semibold">
					<span class="rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-2 py-1">
						{getAvailabilityLabel(product.availability)}
					</span>
					<span
						class={`rounded-md px-2 py-1 ${product.active ? 'bg-[#f2fbf3] text-[#1b5e20]' : 'bg-[#fff5f5] text-[#8f1010]'}`}
					>
						{product.active ? 'Aktivan' : 'Neaktivan'}
					</span>
				</div>
				<div class="flex flex-wrap gap-2">
					<a
						class="rounded-full border border-[#c3c8c1] bg-white px-4 py-2 text-sm font-semibold text-[#061b0e] transition hover:bg-[#f5f3f0]"
						href={resolve('/admin/products/[id]', { id: product.id })}
					>
						Uredi
					</a>
					<form
						method="POST"
						action="?/deleteProduct"
						onsubmit={(event) => {
							if (
								!confirm(
									`Trajno obrisati proizvod "${product.name}"? Ova radnja se ne moze ponistiti.`
								)
							) {
								event.preventDefault();
							}
						}}
					>
						<input type="hidden" name="productId" value={product.id} />
						<button
							class="rounded-full border border-[#f1b9b9] bg-white px-4 py-2 text-sm font-semibold text-[#8f1010] transition hover:bg-[#fff5f5]"
							type="submit"
						>
							Obrisi
						</button>
					</form>
				</div>
			</article>
		{/each}
	{:else}
		<div class="px-6 py-12 text-center">
			<p class="text-lg font-semibold text-[#061b0e]">Nema proizvoda za ovaj prikaz</p>
			<p class="mt-2 text-sm text-[#5b5f60]">Promijenite filter ili pretragu.</p>
		</div>
	{/if}
</section>
