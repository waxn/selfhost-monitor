<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

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
		<h2>{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
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

			<button class="cta-primary" on:click={submit}>{mode === 'login' ? 'Sign in' : 'Register'}</button>

			<div class="demo-separator">
				<span>OR</span>
			</div>

			<button class="cta-demo" on:click={loginAsDemo}>
				🎭 Try Demo Account
			</button>
		{/if}

		<div class="switch">
			{#if mode === 'login'}
				<span>Don't have an account?</span>
				<button class="link" on:click={() => { mode = 'register'; error = null; }}>Create one</button>
			{:else}
				<span>Already have an account?</span>
				<button class="link" on:click={() => { mode = 'login'; error = null; }}>Sign in</button>
			{/if}
		</div>

		{#if mode === 'register'}
			<div class="legal-notice">
				By registering, you agree to our
				<button class="legal-link" on:click={() => goto('/terms')}>Terms of Service</button>
				and
				<button class="legal-link" on:click={() => goto('/privacy')}>Privacy Policy</button>
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
		background: linear-gradient(180deg, #071018 0%, #051019 100%);
	}

	.auth-card {
		background: #0b1116;
		padding: 24px;
		border-radius: 12px;
		width: 340px;
		box-shadow: 0 6px 30px rgba(0,0,0,0.6);
	}

	.auth-card h2 {
		margin: 0 0 12px 0;
	}

	.auth-card label {
		display: block;
		font-size: 13px;
		color: #98a0a8;
		margin-top: 12px;
	}

	.auth-card input {
		width: 100%;
		padding: 10px 12px;
		border-radius: 8px;
		border: 1px solid #1b2430;
		background: #071018;
		color: #e8eaed;
		margin-top: 6px;
	}

	.cta-primary {
		margin-top: 16px;
		width: 100%;
		padding: 10px;
		border-radius: 8px;
		background: linear-gradient(90deg,#d35400,#e67e22);
		border: none;
		color: white;
		font-weight: 700;
	}

	.switch {
		margin-top: 12px;
		display:flex;
		align-items:center;
		gap:8px;
	}

	.link {
		background: none;
		border: none;
		color: #57a6ff;
		cursor: pointer;
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
		margin: 20px 0;
		text-align: center;
		position: relative;
	}

	.demo-separator::before,
	.demo-separator::after {
		content: '';
		position: absolute;
		top: 50%;
		width: 40%;
		height: 1px;
		background: #1b2430;
	}

	.demo-separator::before {
		left: 0;
	}

	.demo-separator::after {
		right: 0;
	}

	.demo-separator span {
		background: #0b1116;
		padding: 0 12px;
		color: #6c757d;
		font-size: 13px;
		position: relative;
		z-index: 1;
	}

	.cta-demo {
		width: 100%;
		padding: 10px;
		border-radius: 8px;
		background: rgba(211, 84, 0, 0.15);
		border: 1px solid rgba(211, 84, 0, 0.3);
		color: #e67e22;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.cta-demo:hover {
		background: rgba(211, 84, 0, 0.25);
		border-color: #d35400;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(211, 84, 0, 0.3);
	}
</style>