<script lang="ts">
	import { resolve } from '$app/paths';

	import AdminProductForm from '$lib/components/AdminProductForm.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Novi proizvod | Sezzam admin</title>
</svelte:head>

<section>
	<a
		class="text-sm font-semibold text-[#434843] hover:text-[#061b0e]"
		href={resolve('/admin/products')}
	>
		← Nazad na proizvode
	</a>
	<h1 class="mt-4 text-3xl font-bold tracking-tight text-[#061b0e]">Dodaj proizvod</h1>
	<p class="mt-2 max-w-2xl text-sm leading-6 text-[#5b5f60]">
		Unesite detalje o proizvodu. Možete odabrati sliku sa uređaja koja će se automatski optimizovati
		za webshop.
	</p>
</section>

{#if form?.error}
	<p
		class="mt-6 rounded-xl border border-[#f1b9b9] bg-[#fff5f5] px-4 py-3 text-sm font-semibold text-[#8f1010]"
	>
		{form.error}
	</p>
{/if}

<form method="POST" enctype="multipart/form-data" class="mt-6">
	<AdminProductForm categories={data.categories} submitLabel="Dodaj proizvod" />
</form>
