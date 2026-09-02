<script lang="ts">
	import { resolve } from '$app/paths';
	import { Plus, Trash2, FolderTree, Tag, ArrowRight } from '@lucide/svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Upravljanje kategorijama | Sezzam admin</title>
</svelte:head>

<section class="flex flex-wrap items-center justify-between gap-4">
	<div>
		<a
			class="text-sm font-semibold text-[#434843] hover:text-[#061b0e]"
			href={resolve('/admin')}
		>
			← Nazad na pregled
		</a>
		<h1 class="mt-2 text-3xl font-bold tracking-tight text-[#061b0e]">Kategorije proizvoda</h1>
		<p class="mt-1 text-sm text-[#5b5f60]">
			Dodajte nove kategorije ili upravljajte postojećim. Sve aktivne kategorije se odmah prikazuju na webshopu.
		</p>
	</div>

	<a
		href={resolve('/admin/products/new')}
		class="inline-flex items-center gap-2 rounded-full bg-[#1b3022] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#061b0e]"
	>
		<Plus class="size-4" />
		<span>Dodaj novi artikal</span>
	</a>
</section>

{#if form?.message}
	<p
		class="mt-6 rounded-xl border border-[#bad5bf] bg-[#f2fbf3] px-4 py-3 text-sm font-semibold text-[#1b5e20]"
	>
		{form.message}
	</p>
{/if}

{#if form?.error}
	<p
		class="mt-6 rounded-xl border border-[#f1b9b9] bg-[#fff5f5] px-4 py-3 text-sm font-semibold text-[#8f1010]"
	>
		{form.error}
	</p>
{/if}

<div class="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
	<!-- Left: List of categories -->
	<div class="rounded-2xl border border-[#d6d1c8] bg-white p-6 shadow-xs">
		<h2 class="text-lg font-bold text-[#061b0e] flex items-center gap-2">
			<FolderTree class="size-5 text-[#1b3022]" />
			<span>Aktivne kategorije ({data.categories.length})</span>
		</h2>

		<div class="mt-5 divide-y divide-[#e3e2e0]">
			{#each data.categories as cat (cat.id)}
				<div class="flex items-center justify-between py-4 gap-4">
					<div>
						<div class="flex items-center gap-2.5">
							<span class="text-base font-bold text-[#1b1c1a]">{cat.name}</span>
							<span class="rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-2 py-0.5 text-xs font-semibold text-[#5b5f60]">
								id: {cat.id}
							</span>
						</div>
						<p class="mt-1 text-xs text-[#5b5f60]">
							{cat.productCount} {cat.productCount === 1 ? 'proizvod' : 'proizvoda'} u ovoj kategoriji
						</p>
					</div>

					<div class="flex items-center gap-2">
						{#if cat.productCount === 0}
							<form method="POST" action="?/delete" onsubmit={(e) => !confirm(`Da li sigurno želite obrisati kategoriju '${cat.name}'?`) && e.preventDefault()}>
								<input type="hidden" name="id" value={cat.id} />
								<button
									type="submit"
									class="grid size-9 place-items-center rounded-lg border border-[#e3e2e0] text-[#5b5f60] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
									title="Obriši praznu kategoriju"
								>
									<Trash2 class="size-4" />
								</button>
							</form>
						{:else}
							<span class="text-xs text-[#8a8f8a] font-medium italic">Ima artikle</span>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Right: Add new category form -->
	<div class="rounded-2xl border border-[#d6d1c8] bg-[#fbf9f6] p-6 shadow-xs h-fit">
		<h2 class="text-lg font-bold text-[#061b0e] flex items-center gap-2">
			<Tag class="size-5 text-[#1b3022]" />
			<span>Dodaj novu kategoriju</span>
		</h2>
		<p class="mt-1 text-xs text-[#5b5f60]">
			Nakon dodavanja, nova kategorija će odmah biti dostupna u filterima webshopa i formi artikala.
		</p>

		<form method="POST" action="?/create" class="mt-5 space-y-4">
			<label class="block">
				<span class="text-xs font-bold text-[#1b1c1a]">Naziv kategorije</span>
				<input
					class="mt-1.5 h-11 w-full rounded-xl border border-[#c3c8c1] bg-white px-3.5 text-sm font-semibold text-[#1b1c1a] outline-none transition focus:border-[#1b3022]"
					name="name"
					placeholder="npr. Zidni paneli, Fasadne obloge..."
					required
				/>
			</label>

			<label class="block">
				<span class="text-xs font-bold text-[#1b1c1a]">Identifikator / Oznaka (opcionalno)</span>
				<input
					class="mt-1.5 h-11 w-full rounded-xl border border-[#c3c8c1] bg-white px-3.5 text-sm text-[#1b1c1a] outline-none transition focus:border-[#1b3022]"
					name="id"
					placeholder="npr. zidni-paneli (automatski se generiše ako ostavite prazno)"
				/>
			</label>

			<label class="block">
				<span class="text-xs font-bold text-[#1b1c1a]">Redoslijed prikaza</span>
				<input
					class="mt-1.5 h-11 w-full rounded-xl border border-[#c3c8c1] bg-white px-3.5 text-sm font-semibold text-[#1b1c1a] outline-none transition focus:border-[#1b3022]"
					name="sortOrder"
					type="number"
					value="50"
					required
				/>
			</label>

			<button
				type="submit"
				class="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#1b3022] text-sm font-bold text-white shadow-sm transition hover:bg-[#061b0e] active:scale-98 cursor-pointer"
			>
				<Plus class="size-4" />
				<span>Sačuvaj novu kategoriju</span>
			</button>
		</form>
	</div>
</div>
