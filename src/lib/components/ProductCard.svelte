<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { Calculator } from '@lucide/svelte';

	import type { Product } from '$lib/types/product';

	let {
		product,
		quantity,
		onAdd,
		onIncrease,
		onDecrease,
		onOpenCalculator
	}: {
		product: Product;
		quantity: number;
		onAdd: () => void;
		onIncrease: () => void;
		onDecrease: () => void;
		onOpenCalculator?: (product: Product) => void;
	} = $props();

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
</script>

<article
	class="group flex flex-col justify-between overflow-hidden rounded-xl border border-[#c3c8c1] bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(27,28,26,0.08)] hover:border-[#1b3022]/40"
	in:fly={{ y: 10, duration: 180 }}
	out:fade={{ duration: 120 }}
>
	<div>
		<div class="relative rounded-lg bg-[#f5f3f0] p-4 overflow-hidden">
			{#if product.imageUrl}
				<div class="h-44 w-full overflow-hidden rounded-md bg-white">
					<img
						src={product.imageUrl}
						alt={product.name}
						class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						loading="lazy"
					/>
				</div>
			{:else}
				<div class={`material-art ${product.art}`} aria-hidden="true"></div>
			{/if}
			<div class="mt-3 flex items-center justify-end gap-2">
				<span
					class={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${avail.textClass}`}
				>
					<span class={`size-1.5 rounded-full ${avail.dotClass}`}></span>
					<span>{avail.label}</span>
				</span>
			</div>
		</div>

		<div class="pt-4">
			<div class="flex items-start justify-between gap-2">
				<h2 class="text-lg font-semibold leading-snug text-[#1b1c1a] group-hover:text-[#061b0e]">
					{product.name}
				</h2>
			</div>
			<p class="mt-2 min-h-11 text-xs leading-5 text-[#434843]">{product.description}</p>
		</div>
	</div>

	<div class="mt-4 border-t border-[#e3e2e0] pt-4">
		{#if hasCalculator && onOpenCalculator}
			<div class="mb-3">
				<button
					type="button"
					onclick={() => onOpenCalculator?.(product)}
					class="inline-flex items-center gap-1.5 rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-2.5 py-1 text-[11px] font-semibold text-[#1b3022] transition hover:border-[#1b3022] hover:bg-white"
				>
					<Calculator class="size-3.5" />
					<span>Kalkulator utroška</span>
				</button>
			</div>
		{/if}

		<div class="flex items-end justify-between gap-4">
			<div>
				<p class="text-xl font-bold text-[#061b0e]">{formatPrice(product.price)} KM</p>
				<p class="text-xs text-[#5b5f60]">/ {product.unit}</p>
			</div>

			{#if quantity > 0}
				<div
					class="grid h-11 grid-cols-[2.25rem_2rem_2.25rem] items-center rounded-full border border-[#1b3022] bg-[#fbf9f6] text-[#061b0e] shadow-sm"
					aria-label={`Količina za ${product.name}`}
				>
					<button
						class="grid size-9 place-items-center rounded-full text-lg font-medium transition hover:bg-[#efeeeb]"
						aria-label={`Smanji količinu za ${product.name}`}
						onclick={onDecrease}
					>
						-
					</button>
					<span class="text-center text-sm font-bold">{quantity}</span>
					<button
						class="grid size-9 place-items-center rounded-full text-lg font-medium transition hover:bg-[#d0e9d4] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
						aria-label={`Povećaj količinu za ${product.name}`}
						onclick={onIncrease}
						disabled={product.availability !== 'by-order' && quantity >= product.stockQuantity}
					>
						+
					</button>
				</div>
			{:else}
				<button
					class="grid size-11 place-items-center rounded-full border border-[#c3c8c1] bg-[#fbf9f6] text-xl font-semibold leading-none text-[#061b0e] transition hover:border-[#1b3022] hover:bg-[#1b3022] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-[#c3c8c1] disabled:hover:bg-[#fbf9f6] active:scale-95"
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
		height: 180px;
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
