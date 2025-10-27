<script lang="ts">
	import { useMutation, useQuery, getCurrentUser } from '$lib/convex.svelte';
	import { api } from '../../../../../convex/_generated/api';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Id } from '../../../../../convex/_generated/dataModel';

	let currentUser = $state<any>(null);
	let serviceId = $derived($page.url.pathname.split('/')[2] as Id<'services'>);
	let activeTab = $state<'service' | 'urls'>('service');
	let saveStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
	let saveMessage = $state('');

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

	// Load service and URLs
	const service = useQuery(api.services.get, () =>
		currentUser && serviceId ? { id: serviceId, userId: currentUser._id } : 'skip'
	);

	const urls = useQuery(api.serviceUrls.listByService, () =>
		serviceId ? { serviceId } : 'skip'
	);

	const alertProfiles = useQuery(api.alertProfiles.list, () =>
		currentUser ? { userId: currentUser._id } : 'skip'
	);

	// Mutations
	const updateService = useMutation(api.services.update);
	const updateUrl = useMutation(api.serviceUrls.update);

	// Service-level form state
	let useCustomAlerts = $state(false);
	let customDownAlertSubject = $state('');
	let customDownAlertBody = $state('');
	let customRecoveryAlertSubject = $state('');
	let customRecoveryAlertBody = $state('');
	let alertPriority = $state<'low' | 'medium' | 'high' | 'critical'>('medium');
	let alertTags = $state<string[]>([]);
	let newTag = $state('');

	// Load service data into form
	$effect(() => {
		if (service.data) {
			useCustomAlerts = service.data.useCustomAlerts ?? false;
			customDownAlertSubject = service.data.customDownAlertSubject ?? '';
			customDownAlertBody = service.data.customDownAlertBody ?? '';
			customRecoveryAlertSubject = service.data.customRecoveryAlertSubject ?? '';
			customRecoveryAlertBody = service.data.customRecoveryAlertBody ?? '';
			alertPriority = service.data.alertPriority ?? 'medium';
			alertTags = service.data.alertTags ?? [];
		}
	});

	// URL-level state (expandable per URL)
	let expandedUrls = $state<Set<string>>(new Set());
	let urlSettings = $state<Record<string, any>>({});

	// Initialize URL settings
	$effect(() => {
		if (urls.data) {
			const settings: Record<string, any> = {};
			urls.data.forEach((url: any) => {
				settings[url._id] = {
					useCustomAlerts: url.useCustomAlerts ?? false,
					customDownAlertSubject: url.customDownAlertSubject ?? '',
					customDownAlertBody: url.customDownAlertBody ?? '',
					customRecoveryAlertSubject: url.customRecoveryAlertSubject ?? '',
					customRecoveryAlertBody: url.customRecoveryAlertBody ?? '',
					additionalEmails: url.additionalEmails ?? [],
					alertOnSlowResponse: url.alertOnSlowResponse ?? false,
					slowResponseThreshold: url.slowResponseThreshold ?? 5000,
					alertOnStatusCodes: url.alertOnStatusCodes ?? [],
					ignoreStatusCodes: url.ignoreStatusCodes ?? [],
				};
			});
			urlSettings = settings;
		}
	});

	function toggleUrlExpanded(urlId: string) {
		const newSet = new Set(expandedUrls);
		if (newSet.has(urlId)) {
			newSet.delete(urlId);
		} else {
			newSet.add(urlId);
		}
		expandedUrls = newSet;
	}

	async function saveServiceSettings() {
		if (!currentUser || !service.data) return;

		saveStatus = 'saving';
		try {
			await updateService({
				id: serviceId,
				userId: currentUser._id,
				name: service.data.name,
				useCustomAlerts,
				customDownAlertSubject: customDownAlertSubject || undefined,
				customDownAlertBody: customDownAlertBody || undefined,
				customRecoveryAlertSubject: customRecoveryAlertSubject || undefined,
				customRecoveryAlertBody: customRecoveryAlertBody || undefined,
				alertPriority,
				alertTags: alertTags.length > 0 ? alertTags : undefined,
			});
			saveStatus = 'saved';
			saveMessage = 'Service alert settings saved!';
			setTimeout(() => {
				saveStatus = 'idle';
			}, 3000);
		} catch (error) {
			saveStatus = 'error';
			saveMessage = 'Failed to save: ' + (error instanceof Error ? error.message : String(error));
		}
	}

	async function saveUrlSettings(urlId: string) {
		if (!currentUser || !urls.data) return;

		const url = urls.data.find((u: any) => u._id === urlId);
		if (!url) return;

		const settings = urlSettings[urlId];

		try {
			await updateUrl({
				id: urlId as Id<'serviceUrls'>,
				userId: currentUser._id,
				label: url.label,
				url: url.url,
				useCustomAlerts: settings.useCustomAlerts,
				customDownAlertSubject: settings.customDownAlertSubject || undefined,
				customDownAlertBody: settings.customDownAlertBody || undefined,
				customRecoveryAlertSubject: settings.customRecoveryAlertSubject || undefined,
				customRecoveryAlertBody: settings.customRecoveryAlertBody || undefined,
				additionalEmails: settings.additionalEmails.length > 0 ? settings.additionalEmails : undefined,
				alertOnSlowResponse: settings.alertOnSlowResponse,
				slowResponseThreshold: settings.slowResponseThreshold,
				alertOnStatusCodes: settings.alertOnStatusCodes.length > 0 ? settings.alertOnStatusCodes : undefined,
				ignoreStatusCodes: settings.ignoreStatusCodes.length > 0 ? settings.ignoreStatusCodes : undefined,
			});
			alert('URL alert settings saved!');
		} catch (error) {
			console.error('Failed to save URL settings:', error);
			alert('Failed to save: ' + (error instanceof Error ? error.message : String(error)));
		}
	}

	function applyProfile(profile: any) {
		if (activeTab === 'service') {
			customDownAlertSubject = profile.downAlertSubject || '';
			customDownAlertBody = profile.downAlertBody || '';
			customRecoveryAlertSubject = profile.recoveryAlertSubject || '';
			customRecoveryAlertBody = profile.recoveryAlertBody || '';
			alertPriority = profile.priority || 'medium';
		}
	}

	function addTag() {
		if (newTag && !alertTags.includes(newTag)) {
			alertTags = [...alertTags, newTag];
			newTag = '';
		}
	}

	function removeTag(tag: string) {
		alertTags = alertTags.filter(t => t !== tag);
	}

	function addEmail(urlId: string) {
		const email = prompt('Enter email address to add:');
		if (email && urlSettings[urlId]) {
			urlSettings[urlId].additionalEmails = [...urlSettings[urlId].additionalEmails, email];
		}
	}

	function removeEmail(urlId: string, email: string) {
		if (urlSettings[urlId]) {
			urlSettings[urlId].additionalEmails = urlSettings[urlId].additionalEmails.filter((e: string) => e !== email);
		}
	}

	function addStatusCode(urlId: string, type: 'alert' | 'ignore') {
		const code = prompt(`Enter HTTP status code to ${type === 'alert' ? 'alert on' : 'ignore'}:`);
		if (code && urlSettings[urlId]) {
			const codeNum = parseInt(code);
			if (!isNaN(codeNum) && codeNum >= 100 && codeNum < 600) {
				if (type === 'alert') {
					urlSettings[urlId].alertOnStatusCodes = [...urlSettings[urlId].alertOnStatusCodes, codeNum];
				} else {
					urlSettings[urlId].ignoreStatusCodes = [...urlSettings[urlId].ignoreStatusCodes, codeNum];
				}
			}
		}
	}

	function removeStatusCode(urlId: string, code: number, type: 'alert' | 'ignore') {
		if (urlSettings[urlId]) {
			if (type === 'alert') {
				urlSettings[urlId].alertOnStatusCodes = urlSettings[urlId].alertOnStatusCodes.filter((c: number) => c !== code);
			} else {
				urlSettings[urlId].ignoreStatusCodes = urlSettings[urlId].ignoreStatusCodes.filter((c: number) => c !== code);
			}
		}
	}

	// Template variables info
	const variables = [
		{ var: '{{serviceName}}', desc: 'Service name' },
		{ var: '{{urlLabel}}', desc: 'URL label' },
		{ var: '{{timestamp}}', desc: 'Alert timestamp' },
		{ var: '{{statusCode}}', desc: 'HTTP status code' },
		{ var: '{{errorMessage}}', desc: 'Error message' },
		{ var: '{{responseTime}}', desc: 'Response time in ms' },
		{ var: '{{downtimeDuration}}', desc: 'Total downtime' },
	];
</script>

<div class="page-container">
	<div class="header">
		<div class="title-row">
			<button class="back-btn" onclick={() => goto('/alerts')}>← Back to Alerts</button>
			<h1>Configure Alerts: {service.data?.name || 'Loading...'}</h1>
		</div>
		<p class="subtitle">Customize alert behavior and email templates for this service</p>
	</div>

	<div class="tabs">
		<button
			class="tab"
			class:active={activeTab === 'service'}
			onclick={() => activeTab = 'service'}
		>
			🏢 Service-Level Settings
		</button>
		<button
			class="tab"
			class:active={activeTab === 'urls'}
			onclick={() => activeTab = 'urls'}
		>
			🔗 Per-URL Settings ({urls.data?.length || 0} URLs)
		</button>
	</div>

	<div class="content">
		{#if activeTab === 'service'}
			<div class="section">
				<div class="section-header">
					<h2>Service Alert Configuration</h2>
					{#if alertProfiles.data && alertProfiles.data.length > 0}
						<div class="profile-selector">
							<label for="applyProfile">Apply Profile:</label>
							<select
								id="applyProfile"
								onchange={(e) => {
									const profileId = (e.target as HTMLSelectElement).value;
									const profile = alertProfiles.data?.find((p: any) => p._id === profileId);
									if (profile) applyProfile(profile);
								}}
							>
								<option value="">-- Select a profile --</option>
								{#each alertProfiles.data as profile}
									<option value={profile._id}>{profile.name}</option>
								{/each}
							</select>
						</div>
					{/if}
				</div>

				<div class="form-group checkbox-group">
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={useCustomAlerts} />
						<span>Enable custom alerts for this service (override global defaults)</span>
					</label>
				</div>

				{#if useCustomAlerts}
					<div class="custom-section">
						<div class="form-group">
							<label for="priority">Alert Priority</label>
							<select id="priority" bind:value={alertPriority}>
								<option value="low">🔵 Low Priority</option>
								<option value="medium">🟡 Medium Priority</option>
								<option value="high">🟠 High Priority</option>
								<option value="critical">🔴 Critical</option>
							</select>
						</div>

						<div class="form-group">
							<label>Alert Tags</label>
							<div class="tag-input">
								<input
									type="text"
									bind:value={newTag}
									placeholder="Add a tag (e.g., production, api, frontend)"
									onkeydown={(e) => e.key === 'Enter' && addTag()}
								/>
								<button class="add-btn" onclick={addTag}>Add</button>
							</div>
							<div class="tags-list">
								{#each alertTags as tag}
									<span class="tag">
										{tag}
										<button class="tag-remove" onclick={() => removeTag(tag)}>×</button>
									</span>
								{/each}
							</div>
						</div>

						<div class="divider"></div>

						<h3>Custom Down Alert Email</h3>
						<div class="form-group">
							<label for="downSubject">Subject Line</label>
							<input
								id="downSubject"
								type="text"
								bind:value={customDownAlertSubject}
								placeholder="🚨 {{serviceName}} - {{urlLabel}} is down"
							/>
						</div>

						<div class="form-group">
							<label for="downBody">Email Body (HTML supported)</label>
							<textarea
								id="downBody"
								bind:value={customDownAlertBody}
								rows="8"
								placeholder="<h2>Service Down</h2><p>{{serviceName}} ({{urlLabel}}) is currently unavailable...</p>"
							></textarea>
						</div>

						<div class="divider"></div>

						<h3>Custom Recovery Alert Email</h3>
						<div class="form-group">
							<label for="recoverySubject">Subject Line</label>
							<input
								id="recoverySubject"
								type="text"
								bind:value={customRecoveryAlertSubject}
								placeholder="✅ {{serviceName}} - {{urlLabel}} recovered"
							/>
						</div>

						<div class="form-group">
							<label for="recoveryBody">Email Body (HTML supported)</label>
							<textarea
								id="recoveryBody"
								bind:value={customRecoveryAlertBody}
								rows="8"
								placeholder="<h2>Service Recovered</h2><p>{{serviceName}} ({{urlLabel}}) is back online...</p>"
							></textarea>
						</div>

						<div class="variables-info">
							<strong>Available Variables:</strong>
							<div class="variables-grid">
								{#each variables as { var: variable, desc }}
									<div class="variable-item">
										<code>{variable}</code> - {desc}
									</div>
								{/each}
							</div>
						</div>
					</div>
				{:else}
					<div class="info-box">
						<strong>ℹ️ Using Global Defaults</strong>
						<p>This service is currently using your global alert settings. Enable custom alerts above to override.</p>
					</div>
				{/if}

				<div class="form-actions">
					<button class="save-btn" onclick={saveServiceSettings} disabled={saveStatus === 'saving'}>
						{saveStatus === 'saving' ? 'Saving...' : 'Save Service Settings'}
					</button>
				</div>

				{#if saveStatus === 'saved'}
					<div class="status-message success">✓ {saveMessage}</div>
				{:else if saveStatus === 'error'}
					<div class="status-message error">✗ {saveMessage}</div>
				{/if}
			</div>
		{/if}

		{#if activeTab === 'urls'}
			<div class="urls-section">
				<p class="section-description">
					Configure unique alert settings for individual URLs within this service.
					These settings override both global and service-level configurations.
				</p>

				{#if urls.data && urls.data.length > 0}
					<div class="urls-list">
						{#each urls.data as url}
							<div class="url-card">
								<div class="url-header" onclick={() => toggleUrlExpanded(url._id)}>
									<div class="url-info">
										<h3>{url.label}</h3>
										<span class="url-path">{url.url.substring(0, 50)}{url.url.length > 50 ? '...' : ''}</span>
									</div>
									<div class="url-actions">
										{#if urlSettings[url._id]?.useCustomAlerts}
											<span class="custom-badge">Custom</span>
										{/if}
										<button class="expand-btn">
											{expandedUrls.has(url._id) ? '▼' : '▶'}
										</button>
									</div>
								</div>

								{#if expandedUrls.has(url._id) && urlSettings[url._id]}
									<div class="url-content">
										<div class="form-group checkbox-group">
											<label class="checkbox-label">
												<input type="checkbox" bind:checked={urlSettings[url._id].useCustomAlerts} />
												<span>Use custom alerts for this URL</span>
											</label>
										</div>

										{#if urlSettings[url._id].useCustomAlerts}
											<div class="custom-section">
												<h4>Additional Email Recipients</h4>
												<div class="emails-list">
													{#each urlSettings[url._id].additionalEmails as email}
														<span class="tag">
															{email}
															<button class="tag-remove" onclick={() => removeEmail(url._id, email)}>×</button>
														</span>
													{/each}
													<button class="add-btn" onclick={() => addEmail(url._id)}>+ Add Email</button>
												</div>

												<div class="divider"></div>

												<div class="form-group checkbox-group">
													<label class="checkbox-label">
														<input type="checkbox" bind:checked={urlSettings[url._id].alertOnSlowResponse} />
														<span>Alert on slow response times</span>
													</label>
												</div>

												{#if urlSettings[url._id].alertOnSlowResponse}
													<div class="form-group">
														<label for="slowThreshold-{url._id}">Slow Response Threshold (ms)</label>
														<input
															id="slowThreshold-{url._id}"
															type="number"
															bind:value={urlSettings[url._id].slowResponseThreshold}
															min="100"
															step="100"
														/>
													</div>
												{/if}

												<div class="divider"></div>

												<h4>Status Code Filtering</h4>
												<div class="status-codes">
													<div class="status-code-group">
														<label>Alert on these codes:</label>
														<div class="code-list">
															{#each urlSettings[url._id].alertOnStatusCodes as code}
																<span class="code-badge">
																	{code}
																	<button class="code-remove" onclick={() => removeStatusCode(url._id, code, 'alert')}>×</button>
																</span>
															{/each}
															<button class="add-code-btn" onclick={() => addStatusCode(url._id, 'alert')}>+</button>
														</div>
													</div>
													<div class="status-code-group">
														<label>Ignore these codes:</label>
														<div class="code-list">
															{#each urlSettings[url._id].ignoreStatusCodes as code}
																<span class="code-badge ignore">
																	{code}
																	<button class="code-remove" onclick={() => removeStatusCode(url._id, code, 'ignore')}>×</button>
																</span>
															{/each}
															<button class="add-code-btn" onclick={() => addStatusCode(url._id, 'ignore')}>+</button>
														</div>
													</div>
												</div>

												<div class="divider"></div>

												<h4>Custom Email Templates</h4>
												<div class="form-group">
													<label for="url-downSubject-{url._id}">Down Alert Subject</label>
													<input
														id="url-downSubject-{url._id}"
														type="text"
														bind:value={urlSettings[url._id].customDownAlertSubject}
														placeholder="Leave empty to use service/global template"
													/>
												</div>

												<div class="form-group">
													<label for="url-downBody-{url._id}">Down Alert Body</label>
													<textarea
														id="url-downBody-{url._id}"
														bind:value={urlSettings[url._id].customDownAlertBody}
														rows="4"
														placeholder="Leave empty to use service/global template"
													></textarea>
												</div>
											</div>
										{/if}

										<button class="save-url-btn" onclick={() => saveUrlSettings(url._id)}>
											Save URL Settings
										</button>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{:else}
					<div class="empty-state">
						<p>No URLs configured for this service yet.</p>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.page-container {
		min-height: 100vh;
		background: #0a0e12;
		color: #e8eaed;
		padding: 40px 20px;
	}

	.header {
		max-width: 1000px;
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
		font-size: 28px;
		font-weight: 600;
		margin: 0;
	}

	.subtitle {
		color: #a0a4a8;
		font-size: 14px;
		margin: 0;
	}

	.tabs {
		max-width: 1000px;
		margin: 0 auto 32px;
		display: flex;
		gap: 8px;
		border-bottom: 2px solid #3a3f47;
	}

	.tab {
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

	.tab:hover {
		color: #e8eaed;
	}

	.tab.active {
		color: #d35400;
		border-bottom-color: #d35400;
	}

	.content {
		max-width: 1000px;
		margin: 0 auto;
	}

	.section {
		background: #1e2329;
		border: 1px solid #3a3f47;
		border-radius: 12px;
		padding: 32px;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
	}

	.section-header h2 {
		margin: 0;
		font-size: 20px;
	}

	.profile-selector {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.profile-selector label {
		font-size: 14px;
		color: #a0a4a8;
	}

	.profile-selector select {
		background: #2d3339;
		border: 1px solid #3a3f47;
		border-radius: 6px;
		padding: 8px 12px;
		color: #e8eaed;
		font-size: 14px;
	}

	.form-group {
		margin-bottom: 20px;
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
		font-family: 'Monaco', 'Menlo', monospace;
		font-size: 13px;
	}

	.checkbox-group {
		margin-bottom: 16px;
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

	.custom-section {
		background: rgba(211, 84, 0, 0.05);
		border-left: 3px solid #d35400;
		border-radius: 8px;
		padding: 20px;
		margin-top: 16px;
	}

	.custom-section h3 {
		margin: 0 0 16px 0;
		font-size: 18px;
	}

	.custom-section h4 {
		margin: 0 0 12px 0;
		font-size: 16px;
		color: #e8eaed;
	}

	.divider {
		height: 1px;
		background: rgba(211, 84, 0, 0.2);
		margin: 24px 0;
	}

	.tag-input {
		display: flex;
		gap: 8px;
	}

	.tag-input input {
		flex: 1;
	}

	.add-btn {
		background: #d35400;
		border: none;
		color: white;
		padding: 10px 20px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.add-btn:hover {
		background: #c54d00;
	}

	.tags-list {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 12px;
	}

	.tag {
		background: rgba(211, 84, 0, 0.2);
		border: 1px solid #d35400;
		color: #d35400;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 12px;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.tag-remove {
		background: transparent;
		border: none;
		color: #d35400;
		cursor: pointer;
		font-size: 16px;
		line-height: 1;
		padding: 0;
	}

	.variables-info {
		margin-top: 16px;
		padding: 16px;
		background: rgba(211, 84, 0, 0.05);
		border-radius: 8px;
		font-size: 13px;
	}

	.variables-info strong {
		display: block;
		margin-bottom: 12px;
		color: #d35400;
	}

	.variables-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 8px;
	}

	.variable-item {
		color: #a0a4a8;
	}

	.variable-item code {
		background: #2d3339;
		padding: 2px 6px;
		border-radius: 4px;
		color: #d35400;
		font-family: 'Monaco', 'Menlo', monospace;
	}

	.info-box {
		padding: 16px;
		background: rgba(52, 152, 219, 0.1);
		border-left: 3px solid #3498db;
		border-radius: 6px;
		margin-top: 16px;
	}

	.info-box strong {
		color: #3498db;
		display: block;
		margin-bottom: 8px;
	}

	.info-box p {
		color: #a0a4a8;
		margin: 0;
		font-size: 14px;
	}

	.form-actions {
		margin-top: 24px;
		display: flex;
		justify-content: flex-end;
	}

	.save-btn {
		background: linear-gradient(135deg, #d35400 0%, #c54d00 100%);
		border: none;
		color: white;
		padding: 12px 32px;
		border-radius: 8px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
		transition: all 0.2s;
	}

	.save-btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(211, 84, 0, 0.5);
	}

	.save-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.status-message {
		margin-top: 16px;
		padding: 12px 16px;
		border-radius: 8px;
		font-size: 14px;
		text-align: center;
	}

	.status-message.success {
		background: rgba(39, 174, 96, 0.1);
		border: 1px solid #27ae60;
		color: #27ae60;
	}

	.status-message.error {
		background: rgba(192, 57, 43, 0.1);
		border: 1px solid #c0392b;
		color: #c0392b;
	}

	/* URLs Tab */
	.urls-section {
		background: #1e2329;
		border: 1px solid #3a3f47;
		border-radius: 12px;
		padding: 32px;
	}

	.section-description {
		color: #a0a4a8;
		font-size: 14px;
		margin: 0 0 24px 0;
	}

	.urls-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.url-card {
		background: #0a0e12;
		border: 1px solid #3a3f47;
		border-radius: 8px;
		overflow: hidden;
	}

	.url-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px;
		cursor: pointer;
		transition: background 0.2s;
	}

	.url-header:hover {
		background: rgba(211, 84, 0, 0.05);
	}

	.url-info h3 {
		margin: 0 0 4px 0;
		font-size: 16px;
	}

	.url-path {
		color: #a0a4a8;
		font-size: 12px;
		font-family: 'Monaco', 'Menlo', monospace;
	}

	.url-actions {
		display: flex;
		align-items: center;
		gap: 12px;
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

	.expand-btn {
		background: transparent;
		border: none;
		color: #d35400;
		cursor: pointer;
		font-size: 14px;
		padding: 4px;
	}

	.url-content {
		padding: 0 16px 16px;
		border-top: 1px solid #3a3f47;
	}

	.emails-list {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
	}

	.status-codes {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.status-code-group label {
		font-size: 13px;
		color: #a0a4a8;
		margin-bottom: 8px;
	}

	.code-list {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
	}

	.code-badge {
		background: rgba(211, 84, 0, 0.2);
		border: 1px solid #d35400;
		color: #d35400;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 12px;
		font-family: 'Monaco', 'Menlo', monospace;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.code-badge.ignore {
		background: rgba(149, 165, 166, 0.2);
		border-color: #95a5a6;
		color: #95a5a6;
	}

	.code-remove {
		background: transparent;
		border: none;
		color: inherit;
		cursor: pointer;
		font-size: 14px;
		line-height: 1;
		padding: 0;
	}

	.add-code-btn {
		background: transparent;
		border: 1px solid #3a3f47;
		color: #d35400;
		width: 28px;
		height: 28px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 16px;
		line-height: 1;
		padding: 0;
		transition: all 0.2s;
	}

	.add-code-btn:hover {
		border-color: #d35400;
		background: rgba(211, 84, 0, 0.1);
	}

	.save-url-btn {
		background: #d35400;
		border: none;
		color: white;
		padding: 10px 20px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
		margin-top: 16px;
		transition: all 0.2s;
	}

	.save-url-btn:hover {
		background: #c54d00;
	}

	.empty-state {
		text-align: center;
		padding: 40px;
		color: #a0a4a8;
	}

	@media (max-width: 768px) {
		.variables-grid {
			grid-template-columns: 1fr;
		}

		.section-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 12px;
		}
	}
</style>
