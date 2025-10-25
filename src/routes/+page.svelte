<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.ico';

	let showContent = $state(false);
	let isScrolled = $state(false);
	let activeTab = $state<'features' | 'security' | 'pricing'>('features');

	onMount(() => {
		setTimeout(() => {
			showContent = true;
		}, 100);

		// Handle scroll for header styling
		const handleScroll = () => {
			isScrolled = window.scrollY > 20;
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
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
			title: 'Optional Data Encryption',
			description: 'Optionally encrypt sensitive service URLs and notes with AES-256-GCM when you configure an encryption key.'
		},
		{
			icon: '🏠',
			title: 'Startpage Mode',
			description: 'Transform your dashboard into a browser start page with integrated DuckDuckGo search and quick service access.'
		}
	];

	const securityFeatures = [
		{
			icon: '🔒',
			title: 'AES-256-GCM Encryption (Optional)',
			description: 'Service URLs and notes can be encrypted using AES-256-GCM when you configure an encryption key. Requires setting ENCRYPTION_KEY environment variable.',
			details: [
				'12-byte random IV per encryption',
				'Base64 encoding for storage',
				'Graceful fallback if key not set'
			]
		},
		{
			icon: '🔑',
			title: 'PBKDF2 Password Hashing',
			description: 'Passwords are hashed using PBKDF2-SHA256 with 120,000 iterations and 16-byte random salts.',
			details: [
				'120,000 iterations for brute-force resistance',
				'Constant-time comparison',
				'Unique salt per password'
			]
		},
		{
			icon: '🛡️',
			title: 'Per-User Data Isolation',
			description: 'Complete data separation with authorization checks on every mutation to prevent unauthorized access.',
			details: [
				'Ownership verification on all edits',
				'Database-level user ID indexing',
				'No cross-user data leakage'
			]
		},
		{
			icon: '👥',
			title: 'Secure Multi-User Support',
			description: 'Each user gets their own isolated environment with secure authentication and session management.',
			details: [
				'Session persistence via localStorage',
				'Automatic logout on invalid sessions',
				'Demo mode with auto-reset'
			]
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
				'Support for Cloudflare tunnels & proxies',
				'10-second timeout with abort signals',
				'Automatic protocol detection'
			]
		},
		{
			title: 'Data & Analytics',
			items: [
				'Unlimited historical data retention',
				'Multiple time range filters (24h, 7d, 30d, all-time)',
				'Response time graphs with SVG rendering',
				'Visual uptime status bars',
				'Real-time updates via live queries',
				'Per-URL uptime statistics'
			]
		},
		{
			title: 'Customization & Layout',
			items: [
				'Unlimited services & endpoints',
				'Custom service icons (SVG or image URLs)',
				'Drag-and-drop layout customization',
				'9 preset background colors + custom',
				'Custom background image upload (auto-compressed)',
				'Adjustable tile opacity',
				'Layout persistence per user'
			]
		}
	];
</script>

<div class="landing">
	<!-- Floating Header -->
	<header class:scrolled={isScrolled}>
		<div class="header-content">
			<div class="logo-section">
				<img src={favicon} alt="SelfHost Monitor" class="header-logo" />
				<h1>SelfHost Monitor</h1>
			</div>

			<nav class="tabs">
				<button
					class="tab"
					class:active={activeTab === 'features'}
					onclick={() => activeTab = 'features'}
				>
					Features
				</button>
				<button
					class="tab"
					class:active={activeTab === 'security'}
					onclick={() => activeTab = 'security'}
				>
					Security
				</button>
				<button
					class="tab"
					class:active={activeTab === 'pricing'}
					onclick={() => activeTab = 'pricing'}
				>
					Pricing
				</button>
			</nav>

			<div class="header-actions">
				<button class="demo-btn" onclick={() => goto('/auth?mode=demo')}>
					Try Demo
				</button>
				<button class="signup-btn" onclick={() => goto('/auth')}>
					Sign Up
				</button>
			</div>
		</div>
	</header>

	<!-- Hero Section -->
	<section class="hero" class:show={showContent}>
		<div class="hero-content">
			<h2 class="hero-title">Professional Uptime Monitoring</h2>
			<p class="hero-subtitle">
				Track unlimited services and endpoints with real-time health checks, response time analytics,
				and encrypted data storage.
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

	<!-- Tab Content -->
	<div class="tab-content">
		{#if activeTab === 'features'}
			<!-- Features Tab -->
			<section class="section">
				<div class="section-content">
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
			<section class="section alt-bg">
				<div class="section-content">
					<div class="two-col-layout">
						<div class="col-text">
							<h2>Monitor at a Glance</h2>
							<p>
								See all your services in one beautiful dashboard. Each service card shows all endpoints
								with live status indicators, response times, and uptime percentages.
							</p>
						</div>

						<div class="col-visual">
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
				</div>
			</section>

			<!-- Uptime Analytics Section -->
			<section class="section">
				<div class="section-content">
					<div class="two-col-layout reverse">
						<div class="col-visual">
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

						<div class="col-text">
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
				</div>
			</section>

			<!-- Tech Details Section -->
			<section class="section alt-bg">
				<div class="section-content">
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

		{:else if activeTab === 'security'}
			<!-- Security Tab -->
			<section class="section">
				<div class="section-content">
					<h2 class="section-title">Security First</h2>
					<p class="section-intro">
						Your infrastructure data is sensitive. We use industry-standard encryption and security
						practices to keep your information safe.
					</p>

					<div class="security-grid">
						{#each securityFeatures as feature}
							<div class="security-card">
								<div class="security-icon">{feature.icon}</div>
								<h3>{feature.title}</h3>
								<p>{feature.description}</p>
								<ul class="security-details">
									{#each feature.details as detail}
										<li>{detail}</li>
									{/each}
								</ul>
							</div>
						{/each}
					</div>
				</div>
			</section>

			<!-- Security Architecture Section -->
			<section class="section alt-bg">
				<div class="section-content">
					<h2 class="section-title">How We Protect Your Data</h2>

					<div class="architecture-grid">
						<div class="architecture-item">
							<div class="arch-number">1</div>
							<h3>Optional Encryption at Rest</h3>
							<p>
								When configured, service URLs and notes are encrypted using AES-256-GCM before storage.
								Each piece of data gets a unique random IV for maximum security.
							</p>
						</div>

						<div class="architecture-item">
							<div class="arch-number">2</div>
							<h3>Secure Authentication</h3>
							<p>
								Passwords are hashed using PBKDF2-SHA256 with 120,000 iterations.
								Constant-time comparison prevents timing attacks.
							</p>
						</div>

						<div class="architecture-item">
							<div class="arch-number">3</div>
							<h3>Authorization Checks</h3>
							<p>
								Every database mutation verifies ownership. Users can only access
								their own data—no exceptions.
							</p>
						</div>

						<div class="architecture-item">
							<div class="arch-number">4</div>
							<h3>Data Isolation</h3>
							<p>
								All resources are indexed by user ID. Database queries automatically
								filter to show only your data.
							</p>
						</div>
					</div>
				</div>
			</section>

		{:else if activeTab === 'pricing'}
			<!-- Pricing Tab -->
			<section class="section">
				<div class="section-content">
					<h2 class="section-title">Simple, Transparent Pricing</h2>
					<p class="section-intro">
						Self-hosted and open source. No tiers, no limits, no recurring fees.
					</p>

					<div class="pricing-container">
						<div class="pricing-card">
							<div class="pricing-badge">Self-Hosted</div>
							<div class="pricing-price">
								<span class="price-amount">Free</span>
								<span class="price-period">Forever</span>
							</div>
							<div class="pricing-description">
								Deploy on your own infrastructure and get all features with no limitations.
							</div>

							<ul class="pricing-features">
								<li><span class="check">✓</span> Unlimited services & endpoints</li>
								<li><span class="check">✓</span> Unlimited users</li>
								<li><span class="check">✓</span> Real-time uptime monitoring</li>
								<li><span class="check">✓</span> Response time analytics</li>
								<li><span class="check">✓</span> Optional AES-256 encryption</li>
								<li><span class="check">✓</span> Custom backgrounds & themes</li>
								<li><span class="check">✓</span> Drag-and-drop customization</li>
								<li><span class="check">✓</span> Startpage mode</li>
								<li><span class="check">✓</span> Full source code access</li>
								<li><span class="check">✓</span> Privacy-focused analytics only</li>
							</ul>

							<div class="pricing-cta">
								<button class="cta-primary full-width" onclick={() => goto('/auth')}>
									Get Started
								</button>
								<button class="cta-secondary full-width" onclick={() => goto('/auth?mode=demo')}>
									Try Demo First
								</button>
							</div>
						</div>

						<div class="pricing-info">
							<h3>What's Included</h3>
							<p>
								SelfHost Monitor is completely free and open source. Deploy it on your own
								infrastructure and you get every feature with no artificial limitations.
							</p>

							<h4>Requirements</h4>
							<ul class="requirements-list">
								<li>Node.js environment for hosting</li>
								<li>Convex backend (free tier available)</li>
								<li>Modern web browser</li>
							</ul>

							<h4>Why Self-Hosted?</h4>
							<ul class="requirements-list">
								<li><strong>Privacy:</strong> Your data stays on your infrastructure</li>
								<li><strong>Control:</strong> Full control over your monitoring setup</li>
								<li><strong>No Limits:</strong> Monitor as many services as you need</li>
								<li><strong>Customizable:</strong> Modify the source code to fit your needs</li>
							</ul>
						</div>
					</div>
				</div>
			</section>
		{/if}
	</div>

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

	/* Floating Header */
	header {
		background: linear-gradient(145deg, #1e2329 0%, #0a0e12 100%);
		border-bottom: 1px solid #3a3f47;
		padding: 16px 24px;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		backdrop-filter: blur(10px);
		transition: all 0.3s ease;
	}

	header.scrolled {
		background: rgba(30, 35, 41, 0.95);
		backdrop-filter: blur(20px);
		border-bottom: 1px solid rgba(58, 63, 71, 0.5);
		padding: 12px 24px;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
	}

	.header-content {
		max-width: 1400px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 32px;
	}

	.logo-section {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.header-logo {
		width: 32px;
		height: 32px;
		transition: all 0.3s;
	}

	header.scrolled .header-logo {
		width: 28px;
		height: 28px;
	}

	.logo-section h1 {
		font-size: 24px;
		font-weight: 600;
		margin: 0;
		color: #e8eaed;
		transition: all 0.3s;
	}

	header.scrolled .logo-section h1 {
		font-size: 22px;
	}

	.tabs {
		display: flex;
		gap: 8px;
		background: rgba(45, 51, 57, 0.5);
		padding: 6px;
		border-radius: 12px;
	}

	.tab {
		background: transparent;
		border: none;
		color: #a0a4a8;
		padding: 10px 20px;
		border-radius: 8px;
		font-size: 15px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.tab:hover {
		color: #e8eaed;
		background: rgba(58, 63, 71, 0.5);
	}

	.tab.active {
		background: #d35400;
		color: white;
	}

	.header-actions {
		display: flex;
		gap: 12px;
	}

	.demo-btn,
	.signup-btn {
		padding: 10px 20px;
		border-radius: 8px;
		font-size: 15px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}

	.demo-btn {
		background: transparent;
		border: 1px solid #3a3f47;
		color: #e8eaed;
	}

	.demo-btn:hover {
		background: #1a1e24;
		border-color: #4a5059;
	}

	.signup-btn {
		background: #d35400;
		color: white;
	}

	.signup-btn:hover {
		background: #e05f00;
	}

	/* Hero Section */
	.hero {
		padding: 140px 20px 60px;
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
		max-width: 900px;
		margin: 0 auto;
		text-align: center;
	}

	.hero-title {
		font-size: 56px;
		font-weight: 700;
		margin: 0 0 24px 0;
		color: #e8eaed;
		letter-spacing: -1px;
	}

	.hero-subtitle {
		font-size: 20px;
		color: #a0a4a8;
		margin: 0 0 40px 0;
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

	/* Tab Content */
	.tab-content {
		min-height: 60vh;
	}

	.section {
		padding: 80px 20px;
		background: #0a0e12;
	}

	.section.alt-bg {
		background: #0d1117;
		border-top: 1px solid #1e2329;
	}

	.section-content {
		max-width: 1400px;
		margin: 0 auto;
	}

	.section-title {
		font-size: 42px;
		font-weight: 700;
		text-align: center;
		margin: 0 0 20px 0;
		color: #e8eaed;
	}

	.section-intro {
		font-size: 18px;
		color: #a0a4a8;
		text-align: center;
		margin: 0 0 60px 0;
		max-width: 700px;
		margin-left: auto;
		margin-right: auto;
	}

	/* Features Grid */
	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 32px;
		margin-top: 60px;
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

	/* Two Column Layout */
	.two-col-layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 80px;
		align-items: center;
		margin-top: 60px;
	}

	.two-col-layout.reverse {
		direction: rtl;
	}

	.two-col-layout.reverse > * {
		direction: ltr;
	}

	.col-text h2 {
		font-size: 42px;
		font-weight: 700;
		margin: 0 0 24px 0;
		color: #e8eaed;
	}

	.col-text p {
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

	/* Service Card Demo */
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

	/* Uptime Modal Preview */
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

	/* Tech Grid */
	.tech-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 40px;
		margin-top: 60px;
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

	/* Security Grid */
	.security-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 32px;
		margin-top: 60px;
	}

	.security-card {
		background: #12161c;
		border: 1px solid #1e2329;
		border-radius: 16px;
		padding: 40px;
		transition: all 0.3s;
	}

	.security-card:hover {
		border-color: #d35400;
		transform: translateY(-4px);
		box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
	}

	.security-icon {
		font-size: 56px;
		margin-bottom: 24px;
		display: inline-block;
	}

	.security-card h3 {
		font-size: 22px;
		font-weight: 600;
		margin: 0 0 16px 0;
		color: #e8eaed;
	}

	.security-card p {
		font-size: 16px;
		color: #a0a4a8;
		line-height: 1.7;
		margin: 0 0 20px 0;
	}

	.security-details {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.security-details li {
		font-size: 14px;
		color: #6c757d;
		padding-left: 20px;
		position: relative;
	}

	.security-details li::before {
		content: '→';
		position: absolute;
		left: 0;
		color: #d35400;
	}

	/* Architecture Grid */
	.architecture-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 32px;
		margin-top: 60px;
	}

	.architecture-item {
		text-align: center;
		padding: 32px;
		background: #12161c;
		border: 1px solid #1e2329;
		border-radius: 16px;
	}

	.arch-number {
		width: 56px;
		height: 56px;
		background: linear-gradient(135deg, #d35400 0%, #c54d00 100%);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28px;
		font-weight: 700;
		color: white;
		margin: 0 auto 24px;
	}

	.architecture-item h3 {
		font-size: 20px;
		font-weight: 600;
		margin: 0 0 16px 0;
		color: #e8eaed;
	}

	.architecture-item p {
		font-size: 15px;
		color: #a0a4a8;
		line-height: 1.7;
		margin: 0;
	}

	/* Pricing */
	.pricing-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 60px;
		margin-top: 60px;
		align-items: start;
	}

	.pricing-card {
		background: linear-gradient(145deg, #1e2329 0%, #12161c 100%);
		border: 2px solid #d35400;
		border-radius: 20px;
		padding: 48px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
	}

	.pricing-badge {
		display: inline-block;
		background: linear-gradient(135deg, #d35400 0%, #c54d00 100%);
		color: white;
		padding: 8px 20px;
		border-radius: 20px;
		font-size: 13px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1px;
		margin-bottom: 24px;
	}

	.pricing-price {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 20px;
	}

	.price-amount {
		font-size: 56px;
		font-weight: 700;
		color: #e8eaed;
	}

	.price-period {
		font-size: 18px;
		color: #6c757d;
	}

	.pricing-description {
		font-size: 16px;
		color: #a0a4a8;
		line-height: 1.7;
		margin-bottom: 32px;
	}

	.pricing-features {
		list-style: none;
		padding: 0;
		margin: 0 0 32px 0;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.pricing-features li {
		font-size: 15px;
		color: #e8eaed;
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.check {
		color: #229954;
		font-weight: bold;
		font-size: 18px;
	}

	.pricing-cta {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.full-width {
		width: 100%;
	}

	.pricing-info {
		background: #12161c;
		border: 1px solid #1e2329;
		border-radius: 16px;
		padding: 40px;
	}

	.pricing-info h3 {
		font-size: 24px;
		font-weight: 600;
		margin: 0 0 16px 0;
		color: #e8eaed;
	}

	.pricing-info h4 {
		font-size: 18px;
		font-weight: 600;
		margin: 32px 0 12px 0;
		color: #e8eaed;
	}

	.pricing-info p {
		font-size: 15px;
		color: #a0a4a8;
		line-height: 1.7;
		margin: 0;
	}

	.requirements-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.requirements-list li {
		font-size: 15px;
		color: #a0a4a8;
		padding-left: 24px;
		position: relative;
		line-height: 1.6;
	}

	.requirements-list li::before {
		content: '•';
		position: absolute;
		left: 0;
		color: #d35400;
		font-size: 20px;
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
		.two-col-layout,
		.two-col-layout.reverse,
		.pricing-container {
			grid-template-columns: 1fr;
			gap: 60px;
			direction: ltr;
		}

		.tabs {
			order: 3;
			width: 100%;
		}

		.header-content {
			flex-wrap: wrap;
		}
	}

	@media (max-width: 768px) {
		.hero-title {
			font-size: 40px;
		}

		.hero-subtitle {
			font-size: 18px;
		}

		.section-title {
			font-size: 36px;
		}

		.col-text h2 {
			font-size: 36px;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.tech-grid,
		.security-grid,
		.architecture-grid {
			grid-template-columns: 1fr;
		}

		.logo-section h1 {
			font-size: 20px;
		}

		header.scrolled .logo-section h1 {
			font-size: 18px;
		}
	}
</style>
