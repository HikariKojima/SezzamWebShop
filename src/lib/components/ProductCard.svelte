<script lang="ts">
	import { fade, fly } from 'svelte/transition';

	import type { Product } from '$lib/types/product';

	let {
		product,
		quantity,
		onAdd,
		onIncrease,
		onDecrease
	}: {
		product: Product;
		quantity: number;
		onAdd: () => void;
		onIncrease: () => void;
		onDecrease: () => void;
	} = $props();

	function formatPrice(price: number) {
		return price.toFixed(2).replace('.', ',');
	}
</script>

<article
	class="group overflow-hidden rounded-lg border border-[#c3c8c1] bg-white p-4 transition hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(27,28,26,0.08)]"
	in:fly={{ y: 10, duration: 180 }}
	out:fade={{ duration: 120 }}
>
	<div class="relative rounded-md bg-[#f5f3f0] p-5">
		<button
			class="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-white text-sm font-semibold text-[#434843] shadow-[0_12px_24px_rgba(27,28,26,0.06)]"
			aria-label={`Sačuvaj ${product.name}`}
		>
			+
		</button>
		<div class={`material-art ${product.art}`} aria-hidden="true"></div>
		<span
			class="mt-5 inline-flex rounded-md border border-[#c3c8c1] bg-white px-3 py-1 text-xs font-semibold text-[#1b1c1a]"
		>
			{product.tag}
		</span>
	</div>

	<div class="pt-5">
		<div>
			<h2 class="text-xl font-medium leading-snug text-[#1b1c1a]">{product.name}</h2>
		</div>
		<p class="mt-3 min-h-12 text-sm leading-6 text-[#434843]">{product.description}</p>
		<div class="mt-5 border-t border-[#e3e2e0] pt-5">
			<div class="flex items-end justify-between gap-4">
				<div>
					<p class="text-2xl font-semibold text-[#061b0e]">{formatPrice(product.price)} KM</p>
					<p class="mt-1 text-sm text-[#434843]">/ {product.unit}</p>
					<p class="mt-2 text-xs font-semibold uppercase text-[#5b5f60]">Zaliha: {product.stock}</p>
				</div>
				{#if quantity > 0}
					<div
						class="grid h-12 grid-cols-[2.5rem_2rem_2.5rem] items-center rounded-full border border-[#c3c8c1] bg-[#fbf9f6] text-[#061b0e]"
						aria-label={`Količina za ${product.name}`}
					>
						<button
							class="grid size-10 place-items-center rounded-full text-xl transition hover:bg-[#efeeeb]"
							aria-label={`Smanji količinu za ${product.name}`}
							onclick={onDecrease}
						>
							-
						</button>
						<span class="text-center text-sm font-semibold">{quantity}</span>
						<button
							class="grid size-10 place-items-center rounded-full text-xl transition hover:bg-[#d0e9d4]"
							aria-label={`Povećaj količinu za ${product.name}`}
							onclick={onIncrease}
						>
							+
						</button>
					</div>
				{:else}
					<button
						class="grid size-12 place-items-center rounded-full border border-[#c3c8c1] bg-[#fbf9f6] text-2xl leading-none text-[#061b0e] transition hover:border-[#1b3022] hover:bg-[#d0e9d4]"
						aria-label={`Dodaj ${product.name} u korpu`}
						onclick={onAdd}
					>
						+
					</button>
				{/if}
			</div>
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
