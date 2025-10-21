<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import favicon from '$lib/assets/favicon.ico';

	let mode: 'login' | 'register' = $state('login');
	let email = $state('');
	let password = $state('');
	let name = $state('');
	let error: string | null = $state(null);
	let isLoading = $state(false);

	// Check for query parameters on mount
	onMount(async () => {
		const queryMode = $page.url.searchParams.get('mode');

		// If demo mode, auto-login
		if (queryMode === 'demo') {
			isLoading = true;
			try {
				const { ConvexHttpClient } = await import('convex/browser');
				const { api } = await import('../../../convex/_generated/api');

				// Initialize Convex client
				const client = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL);

				// Try to initialize demo user (safe to call multiple times)
				try {
					await client.mutation(api.seed.initDemoUser, {});
				} catch (initError) {
					console.log('Demo init attempt:', initError);
					// Continue anyway, user might already exist
				}

				// Now try to login
				const mod = await import('$lib/convex.svelte');
				const id = await mod.login('demo@selfhost-monitor.app', 'demo');
				if (id) {
					goto('/dashboard');
					return;
				} else {
					error = 'Demo login failed. Please try again or contact administrator.';
				}
			} catch (e: any) {
				console.error('Demo login error:', e);
				error = `Demo login failed: ${e?.message ?? String(e)}`;
			} finally {
				isLoading = false;
			}
		} else if (queryMode === 'login') {
			mode = 'login';
		} else if (queryMode === 'register') {
			mode = 'register';
		}
	});

	async function submit() {
		error = null;
		isLoading = true;
		try {
			const mod = await import('$lib/convex.svelte');
			if (mode === 'login') {
				const id = await mod.login(email, password);
				if (!id) {
					error = 'Invalid credentials';
					return;
				}
			} else {
				const id = await mod.register(email, password, name || undefined);
				if (!id) {
					error = 'Could not register';
					return;
				}
			}
			goto('/dashboard');
		} catch (e: any) {
			error = e?.message ?? String(e);
		} finally {
			isLoading = false;
		}
	}

	async function loginAsDemo() {
		error = null;
		isLoading = true;
		try {
			const { ConvexHttpClient } = await import('convex/browser');
			const { api } = await import('../../../convex/_generated/api');

			// Initialize Convex client
			const client = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL);

			// Try to initialize demo user (safe to call multiple times)
			try {
				await client.mutation(api.seed.initDemoUser, {});
			} catch (initError) {
				console.log('Demo init attempt:', initError);
				// Continue anyway, user might already exist
			}

			// Now try to login
			const mod = await import('$lib/convex.svelte');
			const id = await mod.login('demo@selfhost-monitor.app', 'demo');
			if (id) {
				goto('/dashboard');
			} else {
				error = 'Demo login failed. Please try again or contact administrator.';
			}
		} catch (e: any) {
			console.error('Demo login error:', e);
			error = `Demo login failed: ${e?.message ?? String(e)}`;
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="auth-page">
	<div class="auth-card">
		<a href="/" class="logo-link">
			<img src={favicon} alt="SelfHost Monitor" class="auth-logo" />
		</a>

		<div class="mode-switcher">
			<button
				class="mode-btn"
				class:active={mode === 'login'}
				onclick={() => { mode = 'login'; error = null; }}
			>
				Sign In
			</button>
			<button
				class="mode-btn"
				class:active={mode === 'register'}
				onclick={() => { mode = 'register'; error = null; }}
			>
				Sign Up
			</button>
		</div>

		{#if error}
			<div class="error">{error}</div>
		{/if}

		{#if isLoading}
			<div class="loading-message">Loading...</div>
		{:else}
			{#if mode === 'register'}
				<label for="name">Name</label>
				<input id="name" bind:value={name} placeholder="Your name" />
			{/if}

			<label for="email">Email</label>
			<input id="email" bind:value={email} placeholder="you@example.com" />

			<label for="password">Password</label>
			<input id="password" type="password" bind:value={password} placeholder="password" />

			<button class="cta-primary" onclick={submit}>{mode === 'login' ? 'Sign in' : 'Register'}</button>

			<div class="demo-separator">
				<span>OR</span>
			</div>

			<button class="cta-demo" onclick={loginAsDemo}>
				🎭 Try Demo Account
			</button>
		{/if}

		{#if mode === 'register'}
			<div class="legal-notice">
				By registering, you agree to our
				<button class="legal-link" onclick={() => goto('/terms')}>Terms of Service</button>
				and
				<button class="legal-link" onclick={() => goto('/privacy')}>Privacy Policy</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.auth-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #0a0e12;
	}

	.auth-card {
		background: #12161c;
		border: 1px solid #1e2329;
		padding: 40px;
		border-radius: 12px;
		width: 100%;
		max-width: 400px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
	}

	.logo-link {
		display: flex;
		justify-content: center;
		margin-bottom: 32px;
		transition: opacity 0.2s;
	}

	.logo-link:hover {
		opacity: 0.8;
	}

	.auth-logo {
		width: 56px;
		height: 56px;
	}

	.mode-switcher {
		display: flex;
		background: #0a0e12;
		border-radius: 8px;
		padding: 4px;
		margin-bottom: 24px;
		gap: 4px;
	}

	.mode-btn {
		flex: 1;
		padding: 10px;
		background: transparent;
		border: none;
		color: #a0a4a8;
		font-size: 14px;
		font-weight: 500;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.mode-btn:hover {
		color: #e8eaed;
	}

	.mode-btn.active {
		background: #d35400;
		color: white;
	}

	.auth-card label {
		display: block;
		font-size: 14px;
		color: #a0a4a8;
		margin-top: 16px;
		margin-bottom: 6px;
		font-weight: 500;
	}

	.auth-card input {
		width: 100%;
		padding: 12px;
		border-radius: 8px;
		border: 1px solid #1e2329;
		background: #0a0e12;
		color: #e8eaed;
		font-size: 15px;
		transition: all 0.2s;
	}

	.auth-card input:focus {
		outline: none;
		border-color: #d35400;
	}

	.cta-primary {
		margin-top: 24px;
		width: 100%;
		padding: 12px;
		border-radius: 8px;
		background: #d35400;
		border: none;
		color: white;
		font-weight: 600;
		font-size: 15px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.cta-primary:hover {
		background: #e05f00;
		transform: translateY(-1px);
	}

	.error {
		color: #ff7b7b;
		margin-bottom: 8px;
	}

	.legal-notice {
		margin-top: 16px;
		padding-top: 16px;
		border-top: 1px solid #1b2430;
		font-size: 12px;
		color: #6c757d;
		text-align: center;
		line-height: 1.5;
	}

	.legal-link {
		background: none;
		border: none;
		color: #d35400;
		cursor: pointer;
		text-decoration: underline;
		padding: 0;
		font-size: 12px;
	}

	.legal-link:hover {
		color: #e67e22;
	}

	.loading-message {
		text-align: center;
		padding: 40px 20px;
		color: #a0a4a8;
		font-size: 16px;
	}

	.demo-separator {
		margin: 24px 0;
		text-align: center;
		position: relative;
	}

	.demo-separator::before,
	.demo-separator::after {
		content: '';
		position: absolute;
		top: 50%;
		width: 42%;
		height: 1px;
		background: #1e2329;
	}

	.demo-separator::before {
		left: 0;
	}

	.demo-separator::after {
		right: 0;
	}

	.demo-separator span {
		background: #12161c;
		padding: 0 16px;
		color: #6c757d;
		font-size: 13px;
		position: relative;
		z-index: 1;
		font-weight: 500;
	}

	.cta-demo {
		width: 100%;
		padding: 12px;
		border-radius: 8px;
		background: transparent;
		border: 1px solid #3a3f47;
		color: #e8eaed;
		font-weight: 500;
		font-size: 15px;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.cta-demo:hover {
		background: #1a1e24;
		border-color: #4a5059;
		transform: translateY(-1px);
	}
</style>