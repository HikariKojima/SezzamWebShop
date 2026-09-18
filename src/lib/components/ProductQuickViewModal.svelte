<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import {
		Calculator,
		ChevronLeft,
		ChevronRight,
		Layers,
		Phone,
		ShoppingBag
	} from '@lucide/svelte';
	import type { Product } from '$lib/types/product';

	let {
		open = $bindable(false),
		product = null,
		quantity = 0,
		onAdd,
		onIncrease,
		onDecrease,
		onOpenCalculator
	}: {
		open: boolean;
		product: Product | null;
		quantity: number;
		onAdd: (productId: string) => void;
		onIncrease: (productId: string) => void;
		onDecrease: (productId: string) => void;
		onOpenCalculator?: (product: Product) => void;
	} = $props();

	type ModalSlide =
		{ type: 'split'; leftUrl: string; rightUrl: string } | { type: 'image'; url: string };

	let selectedSlideIndex = $state(0);

	let slides = $derived.by<ModalSlide[]>(() => {
		if (!product) return [];

		const rawImages =
			product.images && product.images.length > 0
				? product.images
				: product.imageUrl
					? [product.imageUrl]
					: [];

		const result: ModalSlide[] = [];

		if (product.hasDualSide) {
			const left = rawImages[0] || '/images/showcase/texture-3d-wood.jpg';
			const right = rawImages[1] || '/images/showcase/texture-grooved.jpg';
			result.push({ type: 'split', leftUrl: left, rightUrl: right });
		}

		for (const url of rawImages) {
			result.push({ type: 'image', url });
		}

		return result;
	});

	$effect(() => {
		if (open) {
			selectedSlideIndex = 0;
		}
	});

	function nextSlide() {
		if (slides.length <= 1) return;
		selectedSlideIndex = (selectedSlideIndex + 1) % slides.length;
	}

	function prevSlide() {
		if (slides.length <= 1) return;
		selectedSlideIndex = (selectedSlideIndex - 1 + slides.length) % slides.length;
	}

	function formatPrice(price: number) {
		return price.toFixed(2).replace('.', ',');
	}

	let discountPercent = $derived(
		product?.originalPrice && product.originalPrice > product.price
			? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
			: null
	);

	let hasCalculator = $derived(
		product
			? product.unitType === 'm2' ||
					product.category === 'wpc' ||
					product.category === 'spc' ||
					product.category === 'lvt' ||
					product.name.toLowerCase().includes('decking') ||
					product.name.toLowerCase().includes('pod')
			: false
	);
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="fixed bottom-0 left-0 right-0 top-auto z-50 flex max-h-[94vh] w-full max-w-full translate-x-0 translate-y-0 flex-col overflow-hidden rounded-b-none rounded-t-3xl border-[#c3c8c1] bg-white p-0 shadow-2xl transition-all sm:top-1/2 sm:left-1/2 sm:right-auto sm:bottom-auto sm:w-[94vw] sm:max-w-4xl lg:max-w-5xl sm:max-h-[90vh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
	>
		<!-- Mobile sheet drag pill -->
		<div class="mx-auto mt-2.5 h-1.5 w-12 shrink-0 rounded-full bg-[#d6d1c8] sm:hidden"></div>

		{#if product}
			<div class="custom-scrollbar flex flex-1 flex-col lg:flex-row overflow-y-auto">
				<!-- Media Gallery Side (Left on Desktop) -->
				<div
					class="flex flex-col justify-between bg-[#fbf9f6] p-4 sm:p-6 lg:w-1/2 border-b lg:border-b-0 lg:border-r border-[#e3e2e0]"
				>
					<!-- Main Display Slide -->
					<div
						class="relative aspect-square w-full overflow-hidden rounded-2xl border border-[#c3c8c1] bg-[#efeeeb] shadow-inner"
					>
						{#if slides.length > 0}
							{@const currentSlide = slides[selectedSlideIndex]}

							{#if currentSlide.type === 'split'}
								<!-- Split 2-in-1 Face View -->
								<div class="relative h-full w-full flex">
									<!-- Left Half: Lice A (3D Wood) -->
									<div class="relative w-1/2 h-full overflow-hidden border-r border-white/60">
										<img
											src={currentSlide.leftUrl}
											alt="Lice A: 3D Tekstura Drveta"
											class="h-full w-full object-cover"
										/>
										<div
											class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/30 to-transparent p-2.5 text-center"
										>
											<span
												class="inline-flex items-center gap-1 rounded-full bg-emerald-700/90 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs"
											>
												🌲 Lice A: 3D Tekstura
											</span>
										</div>
									</div>

									<!-- Right Half: Lice B (Grooved Lines) -->
									<div class="relative w-1/2 h-full overflow-hidden">
										<img
											src={currentSlide.rightUrl}
											alt="Lice B: Klasične Ripne"
											class="h-full w-full object-cover"
										/>
										<div
											class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/30 to-transparent p-2.5 text-center"
										>
											<span
												class="inline-flex items-center gap-1 rounded-full bg-[#1b3022]/90 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs"
											>
												➖ Lice B: Ripne
											</span>
										</div>
									</div>

									<!-- Center divider badge -->
									<div class="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-10">
										<span
											class="rounded-full bg-[#1b3022] px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-md border border-white/30"
										>
											2-u-1 Dvostrano
										</span>
									</div>
								</div>
							{:else}
								<!-- Standard Photo -->
								<img src={currentSlide.url} alt={product.name} class="h-full w-full object-cover" />
							{/if}
						{:else}
							<div class="flex h-full w-full items-center justify-center p-6">
								<div class={`material-art w-full ${product.art}`} aria-hidden="true"></div>
							</div>
						{/if}

						<!-- Navigation arrows if multiple slides -->
						{#if slides.length > 1}
							<button
								type="button"
								onclick={prevSlide}
								class="absolute left-2.5 top-1/2 -translate-y-1/2 grid size-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/90 active:scale-95 cursor-pointer shadow-md"
								aria-label="Prethodna slika"
							>
								<ChevronLeft class="size-5" />
							</button>
							<button
								type="button"
								onclick={nextSlide}
								class="absolute right-2.5 top-1/2 -translate-y-1/2 grid size-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/90 active:scale-95 cursor-pointer shadow-md"
								aria-label="Sljedeća slika"
							>
								<ChevronRight class="size-5" />
							</button>
						{/if}

						<!-- Discount Badge -->
						{#if discountPercent}
							<div class="absolute left-3 top-3 z-10">
								<span
									class="rounded-full bg-[#ba1a1a] px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-md"
								>
									Akcija -{discountPercent}%
								</span>
							</div>
						{/if}
					</div>

					<!-- Thumbnails bar -->
					{#if slides.length > 1}
						<div class="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
							{#each slides as slide, idx (slide.type === 'split' ? 'split' : `${slide.url}-${idx}`)}
								<button
									type="button"
									onclick={() => (selectedSlideIndex = idx)}
									class="relative size-14 shrink-0 overflow-hidden rounded-xl border-2 transition cursor-pointer"
									class:border-[#1b3022]={selectedSlideIndex === idx}
									class:border-transparent={selectedSlideIndex !== idx}
								>
									{#if slide.type === 'split'}
										<div class="flex h-full w-full">
											<img src={slide.leftUrl} alt="Lice A" class="h-full w-1/2 object-cover" />
											<img src={slide.rightUrl} alt="Lice B" class="h-full w-1/2 object-cover" />
										</div>
										<span
											class="absolute inset-x-0 bottom-0 bg-[#1b3022]/90 text-[8px] font-black text-white text-center"
										>
											2-u-1
										</span>
									{:else}
										<img
											src={slide.url}
											alt={`Minijatura ${idx + 1}`}
											class="h-full w-full object-cover"
										/>
									{/if}
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Information & Purchase Details Side (Right on Desktop) -->
				<div class="flex flex-1 flex-col justify-between p-5 sm:p-7 lg:p-8">
					<div>
						<!-- Category & Tag -->
						<div class="flex items-center gap-2">
							{#if product.tag}
								<span
									class="rounded-full bg-[#1b3022]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#1b3022]"
								>
									{product.tag}
								</span>
							{/if}
							<span class="text-xs font-semibold text-[#5b5f60]">
								{product.stock}
							</span>
						</div>

						<h2 class="mt-2 text-xl sm:text-2xl font-bold text-[#061b0e]">
							{product.name}
						</h2>

						<!-- Price Display -->
						<div class="mt-3 flex items-baseline gap-2">
							{#if product.originalPrice && product.originalPrice > product.price}
								<span class="text-sm font-semibold text-[#737973] line-through">
									{formatPrice(product.originalPrice)} KM
								</span>
								<span class="text-2xl sm:text-3xl font-black text-[#ba1a1a]">
									{formatPrice(product.price)} <span class="text-lg">KM</span>
								</span>
							{:else}
								<span class="text-2xl sm:text-3xl font-bold text-[#061b0e]">
									{formatPrice(product.price)} KM
								</span>
							{/if}
							<span class="text-xs text-[#5b5f60]">/ {product.unit}</span>
						</div>

						<!-- Dual-Side Feature Callout (if active) -->
						{#if product.hasDualSide}
							<div
								class="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50/70 p-3.5 sm:p-4 text-emerald-950"
							>
								<div class="flex items-center gap-2">
									<Layers class="size-4 text-[#1b3022]" />
									<span
										class="text-xs sm:text-sm font-black text-[#1b3022] uppercase tracking-wider"
									>
										Dvostrani dizajn (Dva lica savršenstva)
									</span>
								</div>
								<p class="mt-1 text-xs text-emerald-900/90 leading-relaxed">
									Ova daska je 100% reverzibilna: posjeduje reljefnu 3D teksturu drveta s jedne
									strane i moderne ripne s druge. Prilikom montaže sami birate koje lice okrećete
									prema gore.
								</p>
							</div>
						{/if}

						<!-- Description -->
						<div class="mt-4">
							<span class="block text-xs font-bold uppercase tracking-wider text-[#737973]"
								>Opis i karakteristike:</span
							>
							<p class="mt-1 text-xs sm:text-sm leading-relaxed text-[#434843] whitespace-pre-line">
								{product.description}
							</p>
						</div>
					</div>

					<!-- Bottom Actions -->
					<div class="mt-6 pt-5 border-t border-[#e3e2e0] flex flex-col gap-3">
						{#if hasCalculator && onOpenCalculator}
							<button
								type="button"
								onclick={() => {
									open = false;
									onOpenCalculator(product);
								}}
								class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] py-2.5 text-xs font-bold text-[#1b3022] transition hover:bg-white hover:border-[#1b3022] cursor-pointer shadow-xs"
							>
								<Calculator class="size-4" />
								<span>Otvori kalkulator utroška površine (m²)</span>
							</button>
						{/if}

						<div class="flex items-center gap-3">
							{#if quantity > 0}
								<div
									class="grid h-12 grid-cols-[2.5rem_2.5rem_2.5rem] items-center rounded-full border border-[#1b3022] bg-[#fbf9f6] text-[#061b0e] shadow-sm"
								>
									<button
										class="grid size-10 place-items-center rounded-full text-lg font-medium transition hover:bg-[#efeeeb] cursor-pointer"
										onclick={() => onDecrease(product.id)}
										aria-label="Smanji količinu"
									>
										-
									</button>
									<span class="text-center text-sm font-bold">{quantity}</span>
									<button
										class="grid size-10 place-items-center rounded-full text-lg font-medium transition hover:bg-[#d0e9d4] cursor-pointer"
										onclick={() => onIncrease(product.id)}
										aria-label="Povećaj količinu"
									>
										+
									</button>
								</div>
								<button
									type="button"
									onclick={() => (open = false)}
									class="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#1b3022] px-6 text-sm font-bold text-white shadow-md transition hover:bg-[#061b0e]"
								>
									<ShoppingBag class="size-4" />
									<span>Nastavi kupovinu ({quantity} u korpi)</span>
								</button>
							{:else}
								<button
									type="button"
									onclick={() => onAdd(product.id)}
									class="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#1b3022] px-6 text-sm font-bold text-white shadow-md transition hover:bg-[#061b0e] active:scale-98 cursor-pointer"
								>
									<ShoppingBag class="size-4" />
									<span>Dodaj u korpu</span>
								</button>
							{/if}

							<a
								href="tel:+38761069798"
								class="grid size-12 place-items-center rounded-full border border-[#c3c8c1] bg-[#fbf9f6] text-[#1b1c1a] transition hover:border-[#1b3022] hover:bg-white shadow-xs shrink-0"
								title="Pozovite za savjet"
								aria-label="Pozovite za savjet"
							>
								<Phone class="size-4" />
							</a>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
