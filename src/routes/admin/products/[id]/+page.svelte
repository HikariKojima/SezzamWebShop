<script lang="ts">
	import { resolve } from '$app/paths';

	import AdminProductForm from '$lib/components/AdminProductForm.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>{data.product.name} | Sezzam admin</title>
</svelte:head>

<section>
	<a
		class="text-sm font-semibold text-[#434843] hover:text-[#061b0e]"
		href={resolve('/admin/products')}
	>
		← Nazad na proizvode
	</a>
	<p class="mt-4 text-xs font-bold uppercase tracking-wider text-[#5b5f60]">ID: {data.product.id}</p>
	<h1 class="mt-1 text-3xl font-bold tracking-tight text-[#061b0e]">Uredi proizvod</h1>
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

<form method="POST" enctype="multipart/form-data" class="mt-6">
	<AdminProductForm product={data.product} categories={data.categories} />
</form>
