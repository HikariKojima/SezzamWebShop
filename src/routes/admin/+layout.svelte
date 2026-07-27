<script lang="ts">
	import { resolve } from '$app/paths';

	let { data, children } = $props();
</script>

{#if data.isLoggedIn}
	<main class="min-h-screen bg-[#f4f1ec] text-[#1b1c1a]">
		<header class="border-b border-[#d6d1c8] bg-[#fbf9f6]">
			<div
				class="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-10"
			>
				<div>
					<a href={resolve('/admin')} class="text-2xl font-semibold text-[#061b0e]">Sezzam</a>
					<p class="mt-1 text-sm text-[#5b5f60]">Admin panel</p>
				</div>

				<nav
					class="flex flex-wrap items-center gap-2 text-sm font-semibold"
					aria-label="Admin navigacija"
				>
					<a
						class="rounded-full border border-[#c3c8c1] bg-white px-4 py-2 text-[#061b0e] transition hover:bg-[#f5f3f0]"
						href={resolve('/admin')}
					>
						Pregled
					</a>
					<a
						class="rounded-full border border-[#c3c8c1] bg-white px-4 py-2 text-[#061b0e] transition hover:bg-[#f5f3f0]"
						href={resolve('/admin/orders')}
					>
						Narudzbe
					</a>
					<a
						class="rounded-full border border-[#c3c8c1] bg-white px-4 py-2 text-[#061b0e] transition hover:bg-[#f5f3f0]"
						href={resolve('/admin/products')}
					>
						Proizvodi
					</a>
					<a
						class="rounded-full border border-transparent px-4 py-2 text-[#434843] transition hover:border-[#c3c8c1] hover:bg-white"
						href={resolve('/')}
					>
						Stranica
					</a>
					<form method="POST" action={resolve('/admin/logout')}>
						<button
							class="rounded-full border border-[#c3c8c1] bg-white px-4 py-2 text-sm font-semibold text-[#061b0e] transition hover:bg-[#f5f3f0]"
							type="submit"
						>
							Odjava
						</button>
					</form>
				</nav>
			</div>
		</header>

		<div class="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10">
			{@render children()}
		</div>
	</main>
{:else}
	{@render children()}
{/if}
