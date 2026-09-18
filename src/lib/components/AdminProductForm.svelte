<script lang="ts">
	import { Image as ImageIcon, X, Loader2, AlertCircle, Star, Plus, Layers } from '@lucide/svelte';
	import { compressImage } from '$lib/imageCompressor';
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
		originalPrice?: number | null;
		unit: string;
		unitType: string;
		categoryId: string;
		tag: string;
		stockLabel: string;
		stockQuantity: number;
		availability: string;
		art: string;
		imageUrl?: string | null;
		images?: string | null;
		hasDualSide?: boolean;
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

	type ManagedImage = {
		id: string;
		url: string;
		file?: File;
		isExisting: boolean;
	};

	let imageList = $state<ManagedImage[]>([]);
	let hasDualSide = $state(false);
	let manualUrl = $state('');
	let isCompressing = $state(false);
	let compressionProgress = $state('');
	let fileError = $state<string | null>(null);

	let priceInput = $state('');
	let originalPriceInput = $state('');

	let discountPercent = $derived.by(() => {
		const cur = Number(String(priceInput).replace(',', '.'));
		const orig = Number(String(originalPriceInput).replace(',', '.'));
		if (Number.isFinite(cur) && Number.isFinite(orig) && orig > cur && cur > 0) {
			return Math.round(((orig - cur) / orig) * 100);
		}
		return null;
	});

	let availableCategories = $derived(
		categories && categories.length > 0
			? categories.map((c) => ({ value: c.id, label: c.name }))
			: productCategoryOptions
	);

	let existingImagesJson = $derived(
		JSON.stringify(imageList.filter((img) => img.isExisting).map((img) => img.url))
	);
	let primaryImageUrl = $derived(imageList.length > 0 ? imageList[0].url : '');

	$effect(() => {
		if (product) {
			priceInput = product.price ? product.price.toFixed(2) : '';
			originalPriceInput = product.originalPrice ? product.originalPrice.toFixed(2) : '';
			hasDualSide = Boolean(product.hasDualSide);

			const initialImages: ManagedImage[] = [];
			if (product.images) {
				try {
					const parsed = JSON.parse(product.images);
					if (Array.isArray(parsed)) {
						parsed.forEach((url, index) => {
							if (typeof url === 'string' && url.trim()) {
								initialImages.push({
									id: `existing-${index}-${url.slice(-10)}`,
									url: url.trim(),
									isExisting: true
								});
							}
						});
					}
				} catch {
					// fallback
				}
			}

			if (initialImages.length === 0 && product.imageUrl) {
				initialImages.push({
					id: `existing-0-${product.imageUrl.slice(-10)}`,
					url: product.imageUrl,
					isExisting: true
				});
			}

			imageList = initialImages;
		}
	});

	function syncFileInput() {
		const hiddenInput = document.getElementById('admin-product-files-sync') as HTMLInputElement;
		if (!hiddenInput) return;

		try {
			const dt = new DataTransfer();
			for (const item of imageList) {
				if (!item.isExisting && item.file) {
					dt.items.add(item.file);
				}
			}
			hiddenInput.files = dt.files;
		} catch (e) {
			console.warn('DataTransfer sync fallback:', e);
		}
	}

	async function handleFilesSelected(event: Event) {
		const target = event.target as HTMLInputElement;
		if (!target.files || target.files.length === 0) return;

		const files = Array.from(target.files);
		fileError = null;

		if (imageList.length + files.length > 14) {
			fileError = 'Maksimalno je dozvoljeno 14 slika po artiklu.';
			target.value = '';
			return;
		}

		isCompressing = true;
		try {
			for (let i = 0; i < files.length; i++) {
				const f = files[i];
				compressionProgress = `Optimizujem sliku ${i + 1}/${files.length}...`;

				if (!f.type.startsWith('image/')) {
					continue;
				}

				if (f.size > 35 * 1024 * 1024) {
					fileError = `Slika ${f.name} je prevelika (maksimalno 35 MB).`;
					continue;
				}

				const compressed = await compressImage(f, {
					maxDimension: 1600,
					quality: 0.82
				});

				const previewUrl = URL.createObjectURL(compressed);

				imageList.push({
					id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
					url: previewUrl,
					file: compressed,
					isExisting: false
				});
			}

			syncFileInput();
		} catch (err) {
			console.error('Greška pri obradi slika:', err);
			fileError = err instanceof Error ? err.message : 'Došlo je do greške pri obradi slika.';
		} finally {
			isCompressing = false;
			compressionProgress = '';
			target.value = '';
		}
	}

	function handleAddManualUrl() {
		const trimmed = manualUrl.trim();
		if (!trimmed) return;

		imageList.push({
			id: `manual-${Date.now()}`,
			url: trimmed,
			isExisting: true
		});
		manualUrl = '';
	}

	function setPrimaryImage(index: number) {
		if (index === 0 || index >= imageList.length) return;
		const selected = imageList[index];
		const updated = [selected, ...imageList.filter((_, i) => i !== index)];
		imageList = updated;
		syncFileInput();
	}

	function removeImage(index: number) {
		const item = imageList[index];
		if (!item.isExisting && item.url.startsWith('blob:')) {
			URL.revokeObjectURL(item.url);
		}
		imageList = imageList.filter((_, i) => i !== index);
		syncFileInput();
	}
</script>

<!-- Hidden form fields that automatically serialize the multi-image payload -->
<input type="hidden" name="existingImages" value={existingImagesJson} />
<input type="hidden" name="imageUrl" value={primaryImageUrl} />
<input type="hidden" name="hasDualSide" value={hasDualSide ? 'true' : 'false'} />
<input id="admin-product-files-sync" type="file" multiple name="imageFiles" class="hidden" />

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

		<!-- 2. Cijena & Stara cijena (Akcija) -->
		<div class="grid gap-4 sm:col-span-2 sm:grid-cols-2">
			<label class="block">
				<span class="text-sm font-bold text-[#1b1c1a]">Prodajna cijena (KM)</span>
				<input
					class="mt-2 h-11 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3.5 text-base sm:text-sm font-bold text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white"
					name="price"
					type="text"
					inputmode="decimal"
					placeholder="45.00"
					bind:value={priceInput}
					required
				/>
				<span class="mt-1 block text-[11px] text-[#5b5f60]"
					>Cijena koju kupac plaća po jedinici mjere.</span
				>
			</label>

			<label class="block">
				<div class="flex items-center justify-between">
					<span class="text-sm font-bold text-[#1b1c1a]">Stara / precrtana cijena (opcionalno)</span
					>
					{#if discountPercent}
						<span
							class="rounded-md bg-[#ba1a1a] px-2 py-0.5 text-[11px] font-black text-white uppercase tracking-wider shadow-xs"
						>
							-{discountPercent}% POPUST
						</span>
					{/if}
				</div>
				<input
					class="mt-2 h-11 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3.5 text-base sm:text-sm font-semibold text-[#5b5f60] outline-none transition focus:border-[#1b3022] focus:bg-white"
					name="originalPrice"
					type="text"
					inputmode="decimal"
					placeholder="55.00"
					bind:value={originalPriceInput}
				/>
				<span class="mt-1 block text-[11px] text-[#5b5f60]">
					Ako popunite, proizvod dobija crvenu oznaku "Akcija" sa izračunatim procentom.
				</span>
			</label>
		</div>

		<!-- 3. Jedinica mjere -->
		<label class="block">
			<span class="text-sm font-bold text-[#1b1c1a]">Tekst jedinice mjere</span>
			<input
				class="mt-2 h-11 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3.5 text-sm font-semibold text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white"
				name="unit"
				placeholder="m2 ili daska 4m (0.56m2)"
				value={product?.unit ?? 'm2'}
				required
			/>
		</label>

		<!-- 4. Tip jedinice -->
		<label class="block">
			<span class="text-sm font-bold text-[#1b1c1a]">Tip za kalkulator</span>
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

		<!-- 5. Kategorija -->
		<label class="block">
			<span class="text-sm font-bold text-[#1b1c1a]">Kategorija</span>
			<select
				class="mt-2 h-11 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3.5 text-sm font-semibold text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white cursor-pointer"
				name="categoryId"
			>
				{#each availableCategories as option (option.value)}
					<option value={option.value} selected={(product?.categoryId ?? 'wpc') === option.value}>
						{option.label}
					</option>
				{/each}
			</select>
		</label>

		<!-- 6. Značka / Tag -->
		<label class="block">
			<span class="text-sm font-bold text-[#1b1c1a]">Istaknuta značka (Tag)</span>
			<input
				class="mt-2 h-11 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3.5 text-sm font-semibold text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white"
				name="tag"
				placeholder="npr. Premium 3D, Najprodavanije, WPC Terasa"
				value={product?.tag ?? 'WPC Sistem'}
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

		<!-- 8. Količina na stanju -->
		<label class="block">
			<span class="text-sm font-bold text-[#1b1c1a]">Tačna količina na stanju (broj)</span>
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
			<span class="text-sm font-bold text-[#1b1c1a]">Prikaz zalihe (tekst za kupce)</span>
			<input
				class="mt-2 h-11 w-full rounded-xl border border-[#c3c8c1] bg-[#fbf9f6] px-3.5 text-sm font-semibold text-[#1b1c1a] outline-none transition focus:border-[#1b3022] focus:bg-white"
				name="stockLabel"
				placeholder="Dostupno odmah na skladištu"
				value={product?.stockLabel ?? 'Dostupno odmah na skladištu'}
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
				<span class="text-sm font-bold text-[#1b1c1a]">Redoslijed prikaza</span>
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

		<!-- 12. DVOSTRANI DIZAJN (2-u-1) TEHNOLOGIJA SWITCH -->
		<div
			class="sm:col-span-2 rounded-2xl border-2 transition-all p-4 sm:p-5"
			class:border-[#1b3022]={hasDualSide}
			class:bg-[#f3f7f4]={hasDualSide}
			class:border-[#d6d1c8]={!hasDualSide}
			class:bg-[#fbf9f6]={!hasDualSide}
		>
			<div class="flex items-start justify-between gap-4">
				<div class="space-y-1.5">
					<div class="flex items-center gap-2 flex-wrap">
						<span
							class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-white"
							class:bg-[#1b3022]={hasDualSide}
							class:bg-[#737973]={!hasDualSide}
						>
							<Layers class="size-3" />
							<span>2-u-1 Tehnologija</span>
						</span>
						<span class="text-base font-bold text-[#1b1c1a]"
							>Dvostrani dizajn (Dva lica savršenstva)</span
						>
					</div>
					<p class="text-xs sm:text-sm text-[#434843] leading-relaxed max-w-3xl">
						Uključite ukoliko ova daska posjeduje <strong>dva funkcionalna lica</strong> (npr. 3D
						reljefna tekstura drveta s jedne strane i moderne ripne s druge). U webshopu će na prvoj
						kartici u carouselu biti prikazan <strong>atraktivan split-prikaz oba lica</strong> sa jasnim
						oznakama ("Lice A: 3D Tekstura" i "Lice B: Klasične ripne").
					</p>
					{#if hasDualSide}
						<div class="mt-2 flex items-center gap-2 text-xs font-semibold text-[#1b3022]">
							<span class="size-2 rounded-full bg-[#1b3022] animate-pulse"></span>
							<span
								>Savjet: Prva slika ispod predstavlja <strong>Lice A</strong>, a druga slika
								<strong>Lice B</strong> za split-karticu.</span
							>
						</div>
					{/if}
				</div>

				<label class="relative inline-flex cursor-pointer items-center shrink-0 pt-1">
					<input
						type="checkbox"
						class="peer sr-only"
						checked={hasDualSide}
						onchange={(e) => (hasDualSide = (e.target as HTMLInputElement).checked)}
					/>
					<div
						class="h-7 w-12 rounded-full bg-[#c3c8c1] transition-colors peer-checked:bg-[#1b3022] after:absolute after:top-[6px] after:left-[3px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:after:translate-x-5"
					></div>
				</label>
			</div>
		</div>

		<!-- 13. MULTI-IMAGE UPLOAD ZONE & GALLERY GRID -->
		<div
			class="sm:col-span-2 rounded-2xl border-2 border-dashed border-[#c3c8c1] bg-[#fbf9f6] p-5 sm:p-6 transition hover:border-[#1b3022]/60"
		>
			<div class="flex flex-col gap-4">
				<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
					<div>
						<div class="flex items-center gap-2">
							<span class="text-base font-bold text-[#1b1c1a]"
								>Galerija slika proizvoda ({imageList.length})</span
							>
							<span
								class="rounded-full bg-[#efeeeb] px-2 py-0.5 text-[11px] font-semibold text-[#434843]"
							>
								Podržan Carousel & Slideshow
							</span>
						</div>
						<p class="mt-1 text-xs text-[#5b5f60]">
							Odaberite jednu ili više fotografija. Slike se automatski optimizuju u WebP format
							visokih performansi.
						</p>
					</div>

					<div class="flex items-center gap-2">
						<label
							class="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#1b3022] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#061b0e] active:scale-95"
							class:opacity-60={isCompressing}
							class:pointer-events-none={isCompressing}
						>
							{#if isCompressing}
								<Loader2 class="size-4 animate-spin" />
								<span>{compressionProgress || 'Optimizujem...'}</span>
							{:else}
								<Plus class="size-4" />
								<span>Dodaj slike sa uređaja</span>
							{/if}
							<input
								type="file"
								multiple
								accept="image/jpeg,image/png,image/webp,image/jpg"
								class="hidden"
								disabled={isCompressing}
								onchange={handleFilesSelected}
							/>
						</label>
					</div>
				</div>

				{#if fileError}
					<div
						class="flex items-center gap-2 rounded-xl border border-[#f1b9b9] bg-[#fff5f5] px-3.5 py-2 text-xs font-semibold text-[#ba1a1a]"
					>
						<AlertCircle class="size-4 shrink-0" />
						<span>{fileError}</span>
					</div>
				{/if}

				<!-- Images Grid -->
				{#if imageList.length > 0}
					<div class="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
						{#each imageList as img, index (img.id)}
							<div
								class="group relative aspect-square overflow-hidden rounded-xl border-2 bg-white shadow-xs transition-all"
								class:border-[#1b3022]={index === 0}
								class:border-[#d6d1c8]={index !== 0}
							>
								<img
									src={img.url}
									alt={`Slika ${index + 1}`}
									class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
								/>

								<!-- Top Badges -->
								<div
									class="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between gap-1"
								>
									{#if index === 0}
										<span
											class="inline-flex items-center gap-1 rounded-full bg-[#1b3022] px-2 py-0.5 text-[10px] font-black text-white shadow-sm"
										>
											<Star class="size-2.5 fill-amber-400 text-amber-400" />
											<span>Glavna / Cover</span>
										</span>
									{:else if hasDualSide && index === 1}
										<span
											class="inline-flex items-center gap-1 rounded-full bg-[#2e5939] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm"
										>
											<span>Lice B (Split)</span>
										</span>
									{:else}
										<span
											class="rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs"
										>
											#{index + 1}
										</span>
									{/if}

									<!-- Delete button -->
									<button
										type="button"
										onclick={() => removeImage(index)}
										class="grid size-6 place-items-center rounded-full bg-black/70 text-white transition hover:bg-red-600 cursor-pointer shadow-sm"
										aria-label="Ukloni sliku"
									>
										<X class="size-3.5" />
									</button>
								</div>

								<!-- Bottom Action Overlay -->
								{#if index !== 0}
									<div
										class="absolute inset-x-0 bottom-0 p-1.5 opacity-0 transition group-hover:opacity-100 bg-gradient-to-t from-black/80 to-transparent"
									>
										<button
											type="button"
											onclick={() => setPrimaryImage(index)}
											class="w-full rounded-md bg-white/90 py-1 text-[10px] font-bold text-[#1b1c1a] transition hover:bg-white cursor-pointer shadow-xs"
										>
											Postavi kao glavnu
										</button>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{:else}
					<div
						class="flex flex-col items-center justify-center rounded-xl border border-[#e3e2e0] bg-white/60 py-8 text-center"
					>
						<ImageIcon class="size-10 text-[#8a8f8a]" />
						<p class="mt-2 text-xs font-semibold text-[#434843]">Nema dodanih slika</p>
						<p class="text-[11px] text-[#737973]">
							Dodajte jednu ili više slika klikom na dugme iznad.
						</p>
					</div>
				{/if}

				<!-- Direct URL input helper -->
				<div class="mt-2 flex items-center gap-2 border-t border-[#e3e2e0] pt-3">
					<input
						type="text"
						bind:value={manualUrl}
						placeholder="Ili unesite direktan URL slike (https://...)"
						class="h-9 flex-1 rounded-lg border border-[#c3c8c1] bg-white px-3 text-xs text-[#1b1c1a] outline-none transition focus:border-[#1b3022]"
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								handleAddManualUrl();
							}
						}}
					/>
					<button
						type="button"
						onclick={handleAddManualUrl}
						class="inline-flex h-9 items-center justify-center rounded-lg border border-[#c3c8c1] bg-white px-3 text-xs font-bold text-[#1b1c1a] transition hover:bg-[#efeeeb] cursor-pointer"
					>
						Dodaj URL
					</button>
				</div>
			</div>
		</div>

		<!-- 14. Opis -->
		<label class="block sm:col-span-2">
			<span class="text-sm font-bold text-[#1b1c1a]">Opis proizvoda i tehničke karakteristike</span>
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
			class="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#1b3022] px-8 text-sm font-bold text-white shadow-md transition hover:bg-[#061b0e] active:scale-98 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
			type="submit"
			disabled={isCompressing}
		>
			{#if isCompressing}
				<Loader2 class="size-4 animate-spin" />
				<span>{compressionProgress || 'Optimizujem sliku...'}</span>
			{:else}
				<span>{submitLabel}</span>
			{/if}
		</button>
	</div>
</div>
