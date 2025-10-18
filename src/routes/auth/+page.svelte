<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let mode: 'login' | 'register' = 'login';
	let email = '';
	let password = '';
	let name = '';
	let error: string | null = null;

	async function submit() {
		error = null;
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
		}
	}
</script>

<div class="auth-page">
	<div class="auth-card">
		<h2>{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
		{#if error}
			<div class="error">{error}</div>
		{/if}

		{#if mode === 'register'}
			<label for="name">Name</label>
			<input id="name" bind:value={name} placeholder="Your name" />
		{/if}

		<label for="email">Email</label>
		<input id="email" bind:value={email} placeholder="you@example.com" />

		<label for="password">Password</label>
		<input id="password" type="password" bind:value={password} placeholder="password" />

		<button class="cta-primary" on:click={submit}>{mode === 'login' ? 'Sign in' : 'Register'}</button>

		<div class="switch">
			{#if mode === 'login'}
				<span>Don't have an account?</span>
				<button class="link" on:click={() => { mode = 'register'; error = null; }}>Create one</button>
			{:else}
				<span>Already have an account?</span>
				<button class="link" on:click={() => { mode = 'login'; error = null; }}>Sign in</button>
			{/if}
		</div>
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
</style>