<script lang="ts">
	import { useQuery, getCurrentUser } from '$lib/convex.svelte';
	import { api } from '../../../convex/_generated/api';
	import type { Id } from '../../../convex/_generated/dataModel';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		serviceUrlId: Id<'serviceUrls'> | null;
		urlLabel: string;
	}

	let { isOpen = $bindable(false), onClose, serviceUrlId, urlLabel }: Props = $props();

	let currentUser = $state<any>(null);
	let timeRange = $state<'24h' | '7d' | '30d' | 'all'>('24h');

	$effect(() => {
		getCurrentUser().then(user => {
			currentUser = user;
		});
	});

	// Fetch uptime data
	const uptimeData = useQuery(
		api.uptime.getHistoricalChecks,
		() => serviceUrlId && currentUser ? {
			serviceUrlId: serviceUrlId,
			userId: currentUser._id,
			timeRange: timeRange
		} : 'skip'
	);

	// Calculate statistics
	let stats = $derived.by(() => {
		if (!uptimeData.data) return null;

		const checks = uptimeData.data;
		if (checks.length === 0) return null;

		const upChecks = checks.filter(c => c.isUp);
		const downChecks = checks.filter(c => !c.isUp);
		const checksWithResponseTime = checks.filter(c => c.responseTime != null);

		const uptimePercentage = (upChecks.length / checks.length) * 100;
		const avgResponseTime = checksWithResponseTime.length > 0
			? checksWithResponseTime.reduce((sum, c) => sum + (c.responseTime || 0), 0) / checksWithResponseTime.length
			: 0;
		const maxResponseTime = checksWithResponseTime.length > 0
			? Math.max(...checksWithResponseTime.map(c => c.responseTime || 0))
			: 0;
		const minResponseTime = checksWithResponseTime.length > 0
			? Math.min(...checksWithResponseTime.map(c => c.responseTime || 0))
			: 0;

		return {
			totalChecks: checks.length,
			upChecks: upChecks.length,
			downChecks: downChecks.length,
			uptimePercentage,
			avgResponseTime,
			maxResponseTime,
			minResponseTime,
		};
	});

	// Graph dimensions
	const graphWidth = 600;
	const graphHeight = 200;
	const padding = { top: 20, right: 20, bottom: 40, left: 60 };

	// Generate SVG path for response time graph
	let graphPath = $derived.by(() => {
		if (!uptimeData.data || uptimeData.data.length === 0) return '';

		const checks = [...uptimeData.data].reverse(); // Oldest to newest
		const checksWithTime = checks.filter(c => c.responseTime != null);

		if (checksWithTime.length === 0) return '';

		const maxTime = Math.max(...checksWithTime.map(c => c.responseTime || 0));
		const minTime = Math.min(...checksWithTime.map(c => c.responseTime || 0));
		const timeRange = maxTime - minTime || 1;

		const width = graphWidth - padding.left - padding.right;
		const height = graphHeight - padding.top - padding.bottom;

		const points = checksWithTime.map((check, i) => {
			const x = padding.left + (i / (checksWithTime.length - 1 || 1)) * width;
			const y = padding.top + height - ((check.responseTime! - minTime) / timeRange) * height;
			return `${x},${y}`;
		});

		return `M ${points.join(' L ')}`;
	});

	// Generate dots for the graph
	let graphDots = $derived.by(() => {
		if (!uptimeData.data || uptimeData.data.length === 0) return [];

		const checks = [...uptimeData.data].reverse();
		const checksWithTime = checks.filter(c => c.responseTime != null);

		if (checksWithTime.length === 0) return [];

		const maxTime = Math.max(...checksWithTime.map(c => c.responseTime || 0));
		const minTime = Math.min(...checksWithTime.map(c => c.responseTime || 0));
		const timeRange = maxTime - minTime || 1;

		const width = graphWidth - padding.left - padding.right;
		const height = graphHeight - padding.top - padding.bottom;

		return checksWithTime.map((check, i) => {
			const x = padding.left + (i / (checksWithTime.length - 1 || 1)) * width;
			const y = padding.top + height - ((check.responseTime! - minTime) / timeRange) * height;
			return { x, y, check };
		});
	});

	// Generate Y-axis labels
	let yAxisLabels = $derived.by(() => {
		if (!uptimeData.data || uptimeData.data.length === 0) return [];

		const checksWithTime = uptimeData.data.filter(c => c.responseTime != null);
		if (checksWithTime.length === 0) return [];

		const maxTime = Math.max(...checksWithTime.map(c => c.responseTime || 0));
		const minTime = Math.min(...checksWithTime.map(c => c.responseTime || 0));

		const height = graphHeight - padding.top - padding.bottom;
		const steps = 4;

		return Array.from({ length: steps + 1 }, (_, i) => {
			const value = maxTime - (i / steps) * (maxTime - minTime);
			const y = padding.top + (i / steps) * height;
			return { y, value: Math.round(value) };
		});
	});

	// Generate status indicator bars
	let statusBars = $derived.by(() => {
		if (!uptimeData.data || uptimeData.data.length === 0) return [];

		const checks = [...uptimeData.data].reverse();
		const width = graphWidth - padding.left - padding.right;
		const barWidth = width / checks.length;

		return checks.map((check, i) => ({
			x: padding.left + i * barWidth,
			width: barWidth,
			isUp: check.isUp,
			timestamp: check.timestamp,
		}));
	});

	function formatDate(timestamp: number) {
		return new Date(timestamp).toLocaleString();
	}

	function formatTimeAgo(timestamp: number) {
		const seconds = Math.floor((Date.now() - timestamp) / 1000);
		if (seconds < 60) return `${seconds}s ago`;
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		return `${days}d ago`;
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}
</script>

{#if isOpen}
	<div class="modal-backdrop" onclick={handleBackdropClick}>
		<div class="modal">
			<div class="modal-header">
				<h2>Uptime Details: {urlLabel}</h2>
				<button class="close-btn" onclick={onClose} aria-label="Close">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round"/>
					</svg>
				</button>
			</div>

			<div class="time-range-selector">
				<button
					class="range-btn"
					class:active={timeRange === '24h'}
					onclick={() => timeRange = '24h'}
				>
					24 Hours
				</button>
				<button
					class="range-btn"
					class:active={timeRange === '7d'}
					onclick={() => timeRange = '7d'}
				>
					7 Days
				</button>
				<button
					class="range-btn"
					class:active={timeRange === '30d'}
					onclick={() => timeRange = '30d'}
				>
					30 Days
				</button>
				<button
					class="range-btn"
					class:active={timeRange === 'all'}
					onclick={() => timeRange = 'all'}
				>
					All Time
				</button>
			</div>

			<div class="modal-content">
				{#if uptimeData.data === undefined}
					<div class="loading">Loading uptime data...</div>
				{:else if !stats || uptimeData.data.length === 0}
					<div class="empty-state">
						<div class="empty-icon">📊</div>
						<p>No uptime data available yet</p>
					</div>
				{:else}
					<!-- Statistics Grid -->
					<div class="stats-grid">
						<div class="stat-card uptime">
							<div class="stat-label">Uptime</div>
							<div class="stat-value">{stats.uptimePercentage.toFixed(2)}%</div>
							<div class="stat-detail">{stats.upChecks} up / {stats.downChecks} down</div>
						</div>
						<div class="stat-card">
							<div class="stat-label">Avg Response Time</div>
							<div class="stat-value">{Math.round(stats.avgResponseTime)}ms</div>
							<div class="stat-detail">{stats.totalChecks} checks</div>
						</div>
						<div class="stat-card">
							<div class="stat-label">Min Response</div>
							<div class="stat-value">{Math.round(stats.minResponseTime)}ms</div>
						</div>
						<div class="stat-card">
							<div class="stat-label">Max Response</div>
							<div class="stat-value">{Math.round(stats.maxResponseTime)}ms</div>
						</div>
					</div>

					<!-- Status Timeline -->
					<div class="graph-section">
						<h3>Status Timeline</h3>
						<svg class="status-timeline" width={graphWidth} height="40" viewBox="0 0 {graphWidth} 40">
							{#each statusBars as bar}
								<rect
									x={bar.x}
									y="10"
									width={bar.width}
									height="20"
									fill={bar.isUp ? '#229954' : '#c0392b'}
									opacity="0.8"
								>
									<title>{bar.isUp ? 'Up' : 'Down'} - {formatDate(bar.timestamp)}</title>
								</rect>
							{/each}
						</svg>
					</div>

					<!-- Response Time Graph -->
					<div class="graph-section">
						<h3>Response Time</h3>
						<svg class="response-graph" width={graphWidth} height={graphHeight} viewBox="0 0 {graphWidth} {graphHeight}">
							<!-- Y-axis labels -->
							{#each yAxisLabels as label}
								<line
									x1={padding.left}
									y1={label.y}
									x2={graphWidth - padding.right}
									y2={label.y}
									stroke="#3a3f47"
									stroke-width="1"
									stroke-dasharray="4,4"
								/>
								<text
									x={padding.left - 10}
									y={label.y + 4}
									text-anchor="end"
									fill="#a0a4a8"
									font-size="12"
								>
									{label.value}ms
								</text>
							{/each}

							<!-- Graph line -->
							{#if graphPath}
								<path
									d={graphPath}
									fill="none"
									stroke="#d35400"
									stroke-width="2"
									stroke-linejoin="round"
								/>
							{/if}

							<!-- Data points -->
							{#each graphDots as dot}
								<circle
									cx={dot.x}
									cy={dot.y}
									r="4"
									fill={dot.check.isUp ? '#229954' : '#c0392b'}
									stroke="#1e2329"
									stroke-width="2"
								>
									<title>
										{formatDate(dot.check.timestamp)}
										Response: {dot.check.responseTime}ms
										Status: {dot.check.isUp ? 'Up' : 'Down'}
									</title>
								</circle>
							{/each}

							<!-- X-axis label -->
							<text
								x={graphWidth / 2}
								y={graphHeight - 10}
								text-anchor="middle"
								fill="#a0a4a8"
								font-size="12"
							>
								Time
							</text>
						</svg>
					</div>

					<!-- Recent Checks Table -->
					<div class="recent-checks">
						<h3>Recent Checks</h3>
						<div class="checks-table">
							{#each uptimeData.data.slice(0, 10) as check}
								<div class="check-row">
									<div class="check-status">
										<span class="status-indicator" class:up={check.isUp} class:down={!check.isUp}></span>
										<span>{check.isUp ? 'Up' : 'Down'}</span>
									</div>
									<div class="check-time">{formatTimeAgo(check.timestamp)}</div>
									<div class="check-response">{check.responseTime ? `${check.responseTime}ms` : '-'}</div>
									{#if check.statusCode}
										<div class="check-code">HTTP {check.statusCode}</div>
									{/if}
									{#if check.error}
										<div class="check-error" title={check.error}>Error</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 20px;
		overflow-y: auto;
	}

	.modal {
		background: linear-gradient(145deg, #1e2329 0%, #0a0e12 100%);
		border: 1px solid #3a3f47;
		border-radius: 16px;
		width: 100%;
		max-width: 800px;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24px;
		border-bottom: 1px solid #3a3f47;
		position: sticky;
		top: 0;
		background: linear-gradient(145deg, #1e2329 0%, #0a0e12 100%);
		z-index: 10;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 22px;
		font-weight: 600;
		color: #e8eaed;
	}

	.close-btn {
		background: transparent;
		border: none;
		color: #6c757d;
		cursor: pointer;
		padding: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		transition: all 0.2s;
	}

	.close-btn:hover {
		background: #2d3339;
		color: #e8eaed;
	}

	.time-range-selector {
		display: flex;
		gap: 8px;
		padding: 16px 24px;
		border-bottom: 1px solid #3a3f47;
	}

	.range-btn {
		padding: 8px 16px;
		background: transparent;
		border: 1px solid #3a3f47;
		border-radius: 8px;
		color: #a0a4a8;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.range-btn:hover {
		background: #2d3339;
		border-color: #d35400;
		color: #e8eaed;
	}

	.range-btn.active {
		background: linear-gradient(135deg, #d35400 0%, #c54d00 100%);
		border-color: #d35400;
		color: white;
		box-shadow: 0 2px 8px rgba(211, 84, 0, 0.3);
	}

	.modal-content {
		padding: 24px;
	}

	.loading {
		text-align: center;
		padding: 60px 20px;
		color: #a0a4a8;
	}

	.empty-state {
		text-align: center;
		padding: 60px 20px;
	}

	.empty-icon {
		font-size: 64px;
		margin-bottom: 16px;
	}

	.empty-state p {
		color: #a0a4a8;
		font-size: 16px;
		margin: 0;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 16px;
		margin-bottom: 32px;
	}

	.stat-card {
		background: #2d3339;
		border: 1px solid #3a3f47;
		border-radius: 12px;
		padding: 16px;
		text-align: center;
		transition: all 0.2s;
	}

	.stat-card:hover {
		border-color: #d35400;
		box-shadow: 0 4px 16px rgba(211, 84, 0, 0.2);
	}

	.stat-card.uptime {
		grid-column: span 2;
	}

	.stat-label {
		font-size: 12px;
		color: #a0a4a8;
		margin-bottom: 8px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.stat-value {
		font-size: 32px;
		font-weight: 700;
		color: #e8eaed;
		margin-bottom: 4px;
	}

	.stat-card.uptime .stat-value {
		background: linear-gradient(135deg, #229954 0%, #1e8449 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.stat-detail {
		font-size: 12px;
		color: #6c757d;
	}

	.graph-section {
		margin-bottom: 32px;
	}

	.graph-section h3 {
		margin: 0 0 16px 0;
		font-size: 16px;
		font-weight: 600;
		color: #e8eaed;
	}

	.status-timeline {
		width: 100%;
		max-width: 100%;
		border: 1px solid #3a3f47;
		border-radius: 8px;
		background: #0a0e12;
	}

	.response-graph {
		width: 100%;
		max-width: 100%;
		border: 1px solid #3a3f47;
		border-radius: 8px;
		background: #0a0e12;
	}

	.recent-checks {
		margin-top: 32px;
	}

	.recent-checks h3 {
		margin: 0 0 16px 0;
		font-size: 16px;
		font-weight: 600;
		color: #e8eaed;
	}

	.checks-table {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.check-row {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 12px 16px;
		background: #2d3339;
		border: 1px solid #3a3f47;
		border-radius: 8px;
		font-size: 14px;
	}

	.check-status {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 80px;
	}

	.status-indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.status-indicator.up {
		background: #229954;
		box-shadow: 0 0 8px rgba(34, 153, 84, 0.6);
	}

	.status-indicator.down {
		background: #c0392b;
		box-shadow: 0 0 8px rgba(192, 57, 43, 0.6);
	}

	.check-time {
		color: #a0a4a8;
		flex: 1;
	}

	.check-response {
		color: #e8eaed;
		font-weight: 500;
		min-width: 80px;
		text-align: right;
	}

	.check-code {
		color: #6c757d;
		font-size: 12px;
		padding: 2px 8px;
		background: #1e2329;
		border-radius: 4px;
	}

	.check-error {
		color: #c0392b;
		font-size: 12px;
		padding: 2px 8px;
		background: rgba(192, 57, 43, 0.15);
		border-radius: 4px;
		cursor: help;
	}

	@media (max-width: 768px) {
		.modal {
			max-width: 100%;
			max-height: 100vh;
			border-radius: 0;
		}

		.stats-grid {
			grid-template-columns: 1fr;
		}

		.stat-card.uptime {
			grid-column: span 1;
		}

		.check-row {
			flex-wrap: wrap;
			font-size: 13px;
		}

		.check-response {
			min-width: 60px;
		}
	}
</style>
