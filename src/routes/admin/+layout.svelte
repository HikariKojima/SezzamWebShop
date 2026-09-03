<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import {
		LayoutDashboard,
		ShoppingBag,
		Package,
		FolderTree,
		ExternalLink,
		LogOut,
		Store
	} from '@lucide/svelte';

	let { data, children } = $props();

	let currentPath = $derived(page.url.pathname);

	function isActive(path: string, exact = false) {
		if (exact) return currentPath === path;
		return currentPath.startsWith(path);
	}
</script>

{#if data.isLoggedIn}
	<main class="min-h-screen bg-[#f4f1ec] text-[#1b1c1a] flex flex-col">
		<!-- Top Bar -->
		<header class="sticky top-0 z-30 border-b border-[#d6d1c8] bg-[#fbf9f6]/95 backdrop-blur-md">
			<div
				class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10 sm:py-4"
			>
				<!-- Brand -->
				<div class="flex items-center gap-3">
					<a href={resolve('/admin')} class="flex items-center gap-2">
						<img
							src="/images/logo/logo.png"
							alt="Sezzam Logo"
							class="h-7 sm:h-8 w-auto object-contain"
						/>
						<span
							class="rounded-md bg-[#1b3022] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white"
						>
							Admin
						</span>
					</a>
				</div>

				<!-- Desktop Navigation (lg and up) -->
				<nav
					class="hidden lg:flex items-center gap-1.5 text-sm font-semibold"
					aria-label="Admin navigacija"
				>
					<a
						class={[
							'rounded-full px-4 py-2 transition',
							isActive('/admin', true)
								? 'bg-[#1b3022] text-white shadow-xs'
								: 'border border-[#c3c8c1] bg-white text-[#061b0e] hover:bg-[#f5f3f0]'
						]}
						href={resolve('/admin')}
					>
						Pregled
					</a>
					<a
						class={[
							'rounded-full px-4 py-2 transition',
							isActive('/admin/orders')
								? 'bg-[#1b3022] text-white shadow-xs'
								: 'border border-[#c3c8c1] bg-white text-[#061b0e] hover:bg-[#f5f3f0]'
						]}
						href={resolve('/admin/orders')}
					>
						Narudžbe
					</a>
					<a
						class={[
							'rounded-full px-4 py-2 transition',
							isActive('/admin/products')
								? 'bg-[#1b3022] text-white shadow-xs'
								: 'border border-[#c3c8c1] bg-white text-[#061b0e] hover:bg-[#f5f3f0]'
						]}
						href={resolve('/admin/products')}
					>
						Proizvodi
					</a>
					<a
						class={[
							'rounded-full px-4 py-2 transition',
							isActive('/admin/categories')
								? 'bg-[#1b3022] text-white shadow-xs'
								: 'border border-[#c3c8c1] bg-white text-[#061b0e] hover:bg-[#f5f3f0]'
						]}
						href={resolve('/admin/categories')}
					>
						Kategorije
					</a>
					<a
						class="rounded-full border border-[#c3c8c1] bg-white px-3.5 py-2 text-[#061b0e] transition hover:bg-[#f5f3f0] flex items-center gap-1.5 text-xs font-semibold"
						href={resolve('/')}
						target="_blank"
						rel="noopener noreferrer"
						title="Otvori webshop u novoj kartici"
					>
						<span>Webshop</span>
						<ExternalLink class="size-3.5" />
					</a>
					<form method="POST" action={resolve('/admin/logout')}>
						<button
							class="rounded-full border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 flex items-center gap-1.5 cursor-pointer"
							type="submit"
							title="Odjavi se"
						>
							<LogOut class="size-3.5" />
							<span>Odjava</span>
						</button>
					</form>
				</nav>

				<!-- Mobile Top Actions (Webshop & Logout icons) -->
				<div class="flex items-center gap-2 lg:hidden">
					<a
						href={resolve('/')}
						target="_blank"
						class="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#c3c8c1] bg-white px-3 text-xs font-semibold text-[#061b0e] shadow-2xs active:scale-95"
						title="Otvori webshop"
					>
						<Store class="size-3.5 text-[#1b3022]" />
						<span>Shop</span>
					</a>
					<form method="POST" action={resolve('/admin/logout')}>
						<button
							type="submit"
							class="grid size-9 place-items-center rounded-full border border-red-200 bg-white text-red-700 shadow-2xs active:scale-95 cursor-pointer"
							title="Odjava"
							aria-label="Odjavi se"
						>
							<LogOut class="size-4" />
						</button>
					</form>
				</div>
			</div>
		</header>

		<!-- Main content with padding bottom for mobile bottom nav -->
		<div class="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-10 pb-24 lg:pb-12">
			{@render children()}
		</div>

		<!-- Mobile Bottom Navigation Bar (Visible only on mobile / tablet < lg) -->
		<nav
			class="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-[#d6d1c8] bg-white/95 px-2 py-1.5 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)] lg:hidden"
			style="padding-bottom: max(0.5rem, env(safe-area-inset-bottom));"
			aria-label="Mobilna navigacija"
		>
			<a
				href={resolve('/admin')}
				class={[
					'flex flex-1 flex-col items-center justify-center py-1 text-center transition active:scale-95',
					isActive('/admin', true) ? 'text-[#1b3022] font-bold' : 'text-[#737973] font-medium'
				]}
			>
				<div
					class={[
						'grid size-8 place-items-center rounded-full transition',
						isActive('/admin', true) ? 'bg-[#1b3022]/10 text-[#1b3022]' : 'text-[#5b5f60]'
					]}
				>
					<LayoutDashboard class="size-4.5" />
				</div>
				<span class="mt-0.5 text-[11px]">Pregled</span>
			</a>

			<a
				href={resolve('/admin/orders')}
				class={[
					'flex flex-1 flex-col items-center justify-center py-1 text-center transition active:scale-95',
					isActive('/admin/orders') ? 'text-[#1b3022] font-bold' : 'text-[#737973] font-medium'
				]}
			>
				<div
					class={[
						'grid size-8 place-items-center rounded-full transition',
						isActive('/admin/orders') ? 'bg-[#1b3022]/10 text-[#1b3022]' : 'text-[#5b5f60]'
					]}
				>
					<ShoppingBag class="size-4.5" />
				</div>
				<span class="mt-0.5 text-[11px]">Narudžbe</span>
			</a>

			<a
				href={resolve('/admin/products')}
				class={[
					'flex flex-1 flex-col items-center justify-center py-1 text-center transition active:scale-95',
					isActive('/admin/products') ? 'text-[#1b3022] font-bold' : 'text-[#737973] font-medium'
				]}
			>
				<div
					class={[
						'grid size-8 place-items-center rounded-full transition',
						isActive('/admin/products') ? 'bg-[#1b3022]/10 text-[#1b3022]' : 'text-[#5b5f60]'
					]}
				>
					<Package class="size-4.5" />
				</div>
				<span class="mt-0.5 text-[11px]">Proizvodi</span>
			</a>

			<a
				href={resolve('/admin/categories')}
				class={[
					'flex flex-1 flex-col items-center justify-center py-1 text-center transition active:scale-95',
					isActive('/admin/categories') ? 'text-[#1b3022] font-bold' : 'text-[#737973] font-medium'
				]}
			>
				<div
					class={[
						'grid size-8 place-items-center rounded-full transition',
						isActive('/admin/categories') ? 'bg-[#1b3022]/10 text-[#1b3022]' : 'text-[#5b5f60]'
					]}
				>
					<FolderTree class="size-4.5" />
				</div>
				<span class="mt-0.5 text-[11px]">Kategorije</span>
			</a>
		</nav>
	</main>
{:else}
	{@render children()}
{/if}
