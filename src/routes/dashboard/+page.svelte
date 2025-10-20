<script lang="ts">
	import { goto } from '$app/navigation';
	import { useQuery, useMutation, getCurrentUser, logout } from '$lib/convex.svelte';
	import { api } from '../../../convex/_generated/api';
	import ServiceCard from '$lib/components/ServiceCard.svelte';
	import ServiceModal from '$lib/components/ServiceModal.svelte';
	import DeviceModal from '$lib/components/DeviceModal.svelte';
	import DemoBanner from '$lib/components/DemoBanner.svelte';
	import type { Id } from '../../../convex/_generated/dataModel';

	let currentUser = $state<any>(null);
	let showSettings = $state(false);
	let startpageMode = $state(false);
	let searchQuery = $state('');

	// Get current user reactively
	$effect(() => {
		console.log('[Dashboard] Getting current user...');
		getCurrentUser().then(user => {
			console.log('[Dashboard] getCurrentUser returned:', user);
			if (!user) {
				console.log('[Dashboard] No user, redirecting to /auth');
				goto('/auth');
			} else {
				console.log('[Dashboard] Setting currentUser to:', user);
				currentUser = user;
				console.log('[Dashboard] currentUser is now:', currentUser);
			}
		});
	});

	// Load startpage mode setting from localStorage
	$effect(() => {
		const savedMode = localStorage.getItem('startpageMode');
		if (savedMode !== null) {
			startpageMode = savedMode === 'true';
		}
	});

	// Close settings dropdown when clicking outside
	$effect(() => {
		if (showSettings) {
			const handleClickOutside = (event: MouseEvent) => {
				const target = event.target as HTMLElement;
				if (!target.closest('.settings-container')) {
					showSettings = false;
				}
			};
			document.addEventListener('click', handleClickOutside);
			return () => {
				document.removeEventListener('click', handleClickOutside);
			};
		}
	});

	// Pass currentUser directly so useQuery can track it
	const services = useQuery(api.services.list, () => currentUser ? { userId: currentUser._id } : {});
	const devices = useQuery(api.devices.list, () => currentUser ? { userId: currentUser._id } : {});
	const removeService = useMutation(api.services.remove);
	const removeDevice = useMutation(api.devices.remove);

	let showServiceModal = $state(false);
	let showDeviceModal = $state(false);
	let editingService = $state<any>(null);
	let editingDevice = $state<any>(null);

	function openAddService() {
		editingService = null;
		showServiceModal = true;
	}

	function openEditService(service: any) {
		editingService = service;
		showServiceModal = true;
	}

	async function handleDeleteService(serviceId: Id<'services'>) {
		if (confirm('Are you sure you want to delete this service?')) {
			await removeService({ id: serviceId, userId: currentUser._id });
		}
	}

	function openAddDevice() {
		editingDevice = null;
		showDeviceModal = true;
	}

	function openEditDevice(device: any) {
		editingDevice = device;
		showDeviceModal = true;
	}

	async function handleDeleteDevice(deviceId: Id<'devices'>) {
		if (confirm('Are you sure you want to delete this device?')) {
			await removeDevice({ id: deviceId, userId: currentUser._id });
		}
	}
	
	async function handleLogout() {
		await logout();
		goto('/auth');
	}

	function toggleSettings() {
		showSettings = !showSettings;
	}

	function toggleStartpageMode() {
		startpageMode = !startpageMode;
		localStorage.setItem('startpageMode', String(startpageMode));
	}

	function closeSettings() {
		showSettings = false;
	}

	function closeServiceModal() {
		showServiceModal = false;
		editingService = null;
	}

	function closeDeviceModal() {
		showDeviceModal = false;
		editingDevice = null;
	}

	function handleSearch(event: Event) {
		event.preventDefault();
		if (searchQuery.trim()) {
			window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
			searchQuery = '';
		}
	}

	// Check if current user is demo user
	let isDemoUser = $derived(currentUser?.email === 'demo@selfhost-monitor.app');
</script>

<div class="container" class:startpage-mode={startpageMode}>
	{#if !startpageMode}
		<header>
			<div class="header-content">
				<h1>Service Monitor</h1>
				<div class="header-actions">
					<button onclick={openAddDevice} class="secondary-btn">+ Add Device</button>
					<button onclick={openAddService} class="primary-btn">+ Add Service</button>
					{#if currentUser}
						<div class="user-info">
							<span class="user-name">{currentUser.name || currentUser.email || 'User'}</span>
							<div class="settings-container">
								<button onclick={toggleSettings} class="icon-btn settings-btn" aria-label="Settings">
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
										<circle cx="12" cy="12" r="3"></circle>
									</svg>
								</button>
								{#if showSettings}
									<div class="settings-dropdown">
										<div class="settings-option">
											<label class="toggle-label">
												<span>Startpage Mode</span>
												<input
													type="checkbox"
													checked={startpageMode}
													onchange={toggleStartpageMode}
													class="toggle-checkbox"
												/>
												<span class="toggle-switch"></span>
											</label>
										</div>
									</div>
								{/if}
							</div>
							<button onclick={handleLogout} class="auth-btn">Logout</button>
						</div>
					{/if}
				</div>
			</div>
		</header>
	{/if}

	<div class="content-wrapper" class:startpage-wrapper={startpageMode}>
		{#if startpageMode}
			<!-- Startpage Mode Layout -->
			<div class="startpage-header">
				<div class="startpage-actions">
					<button onclick={openAddDevice} class="icon-btn-large" title="Add Device">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
							<rect x="2" y="3" width="20" height="14" rx="2" stroke-width="2"/>
							<line x1="8" y1="21" x2="16" y2="21" stroke-width="2" stroke-linecap="round"/>
							<line x1="12" y1="17" x2="12" y2="21" stroke-width="2" stroke-linecap="round"/>
						</svg>
					</button>
					<button onclick={openAddService} class="icon-btn-large" title="Add Service">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
							<path d="M12 5v14m-7-7h14" stroke-width="2" stroke-linecap="round"/>
						</svg>
					</button>
					{#if currentUser}
						<div class="settings-container">
							<button onclick={toggleSettings} class="icon-btn-large" title="Settings">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
									<circle cx="12" cy="12" r="3"></circle>
								</svg>
							</button>
							{#if showSettings}
								<div class="settings-dropdown">
									<div class="settings-option">
										<label class="toggle-label">
											<span>Startpage Mode</span>
											<input
												type="checkbox"
												checked={startpageMode}
												onchange={toggleStartpageMode}
												class="toggle-checkbox"
											/>
											<span class="toggle-switch"></span>
										</label>
									</div>
									<div class="settings-option">
										<button onclick={handleLogout} class="logout-btn-small">Logout</button>
									</div>
								</div>
							{/if}
						</div>
					{/if}
				</div>

				<form class="search-box" onsubmit={handleSearch}>
					<svg class="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<circle cx="11" cy="11" r="8" stroke-width="2"/>
						<path d="m21 21-4.35-4.35" stroke-width="2" stroke-linecap="round"/>
					</svg>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search Google or type a URL"
						class="search-input"
					/>
				</form>
			</div>

			{#if isDemoUser}
				<DemoBanner />
			{/if}

			<!-- Services in Startpage Mode -->
			{#if services.data === undefined}
				<div class="loading">Loading services...</div>
			{:else if services.data.length === 0}
				<div class="empty-state-startpage">
					<div class="empty-icon">📊</div>
					<p>No services yet</p>
				</div>
			{:else}
				<div class="startpage-section">
					<h2>Services</h2>
					<div class="startpage-grid">
						{#each services.data as service (service._id)}
							<ServiceCard
								{service}
								onEdit={() => openEditService(service)}
								onDelete={() => handleDeleteService(service._id)}
							/>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Devices in Startpage Mode -->
			{#if devices.data && devices.data.length > 0}
				<div class="startpage-section">
					<h2>Devices</h2>
					<div class="startpage-devices-grid">
						{#each devices.data as device}
							<div class="device-item">
								<div class="device-info">
									<div class="device-name">{device.name}</div>
									{#if device.description}
										<div class="device-description">{device.description}</div>
									{/if}
								</div>
								<div class="device-actions">
									<button onclick={() => openEditDevice(device)} class="icon-btn" aria-label="Edit">
										<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
											<path
												d="M11.333 2A1.886 1.886 0 0 1 14 4.667l-9 9-3.667 1L2.667 11l9-9Z"
												stroke="currentColor"
												stroke-width="1.5"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>
									</button>
									<button
										onclick={() => handleDeleteDevice(device._id)}
										class="icon-btn danger"
										aria-label="Delete"
									>
										<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
											<path
												d="M2 4h12M5.333 4V2.667a1.333 1.333 0 0 1 1.334-1.334h2.666a1.333 1.333 0 0 1 1.334 1.334V4m2 0v9.333a1.333 1.333 0 0 1-1.334 1.334H4.667a1.334 1.334 0 0 1-1.334-1.334V4h9.334Z"
												stroke="currentColor"
												stroke-width="1.5"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{:else}
			<!-- Normal Mode Layout -->
			{#if isDemoUser}
				<DemoBanner />
			{/if}

			{#if devices.data && devices.data.length > 0}
				<div class="devices-section">
					<h2>Devices</h2>
					<div class="devices-list">
						{#each devices.data as device}
							<div class="device-item">
								<div class="device-info">
									<div class="device-name">{device.name}</div>
									{#if device.description}
										<div class="device-description">{device.description}</div>
									{/if}
								</div>
								<div class="device-actions">
									<button onclick={() => openEditDevice(device)} class="icon-btn" aria-label="Edit">
										<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
											<path
												d="M11.333 2A1.886 1.886 0 0 1 14 4.667l-9 9-3.667 1L2.667 11l9-9Z"
												stroke="currentColor"
												stroke-width="1.5"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>
									</button>
									<button
										onclick={() => handleDeleteDevice(device._id)}
										class="icon-btn danger"
										aria-label="Delete"
									>
										<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
											<path
												d="M2 4h12M5.333 4V2.667a1.333 1.333 0 0 1 1.334-1.334h2.666a1.333 1.333 0 0 1 1.334 1.334V4m2 0v9.333a1.333 1.333 0 0 1-1.334 1.334H4.667a1.334 1.334 0 0 1-1.334-1.334V4h9.334Z"
												stroke="currentColor"
												stroke-width="1.5"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<main>
				{#if services.data === undefined}
					<div class="loading">Loading services...</div>
				{:else if services.data.length === 0}
					<div class="empty-state">
						<div class="empty-icon">📊</div>
						<h3>No services yet</h3>
						<p>Get started by adding your first service</p>
						<button onclick={openAddService} class="primary-btn">+ Add Service</button>
					</div>
				{:else}
					<div class="services-grid">
						{#each services.data as service (service._id)}
							<ServiceCard
								{service}
								onEdit={() => openEditService(service)}
								onDelete={() => handleDeleteService(service._id)}
							/>
						{/each}
					</div>
				{/if}
			</main>
		{/if}
	</div>
</div>

<ServiceModal isOpen={showServiceModal} onClose={closeServiceModal} {editingService} />
<DeviceModal isOpen={showDeviceModal} onClose={closeDeviceModal} {editingDevice} />

<style>
	.container {
		min-height: 100vh;
		padding: 0;
	}

	header {
		background: linear-gradient(145deg, #1e2329 0%, #0a0e12 100%);
		border-bottom: 1px solid #3a3f47;
		padding: 24px;
		position: sticky;
		top: 0;
		z-index: 100;
		backdrop-filter: blur(10px);
	}

	.content-wrapper {
		max-width: 1400px;
		margin: 0 auto;
		padding: 24px;
	}

	.header-content {
		max-width: 1400px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 20px;
	}

	h1 {
		margin: 0;
		font-size: 28px;
		font-weight: 700;
		color: white;
	}

	.header-actions {
		display: flex;
		gap: 12px;
		align-items: center;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 12px;
		padding-left: 12px;
		border-left: 1px solid #3a3f47;
	}

	.user-name {
		color: #e8eaed;
		font-size: 14px;
		font-weight: 500;
	}

	.settings-container {
		position: relative;
	}

	.settings-btn {
		color: #a0a4a8;
	}

	.settings-dropdown {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		background: #2d3339;
		border: 1px solid #3a3f47;
		border-radius: 8px;
		padding: 12px;
		min-width: 200px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
		z-index: 1000;
	}

	.settings-option {
		padding: 8px 0;
	}

	.toggle-label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
		color: #e8eaed;
		font-size: 14px;
		gap: 12px;
	}

	.toggle-checkbox {
		display: none;
	}

	.toggle-switch {
		position: relative;
		width: 44px;
		height: 24px;
		background: #3a3f47;
		border-radius: 12px;
		transition: background 0.3s;
		flex-shrink: 0;
	}

	.toggle-switch::after {
		content: '';
		position: absolute;
		top: 2px;
		left: 2px;
		width: 20px;
		height: 20px;
		background: #e8eaed;
		border-radius: 50%;
		transition: transform 0.3s;
	}

	.toggle-checkbox:checked + .toggle-switch {
		background: linear-gradient(135deg, #d35400 0%, #c54d00 100%);
	}

	.toggle-checkbox:checked + .toggle-switch::after {
		transform: translateX(20px);
	}

	.toggle-label:hover .toggle-switch {
		background: #4a5059;
	}

	.toggle-checkbox:checked + .toggle-switch:hover {
		background: linear-gradient(135deg, #e05f00 0%, #d45400 100%);
	}

	.primary-btn,
	.secondary-btn,
	.auth-btn {
		padding: 10px 20px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}

	.primary-btn {
		background: linear-gradient(135deg, #d35400 0%, #c54d00 100%);
		color: white;
		box-shadow: 0 2px 8px rgba(211, 84, 0, 0.3);
	}

	.primary-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(211, 84, 0, 0.5);
	}

	.secondary-btn {
		background: transparent;
		border: 1px solid #3a3f47;
		color: #e8eaed;
	}

	.secondary-btn:hover {
		background: #2d3339;
		border-color: #d35400;
		box-shadow: 0 0 12px rgba(211, 84, 0, 0.3);
	}

	.auth-btn {
		background: transparent;
		border: 1px solid #3a3f47;
		color: #a0a4a8;
	}

	.auth-btn:hover {
		background: #2d3339;
		border-color: #d35400;
		color: #d35400;
	}

	.devices-section {
		margin-bottom: 24px;
	}

	.devices-section h2 {
		margin: 0 0 16px 0;
		font-size: 20px;
		font-weight: 600;
		color: #e8eaed;
	}

	.devices-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 16px;
	}

	.device-item {
		background: #2d3339;
		border: 1px solid #3a3f47;
		border-radius: 12px;
		padding: 16px 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: all 0.2s;
	}

	.device-item:hover {
		border-color: #d35400;
		background: #343a41;
		box-shadow: 0 0 12px rgba(211, 84, 0, 0.3);
	}

	.device-info {
		flex: 1;
	}

	.device-name {
		font-size: 16px;
		font-weight: 600;
		color: #e8eaed;
		margin-bottom: 4px;
	}

	.device-description {
		font-size: 14px;
		color: #a0a4a8;
	}

	.device-actions {
		display: flex;
		gap: 8px;
	}

	.icon-btn {
		background: transparent;
		border: 1px solid #3a3f47;
		color: #6c757d;
		width: 32px;
		height: 32px;
		border-radius: 6px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.icon-btn:hover {
		background: #2d3339;
		border-color: #d35400;
		color: #e8eaed;
		box-shadow: 0 0 12px rgba(211, 84, 0, 0.3);
	}

	.icon-btn.danger:hover {
		background: rgba(192, 57, 43, 0.15);
		border-color: #c0392b;
		color: #c0392b;
	}

	main {
		margin: 0;
		padding: 0;
	}

	.loading {
		text-align: center;
		padding: 60px 20px;
		color: #a0a4a8;
		font-size: 16px;
	}

	.empty-state {
		text-align: center;
		padding: 80px 20px;
	}

	.empty-icon {
		font-size: 64px;
		margin-bottom: 16px;
	}

	.empty-state h3 {
		margin: 0 0 8px 0;
		font-size: 24px;
		font-weight: 600;
		color: #e8eaed;
	}

	.empty-state p {
		margin: 0 0 24px 0;
		color: #a0a4a8;
		font-size: 16px;
	}

	.services-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 24px;
	}

	/* Startpage Mode Styles */
	.startpage-mode {
		background: #0a0e12;
	}

	.startpage-wrapper {
		max-width: 1200px;
		margin: 0 auto;
		padding: 60px 24px 24px;
	}

	.startpage-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 32px;
		margin-bottom: 64px;
	}

	.startpage-actions {
		display: flex;
		gap: 12px;
		position: absolute;
		top: 24px;
		right: 24px;
	}

	.icon-btn-large {
		background: rgba(45, 51, 57, 0.8);
		backdrop-filter: blur(10px);
		border: 1px solid #3a3f47;
		color: #a0a4a8;
		width: 48px;
		height: 48px;
		border-radius: 12px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.icon-btn-large:hover {
		background: #2d3339;
		border-color: #d35400;
		color: #e8eaed;
		box-shadow: 0 0 16px rgba(211, 84, 0, 0.4);
		transform: translateY(-2px);
	}

	.search-box {
		width: 100%;
		max-width: 680px;
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: 20px;
		color: #6c757d;
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: 18px 24px 18px 56px;
		background: rgba(45, 51, 57, 0.6);
		backdrop-filter: blur(10px);
		border: 2px solid #3a3f47;
		border-radius: 32px;
		color: #e8eaed;
		font-size: 16px;
		transition: all 0.3s;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
	}

	.search-input:focus {
		outline: none;
		border-color: #d35400;
		background: rgba(45, 51, 57, 0.9);
		box-shadow: 0 8px 32px rgba(211, 84, 0, 0.3);
	}

	.search-input::placeholder {
		color: #6c757d;
	}

	.startpage-section {
		margin-bottom: 48px;
	}

	.startpage-section h2 {
		margin: 0 0 24px 0;
		font-size: 22px;
		font-weight: 600;
		color: #e8eaed;
		text-align: center;
	}

	.startpage-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 20px;
		justify-items: center;
	}

	.startpage-devices-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 16px;
		justify-items: center;
		max-width: 1000px;
		margin: 0 auto;
	}

	.empty-state-startpage {
		text-align: center;
		padding: 40px 20px;
		color: #6c757d;
	}

	.empty-state-startpage .empty-icon {
		font-size: 48px;
		margin-bottom: 12px;
		opacity: 0.5;
	}

	.empty-state-startpage p {
		margin: 0;
		font-size: 14px;
	}

	.logout-btn-small {
		width: 100%;
		padding: 8px 16px;
		background: transparent;
		border: 1px solid #3a3f47;
		border-radius: 6px;
		color: #a0a4a8;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.logout-btn-small:hover {
		background: rgba(192, 57, 43, 0.15);
		border-color: #c0392b;
		color: #c0392b;
	}

	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			align-items: flex-start;
		}

		.header-actions {
			width: 100%;
			flex-wrap: wrap;
		}

		.primary-btn,
		.secondary-btn,
		.auth-btn {
			flex: 1;
			min-width: 120px;
		}

		.devices-list {
			grid-template-columns: 1fr;
		}

		.services-grid {
			grid-template-columns: 1fr;
		}

		.startpage-wrapper {
			padding: 40px 16px 16px;
		}

		.startpage-header {
			margin-bottom: 40px;
		}

		.startpage-actions {
			top: 16px;
			right: 16px;
		}

		.icon-btn-large {
			width: 44px;
			height: 44px;
		}

		.search-input {
			font-size: 15px;
			padding: 16px 20px 16px 52px;
		}

		.startpage-grid {
			grid-template-columns: 1fr;
		}

		.startpage-devices-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
