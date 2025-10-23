<script lang="ts">
	import { browser } from '$app/environment';
	import { initConvex } from '$lib/convex.svelte';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import favicon from '$lib/assets/favicon.ico';

	let { children } = $props();

	if (browser) {
		initConvex(import.meta.env.VITE_CONVEX_URL);
		injectAnalytics();
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta property="og:title" content="Selfhost Monitor" />
	<meta property="og:description" content="Monitor your self-hosted services effortlessly." />
	<meta property="og:image" content="https://i.postimg.cc/zv2RvrP0/image.png" />
	<meta property="og:url" content="https://hlm.waxnflaxnai.com" />
	<meta property="og:type" content="website" />
	<script
	    src="https://app.rybbit.io/api/script.js"
	    data-site-id="6f908b2c2f18"
	    defer
	></script>
</svelte:head>

{@render children?.()}

<style>
	:global(html) {
		margin: 0;
		padding: 0;
		min-height: 100vh;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		background: #0a0e12;
		color: #e8eaed;
		min-height: 100vh;
	}

	:global(*) {
		box-sizing: border-box;
	}
</style>
