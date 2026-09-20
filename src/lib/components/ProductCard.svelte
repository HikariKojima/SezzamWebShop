<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { Calculator, ChevronLeft, ChevronRight, Layers, Eye } from '@lucide/svelte';

	import type { Product } from '$lib/types/product';

	let {
		product,
		quantity,
		onAdd,
		onIncrease,
		onDecrease,
		onOpenCalculator,
		onOpenQuickView
	}: {
		product: Product;
		quantity: number;
		onAdd: () => void;
		onIncrease: () => void;
		onDecrease: () => void;
		onOpenCalculator?: (product: Product) => void;
		onOpenQuickView?: (product: Product) => void;
	} = $props();

	type CardSlide =
		{ type: 'split'; leftUrl: string; rightUrl: string } | { type: 'image'; url: string };

	let currentSlide = $state(0);
	let isHovered = $state(false);
	let isVisibleOnScreen = $state(false);
	let cardElement: HTMLElement | null = $state(null);

	// Touch tracking for swipe
	let touchStartX = 0;
	let touchEndX = 0;

	let slides = $derived.by<CardSlide[]>(() => {
		const rawImages =
			product.images && product.images.length > 0
				? product.images
				: product.imageUrl
					? [product.imageUrl]
					: [];

		const result: CardSlide[] = [];

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

	function formatPrice(price: number) {
		return price.toFixed(2).replace('.', ',');
	}

	function getAvailabilityInfo(prod: Product) {
		if (prod.availability === 'in-stock') {
			return {
				label: 'Dostupno odmah',
				dotClass: 'bg-emerald-500',
				textClass: 'text-emerald-800 bg-emerald-50 border-emerald-200'
			};
		}
		if (prod.availability === 'low-stock') {
			return {
				label: 'Niska zaliha',
				dotClass: 'bg-amber-500',
				textClass: 'text-amber-800 bg-amber-50 border-amber-200'
			};
		}
		if (prod.availability === 'by-order') {
			return {
				label: 'Po narudžbi',
				dotClass: 'bg-sky-500',
				textClass: 'text-sky-800 bg-sky-50 border-sky-200'
			};
		}
		return {
			label: 'Trenutno rasprodano',
			dotClass: 'bg-rose-500',
			textClass: 'text-rose-800 bg-rose-50 border-rose-200'
		};
	}

	let avail = $derived(getAvailabilityInfo(product));
	let discountPercent = $derived(
		product.originalPrice && product.originalPrice > product.price
			? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
			: null
	);
	let hasCalculator = $derived(
		product.unitType === 'm2' ||
			product.category === 'wpc' ||
			product.category === 'spc' ||
			product.category === 'lvt' ||
			product.category === 'tekstilne-ploce' ||
			product.name.toLowerCase().includes('decking') ||
			product.name.toLowerCase().includes('pod') ||
			product.name.toLowerCase().includes('ploce')
	);

	function nextSlide(e?: Event) {
		if (e) e.stopPropagation();
		if (slides.length <= 1) return;
		currentSlide = (currentSlide + 1) % slides.length;
	}

	function prevSlide(e?: Event) {
		if (e) e.stopPropagation();
		if (slides.length <= 1) return;
		currentSlide = (currentSlide - 1 + slides.length) % slides.length;
	}

	function goToSlide(index: number, e?: Event) {
		if (e) e.stopPropagation();
		currentSlide = index;
	}

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.changedTouches[0].screenX;
	}

	function handleTouchEnd(e: TouchEvent) {
		touchEndX = e.changedTouches[0].screenX;
		const diff = touchStartX - touchEndX;
		if (Math.abs(diff) > 40) {
			if (diff > 0) {
				nextSlide();
			} else {
				prevSlide();
			}
		}
	}

	// Performance-optimized Auto-Slideshow: ONLY active when card is visible in viewport!
	onMount(() => {
		if (!cardElement) return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					isVisibleOnScreen = entry.isIntersecting;
				}
			},
			{ threshold: 0.2 }
		);

		observer.observe(cardElement);

		const interval = setInterval(() => {
			if (slides.length > 1 && isVisibleOnScreen && !isHovered) {
				currentSlide = (currentSlide + 1) % slides.length;
			}
		}, 3600);

		return () => {
			observer.disconnect();
			clearInterval(interval);
		};
	});
</script>

<article
	bind:this={cardElement}
	class="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-[#c3c8c1] bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(27,28,26,0.08)] hover:border-[#1b3022]/40"
	in:fly={{ y: 10, duration: 180 }}
	out:fade={{ duration: 120 }}
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
>
	<div class="flex flex-1 flex-col">
		<!-- Full-width Image Area with Carousel & Overlapped Badges -->
		<div
			class="relative aspect-4/3 w-full overflow-hidden bg-[#f5f3f0] cursor-pointer select-none"
			role="button"
			tabindex="0"
			onclick={() => onOpenQuickView?.(product)}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					onOpenQuickView?.(product);
				}
			}}
			ontouchstart={handleTouchStart}
			ontouchend={handleTouchEnd}
		>
			<!-- Top Left: Action Discount Badge -->
			{#if discountPercent}
				<div class="absolute left-3 top-3 z-20">
					<span
						class="inline-flex items-center gap-1 rounded-full bg-[#ba1a1a] px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-md"
					>
						<span>Akcija -{discountPercent}%</span>
					</span>
				</div>
			{/if}

			<!-- Top Right: Product Tag / 2-u-1 Badge -->
			<div class="absolute right-3 top-3 z-20 flex flex-col items-end gap-1.5">
				{#if product.tag}
					<span
						class="inline-flex items-center rounded-full bg-[#1b3022]/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-xs"
					>
						{product.tag}
					</span>
				{/if}

				{#if product.hasDualSide}
					<span
						class="inline-flex items-center gap-1 rounded-full bg-emerald-800/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs border border-white/20"
					>
						<Layers class="size-2.5" />
						<span>2-u-1 Lice</span>
					</span>
				{/if}
			</div>

			<!-- Carousel Slides -->
			{#if slides.length > 0}
				{@const activeSlide = slides[currentSlide]}

				{#if activeSlide.type === 'split'}
					<!-- Split 2-in-1 Dual Face Display (50% left / 50% right) -->
					<div class="relative h-full w-full flex overflow-hidden">
						<!-- Left Side: Lice A (3D Wood) -->
						<div class="relative w-1/2 h-full overflow-hidden border-r border-white/60">
							<img
								src={activeSlide.leftUrl}
								alt={`${product.name} - Lice A`}
								class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
								loading="lazy"
							/>
							<div
								class="absolute inset-x-0 bottom-8 bg-linear-to-t from-black/80 via-black/30 to-transparent p-1.5 text-center"
							>
								<span
									class="inline-flex items-center rounded-full bg-emerald-800/90 px-1.5 py-0.5 text-[9px] font-black text-white shadow-xs"
								>
									🌲 3D Godovi
								</span>
							</div>
						</div>

						<!-- Right Side: Lice B (Grooved Lines) -->
						<div class="relative w-1/2 h-full overflow-hidden">
							<img
								src={activeSlide.rightUrl}
								alt={`${product.name} - Lice B`}
								class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
								loading="lazy"
							/>
							<div
								class="absolute inset-x-0 bottom-8 bg-linear-to-t from-black/80 via-black/30 to-transparent p-1.5 text-center"
							>
								<span
									class="inline-flex items-center rounded-full bg-[#1b3022]/90 px-1.5 py-0.5 text-[9px] font-black text-white shadow-xs"
								>
									➖ Ripne
								</span>
							</div>
						</div>

						<!-- Center Split Pill -->
						<div
							class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
						>
							<span
								class="rounded-full bg-[#1b3022]/90 px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-md backdrop-blur-xs border border-white/30"
							>
								2-u-1
							</span>
						</div>
					</div>
				{:else}
					<!-- Standard Slide Image -->
					<img
						src={activeSlide.url}
						alt={product.name}
						class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
						loading="lazy"
					/>
				{/if}
			{:else}
				<div class="flex h-full w-full items-center justify-center p-3">
					<div class={`material-art w-full ${product.art}`} aria-hidden="true"></div>
				</div>
			{/if}

			<!-- Quick-view hover icon overlay -->
			<div
				class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
			>
				<span
					class="inline-flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm shadow-md"
				>
					<Eye class="size-3.5" />
					<span>Uvećaj / Detalji</span>
				</span>
			</div>

			<!-- Prev / Next navigation arrows -->
			{#if slides.length > 1}
				<button
					type="button"
					onclick={prevSlide}
					class="absolute left-2 top-1/2 -translate-y-1/2 z-20 grid size-8 place-items-center rounded-full bg-white/85 text-[#1b1c1a] shadow-md backdrop-blur-xs opacity-0 transition group-hover:opacity-100 hover:bg-white active:scale-95 cursor-pointer"
					aria-label="Prethodna slika"
				>
					<ChevronLeft class="size-4" />
				</button>
				<button
					type="button"
					onclick={nextSlide}
					class="absolute right-2 top-1/2 -translate-y-1/2 z-20 grid size-8 place-items-center rounded-full bg-white/85 text-[#1b1c1a] shadow-md backdrop-blur-xs opacity-0 transition group-hover:opacity-100 hover:bg-white active:scale-95 cursor-pointer"
					aria-label="Sljedeća slika"
				>
					<ChevronRight class="size-4" />
				</button>
			{/if}

			<!-- Overlapped availability badge -->
			<div class="absolute bottom-2.5 right-2.5 z-20">
				<span
					class={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold shadow-xs backdrop-blur-md ${avail.textClass}`}
				>
					<span class={`size-1.5 rounded-full ${avail.dotClass}`}></span>
					<span>{avail.label}</span>
				</span>
			</div>

			<!-- Carousel bottom dot indicators -->
			{#if slides.length > 1}
				<div class="absolute bottom-2.5 left-3 z-20 flex items-center gap-1.5">
					{#each slides as slide, idx (slide.type === 'split' ? 'split' : `${slide.url}-${idx}`)}
						<button
							type="button"
							onclick={(e) => goToSlide(idx, e)}
							class={`h-1.5 rounded-full transition-all cursor-pointer ${
								currentSlide === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
							}`}
							aria-label={`Prikaži sliku ${idx + 1}`}
						></button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Card Content -->
		<div class="flex flex-1 flex-col justify-between p-4 sm:p-5 pb-2">
			<div>
				<h2 class="text-lg font-semibold leading-snug text-[#1b1c1a] group-hover:text-[#061b0e] line-clamp-2 min-h-[3.25rem]">
					{product.name}
				</h2>
				<p class="mt-2 min-h-11 text-xs leading-5 text-[#434843] line-clamp-2">
					{product.description}
				</p>
			</div>
		</div>
	</div>

	<div class="border-t border-[#e3e2e0] p-4 sm:p-5 pt-4">
		{#if hasCalculator && onOpenCalculator}
			<div class="mb-3">
				<button
					type="button"
					onclick={() => onOpenCalculator?.(product)}
					class="inline-flex items-center gap-1.5 rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-2.5 py-1 text-[11px] font-semibold text-[#1b3022] transition hover:border-[#1b3022] hover:bg-white cursor-pointer"
				>
					<Calculator class="size-3.5" />
					<span>Kalkulator utroška</span>
				</button>
			</div>
		{/if}

		<div class="flex items-end justify-between gap-4">
			<div>
				{#if product.originalPrice && product.originalPrice > product.price}
					<p class="text-xs font-semibold text-[#737973] line-through">
						{formatPrice(product.originalPrice)} KM
					</p>
					<p class="text-2xl font-black text-[#ba1a1a] leading-tight">
						{formatPrice(product.price)} <span class="text-lg font-bold">KM</span>
					</p>
				{:else}
					<p class="text-xl font-bold text-[#061b0e]">{formatPrice(product.price)} KM</p>
				{/if}
				<p class="text-xs text-[#5b5f60]">/ {product.unit}</p>
			</div>

			{#if quantity > 0}
				<div
					class="grid h-11 grid-cols-[2.25rem_2rem_2.25rem] items-center rounded-full border border-[#1b3022] bg-[#fbf9f6] text-[#061b0e] shadow-sm"
					aria-label={`Količina za ${product.name}`}
				>
					<button
						class="grid size-9 place-items-center rounded-full text-lg font-medium transition hover:bg-[#efeeeb] cursor-pointer"
						aria-label={`Smanji količinu za ${product.name}`}
						onclick={onDecrease}
					>
						-
					</button>
					<span class="text-center text-sm font-bold">{quantity}</span>
					<button
						class="grid size-9 place-items-center rounded-full text-lg font-medium transition hover:bg-[#d0e9d4] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent cursor-pointer"
						aria-label={`Povećaj količinu za ${product.name}`}
						onclick={onIncrease}
						disabled={product.availability !== 'by-order' && quantity >= product.stockQuantity}
					>
						+
					</button>
				</div>
			{:else}
				<button
					class="grid size-11 place-items-center rounded-full border border-[#c3c8c1] bg-[#fbf9f6] text-xl font-semibold leading-none text-[#061b0e] transition hover:border-[#1b3022] hover:bg-[#1b3022] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[#c3c8c1] disabled:hover:bg-[#fbf9f6] active:scale-95 cursor-pointer"
					aria-label={`Dodaj ${product.name} u korpu`}
					onclick={onAdd}
					disabled={product.availability !== 'by-order' && product.stockQuantity <= 0}
				>
					+
				</button>
			{/if}
		</div>
	</div>
</article>

<style>
	.material-art {
		position: relative;
		height: 100%;
		min-height: 180px;
		border-radius: 6px;
		background: #e3e2e0;
		overflow: hidden;
	}

	.material-art::before,
	.material-art::after {
		content: '';
		position: absolute;
		inset: auto;
	}

	.material-art.cement::before {
		left: 18%;
		right: 18%;
		bottom: 28%;
		height: 34%;
		border-radius: 5px;
		background:
			radial-gradient(circle at 24% 30%, rgba(255, 255, 255, 0.22) 0 1px, transparent 2px),
			radial-gradient(circle at 68% 62%, rgba(0, 0, 0, 0.18) 0 1px, transparent 2px), #545852;
		box-shadow: 0 22px 34px rgba(27, 28, 26, 0.16);
	}

	.material-art.steel::before {
		inset: 34% 18%;
		border-radius: 8px;
		background:
			linear-gradient(135deg, rgba(255, 255, 255, 0.65), transparent 44%),
			repeating-linear-gradient(90deg, #8c9290 0 24px, #c7ccca 24px 34px);
		box-shadow: 0 18px 32px rgba(27, 28, 26, 0.14);
	}

	.material-art.tile::before {
		inset: 28% 15%;
		border-radius: 4px;
		background:
			linear-gradient(135deg, rgba(255, 255, 255, 0.28), transparent),
			repeating-linear-gradient(0deg, transparent 0 30px, rgba(27, 28, 26, 0.16) 31px),
			repeating-linear-gradient(90deg, transparent 0 54px, rgba(27, 28, 26, 0.14) 55px), #bfc1bc;
		box-shadow: 0 18px 34px rgba(27, 28, 26, 0.12);
	}

	.material-art.insulation::before {
		inset: 24% 18%;
		border-radius: 5px;
		background:
			repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.35) 0 7px, transparent 7px 14px),
			#e5e0c7;
		box-shadow: 0 18px 34px rgba(27, 28, 26, 0.12);
	}
</style>
