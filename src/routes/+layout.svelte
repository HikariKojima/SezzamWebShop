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
	<link rel="icon" href="/favicon.ico" sizes="48x48" />
	<link rel="icon" type="image/png" sizes="192x192" href="/images/logo/logo-square.png" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>
{@render children()}
