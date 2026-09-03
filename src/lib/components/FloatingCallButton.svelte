<!-- eslint-disable svelte/no-navigation-without-resolve -->
<script lang="ts">
	import { PhoneCall } from '@lucide/svelte';
	import { fly } from 'svelte/transition';

	let {
		phoneNumber = '+387 61 069 798',
		phoneHref = 'tel:+38761069798'
	}: {
		phoneNumber?: string;
		phoneHref?: string;
	} = $props();
</script>

<div
	class="fixed bottom-6 right-4 z-40 sm:bottom-8 sm:right-6 lg:hidden"
	transition:fly={{ y: 20, duration: 250 }}
>
	<a
		href={phoneHref}
		rel="external"
		class="flex items-center gap-2.5 rounded-full bg-[#1b3022] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(27,48,34,0.3)] transition hover:bg-[#061b0e] active:scale-95"
		aria-label={`Pozovite nas na ${phoneNumber}`}
	>
		<span class="grid size-8 place-items-center rounded-full bg-white/15">
			<PhoneCall class="size-4 animate-pulse text-white" />
		</span>
		<span class="pr-1">Pozovite nas</span>
	</a>
</div>
