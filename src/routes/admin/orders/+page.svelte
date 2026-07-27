<script lang="ts">
	import { resolve } from '$app/paths';

	import { getOrderStatusLabel, orderStatusOptions } from '$lib/adminOptions';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const filterOptions = [{ value: 'all', label: 'Sve' }, ...orderStatusOptions];

	function formatPrice(value: number) {
		return value.toFixed(2).replace('.', ',');
	}

	function formatDate(value: Date | string) {
		return new Intl.DateTimeFormat('bs-BA', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(value));
	}
</script>

<svelte:head>
	<title>Narudzbe | Sezzam admin</title>
</svelte:head>

<section>
	<p class="text-sm font-semibold uppercase text-[#5b5f60]">Narudzbe</p>
	<h1 class="mt-1 text-3xl font-semibold text-[#061b0e]">Pregled narudzbi</h1>
	<p class="mt-3 max-w-2xl text-sm leading-6 text-[#434843]">
		Filtrirajte narudzbe po statusu i azurirajte ih dok ih vlasnik obradjuje.
	</p>
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

<nav class="mt-6 flex flex-wrap gap-2" aria-label="Filter statusa narudzbi">
	{#each filterOptions as option (option.value)}
		<a
			class={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
				data.statusFilter === option.value
					? 'border-[#1b3022] bg-[#1b3022] text-white'
					: 'border-[#c3c8c1] bg-white text-[#061b0e] hover:bg-[#f5f3f0]'
			}`}
			href={resolve(
				option.value === 'all'
					? '/admin/orders'
					: (`/admin/orders?status=${option.value}` as '/admin/orders')
			)}
		>
			{option.label}
		</a>
	{/each}
</nav>

<section class="mt-6 space-y-4">
	{#if data.orders.length > 0}
		{#each data.orders as order (order.id)}
			<article class="rounded-lg border border-[#d6d1c8] bg-white p-5">
				<div class="grid gap-4 lg:grid-cols-[1fr_auto]">
					<div>
						<p class="text-sm font-semibold text-[#5b5f60]">
							Narudzba #{order.id} · {formatDate(order.createdAt)}
						</p>
						<h2 class="mt-1 text-xl font-semibold text-[#061b0e]">{order.customerName}</h2>
						<a class="mt-1 block text-sm text-[#434843]" href={`tel:${order.customerPhone}`}>
							{order.customerPhone}
						</a>
					</div>
					<div class="lg:text-right">
						<p class="text-sm text-[#5b5f60]">Ukupno</p>
						<p class="mt-1 text-2xl font-semibold text-[#061b0e]">
							{formatPrice(order.subtotal)} KM
						</p>
						<p class="mt-1 text-sm font-semibold text-[#434843]">
							{getOrderStatusLabel(order.status)}
						</p>
					</div>
				</div>

				<details class="mt-5 rounded-md border border-[#e1ddd5]">
					<summary class="cursor-pointer px-4 py-3 text-sm font-semibold text-[#061b0e]">
						Stavke narudzbe ({order.items.length})
					</summary>
					<div class="border-t border-[#e1ddd5]">
						{#each order.items as item (item.id)}
							<div
								class="grid gap-2 border-b border-[#e1ddd5] px-4 py-3 text-sm last:border-b-0 sm:grid-cols-[1fr_110px_110px]"
							>
								<div>
									<p class="font-semibold text-[#061b0e]">{item.productName}</p>
									<p class="text-[#5b5f60]">{item.productUnit}</p>
								</div>
								<p>{item.quantity} kom</p>
								<p class="font-semibold">{formatPrice(item.lineTotal)} KM</p>
							</div>
						{/each}
					</div>
				</details>

				<form
					method="POST"
					action="?/updateOrderStatus"
					class="mt-5 flex flex-wrap items-center gap-3"
				>
					<input type="hidden" name="orderId" value={order.id} />
					<label class="flex items-center gap-2 text-sm font-semibold text-[#1b1c1a]">
						Status
						<select
							class="h-10 rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-3 text-sm outline-none focus:border-[#1b3022] focus:bg-white"
							name="status"
							aria-label={`Status narudzbe #${order.id}`}
						>
							{#each orderStatusOptions as option (option.value)}
								<option value={option.value} selected={order.status === option.value}>
									{option.label}
								</option>
							{/each}
						</select>
					</label>
					<button
						class="rounded-full border border-[#c3c8c1] bg-white px-4 py-2 text-sm font-semibold text-[#061b0e] transition hover:bg-[#f5f3f0]"
						type="submit"
					>
						Azuriraj status
					</button>
				</form>
			</article>
		{/each}
	{:else}
		<div class="rounded-lg border border-[#d6d1c8] bg-white px-6 py-12 text-center">
			<p class="text-lg font-semibold text-[#061b0e]">Nema narudzbi za ovaj status</p>
			<p class="mt-2 text-sm text-[#5b5f60]">Promijenite filter statusa.</p>
		</div>
	{/if}
</section>
