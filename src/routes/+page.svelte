<script lang="ts">
	import { flip } from 'svelte/animate';
	import { onMount, tick } from 'svelte';

	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import CartDrawer from '$lib/components/CartDrawer.svelte';
	import CartToastBar from '$lib/components/CartToastBar.svelte';
	import FilterBar from '$lib/components/FilterBar.svelte';
	import FloatingCallButton from '$lib/components/FloatingCallButton.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import MaterialCalculator from '$lib/components/MaterialCalculator.svelte';
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

	// Calculator modal state
	let calculatorDialogOpen = $state(false);
	let calculatorSelectedProduct = $state<Product | null>(null);

	let products = $derived(data.products);
	let cartCount = $derived(cartItems.reduce((total, item) => total + item.quantity, 0));
	let cartSubtotal = $derived(
		cartItems.reduce((sum, item) => {
			const prod = products.find((p) => p.id === item.productId);
			return sum + (prod ? prod.price * item.quantity : 0);
		}, 0)
	);

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

	function addCalculatedToCart(productId: string, quantity: number) {
		const product = products.find((candidate) => candidate.id === productId);
		if (!product || quantity <= 0) return;

		const existingItem = cartItems.find((item) => item.productId === productId);
		const allowedQuantity =
			product.availability === 'by-order'
				? quantity
				: Math.min(quantity, product.stockQuantity);

		if (existingItem) {
			cartItems = cartItems.map((item) =>
				item.productId === productId
					? {
							...item,
							quantity:
								product.availability === 'by-order'
									? item.quantity + allowedQuantity
									: Math.min(item.quantity + allowedQuantity, product.stockQuantity)
						}
					: item
			);
		} else {
			cartItems = [...cartItems, { productId, quantity: allowedQuantity }];
		}

		calculatorDialogOpen = false;
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

	function openCalculatorModal(product: Product) {
		calculatorSelectedProduct = product;
		calculatorDialogOpen = true;
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

		if (selectedSort === 'price-desc') {
			return [...items].sort((first, second) => second.price - first.price);
		}

		if (selectedSort === 'name-asc') {
			return [...items].sort((first, second) => first.name.localeCompare(second.name));
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
		content="Premium građevinski materijali, decking i laminat za profesionalne projekte u Bosni i Hercegovini."
	/>
</svelte:head>

<main class="min-h-screen bg-[#fbf9f6] text-[#1b1c1a] flex flex-col">
	<Header
		{cartCount}
		{searchQuery}
		{searchResults}
		onCartOpen={() => (cartOpen = true)}
		onSearchChange={(value) => (searchQuery = value)}
		onSearchResultSelect={selectSearchResult}
		onOpenCalculator={() => {
			calculatorSelectedProduct = null;
			calculatorDialogOpen = true;
		}}
	/>

	<Hero />



	<!-- Catalog / Materials Section -->
	<section id="materijali" class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-12 flex-1">
		<div class="mb-8">
			<h2 class="text-3xl font-bold tracking-tight text-[#061b0e]">Katalog materijala</h2>
			<p class="mt-2 text-sm text-[#434843]">
				Filtrirajte i pretražite materijale spremne za narudžbu i isporuku.
			</p>
		</div>

		<FilterBar
			categories={data.categories}
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
							onOpenCalculator={openCalculatorModal}
						/>
					</div>
				{/each}
			</div>
		{:else}
			<div class="mt-10 rounded-xl border border-[#c3c8c1] bg-white px-6 py-14 text-center">
				<p class="text-lg font-semibold text-[#061b0e]">Nema materijala za odabrane filtere</p>
				<p class="mx-auto mt-2 max-w-md text-sm leading-6 text-[#434843]">
					Pokušajte ukloniti filtere ili ponovo pokrenite pretragu.
				</p>
				<button
					class="mt-6 rounded-full bg-[#1b3022] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#061b0e]"
					onclick={resetFilters}
				>
					Poništi sve filtere
				</button>
			</div>
		{/if}
	</section>

	<!-- Dedicated Calculator Dialog for Product Cards -->
	<Dialog.Root bind:open={calculatorDialogOpen}>
		<Dialog.Content class="sm:max-w-175 border-[#c3c8c1] bg-white p-0 overflow-hidden">
			<Dialog.Header class="p-6 pb-0">
				<Dialog.Title class="text-xl font-bold text-[#061b0e]">
					Kalkulator utroška površine
				</Dialog.Title>
				<Dialog.Description class="text-xs text-[#5b5f60]">
					Proračun potrebne količine za {calculatorSelectedProduct?.name ?? 'odabrani materijal'}
				</Dialog.Description>
			</Dialog.Header>
			<div class="p-4 sm:p-6">
				<MaterialCalculator
					{products}
					initialProduct={calculatorSelectedProduct}
					onAddToCart={addCalculatedToCart}
				/>
			</div>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Attention-grabbing Cart Toast Bar (Bottom action bar) -->
	<CartToastBar
		cartCount={cartCount}
		subtotal={cartSubtotal}
		visible={!cartOpen}
		onOpenCart={() => (cartOpen = true)}
	/>

	<!-- Floating Call Button for mobile -->
	<FloatingCallButton />

	<!-- Slide-in Cart Drawer & Checkout -->
	<CartDrawer
		bind:open={cartOpen}
		{cartItems}
		{products}
		orderResult={form}
		onIncrease={increaseQuantity}
		onDecrease={decreaseQuantity}
		onRemove={removeFromCart}
	/>

	<!-- Sezzam Footer with Google Maps location and info -->
	<div id="lokacija">
		<Footer />
	</div>
</main>
