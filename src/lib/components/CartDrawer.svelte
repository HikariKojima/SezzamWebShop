<script lang="ts">
	import { enhance } from '$app/forms';

	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import type { CartItem } from '$lib/types/cart';
	import type { Product } from '$lib/types/product';

	type OrderResult = {
		success?: boolean;
		orderId?: number;
		message?: string;
		error?: string;
		customerName?: string;
		customerPhone?: string;
	} | null;

	const bosnianPhonePattern = '(\\+387|00387|0)[\\s0-9()./-]{8,16}';

	let {
		open = $bindable(false),
		cartItems,
		products,
		orderResult = null,
		onIncrease,
		onDecrease,
		onRemove
	}: {
		open: boolean;
		cartItems: CartItem[];
		products: Product[];
		orderResult?: OrderResult;
		onIncrease: (productId: string) => void;
		onDecrease: (productId: string) => void;
		onRemove: (productId: string) => void;
	} = $props();

	let checkoutOpen = $state(false);
	let cartItemsJson = $derived(JSON.stringify(cartItems));
	let cartProducts = $derived(
		cartItems
			.map((item) => {
				const product = products.find((candidate) => candidate.id === item.productId);
				return product ? { ...item, product } : null;
			})
			.filter((item) => item !== null)
	);

	let subtotal = $derived(
		cartProducts.reduce((total, item) => total + item.product.price * item.quantity, 0)
	);

	function formatPrice(price: number) {
		return price.toFixed(2).replace('.', ',');
	}
</script>

<Sheet.Root bind:open>
	<Sheet.Content
		side="right"
		class="w-[92vw] border-[#c3c8c1] bg-[#fbf9f6] text-[#1b1c1a] sm:max-w-[440px]"
	>
		<Sheet.Header class="border-b border-[#e3e2e0] px-5 py-5">
			<Sheet.Title class="text-xl font-semibold text-[#061b0e]">Korpa</Sheet.Title>
			<Sheet.Description class="text-sm leading-6 text-[#434843]">
				Pregledajte materijale prije nastavka narudžbe.
			</Sheet.Description>
		</Sheet.Header>

		{#if orderResult?.success}
			<div class="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
				<div
					class="grid size-16 place-items-center rounded-full border border-[#c3c8c1] bg-white text-[#061b0e]"
				>
					<svg
						class="size-7"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M20 6 9 17l-5-5" />
					</svg>
				</div>
				<p class="mt-5 text-base font-semibold text-[#061b0e]">
					Narudžba #{orderResult.orderId} je poslana
				</p>
				<p class="mt-2 max-w-xs text-sm leading-6 text-[#434843]">
					{orderResult.message}
				</p>
				<button
					class="mt-6 h-11 rounded-full bg-[#1b3022] px-5 text-sm font-semibold text-white transition hover:bg-[#061b0e]"
					onclick={() => (open = false)}
				>
					Zatvori
				</button>
			</div>
		{:else if cartProducts.length === 0}
			<div class="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
				<div
					class="grid size-16 place-items-center rounded-full border border-[#c3c8c1] bg-white text-[#061b0e]"
				>
					<svg
						class="size-7"
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
				</div>
				<p class="mt-5 text-base font-semibold text-[#061b0e]">Korpa je prazna</p>
				<p class="mt-2 max-w-xs text-sm leading-6 text-[#434843]">
					Dodajte cement, armaturu ili druge materijale iz kataloga.
				</p>
			</div>
		{:else}
			<div class="flex-1 overflow-y-auto px-5 py-5">
				<div class="space-y-4">
					{#each cartProducts as item (item.productId)}
						<div class="rounded-lg border border-[#c3c8c1] bg-white p-4">
							<div class="flex items-start justify-between gap-4">
								<div>
									<h3 class="font-medium leading-snug text-[#1b1c1a]">{item.product.name}</h3>
									<p class="mt-1 text-sm text-[#434843]">
										{formatPrice(item.product.price)} KM / {item.product.unit}
									</p>
								</div>
								<button
									class="rounded-full px-2 py-1 text-xs font-semibold text-[#5b5f60] transition hover:bg-[#efeeeb] hover:text-[#061b0e]"
									aria-label={`Ukloni ${item.product.name} iz korpe`}
									onclick={() => onRemove(item.productId)}
								>
									Ukloni
								</button>
							</div>

							<div class="mt-4 flex items-center justify-between gap-4">
								<div
									class="grid h-10 grid-cols-[2.25rem_2rem_2.25rem] items-center rounded-full border border-[#c3c8c1] bg-[#fbf9f6] text-[#061b0e]"
								>
									<button
										class="grid size-9 place-items-center rounded-full text-lg transition hover:bg-[#efeeeb]"
										aria-label={`Smanji količinu za ${item.product.name}`}
										onclick={() => onDecrease(item.productId)}
									>
										-
									</button>
									<span class="text-center text-sm font-semibold">{item.quantity}</span>
									<button
										class="grid size-9 place-items-center rounded-full text-lg transition hover:bg-[#d0e9d4]"
										aria-label={`Povećaj količinu za ${item.product.name}`}
										onclick={() => onIncrease(item.productId)}
									>
										+
									</button>
								</div>
								<p class="text-sm font-semibold text-[#061b0e]">
									{formatPrice(item.product.price * item.quantity)} KM
								</p>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<Sheet.Footer class="border-t border-[#e3e2e0] bg-white px-5 py-5">
				<div class="flex items-center justify-between text-base font-semibold text-[#061b0e]">
					<span>Ukupno</span>
					<span>{formatPrice(subtotal)} KM</span>
				</div>

				{#if orderResult?.error}
					<p class="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
						{orderResult.error}
					</p>
				{/if}

				{#if checkoutOpen}
					<form method="POST" action="?/submitOrder" class="mt-4 grid gap-3" use:enhance>
						<input type="hidden" name="cartItems" value={cartItemsJson} />
						<label class="grid gap-1.5 text-sm font-medium text-[#434843]">
							<span>Ime i prezime</span>
							<input
								class="h-11 rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-3 text-sm text-[#1b1c1a] outline-none transition focus:border-[#1b3022]"
								name="customerName"
								value={orderResult?.customerName ?? ''}
								required
								autocomplete="name"
							/>
						</label>
						<label class="grid gap-1.5 text-sm font-medium text-[#434843]">
							<span>Telefon</span>
							<input
								class="h-11 rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-3 text-sm text-[#1b1c1a] outline-none transition focus:border-[#1b3022]"
								type="tel"
								name="customerPhone"
								value={orderResult?.customerPhone ?? ''}
								required
								inputmode="tel"
								pattern={bosnianPhonePattern}
								placeholder="061 000 000"
								autocomplete="tel"
							/>
							<span class="text-xs font-normal text-[#5b5f60]">
								Primjer: 061 000 000 ili +387 61 000 000
							</span>
						</label>
						<button
							class="h-12 w-full rounded-full bg-[#1b3022] text-sm font-semibold text-white transition hover:bg-[#061b0e]"
						>
							Pošalji narudžbu
						</button>
					</form>
				{:else}
					<button
						class="mt-4 h-12 w-full rounded-full bg-[#1b3022] text-sm font-semibold text-white transition hover:bg-[#061b0e]"
						onclick={() => (checkoutOpen = true)}
					>
						Nastavi na narudžbu
					</button>
				{/if}
			</Sheet.Footer>
		{/if}
	</Sheet.Content>
</Sheet.Root>
