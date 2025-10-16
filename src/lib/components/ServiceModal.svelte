<script lang="ts">
	import { useMutation, useQuery } from '$lib/convex.svelte';
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
			}>;
		} | null;
	}

	let { isOpen, onClose, editingService = null }: Props = $props();

	const devices = useQuery(api.devices.list);
	const createService = useMutation(api.services.create);
	const updateService = useMutation(api.services.update);
	const createUrl = useMutation(api.serviceUrls.create);
	const updateUrl = useMutation(api.serviceUrls.update);
	const removeUrl = useMutation(api.serviceUrls.remove);

	let name = $state('');
	let notes = $state('');
	let deviceId = $state<Id<'devices'> | ''>('');
	let iconUrl = $state('');
	let urls = $state<Array<{ id?: Id<'serviceUrls'>; label: string; url: string; pingInterval?: number }>>([]);

	$effect(() => {
		if (isOpen) {
			if (editingService) {
				name = editingService.name;
				notes = editingService.notes || '';
				deviceId = editingService.deviceId;
				iconUrl = editingService.iconUrl || '';
				urls = editingService.urls.map((u) => ({ id: u._id, label: u.label, url: u.url, pingInterval: u.pingInterval ?? 5 }));
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
		urls = [...urls, { label: '', url: '', pingInterval: 5 }];
	}

	function removeUrlAtIndex(index: number) {
		urls = urls.filter((_, i) => i !== index);
	}

	async function handleSubmit() {
		if (!name || !deviceId) return;

		try {
			if (editingService) {
				await updateService({
					id: editingService._id,
					name,
					notes: notes || undefined,
					deviceId: deviceId as Id<'devices'>,
					iconUrl: iconUrl || undefined
				});

				// Handle URLs
				const existingUrlIds = new Set(editingService.urls.map((u) => u._id));
				const currentUrlIds = new Set(urls.filter((u) => u.id).map((u) => u.id));

				// Delete removed URLs
				for (const url of editingService.urls) {
					if (!currentUrlIds.has(url._id)) {
						await removeUrl({ id: url._id });
					}
				}

				// Update or create URLs
				for (const url of urls) {
					if (url.id) {
						await updateUrl({ id: url.id, label: url.label, url: url.url, pingInterval: url.pingInterval });
					} else {
						await createUrl({
							serviceId: editingService._id,
							label: url.label,
							url: url.url,
							pingInterval: url.pingInterval
						});
					}
				}
			} else {
				const serviceId = await createService({
					name,
					notes: notes || undefined,
					deviceId: deviceId as Id<'devices'>,
					iconUrl: iconUrl || undefined
				});

				// Create URLs
				for (const url of urls) {
					await createUrl({
						serviceId,
						label: url.label,
						url: url.url,
						pingInterval: url.pingInterval
					});
				}
			}

			onClose();
		} catch (error) {
			console.error('Failed to save service:', error);
		}
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
					<label for="iconUrl">Icon URL</label>
					<input
						id="iconUrl"
						type="url"
						bind:value={iconUrl}
						placeholder="https://example.com/icon.png"
					/>
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
							<span class="header-action"></span>
						</div>
					{/if}

					{#each urls as url, i}
						<div class="url-row">
							<input type="text" bind:value={url.label} placeholder="Local" class="url-label" />
							<input type="url" bind:value={url.url} placeholder="https://..." class="url-input" />
							<input type="number" bind:value={url.pingInterval} placeholder="5" min="1" class="url-interval" />
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
		background: #1a1a1a;
		border: 1px solid #2a2a2a;
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
		color: #fff;
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
		color: #aaa;
	}

	.label-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	input,
	textarea,
	select {
		background: #111;
		border: 1px solid #2a2a2a;
		border-radius: 8px;
		padding: 10px 12px;
		color: #fff;
		font-size: 14px;
		font-family: inherit;
		transition: border-color 0.2s;
	}

	input:focus,
	textarea:focus,
	select:focus {
		outline: none;
		border-color: #667eea;
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
		color: #888;
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

	.add-url-btn {
		background: transparent;
		border: 1px solid #3a3a3a;
		color: #667eea;
		padding: 6px 12px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 13px;
		transition: all 0.2s;
	}

	.add-url-btn:hover {
		background: rgba(102, 126, 234, 0.1);
		border-color: #667eea;
	}

	.remove-btn {
		background: transparent;
		border: 1px solid #3a3a3a;
		color: #ef4444;
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
		background: rgba(239, 68, 68, 0.1);
		border-color: #ef4444;
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
		border: 1px solid #3a3a3a;
		color: #fff;
	}

	.cancel-btn:hover {
		background: #2a2a2a;
	}

	.submit-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border: none;
		color: white;
	}

	.submit-btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.submit-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
