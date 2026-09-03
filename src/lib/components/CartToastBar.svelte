<script lang="ts">
	import { ShoppingBag, ArrowRight } from '@lucide/svelte';
	import { fly } from 'svelte/transition';

	let {
		cartCount,
		subtotal,
		visible = true,
		onOpenCart
	}: {
		cartCount: number;
		subtotal: number;
		visible?: boolean;
		onOpenCart: () => void;
	} = $props();

	function formatPrice(price: number) {
		return price.toFixed(2).replace('.', ',');
	}
</script>

{#if visible && cartCount > 0}
	<div
		class="fixed bottom-6 left-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 sm:bottom-8"
		transition:fly={{ y: 30, duration: 300 }}
	>
		<div
			class="flex items-center justify-between gap-3 rounded-full border border-[#1b3022] bg-[#1b3022] px-4 py-2.5 text-white shadow-[0_18px_44px_rgba(27,48,34,0.32)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_22px_50px_rgba(27,48,34,0.4)]"
		>
			<div class="flex items-center gap-3">
				<div class="relative grid size-9 place-items-center rounded-full bg-white/15">
					<ShoppingBag class="size-4.5 text-white" />
					<span
						class="absolute -right-1 -top-1 grid size-4.5 place-items-center rounded-full bg-[#d0e9d4] text-[10px] font-bold text-[#061b0e]"
					>
						{cartCount}
					</span>
				</div>
				<div class="leading-tight">
					<p class="text-xs font-semibold text-[#d0e9d4]">Dodano u korpu</p>
					<p class="text-sm font-bold tracking-tight text-white">{formatPrice(subtotal)} KM</p>
				</div>
			</div>

			<button
				onclick={onOpenCart}
				class="group flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#061b0e] shadow-sm transition hover:bg-[#efeeeb] active:scale-95 sm:text-sm"
			>
				<span>Pregledaj korpu</span>
				<ArrowRight class="size-4 transition group-hover:translate-x-0.5" />
			</button>
		</div>
	</div>
{/if}
