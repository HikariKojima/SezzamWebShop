<script lang="ts">
	import { env } from '$env/dynamic/public';

	let {
		title = 'Sezzam | Premium WPC Decking Sistemi i Podne Obloge BiH',
		description = 'Sezzam - Specijalizovani za WPC kompozitni decking za terase, balkone i bazene, te moderne SPC i LVT podne obloge u BiH. Brza narudžba i dostava.',
		keywords = 'wpc decking, decking sistemi, wpc decking bih, wpc decking sarajevo, podne obloge, spc podovi, lvt podovi, lvt, wpc daske za terase, sezzam, sezzam ba, terase i bazeni bih',
		canonical = '',
		image = '/images/logo/logo.png',
		type = 'website',
		jsonLd = null
	}: {
		title?: string;
		description?: string;
		keywords?: string;
		canonical?: string;
		image?: string;
		type?: string;
		jsonLd?: Record<string, unknown> | Record<string, unknown>[] | null;
	} = $props();

	const siteUrl = (env.PUBLIC_SITE_URL || 'https://sezzam.ba').replace(/\/$/, '');
	const fullCanonical = $derived(
		canonical ? (canonical.startsWith('http') ? canonical : `${siteUrl}${canonical}`) : siteUrl
	);
	const fullImageUrl = $derived(image.startsWith('http') ? image : `${siteUrl}${image}`);
</script>

<svelte:head>
	<!-- Osnovni SEO meta tagovi -->
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="keywords" content={keywords} />
	<link rel="canonical" href={fullCanonical} />

	<!-- Geografski tagovi za lokalno rangiranje u BiH -->
	<meta name="geo.region" content="BA" />
	<meta name="geo.placename" content="Bosna i Hercegovina" />
	<meta name="geo.position" content="43.8563;18.4131" />
	<meta name="ICBM" content="43.8563, 18.4131" />

	<!-- Roboti -->
	<meta
		name="robots"
		content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
	/>

	<!-- Open Graph (Facebook, WhatsApp, Viber, iMessage) -->
	<meta property="og:type" content={type} />
	<meta property="og:site_name" content="Sezzam" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={fullCanonical} />
	<meta property="og:image" content={fullImageUrl} />
	<meta property="og:locale" content="bs_BA" />

	<!-- Twitter Cards -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={fullImageUrl} />

	<!-- Google Structured Data (JSON-LD) -->
	{#if jsonLd}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}<` + `/script>`}
	{/if}
</svelte:head>
