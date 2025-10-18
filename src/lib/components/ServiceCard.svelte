<script lang="ts">
	import type { Id } from '../../../convex/_generated/dataModel';

	interface Props {
		service: {
			_id: Id<'services'>;
			name: string;
			notes?: string;
			iconUrl?: string;
			device: { name: string } | null;
			urls: Array<{
				_id: Id<'serviceUrls'>;
				label: string;
				url: string;
				isUp: boolean | null;
				lastCheck: number | null;
				responseTime: number | null;
			}>;
		};
		onEdit: () => void;
		onDelete: () => void;
	}

	let { service, onEdit, onDelete }: Props = $props();
	let showMenu = $state(false);

	function toggleMenu(e: MouseEvent) {
		e.stopPropagation();
		showMenu = !showMenu;
	}

	function handleEdit(e: MouseEvent) {
		e.stopPropagation();
		showMenu = false;
		onEdit();
	}

	function handleDelete(e: MouseEvent) {
		e.stopPropagation();
		showMenu = false;
		onDelete();
	}

	function handleUrlClick(url: string) {
		window.open(url, '_blank');
	}

	function closeMenu() {
		showMenu = false;
	}
</script>

<svelte:window on:click={closeMenu} />

<div class="service-card">
	<button class="menu-btn" onclick={toggleMenu} aria-label="Menu">
		<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
			<circle cx="10" cy="4" r="1.5" fill="currentColor" />
			<circle cx="10" cy="10" r="1.5" fill="currentColor" />
			<circle cx="10" cy="16" r="1.5" fill="currentColor" />
		</svg>
	</button>

	{#if showMenu}
		<div class="menu-dropdown">
			<button onclick={handleEdit}>Edit</button>
			<button onclick={handleDelete} class="danger">Delete</button>
		</div>
	{/if}

	<div class="service-icon">
		{#if service.iconUrl}
			{#if service.iconUrl.startsWith('<svg')}
				{@html service.iconUrl}
			{:else}
				<img src={service.iconUrl} alt={service.name} />
			{/if}
		{:else}
			<div class="placeholder-icon">{service.name.charAt(0).toUpperCase()}</div>
		{/if}
	</div>

	<h3>{service.name}</h3>

	{#if service.device}
		<div class="device-tag">{service.device.name}</div>
	{/if}

	{#if service.notes}
		<p class="notes">{service.notes}</p>
	{/if}

	{#if service.urls && service.urls.length > 0}
		<div class="url-buttons">
			{#each service.urls as urlData}
				<button
					class="url-btn"
					class:up={urlData.isUp === true}
					class:down={urlData.isUp === false}
					onclick={() => handleUrlClick(urlData.url)}
				>
					<span class="status-dot"></span>
					{urlData.label}
					{#if urlData.responseTime}
						<span class="response-time">{urlData.responseTime}ms</span>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.service-card {
		position: relative;
		background: linear-gradient(145deg, #1e2329 0%, #1a1e24 100%);
		border: 1px solid #3a3f47;
		border-radius: 16px;
		padding: 24px;
		transition: all 0.3s ease;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.service-card:hover {
		border-color: #d35400;
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(211, 84, 0, 0.4);
	}

	.menu-btn {
		position: absolute;
		top: 12px;
		right: 12px;
		background: transparent;
		border: none;
		color: #6c757d;
		cursor: pointer;
		padding: 4px;
		border-radius: 4px;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.menu-btn:hover {
		background: #2d3339;
		color: #e8eaed;
	}

	.menu-dropdown {
		position: absolute;
		top: 44px;
		right: 12px;
		background: #1e2329;
		border: 1px solid #3a3f47;
		border-radius: 8px;
		padding: 4px;
		z-index: 10;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.7);
		min-width: 120px;
	}

	.menu-dropdown button {
		width: 100%;
		background: transparent;
		border: none;
		color: #e8eaed;
		padding: 8px 12px;
		text-align: left;
		cursor: pointer;
		border-radius: 4px;
		font-size: 14px;
		transition: background 0.2s;
	}

	.menu-dropdown button:hover {
		background: #2d3339;
	}

	.menu-dropdown button.danger {
		color: #c0392b;
	}

	.menu-dropdown button.danger:hover {
		background: rgba(192, 57, 43, 0.15);
	}

	.service-icon {
		width: 64px;
		height: 64px;
		margin: 0 auto;
		border-radius: 12px;
		overflow: hidden;
		background: #2d3339;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 8px;
	}

	.service-icon img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	.service-icon :global(svg) {
		max-width: 100%;
		max-height: 100%;
	}

	.placeholder-icon {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32px;
		font-weight: bold;
		background: linear-gradient(135deg, #d35400 0%, #c54d00 100%);
		color: white;
	}

	h3 {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
		text-align: center;
		color: #e8eaed;
	}

	.device-tag {
		display: inline-block;
		background: #2d3339;
		color: #a0a4a8;
		padding: 4px 12px;
		border-radius: 12px;
		font-size: 12px;
		text-align: center;
		align-self: center;
	}

	.notes {
		margin: 0;
		font-size: 14px;
		color: #a0a4a8;
		text-align: center;
		line-height: 1.4;
	}

	.url-buttons {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: 8px;
	}

	.url-btn {
		background: #2d3339;
		border: 1px solid #3a3f47;
		color: #e8eaed;
		padding: 10px 16px;
		border-radius: 8px;
		cursor: pointer;
		font-size: 14px;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		gap: 8px;
		position: relative;
	}

	.url-btn:hover {
		background: #343a41;
		border-color: #d35400;
		box-shadow: 0 0 12px rgba(211, 84, 0, 0.3);
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #6c757d;
		flex-shrink: 0;
	}

	.url-btn.up .status-dot {
		background: #229954;
		box-shadow: 0 0 8px rgba(34, 153, 84, 0.6);
	}

	.url-btn.down .status-dot {
		background: #c0392b;
		box-shadow: 0 0 8px rgba(192, 57, 43, 0.6);
	}

	.response-time {
		margin-left: auto;
		font-size: 12px;
		color: #6c757d;
	}
</style>
