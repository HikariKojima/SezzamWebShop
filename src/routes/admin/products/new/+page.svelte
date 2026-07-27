<script lang="ts">
	import { resolve } from '$app/paths';

	import AdminProductForm from '$lib/components/AdminProductForm.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Novi proizvod | Sezzam admin</title>
</svelte:head>

<section>
	<a
		class="text-sm font-semibold text-[#434843] hover:text-[#061b0e]"
		href={resolve('/admin/products')}
	>
		Nazad na proizvode
	</a>
	<h1 class="mt-4 text-3xl font-semibold text-[#061b0e]">Dodaj proizvod</h1>
	<p class="mt-3 max-w-2xl text-sm leading-6 text-[#434843]">
		ID proizvoda ce se automatski napraviti iz naziva. Ako isti ID vec postoji, dodat ce se broj.
	</p>
</section>

{#if form?.error}
	<p
		class="mt-6 rounded-md border border-[#f1b9b9] bg-[#fff5f5] px-4 py-3 text-sm font-semibold text-[#8f1010]"
	>
		{form.error}
	</p>
{/if}

<form method="POST" class="mt-6">
	<AdminProductForm submitLabel="Dodaj proizvod" />
</form>
