<script lang="ts">
	import { useQuery, useMutation } from '$lib/convex.svelte';
	import { api } from '../../convex/_generated/api';
	import ServiceCard from '$lib/components/ServiceCard.svelte';
	import ServiceModal from '$lib/components/ServiceModal.svelte';
	import DeviceModal from '$lib/components/DeviceModal.svelte';
	import type { Id } from '../../convex/_generated/dataModel';

	const services = useQuery(api.services.list);
	const devices = useQuery(api.devices.list);
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
			await removeService({ id: serviceId });
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
			await removeDevice({ id: deviceId });
		}
	}

	function closeServiceModal() {
		showServiceModal = false;
		editingService = null;
	}

	function closeDeviceModal() {
		showDeviceModal = false;
		editingDevice = null;
	}
</script>

<div class="container">
	<header>
		<div class="header-content">
			<h1>Service Monitor</h1>
			<div class="header-actions">
				<button onclick={openAddDevice} class="secondary-btn">+ Add Device</button>
				<button onclick={openAddService} class="primary-btn">+ Add Service</button>
			</div>
		</div>
	</header>

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
</div>

<ServiceModal isOpen={showServiceModal} onClose={closeServiceModal} {editingService} />
<DeviceModal isOpen={showDeviceModal} onClose={closeDeviceModal} {editingDevice} />

<style>
	.container {
		min-height: 100vh;
		padding: 0;
	}

	header {
		background: linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%);
		border-bottom: 1px solid #2a2a2a;
		padding: 24px;
		position: sticky;
		top: 0;
		z-index: 100;
		backdrop-filter: blur(10px);
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
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.header-actions {
		display: flex;
		gap: 12px;
	}

	.primary-btn,
	.secondary-btn {
		padding: 10px 20px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
	}

	.primary-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.primary-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.secondary-btn {
		background: transparent;
		border: 1px solid #3a3a3a;
		color: #fff;
	}

	.secondary-btn:hover {
		background: #2a2a2a;
		border-color: #4a4a4a;
	}

	.devices-section {
		max-width: 1400px;
		margin: 24px auto;
		padding: 0 24px;
	}

	.devices-section h2 {
		margin: 0 0 16px 0;
		font-size: 20px;
		font-weight: 600;
		color: #fff;
	}

	.devices-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.device-item {
		background: #1a1a1a;
		border: 1px solid #2a2a2a;
		border-radius: 12px;
		padding: 16px 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: all 0.2s;
	}

	.device-item:hover {
		border-color: #3a3a3a;
		background: #1f1f1f;
	}

	.device-info {
		flex: 1;
	}

	.device-name {
		font-size: 16px;
		font-weight: 600;
		color: #fff;
		margin-bottom: 4px;
	}

	.device-description {
		font-size: 14px;
		color: #888;
	}

	.device-actions {
		display: flex;
		gap: 8px;
	}

	.icon-btn {
		background: transparent;
		border: 1px solid #2a2a2a;
		color: #888;
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
		background: #2a2a2a;
		border-color: #3a3a3a;
		color: #fff;
	}

	.icon-btn.danger:hover {
		background: rgba(239, 68, 68, 0.1);
		border-color: #ef4444;
		color: #ef4444;
	}

	main {
		max-width: 1400px;
		margin: 0 auto;
		padding: 24px;
	}

	.loading {
		text-align: center;
		padding: 60px 20px;
		color: #888;
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
		color: #fff;
	}

	.empty-state p {
		margin: 0 0 24px 0;
		color: #888;
		font-size: 16px;
	}

	.services-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 24px;
	}

	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			align-items: flex-start;
		}

		.header-actions {
			width: 100%;
		}

		.primary-btn,
		.secondary-btn {
			flex: 1;
		}

		.services-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
