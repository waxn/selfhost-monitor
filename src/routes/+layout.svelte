<script lang="ts">
	import { browser } from '$app/environment';
	import { initConvex } from '$lib/convex.svelte';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	if (browser) {
		initConvex(import.meta.env.VITE_CONVEX_URL);
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
		background: #0f0f0f;
		color: #fff;
	}

	:global(*) {
		box-sizing: border-box;
	}
</style>
