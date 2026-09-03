<script lang="ts">
	import { resolve } from '$app/paths';
	import { Upload, Image as ImageIcon, X, Check } from '@lucide/svelte';
	import {
		availabilityOptions,
		productArtOptions,
		productCategoryOptions,
		productUnitTypeOptions
	} from '$lib/adminOptions';

	type AdminProduct = {
		name: string;
		description: string;
		price: number;
		unit: string;
		unitType: string;
		categoryId: string;
		tag: string;
		stockLabel: string;
		stockQuantity: number;
		availability: string;
		art: string;
		imageUrl?: string | null;
		active: boolean;
		sortOrder: number;
	};

	let {
		product = null,
		categories = [],
		submitLabel = 'Sačuvaj proizvod'
	}: {
		product?: AdminProduct | null;
		categories?: { id: string; name: string }[];
		submitLabel?: string;
	} = $props();

	let previewUrl = $state<string | null>(null);
	let selectedFileName = $state<string>('');
	let manualUrl = $state<string>('');

	let availableCategories = $derived(
		categories && categories.length > 0
			? categories.map((c) => ({ value: c.id, label: c.name }))
			: productCategoryOptions
	);

	$effect(() => {
		if (product?.imageUrl && !selectedFileName) {
			previewUrl = product.imageUrl;
			manualUrl = product.imageUrl;
		}
	});

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			const file = target.files[0];
			selectedFileName = file.name;
			previewUrl = URL.createObjectURL(file);
			manualUrl = '';
		}
	}

	function handleClearFile() {
		selectedFileName = '';
		previewUrl = product?.imageUrl ?? null;
		manualUrl = product?.imageUrl ?? '';
		const fileInput = document.getElementById('admin-product-file-input') as HTMLInputElement;
		if (fileInput) fileInput.value = '';
	}
</script>

<div class="rounded-2xl border border-[#d6d1c8] bg-white p-4 sm:p-8 shadow-xs">
	<div class="grid gap-5 sm:gap-6 sm:grid-cols-2">
		<!-- 1. Naziv -->
		<label class="block sm:col-span-2">
			<span class="text-sm font-bold text-[#1b1c1a]">Naziv proizvoda</span>
			<input
				class="mt-2 h-11 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3.5 text-base sm:text-sm font-semibold text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white"
				name="name"
				placeholder="npr. WPC Decking Premium Antracit 4m"
				value={product?.name ?? ''}
				required
			/>
		</label>

		<!-- 2. Cijena -->
		<label class="block">
			<span class="text-sm font-bold text-[#1b1c1a]">Cijena (KM)</span>
			<div class="relative mt-2">
				<input
					class="h-11 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3.5 pr-12 text-sm font-bold text-[#061b0e] outline-none transition focus:border-[#1b3022] focus:bg-white"
					name="price"
					inputmode="decimal"
					placeholder="45.00"
					value={product ? product.price.toFixed(2) : '0.00'}
					required
				/>
				<span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#5b5f60]"
					>KM</span
				>
			</div>
		</label>

		<!-- 3. Kategorija -->
		<label class="block">
			<div class="flex items-center justify-between">
				<span class="text-sm font-bold text-[#1b1c1a]">Kategorija</span>
				<a
					href={resolve('/admin/categories')}
					target="_blank"
					class="text-[11px] font-semibold text-[#1b3022] hover:underline"
				>
					+ Upravljanje kategorijama
				</a>
			</div>
			<select
				class="mt-2 h-11 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3.5 text-sm font-semibold text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white cursor-pointer"
				name="categoryId"
			>
				{#each availableCategories as option (option.value)}
					<option
						value={option.value}
						selected={(product?.categoryId ?? availableCategories[0]?.value) === option.value}
					>
						{option.label}
					</option>
				{/each}
			</select>
		</label>

		<!-- 4. Jedinica tip -->
		<label class="block">
			<span class="text-sm font-bold text-[#1b1c1a]">Tip obračuna jedinice</span>
			<select
				class="mt-2 h-11 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3.5 text-sm font-semibold text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white cursor-pointer"
				name="unitType"
			>
				{#each productUnitTypeOptions as option (option.value)}
					<option value={option.value} selected={(product?.unitType ?? 'm2') === option.value}>
						{option.label}
					</option>
				{/each}
			</select>
		</label>

		<!-- 5. Jedinica prikaz -->
		<label class="block">
			<span class="text-sm font-bold text-[#1b1c1a]">Prikaz jedinice (tekst)</span>
			<input
				class="mt-2 h-11 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3.5 text-sm font-semibold text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white"
				name="unit"
				placeholder="m2, kom, vreća 25 kg..."
				value={product?.unit ?? 'm2'}
				required
			/>
		</label>

		<!-- 6. Oznaka / Tag -->
		<label class="block">
			<span class="text-sm font-bold text-[#1b1c1a]">Oznaka bedža (Tag)</span>
			<input
				class="mt-2 h-11 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3.5 text-sm font-semibold text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white"
				name="tag"
				placeholder="Premium, Novo, Akcija..."
				value={product?.tag ?? 'Novo'}
				required
			/>
		</label>

		<!-- 7. Dostupnost -->
		<label class="block">
			<span class="text-sm font-bold text-[#1b1c1a]">Status dostupnosti</span>
			<select
				class="mt-2 h-11 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3.5 text-sm font-semibold text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white cursor-pointer"
				name="availability"
			>
				{#each availabilityOptions as option (option.value)}
					<option
						value={option.value}
						selected={(product?.availability ?? 'in-stock') === option.value}
					>
						{option.label}
					</option>
				{/each}
			</select>
		</label>

		<!-- 8. Zaliha broj -->
		<label class="block">
			<span class="text-sm font-bold text-[#1b1c1a]">Stanje zalihe (broj)</span>
			<input
				class="mt-2 h-11 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3.5 text-sm font-semibold text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white"
				name="stockQuantity"
				type="number"
				min="0"
				value={product?.stockQuantity ?? 100}
				required
			/>
		</label>

		<!-- 9. Zaliha prikaz -->
		<label class="block">
			<span class="text-sm font-bold text-[#1b1c1a]">Prikaz zalihe (tekst za admin)</span>
			<input
				class="mt-2 h-11 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3.5 text-sm font-semibold text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white"
				name="stockLabel"
				placeholder="100 m2 na stanju"
				value={product?.stockLabel ?? 'Dostupno na skladištu'}
				required
			/>
		</label>

		<!-- 10. Ilustracija fallback -->
		<label class="block">
			<span class="text-sm font-bold text-[#1b1c1a]">Ilustracija (fallback ako nema slike)</span>
			<select
				class="mt-2 h-11 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3.5 text-sm font-semibold text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white cursor-pointer"
				name="art"
			>
				{#each productArtOptions as option (option.value)}
					<option value={option.value} selected={(product?.art ?? 'tile') === option.value}>
						{option.label}
					</option>
				{/each}
			</select>
		</label>

		<!-- 11. Sortiranje i Aktivnost -->
		<div class="grid grid-cols-2 gap-3">
			<label class="block">
				<span class="text-sm font-bold text-[#1b1c1a]">Redoslijed</span>
				<input
					class="mt-2 h-11 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3.5 text-sm font-semibold text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white"
					name="sortOrder"
					type="number"
					min="0"
					value={product?.sortOrder ?? 10}
					required
				/>
			</label>
			<label class="flex items-center gap-2.5 pt-7 text-sm font-bold text-[#1b1c1a] cursor-pointer">
				<input
					class="size-5 rounded text-[#1b3022] focus:ring-[#1b3022]"
					type="checkbox"
					name="active"
					checked={product?.active ?? true}
				/>
				<span>Aktivno u shopu</span>
			</label>
		</div>

		<!-- 12. FOTOGRAFIJA UPLOAD & PREVIEW (Visual Upload Dropzone) -->
		<div
			class="sm:col-span-2 rounded-2xl border-2 border-dashed border-[#c3c8c1] bg-[#fbf9f6] p-5 sm:p-6 transition hover:border-[#1b3022]/60"
		>
			<div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
				<!-- Live preview container -->
				<div
					class="relative grid size-28 shrink-0 place-items-center overflow-hidden rounded-xl border border-[#c3c8c1] bg-white shadow-xs"
				>
					{#if previewUrl}
						<img src={previewUrl} alt="Pregled artikla" class="h-full w-full object-cover" />
					{:else}
						<div class="flex flex-col items-center justify-center text-[#8a8f8a] p-2 text-center">
							<ImageIcon class="size-8" />
							<span class="text-[10px] mt-1 font-medium">Nema slike</span>
						</div>
					{/if}
				</div>

				<!-- Upload actions -->
				<div class="flex-1 min-w-0">
					<span class="block text-sm font-bold text-[#1b1c1a]"
						>Fotografija proizvoda (Odaberite sa računara ili mobitela)</span
					>
					<p class="mt-1 text-xs text-[#5b5f60]">
						Podržani formati: JPG, PNG, WEBP. Slika se automatski optimizuje i postavlja na webshop.
					</p>

					<div class="mt-3 flex flex-wrap items-center gap-3">
						<label
							class="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#1b3022] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#061b0e] active:scale-95"
						>
							<Upload class="size-4" />
							<span>{selectedFileName ? 'Promijeni sliku' : 'Odaberi sliku'}</span>
							<input
								id="admin-product-file-input"
								type="file"
								name="imageFile"
								accept="image/jpeg,image/png,image/webp,image/jpg"
								class="hidden"
								onchange={handleFileChange}
							/>
						</label>

						{#if selectedFileName}
							<div
								class="inline-flex items-center gap-2 rounded-xl border border-[#d0e9d4] bg-[#f2fbf3] px-3 py-2 text-xs font-bold text-[#1b5e20]"
							>
								<Check class="size-3.5" />
								<span class="truncate max-w-50">{selectedFileName}</span>
								<button
									type="button"
									onclick={handleClearFile}
									class="text-[#5b5f60] hover:text-red-600 transition"
									aria-label="Ukloni odabranu sliku"
								>
									<X class="size-3.5" />
								</button>
							</div>
						{/if}
					</div>

					<!-- Direct URL input (opcionalno) -->
					<div class="mt-3">
						<input
							type="text"
							name="imageUrl"
							bind:value={manualUrl}
							placeholder="Ili zalijepite direktan URL slike (opcionalno)"
							class="h-9 w-full rounded-lg border border-[#c3c8c1] bg-white px-3 text-xs text-[#1b1c1a] outline-none transition focus:border-[#1b3022]"
						/>
					</div>
				</div>
			</div>
		</div>

		<!-- 13. Opis -->
		<label class="block sm:col-span-2">
			<span class="text-sm font-bold text-[#1b1c1a]">Opis proizvoda i karakteristike</span>
			<textarea
				class="mt-2 min-h-28 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3.5 py-3 text-sm font-medium leading-relaxed text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white"
				name="description"
				placeholder="Unesite detalje o materijalu, dimenzijama, debljini, načinu postavljanja..."
				required>{product?.description ?? ''}</textarea
			>
		</label>
	</div>

	<!-- Submit CTA -->
	<div class="mt-8 flex items-center justify-end gap-4 border-t border-[#e3e2e0] pt-6">
		<button
			class="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-full bg-[#1b3022] px-8 text-sm font-bold text-white shadow-md transition hover:bg-[#061b0e] active:scale-98 cursor-pointer"
			type="submit"
		>
			{submitLabel}
		</button>
	</div>
</div>
