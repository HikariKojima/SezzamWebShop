<script lang="ts">
	import { resolve } from '$app/paths';
	import { Sparkles, ArrowRight, Layers } from '@lucide/svelte';
	import type { SiteSettings } from '$lib/types/settings';

	let { settings }: { settings?: SiteSettings } = $props();

	let activeTab = $state<'split' | 'wood' | 'grooved'>('split');

	let quote = $derived(
		settings?.spotlightQuote ||
			'Dva lica savršenstva: Izaberite moderne linije za minimalistički izgled ili duboku 3D teksturu koja vjerno prenosi toplinu i ljepotu prirodnog drveta.'
	);
	let title = $derived(
		settings?.spotlightTitle || 'Dvostrani dizajn – Prilagodite terasu svom stilu'
	);
	let subtitle = $derived(
		settings?.spotlightSubtitle ||
			'Jedna daska, dva estetska rješenja. Prilikom postavljanja slobodno birate koje lice okrećete prema gore, ili ih kombinujete za unikatne bordure i prelaze.'
	);
	let terraceImage = $derived(
		settings?.spotlightImageUrl || '/images/showcase/wpc-dual-terrace.jpg'
	);
</script>

<section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-12 lg:py-10">
	<div
		class="relative overflow-hidden rounded-3xl border border-[#c3c8c1] bg-white shadow-[0_20px_60px_rgba(27,28,26,0.06)]"
	>
		<!-- Background decorative glow -->
		<div
			class="pointer-events-none absolute -top-40 -right-40 size-96 rounded-full bg-[#1b3022]/5 blur-3xl"
		></div>

		<div class="grid lg:grid-cols-12 lg:items-stretch">
			<!-- Visual Side (Left on Desktop - 7 Cols) -->
			<div
				class="relative flex flex-col justify-between overflow-hidden bg-[#1b1c1a] lg:col-span-7"
			>
				<!-- Image Container -->
				<div
					class="relative aspect-16/10 w-full lg:h-full lg:aspect-auto min-h-85 sm:min-h-105 overflow-hidden"
				>
					{#if activeTab === 'split'}
						<!-- Split View comparison -->
						<div class="relative h-full w-full">
							<img
								src={terraceImage}
								alt="Dva lica savršenstva - Sezzam WPC Decking"
								class="h-full w-full object-cover brightness-[0.92] transition-transform duration-700 hover:scale-105"
								loading="lazy"
							/>

							<!-- Split Overlay Panels (Bottom Preview Bar) -->
							<div
								class="absolute bottom-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 rounded-2xl border border-white/20 bg-[#061b0e]/85 p-3.5 backdrop-blur-md shadow-xl text-white"
							>
								<div class="flex items-center gap-3">
									<div
										class="size-10 shrink-0 overflow-hidden rounded-lg border border-white/30 shadow-inner"
									>
										<img
											src="/images/showcase/texture-3d-wood.jpg"
											alt="3D Tekstura Drveta"
											class="h-full w-full object-cover"
										/>
									</div>
									<div>
										<span
											class="block text-[11px] font-black uppercase tracking-wider text-emerald-300"
											>Lice A</span
										>
										<span class="text-xs sm:text-sm font-bold">3D Reljefna Tekstura Drveta</span>
									</div>
								</div>

								<div class="hidden sm:block h-8 w-px bg-white/20"></div>

								<div class="flex items-center gap-3">
									<div
										class="size-10 shrink-0 overflow-hidden rounded-lg border border-white/30 shadow-inner"
									>
										<img
											src="/images/showcase/texture-grooved.jpg"
											alt="Klasične Linije"
											class="h-full w-full object-cover"
										/>
									</div>
									<div>
										<span
											class="block text-[11px] font-black uppercase tracking-wider text-emerald-300"
											>Lice B</span
										>
										<span class="text-xs sm:text-sm font-bold">Klasične Linije / Ripne</span>
									</div>
								</div>
							</div>
						</div>
					{:else if activeTab === 'wood'}
						<div class="relative h-full w-full">
							<img
								src="/images/showcase/texture-3d-wood.jpg"
								alt="3D Tekstura Drveta - Premium Reljef"
								class="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
							/>
							<div
								class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"
							></div>
							<div class="absolute bottom-6 left-6 right-6 text-white">
								<span
									class="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-black uppercase tracking-wider"
								>
									🌲 Lice A: 3D Tekstura Drveta
								</span>
								<p class="mt-2 text-sm sm:text-base font-semibold text-white/95">
									Duboki reljefni godovi koji vjerno oponašaju prirodno drvo, pružajući luksuzan
									izgled i maksimalnu otpornost na klizanje.
								</p>
							</div>
						</div>
					{:else}
						<div class="relative h-full w-full">
							<img
								src="/images/showcase/texture-grooved.jpg"
								alt="Klasične Linije - Moderni Minimalizam"
								class="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
							/>
							<div
								class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"
							></div>
							<div class="absolute bottom-6 left-6 right-6 text-white">
								<span
									class="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-black uppercase tracking-wider"
								>
									➖ Lice B: Klasične Linije / Ripne
								</span>
								<p class="mt-2 text-sm sm:text-base font-semibold text-white/95">
									Elegantni uzdužni utori savršeni za moderne, čiste linije eksterijera koji
									vizualno izdužuju prostor i olakšavaju odvodnju vode.
								</p>
							</div>
						</div>
					{/if}

					<!-- Floating Top Quote Badge (Client's exact quote) -->
					<div
						class="absolute top-4 left-4 right-4 z-20 rounded-2xl border border-white/25 bg-[#061b0e]/75 p-3.5 sm:p-4 text-white backdrop-blur-md shadow-lg"
					>
						<div class="flex items-start gap-2.5">
							<Sparkles class="size-4 shrink-0 text-amber-300 mt-0.5" />
							<div>
								<p class="text-xs sm:text-[13px] font-medium leading-snug text-white/95 italic">
									"{quote}"
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Content & Feature Cards Side (Right on Desktop - 5 Cols) -->
			<div class="flex flex-col justify-between p-6 sm:p-8 lg:col-span-5 lg:p-10">
				<div>
					<!-- Pill Category -->
					<div
						class="inline-flex items-center gap-2 rounded-full border border-[#1b3022]/20 bg-[#1b3022]/5 px-3.5 py-1 text-xs font-bold text-[#1b3022]"
					>
						<Layers class="size-3.5" />
						<span>2-u-1 REVERZIBILNI DECKING</span>
					</div>

					<h2 class="mt-4 text-2xl font-bold tracking-tight text-[#061b0e] sm:text-3xl">
						{title}
					</h2>
					<p class="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#434843]">
						{subtitle}
					</p>

					<!-- Interactive Preview Selector -->
					<div
						class="mt-5 grid grid-cols-3 gap-1.5 rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] p-1 text-center text-xs font-bold"
					>
						<button
							type="button"
							class="rounded-lg py-2 transition cursor-pointer"
							class:bg-[#1b3022]={activeTab === 'split'}
							class:text-white={activeTab === 'split'}
							class:text-[#434843]={activeTab !== 'split'}
							onclick={() => (activeTab = 'split')}
						>
							2-u-1 Prikaz
						</button>
						<button
							type="button"
							class="rounded-lg py-2 transition cursor-pointer"
							class:bg-[#1b3022]={activeTab === 'wood'}
							class:text-white={activeTab === 'wood'}
							class:text-[#434843]={activeTab !== 'wood'}
							onclick={() => (activeTab = 'wood')}
						>
							🌲 3D Tekstura
						</button>
						<button
							type="button"
							class="rounded-lg py-2 transition cursor-pointer"
							class:bg-[#1b3022]={activeTab === 'grooved'}
							class:text-white={activeTab === 'grooved'}
							class:text-[#434843]={activeTab !== 'grooved'}
							onclick={() => (activeTab = 'grooved')}
						>
							➖ Ripne
						</button>
					</div>

					<!-- Feature Benefit Cards -->
					<div class="mt-6 space-y-3.5">
						<!-- Card 1 -->
						<div
							class="group rounded-2xl border border-[#c3c8c1]/70 bg-[#fbf9f6] p-3.5 sm:p-4 transition hover:border-[#1b3022]/40 hover:bg-white hover:shadow-sm"
						>
							<div class="flex items-start gap-3">
								<span class="text-xl shrink-0 mt-0.5">🌲</span>
								<div>
									<h3 class="text-xs sm:text-sm font-bold text-[#1b1c1a]">
										3D Tekstura Drveta <span class="text-[#4d6453] font-semibold"
											>(Premium izgled)</span
										>
									</h3>
									<p class="mt-1 text-xs text-[#5b5f60] leading-relaxed">
										Duboki reljefni godovi koji vjerno oponašaju prirodno drvo, pružajući luksuzan
										izgled i maksimalnu otpornost na klizanje.
									</p>
								</div>
							</div>
						</div>

						<!-- Card 2 -->
						<div
							class="group rounded-2xl border border-[#c3c8c1]/70 bg-[#fbf9f6] p-3.5 sm:p-4 transition hover:border-[#1b3022]/40 hover:bg-white hover:shadow-sm"
						>
							<div class="flex items-start gap-3">
								<span class="text-xl shrink-0 mt-0.5 font-bold">➖</span>
								<div>
									<h3 class="text-xs sm:text-sm font-bold text-[#1b1c1a]">
										Klasične Linije / Ripne <span class="text-[#4d6453] font-semibold"
											>(Moderni minimalizam)</span
										>
									</h3>
									<p class="mt-1 text-xs text-[#5b5f60] leading-relaxed">
										Elegantni uzdužni utori savršeni za moderne, čiste linije eksterijera koji
										vizualno izdužuju prostor i olakšavaju odvodnju vode.
									</p>
								</div>
							</div>
						</div>

						<!-- Card 3 -->
						<div
							class="group rounded-2xl border border-[#c3c8c1]/70 bg-[#fbf9f6] p-3.5 sm:p-4 transition hover:border-[#1b3022]/40 hover:bg-white hover:shadow-sm"
						>
							<div class="flex items-start gap-3">
								<span class="text-xl shrink-0 mt-0.5">🔄</span>
								<div>
									<h3 class="text-xs sm:text-sm font-bold text-[#1b1c1a]">
										Pametno 2-u-1 Rješenje
									</h3>
									<p class="mt-1 text-xs text-[#5b5f60] leading-relaxed">
										Obje strane daske su funkcionalne – prilikom ugradnje sami birate koje lice
										želite okrenuti prema gore.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Action CTA -->
				<div class="mt-8 pt-4 border-t border-[#e3e2e0]">
					<a
						href={resolve('/#materijali')}
						class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1b3022] px-6 text-xs sm:text-sm font-bold text-white shadow-md transition hover:bg-[#061b0e] active:scale-98"
					>
						<span>Pregledaj dvostrane WPC decking daske</span>
						<ArrowRight class="size-4" />
					</a>
				</div>
			</div>
		</div>
	</div>
</section>
