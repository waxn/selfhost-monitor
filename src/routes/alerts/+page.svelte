<script lang="ts">
	import { useMutation, useQuery, getCurrentUser } from '$lib/convex.svelte';
	import { api } from '../../../convex/_generated/api';
	import { goto } from '$app/navigation';
	import type { Id } from '../../../convex/_generated/dataModel';

	let currentUser = $state<any>(null);
	let activeView = $state<'overview' | 'profiles' | 'services'>('overview');
	let selectedProfile = $state<any>(null);
	let showProfileModal = $state(false);
	let showServiceAlertModal = $state(false);
	let selectedService = $state<any>(null);

	// Get current user
	$effect(() => {
		getCurrentUser().then(user => {
			if (!user) {
				goto('/');
			} else {
				currentUser = user;
			}
		});
	});

	// Load data
	const alertProfiles = useQuery(api.alertProfiles.list, () =>
		currentUser ? { userId: currentUser._id } : 'skip'
	);

	const services = useQuery(api.services.list, () =>
		currentUser ? { userId: currentUser._id } : 'skip'
	);

	const serviceUrls = useQuery(api.serviceUrls.listByService, () =>
		selectedService ? { serviceId: selectedService._id } : 'skip'
	);

	// Mutations
	const createProfile = useMutation(api.alertProfiles.create);
	const updateProfile = useMutation(api.alertProfiles.update);
	const deleteProfile = useMutation(api.alertProfiles.remove);
	const duplicateProfile = useMutation(api.alertProfiles.duplicate);

	// Profile form state
	let profileForm = $state({
		name: '',
		description: '',
		minDowntime: 0,
		consecutiveFailures: 1,
		alertCooldown: 15,
		notifyOnDown: true,
		notifyOnRecovery: true,
		priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
		alertOnSlowResponse: false,
		slowResponseThreshold: 5000,
		alertOnStatusCodes: [] as number[],
		ignoreStatusCodes: [] as number[],
		additionalEmails: [] as string[],
	});

	function openNewProfileModal() {
		profileForm = {
			name: '',
			description: '',
			minDowntime: 0,
			consecutiveFailures: 1,
			alertCooldown: 15,
			notifyOnDown: true,
			notifyOnRecovery: true,
			priority: 'medium',
			alertOnSlowResponse: false,
			slowResponseThreshold: 5000,
			alertOnStatusCodes: [],
			ignoreStatusCodes: [],
			additionalEmails: [],
		};
		selectedProfile = null;
		showProfileModal = true;
	}

	function openEditProfileModal(profile: any) {
		profileForm = {
			name: profile.name,
			description: profile.description || '',
			minDowntime: profile.minDowntime,
			consecutiveFailures: profile.consecutiveFailures,
			alertCooldown: profile.alertCooldown,
			notifyOnDown: profile.notifyOnDown,
			notifyOnRecovery: profile.notifyOnRecovery,
			priority: profile.priority || 'medium',
			alertOnSlowResponse: profile.alertOnSlowResponse || false,
			slowResponseThreshold: profile.slowResponseThreshold || 5000,
			alertOnStatusCodes: profile.alertOnStatusCodes || [],
			ignoreStatusCodes: profile.ignoreStatusCodes || [],
			additionalEmails: profile.additionalEmails || [],
		};
		selectedProfile = profile;
		showProfileModal = true;
	}

	async function saveProfile() {
		if (!currentUser) return;

		try {
			if (selectedProfile) {
				await updateProfile({
					id: selectedProfile._id,
					userId: currentUser._id,
					...profileForm,
				});
			} else {
				await createProfile({
					userId: currentUser._id,
					...profileForm,
				});
			}
			showProfileModal = false;
		} catch (error) {
			console.error('Failed to save profile:', error);
			alert('Failed to save profile: ' + (error instanceof Error ? error.message : String(error)));
		}
	}

	async function handleDeleteProfile(profileId: Id<'alertProfiles'>) {
		if (!currentUser) return;
		if (!confirm('Are you sure you want to delete this alert profile?')) return;

		try {
			await deleteProfile({ id: profileId, userId: currentUser._id });
		} catch (error) {
			console.error('Failed to delete profile:', error);
		}
	}

	async function handleDuplicateProfile(profileId: Id<'alertProfiles'>) {
		if (!currentUser) return;
		const newName = prompt('Enter name for duplicated profile:');
		if (!newName) return;

		try {
			await duplicateProfile({ id: profileId, userId: currentUser._id, newName });
		} catch (error) {
			console.error('Failed to duplicate profile:', error);
		}
	}

	function getPriorityColor(priority: string) {
		switch (priority) {
			case 'critical': return '#c0392b';
			case 'high': return '#e67e22';
			case 'medium': return '#f39c12';
			case 'low': return '#95a5a6';
			default: return '#95a5a6';
		}
	}

	function getPriorityIcon(priority: string) {
		switch (priority) {
			case 'critical': return '🔴';
			case 'high': return '🟠';
			case 'medium': return '🟡';
			case 'low': return '🔵';
			default: return '⚪';
		}
	}
</script>

<div class="page-container">
	<div class="header">
		<div class="title-row">
			<button class="back-btn" onclick={() => goto('/dashboard')}>← Dashboard</button>
			<h1>Alert Management</h1>
		</div>
		<p class="subtitle">Manage alert profiles, customize notifications per service, and configure advanced alert rules</p>
	</div>

	<div class="view-tabs">
		<button
			class="view-tab"
			class:active={activeView === 'overview'}
			onclick={() => activeView = 'overview'}
		>
			📊 Overview
		</button>
		<button
			class="view-tab"
			class:active={activeView === 'profiles'}
			onclick={() => activeView = 'profiles'}
		>
			📋 Alert Profiles
		</button>
		<button
			class="view-tab"
			class:active={activeView === 'services'}
			onclick={() => activeView = 'services'}
		>
			⚙️ Per-Service Settings
		</button>
	</div>

	<div class="content">
		{#if activeView === 'overview'}
			<div class="overview">
				<div class="stat-cards">
					<div class="stat-card">
						<div class="stat-icon">📋</div>
						<div class="stat-content">
							<div class="stat-value">{alertProfiles.data?.length || 0}</div>
							<div class="stat-label">Alert Profiles</div>
						</div>
					</div>
					<div class="stat-card">
						<div class="stat-icon">⚙️</div>
						<div class="stat-content">
							<div class="stat-value">{services.data?.filter((s: any) => s.useCustomAlerts).length || 0}</div>
							<div class="stat-label">Services with Custom Alerts</div>
						</div>
					</div>
					<div class="stat-card">
						<div class="stat-icon">📧</div>
						<div class="stat-content">
							<div class="stat-value">{services.data?.length || 0}</div>
							<div class="stat-label">Total Services</div>
						</div>
					</div>
				</div>

				<div class="info-section">
					<h2>How Alert Configuration Works</h2>
					<div class="hierarchy">
						<div class="hierarchy-item">
							<div class="hierarchy-number">1</div>
							<div class="hierarchy-content">
								<h3>Global Defaults</h3>
								<p>Set in Settings → Email Notifications. Applied to all services unless overridden.</p>
							</div>
						</div>
						<div class="hierarchy-arrow">↓</div>
						<div class="hierarchy-item">
							<div class="hierarchy-number">2</div>
							<div class="hierarchy-content">
								<h3>Alert Profiles</h3>
								<p>Reusable configurations you can apply to multiple services. Create profiles like "Critical Production" or "Dev Environment".</p>
							</div>
						</div>
						<div class="hierarchy-arrow">↓</div>
						<div class="hierarchy-item">
							<div class="hierarchy-number">3</div>
							<div class="hierarchy-content">
								<h3>Per-Service Settings</h3>
								<p>Override defaults for specific services. Set custom email templates, thresholds, and recipients.</p>
							</div>
						</div>
						<div class="hierarchy-arrow">↓</div>
						<div class="hierarchy-item">
							<div class="hierarchy-number">4</div>
							<div class="hierarchy-content">
								<h3>Per-URL Settings</h3>
								<p>Most specific level. Configure individual URLs within a service with unique alert rules.</p>
							</div>
						</div>
					</div>
				</div>

				<div class="quick-actions">
					<h2>Quick Actions</h2>
					<div class="action-buttons">
						<button class="action-btn primary" onclick={openNewProfileModal}>
							<span class="btn-icon">➕</span>
							Create Alert Profile
						</button>
						<button class="action-btn" onclick={() => activeView = 'services'}>
							<span class="btn-icon">⚙️</span>
							Configure Service Alerts
						</button>
						<button class="action-btn" onclick={() => goto('/alert-settings')}>
							<span class="btn-icon">🌐</span>
							Global Settings
						</button>
					</div>
				</div>
			</div>
		{/if}

		{#if activeView === 'profiles'}
			<div class="profiles-view">
				<div class="section-header">
					<h2>Alert Profiles</h2>
					<button class="primary-btn" onclick={openNewProfileModal}>
						+ New Profile
					</button>
				</div>

				{#if alertProfiles.data && alertProfiles.data.length > 0}
					<div class="profiles-grid">
						{#each alertProfiles.data as profile}
							<div class="profile-card">
								<div class="profile-header">
									<div class="profile-title">
										<span class="profile-icon">{getPriorityIcon(profile.priority || 'medium')}</span>
										<h3>{profile.name}</h3>
									</div>
									<div class="profile-actions">
										<button
											class="icon-btn"
											onclick={() => openEditProfileModal(profile)}
											title="Edit"
										>
											✏️
										</button>
										<button
											class="icon-btn"
											onclick={() => handleDuplicateProfile(profile._id)}
											title="Duplicate"
										>
											📋
										</button>
										<button
											class="icon-btn danger"
											onclick={() => handleDeleteProfile(profile._id)}
											title="Delete"
										>
											🗑️
										</button>
									</div>
								</div>

								{#if profile.description}
									<p class="profile-description">{profile.description}</p>
								{/if}

								<div class="profile-details">
									<div class="detail-item">
										<span class="detail-label">Min Downtime:</span>
										<span class="detail-value">{profile.minDowntime}s</span>
									</div>
									<div class="detail-item">
										<span class="detail-label">Consecutive Failures:</span>
										<span class="detail-value">{profile.consecutiveFailures}</span>
									</div>
									<div class="detail-item">
										<span class="detail-label">Alert Cooldown:</span>
										<span class="detail-value">{profile.alertCooldown}m</span>
									</div>
									<div class="detail-item">
										<span class="detail-label">Priority:</span>
										<span class="detail-value" style="color: {getPriorityColor(profile.priority || 'medium')}">{profile.priority || 'medium'}</span>
									</div>
								</div>

								<div class="profile-flags">
									{#if profile.notifyOnDown}<span class="flag">📧 Down Alerts</span>{/if}
									{#if profile.notifyOnRecovery}<span class="flag">✅ Recovery Alerts</span>{/if}
									{#if profile.alertOnSlowResponse}<span class="flag">🐌 Slow Response</span>{/if}
									{#if profile.additionalEmails && profile.additionalEmails.length > 0}
										<span class="flag">👥 +{profile.additionalEmails.length} Recipients</span>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="empty-state">
						<div class="empty-icon">📋</div>
						<h3>No Alert Profiles Yet</h3>
						<p>Create reusable alert profiles to quickly configure multiple services with consistent settings.</p>
						<button class="primary-btn" onclick={openNewProfileModal}>
							Create Your First Profile
						</button>
					</div>
				{/if}
			</div>
		{/if}

		{#if activeView === 'services'}
			<div class="services-view">
				<div class="section-header">
					<h2>Per-Service Alert Configuration</h2>
					<p class="section-subtitle">Configure custom alert settings for each service</p>
				</div>

				{#if services.data && services.data.length > 0}
					<div class="services-list">
						{#each services.data as service}
							<div class="service-item">
								<div class="service-info">
									{#if service.iconUrl}
										<div class="service-icon">
											{#if service.iconUrl.startsWith('<svg')}
												{@html service.iconUrl}
											{:else}
												<img src={service.iconUrl} alt={service.name} />
											{/if}
										</div>
									{/if}
									<div class="service-details">
										<h3>{service.name}</h3>
										{#if service.useCustomAlerts}
											<span class="custom-badge">Custom Alerts Enabled</span>
										{:else}
											<span class="default-badge">Using Global Defaults</span>
										{/if}
									</div>
								</div>
								<div class="service-actions">
									<button
										class="service-btn"
										onclick={() => {
											selectedService = service;
											goto(`/service/${service._id}/alerts`);
										}}
									>
										Configure Alerts
									</button>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="empty-state">
						<div class="empty-icon">⚙️</div>
						<h3>No Services Yet</h3>
						<p>Create services in the dashboard to configure their alert settings.</p>
						<button class="primary-btn" onclick={() => goto('/dashboard')}>
							Go to Dashboard
						</button>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<!-- Profile Modal -->
{#if showProfileModal}
	<div class="modal-backdrop" onclick={(e) => e.target === e.currentTarget && (showProfileModal = false)}>
		<div class="modal">
			<div class="modal-header">
				<h2>{selectedProfile ? 'Edit Alert Profile' : 'New Alert Profile'}</h2>
				<button class="close-btn" onclick={() => showProfileModal = false}>×</button>
			</div>

			<div class="modal-content">
				<div class="form-group">
					<label for="profileName">Profile Name</label>
					<input
						id="profileName"
						type="text"
						bind:value={profileForm.name}
						placeholder="e.g., Critical Production"
					/>
				</div>

				<div class="form-group">
					<label for="profileDescription">Description (optional)</label>
					<textarea
						id="profileDescription"
						bind:value={profileForm.description}
						placeholder="Describe when to use this profile..."
						rows="2"
					></textarea>
				</div>

				<div class="form-group">
					<label for="profilePriority">Priority Level</label>
					<select id="profilePriority" bind:value={profileForm.priority}>
						<option value="low">🔵 Low</option>
						<option value="medium">🟡 Medium</option>
						<option value="high">🟠 High</option>
						<option value="critical">🔴 Critical</option>
					</select>
				</div>

				<div class="form-grid">
					<div class="form-group">
						<label for="minDowntime">Min Downtime (seconds)</label>
						<input
							id="minDowntime"
							type="number"
							bind:value={profileForm.minDowntime}
							min="0"
							step="10"
						/>
					</div>

					<div class="form-group">
						<label for="consecutiveFailures">Consecutive Failures</label>
						<input
							id="consecutiveFailures"
							type="number"
							bind:value={profileForm.consecutiveFailures}
							min="1"
							max="20"
						/>
					</div>

					<div class="form-group">
						<label for="alertCooldown">Alert Cooldown (minutes)</label>
						<input
							id="alertCooldown"
							type="number"
							bind:value={profileForm.alertCooldown}
							min="1"
						/>
					</div>

					<div class="form-group">
						<label for="slowThreshold">Slow Response Threshold (ms)</label>
						<input
							id="slowThreshold"
							type="number"
							bind:value={profileForm.slowResponseThreshold}
							min="100"
							step="100"
						/>
					</div>
				</div>

				<div class="form-group checkbox-group">
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={profileForm.notifyOnDown} />
						<span>Send alerts when service goes down</span>
					</label>
				</div>

				<div class="form-group checkbox-group">
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={profileForm.notifyOnRecovery} />
						<span>Send alerts when service recovers</span>
					</label>
				</div>

				<div class="form-group checkbox-group">
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={profileForm.alertOnSlowResponse} />
						<span>Alert on slow response times</span>
					</label>
				</div>
			</div>

			<div class="modal-footer">
				<button class="cancel-btn" onclick={() => showProfileModal = false}>
					Cancel
				</button>
				<button class="save-btn" onclick={saveProfile} disabled={!profileForm.name}>
					{selectedProfile ? 'Update' : 'Create'} Profile
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.page-container {
		min-height: 100vh;
		background: #0a0e12;
		color: #e8eaed;
		padding: 40px 20px;
	}

	.header {
		max-width: 1200px;
		margin: 0 auto 32px;
	}

	.title-row {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 8px;
	}

	.back-btn {
		background: transparent;
		border: 1px solid #3a3f47;
		color: #d35400;
		padding: 8px 16px;
		border-radius: 8px;
		cursor: pointer;
		font-size: 14px;
		transition: all 0.2s;
	}

	.back-btn:hover {
		background: rgba(211, 84, 0, 0.1);
		border-color: #d35400;
	}

	h1 {
		font-size: 32px;
		font-weight: 600;
		margin: 0;
	}

	.subtitle {
		color: #a0a4a8;
		font-size: 16px;
		margin: 0;
	}

	.view-tabs {
		max-width: 1200px;
		margin: 0 auto 32px;
		display: flex;
		gap: 8px;
		border-bottom: 2px solid #3a3f47;
	}

	.view-tab {
		background: transparent;
		border: none;
		color: #a0a4a8;
		padding: 12px 24px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
		border-bottom: 3px solid transparent;
		margin-bottom: -2px;
		transition: all 0.2s;
	}

	.view-tab:hover {
		color: #e8eaed;
	}

	.view-tab.active {
		color: #d35400;
		border-bottom-color: #d35400;
	}

	.content {
		max-width: 1200px;
		margin: 0 auto;
	}

	/* Overview */
	.stat-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 20px;
		margin-bottom: 32px;
	}

	.stat-card {
		background: #1e2329;
		border: 1px solid #3a3f47;
		border-radius: 12px;
		padding: 24px;
		display: flex;
		gap: 16px;
		align-items: center;
	}

	.stat-icon {
		font-size: 32px;
	}

	.stat-value {
		font-size: 32px;
		font-weight: 600;
		color: #d35400;
	}

	.stat-label {
		color: #a0a4a8;
		font-size: 14px;
	}

	.info-section {
		background: #1e2329;
		border: 1px solid #3a3f47;
		border-radius: 12px;
		padding: 32px;
		margin-bottom: 32px;
	}

	.info-section h2 {
		margin: 0 0 24px 0;
		font-size: 20px;
	}

	.hierarchy {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.hierarchy-item {
		display: flex;
		gap: 16px;
		background: rgba(211, 84, 0, 0.05);
		border-left: 3px solid #d35400;
		padding: 16px;
		border-radius: 8px;
	}

	.hierarchy-number {
		background: #d35400;
		color: white;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		flex-shrink: 0;
	}

	.hierarchy-content h3 {
		margin: 0 0 4px 0;
		font-size: 16px;
		color: #e8eaed;
	}

	.hierarchy-content p {
		margin: 0;
		color: #a0a4a8;
		font-size: 14px;
	}

	.hierarchy-arrow {
		text-align: center;
		color: #d35400;
		font-size: 24px;
	}

	.quick-actions h2 {
		margin: 0 0 16px 0;
		font-size: 20px;
	}

	.action-buttons {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
	}

	.action-btn {
		background: #1e2329;
		border: 1px solid #3a3f47;
		color: #e8eaed;
		padding: 16px;
		border-radius: 8px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.action-btn:hover {
		border-color: #d35400;
		transform: translateY(-2px);
	}

	.action-btn.primary {
		background: linear-gradient(135deg, #d35400 0%, #c54d00 100%);
		border-color: #d35400;
		color: white;
	}

	.btn-icon {
		font-size: 18px;
	}

	/* Profiles */
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
	}

	.section-header h2 {
		margin: 0;
		font-size: 24px;
	}

	.section-subtitle {
		color: #a0a4a8;
		font-size: 14px;
		margin: 4px 0 0 0;
	}

	.primary-btn {
		background: linear-gradient(135deg, #d35400 0%, #c54d00 100%);
		border: none;
		color: white;
		padding: 10px 20px;
		border-radius: 8px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
		transition: all 0.2s;
	}

	.primary-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(211, 84, 0, 0.5);
	}

	.profiles-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 20px;
	}

	.profile-card {
		background: #1e2329;
		border: 1px solid #3a3f47;
		border-radius: 12px;
		padding: 20px;
		transition: all 0.2s;
	}

	.profile-card:hover {
		border-color: #d35400;
		transform: translateY(-2px);
	}

	.profile-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 12px;
	}

	.profile-title {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.profile-icon {
		font-size: 20px;
	}

	.profile-title h3 {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
	}

	.profile-actions {
		display: flex;
		gap: 4px;
	}

	.icon-btn {
		background: transparent;
		border: 1px solid #3a3f47;
		padding: 6px 10px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 14px;
		transition: all 0.2s;
	}

	.icon-btn:hover {
		border-color: #d35400;
		background: rgba(211, 84, 0, 0.1);
	}

	.icon-btn.danger:hover {
		border-color: #c0392b;
		background: rgba(192, 57, 43, 0.1);
	}

	.profile-description {
		color: #a0a4a8;
		font-size: 13px;
		margin: 0 0 16px 0;
	}

	.profile-details {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		margin-bottom: 16px;
	}

	.detail-item {
		font-size: 13px;
	}

	.detail-label {
		color: #a0a4a8;
		display: block;
	}

	.detail-value {
		color: #e8eaed;
		font-weight: 500;
	}

	.profile-flags {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.flag {
		background: rgba(211, 84, 0, 0.1);
		border: 1px solid rgba(211, 84, 0, 0.3);
		color: #d35400;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 11px;
	}

	/* Services */
	.services-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.service-item {
		background: #1e2329;
		border: 1px solid #3a3f47;
		border-radius: 12px;
		padding: 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: all 0.2s;
	}

	.service-item:hover {
		border-color: #d35400;
	}

	.service-info {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.service-icon {
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #2d3339;
		border-radius: 8px;
		padding: 8px;
	}

	.service-icon :global(svg),
	.service-icon img {
		max-width: 100%;
		max-height: 100%;
	}

	.service-details h3 {
		margin: 0 0 4px 0;
		font-size: 18px;
	}

	.custom-badge {
		background: rgba(211, 84, 0, 0.2);
		border: 1px solid #d35400;
		color: #d35400;
		padding: 2px 8px;
		border-radius: 4px;
		font-size: 11px;
		font-weight: 500;
	}

	.default-badge {
		background: rgba(160, 164, 168, 0.2);
		border: 1px solid #a0a4a8;
		color: #a0a4a8;
		padding: 2px 8px;
		border-radius: 4px;
		font-size: 11px;
		font-weight: 500;
	}

	.service-btn {
		background: transparent;
		border: 1px solid #d35400;
		color: #d35400;
		padding: 10px 20px;
		border-radius: 8px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
		transition: all 0.2s;
	}

	.service-btn:hover {
		background: rgba(211, 84, 0, 0.1);
	}

	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 60px 20px;
	}

	.empty-icon {
		font-size: 64px;
		margin-bottom: 16px;
	}

	.empty-state h3 {
		margin: 0 0 8px 0;
		font-size: 20px;
	}

	.empty-state p {
		color: #a0a4a8;
		margin: 0 0 24px 0;
	}

	/* Modal */
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
		max-width: 600px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24px 24px 16px;
		border-bottom: 1px solid #3a3f47;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 20px;
	}

	.close-btn {
		background: transparent;
		border: none;
		color: #a0a4a8;
		font-size: 28px;
		cursor: pointer;
		line-height: 1;
		padding: 0;
		width: 32px;
		height: 32px;
		transition: color 0.2s;
	}

	.close-btn:hover {
		color: #e8eaed;
	}

	.modal-content {
		padding: 24px;
	}

	.form-group {
		margin-bottom: 20px;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	label {
		display: block;
		font-size: 14px;
		font-weight: 500;
		color: #e8eaed;
		margin-bottom: 8px;
	}

	input[type="text"],
	input[type="number"],
	textarea,
	select {
		width: 100%;
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

	.checkbox-group {
		margin-bottom: 12px;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 12px;
		cursor: pointer;
		font-size: 14px;
	}

	.checkbox-label input[type="checkbox"] {
		width: 20px;
		height: 20px;
		cursor: pointer;
	}

	.modal-footer {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
		padding: 16px 24px 24px;
		border-top: 1px solid #3a3f47;
	}

	.cancel-btn,
	.save-btn {
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

	.save-btn {
		background: linear-gradient(135deg, #d35400 0%, #c54d00 100%);
		border: none;
		color: white;
		box-shadow: 0 2px 8px rgba(211, 84, 0, 0.3);
	}

	.save-btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(211, 84, 0, 0.5);
	}

	.save-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (max-width: 768px) {
		.form-grid {
			grid-template-columns: 1fr;
		}

		.profiles-grid {
			grid-template-columns: 1fr;
		}

		.stat-cards {
			grid-template-columns: 1fr;
		}
	}
</style>
