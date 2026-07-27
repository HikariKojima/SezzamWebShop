<script lang="ts">
	import { resolve } from '$app/paths';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Admin pregled | Sezzam</title>
</svelte:head>

<section>
	<p class="text-sm font-semibold uppercase text-[#5b5f60]">Pregled</p>
	<h1 class="mt-1 text-3xl font-semibold text-[#061b0e]">Admin dashboard</h1>
	<p class="mt-3 max-w-2xl text-sm leading-6 text-[#434843]">
		Kratak pregled kataloga i narudzbi. Detaljno uredjivanje je odvojeno na posebne stranice.
	</p>
</section>

<section class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
	<a
		class="rounded-lg border border-[#d6d1c8] bg-white p-5 transition hover:border-[#1b3022]"
		href={resolve('/admin/orders?status=pending' as '/admin/orders')}
	>
		<p class="text-sm font-medium text-[#5b5f60]">Nove narudzbe</p>
		<p class="mt-2 text-3xl font-semibold text-[#061b0e]">{data.pendingOrders}</p>
	</a>
	<a
		class="rounded-lg border border-[#d6d1c8] bg-white p-5 transition hover:border-[#1b3022]"
		href={resolve('/admin/orders')}
	>
		<p class="text-sm font-medium text-[#5b5f60]">Sve narudzbe</p>
		<p class="mt-2 text-3xl font-semibold text-[#061b0e]">{data.totalOrders}</p>
	</a>
	<a
		class="rounded-lg border border-[#d6d1c8] bg-white p-5 transition hover:border-[#1b3022]"
		href={resolve('/admin/products?status=active' as '/admin/products')}
	>
		<p class="text-sm font-medium text-[#5b5f60]">Aktivni proizvodi</p>
		<p class="mt-2 text-3xl font-semibold text-[#061b0e]">{data.activeProducts}</p>
	</a>
	<a
		class="rounded-lg border border-[#d6d1c8] bg-white p-5 transition hover:border-[#1b3022]"
		href={resolve('/admin/products?status=inactive' as '/admin/products')}
	>
		<p class="text-sm font-medium text-[#5b5f60]">Neaktivni proizvodi</p>
		<p class="mt-2 text-3xl font-semibold text-[#061b0e]">{data.inactiveProducts}</p>
	</a>
</section>

<section class="mt-8 grid gap-5 lg:grid-cols-2">
	<a
		class="rounded-lg border border-[#d6d1c8] bg-white p-6 transition hover:border-[#1b3022]"
		href={resolve('/admin/orders')}
	>
		<p class="text-sm font-semibold uppercase text-[#5b5f60]">Narudzbe</p>
		<h2 class="mt-2 text-2xl font-semibold text-[#061b0e]">Pregled i statusi</h2>
		<p class="mt-3 text-sm leading-6 text-[#434843]">
			Filtrirajte narudzbe po statusu i brzo oznacite sta je potvrdjeno, spremno ili zavrseno.
		</p>
	</a>
	<a
		class="rounded-lg border border-[#d6d1c8] bg-white p-6 transition hover:border-[#1b3022]"
		href={resolve('/admin/products')}
	>
		<p class="text-sm font-semibold uppercase text-[#5b5f60]">Proizvodi</p>
		<h2 class="mt-2 text-2xl font-semibold text-[#061b0e]">Katalog i zaliha</h2>
		<p class="mt-3 text-sm leading-6 text-[#434843]">
			Dodajte proizvode, uredite cijene i zalihe, ili obrisite proizvode koji nisu u narudzbama.
		</p>
	</a>
</section>
