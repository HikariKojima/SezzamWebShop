<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		CheckCircle2,
		AlertCircle,
		Upload,
		Image as ImageIcon,
		Loader2,
		ExternalLink,
		Save,
		Layers,
		Sparkles,
		Phone,
		Mail
	} from '@lucide/svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let heroPreview = $state<string | null>(null);
	let spotlightPreview = $state<string | null>(null);
	let isSaving = $state(false);

	$effect(() => {
		heroPreview = data.settings.heroImageUrl ?? null;
		spotlightPreview = data.settings.spotlightImageUrl ?? null;
	});

	function handleHeroFile(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			if (heroPreview && heroPreview.startsWith('blob:')) {
				URL.revokeObjectURL(heroPreview);
			}
			heroPreview = URL.createObjectURL(target.files[0]);
		}
	}

	function handleSpotlightFile(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			if (spotlightPreview && spotlightPreview.startsWith('blob:')) {
				URL.revokeObjectURL(spotlightPreview);
			}
			spotlightPreview = URL.createObjectURL(target.files[0]);
		}
	}
</script>

<svelte:head>
	<title>Uredi početnu stranicu | Sezzam admin</title>
</svelte:head>

<section class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
	<div>
		<div class="flex items-center gap-2">
			<span
				class="rounded-full bg-[#1b3022] px-2.5 py-0.5 text-[11px] font-bold text-white uppercase tracking-wider"
			>
				Homescreen
			</span>
			<h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#061b0e]">
				Uredi početnu stranicu
			</h1>
		</div>
		<p class="mt-1.5 text-xs sm:text-sm text-[#5b5f60]">
			Prilagodite tekstove, citate i baner fotografije na početnoj stranici webshopa.
		</p>
	</div>

	<div class="flex items-center gap-3">
		<a
			href={resolve('/')}
			target="_blank"
			rel="noreferrer"
			class="inline-flex items-center gap-1.5 rounded-full border border-[#c3c8c1] bg-white px-4 py-2 text-xs font-bold text-[#1b1c1a] shadow-xs transition hover:bg-[#efeeeb]"
		>
			<span>Pogledaj sajt</span>
			<ExternalLink class="size-3.5" />
		</a>
	</div>
</section>

{#if form?.success}
	<div
		class="mt-6 flex items-center gap-3 rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 text-sm font-semibold text-[#166534] shadow-xs"
	>
		<CheckCircle2 class="size-5 shrink-0" />
		<span>{form.message ?? 'Izmjene su uspješno sačuvane!'}</span>
	</div>
{/if}

{#if form?.error}
	<div
		class="mt-6 flex items-center gap-3 rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-4 text-sm font-semibold text-[#991b1b] shadow-xs"
	>
		<AlertCircle class="size-5 shrink-0" />
		<span>{form.error}</span>
	</div>
{/if}

<form
	method="POST"
	enctype="multipart/form-data"
	class="mt-8 space-y-8"
	onsubmit={() => (isSaving = true)}
>
	<!-- Card 1: Hero Sekcija -->
	<div class="rounded-2xl border border-[#d6d1c8] bg-white p-5 sm:p-8 shadow-xs">
		<div class="flex items-center gap-2.5 border-b border-[#e3e2e0] pb-4">
			<span class="grid size-9 place-items-center rounded-xl bg-[#1b3022]/10 text-[#1b3022]">
				<Sparkles class="size-5" />
			</span>
			<div>
				<h2 class="text-base sm:text-lg font-bold text-[#061b0e]">
					1. Glavna Hero sekcija (Vrh stranice)
				</h2>
				<p class="text-xs text-[#5b5f60]">Prvi utisak kupca po ulasku na webshop.</p>
			</div>
		</div>

		<div class="mt-6 grid gap-5 sm:gap-6 sm:grid-cols-2">
			<label class="block sm:col-span-2">
				<span class="text-xs sm:text-sm font-bold text-[#1b1c1a]">Mali gornji natpis (Tagline)</span
				>
				<input
					name="heroTagline"
					value={data.settings.heroTagline}
					class="mt-1.5 h-11 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3.5 text-sm font-semibold text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white"
					required
				/>
			</label>

			<label class="block sm:col-span-2">
				<span class="text-xs sm:text-sm font-bold text-[#1b1c1a]">Glavni naslov (H1)</span>
				<input
					name="heroTitle"
					value={data.settings.heroTitle}
					class="mt-1.5 h-11 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3.5 text-sm font-bold text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white"
					required
				/>
			</label>

			<label class="block sm:col-span-2">
				<span class="text-xs sm:text-sm font-bold text-[#1b1c1a]">Podnaslov i opis ponude</span>
				<textarea
					name="heroSubtitle"
					rows="3"
					class="mt-1.5 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3.5 py-2.5 text-sm font-medium leading-relaxed text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white"
					required>{data.settings.heroSubtitle}</textarea
				>
			</label>

			<!-- Hero Image Upload -->
			<div class="sm:col-span-2 rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] p-4 sm:p-5">
				<div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
					<div
						class="relative grid size-28 shrink-0 place-items-center overflow-hidden rounded-xl border border-[#c3c8c1] bg-white shadow-xs"
					>
						{#if heroPreview}
							<img src={heroPreview} alt="Hero vizual" class="h-full w-full object-cover" />
						{:else}
							<div class="flex flex-col items-center justify-center text-[#8a8f8a] p-2 text-center">
								<ImageIcon class="size-8" />
								<span class="text-[10px] mt-1 font-medium">3D Ilustracija</span>
							</div>
						{/if}
					</div>

					<div class="flex-1 min-w-0">
						<span class="block text-sm font-bold text-[#1b1c1a]">Fotografija za Hero sekciju</span>
						<p class="mt-1 text-xs text-[#5b5f60]">
							Odaberite sliku projekta ili terase. Ako ostavite prazno, prikazuje se elegantna
							geometrijska 3D vizualizacija materijala.
						</p>

						<div class="mt-3 flex flex-wrap items-center gap-3">
							<label
								class="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#1b3022] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#061b0e]"
							>
								<Upload class="size-3.5" />
								<span>Odaberi fotografiju</span>
								<input
									type="file"
									name="heroImageFile"
									accept="image/*"
									class="hidden"
									onchange={handleHeroFile}
								/>
							</label>
							<input
								type="text"
								name="heroImageUrl"
								value={data.settings.heroImageUrl ?? ''}
								placeholder="Ili zalijepite URL slike"
								class="h-9 flex-1 min-w-48 rounded-lg border border-[#c3c8c1] bg-white px-3 text-xs text-[#1b1c1a] outline-none transition focus:border-[#1b3022]"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Card 2: Dvostrani Dizajn (Spotlight) -->
	<div class="rounded-2xl border border-[#d6d1c8] bg-white p-5 sm:p-8 shadow-xs">
		<div class="flex items-center gap-2.5 border-b border-[#e3e2e0] pb-4">
			<span class="grid size-9 place-items-center rounded-xl bg-emerald-800/10 text-emerald-800">
				<Layers class="size-5" />
			</span>
			<div>
				<h2 class="text-base sm:text-lg font-bold text-[#061b0e]">
					2. Dvostrani dizajn – Dva lica savršenstva
				</h2>
				<p class="text-xs text-[#5b5f60]">
					Istaknuta prezentacija 2-u-1 tehnologije decking daske.
				</p>
			</div>
		</div>

		<div class="mt-6 grid gap-5 sm:gap-6 sm:grid-cols-2">
			<label class="block sm:col-span-2">
				<div class="flex items-center justify-between">
					<span class="text-xs sm:text-sm font-bold text-[#1b1c1a]">Istaknuti citat na slici</span>
					<span class="text-[11px] font-semibold text-[#1b3022]"
						>Prikazuje se u elegantnoj staklenoj kartici</span
					>
				</div>
				<textarea
					name="spotlightQuote"
					rows="2"
					class="mt-1.5 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3.5 py-2.5 text-sm font-semibold italic text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white"
					required>{data.settings.spotlightQuote}</textarea
				>
			</label>

			<label class="block">
				<span class="text-xs sm:text-sm font-bold text-[#1b1c1a]">Naslov sekcije</span>
				<input
					name="spotlightTitle"
					value={data.settings.spotlightTitle}
					class="mt-1.5 h-11 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3.5 text-sm font-bold text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white"
					required
				/>
			</label>

			<label class="block">
				<span class="text-xs sm:text-sm font-bold text-[#1b1c1a]">Podnaslov sekcije</span>
				<input
					name="spotlightSubtitle"
					value={data.settings.spotlightSubtitle}
					class="mt-1.5 h-11 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3.5 text-sm font-semibold text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white"
					required
				/>
			</label>

			<!-- Spotlight Image Upload -->
			<div class="sm:col-span-2 rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] p-4 sm:p-5">
				<div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
					<div
						class="relative grid size-28 shrink-0 place-items-center overflow-hidden rounded-xl border border-[#c3c8c1] bg-white shadow-xs"
					>
						{#if spotlightPreview}
							<img
								src={spotlightPreview}
								alt="Spotlight vizual"
								class="h-full w-full object-cover"
							/>
						{:else}
							<div class="flex flex-col items-center justify-center text-[#8a8f8a] p-2 text-center">
								<ImageIcon class="size-8" />
								<span class="text-[10px] mt-1 font-medium">Nema slike</span>
							</div>
						{/if}
					</div>

					<div class="flex-1 min-w-0">
						<span class="block text-sm font-bold text-[#1b1c1a]"
							>Fotografija terase sa deckingom</span
						>
						<p class="mt-1 text-xs text-[#5b5f60]">
							Prikazuje se na lijevoj strani spotlight bloka sa citatom "Dva lica savršenstva" i
							oznakama lica A i B.
						</p>

						<div class="mt-3 flex flex-wrap items-center gap-3">
							<label
								class="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#1b3022] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#061b0e]"
							>
								<Upload class="size-3.5" />
								<span>Promijeni sliku terase</span>
								<input
									type="file"
									name="spotlightImageFile"
									accept="image/*"
									class="hidden"
									onchange={handleSpotlightFile}
								/>
							</label>
							<input
								type="text"
								name="spotlightImageUrl"
								value={data.settings.spotlightImageUrl ?? ''}
								placeholder="Ili zalijepite URL slike terase"
								class="h-9 flex-1 min-w-48 rounded-lg border border-[#c3c8c1] bg-white px-3 text-xs text-[#1b1c1a] outline-none transition focus:border-[#1b3022]"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Card 3: Kontakt Informacije -->
	<div class="rounded-2xl border border-[#d6d1c8] bg-white p-5 sm:p-8 shadow-xs">
		<div class="flex items-center gap-2.5 border-b border-[#e3e2e0] pb-4">
			<span class="grid size-9 place-items-center rounded-xl bg-blue-800/10 text-blue-800">
				<Phone class="size-5" />
			</span>
			<div>
				<h2 class="text-base sm:text-lg font-bold text-[#061b0e]">3. Kontakt podaci na sajtu</h2>
				<p class="text-xs text-[#5b5f60]">Broj telefona i email za brze pozive i narudžbe.</p>
			</div>
		</div>

		<div class="mt-6 grid gap-5 sm:gap-6 sm:grid-cols-2">
			<label class="block">
				<span class="text-xs sm:text-sm font-bold text-[#1b1c1a]">Kontakt telefon</span>
				<div
					class="mt-1.5 flex items-center rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3 focus-within:border-[#1b3022] focus-within:bg-white"
				>
					<Phone class="size-4 text-[#737973] shrink-0" />
					<input
						name="contactPhone"
						value={data.settings.contactPhone}
						class="h-11 w-full bg-transparent px-2.5 text-sm font-bold text-[#1b1c1a] outline-none"
						required
					/>
				</div>
			</label>

			<label class="block">
				<span class="text-xs sm:text-sm font-bold text-[#1b1c1a]">Kontakt email</span>
				<div
					class="mt-1.5 flex items-center rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3 focus-within:border-[#1b3022] focus-within:bg-white"
				>
					<Mail class="size-4 text-[#737973] shrink-0" />
					<input
						name="contactEmail"
						type="email"
						value={data.settings.contactEmail}
						class="h-11 w-full bg-transparent px-2.5 text-sm font-semibold text-[#1b1c1a] outline-none"
						required
					/>
				</div>
			</label>
		</div>
	</div>

	<!-- Bottom Action Floating/Sticky Bar -->
	<div
		class="sticky bottom-4 z-20 flex items-center justify-between rounded-2xl border border-[#c3c8c1] bg-white/95 p-4 shadow-xl backdrop-blur-md"
	>
		<div class="hidden sm:block">
			<p class="text-xs font-bold text-[#1b1c1a]">
				Sve izmjene stupaju na snagu odmah na početnoj stranici.
			</p>
		</div>
		<button
			type="submit"
			disabled={isSaving}
			class="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#1b3022] px-8 text-sm font-bold text-white shadow-md transition hover:bg-[#061b0e] active:scale-98 cursor-pointer disabled:opacity-60"
		>
			{#if isSaving}
				<Loader2 class="size-4 animate-spin" />
				<span>Snimam izmjene...</span>
			{:else}
				<Save class="size-4" />
				<span>Sačuvaj izmjene</span>
			{/if}
		</button>
	</div>
</form>
