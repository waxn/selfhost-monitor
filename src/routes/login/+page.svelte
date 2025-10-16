<script lang="ts">
	import { useAuthActions } from '$lib/convex.svelte';
	import { goto } from '$app/navigation';

	const { signIn } = useAuthActions();

	let email = $state('');
	let password = $state('');
	let name = $state('');
	let isSignUp = $state(false);
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const formData = new FormData();
			formData.append('email', email);
			formData.append('password', password);
			if (isSignUp) {
				formData.append('name', name);
				formData.append('flow', 'signUp');
			} else {
				formData.append('flow', 'signIn');
			}

			await signIn({
				provider: 'password',
				params: {
					email,
					password,
					...(isSignUp && { name }),
					flow: isSignUp ? 'signUp' : 'signIn',
				}
			});
			goto('/');
		} catch (e: any) {
			error = e.message || 'Authentication failed';
		} finally {
			loading = false;
		}
	}

	function toggleMode() {
		isSignUp = !isSignUp;
		error = '';
	}
</script>

<div class="login-container">
	<div class="login-card">
		<h1>Service Monitor</h1>
		<h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>

		<form onsubmit={handleSubmit}>
			{#if isSignUp}
				<div class="form-group">
					<label for="name">Name</label>
					<input
						id="name"
						type="text"
						bind:value={name}
						placeholder="Your name"
						required={isSignUp}
					/>
				</div>
			{/if}

			<div class="form-group">
				<label for="email">Email</label>
				<input id="email" type="email" bind:value={email} placeholder="you@example.com" required />
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					placeholder="••••••••"
					required
					minlength="8"
				/>
			</div>

			{#if error}
				<div class="error">{error}</div>
			{/if}

			<button type="submit" class="submit-btn" disabled={loading}>
				{loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
			</button>

			<button type="button" class="toggle-btn" onclick={toggleMode}>
				{isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
			</button>
		</form>
	</div>
</div>

<style>
	.login-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
		background: #0a0e12;
	}

	.login-card {
		background: #1e2329;
		border: 1px solid #3a3f47;
		border-radius: 16px;
		padding: 48px;
		max-width: 440px;
		width: 100%;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
	}

	h1 {
		margin: 0 0 8px 0;
		font-size: 28px;
		font-weight: 700;
		color: white;
		text-align: center;
	}

	h2 {
		margin: 0 0 32px 0;
		font-size: 18px;
		font-weight: 500;
		color: #a0a4a8;
		text-align: center;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	label {
		font-size: 14px;
		font-weight: 500;
		color: #a0a4a8;
	}

	input {
		background: #2d3339;
		border: 1px solid #3a3f47;
		border-radius: 8px;
		padding: 12px 16px;
		color: #e8eaed;
		font-size: 14px;
		font-family: inherit;
		transition: border-color 0.2s;
	}

	input:focus {
		outline: none;
		border-color: #d35400;
		box-shadow: 0 0 8px rgba(211, 84, 0, 0.3);
	}

	.error {
		background: rgba(192, 57, 43, 0.15);
		border: 1px solid #c0392b;
		border-radius: 8px;
		padding: 12px;
		color: #c0392b;
		font-size: 14px;
		text-align: center;
	}

	.submit-btn {
		background: linear-gradient(135deg, #d35400 0%, #c54d00 100%);
		border: none;
		color: white;
		padding: 12px 24px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 2px 8px rgba(211, 84, 0, 0.3);
	}

	.submit-btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(211, 84, 0, 0.5);
	}

	.submit-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.toggle-btn {
		background: transparent;
		border: none;
		color: #d35400;
		padding: 8px;
		font-size: 14px;
		cursor: pointer;
		transition: color 0.2s;
	}

	.toggle-btn:hover {
		color: #c54d00;
		text-decoration: underline;
	}
</style>
