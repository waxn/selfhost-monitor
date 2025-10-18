<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let showContent = $state(false);
	let activeFeature = $state(0);

	onMount(() => {
		setTimeout(() => {
			showContent = true;
		}, 100);

		const interval = setInterval(() => {
			activeFeature = (activeFeature + 1) % 3;
		}, 3000);

		return () => clearInterval(interval);
	});

	const features = [
		{
			icon: '📡',
			title: 'Device Organization',
			description: 'Group your services by device or server for easy management and monitoring'
		},
		{
			icon: '🔗',
			title: 'Multiple Endpoints',
			description: 'Monitor multiple URLs per service with custom labels and ping intervals'
		},
		{
			icon: '⚡',
			title: 'Live Status Tracking',
			description: 'See real-time status indicators and response times for all your endpoints'
		}
	];
</script>

<div class="landing">
	<!-- Hero Section -->
	<section class="hero" class:show={showContent}>
		<div class="hero-background">
			<div class="gradient-orb orb-1"></div>
			<div class="gradient-orb orb-2"></div>
			<div class="gradient-orb orb-3"></div>
		</div>

		<div class="hero-content">
			<div class="logo">
				<div class="logo-icon">📡</div>
				<h1 class="logo-text">SelfHost Monitor</h1>
			</div>

			<p class="tagline">Keep your self-hosted services running smoothly</p>

			<p class="description">
				Organize your services by device, monitor multiple endpoints, and track their status—all in one
				beautiful dashboard.
			</p>

			<div class="cta-buttons">
				<button class="cta-primary" onclick={() => goto('/auth')}>
					Get Started
					<svg
						width="20"
						height="20"
						viewBox="0 0 20 20"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M7.5 15L12.5 10L7.5 5"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
				<button class="cta-secondary login-btn" onclick={() => goto('/auth')}>
					Login
				</button>
			</div>
		</div>

		<div class="scroll-indicator">
			<div class="scroll-arrow"></div>
		</div>
	</section>

	<!-- Features Section -->
	<section class="features">
		<div class="features-content">
			<h2 class="section-title">Everything you need to monitor your infrastructure</h2>

			<div class="features-grid">
				{#each features as feature, i}
					<div class="feature-card" class:active={activeFeature === i}>
						<div class="feature-icon">{feature.icon}</div>
						<h3>{feature.title}</h3>
						<p>{feature.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Stats Section -->
	<section class="stats">
		<div class="stats-content">
			<div class="stat-item">
				<div class="stat-number">Unlimited</div>
				<div class="stat-label">Devices & Services</div>
			</div>
			<div class="stat-divider"></div>
			<div class="stat-item">
				<div class="stat-number">Multiple</div>
				<div class="stat-label">URLs Per Service</div>
			</div>
			<div class="stat-divider"></div>
			<div class="stat-item">
				<div class="stat-number">Real-time</div>
				<div class="stat-label">Status Updates</div>
			</div>
		</div>
	</section>

	<!-- Benefits Section -->
	<section class="benefits">
		<div class="benefits-content">
			<div class="benefit-item">
				<div class="benefit-visual">
					<div class="dashboard-preview">
						<div class="preview-header">
							<div class="preview-title">Service Monitor</div>
							<div class="preview-buttons">
								<div class="preview-btn small"></div>
								<div class="preview-btn"></div>
							</div>
						</div>
						<div class="devices-preview">
							<div class="device-card">
								<div class="device-name">Home Server</div>
								<div class="device-desc">Main infrastructure</div>
							</div>
							<div class="device-card">
								<div class="device-name">VPS-01</div>
								<div class="device-desc">Cloud services</div>
							</div>
						</div>
						<div class="services-preview">
							<div class="service-card-preview">
								<div class="service-icon-small">N</div>
								<div class="service-name">Nextcloud</div>
								<div class="url-status up"></div>
								<div class="url-status up"></div>
							</div>
							<div class="service-card-preview">
								<div class="service-icon-small">P</div>
								<div class="service-name">Plex</div>
								<div class="url-status up"></div>
							</div>
							<div class="service-card-preview">
								<div class="service-icon-small">G</div>
								<div class="service-name">GitLab</div>
								<div class="url-status down"></div>
								<div class="url-status up"></div>
							</div>
						</div>
					</div>
				</div>
				<div class="benefit-text">
					<h3>Beautiful Dashboard</h3>
					<p>
						Organize your services by device, add custom icons, and manage everything
						from one intuitive interface with real-time status indicators.
					</p>
				</div>
			</div>

			<div class="benefit-item reverse">
				<div class="benefit-visual">
					<div class="endpoint-preview">
						<div class="endpoint-header">
							<div class="endpoint-title">Service Endpoints</div>
						</div>
						<div class="endpoint-list">
							<div class="endpoint-item">
								<div class="endpoint-status-dot up"></div>
								<div class="endpoint-info">
									<div class="endpoint-label">Web Interface</div>
									<div class="endpoint-url">https://cloud.example.com</div>
								</div>
								<div class="endpoint-time">45ms</div>
							</div>
							<div class="endpoint-item">
								<div class="endpoint-status-dot up"></div>
								<div class="endpoint-info">
									<div class="endpoint-label">API</div>
									<div class="endpoint-url">https://api.example.com</div>
								</div>
								<div class="endpoint-time">23ms</div>
							</div>
							<div class="endpoint-item">
								<div class="endpoint-status-dot down"></div>
								<div class="endpoint-info">
									<div class="endpoint-label">Admin Panel</div>
									<div class="endpoint-url">https://admin.example.com</div>
								</div>
								<div class="endpoint-time">—</div>
							</div>
						</div>
					</div>
				</div>
				<div class="benefit-text">
					<h3>Multiple Endpoints</h3>
					<p>
						Monitor multiple URLs for each service with custom labels, view response times,
						and quickly identify which endpoints are up or down.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="final-cta">
		<div class="final-cta-content">
			<h2>Ready to start monitoring?</h2>
			<p>Start tracking your infrastructure now</p>
			<button class="cta-primary" onclick={() => goto('/dashboard')}>
				Go to Dashboard
				<svg
					width="20"
					height="20"
					viewBox="0 0 20 20"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M7.5 15L12.5 10L7.5 5"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
		</div>
	</section>

	<!-- Footer -->
	<footer class="footer">
		<div class="footer-content">
			<div class="footer-logo">
				<div class="footer-icon">📡</div>
				<span>SelfHost Monitor</span>
			</div>
			<div class="footer-text">
				Organize and monitor your self-hosted services with real-time status tracking.
			</div>
		</div>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow-x: hidden;
		background: #0a0e12;
		color: #e8eaed;
	}

	.landing {
		width: 100%;
		overflow-x: hidden;
	}

	/* Hero Section */
	.hero {
		min-height: 100vh;
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40px 20px;
		overflow: hidden;
		opacity: 0;
		transform: translateY(20px);
		transition:
			opacity 0.8s ease-out,
			transform 0.8s ease-out;
	}

	.hero.show {
		opacity: 1;
		transform: translateY(0);
	}

	.hero-background {
		position: absolute;
		inset: 0;
		overflow: hidden;
		z-index: 0;
	}

	.gradient-orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(80px);
		opacity: 0.3;
		animation: float 20s ease-in-out infinite;
	}

	.orb-1 {
		width: 500px;
		height: 500px;
		background: radial-gradient(circle, #d35400 0%, transparent 70%);
		top: -250px;
		right: -250px;
		animation-delay: 0s;
	}

	.orb-2 {
		width: 400px;
		height: 400px;
		background: radial-gradient(circle, #3498db 0%, transparent 70%);
		bottom: -200px;
		left: -200px;
		animation-delay: -7s;
	}

	.orb-3 {
		width: 350px;
		height: 350px;
		background: radial-gradient(circle, #9b59b6 0%, transparent 70%);
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		animation-delay: -14s;
	}

	@keyframes float {
		0%,
		100% {
			transform: translate(0, 0) scale(1);
		}
		33% {
			transform: translate(30px, -30px) scale(1.1);
		}
		66% {
			transform: translate(-20px, 20px) scale(0.9);
		}
	}

	.hero-content {
		position: relative;
		z-index: 1;
		max-width: 900px;
		text-align: center;
	}

	.logo {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16px;
		margin-bottom: 24px;
		animation: slideDown 0.6s ease-out 0.2s both;
	}

	.logo-icon {
		font-size: 48px;
		animation: bounce 2s ease-in-out infinite;
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}

	.logo-text {
		font-size: 48px;
		font-weight: 800;
		margin: 0;
		background: linear-gradient(135deg, #d35400 0%, #e67e22 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.tagline {
		font-size: 32px;
		font-weight: 600;
		margin: 0 0 24px 0;
		color: #e8eaed;
		animation: slideDown 0.6s ease-out 0.3s both;
	}

	.description {
		font-size: 20px;
		color: #a0a4a8;
		margin: 0 0 48px 0;
		line-height: 1.6;
		animation: slideDown 0.6s ease-out 0.4s both;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.cta-buttons {
		display: flex;
		gap: 16px;
		justify-content: center;
		flex-wrap: wrap;
		animation: slideUp 0.6s ease-out 0.5s both;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.cta-primary,
	.cta-secondary {
		padding: 16px 32px;
		border-radius: 12px;
		font-size: 18px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		border: none;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.cta-primary {
		background: linear-gradient(135deg, #d35400 0%, #c54d00 100%);
		color: white;
		box-shadow:
			0 4px 16px rgba(211, 84, 0, 0.4),
			0 0 40px rgba(211, 84, 0, 0.2);
	}

	.cta-primary:hover {
		transform: translateY(-2px);
		box-shadow:
			0 8px 24px rgba(211, 84, 0, 0.6),
			0 0 60px rgba(211, 84, 0, 0.3);
	}

	.cta-secondary {
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: #e8eaed;
	}

	.cta-secondary:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: #d35400;
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(211, 84, 0, 0.3);
	}

	.scroll-indicator {
		position: absolute;
		bottom: 40px;
		left: 50%;
		transform: translateX(-50%);
		animation: fadeIn 1s ease-out 1s both;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.scroll-arrow {
		width: 24px;
		height: 24px;
		border-right: 2px solid #d35400;
		border-bottom: 2px solid #d35400;
		transform: rotate(45deg);
		animation: scrollBounce 2s ease-in-out infinite;
	}

	@keyframes scrollBounce {
		0%,
		100% {
			transform: rotate(45deg) translateY(0);
		}
		50% {
			transform: rotate(45deg) translateY(10px);
		}
	}

	/* Features Section */
	.features {
		padding: 120px 20px;
		background: linear-gradient(180deg, #0a0e12 0%, #1a1f26 100%);
	}

	.features-content {
		max-width: 1200px;
		margin: 0 auto;
	}

	.section-title {
		font-size: 42px;
		font-weight: 700;
		text-align: center;
		margin: 0 0 80px 0;
		background: linear-gradient(135deg, #e8eaed 0%, #a0a4a8 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 40px;
	}

	.feature-card {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 24px;
		padding: 40px;
		text-align: center;
		transition: all 0.4s ease;
		backdrop-filter: blur(10px);
	}

	.feature-card.active {
		background: rgba(211, 84, 0, 0.1);
		border-color: #d35400;
		transform: translateY(-8px);
		box-shadow:
			0 16px 40px rgba(211, 84, 0, 0.2),
			0 0 60px rgba(211, 84, 0, 0.1);
	}

	.feature-card:hover {
		transform: translateY(-8px);
		border-color: #d35400;
	}

	.feature-icon {
		font-size: 64px;
		margin-bottom: 24px;
		display: inline-block;
		animation: bounce 2s ease-in-out infinite;
	}

	.feature-card h3 {
		font-size: 24px;
		font-weight: 600;
		margin: 0 0 16px 0;
		color: #e8eaed;
	}

	.feature-card p {
		font-size: 16px;
		color: #a0a4a8;
		line-height: 1.6;
		margin: 0;
	}

	/* Stats Section */
	.stats {
		padding: 80px 20px;
		background: #0a0e12;
	}

	.stats-content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		justify-content: space-around;
		align-items: center;
		flex-wrap: wrap;
		gap: 40px;
	}

	.stat-item {
		text-align: center;
	}

	.stat-number {
		font-size: 56px;
		font-weight: 800;
		background: linear-gradient(135deg, #d35400 0%, #e67e22 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: 8px;
	}

	.stat-label {
		font-size: 18px;
		color: #a0a4a8;
		font-weight: 500;
	}

	.stat-divider {
		width: 1px;
		height: 80px;
		background: linear-gradient(180deg, transparent 0%, #3a3f47 50%, transparent 100%);
	}

	/* Benefits Section */
	.benefits {
		padding: 120px 20px;
		background: linear-gradient(180deg, #0a0e12 0%, #1a1f26 100%);
	}

	.benefits-content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 120px;
	}

	.benefit-item {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 60px;
		align-items: center;
	}

	.benefit-item.reverse {
		direction: rtl;
	}

	.benefit-item.reverse > * {
		direction: ltr;
	}

	.benefit-visual {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.dashboard-preview {
		width: 100%;
		max-width: 500px;
		background: #1e2329;
		border: 1px solid #3a3f47;
		border-radius: 16px;
		padding: 20px;
		backdrop-filter: blur(10px);
	}

	.preview-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		padding-bottom: 12px;
		border-bottom: 1px solid #3a3f47;
	}

	.preview-title {
		font-size: 18px;
		font-weight: 600;
		color: #e8eaed;
	}

	.preview-buttons {
		display: flex;
		gap: 8px;
	}

	.preview-btn {
		width: 80px;
		height: 28px;
		background: linear-gradient(135deg, #d35400 0%, #c54d00 100%);
		border-radius: 6px;
		opacity: 0.8;
	}

	.preview-btn.small {
		width: 60px;
		background: transparent;
		border: 1px solid #3a3f47;
	}

	.devices-preview {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		margin-bottom: 20px;
	}

	.device-card {
		background: #2d3339;
		border: 1px solid #3a3f47;
		border-radius: 10px;
		padding: 12px;
	}

	.device-name {
		font-size: 13px;
		font-weight: 600;
		color: #e8eaed;
		margin-bottom: 4px;
	}

	.device-desc {
		font-size: 11px;
		color: #a0a4a8;
	}

	.services-preview {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
	}

	.service-card-preview {
		background: linear-gradient(145deg, #1e2329 0%, #1a1e24 100%);
		border: 1px solid #3a3f47;
		border-radius: 12px;
		padding: 16px 12px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.service-icon-small {
		width: 40px;
		height: 40px;
		background: linear-gradient(135deg, #d35400 0%, #c54d00 100%);
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 18px;
		font-weight: bold;
		color: white;
	}

	.service-name {
		font-size: 12px;
		font-weight: 600;
		color: #e8eaed;
	}

	.url-status {
		width: 100%;
		height: 24px;
		background: #2d3339;
		border: 1px solid #3a3f47;
		border-radius: 6px;
		position: relative;
	}

	.url-status::before {
		content: '';
		position: absolute;
		left: 6px;
		top: 50%;
		transform: translateY(-50%);
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #6c757d;
	}

	.url-status.up::before {
		background: #229954;
		box-shadow: 0 0 6px rgba(34, 153, 84, 0.6);
	}

	.url-status.down::before {
		background: #c0392b;
		box-shadow: 0 0 6px rgba(192, 57, 43, 0.6);
	}

	.endpoint-preview {
		width: 100%;
		max-width: 450px;
		background: #1e2329;
		border: 1px solid #3a3f47;
		border-radius: 16px;
		padding: 20px;
		backdrop-filter: blur(10px);
	}

	.endpoint-header {
		margin-bottom: 16px;
		padding-bottom: 12px;
		border-bottom: 1px solid #3a3f47;
	}

	.endpoint-title {
		font-size: 16px;
		font-weight: 600;
		color: #e8eaed;
	}

	.endpoint-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.endpoint-item {
		background: #2d3339;
		border: 1px solid #3a3f47;
		border-radius: 10px;
		padding: 14px;
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.endpoint-status-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.endpoint-status-dot.up {
		background: #229954;
		box-shadow: 0 0 8px rgba(34, 153, 84, 0.6);
	}

	.endpoint-status-dot.down {
		background: #c0392b;
		box-shadow: 0 0 8px rgba(192, 57, 43, 0.6);
	}

	.endpoint-info {
		flex: 1;
		min-width: 0;
	}

	.endpoint-label {
		font-size: 13px;
		font-weight: 600;
		color: #e8eaed;
		margin-bottom: 2px;
	}

	.endpoint-url {
		font-size: 11px;
		color: #6c757d;
		font-family: monospace;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.endpoint-time {
		font-size: 12px;
		color: #a0a4a8;
		font-weight: 500;
		flex-shrink: 0;
	}

	.benefit-text h3 {
		font-size: 36px;
		font-weight: 700;
		margin: 0 0 24px 0;
		color: #e8eaed;
	}

	.benefit-text p {
		font-size: 18px;
		color: #a0a4a8;
		line-height: 1.8;
		margin: 0;
	}

	/* Final CTA Section */
	.final-cta {
		padding: 120px 20px;
		background: linear-gradient(135deg, #1a1f26 0%, #0a0e12 100%);
		position: relative;
		overflow: hidden;
	}

	.final-cta::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent 0%,
			#d35400 50%,
			transparent 100%
		);
	}

	.final-cta-content {
		max-width: 800px;
		margin: 0 auto;
		text-align: center;
	}

	.final-cta h2 {
		font-size: 48px;
		font-weight: 800;
		margin: 0 0 24px 0;
		background: linear-gradient(135deg, #e8eaed 0%, #a0a4a8 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.final-cta p {
		font-size: 20px;
		color: #a0a4a8;
		margin: 0 0 48px 0;
	}

	/* Footer */
	.footer {
		padding: 60px 20px;
		background: #0a0e12;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
	}

	.footer-content {
		max-width: 1200px;
		margin: 0 auto;
		text-align: center;
	}

	.footer-logo {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		margin-bottom: 16px;
		font-size: 20px;
		font-weight: 600;
		color: #e8eaed;
	}

	.footer-icon {
		font-size: 24px;
	}

	.footer-text {
		color: #6c757d;
		font-size: 14px;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.logo-text {
			font-size: 32px;
		}

		.tagline {
			font-size: 24px;
		}

		.description {
			font-size: 16px;
		}

		.section-title {
			font-size: 32px;
		}

		.benefit-item,
		.benefit-item.reverse {
			grid-template-columns: 1fr;
			direction: ltr;
		}

		.stat-divider {
			display: none;
		}

		.final-cta h2 {
			font-size: 36px;
		}

		.services-preview {
			grid-template-columns: 1fr;
		}

		.devices-preview {
			grid-template-columns: 1fr;
		}

		.dashboard-preview,
		.endpoint-preview {
			max-width: 100%;
		}
	}
</style>
