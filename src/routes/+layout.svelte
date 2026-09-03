<script lang="ts">
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Sezzam | Premium WPC Decking Sistemi i Podne Obloge BiH</title>
	<meta
		name="description"
		content="Sezzam - Specijalizovani za vrhunski WPC decking za terase i bazene, te SPC i LVT podne obloge u Bosni i Hercegovini. Brza narudžba i dostava."
	/>
	<link rel="icon" type="image/png" href="/images/logo/logo.png" />
	<link rel="apple-touch-icon" href="/images/logo/logo.png" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>
{@render children()}
