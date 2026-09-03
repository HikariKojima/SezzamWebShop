<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { SubmitFunction } from '@sveltejs/kit';

	import { getOrderStatusLabel, orderStatusOptions } from '$lib/adminOptions';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { PhoneCall } from '@lucide/svelte';
	import type { ActionData, PageData } from './$types';

	type PendingStatusChange = {
		orderId: number;
		status: 'completed' | 'cancelled';
	};

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let confirmationOpen = $state(false);
	let pendingStatusChange = $state<PendingStatusChange | null>(null);
	let submittingOrderIds = $state<number[]>([]);

	const filterOptions = [{ value: 'all', label: 'Sve' }, ...orderStatusOptions];
	let confirmationTitle = $derived(
		pendingStatusChange?.status === 'completed' ? 'Završiti narudžbu?' : 'Otkazati narudžbu?'
	);
	let confirmationDescription = $derived(
		pendingStatusChange?.status === 'completed'
			? 'Proizvodi će biti oduzeti sa fizičke zalihe. Ova promjena se ne može poništiti.'
			: 'Rezervisana količina bit će vraćena u dostupnu zalihu. Ova promjena se ne može poništiti.'
	);

	function formatPrice(value: number) {
		return value.toFixed(2).replace('.', ',');
	}

	function formatDate(value: Date | string) {
		return new Intl.DateTimeFormat('bs-BA', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(value));
	}

	function isSubmitting(orderId: number) {
		return submittingOrderIds.includes(orderId);
	}

	function enhanceStatusUpdate(orderId: number): SubmitFunction {
		return () => {
			submittingOrderIds = [...submittingOrderIds, orderId];

			return async ({ update }) => {
				try {
					await update();
				} finally {
					submittingOrderIds = submittingOrderIds.filter((id) => id !== orderId);
					if (pendingStatusChange?.orderId === orderId) {
						confirmationOpen = false;
						pendingStatusChange = null;
					}
				}
			};
		};
	}

	function changeStatus(event: Event, orderId: number, currentStatus: string) {
		const select = event.currentTarget as HTMLSelectElement;
		const status = select.value;

		if (status === 'completed' || status === 'cancelled') {
			pendingStatusChange = { orderId, status };
			confirmationOpen = true;
			select.value = currentStatus;
			return;
		}

		select.form?.requestSubmit();
	}

	function cancelConfirmation() {
		confirmationOpen = false;
		pendingStatusChange = null;
	}
</script>

<svelte:head>
	<title>Narudžbe | Sezzam admin</title>
</svelte:head>

<section>
	<p class="text-sm font-semibold uppercase text-[#5b5f60]">Narudžbe</p>
	<h1 class="mt-1 text-3xl font-semibold text-[#061b0e]">Pregled narudžbi</h1>
	<p class="mt-3 max-w-2xl text-sm leading-6 text-[#434843]">
		Filtrirajte narudžbe po statusu i ažurirajte ih dok ih vlasnik obrađuje.
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

<nav
	class="mt-5 flex items-center gap-1.5 overflow-x-auto pb-1"
	aria-label="Filter statusa narudžbi"
>
	{#each filterOptions as option (option.value)}
		<a
			class={[
				'h-9 shrink-0 rounded-full px-4 text-xs font-bold transition flex items-center justify-center cursor-pointer',
				data.statusFilter === option.value
					? 'bg-[#1b3022] text-white shadow-xs'
					: 'border border-[#c3c8c1] bg-white text-[#434843] hover:bg-[#f5f3f0]'
			]}
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

<section class="mt-5 space-y-4">
	{#if data.orders.length > 0}
		{#each data.orders as order (order.id)}
			<article class="rounded-2xl border border-[#d6d1c8] bg-white p-4 sm:p-5 shadow-2xs">
				<div class="grid gap-3 lg:grid-cols-[1fr_auto]">
					<div>
						<div class="flex flex-wrap items-center gap-2">
							<p class="text-xs font-bold text-[#5b5f60]">
								Narudžba #{order.id} · {formatDate(order.createdAt)}
							</p>
							{#if order.paymentMethod === 'bank_transfer'}
								<span
									class="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-800"
								>
									Žiro račun (Firma)
								</span>
							{:else}
								<span
									class="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800"
								>
									Gotovina / Preuzimanje
								</span>
							{/if}
						</div>

						<h2 class="mt-1.5 text-lg sm:text-xl font-bold text-[#061b0e]">{order.customerName}</h2>
						<a
							class="mt-1 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1b3022] hover:underline"
							href={`tel:${order.customerPhone}`}
						>
							<PhoneCall class="size-3.5 text-[#1b3022]" />
							<span>{order.customerPhone}</span>
						</a>

						{#if order.companyName}
							<div class="mt-3 rounded-md bg-[#f5f3f0] p-3 text-xs text-[#434843] space-y-1">
								<p><span class="font-bold text-[#1b1c1a]">Firma:</span> {order.companyName}</p>
								{#if order.companyId}
									<p><span class="font-bold text-[#1b1c1a]">ID/JIB:</span> {order.companyId}</p>
								{/if}
								{#if order.companyAddress}
									<p>
										<span class="font-bold text-[#1b1c1a]">Sjedište:</span>
										{order.companyAddress}
									</p>
								{/if}
								{#if order.customerEmail}
									<p>
										<span class="font-bold text-[#1b1c1a]">Email za predračun:</span>
										<a href={`mailto:${order.customerEmail}`} class="text-blue-700 underline"
											>{order.customerEmail}</a
										>
									</p>
								{/if}
							</div>
						{/if}

						{#if order.orderNote}
							<p
								class="mt-2 text-xs italic text-[#5b5f60] bg-amber-50 border border-amber-200 rounded p-2"
							>
								<span class="font-bold not-italic text-amber-900">Napomena:</span>
								{order.orderNote}
							</p>
						{/if}
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
						Stavke narudžbe ({order.items.length})
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
					class="mt-4 flex flex-wrap items-center gap-3 border-t border-[#f0eee9] pt-3"
					use:enhance={enhanceStatusUpdate(order.id)}
				>
					<input type="hidden" name="orderId" value={order.id} />
					<label class="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1b1c1a]">
						Promijeni status:
						<select
							class="h-10 rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3 text-xs sm:text-sm font-bold outline-none transition focus:border-[#1b3022] focus:bg-white disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
							name="status"
							disabled={order.status === 'completed' ||
								order.status === 'cancelled' ||
								isSubmitting(order.id)}
							aria-label={`Status narudžbe #${order.id}`}
							aria-busy={isSubmitting(order.id)}
							onchange={(event) => changeStatus(event, order.id, order.status)}
						>
							{#each orderStatusOptions as option (option.value)}
								<option value={option.value} selected={order.status === option.value}
									>{option.label}</option
								>
							{/each}
						</select>
					</label>
					{#if isSubmitting(order.id)}
						<span class="text-xs font-medium text-[#5b5f60]">Spremanje…</span>
					{/if}
				</form>
			</article>
		{/each}
	{:else}
		<div class="rounded-lg border border-[#d6d1c8] bg-white px-6 py-12 text-center">
			<p class="text-lg font-semibold text-[#061b0e]">Nema narudžbi za ovaj status</p>
			<p class="mt-2 text-sm text-[#5b5f60]">Promijenite filter statusa.</p>
		</div>
	{/if}
</section>

<Dialog.Root bind:open={confirmationOpen}>
	<Dialog.Content
		class="border-[#d6d1c8] bg-white text-[#1b1c1a]"
		showCloseButton={!pendingStatusChange || !isSubmitting(pendingStatusChange.orderId)}
	>
		<Dialog.Header>
			<Dialog.Title class="text-xl font-semibold text-[#061b0e]">{confirmationTitle}</Dialog.Title>
			<Dialog.Description class="leading-6 text-[#434843]"
				>{confirmationDescription}</Dialog.Description
			>
		</Dialog.Header>
		{#if pendingStatusChange}
			<Dialog.Footer class="mt-2 gap-2 sm:justify-end">
				<button
					class="rounded-full border border-[#c3c8c1] bg-white px-4 py-2 text-sm font-semibold text-[#061b0e] transition hover:bg-[#f5f3f0]"
					type="button"
					disabled={isSubmitting(pendingStatusChange.orderId)}
					onclick={cancelConfirmation}
				>
					Odustani
				</button>
				<form
					method="POST"
					action="?/updateOrderStatus"
					use:enhance={enhanceStatusUpdate(pendingStatusChange.orderId)}
				>
					<input type="hidden" name="orderId" value={pendingStatusChange.orderId} />
					<input type="hidden" name="status" value={pendingStatusChange.status} />
					<button
						class="rounded-full bg-[#1b3022] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#061b0e] disabled:cursor-not-allowed disabled:opacity-50"
						disabled={isSubmitting(pendingStatusChange.orderId)}
					>
						{isSubmitting(pendingStatusChange.orderId) ? 'Spremanje…' : 'Potvrdi promjenu'}
					</button>
				</form>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>
