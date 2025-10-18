<script lang="ts">
	import { useMutation, useQuery, getCurrentUser } from '$lib/convex.svelte';
	import { api } from '../../../convex/_generated/api';
	import type { Id } from '../../../convex/_generated/dataModel';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		editingService?: {
			_id: Id<'services'>;
			name: string;
			notes?: string;
			deviceId: Id<'devices'>;
			iconUrl?: string;
			urls: Array<{
				_id: Id<'serviceUrls'>;
				label: string;
				url: string;
				pingInterval?: number;
				excludeFromUptime?: boolean;
			}>;
		} | null;
	}

	let { isOpen, onClose, editingService = null }: Props = $props();

	let currentUser = $state<any>(null);

	// Get current user reactively
	$effect(() => {
		getCurrentUser().then(user => currentUser = user);
	});

	const devices = useQuery(api.devices.list, () => currentUser ? { userId: currentUser._id } : {});
	const createService = useMutation(api.services.create);
	const updateService = useMutation(api.services.update);
	const createUrl = useMutation(api.serviceUrls.create);
	const updateUrl = useMutation(api.serviceUrls.update);
	const removeUrl = useMutation(api.serviceUrls.remove);

	let name = $state('');
	let notes = $state('');
	let deviceId = $state<Id<'devices'> | ''>('');
	let iconUrl = $state('');
	let urls = $state<Array<{ id?: Id<'serviceUrls'>; label: string; url: string; pingInterval?: number; excludeFromUptime?: boolean }>>([]);

	$effect(() => {
		if (isOpen) {
			if (editingService) {
				name = editingService.name;
				notes = editingService.notes || '';
				deviceId = editingService.deviceId;
				iconUrl = editingService.iconUrl || '';
				urls = editingService.urls.map((u) => ({ id: u._id, label: u.label, url: u.url, pingInterval: u.pingInterval ?? 5, excludeFromUptime: u.excludeFromUptime ?? false }));
			} else {
				name = '';
				notes = '';
				deviceId = '';
				iconUrl = '';
				urls = [];
			}
		}
	});

	function addUrl() {
		urls = [...urls, { label: '', url: '', pingInterval: 5, excludeFromUptime: false }];
	}

	function removeUrlAtIndex(index: number) {
		urls = urls.filter((_, i) => i !== index);
	}

	function normalizeUrl(url: string): string {
		if (!url) return url;

		// If already has protocol, return as-is
		if (url.startsWith('http://') || url.startsWith('https://')) {
			return url;
		}

		// Check if it's a local/private IP or localhost
		const isLocal = /^(localhost|127\.|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(url);

		// Use http for local, https for everything else
		return isLocal ? `http://${url}` : `https://${url}`;
	}

	async function handleSubmit() {
		if (!name || !deviceId || !currentUser) {
			console.log('Missing required fields:', { name, deviceId, currentUser });
			return;
		}

		try {
			console.log('Submitting service with userId:', currentUser._id);
			if (editingService) {
				await updateService({
					id: editingService._id,
					name,
					notes: notes || undefined,
					deviceId: deviceId as Id<'devices'>,
					iconUrl: iconUrl || undefined,
					userId: currentUser._id
				});

				// Handle URLs
				const existingUrlIds = new Set(editingService.urls.map((u) => u._id));
				const currentUrlIds = new Set(urls.filter((u) => u.id).map((u) => u.id));

				// Delete removed URLs
				for (const url of editingService.urls) {
					if (!currentUrlIds.has(url._id)) {
						await removeUrl({ id: url._id, userId: currentUser._id });
					}
				}

				// Update or create URLs
				for (const url of urls) {
					const normalizedUrl = normalizeUrl(url.url);
					if (url.id) {
						await updateUrl({ id: url.id, label: url.label, url: normalizedUrl, pingInterval: url.pingInterval, excludeFromUptime: url.excludeFromUptime, userId: currentUser._id });
					} else {
						await createUrl({
							serviceId: editingService._id,
							label: url.label,
							url: normalizedUrl,
							pingInterval: url.pingInterval,
							excludeFromUptime: url.excludeFromUptime
						});
					}
				}
			} else {
				const serviceId = await createService({
					name,
					notes: notes || undefined,
					deviceId: deviceId as Id<'devices'>,
					iconUrl: iconUrl || undefined,
					userId: currentUser._id
				});

				// Create URLs
				for (const url of urls) {
					const normalizedUrl = normalizeUrl(url.url);
					await createUrl({
						serviceId,
						label: url.label,
						url: normalizedUrl,
						pingInterval: url.pingInterval,
						excludeFromUptime: url.excludeFromUptime,
						userId: currentUser._id
					});
				}
			}

			onClose();
		} catch (error) {
			console.error('Failed to save service:', error);
			alert('Failed to save service: ' + (error instanceof Error ? error.message : String(error)));
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	function handleFileUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			const result = e.target?.result as string;
			if (file.type === 'image/svg+xml') {
				// Store SVG as text
				iconUrl = result;
			} else {
				// Convert other images to data URL
				iconUrl = result;
			}
		};

		if (file.type === 'image/svg+xml') {
			reader.readAsText(file);
		} else {
			reader.readAsDataURL(file);
		}
	}
</script>

{#if isOpen}
	<div class="modal-backdrop" onclick={handleBackdropClick}>
		<div class="modal">
			<h2>{editingService ? 'Edit Service' : 'Add Service'}</h2>

			<div class="form">
				<div class="form-group">
					<label for="name">Service Name</label>
					<input id="name" type="text" bind:value={name} placeholder="e.g., Homebox" />
				</div>

				<div class="form-group">
					<label for="device">Device/VM</label>
					<select id="device" bind:value={deviceId}>
						<option value="">Select a device...</option>
						{#if devices.data}
							{#each devices.data as device}
								<option value={device._id}>{device.name}</option>
							{/each}
						{/if}
					</select>
				</div>

				<div class="form-group">
					<label for="iconUrl">Icon (URL or upload SVG/PNG)</label>
					<div class="icon-input-group">
						<input
							id="iconUrl"
							type="text"
							bind:value={iconUrl}
							placeholder="https://example.com/icon.png or paste SVG code"
						/>
						<label for="iconUpload" class="upload-btn">
							Upload
							<input
								id="iconUpload"
								type="file"
								accept="image/svg+xml,image/png,image/jpg,image/jpeg,image/webp"
								onchange={handleFileUpload}
								style="display: none;"
							/>
						</label>
					</div>
					{#if iconUrl && (iconUrl.startsWith('<svg') || iconUrl.startsWith('data:image'))}
						<div class="icon-preview">
							{#if iconUrl.startsWith('<svg')}
								{@html iconUrl}
							{:else}
								<img src={iconUrl} alt="Icon preview" />
							{/if}
						</div>
					{/if}
				</div>

				<div class="form-group">
					<label for="notes">Notes</label>
					<textarea id="notes" bind:value={notes} placeholder="Optional notes..." rows="3"></textarea>
				</div>

				<div class="form-group">
					<div class="label-row">
						<label>URLs</label>
						<button type="button" onclick={addUrl} class="add-url-btn">+ Add URL</button>
					</div>

					{#if urls.length > 0}
						<div class="url-headers">
							<span class="header-label">Label</span>
							<span class="header-url">URL</span>
							<span class="header-interval">Min</span>
							<span class="header-skip">Skip</span>
							<span class="header-action"></span>
						</div>
					{/if}

					{#each urls as url, i}
						<div class="url-row">
							<input type="text" bind:value={url.label} placeholder="Local" class="url-label" />
							<input type="text" bind:value={url.url} placeholder="youtube.com or 192.168.1.100:8080" class="url-input" />
							<input type="number" bind:value={url.pingInterval} placeholder="5" min="1" class="url-interval" />
							<input type="checkbox" bind:checked={url.excludeFromUptime} class="url-skip" title="Exclude from uptime monitoring" />
							<button type="button" onclick={() => removeUrlAtIndex(i)} class="remove-btn">×</button>
						</div>
					{/each}
				</div>

				<div class="button-row">
					<button type="button" onclick={onClose} class="cancel-btn">Cancel</button>
					<button type="button" onclick={handleSubmit} class="submit-btn" disabled={!name || !deviceId}>
						{editingService ? 'Update' : 'Create'}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 20px;
	}

	.modal {
		background: #1e2329;
		border: 1px solid #3a3f47;
		border-radius: 16px;
		padding: 32px;
		max-width: 700px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		overflow-x: hidden;
	}

	h2 {
		margin: 0 0 24px 0;
		font-size: 24px;
		font-weight: 600;
		color: #e8eaed;
	}

	.form {
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

	.label-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	input,
	textarea,
	select {
		background: #2d3339;
		border: 1px solid #3a3f47;
		border-radius: 8px;
		padding: 10px 12px;
		color: #e8eaed;
		font-size: 14px;
		font-family: inherit;
		transition: border-color 0.2s;
	}

	input:focus,
	textarea:focus,
	select:focus {
		outline: none;
		border-color: #d35400;
		box-shadow: 0 0 8px rgba(211, 84, 0, 0.3);
	}

	textarea {
		resize: vertical;
	}

	.url-headers {
		display: flex;
		gap: 8px;
		align-items: center;
		width: 100%;
		font-size: 12px;
		color: #6c757d;
		margin-bottom: 8px;
		padding: 0 2px;
	}

	.header-label {
		flex: 0 0 90px;
	}

	.header-url {
		flex: 1;
	}

	.header-interval {
		flex: 0 0 60px;
		text-align: center;
	}

	.header-skip {
		flex: 0 0 30px;
		text-align: center;
	}

	.header-action {
		width: 32px;
	}

	.url-row {
		display: flex;
		gap: 8px;
		align-items: center;
		width: 100%;
	}

	.url-label {
		flex: 0 0 90px;
		min-width: 0;
	}

	.url-input {
		flex: 1;
		min-width: 0;
	}

	.url-interval {
		flex: 0 0 60px;
		min-width: 60px;
	}

	.url-skip {
		flex: 0 0 30px;
		width: 18px;
		height: 18px;
		cursor: pointer;
		appearance: none;
		-webkit-appearance: none;
		-moz-appearance: none;
		background: #2d3339;
		border: 2px solid #3a3f47;
		border-radius: 4px;
		position: relative;
		transition: all 0.2s;
	}

	.url-skip:hover {
		border-color: #d35400;
		box-shadow: 0 0 6px rgba(211, 84, 0, 0.3);
	}

	.url-skip:checked {
		background: linear-gradient(135deg, #d35400 0%, #c54d00 100%);
		border-color: #d35400;
	}

	.url-skip:checked::after {
		content: '✓';
		position: absolute;
		color: white;
		font-size: 14px;
		font-weight: bold;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.icon-input-group {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.icon-input-group input[type="text"] {
		flex: 1;
	}

	.upload-btn {
		background: transparent;
		border: 1px solid #3a3f47;
		color: #d35400;
		padding: 10px 16px;
		border-radius: 8px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.upload-btn:hover {
		background: rgba(211, 84, 0, 0.1);
		border-color: #d35400;
		box-shadow: 0 0 8px rgba(211, 84, 0, 0.3);
	}

	.icon-preview {
		margin-top: 8px;
		width: 64px;
		height: 64px;
		background: #2d3339;
		border: 1px solid #3a3f47;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 8px;
	}

	.icon-preview :global(svg) {
		max-width: 100%;
		max-height: 100%;
	}

	.icon-preview img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	.add-url-btn {
		background: transparent;
		border: 1px solid #3a3f47;
		color: #d35400;
		padding: 6px 12px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 13px;
		transition: all 0.2s;
	}

	.add-url-btn:hover {
		background: rgba(211, 84, 0, 0.1);
		border-color: #d35400;
		box-shadow: 0 0 8px rgba(211, 84, 0, 0.3);
	}

	.remove-btn {
		background: transparent;
		border: 1px solid #3a3f47;
		color: #c0392b;
		width: 32px;
		height: 32px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 20px;
		line-height: 1;
		padding: 0;
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.remove-btn:hover {
		background: rgba(192, 57, 43, 0.15);
		border-color: #c0392b;
		box-shadow: 0 0 8px rgba(192, 57, 43, 0.4);
	}

	.button-row {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
		margin-top: 8px;
	}

	.cancel-btn,
	.submit-btn {
		padding: 10px 24px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.cancel-btn {
		background: transparent;
		border: 1px solid #3a3f47;
		color: #e8eaed;
	}

	.cancel-btn:hover {
		background: #2d3339;
	}

	.submit-btn {
		background: linear-gradient(135deg, #d35400 0%, #c54d00 100%);
		border: none;
		color: white;
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
</style>
