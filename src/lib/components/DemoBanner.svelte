<script lang="ts">
	let dismissed = $state(false);

	function dismiss() {
		dismissed = true;
	}
</script>

{#if !dismissed}
	<div class="demo-banner">
		<div class="demo-content">
			<div class="demo-icon">🎭</div>
			<div class="demo-text">
				<div class="demo-title">Demo Mode Active</div>
				<div class="demo-description">
					You're viewing the demo account. Feel free to explore and make changes - all data resets
					every 30 minutes.
				</div>
			</div>
			<button class="demo-dismiss" onclick={dismiss} aria-label="Dismiss banner">×</button>
		</div>
	</div>
{/if}

<style>
	.demo-banner {
		background: linear-gradient(135deg, rgba(211, 84, 0, 0.15) 0%, rgba(230, 126, 34, 0.15) 100%);
		border: 1px solid rgba(211, 84, 0, 0.3);
		border-radius: 12px;
		padding: 16px;
		margin-bottom: 24px;
		backdrop-filter: blur(10px);
		animation: slideDown 0.3s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.demo-content {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.demo-icon {
		font-size: 32px;
		flex-shrink: 0;
	}

	.demo-text {
		flex: 1;
	}

	.demo-title {
		font-size: 16px;
		font-weight: 600;
		color: #e8eaed;
		margin-bottom: 4px;
	}

	.demo-description {
		font-size: 14px;
		color: #a0a4a8;
		line-height: 1.5;
	}

	.demo-dismiss {
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: #a0a4a8;
		width: 32px;
		height: 32px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 24px;
		line-height: 1;
		padding: 0;
		transition: all 0.2s;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.demo-dismiss:hover {
		background: rgba(211, 84, 0, 0.2);
		border-color: #d35400;
		color: #e8eaed;
	}

	@media (max-width: 768px) {
		.demo-content {
			flex-direction: column;
			text-align: center;
		}

		.demo-dismiss {
			align-self: flex-end;
			position: absolute;
			top: 12px;
			right: 12px;
		}

		.demo-banner {
			position: relative;
			padding: 20px;
		}
	}
</style>
