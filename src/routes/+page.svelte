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
	import SEO from '$lib/components/SEO.svelte';
	import { env } from '$env/dynamic/public';
	import type { CartItem } from '$lib/types/cart';
	import type { Product, ProductFilters, ProductSort } from '$lib/types/product';
	import type { ActionData, PageData } from './$types';

	const CART_STORAGE_KEY = 'sezzam-cart';
	const defaultFilters: ProductFilters = {
		category: null,
		price: null,
		availability: null,
		onlySale: false
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
			product.availability === 'by-order' ? quantity : Math.min(quantity, product.stockQuantity);

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
		if (
			selectedFilters.onlySale &&
			(!product.originalPrice || product.originalPrice <= product.price)
		) {
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

	const siteUrl = (env.PUBLIC_SITE_URL || 'https://sezzam.ba').replace(/\/$/, '');

	let structuredData = $derived({
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'HomeAndConstructionBusiness',
				'@id': `${siteUrl}/#business`,
				name: 'Sezzam - WPC Decking, SPC/LVT Podne i Zidne Obloge',
				alternateName: 'Sezzam Webshop WPC Decking & Podne Obloge',
				description:
					'Specijalizovani za vrhunski WPC kompozitni decking za terase, balkone i bazene, SPC i LVT podne obloge, te moderne zidne obloge u Bosni i Hercegovini.',
				url: siteUrl,
				logo: `${siteUrl}/images/logo/logo-square.png`,
				image: `${siteUrl}/images/logo/logo-square.png`,
				telephone: '+38761069798',
				email: 'sezzam@sezzam.ba',
				priceRange: '$$',
				address: {
					'@type': 'PostalAddress',
					addressCountry: 'BA',
					addressRegion: 'Bosna i Hercegovina'
				},
				hasMap:
					'https://maps.google.com/maps?vet=10CAAQoqAOahcKEwjo1LDRnsiWAxUAAAAAHQAAAAAQCA..i&pvq=Cg0vZy8xMXlqaGpwMjB6IgwKBnNlenphbRACGAM&lqi=CgpzZXp6YW0gYmloSJ6QqvjBvYCACFoUEAAYACIKc2V6emFtIGJpaDICaHKSAQl3YXJlaG91c2U&fvr=1&cs=1&um=1&ie=UTF-8&fb=1&gl=ba&sa=X&ftid=0x4758b5007a0f380d:0x6bf45d9d0e160531'
			},
			{
				'@type': 'WebSite',
				'@id': `${siteUrl}/#website`,
				url: siteUrl,
				name: 'Sezzam - WPC Decking, SPC/LVT Podne i Zidne Obloge',
				inLanguage: 'bs-BA',
				publisher: {
					'@id': `${siteUrl}/#business`
				}
			},
			{
				'@type': 'ItemList',
				name: 'Sezzam WPC Decking, SPC/LVT i Zidne Obloge',
				itemListElement: products.slice(0, 30).map((prod, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					item: {
						'@type': 'Product',
						name: prod.name,
						description: prod.description,
						image: prod.imageUrl
							? prod.imageUrl.startsWith('http')
								? prod.imageUrl
								: `${siteUrl}${prod.imageUrl}`
							: undefined,
						offers: {
							'@type': 'Offer',
							price: prod.price.toFixed(2),
							priceCurrency: 'BAM',
							availability:
								prod.availability === 'in-stock'
									? 'https://schema.org/InStock'
									: prod.availability === 'by-order'
										? 'https://schema.org/PreOrder'
										: 'https://schema.org/LimitedAvailability'
						}
					}
				}))
			}
		]
	});
</script>

<SEO
	title="Sezzam | Webshop WPC Decking, SPC/LVT Podne i Zidne Obloge BiH"
	description="Specijalizovani webshop za vrhunski WPC decking za terase i bazene, SPC i LVT podne obloge, te moderne zidne obloge u BiH. Izračunajte utrošak materijala i naručite online."
	keywords="wpc decking, decking sistemi, wpc decking bih, wpc daske, spc podovi, lvt podovi, zidne obloge, podne obloge, decking za terase, sezzam, sezzam ba, sarajevo, bosna i hercegovina"
	canonical="/"
	image="/images/logo/logo-square.png"
	jsonLd={structuredData}
/>

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
			<h2 class="text-3xl font-bold tracking-tight text-[#061b0e]">
				Katalog decking sistema i podnih obloga
			</h2>
			<p class="mt-2 text-sm text-[#434843]">
				Filtrirajte i izaberite WPC decking daske, potkonstrukciju i podne obloge spremne za
				isporuku.
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

	<!-- Dedicated Calculator Dialog for Product Cards (Bottom sheet on mobile, spacious modal on desktop) -->
	<Dialog.Root bind:open={calculatorDialogOpen}>
		<Dialog.Content
			class="fixed bottom-0 left-0 right-0 top-auto z-50 flex max-h-[92vh] w-full max-w-full translate-x-0 translate-y-0 flex-col overflow-hidden rounded-b-none rounded-t-3xl border-[#c3c8c1] bg-white p-0 shadow-2xl transition-all sm:top-1/2 sm:left-1/2 sm:right-auto sm:bottom-auto sm:w-[92vw] sm:max-w-5xl lg:max-w-6xl xl:max-w-[1250px] sm:max-h-[92vh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
		>
			<!-- Mobile drag / sheet indicator -->
			<div class="mx-auto mt-2.5 h-1.5 w-12 shrink-0 rounded-full bg-[#d6d1c8] sm:hidden"></div>

			<Dialog.Header class="px-6 pt-4 pb-3 sm:px-10 sm:py-5 shrink-0 border-b border-[#f2efe9]">
				<Dialog.Title class="text-xl font-bold text-[#061b0e] sm:text-2xl lg:text-3xl">
					Kalkulator utroška površine
				</Dialog.Title>
				<Dialog.Description class="text-xs sm:text-sm text-[#5b5f60]">
					Proračun potrebne količine za {calculatorSelectedProduct?.name ?? 'odabrani materijal'}
				</Dialog.Description>
			</Dialog.Header>

			<div class="custom-scrollbar flex-1 overflow-y-auto overscroll-contain px-5 py-4 pb-12 sm:px-8 sm:py-6 sm:pb-12 lg:px-10 lg:py-8 lg:pb-12">
				<MaterialCalculator
					{products}
					initialProduct={calculatorSelectedProduct}
					embedded={true}
					onAddToCart={(productId, qty) => {
						addCalculatedToCart(productId, qty);
						calculatorDialogOpen = false;
					}}
				/>
			</div>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Attention-grabbing Cart Toast Bar (Bottom action bar) -->
	<CartToastBar
		{cartCount}
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
