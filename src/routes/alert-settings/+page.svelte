<script lang="ts">
	import { useMutation, useQuery, getCurrentUser } from '$lib/convex.svelte';
	import { api } from '../../../convex/_generated/api';
	import { goto } from '$app/navigation';

	let currentUser = $state<any>(null);
	let activeTab = $state<'defaults' | 'templates' | 'behavior' | 'quiethours'>('defaults');

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

	// Load alert settings
	const alertSettings = useQuery(api.alertSettings.get, () =>
		currentUser ? { userId: currentUser._id } : 'skip'
	);

	const upsertSettings = useMutation(api.alertSettings.upsert);
	const resetSettings = useMutation(api.alertSettings.resetToDefaults);

	// Form state
	let defaultMinDowntime = $state(0);
	let defaultConsecutiveFailures = $state(1);
	let defaultAlertCooldown = $state(15);
	let downAlertSubject = $state('');
	let downAlertBody = $state('');
	let recoveryAlertSubject = $state('');
	let recoveryAlertBody = $state('');
	let sendRecoveryAlerts = $state(true);
	let sendDowntimeReports = $state(false);
	let reportFrequency = $state<'daily' | 'weekly' | 'monthly'>('weekly');
	let reportDay = $state(1);
	let enableWebhooks = $state(false);
	let webhookUrl = $state('');
	let quietHoursEnabled = $state(false);
	let quietHoursStart = $state('22:00');
	let quietHoursEnd = $state('08:00');
	let timezone = $state('UTC');

	let saveStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
	let saveMessage = $state('');

	// Load settings into form
	$effect(() => {
		if (alertSettings.data) {
			defaultMinDowntime = alertSettings.data.defaultMinDowntime ?? 0;
			defaultConsecutiveFailures = alertSettings.data.defaultConsecutiveFailures ?? 1;
			defaultAlertCooldown = alertSettings.data.defaultAlertCooldown ?? 15;
			downAlertSubject = alertSettings.data.downAlertSubject ?? '';
			downAlertBody = alertSettings.data.downAlertBody ?? '';
			recoveryAlertSubject = alertSettings.data.recoveryAlertSubject ?? '';
			recoveryAlertBody = alertSettings.data.recoveryAlertBody ?? '';
			sendRecoveryAlerts = alertSettings.data.sendRecoveryAlerts ?? true;
			sendDowntimeReports = alertSettings.data.sendDowntimeReports ?? false;
			reportFrequency = alertSettings.data.reportFrequency ?? 'weekly';
			reportDay = alertSettings.data.reportDay ?? 1;
			enableWebhooks = alertSettings.data.enableWebhooks ?? false;
			webhookUrl = alertSettings.data.webhookUrl ?? '';
			quietHoursEnabled = alertSettings.data.quietHoursEnabled ?? false;
			quietHoursStart = alertSettings.data.quietHoursStart ?? '22:00';
			quietHoursEnd = alertSettings.data.quietHoursEnd ?? '08:00';
			timezone = alertSettings.data.timezone ?? 'UTC';
		}
	});

	async function handleSave() {
		if (!currentUser) return;

		saveStatus = 'saving';
		try {
			await upsertSettings({
				userId: currentUser._id,
				defaultMinDowntime,
				defaultConsecutiveFailures,
				defaultAlertCooldown,
				downAlertSubject,
				downAlertBody,
				recoveryAlertSubject,
				recoveryAlertBody,
				sendRecoveryAlerts,
				sendDowntimeReports,
				reportFrequency,
				reportDay,
				enableWebhooks,
				webhookUrl: webhookUrl || undefined,
				quietHoursEnabled,
				quietHoursStart,
				quietHoursEnd,
				timezone,
			});
			saveStatus = 'saved';
			saveMessage = 'Settings saved successfully!';
			setTimeout(() => {
				saveStatus = 'idle';
			}, 3000);
		} catch (error) {
			saveStatus = 'error';
			saveMessage = 'Failed to save settings: ' + (error instanceof Error ? error.message : String(error));
		}
	}

	async function handleReset() {
		if (!currentUser) return;
		if (!confirm('Are you sure you want to reset all alert settings to defaults?')) return;

		try {
			await resetSettings({ userId: currentUser._id });
			saveStatus = 'saved';
			saveMessage = 'Settings reset to defaults!';
			setTimeout(() => {
				saveStatus = 'idle';
			}, 3000);
		} catch (error) {
			saveStatus = 'error';
			saveMessage = 'Failed to reset settings: ' + (error instanceof Error ? error.message : String(error));
		}
	}

	// Available template variables
	const downVariables = [
		{ var: '{{serviceName}}', desc: 'Name of the service' },
		{ var: '{{urlLabel}}', desc: 'Label of the URL' },
		{ var: '{{timestamp}}', desc: 'Time when service went down' },
		{ var: '{{statusCode}}', desc: 'HTTP status code (if available)' },
		{ var: '{{errorMessage}}', desc: 'Error message (if available)' },
	];

	const recoveryVariables = [
		{ var: '{{serviceName}}', desc: 'Name of the service' },
		{ var: '{{urlLabel}}', desc: 'Label of the URL' },
		{ var: '{{timestamp}}', desc: 'Time when service recovered' },
		{ var: '{{responseTime}}', desc: 'Response time in ms' },
		{ var: '{{downtimeDuration}}', desc: 'Total downtime duration' },
	];

	function insertVariable(variable: string, field: 'downSubject' | 'downBody' | 'recoverySubject' | 'recoveryBody') {
		if (field === 'downSubject') {
			downAlertSubject += variable;
		} else if (field === 'downBody') {
			downAlertBody += variable;
		} else if (field === 'recoverySubject') {
			recoveryAlertSubject += variable;
		} else if (field === 'recoveryBody') {
			recoveryAlertBody += variable;
		}
	}
</script>

<div class="page-container">
	<div class="header">
		<div class="title-row">
			<button class="back-btn" onclick={() => goto('/dashboard')}>← Back to Dashboard</button>
			<h1>Alert Settings</h1>
		</div>
		<p class="subtitle">Customize how and when you receive alerts for your monitored services</p>
	</div>

	<div class="tabs">
		<button
			class="tab"
			class:active={activeTab === 'defaults'}
			onclick={() => activeTab = 'defaults'}
		>
			Default Thresholds
		</button>
		<button
			class="tab"
			class:active={activeTab === 'templates'}
			onclick={() => activeTab = 'templates'}
		>
			Email Templates
		</button>
		<button
			class="tab"
			class:active={activeTab === 'behavior'}
			onclick={() => activeTab = 'behavior'}
		>
			Alert Behavior
		</button>
		<button
			class="tab"
			class:active={activeTab === 'quiethours'}
			onclick={() => activeTab = 'quiethours'}
		>
			Quiet Hours
		</button>
	</div>

	<div class="content">
		{#if activeTab === 'defaults'}
			<div class="section">
				<h2>Default Alert Thresholds</h2>
				<p class="section-description">
					Set default values for new URLs. You can override these per-URL in the service editor.
				</p>

				<div class="form-group">
					<label for="minDowntime">
						Minimum Downtime Before Alert (seconds)
						<span class="help-text">How long must a service be down before sending an alert? (0 = immediate)</span>
					</label>
					<input
						id="minDowntime"
						type="number"
						bind:value={defaultMinDowntime}
						min="0"
						step="10"
					/>
				</div>

				<div class="form-group">
					<label for="consecutiveFailures">
						Consecutive Failures Required
						<span class="help-text">Number of failed checks in a row before alerting (each check is ~10 seconds apart)</span>
					</label>
					<input
						id="consecutiveFailures"
						type="number"
						bind:value={defaultConsecutiveFailures}
						min="1"
						max="20"
					/>
				</div>

				<div class="form-group">
					<label for="alertCooldown">
						Alert Cooldown Period (minutes)
						<span class="help-text">Minimum time between alerts for the same service to avoid spam</span>
					</label>
					<input
						id="alertCooldown"
						type="number"
						bind:value={defaultAlertCooldown}
						min="1"
						max="1440"
					/>
				</div>
			</div>
		{/if}

		{#if activeTab === 'templates'}
			<div class="section">
				<h2>Down Alert Email Template</h2>
				<p class="section-description">Customize the email sent when a service goes down</p>

				<div class="form-group">
					<div class="label-with-buttons">
						<label for="downSubject">Subject Line</label>
						<div class="variable-buttons">
							{#each downVariables.slice(0, 2) as { var: variable }}
								<button
									class="var-btn"
									onclick={() => insertVariable(variable, 'downSubject')}
									title="Insert {variable}"
								>
									{variable}
								</button>
							{/each}
						</div>
					</div>
					<input id="downSubject" type="text" bind:value={downAlertSubject} />
				</div>

				<div class="form-group">
					<div class="label-with-buttons">
						<label for="downBody">Email Body (HTML supported)</label>
						<div class="variable-buttons">
							{#each downVariables as { var: variable }}
								<button
									class="var-btn"
									onclick={() => insertVariable(variable, 'downBody')}
									title="Insert {variable}"
								>
									{variable}
								</button>
							{/each}
						</div>
					</div>
					<textarea id="downBody" bind:value={downAlertBody} rows="12"></textarea>
				</div>

				<div class="variables-info">
					<strong>Available Variables:</strong>
					<ul>
						{#each downVariables as { var: variable, desc }}
							<li><code>{variable}</code> - {desc}</li>
						{/each}
					</ul>
				</div>
			</div>

			<div class="section">
				<h2>Recovery Alert Email Template</h2>
				<p class="section-description">Customize the email sent when a service recovers</p>

				<div class="form-group">
					<div class="label-with-buttons">
						<label for="recoverySubject">Subject Line</label>
						<div class="variable-buttons">
							{#each recoveryVariables.slice(0, 2) as { var: variable }}
								<button
									class="var-btn"
									onclick={() => insertVariable(variable, 'recoverySubject')}
									title="Insert {variable}"
								>
									{variable}
								</button>
							{/each}
						</div>
					</div>
					<input id="recoverySubject" type="text" bind:value={recoveryAlertSubject} />
				</div>

				<div class="form-group">
					<div class="label-with-buttons">
						<label for="recoveryBody">Email Body (HTML supported)</label>
						<div class="variable-buttons">
							{#each recoveryVariables as { var: variable }}
								<button
									class="var-btn"
									onclick={() => insertVariable(variable, 'recoveryBody')}
									title="Insert {variable}"
								>
									{variable}
								</button>
							{/each}
						</div>
					</div>
					<textarea id="recoveryBody" bind:value={recoveryAlertBody} rows="12"></textarea>
				</div>

				<div class="variables-info">
					<strong>Available Variables:</strong>
					<ul>
						{#each recoveryVariables as { var: variable, desc }}
							<li><code>{variable}</code> - {desc}</li>
						{/each}
					</ul>
				</div>
			</div>
		{/if}

		{#if activeTab === 'behavior'}
			<div class="section">
				<h2>Alert Behavior Settings</h2>
				<p class="section-description">Control when and how alerts are sent</p>

				<div class="form-group checkbox-group">
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={sendRecoveryAlerts} />
						<span>Send recovery alerts when services come back online</span>
					</label>
				</div>

				<div class="form-group checkbox-group">
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={sendDowntimeReports} />
						<span>Send periodic downtime summary reports</span>
					</label>
				</div>

				{#if sendDowntimeReports}
					<div class="subsection">
						<div class="form-group">
							<label for="reportFrequency">Report Frequency</label>
							<select id="reportFrequency" bind:value={reportFrequency}>
								<option value="daily">Daily</option>
								<option value="weekly">Weekly</option>
								<option value="monthly">Monthly</option>
							</select>
						</div>

						<div class="form-group">
							<label for="reportDay">
								{reportFrequency === 'weekly' ? 'Day of Week' : reportFrequency === 'monthly' ? 'Day of Month' : 'Send Time'}
							</label>
							{#if reportFrequency === 'weekly'}
								<select id="reportDay" bind:value={reportDay}>
									<option value="0">Sunday</option>
									<option value="1">Monday</option>
									<option value="2">Tuesday</option>
									<option value="3">Wednesday</option>
									<option value="4">Thursday</option>
									<option value="5">Friday</option>
									<option value="6">Saturday</option>
								</select>
							{:else if reportFrequency === 'monthly'}
								<input id="reportDay" type="number" bind:value={reportDay} min="1" max="31" />
							{:else}
								<input id="reportDay" type="time" bind:value={quietHoursStart} />
							{/if}
						</div>
					</div>
				{/if}

				<div class="separator"></div>

				<h3>Webhooks (Coming Soon)</h3>
				<div class="form-group checkbox-group">
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={enableWebhooks} disabled />
						<span>Enable webhook notifications</span>
					</label>
				</div>

				{#if enableWebhooks}
					<div class="form-group">
						<label for="webhookUrl">Webhook URL</label>
						<input
							id="webhookUrl"
							type="url"
							bind:value={webhookUrl}
							placeholder="https://your-webhook-endpoint.com/alert"
							disabled
						/>
					</div>
				{/if}
			</div>
		{/if}

		{#if activeTab === 'quiethours'}
			<div class="section">
				<h2>Quiet Hours</h2>
				<p class="section-description">
					Prevent non-critical alerts during specific times (critical down alerts will still be sent)
				</p>

				<div class="form-group checkbox-group">
					<label class="checkbox-label">
						<input type="checkbox" bind:checked={quietHoursEnabled} />
						<span>Enable quiet hours</span>
					</label>
				</div>

				{#if quietHoursEnabled}
					<div class="subsection">
						<div class="time-range">
							<div class="form-group">
								<label for="quietStart">Start Time</label>
								<input id="quietStart" type="time" bind:value={quietHoursStart} />
							</div>

							<div class="form-group">
								<label for="quietEnd">End Time</label>
								<input id="quietEnd" type="time" bind:value={quietHoursEnd} />
							</div>
						</div>

						<div class="form-group">
							<label for="timezone">Timezone</label>
							<select id="timezone" bind:value={timezone}>
								<option value="UTC">UTC</option>
								<option value="America/New_York">Eastern Time (ET)</option>
								<option value="America/Chicago">Central Time (CT)</option>
								<option value="America/Denver">Mountain Time (MT)</option>
								<option value="America/Los_Angeles">Pacific Time (PT)</option>
								<option value="Europe/London">London (GMT)</option>
								<option value="Europe/Paris">Paris (CET)</option>
								<option value="Asia/Tokyo">Tokyo (JST)</option>
								<option value="Australia/Sydney">Sydney (AEDT)</option>
							</select>
						</div>

						<div class="info-box">
							<strong>Note:</strong> During quiet hours, recovery alerts and periodic reports will be suppressed.
							Critical down alerts will still be sent immediately.
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<div class="footer">
		<div class="button-group">
			<button class="reset-btn" onclick={handleReset}>
				Reset to Defaults
			</button>
			<button class="save-btn" onclick={handleSave} disabled={saveStatus === 'saving'}>
				{saveStatus === 'saving' ? 'Saving...' : 'Save Settings'}
			</button>
		</div>

		{#if saveStatus === 'saved'}
			<div class="status-message success">✓ {saveMessage}</div>
		{:else if saveStatus === 'error'}
			<div class="status-message error">✗ {saveMessage}</div>
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
		font-size: 32px;
		font-weight: 600;
		margin: 0;
	}

	.subtitle {
		color: #a0a4a8;
		font-size: 16px;
		margin: 0;
	}

	.tabs {
		max-width: 1000px;
		margin: 0 auto 32px;
		display: flex;
		gap: 8px;
		border-bottom: 2px solid #3a3f47;
		overflow-x: auto;
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
		white-space: nowrap;
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
		margin-bottom: 24px;
	}

	.section h2 {
		margin: 0 0 8px 0;
		font-size: 24px;
		font-weight: 600;
	}

	.section h3 {
		margin: 24px 0 16px 0;
		font-size: 18px;
		font-weight: 600;
	}

	.section-description {
		color: #a0a4a8;
		margin: 0 0 24px 0;
		font-size: 14px;
	}

	.form-group {
		margin-bottom: 24px;
	}

	.form-group:last-child {
		margin-bottom: 0;
	}

	label {
		display: block;
		font-size: 14px;
		font-weight: 500;
		color: #e8eaed;
		margin-bottom: 8px;
	}

	.help-text {
		display: block;
		font-size: 12px;
		font-weight: 400;
		color: #6c757d;
		margin-top: 4px;
	}

	input[type="text"],
	input[type="number"],
	input[type="url"],
	input[type="time"],
	select,
	textarea {
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
	select:focus,
	textarea:focus {
		outline: none;
		border-color: #d35400;
		box-shadow: 0 0 8px rgba(211, 84, 0, 0.3);
	}

	textarea {
		resize: vertical;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
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

	.subsection {
		background: rgba(211, 84, 0, 0.05);
		border-left: 3px solid #d35400;
		border-radius: 8px;
		padding: 20px;
		margin-top: 16px;
	}

	.time-range {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	.separator {
		height: 1px;
		background: #3a3f47;
		margin: 32px 0;
	}

	.label-with-buttons {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.variable-buttons {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
	}

	.var-btn {
		background: rgba(211, 84, 0, 0.1);
		border: 1px solid #d35400;
		color: #d35400;
		padding: 4px 8px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 11px;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		transition: all 0.2s;
	}

	.var-btn:hover {
		background: rgba(211, 84, 0, 0.2);
		transform: translateY(-1px);
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
		margin-bottom: 8px;
		color: #d35400;
	}

	.variables-info ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.variables-info li {
		padding: 4px 0;
		color: #a0a4a8;
	}

	.variables-info code {
		background: #2d3339;
		padding: 2px 6px;
		border-radius: 4px;
		color: #d35400;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
	}

	.info-box {
		padding: 12px 16px;
		background: rgba(52, 152, 219, 0.1);
		border-left: 3px solid #3498db;
		border-radius: 6px;
		font-size: 13px;
		color: #a0a4a8;
		margin-top: 16px;
	}

	.info-box strong {
		color: #3498db;
	}

	.footer {
		max-width: 1000px;
		margin: 32px auto 0;
		padding: 24px 0;
		border-top: 1px solid #3a3f47;
	}

	.button-group {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
	}

	.reset-btn,
	.save-btn {
		padding: 12px 32px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.reset-btn {
		background: transparent;
		border: 1px solid #c0392b;
		color: #c0392b;
	}

	.reset-btn:hover {
		background: rgba(192, 57, 43, 0.1);
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

	@media (max-width: 768px) {
		.page-container {
			padding: 20px 12px;
		}

		.section {
			padding: 20px;
		}

		.time-range {
			grid-template-columns: 1fr;
		}

		.button-group {
			flex-direction: column;
		}

		.reset-btn,
		.save-btn {
			width: 100%;
		}
	}
</style>
