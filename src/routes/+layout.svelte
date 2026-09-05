<script lang="ts">
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Sezzam | Webshop WPC Decking, SPC/LVT Podne i Zidne Obloge BiH</title>
	<meta
		name="description"
		content="Sezzam - Specijalizovani webshop za vrhunski WPC decking za terase i bazene, SPC i LVT podne obloge, te moderne zidne obloge u BiH. Brza narudžba i dostava."
	/>
	<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
	<link rel="icon" type="image/png" sizes="192x192" href="/favicon.png" />
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>
{@render children()}
