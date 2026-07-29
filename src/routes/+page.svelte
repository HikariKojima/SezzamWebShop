<script lang="ts">
	import { flip } from 'svelte/animate';
	import { onMount, tick } from 'svelte';

	import CartDrawer from '$lib/components/CartDrawer.svelte';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import Header from '$lib/components/Header.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import type { CartItem } from '$lib/types/cart';
	import type { Product, ProductFilters, ProductSort } from '$lib/types/product';
	import type { ActionData, PageData } from './$types';

	const CART_STORAGE_KEY = 'sezzam-cart';
	const defaultFilters: ProductFilters = {
		category: null,
		price: null,
		availability: null
	};

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let cartItems = $state<CartItem[]>([]);
	let cartOpen = $state(false);
	let cartLoaded = $state(false);
	let handledOrderId = $state<number | null>(null);
	let selectedFilters = $state<ProductFilters>({ ...defaultFilters });
	let searchQuery = $state('');
	let sort = $state<ProductSort>('recommended');
	let products = $derived(data.products);
	let cartCount = $derived(cartItems.reduce((total, item) => total + item.quantity, 0));
	let minCatalogPrice = $derived(
		products.length > 0 ? Math.floor(Math.min(...products.map((product) => product.price))) : 0
	);
	let maxCatalogPrice = $derived(
		products.length > 0 ? Math.ceil(Math.max(...products.map((product) => product.price))) : 0
	);
	let filteredProducts = $derived(products.filter((product) => productMatchesFilters(product)));
	let searchResults = $derived(getSearchResults(products, searchQuery));
	let sortedProducts = $derived(sortProducts(filteredProducts, sort));
	let resultCount = $derived(sortedProducts.length);

	onMount(() => {
		const savedCart = localStorage.getItem(CART_STORAGE_KEY);

		if (savedCart) {
			try {
				const parsedCart = JSON.parse(savedCart) as CartItem[];
				cartItems = parsedCart.filter(
					(item) =>
						products.some(
							(product) =>
								product.id === item.productId &&
								(product.availability === 'by-order' || item.quantity <= product.stockQuantity)
						) &&
						Number.isInteger(item.quantity) &&
						item.quantity > 0
				);
			} catch {
				localStorage.removeItem(CART_STORAGE_KEY);
			}
		}

		cartLoaded = true;
	});

	$effect(() => {
		if (!cartLoaded) return;
		localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
	});

	$effect(() => {
		if (!form?.success || !form.orderId || handledOrderId === form.orderId) return;
		handledOrderId = form.orderId;
		cartItems = [];
		cartOpen = true;
		localStorage.removeItem(CART_STORAGE_KEY);
	});

	function getQuantity(productId: string) {
		return cartItems.find((item) => item.productId === productId)?.quantity ?? 0;
	}

	function addToCart(productId: string) {
		increaseQuantity(productId);
		cartOpen = true;
	}

	function increaseQuantity(productId: string) {
		const product = products.find((candidate) => candidate.id === productId);
		if (!product) return;
		if (product.availability !== 'by-order' && product.stockQuantity <= 0) return;

		const existingItem = cartItems.find((item) => item.productId === productId);

		if (existingItem) {
			if (product.availability !== 'by-order' && existingItem.quantity >= product.stockQuantity) {
				return;
			}
			cartItems = cartItems.map((item) =>
				item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
			);
			return;
		}

		cartItems = [...cartItems, { productId, quantity: 1 }];
	}

	function decreaseQuantity(productId: string) {
		cartItems = cartItems.flatMap((item) => {
			if (item.productId !== productId) return [item];
			if (item.quantity <= 1) return [];
			return [{ ...item, quantity: item.quantity - 1 }];
		});
	}

	function removeFromCart(productId: string) {
		cartItems = cartItems.filter((item) => item.productId !== productId);
	}

	function productMatchesFilters(product: Product) {
		const normalizedSearchQuery = searchQuery.trim().toLowerCase();

		if (normalizedSearchQuery) {
			if (!getSearchableText(product).includes(normalizedSearchQuery)) return false;
		}

		if (selectedFilters.category && product.category !== selectedFilters.category) return false;
		if (selectedFilters.availability && product.availability !== selectedFilters.availability) {
			return false;
		}
		if (selectedFilters.price && product.price < selectedFilters.price.min) return false;
		if (selectedFilters.price && product.price > selectedFilters.price.max) {
			return false;
		}

		return true;
	}

	function getSearchableText(product: Product) {
		return [product.name, product.description, product.category, product.tag, product.unit]
			.join(' ')
			.toLowerCase();
	}

	function getSearchResults(items: Product[], query: string) {
		const normalizedSearchQuery = query.trim().toLowerCase();
		if (!normalizedSearchQuery) return [];

		return items
			.filter((product) => getSearchableText(product).includes(normalizedSearchQuery))
			.slice(0, 6);
	}

	async function selectSearchResult(productId: string) {
		const product = products.find((candidate) => candidate.id === productId);
		if (!product) return;

		searchQuery = product.name;
		await tick();
		document.getElementById(`product-${productId}`)?.scrollIntoView({
			behavior: 'smooth',
			block: 'center'
		});
	}

	function sortProducts(items: Product[], selectedSort: ProductSort) {
		if (selectedSort === 'price-asc') {
			return [...items].sort((first, second) => first.price - second.price);
		}

		if (selectedSort === 'stock-desc') {
			return [...items].sort((first, second) => second.stockQuantity - first.stockQuantity);
		}

		return items;
	}

	function updateFilter<Key extends keyof ProductFilters>(key: Key, value: ProductFilters[Key]) {
		selectedFilters = { ...selectedFilters, [key]: value };
	}

	function resetFilters() {
		selectedFilters = { ...defaultFilters };
	}
</script>

<svelte:head>
	<title>Sezzam | Građevinski materijali u BiH</title>
	<meta
		name="description"
		content="Premium građevinski materijali za profesionalne projekte u Bosni i Hercegovini."
	/>
</svelte:head>

<main class="min-h-screen bg-[#fbf9f6] text-[#1b1c1a]">
	<Header
		{cartCount}
		{searchQuery}
		{searchResults}
		onCartOpen={() => (cartOpen = true)}
		onSearchChange={(value) => (searchQuery = value)}
		onSearchResultSelect={selectSearchResult}
	/>
	<Hero />

	<section id="materijali" class="mx-auto max-w-[1280px] px-4 pb-20 sm:px-6 lg:px-12">
		<FilterBar
			{selectedFilters}
			{sort}
			{resultCount}
			priceBounds={{ min: minCatalogPrice, max: maxCatalogPrice }}
			onFilterChange={updateFilter}
			onSortChange={(value) => (sort = value)}
			onReset={resetFilters}
		/>

		{#if sortedProducts.length > 0}
			<div class="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
				{#each sortedProducts as product (product.id)}
					<div id={`product-${product.id}`} animate:flip={{ duration: 220 }}>
						<ProductCard
							{product}
							quantity={getQuantity(product.id)}
							onAdd={() => addToCart(product.id)}
							onIncrease={() => increaseQuantity(product.id)}
							onDecrease={() => decreaseQuantity(product.id)}
						/>
					</div>
				{/each}
			</div>
		{:else}
			<div class="mt-10 rounded-lg border border-[#c3c8c1] bg-white px-6 py-14 text-center">
				<p class="text-lg font-semibold text-[#061b0e]">Nema proizvoda za odabrane filtere</p>
				<p class="mx-auto mt-2 max-w-md text-sm leading-6 text-[#434843]">
					Pokušajte ukloniti jedan filter ili vratiti katalog na sve materijale.
				</p>
				<button
					class="mt-6 rounded-full bg-[#1b3022] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#061b0e]"
					onclick={resetFilters}
				>
					Poništi filtere
				</button>
			</div>
		{/if}
	</section>

	<CartDrawer
		bind:open={cartOpen}
		{cartItems}
		{products}
		orderResult={form}
		onIncrease={increaseQuantity}
		onDecrease={decreaseQuantity}
		onRemove={removeFromCart}
	/>
</main>
