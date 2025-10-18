<script lang="ts">
	import { useMutation, getCurrentUser } from '$lib/convex.svelte';
	import { api } from '../../../convex/_generated/api';
	import type { Id } from '../../../convex/_generated/dataModel';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		editingDevice?: {
			_id: Id<'devices'>;
			name: string;
			description?: string;
		} | null;
	}

	let { isOpen, onClose, editingDevice = null }: Props = $props();

	let currentUser = $state<any>(null);

	// Get current user reactively
	$effect(() => {
		getCurrentUser().then(user => currentUser = user);
	});

	const createDevice = useMutation(api.devices.create);
	const updateDevice = useMutation(api.devices.update);

	let name = $state('');
	let description = $state('');

	$effect(() => {
		if (isOpen) {
			if (editingDevice) {
				name = editingDevice.name;
				description = editingDevice.description || '';
			} else {
				name = '';
				description = '';
			}
		}
	});

	async function handleSubmit() {
		if (!name || !currentUser) {
			console.log('Missing name or currentUser:', { name, currentUser });
			return;
		}

		try {
			console.log('Submitting device with userId:', currentUser._id);
			if (editingDevice) {
				await updateDevice({
					id: editingDevice._id,
					name,
					description: description || undefined,
					userId: currentUser._id
				});
			} else {
				await createDevice({
					name,
					description: description || undefined,
					userId: currentUser._id
				});
			}

			onClose();
		} catch (error) {
			console.error('Failed to save device:', error);
			alert('Failed to save device: ' + (error instanceof Error ? error.message : String(error)));
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
			<h2>{editingDevice ? 'Edit Device' : 'Add Device'}</h2>

			<div class="form">
				<div class="form-group">
					<label for="device-name">Device Name</label>
					<input
						id="device-name"
						type="text"
						bind:value={name}
						placeholder="e.g., Home Server"
					/>
				</div>

				<div class="form-group">
					<label for="device-description">Description</label>
					<textarea
						id="device-description"
						bind:value={description}
						placeholder="Optional description..."
						rows="3"
					></textarea>
				</div>

				<div class="button-row">
					<button type="button" onclick={onClose} class="cancel-btn">Cancel</button>
					<button type="button" onclick={handleSubmit} class="submit-btn" disabled={!name}>
						{editingDevice ? 'Update' : 'Create'}
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
		max-width: 500px;
		width: 100%;
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

	input,
	textarea {
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
	textarea:focus {
		outline: none;
		border-color: #d35400;
		box-shadow: 0 0 8px rgba(211, 84, 0, 0.3);
	}

	textarea {
		resize: vertical;
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
