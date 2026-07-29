<script lang="ts">
	import { resolve } from '$app/paths';
	import { ArrowRight, Banknote, Boxes, CircleCheck, Clock3, ShoppingBag } from '@lucide/svelte';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const statusLabels: Record<string, string> = {
		pending: 'Nova',
		ready: 'Spremna',
		completed: 'Završena',
		cancelled: 'Otkazana'
	};

	const statusStyles: Record<string, string> = {
		pending: 'bg-amber-50 text-amber-800',
		ready: 'bg-violet-50 text-violet-800',
		completed: 'bg-emerald-50 text-emerald-800',
		cancelled: 'bg-red-50 text-red-800'
	};

	function formatMoney(valueCents: number) {
		return new Intl.NumberFormat('bs-BA', {
			style: 'currency',
			currency: 'BAM'
		}).format(valueCents / 100);
	}

	function formatDate(value: Date | string) {
		return new Intl.DateTimeFormat('bs-BA', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(value));
	}
</script>

<svelte:head>
	<title>Admin pregled | Sezzam</title>
</svelte:head>

<section class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
	<div>
		<p class="text-sm font-semibold uppercase tracking-wide text-[#5b5f60]">Pregled poslovanja</p>
		<h1 class="mt-1 text-3xl font-semibold text-[#061b0e]">Dobro došli</h1>
		<p class="mt-2 text-sm leading-6 text-[#434843]">
			Najvažnije informacije o prodaji, narudžbama i zalihama na jednom mjestu.
		</p>
	</div>
	<a
		class="inline-flex w-fit items-center gap-2 rounded-full bg-[#1b3022] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#061b0e]"
		href={resolve('/admin/orders')}
	>
		Pregledaj narudžbe <ArrowRight class="size-4" />
	</a>
</section>

<section class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
	<div class="rounded-xl border border-[#d6d1c8] bg-white p-5 shadow-sm">
		<div class="flex items-center justify-between">
			<p class="text-sm font-medium text-[#5b5f60]">Ostvareni prihod</p>
			<span class="rounded-lg bg-emerald-50 p-2 text-emerald-800"><Banknote class="size-5" /></span>
		</div>
		<p class="mt-4 text-3xl font-semibold text-[#061b0e]">{formatMoney(data.revenueCents)}</p>
		<p class="mt-2 text-xs text-[#6a6f6b]">Samo završene narudžbe</p>
	</div>

	<div class="rounded-xl border border-[#d6d1c8] bg-white p-5 shadow-sm">
		<div class="flex items-center justify-between">
			<p class="text-sm font-medium text-[#5b5f60]">Aktivne narudžbe</p>
			<span class="rounded-lg bg-amber-50 p-2 text-amber-800"><Clock3 class="size-5" /></span>
		</div>
		<p class="mt-4 text-3xl font-semibold text-[#061b0e]">
			{data.statusCounts.pending + data.statusCounts.ready}
		</p>
		<p class="mt-2 text-xs text-[#6a6f6b]">Vrijednost {formatMoney(data.activeOrderValueCents)}</p>
	</div>

	<div class="rounded-xl border border-[#d6d1c8] bg-white p-5 shadow-sm">
		<div class="flex items-center justify-between">
			<p class="text-sm font-medium text-[#5b5f60]">Prosječna narudžba</p>
			<span class="rounded-lg bg-blue-50 p-2 text-blue-800"><ShoppingBag class="size-5" /></span>
		</div>
		<p class="mt-4 text-3xl font-semibold text-[#061b0e]">{formatMoney(data.averageOrderCents)}</p>
		<p class="mt-2 text-xs text-[#6a6f6b]">Na osnovu završenih narudžbi</p>
	</div>

	<div class="rounded-xl border border-[#d6d1c8] bg-white p-5 shadow-sm">
		<div class="flex items-center justify-between">
			<p class="text-sm font-medium text-[#5b5f60]">Aktivni proizvodi</p>
			<span class="rounded-lg bg-[#edf2ed] p-2 text-[#1b3022]"><Boxes class="size-5" /></span>
		</div>
		<p class="mt-4 text-3xl font-semibold text-[#061b0e]">{data.activeProducts}</p>
		<p class="mt-2 text-xs text-[#6a6f6b]">{data.inactiveProducts} neaktivnih proizvoda</p>
	</div>
</section>

<section class="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
	<div class="rounded-xl border border-[#d6d1c8] bg-white shadow-sm">
		<div class="flex items-center justify-between border-b border-[#e5e1da] px-5 py-4">
			<div>
				<h2 class="font-semibold text-[#061b0e]">Posljednje narudžbe</h2>
				<p class="mt-1 text-xs text-[#6a6f6b]">Ukupno {data.totalOrders} narudžbi</p>
			</div>
			<a
				class="text-sm font-semibold text-[#1b3022] hover:underline"
				href={resolve('/admin/orders')}>Sve narudžbe</a
			>
		</div>

		{#if data.recentOrders.length > 0}
			<div class="divide-y divide-[#ebe7e0]">
				{#each data.recentOrders as order (order.id)}
					<a
						class="grid gap-2 px-5 py-4 transition hover:bg-[#fbf9f6] sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-5"
						href={resolve('/admin/orders')}
					>
						<div>
							<p class="font-semibold text-[#061b0e]">Narudžba #{order.id}</p>
							<p class="mt-1 text-xs text-[#6a6f6b]">
								{order.customerName} · {formatDate(order.createdAt)}
							</p>
						</div>
						<span
							class={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[order.status] ?? 'bg-gray-100 text-gray-700'}`}
						>
							{statusLabels[order.status] ?? order.status}
						</span>
						<p class="font-semibold text-[#061b0e] sm:text-right">
							{formatMoney(order.subtotalCents)}
						</p>
					</a>
				{/each}
			</div>
		{:else}
			<p class="px-5 py-12 text-center text-sm text-[#6a6f6b]">Još nema narudžbi.</p>
		{/if}
	</div>

	<div class="space-y-6">
		<div class="rounded-xl border border-[#d6d1c8] bg-white p-5 shadow-sm">
			<h2 class="font-semibold text-[#061b0e]">Statusi narudžbi</h2>
			<div class="mt-4 space-y-3 text-sm">
				{#each Object.entries(statusLabels) as [status, label] (status)}
					<div class="flex items-center justify-between">
						<span class="text-[#434843]">{label}</span>
						<span class="font-semibold text-[#061b0e]"
							>{data.statusCounts[status as keyof typeof data.statusCounts]}</span
						>
					</div>
				{/each}
			</div>
		</div>

		<div class="rounded-xl border border-[#d6d1c8] bg-white p-5 shadow-sm">
			<div class="flex items-center gap-2">
				<CircleCheck class="size-5 text-[#1b3022]" />
				<h2 class="font-semibold text-[#061b0e]">Niska zaliha</h2>
			</div>
			{#if data.lowStockProducts.length > 0}
				<div class="mt-4 space-y-3">
					{#each data.lowStockProducts as product (product.id)}
						<a
							class="flex items-center justify-between text-sm hover:underline"
							href={resolve('/admin/products/[id]', { id: product.id })}
						>
							<span class="text-[#434843]">{product.name}</span>
							<span class="font-semibold text-[#061b0e]">{product.availableQuantity} dostupno</span>
						</a>
					{/each}
				</div>
			{:else}
				<p class="mt-4 text-sm text-[#6a6f6b]">Sve aktivne zalihe su iznad upozorenja.</p>
			{/if}
		</div>
	</div>
</section>
