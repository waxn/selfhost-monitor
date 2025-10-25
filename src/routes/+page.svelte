<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.ico';

	let showContent = $state(false);

	onMount(() => {
		setTimeout(() => {
			showContent = true;
		}, 100);
	});

	const mainFeatures = [
		{
			icon: '⚡',
			title: 'Real-time Uptime Monitoring',
			description: 'Continuous health checks with configurable intervals. Track HTTP status codes, response times, and uptime percentages with historical data.'
		},
		{
			icon: '🔗',
			title: 'Multiple Endpoints Per Service',
			description: 'Monitor web interfaces, APIs, admin panels, and more—all under one service with individual status tracking and custom labels.'
		},
		{
			icon: '📊',
			title: 'Uptime Analytics & Graphs',
			description: 'View detailed uptime history, response time graphs, and statistics with 24h, 7d, 30d, and all-time filters.'
		},
		{
			icon: '📡',
			title: 'Device Organization',
			description: 'Group services by server or device. Click any device to instantly filter and view only its services.'
		},
		{
			icon: '🎨',
			title: 'Customizable Dashboard',
			description: 'Personalize with custom backgrounds, adjust tile opacity, and drag-and-drop to rearrange service cards.'
		},
		{
			icon: '🔒',
			title: 'Encrypted Data Storage',
			description: 'Store sensitive notes and URLs with AES-256-GCM encryption. Keep credentials and configuration secure.'
		},
		{
			icon: '🏠',
			title: 'Startpage Mode',
			description: 'Transform your dashboard into a browser start page with integrated DuckDuckGo search and quick service access.'
		},
		{
			icon: '👥',
			title: 'Multi-user Support',
			description: 'Secure authentication with isolated user data. Each user gets their own services, devices, and preferences.'
		}
	];

	const techHighlights = [
		{
			title: 'Smart Health Checks',
			items: [
				'Configurable ping intervals per endpoint',
				'Response time tracking (min/max/avg)',
				'HTTP status code logging',
				'Error tracking with detailed messages',
				'Support for Cloudflare tunnels & proxies'
			]
		},
		{
			title: 'Security First',
			items: [
				'AES-256-GCM encryption for sensitive data',
				'PBKDF2-SHA256 password hashing (120k iterations)',
				'Per-user data isolation',
				'Constant-time password comparison',
				'Authorization checks on all mutations'
			]
		},
		{
			title: 'Built for Power Users',
			items: [
				'Unlimited services & endpoints',
				'Custom service icons (SVG or image URLs)',
				'Drag-and-drop layout customization',
				'Real-time updates via live queries',
				'Demo mode with auto-reset'
			]
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
				Professional uptime monitoring for your self-hosted infrastructure
			</p>

			<p class="hero-description">
				Track unlimited services and endpoints with real-time health checks, response time analytics,
				and encrypted data storage. All features included—no tiers, no limits.
			</p>

			<div class="cta-buttons">
				<button class="cta-primary" onclick={() => goto('/auth?mode=demo')}>
					Try Demo
				</button>
				<button class="cta-secondary" onclick={() => goto('/auth')}>
					Get Started
				</button>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section class="features">
		<div class="features-content">
			<h2 class="section-title">Everything You Need</h2>

			<div class="features-grid">
				{#each mainFeatures as feature}
					<div class="feature-card">
						<div class="feature-icon">{feature.icon}</div>
						<h3>{feature.title}</h3>
						<p>{feature.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Visual Demo Section -->
	<section class="visual-demo">
		<div class="visual-demo-content">
			<div class="demo-text">
				<h2>Monitor at a Glance</h2>
				<p>
					See all your services in one beautiful dashboard. Each service card shows all endpoints
					with live status indicators, response times, and uptime percentages.
				</p>
			</div>

			<div class="demo-visual">
				<div class="service-card-demo">
					<div class="card-header">
						<div class="service-icon-demo" style="background: linear-gradient(135deg, #0082c9 0%, #0066a1 100%);">
							N
						</div>
						<div class="service-info">
							<div class="service-name-demo">Nextcloud</div>
							<div class="service-device">Home Server</div>
						</div>
						<div class="menu-dots">⋮</div>
					</div>
					<div class="card-urls">
						<div class="url-item">
							<div class="url-status-indicator up"></div>
							<div class="url-label">Web Interface</div>
							<div class="url-stats">
								<span class="uptime">99.2%</span>
								<span class="response-time">45ms</span>
							</div>
						</div>
						<div class="url-item">
							<div class="url-status-indicator up"></div>
							<div class="url-label">WebDAV</div>
							<div class="url-stats">
								<span class="uptime">99.8%</span>
								<span class="response-time">32ms</span>
							</div>
						</div>
						<div class="url-item">
							<div class="url-status-indicator down"></div>
							<div class="url-label">Admin Panel</div>
							<div class="url-stats">
								<span class="uptime">0%</span>
								<span class="response-time">—</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Uptime Details Section -->
	<section class="uptime-section">
		<div class="uptime-content">
			<div class="uptime-visual">
				<div class="uptime-modal-preview">
					<div class="modal-header">
						<h3>Uptime Details</h3>
						<div class="time-filters">
							<button class="time-btn">24h</button>
							<button class="time-btn active">7d</button>
							<button class="time-btn">30d</button>
							<button class="time-btn">All</button>
						</div>
					</div>
					<div class="stats-grid">
						<div class="stat-box">
							<div class="stat-value">99.2%</div>
							<div class="stat-label">Uptime</div>
						</div>
						<div class="stat-box">
							<div class="stat-value">45ms</div>
							<div class="stat-label">Avg Response</div>
						</div>
						<div class="stat-box">
							<div class="stat-value">32ms</div>
							<div class="stat-label">Min</div>
						</div>
						<div class="stat-box">
							<div class="stat-value">156ms</div>
							<div class="stat-label">Max</div>
						</div>
					</div>
					<div class="graph-preview">
						<svg viewBox="0 0 300 80" class="response-graph">
							<polyline
								points="0,60 30,55 60,58 90,45 120,50 150,42 180,48 210,40 240,52 270,45 300,50"
								fill="none"
								stroke="#229954"
								stroke-width="2"
							/>
							<circle cx="150" cy="42" r="3" fill="#229954" />
						</svg>
					</div>
					<div class="status-bar-preview">
						{#each Array(50) as _, i}
							<div class="status-block {Math.random() > 0.05 ? 'up' : 'down'}"></div>
						{/each}
					</div>
				</div>
			</div>

			<div class="uptime-text">
				<h2>Detailed Analytics</h2>
				<p>
					Click any endpoint to view comprehensive uptime statistics and response time graphs.
					Filter by 24 hours, 7 days, 30 days, or all-time history.
				</p>
				<ul class="feature-list">
					<li>Response time graphs with min/max/average</li>
					<li>Visual uptime status bars</li>
					<li>HTTP status code tracking</li>
					<li>Error logging with timestamps</li>
					<li>Unlimited historical data retention</li>
				</ul>
			</div>
		</div>
	</section>

	<!-- Tech Details Section -->
	<section class="tech-details">
		<div class="tech-details-content">
			<h2 class="section-title">Built for Reliability</h2>

			<div class="tech-grid">
				{#each techHighlights as section}
					<div class="tech-section">
						<h3>{section.title}</h3>
						<ul>
							{#each section.items as item}
								<li>{item}</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Startpage Showcase -->
	<section class="startpage-section">
		<div class="startpage-content">
			<div class="startpage-info">
				<div class="badge">Bonus Feature</div>
				<h2>Startpage Mode</h2>
				<p class="large-text">
					Set your dashboard as your browser's start page. Search the web with DuckDuckGo while
					monitoring your infrastructure—all in one interface.
				</p>
				<ul class="feature-list">
					<li>Integrated DuckDuckGo search with custom styling</li>
					<li>Click devices to filter services instantly</li>
					<li>Clean interface with maximum screen space</li>
					<li>Toggle on/off from settings</li>
				</ul>
			</div>

			<div class="startpage-mockup">
				<div class="mockup-search-bar">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6c757d">
						<circle cx="11" cy="11" r="8" stroke-width="2"/>
						<path d="m21 21-4.35-4.35" stroke-width="2" stroke-linecap="round"/>
					</svg>
					<span>Search the web</span>
				</div>
				<div class="mockup-services-section">
					<div class="mockup-label">Services</div>
					<div class="mockup-service-row">
						<div class="mini-service">
							<div class="mini-icon" style="background: linear-gradient(135deg, #0082c9 0%, #0066a1 100%);">N</div>
							<span>Nextcloud</span>
							<div class="mini-status up"></div>
						</div>
						<div class="mini-service">
							<div class="mini-icon" style="background: linear-gradient(135deg, #e5a00d 0%, #cc8b00 100%);">P</div>
							<span>Plex</span>
							<div class="mini-status up"></div>
						</div>
						<div class="mini-service">
							<div class="mini-icon" style="background: linear-gradient(135deg, #fc6d26 0%, #e24329 100%);">G</div>
							<span>GitLab</span>
							<div class="mini-status up"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Final CTA -->
	<section class="final-cta">
		<div class="final-cta-content">
			<h2>Start Monitoring Today</h2>
			<p>Try the demo with pre-populated services, or create your own account</p>
			<div class="cta-buttons">
				<button class="cta-primary" onclick={() => goto('/auth?mode=demo')}>
					Try Demo
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
				Professional uptime monitoring for self-hosted services
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
		padding: 80px 20px;
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
		max-width: 800px;
		text-align: center;
	}

	.hero-logo {
		width: 90px;
		height: 90px;
		margin-bottom: 32px;
		opacity: 0.95;
	}

	.hero-title {
		font-size: 64px;
		font-weight: 700;
		margin: 0 0 24px 0;
		color: #e8eaed;
		letter-spacing: -1px;
	}

	.hero-subtitle {
		font-size: 26px;
		color: #d35400;
		margin: 0 0 20px 0;
		font-weight: 600;
	}

	.hero-description {
		font-size: 18px;
		color: #a0a4a8;
		margin: 0 0 48px 0;
		line-height: 1.7;
		max-width: 700px;
		margin-left: auto;
		margin-right: auto;
	}

	.cta-buttons {
		display: flex;
		gap: 16px;
		justify-content: center;
		flex-wrap: wrap;
	}

	.cta-primary,
	.cta-secondary {
		padding: 16px 32px;
		border-radius: 10px;
		font-size: 17px;
		font-weight: 600;
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
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(211, 84, 0, 0.4);
	}

	.cta-secondary {
		background: transparent;
		border: 2px solid #3a3f47;
		color: #e8eaed;
	}

	.cta-secondary:hover {
		background: #1a1e24;
		border-color: #d35400;
		transform: translateY(-2px);
	}

	/* Features Section */
	.features {
		padding: 120px 20px;
		background: #0a0e12;
	}

	.features-content {
		max-width: 1400px;
		margin: 0 auto;
	}

	.section-title {
		font-size: 42px;
		font-weight: 700;
		text-align: center;
		margin: 0 0 80px 0;
		color: #e8eaed;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 32px;
	}

	.feature-card {
		background: #12161c;
		border: 1px solid #1e2329;
		border-radius: 16px;
		padding: 40px;
		transition: all 0.3s;
	}

	.feature-card:hover {
		border-color: #d35400;
		transform: translateY(-4px);
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
	}

	.feature-icon {
		font-size: 56px;
		margin-bottom: 24px;
		display: inline-block;
	}

	.feature-card h3 {
		font-size: 22px;
		font-weight: 600;
		margin: 0 0 16px 0;
		color: #e8eaed;
	}

	.feature-card p {
		font-size: 16px;
		color: #a0a4a8;
		line-height: 1.7;
		margin: 0;
	}

	/* Visual Demo Section */
	.visual-demo {
		padding: 120px 20px;
		background: #0d1117;
		border-top: 1px solid #1e2329;
	}

	.visual-demo-content {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 80px;
		align-items: center;
	}

	.demo-text h2 {
		font-size: 42px;
		font-weight: 700;
		margin: 0 0 24px 0;
		color: #e8eaed;
	}

	.demo-text p {
		font-size: 18px;
		color: #a0a4a8;
		line-height: 1.8;
		margin: 0;
	}

	.service-card-demo {
		background: linear-gradient(145deg, #1e2329 0%, #12161c 100%);
		border: 1px solid #3a3f47;
		border-radius: 16px;
		padding: 24px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 20px;
		padding-bottom: 16px;
		border-bottom: 1px solid #3a3f47;
	}

	.service-icon-demo {
		width: 56px;
		height: 56px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28px;
		font-weight: bold;
		color: white;
		flex-shrink: 0;
	}

	.service-info {
		flex: 1;
	}

	.service-name-demo {
		font-size: 20px;
		font-weight: 600;
		color: #e8eaed;
		margin-bottom: 4px;
	}

	.service-device {
		font-size: 13px;
		color: #6c757d;
	}

	.menu-dots {
		font-size: 24px;
		color: #6c757d;
		cursor: pointer;
	}

	.card-urls {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.url-item {
		background: #2d3339;
		border: 1px solid #3a3f47;
		border-radius: 10px;
		padding: 16px;
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.url-status-indicator {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.url-status-indicator.up {
		background: #229954;
		box-shadow: 0 0 10px rgba(34, 153, 84, 0.6);
	}

	.url-status-indicator.down {
		background: #c0392b;
		box-shadow: 0 0 10px rgba(192, 57, 43, 0.6);
	}

	.url-label {
		flex: 1;
		font-size: 15px;
		font-weight: 500;
		color: #e8eaed;
	}

	.url-stats {
		display: flex;
		gap: 16px;
		align-items: center;
	}

	.uptime {
		font-size: 14px;
		font-weight: 600;
		color: #229954;
	}

	.response-time {
		font-size: 13px;
		color: #6c757d;
		font-family: monospace;
	}

	/* Uptime Section */
	.uptime-section {
		padding: 120px 20px;
		background: #0a0e12;
	}

	.uptime-content {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 80px;
		align-items: center;
	}

	.uptime-modal-preview {
		background: #1e2329;
		border: 1px solid #3a3f47;
		border-radius: 16px;
		padding: 28px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
	}

	.modal-header h3 {
		font-size: 20px;
		font-weight: 600;
		color: #e8eaed;
		margin: 0;
	}

	.time-filters {
		display: flex;
		gap: 8px;
	}

	.time-btn {
		padding: 6px 12px;
		background: #2d3339;
		border: 1px solid #3a3f47;
		border-radius: 6px;
		color: #a0a4a8;
		font-size: 13px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.time-btn.active {
		background: #d35400;
		border-color: #d35400;
		color: white;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12px;
		margin-bottom: 24px;
	}

	.stat-box {
		background: #2d3339;
		border: 1px solid #3a3f47;
		border-radius: 10px;
		padding: 16px 12px;
		text-align: center;
	}

	.stat-value {
		font-size: 22px;
		font-weight: 700;
		color: #229954;
		margin-bottom: 4px;
	}

	.stat-label {
		font-size: 11px;
		color: #6c757d;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.graph-preview {
		background: #2d3339;
		border: 1px solid #3a3f47;
		border-radius: 10px;
		padding: 20px;
		margin-bottom: 16px;
	}

	.response-graph {
		width: 100%;
		height: auto;
	}

	.status-bar-preview {
		display: flex;
		gap: 2px;
		height: 32px;
		background: #2d3339;
		border: 1px solid #3a3f47;
		border-radius: 8px;
		padding: 8px;
	}

	.status-block {
		flex: 1;
		border-radius: 2px;
	}

	.status-block.up {
		background: #229954;
	}

	.status-block.down {
		background: #c0392b;
	}

	.uptime-text h2 {
		font-size: 42px;
		font-weight: 700;
		margin: 0 0 24px 0;
		color: #e8eaed;
	}

	.uptime-text p {
		font-size: 18px;
		color: #a0a4a8;
		line-height: 1.8;
		margin: 0 0 24px 0;
	}

	.feature-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.feature-list li {
		font-size: 16px;
		color: #e8eaed;
		padding-left: 28px;
		position: relative;
	}

	.feature-list li::before {
		content: '✓';
		position: absolute;
		left: 0;
		color: #229954;
		font-weight: bold;
		font-size: 18px;
	}

	/* Tech Details Section */
	.tech-details {
		padding: 120px 20px;
		background: #0d1117;
		border-top: 1px solid #1e2329;
	}

	.tech-details-content {
		max-width: 1400px;
		margin: 0 auto;
	}

	.tech-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 40px;
	}

	.tech-section {
		background: #12161c;
		border: 1px solid #1e2329;
		border-radius: 16px;
		padding: 40px;
	}

	.tech-section h3 {
		font-size: 24px;
		font-weight: 600;
		color: #d35400;
		margin: 0 0 24px 0;
	}

	.tech-section ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.tech-section li {
		font-size: 15px;
		color: #a0a4a8;
		padding-left: 24px;
		position: relative;
		line-height: 1.6;
	}

	.tech-section li::before {
		content: '•';
		position: absolute;
		left: 0;
		color: #d35400;
		font-size: 20px;
	}

	/* Startpage Section */
	.startpage-section {
		padding: 120px 20px;
		background: #0a0e12;
	}

	.startpage-content {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 80px;
		align-items: center;
	}

	.badge {
		display: inline-block;
		padding: 8px 18px;
		background: linear-gradient(135deg, rgba(211, 84, 0, 0.2) 0%, rgba(211, 84, 0, 0.1) 100%);
		border: 1px solid #d35400;
		border-radius: 24px;
		color: #d35400;
		font-size: 13px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1px;
		margin-bottom: 24px;
	}

	.startpage-info h2 {
		font-size: 42px;
		font-weight: 700;
		margin: 0 0 24px 0;
		color: #e8eaed;
	}

	.large-text {
		font-size: 18px;
		color: #a0a4a8;
		line-height: 1.8;
		margin: 0 0 32px 0;
	}

	.startpage-mockup {
		background: linear-gradient(145deg, #1e2329 0%, #0a0e12 100%);
		border: 1px solid #3a3f47;
		border-radius: 20px;
		padding: 32px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
	}

	.mockup-search-bar {
		background: rgba(45, 51, 57, 0.8);
		border: 2px solid #3a3f47;
		border-radius: 24px;
		padding: 14px 20px 14px 48px;
		position: relative;
		margin-bottom: 32px;
		display: flex;
		align-items: center;
	}

	.mockup-search-bar svg {
		position: absolute;
		left: 16px;
	}

	.mockup-search-bar span {
		color: #6c757d;
		font-size: 15px;
	}

	.mockup-services-section {
		margin-bottom: 24px;
	}

	.mockup-label {
		font-size: 13px;
		font-weight: 600;
		color: #6c757d;
		text-transform: uppercase;
		letter-spacing: 1px;
		margin-bottom: 12px;
	}

	.mockup-service-row {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
	}

	.mini-service {
		background: linear-gradient(145deg, #1e2329 0%, #1a1e24 100%);
		border: 1px solid #3a3f47;
		border-radius: 12px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.mini-icon {
		width: 40px;
		height: 40px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 18px;
		font-weight: bold;
		color: white;
	}

	.mini-service span {
		font-size: 12px;
		font-weight: 600;
		color: #e8eaed;
	}

	.mini-status {
		width: 100%;
		height: 20px;
		background: #2d3339;
		border: 1px solid #3a3f47;
		border-radius: 5px;
		position: relative;
	}

	.mini-status::before {
		content: '';
		position: absolute;
		left: 6px;
		top: 50%;
		transform: translateY(-50%);
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #229954;
		box-shadow: 0 0 6px rgba(34, 153, 84, 0.6);
	}

	/* Final CTA */
	.final-cta {
		padding: 120px 20px;
		background: #0d1117;
		border-top: 1px solid #1e2329;
	}

	.final-cta-content {
		max-width: 800px;
		margin: 0 auto;
		text-align: center;
	}

	.final-cta h2 {
		font-size: 42px;
		font-weight: 700;
		margin: 0 0 20px 0;
		color: #e8eaed;
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
	@media (max-width: 1024px) {
		.visual-demo-content,
		.uptime-content,
		.startpage-content {
			grid-template-columns: 1fr;
			gap: 60px;
		}

		.uptime-content {
			direction: ltr;
		}

		.uptime-visual {
			order: 2;
		}

		.uptime-text {
			order: 1;
		}
	}

	@media (max-width: 768px) {
		.hero-title {
			font-size: 48px;
		}

		.hero-subtitle {
			font-size: 22px;
		}

		.hero-description {
			font-size: 16px;
		}

		.section-title {
			font-size: 36px;
		}

		.demo-text h2,
		.uptime-text h2,
		.startpage-info h2,
		.final-cta h2 {
			font-size: 36px;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.mockup-service-row {
			grid-template-columns: 1fr;
		}

		.tech-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
