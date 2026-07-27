<script lang="ts">
	import { resolve } from '$app/paths';

	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Admin prijava | Sezzam</title>
</svelte:head>

<main class="grid min-h-screen place-items-center bg-[#fbf9f6] px-4 text-[#1b1c1a]">
	<section class="w-full max-w-md rounded-lg border border-[#c3c8c1] bg-white p-8 shadow-sm">
		<a href={resolve('/')} class="text-2xl font-semibold text-[#061b0e]">Sezzam</a>
		<div class="mt-8">
			<p class="text-sm font-semibold uppercase text-[#5b5f60]">Admin panel</p>
			<h1 class="mt-2 text-3xl font-semibold text-[#061b0e]">Prijava vlasnika</h1>
			<p class="mt-3 text-sm leading-6 text-[#434843]">
				Unesite admin lozinku za upravljanje proizvodima i narudžbama.
			</p>
		</div>

		<form method="POST" class="mt-8 space-y-5">
			<label class="block">
				<span class="text-sm font-semibold text-[#1b1c1a]">Lozinka</span>
				<input
					class="mt-2 h-12 w-full rounded-md border border-[#c3c8c1] bg-[#fbf9f6] px-4 text-sm outline-none transition focus:border-[#1b3022] focus:bg-white"
					name="password"
					type="password"
					autocomplete="current-password"
					required
				/>
			</label>

			{#if form?.error}
				<p
					class="rounded-md border border-[#f1b9b9] bg-[#fff5f5] px-4 py-3 text-sm font-medium text-[#8f1010]"
				>
					{form.error}
				</p>
			{/if}

			<button
				class="h-12 w-full rounded-full bg-[#1b3022] px-5 text-sm font-semibold text-white transition hover:bg-[#061b0e]"
				type="submit"
			>
				Uđi u admin
			</button>
		</form>
	</section>
</main>
