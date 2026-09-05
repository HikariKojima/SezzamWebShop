<script lang="ts">
	import { enhance } from '$app/forms';
	import { Banknote, Building2, CheckCircle2 } from '@lucide/svelte';

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
		customerEmail?: string;
		companyName?: string;
		companyId?: string;
		companyAddress?: string;
		paymentMethod?: 'cash_in_person' | 'bank_transfer' | string;
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
	let paymentMethod = $state<'cash_in_person' | 'bank_transfer'>('cash_in_person');
	let isSubmittingOrder = $state(false);

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
		class="w-[94vw] border-[#c3c8c1] bg-[#fbf9f6] text-[#1b1c1a] sm:max-w-[460px] flex flex-col p-0"
	>
		<Sheet.Header class="border-b border-[#e3e2e0] px-6 py-5 bg-white">
			<Sheet.Title class="text-xl font-bold text-[#061b0e]">Korpa i narudžba</Sheet.Title>
			<Sheet.Description class="text-xs leading-5 text-[#5b5f60]">
				Pregledajte odabrane materijale i dovršite narudžbu u nekoliko koraka.
			</Sheet.Description>
		</Sheet.Header>

		{#if orderResult?.success}
			<div
				class="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center overflow-y-auto"
			>
				<div
					class="grid size-16 place-items-center rounded-full bg-[#d0e9d4] text-[#1b3022] shadow-sm"
				>
					<CheckCircle2 class="size-8" />
				</div>
				<h3 class="mt-4 text-xl font-bold text-[#061b0e]">
					Narudžba #{orderResult.orderId} je zaprimljena!
				</h3>
				<p class="mt-2 text-xs leading-relaxed text-[#434843] max-w-sm">
					{orderResult.message}
				</p>

				{#if orderResult.paymentMethod === 'bank_transfer'}
					<div
						class="mt-6 w-full rounded-xl border border-[#c3c8c1] bg-white p-4 text-left text-xs"
					>
						<p class="font-bold text-[#061b0e] flex items-center gap-1.5 text-sm">
							<Building2 class="size-4 text-[#1b3022]" />
							<span>Instrukcije za virmansko plaćanje (Predračun)</span>
						</p>
						<div class="mt-3 space-y-1.5 text-[#434843]">
							<p><span class="font-semibold text-[#1b1c1a]">Primalac:</span> Sezzam d.o.o.</p>
							<p>
								<span class="font-semibold text-[#1b1c1a]">Svrha doznake:</span> Uplata po narudžbi
								#{orderResult.orderId}
							</p>
							<p>
								<span class="font-semibold text-[#1b1c1a]">Poziv na broj:</span>
								{orderResult.orderId}
							</p>
							<p class="mt-2 text-[11px] text-[#5b5f60]">
								Zvanični predračun sa svim stavkama bit će poslan na uneseni email za preduzeće.
							</p>
						</div>
					</div>
				{/if}

				<button
					class="mt-6 h-11 rounded-full bg-[#1b3022] px-8 text-sm font-semibold text-white transition hover:bg-[#061b0e]"
					onclick={() => {
						open = false;
						checkoutOpen = false;
					}}
				>
					Nastavi pregled
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
				<p class="mt-2 max-w-xs text-xs leading-5 text-[#434843]">
					Dodajte WPC decking, SPC/LVT ili zidne obloge iz ponude.
				</p>
			</div>
		{:else}
			<div class="flex-1 overflow-y-auto px-6 py-5">
				{#if !checkoutOpen}
					<div class="space-y-3">
						{#each cartProducts as item (item.productId)}
							<div class="rounded-xl border border-[#c3c8c1] bg-white p-4 shadow-sm">
								<div class="flex items-start justify-between gap-3">
									<div>
										<h4 class="font-semibold leading-snug text-[#1b1c1a] text-sm">
											{item.product.name}
										</h4>
										<div class="mt-0.5 flex items-center gap-1.5 text-xs">
											{#if item.product.originalPrice && item.product.originalPrice > item.product.price}
												<span class="text-[#8a8f8a] line-through font-medium">
													{formatPrice(item.product.originalPrice)} KM
												</span>
												<span class="font-bold text-[#ba1a1a]">
													{formatPrice(item.product.price)} KM
												</span>
											{:else}
												<span class="text-[#5b5f60]">
													{formatPrice(item.product.price)} KM
												</span>
											{/if}
											<span class="text-[#5b5f60]">/ {item.product.unit}</span>
										</div>
									</div>
									<button
										class="rounded-full px-2 py-1 text-xs font-semibold text-[#5b5f60] transition hover:bg-[#efeeeb] hover:text-[#ba1a1a]"
										aria-label={`Ukloni ${item.product.name} iz korpe`}
										onclick={() => onRemove(item.productId)}
									>
										Ukloni
									</button>
								</div>

								<div
									class="mt-3 flex items-center justify-between gap-4 border-t border-[#f5f3f0] pt-3"
								>
									<div
										class="grid h-9 grid-cols-[2rem_1.75rem_2rem] items-center rounded-full border border-[#c3c8c1] bg-[#fbf9f6] text-[#061b0e]"
									>
										<button
											class="grid size-8 place-items-center rounded-full text-base transition hover:bg-[#efeeeb]"
											aria-label={`Smanji količinu za ${item.product.name}`}
											onclick={() => onDecrease(item.productId)}
										>
											-
										</button>
										<span class="text-center text-xs font-bold">{item.quantity}</span>
										<button
											class="grid size-8 place-items-center rounded-full text-base transition hover:bg-[#d0e9d4] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
											aria-label={`Povećaj količinu za ${item.product.name}`}
											onclick={() => onIncrease(item.productId)}
											disabled={item.product.availability !== 'by-order' &&
												item.quantity >= item.product.stockQuantity}
										>
											+
										</button>
									</div>
									<p class="text-sm font-bold text-[#061b0e]">
										{formatPrice(item.product.price * item.quantity)} KM
									</p>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<!-- Checkout Step with Payment Selection -->
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<span class="text-xs font-semibold uppercase tracking-wider text-[#5b5f60]"
								>Podaci za narudžbu</span
							>
							<button
								type="button"
								class="text-xs font-semibold text-[#1b3022] underline hover:text-[#061b0e]"
								onclick={() => (checkoutOpen = false)}
							>
								← Nazad na stavke
							</button>
						</div>

						<!-- Payment Method Selection -->
						<div class="grid grid-cols-2 gap-2 rounded-xl border border-[#c3c8c1] bg-white p-1.5">
							<button
								type="button"
								class={[
									'flex flex-col items-center justify-center rounded-lg p-2.5 text-xs font-semibold transition',
									paymentMethod === 'cash_in_person'
										? 'bg-[#1b3022] text-white shadow-sm'
										: 'text-[#434843] hover:bg-[#f5f3f0]'
								]}
								onclick={() => (paymentMethod = 'cash_in_person')}
							>
								<Banknote class="size-4 mb-1" />
								<span>Gotovina / Pouzeće</span>
							</button>

							<button
								type="button"
								class={[
									'flex flex-col items-center justify-center rounded-lg p-2.5 text-xs font-semibold transition',
									paymentMethod === 'bank_transfer'
										? 'bg-[#1b3022] text-white shadow-sm'
										: 'text-[#434843] hover:bg-[#f5f3f0]'
								]}
								onclick={() => (paymentMethod = 'bank_transfer')}
							>
								<Building2 class="size-4 mb-1" />
								<span>Žiro račun (Predračun)</span>
							</button>
						</div>

						<form
							id="order-checkout-form"
							method="POST"
							action="?/submitOrder"
							class="grid gap-3"
							use:enhance={() => {
								isSubmittingOrder = true;
								return async ({ update }) => {
									try {
										await update();
									} finally {
										isSubmittingOrder = false;
									}
								};
							}}
						>
							<input type="hidden" name="cartItems" value={cartItemsJson} />
							<input type="hidden" name="paymentMethod" value={paymentMethod} />

							{#if paymentMethod === 'bank_transfer'}
								<!-- Company specific fields -->
								<div
									class="rounded-lg border border-[#d0e9d4] bg-[#f2fbf3] p-3 text-xs text-[#1b3022]"
								>
									<p class="font-semibold">Virmansko plaćanje za pravna lica</p>
									<p class="mt-0.5 text-[11px] text-[#2a4d33]">
										Unesite podatke firme za automatsko izdavanje predračuna.
									</p>
								</div>

								<label class="grid gap-1 text-xs font-medium text-[#434843]">
									<span>Naziv firme / obrta *</span>
									<input
										class="h-10 rounded-lg border border-[#c3c8c1] bg-[#fbf9f6] px-3 text-sm text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white"
										name="companyName"
										placeholder="npr. Bau Gradnja d.o.o."
										required
									/>
								</label>

								<div class="grid grid-cols-2 gap-2">
									<label class="grid gap-1 text-xs font-medium text-[#434843]">
										<span>ID / JIB broj *</span>
										<input
											class="h-10 rounded-lg border border-[#c3c8c1] bg-[#fbf9f6] px-3 text-sm text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white"
											name="companyId"
											placeholder="13 cifara ili PIB"
											required
										/>
									</label>

									<label class="grid gap-1 text-xs font-medium text-[#434843]">
										<span>Email za predračun *</span>
										<input
											class="h-10 rounded-lg border border-[#c3c8c1] bg-[#fbf9f6] px-3 text-sm text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white"
											type="email"
											name="customerEmail"
											placeholder="racunovodstvo@firma.ba"
											required
										/>
									</label>
								</div>

								<label class="grid gap-1 text-xs font-medium text-[#434843]">
									<span>Adresa sjedišta firme *</span>
									<input
										class="h-10 rounded-lg border border-[#c3c8c1] bg-[#fbf9f6] px-3 text-sm text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white"
										name="companyAddress"
										placeholder="Ulica i broj, Grad"
										required
									/>
								</label>
							{/if}

							<!-- Contact person fields -->
							<label class="grid gap-1 text-xs font-medium text-[#434843]">
								<span
									>{paymentMethod === 'bank_transfer' ? 'Kontakt osoba *' : 'Ime i prezime *'}</span
								>
								<input
									class="h-10 rounded-lg border border-[#c3c8c1] bg-[#fbf9f6] px-3 text-sm text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white"
									name="customerName"
									value={orderResult?.customerName ?? ''}
									placeholder="npr. Marko Marković"
									required
									autocomplete="name"
								/>
							</label>

							<label class="grid gap-1 text-xs font-medium text-[#434843]">
								<span>Broj telefona za potvrdu *</span>
								<input
									class="h-10 rounded-lg border border-[#c3c8c1] bg-[#fbf9f6] px-3 text-sm text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white"
									type="tel"
									name="customerPhone"
									value={orderResult?.customerPhone ?? ''}
									required
									inputmode="tel"
									pattern={bosnianPhonePattern}
									placeholder="061 000 000"
									autocomplete="tel"
								/>
								<span class="text-[11px] font-normal text-[#5b5f60]">
									Primjer: 061 000 000 ili +387 61 000 000
								</span>
							</label>

							<label class="grid gap-1 text-xs font-medium text-[#434843]">
								<span>Napomena za narudžbu (opciono)</span>
								<input
									class="h-10 rounded-lg border border-[#c3c8c1] bg-[#fbf9f6] px-3 text-sm text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white"
									name="orderNote"
									placeholder="npr. Preuzimanje u skladištu sutra u 10h"
								/>
							</label>
						</form>
					</div>
				{/if}
			</div>

			<Sheet.Footer class="border-t border-[#e3e2e0] bg-white px-6 py-5">
				<div class="flex items-center justify-between text-base font-bold text-[#061b0e]">
					<span>Ukupan iznos</span>
					<span>{formatPrice(subtotal)} KM</span>
				</div>

				{#if orderResult?.error}
					<p
						class="mt-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700 font-medium"
					>
						{orderResult.error}
					</p>
				{/if}

				{#if checkoutOpen}
					<button
						type="submit"
						form="order-checkout-form"
						disabled={isSubmittingOrder}
						class="mt-4 h-12 w-full rounded-full bg-[#1b3022] text-sm font-semibold text-white shadow-md transition hover:bg-[#061b0e] disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isSubmittingOrder
							? 'Slanje narudžbe…'
							: paymentMethod === 'bank_transfer'
								? 'Generiši predračun'
								: 'Potvrdi i pošalji narudžbu'}
					</button>
				{:else}
					<button
						class="mt-4 h-12 w-full rounded-full bg-[#1b3022] text-sm font-semibold text-white shadow-md transition hover:bg-[#061b0e] active:scale-98"
						onclick={() => (checkoutOpen = true)}
					>
						Nastavi na unos podataka →
					</button>
				{/if}
			</Sheet.Footer>
		{/if}
	</Sheet.Content>
</Sheet.Root>
