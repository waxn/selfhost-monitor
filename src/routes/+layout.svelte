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
</svelte:head>

{@render children?.()}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		background: #0a0e12;
		color: #e8eaed;
	}

	:global(*) {
		box-sizing: border-box;
	}
</style>
