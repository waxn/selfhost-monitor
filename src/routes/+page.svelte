<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.ico';

	let showContent = $state(false);
	let activeFeature = $state(0);

	onMount(() => {
		setTimeout(() => {
			showContent = true;
		}, 100);

		const interval = setInterval(() => {
			activeFeature = (activeFeature + 1) % 4;
		}, 3000);

		return () => clearInterval(interval);
	});

	const features = [
		{
			icon: '📡',
			title: 'Device Organization',
			description: 'Group your services by device or server. Click any device to filter and view only its services.'
		},
		{
			icon: '🔗',
			title: 'Multiple Endpoints',
			description: 'Monitor multiple URLs per service with custom labels, ping intervals, and response time tracking.'
		},
		{
			icon: '⚡',
			title: 'Live Status Tracking',
			description: 'Real-time uptime monitoring with automated health checks and instant status updates.'
		},
		{
			icon: '🏠',
			title: 'Startpage Mode',
			description: 'Transform your dashboard into a browser start page with integrated web search and quick service access.'
		}
	];
</script>

<div class="landing">
	<!-- Hero Section -->
	<section class="hero" class:show={showContent}>
		<div class="hero-content">
			<img src={favicon} alt="SelfHost Monitor" class="hero-logo" />

			<h1 class="hero-title">SelfHost Monitor</h1>

			<p class="hero-subtitle">
				Monitor your self-hosted services with style
			</p>

			<div class="cta-buttons">
				<button class="cta-primary" onclick={() => goto('/auth?mode=demo')}>
					Try Demo
				</button>
				<button class="cta-secondary" onclick={() => goto('/auth')}>
					Sign Up
				</button>
				<button class="cta-secondary" onclick={() => goto('/auth?mode=login')}>
					Login
				</button>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section class="features">
		<div class="features-content">
			<h2 class="section-title">Key Features</h2>

			<div class="features-grid">
				{#each features as feature}
					<div class="feature-card">
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

	<!-- Startpage Mode Section -->
	<section class="startpage-showcase">
		<div class="startpage-showcase-content">
			<div class="startpage-text">
				<div class="badge">New Feature</div>
				<h2>Startpage Mode</h2>
				<p class="large-text">
					Transform your dashboard into your browser's start page. Search the web with DuckDuckGo,
					access your services instantly, and monitor your infrastructure—all from one beautiful interface.
				</p>
				<ul class="feature-list">
					<li>
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
							<path d="M7 10L9 12L13 8M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="#d35400" stroke-width="2" stroke-linecap="round"/>
						</svg>
						<span>Integrated DuckDuckGo search with custom dark theme</span>
					</li>
					<li>
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
							<path d="M7 10L9 12L13 8M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="#d35400" stroke-width="2" stroke-linecap="round"/>
						</svg>
						<span>Click devices to filter services instantly</span>
					</li>
					<li>
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
							<path d="M7 10L9 12L13 8M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="#d35400" stroke-width="2" stroke-linecap="round"/>
						</svg>
						<span>Clean interface with no top bar—maximum screen space</span>
					</li>
					<li>
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
							<path d="M7 10L9 12L13 8M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="#d35400" stroke-width="2" stroke-linecap="round"/>
						</svg>
						<span>Toggle on/off anytime from settings</span>
					</li>
				</ul>
			</div>
			<div class="startpage-visual">
				<div class="startpage-mockup">
					<div class="mockup-actions">
						<div class="mockup-action-btn">+</div>
						<div class="mockup-action-btn">+</div>
						<div class="mockup-action-btn">⚙</div>
					</div>
					<div class="mockup-search">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c757d">
							<circle cx="11" cy="11" r="8" stroke-width="2"/>
							<path d="m21 21-4.35-4.35" stroke-width="2" stroke-linecap="round"/>
						</svg>
						<span>Search the web</span>
					</div>
					<div class="mockup-services">
						<div class="mockup-label">Services</div>
						<div class="mockup-service-grid">
							<div class="mockup-service">
								<div class="mockup-service-icon" style="background: linear-gradient(135deg, #0082c9 0%, #0066a1 100%);">N</div>
								<div class="mockup-service-name">Nextcloud</div>
								<div class="mockup-url-status up"></div>
							</div>
							<div class="mockup-service">
								<div class="mockup-service-icon" style="background: linear-gradient(135deg, #e5a00d 0%, #cc8b00 100%);">P</div>
								<div class="mockup-service-name">Plex</div>
								<div class="mockup-url-status up"></div>
							</div>
							<div class="mockup-service">
								<div class="mockup-service-icon" style="background: linear-gradient(135deg, #fc6d26 0%, #e24329 100%);">G</div>
								<div class="mockup-service-name">GitLab</div>
								<div class="mockup-url-status up"></div>
							</div>
						</div>
					</div>
					<div class="mockup-devices">
						<div class="mockup-label">Devices</div>
						<div class="mockup-device-item selected">
							<div class="mockup-device-name">Home Server</div>
							<div class="mockup-device-desc">Main infrastructure</div>
						</div>
						<div class="mockup-device-item">
							<div class="mockup-device-name">VPS-01</div>
							<div class="mockup-device-desc">Cloud services</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="final-cta">
		<div class="final-cta-content">
			<h2>Ready to start monitoring?</h2>
			<p>Try the demo or create your own account</p>
			<div class="cta-buttons">
				<button class="cta-primary" onclick={() => goto('/auth?mode=demo')}>
					Try Demo
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
				<button class="cta-secondary" onclick={() => goto('/auth')}>
					Get Started
				</button>
			</div>
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
			<div class="footer-links">
				<button onclick={() => goto('/terms')} class="footer-link">Terms of Service</button>
				<span class="footer-divider">•</span>
				<button onclick={() => goto('/privacy')} class="footer-link">Privacy Policy</button>
			</div>
			<div class="footer-copyright">
				© {new Date().getFullYear()} SelfHost Monitor. All rights reserved.
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
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 60px 20px;
		background: linear-gradient(180deg, #0a0e12 0%, #12161c 100%);
		opacity: 0;
		animation: fadeIn 0.6s ease-out 0.1s forwards;
	}

	@keyframes fadeIn {
		to {
			opacity: 1;
		}
	}

	.hero-content {
		max-width: 700px;
		text-align: center;
	}

	.hero-logo {
		width: 80px;
		height: 80px;
		margin-bottom: 32px;
		opacity: 0.95;
	}

	.hero-title {
		font-size: 56px;
		font-weight: 700;
		margin: 0 0 20px 0;
		color: #e8eaed;
		letter-spacing: -0.5px;
	}

	.hero-subtitle {
		font-size: 22px;
		color: #a0a4a8;
		margin: 0 0 48px 0;
		font-weight: 400;
	}

	.cta-buttons {
		display: flex;
		gap: 12px;
		justify-content: center;
		flex-wrap: wrap;
	}

	.cta-primary,
	.cta-secondary {
		padding: 14px 28px;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}

	.cta-primary {
		background: #d35400;
		color: white;
	}

	.cta-primary:hover {
		background: #e05f00;
		transform: translateY(-1px);
	}

	.cta-secondary {
		background: transparent;
		border: 1px solid #3a3f47;
		color: #e8eaed;
	}

	.cta-secondary:hover {
		background: #1a1e24;
		border-color: #4a5059;
	}

	/* Features Section */
	.features {
		padding: 100px 20px;
		background: #0a0e12;
	}

	.features-content {
		max-width: 1200px;
		margin: 0 auto;
	}

	.section-title {
		font-size: 36px;
		font-weight: 600;
		text-align: center;
		margin: 0 0 60px 0;
		color: #e8eaed;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 24px;
	}

	.feature-card {
		background: #12161c;
		border: 1px solid #1e2329;
		border-radius: 12px;
		padding: 32px;
		text-align: center;
		transition: all 0.2s;
	}

	.feature-card:hover {
		border-color: #3a3f47;
		transform: translateY(-2px);
	}

	.feature-icon {
		font-size: 48px;
		margin-bottom: 20px;
		display: inline-block;
	}

	.feature-card h3 {
		font-size: 20px;
		font-weight: 600;
		margin: 0 0 12px 0;
		color: #e8eaed;
	}

	.feature-card p {
		font-size: 15px;
		color: #a0a4a8;
		line-height: 1.6;
		margin: 0;
	}

	/* Stats Section */
	.stats {
		padding: 80px 20px;
		background: #0d1117;
		border-top: 1px solid #1e2329;
		border-bottom: 1px solid #1e2329;
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
		font-size: 48px;
		font-weight: 700;
		color: #d35400;
		margin-bottom: 8px;
	}

	.stat-label {
		font-size: 16px;
		color: #a0a4a8;
		font-weight: 400;
	}

	.stat-divider {
		width: 1px;
		height: 60px;
		background: #1e2329;
	}

	/* Benefits Section */
	.benefits {
		padding: 100px 20px;
		background: #0a0e12;
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

	/* Startpage Showcase Section */
	.startpage-showcase {
		padding: 100px 20px;
		background: #0d1117;
		border-top: 1px solid #1e2329;
	}

	.startpage-showcase-content {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 80px;
		align-items: center;
		position: relative;
		z-index: 1;
	}

	.startpage-text {
		padding-right: 20px;
	}

	.badge {
		display: inline-block;
		padding: 6px 16px;
		background: linear-gradient(135deg, rgba(211, 84, 0, 0.2) 0%, rgba(211, 84, 0, 0.1) 100%);
		border: 1px solid #d35400;
		border-radius: 20px;
		color: #d35400;
		font-size: 13px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 24px;
	}

	.startpage-text h2 {
		font-size: 42px;
		font-weight: 700;
		margin: 0 0 24px 0;
		color: #e8eaed;
	}

	.large-text {
		font-size: 20px;
		color: #a0a4a8;
		line-height: 1.8;
		margin: 0 0 32px 0;
	}

	.feature-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.feature-list li {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		font-size: 16px;
		color: #e8eaed;
		line-height: 1.6;
	}

	.feature-list svg {
		flex-shrink: 0;
		margin-top: 2px;
	}

	.startpage-visual {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.startpage-mockup {
		width: 100%;
		max-width: 500px;
		background: linear-gradient(145deg, #1e2329 0%, #0a0e12 100%);
		border: 1px solid #3a3f47;
		border-radius: 20px;
		padding: 30px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
		position: relative;
	}

	.mockup-actions {
		position: absolute;
		top: 24px;
		right: 24px;
		display: flex;
		gap: 8px;
	}

	.mockup-action-btn {
		width: 36px;
		height: 36px;
		background: rgba(45, 51, 57, 0.8);
		border: 1px solid #3a3f47;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #6c757d;
		font-size: 18px;
		transition: all 0.2s;
	}

	.mockup-action-btn:hover {
		border-color: #d35400;
		color: #d35400;
	}

	.mockup-search {
		width: 100%;
		padding: 14px 20px 14px 48px;
		background: rgba(45, 51, 57, 0.8);
		border: 2px solid #3a3f47;
		border-radius: 24px;
		margin-bottom: 32px;
		display: flex;
		align-items: center;
		gap: 12px;
		position: relative;
		transition: all 0.3s;
	}

	.mockup-search svg {
		position: absolute;
		left: 16px;
	}

	.mockup-search span {
		color: #6c757d;
		font-size: 14px;
	}

	.mockup-search:hover {
		border-color: #d35400;
		box-shadow: 0 4px 16px rgba(211, 84, 0, 0.2);
	}

	.mockup-label {
		font-size: 15px;
		font-weight: 600;
		color: #e8eaed;
		margin-bottom: 12px;
	}

	.mockup-services {
		margin-bottom: 24px;
	}

	.mockup-service-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
	}

	.mockup-service {
		background: linear-gradient(145deg, #1e2329 0%, #1a1e24 100%);
		border: 1px solid #3a3f47;
		border-radius: 12px;
		padding: 16px 10px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		transition: all 0.2s;
	}

	.mockup-service:hover {
		border-color: #d35400;
		transform: translateY(-2px);
	}

	.mockup-service-icon {
		width: 36px;
		height: 36px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 16px;
		font-weight: bold;
		color: white;
	}

	.mockup-service-name {
		font-size: 11px;
		font-weight: 600;
		color: #e8eaed;
	}

	.mockup-url-status {
		width: 100%;
		height: 20px;
		background: #2d3339;
		border: 1px solid #3a3f47;
		border-radius: 5px;
		position: relative;
	}

	.mockup-url-status::before {
		content: '';
		position: absolute;
		left: 6px;
		top: 50%;
		transform: translateY(-50%);
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: #229954;
		box-shadow: 0 0 6px rgba(34, 153, 84, 0.6);
	}

	.mockup-url-status.up::before {
		background: #229954;
		box-shadow: 0 0 6px rgba(34, 153, 84, 0.6);
	}

	.mockup-devices {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.mockup-device-item {
		background: #2d3339;
		border: 1px solid #3a3f47;
		border-radius: 10px;
		padding: 12px 14px;
		transition: all 0.2s;
		cursor: pointer;
	}

	.mockup-device-item:hover {
		border-color: #d35400;
	}

	.mockup-device-item.selected {
		border-color: #d35400;
		background: linear-gradient(145deg, #343a41 0%, #2d3339 100%);
		box-shadow: 0 0 16px rgba(211, 84, 0, 0.3);
	}

	.mockup-device-item.selected .mockup-device-name {
		color: #d35400;
	}

	.mockup-device-name {
		font-size: 13px;
		font-weight: 600;
		color: #e8eaed;
		margin-bottom: 2px;
	}

	.mockup-device-desc {
		font-size: 11px;
		color: #6c757d;
	}

	/* Final CTA Section */
	.final-cta {
		padding: 100px 20px;
		background: #0a0e12;
		border-top: 1px solid #1e2329;
	}

	.final-cta-content {
		max-width: 800px;
		margin: 0 auto;
		text-align: center;
	}

	.final-cta h2 {
		font-size: 36px;
		font-weight: 600;
		margin: 0 0 16px 0;
		color: #e8eaed;
	}

	.final-cta p {
		font-size: 18px;
		color: #a0a4a8;
		margin: 0 0 40px 0;
	}

	/* Footer */
	.footer {
		padding: 60px 20px;
		background: #0a0e12;
		border-top: 1px solid #1e2329;
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
		margin-bottom: 16px;
	}

	.footer-links {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		margin-bottom: 12px;
	}

	.footer-link {
		background: transparent;
		border: none;
		color: #a0a4a8;
		font-size: 14px;
		cursor: pointer;
		transition: color 0.2s;
		padding: 0;
	}

	.footer-link:hover {
		color: #d35400;
	}

	.footer-divider {
		color: #3a3f47;
	}

	.footer-copyright {
		color: #6c757d;
		font-size: 13px;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.hero-logo {
			width: 64px;
			height: 64px;
		}

		.hero-title {
			font-size: 40px;
		}

		.hero-subtitle {
			font-size: 18px;
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

		.startpage-showcase {
			padding: 80px 20px;
		}

		.startpage-showcase-content {
			grid-template-columns: 1fr;
			gap: 40px;
		}

		.startpage-text {
			padding-right: 0;
		}

		.startpage-text h2 {
			font-size: 36px;
		}

		.large-text {
			font-size: 18px;
		}

		.mockup-service-grid {
			grid-template-columns: 1fr;
		}

		.mockup-actions {
			top: 16px;
			right: 16px;
		}

		.mockup-action-btn {
			width: 32px;
			height: 32px;
			font-size: 16px;
		}
	}
</style>
