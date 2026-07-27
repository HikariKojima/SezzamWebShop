<script lang="ts">
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
		active: boolean;
		sortOrder: number;
	};

	let {
		product = null,
		submitLabel = 'Sacuvaj proizvod'
	}: {
		product?: AdminProduct | null;
		submitLabel?: string;
	} = $props();
</script>

<div class="rounded-lg border border-[#d6d1c8] bg-white p-5">
	<div class="grid gap-4 sm:grid-cols-2">
		<label class="block">
			<span class="text-sm font-semibold text-[#1b1c1a]">Naziv</span>
			<input
				class="mt-2 h-11 w-full rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-3 text-sm outline-none focus:border-[#1b3022] focus:bg-white"
				name="name"
				value={product?.name ?? ''}
				required
			/>
		</label>
		<label class="block">
			<span class="text-sm font-semibold text-[#1b1c1a]">Cijena KM</span>
			<input
				class="mt-2 h-11 w-full rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-3 text-sm outline-none focus:border-[#1b3022] focus:bg-white"
				name="price"
				inputmode="decimal"
				value={product ? product.price.toFixed(2) : '0.00'}
				required
			/>
		</label>
		<label class="block">
			<span class="text-sm font-semibold text-[#1b1c1a]">Kategorija</span>
			<select
				class="mt-2 h-11 w-full rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-3 text-sm outline-none focus:border-[#1b3022] focus:bg-white"
				name="categoryId"
			>
				{#each productCategoryOptions as option (option.value)}
					<option
						value={option.value}
						selected={(product?.categoryId ?? 'cement') === option.value}
					>
						{option.label}
					</option>
				{/each}
			</select>
		</label>
		<label class="block">
			<span class="text-sm font-semibold text-[#1b1c1a]">Jedinica tip</span>
			<select
				class="mt-2 h-11 w-full rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-3 text-sm outline-none focus:border-[#1b3022] focus:bg-white"
				name="unitType"
			>
				{#each productUnitTypeOptions as option (option.value)}
					<option value={option.value} selected={(product?.unitType ?? 'komad') === option.value}>
						{option.label}
					</option>
				{/each}
			</select>
		</label>
		<label class="block">
			<span class="text-sm font-semibold text-[#1b1c1a]">Jedinica prikaz</span>
			<input
				class="mt-2 h-11 w-full rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-3 text-sm outline-none focus:border-[#1b3022] focus:bg-white"
				name="unit"
				value={product?.unit ?? 'komad'}
				required
			/>
		</label>
		<label class="block">
			<span class="text-sm font-semibold text-[#1b1c1a]">Oznaka</span>
			<input
				class="mt-2 h-11 w-full rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-3 text-sm outline-none focus:border-[#1b3022] focus:bg-white"
				name="tag"
				value={product?.tag ?? 'Na stanju'}
				required
			/>
		</label>
		<label class="block">
			<span class="text-sm font-semibold text-[#1b1c1a]">Zaliha broj</span>
			<input
				class="mt-2 h-11 w-full rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-3 text-sm outline-none focus:border-[#1b3022] focus:bg-white"
				name="stockQuantity"
				type="number"
				min="0"
				value={product?.stockQuantity ?? 0}
				required
			/>
		</label>
		<label class="block">
			<span class="text-sm font-semibold text-[#1b1c1a]">Zaliha prikaz</span>
			<input
				class="mt-2 h-11 w-full rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-3 text-sm outline-none focus:border-[#1b3022] focus:bg-white"
				name="stockLabel"
				value={product?.stockLabel ?? '0 kom'}
				required
			/>
		</label>
		<label class="block">
			<span class="text-sm font-semibold text-[#1b1c1a]">Dostupnost</span>
			<select
				class="mt-2 h-11 w-full rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-3 text-sm outline-none focus:border-[#1b3022] focus:bg-white"
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
		<label class="block">
			<span class="text-sm font-semibold text-[#1b1c1a]">Ilustracija</span>
			<select
				class="mt-2 h-11 w-full rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-3 text-sm outline-none focus:border-[#1b3022] focus:bg-white"
				name="art"
			>
				{#each productArtOptions as option (option.value)}
					<option value={option.value} selected={(product?.art ?? 'cement') === option.value}>
						{option.label}
					</option>
				{/each}
			</select>
		</label>
		<label class="block">
			<span class="text-sm font-semibold text-[#1b1c1a]">Sortiranje</span>
			<input
				class="mt-2 h-11 w-full rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-3 text-sm outline-none focus:border-[#1b3022] focus:bg-white"
				name="sortOrder"
				type="number"
				min="0"
				value={product?.sortOrder ?? 100}
				required
			/>
		</label>
		<label class="flex items-center gap-2 pt-8 text-sm font-semibold text-[#1b1c1a]">
			<input
				class="rounded border-[#c3c8c1] text-[#1b3022] focus:ring-[#1b3022]"
				type="checkbox"
				name="active"
				checked={product?.active ?? true}
			/>
			Aktivno na storefrontu
		</label>
		<label class="block sm:col-span-2">
			<span class="text-sm font-semibold text-[#1b1c1a]">Opis</span>
			<textarea
				class="mt-2 min-h-32 w-full rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-3 py-3 text-sm outline-none focus:border-[#1b3022] focus:bg-white"
				name="description"
				required>{product?.description ?? ''}</textarea
			>
		</label>
	</div>

	<div class="mt-6 flex justify-end">
		<button
			class="rounded-full bg-[#1b3022] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#061b0e]"
			type="submit"
		>
			{submitLabel}
		</button>
	</div>
</div>
