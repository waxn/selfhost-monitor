<script lang="ts">
	import { goto } from '$app/navigation';
	import { useQuery, useMutation, useAction, getCurrentUser, logout } from '$lib/convex.svelte';
	import { api } from '../../../convex/_generated/api';
	import ServiceCard from '$lib/components/ServiceCard.svelte';
	import ServiceModal from '$lib/components/ServiceModal.svelte';
	import DeviceModal from '$lib/components/DeviceModal.svelte';
	import DemoBanner from '$lib/components/DemoBanner.svelte';
	import UptimeDetailsModal from '$lib/components/UptimeDetailsModal.svelte';
	import type { Id } from '../../../convex/_generated/dataModel';
	import favicon from '$lib/assets/favicon.ico';

	let currentUser = $state<any>(null);
	let showSettings = $state(false);
	let startpageMode = $state(false);
	let searchQuery = $state('');
	let selectedDeviceId = $state<Id<'devices'> | null>(null);

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
	const userPreferences = useQuery(api.users.getPreferences, () => currentUser ? { userId: currentUser._id } : 'skip');
	const removeService = useMutation(api.services.remove);
	const removeDevice = useMutation(api.devices.remove);
	const updatePreferences = useMutation(api.users.updatePreferences);
	const updateServiceLayout = useMutation(api.services.updateLayout);
	const batchUpdateServiceLayout = useMutation(api.services.batchUpdateLayout);
	const testEmailAction = useAction(api.testEmail.testEmailAlert);

	const backgroundColors = [
		{ name: 'Default Dark', value: '#0a0e12' },
		{ name: 'Midnight Blue', value: '#0f1419' },
		{ name: 'Deep Purple', value: '#1a0f1e' },
		{ name: 'Forest Green', value: '#0a1410' },
		{ name: 'Charcoal', value: '#121212' },
		{ name: 'Navy', value: '#0d1117' },
		{ name: 'Dark Teal', value: '#0a1517' },
		{ name: 'Wine', value: '#1a0a0f' },
		{ name: 'Black', value: '#000000' },
	];

	let currentBackground = $derived.by(() => {
		const bg = userPreferences.data?.backgroundColor || '#0a0e12';
		console.log('[currentBackground] Derived value:', bg, 'from data:', userPreferences.data);
		return bg;
	});
	let currentBackgroundImage = $derived.by(() => {
		const img = userPreferences.data?.backgroundImage;
		console.log('[currentBackgroundImage] Derived value:', img);
		return img;
	});
	let currentTileOpacity = $derived.by(() => {
		const opacity = userPreferences.data?.tileOpacity ?? 1;
		console.log('[currentTileOpacity] Derived value:', opacity);
		return opacity;
	});
	let notificationEmail = $derived.by(() => {
		return userPreferences.data?.notificationEmail || '';
	});
	let emailNotificationsEnabled = $derived.by(() => {
		return userPreferences.data?.emailNotificationsEnabled ?? false;
	});

	let testEmailStatus = $state<'idle' | 'sending' | 'success' | 'error'>('idle');
	let testEmailMessage = $state('');

	let showServiceModal = $state(false);
	let showDeviceModal = $state(false);
	let showUptimeDetails = $state(false);
	let editingService = $state<any>(null);
	let editingDevice = $state<any>(null);
	let selectedUrlId = $state<Id<'serviceUrls'> | null>(null);
	let selectedUrlLabel = $state('');
	let isScrolled = $state(false);

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

	async function changeBackground(color: string) {
		console.log('[changeBackground] Called with color:', color);
		console.log('[changeBackground] currentUser:', currentUser);
		if (!currentUser) {
			console.log('[changeBackground] No current user, aborting');
			return;
		}
		console.log('[changeBackground] Calling updatePreferences...');
		console.log('[changeBackground] Current backgroundImage:', currentBackgroundImage);
		try {
			// Always clear the background image when selecting a color (use null to clear)
			await updatePreferences({
				userId: currentUser._id,
				backgroundColor: color,
				backgroundImage: null,
			});
			console.log('[changeBackground] Update successful');
		} catch (error) {
			console.error('[changeBackground] Error:', error);
		}
	}

	async function handleImageUpload(event: Event) {
		console.log('[handleImageUpload] Called');
		const input = event.target as HTMLInputElement;
		console.log('[handleImageUpload] Input:', input);
		console.log('[handleImageUpload] Files:', input.files);
		console.log('[handleImageUpload] currentUser:', currentUser);

		if (!input.files || !input.files[0]) {
			console.error('[handleImageUpload] No files selected');
			return;
		}

		if (!currentUser) {
			console.error('[handleImageUpload] No current user');
			return;
		}

		const file = input.files[0];
		console.log('[handleImageUpload] File:', file.name, 'Size:', file.size, 'Type:', file.type);

		// Validate file type
		if (!file.type.startsWith('image/')) {
			console.error('[handleImageUpload] Not an image file');
			alert('Please select an image file');
			input.value = '';
			return;
		}

		// Read and compress the image
		const reader = new FileReader();

		reader.onerror = (e) => {
			console.error('[handleImageUpload] FileReader error:', e);
			alert('Failed to read image file');
			input.value = '';
		};

		reader.onload = async (e) => {
			const dataUrl = e.target?.result as string;
			console.log('[handleImageUpload] Original DataURL length:', dataUrl.length);

			try {
				// Create image element to resize
				const img = new Image();
				img.onload = async () => {
					console.log('[handleImageUpload] Image loaded, dimensions:', img.width, 'x', img.height);

					// Create canvas to resize image
					const canvas = document.createElement('canvas');
					const ctx = canvas.getContext('2d')!;

					// Calculate new dimensions (max 1920x1080)
					let width = img.width;
					let height = img.height;
					const maxWidth = 1920;
					const maxHeight = 1080;

					if (width > maxWidth || height > maxHeight) {
						const ratio = Math.min(maxWidth / width, maxHeight / height);
						width = Math.floor(width * ratio);
						height = Math.floor(height * ratio);
						console.log('[handleImageUpload] Resizing to:', width, 'x', height);
					}

					canvas.width = width;
					canvas.height = height;
					ctx.drawImage(img, 0, 0, width, height);

					// Try different quality levels until we get under 800KB (to be safe with Convex 1MB limit)
					let quality = 0.8;
					let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

					while (compressedDataUrl.length > 800 * 1024 && quality > 0.1) {
						quality -= 0.1;
						compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
						console.log('[handleImageUpload] Trying quality:', quality, 'Size:', compressedDataUrl.length);
					}

					if (compressedDataUrl.length > 800 * 1024) {
						console.error('[handleImageUpload] Could not compress image enough');
						alert('Image is too complex to compress. Please use a simpler image or smaller resolution.');
						input.value = '';
						return;
					}

					console.log('[handleImageUpload] Compressed DataURL length:', compressedDataUrl.length);
					console.log('[handleImageUpload] Quality used:', quality);

					try {
						console.log('[handleImageUpload] Calling updatePreferences...');
						await updatePreferences({
							userId: currentUser._id,
							backgroundImage: compressedDataUrl,
						});
						console.log('[handleImageUpload] Update successful!');
						input.value = '';
					} catch (error) {
						console.error('[handleImageUpload] Error:', error);
						alert('Failed to upload image: ' + (error as Error).message);
						input.value = '';
					}
				};

				img.onerror = () => {
					console.error('[handleImageUpload] Failed to load image');
					alert('Failed to load image');
					input.value = '';
				};

				img.src = dataUrl;
			} catch (error) {
				console.error('[handleImageUpload] Error:', error);
				alert('Failed to process image');
				input.value = '';
			}
		};

		console.log('[handleImageUpload] Starting to read file...');
		reader.readAsDataURL(file);
	}

	async function clearBackground() {
		console.log('[clearBackground] Called');
		if (!currentUser) {
			console.log('[clearBackground] No current user, aborting');
			return;
		}
		try {
			await updatePreferences({
				userId: currentUser._id,
				backgroundColor: '#0a0e12',
				backgroundImage: null,
			});
			console.log('[clearBackground] Reset successful');
		} catch (error) {
			console.error('[clearBackground] Error:', error);
		}
	}

	async function changeTileOpacity(opacity: number) {
		console.log('[changeTileOpacity] Called with opacity:', opacity);
		if (!currentUser) {
			console.log('[changeTileOpacity] No current user, aborting');
			return;
		}
		try {
			await updatePreferences({
				userId: currentUser._id,
				tileOpacity: opacity,
			});
			console.log('[changeTileOpacity] Update successful');
		} catch (error) {
			console.error('[changeTileOpacity] Error:', error);
		}
	}

	function closeSettings() {
		showSettings = false;
	}

	async function updateNotificationEmail(email: string) {
		if (!currentUser) return;
		try {
			await updatePreferences({
				userId: currentUser._id,
				notificationEmail: email
			});
		} catch (error) {
			console.error('[updateNotificationEmail] Error:', error);
		}
	}

	async function toggleEmailNotifications() {
		if (!currentUser) return;
		try {
			await updatePreferences({
				userId: currentUser._id,
				emailNotificationsEnabled: !emailNotificationsEnabled
			});
		} catch (error) {
			console.error('[toggleEmailNotifications] Error:', error);
		}
	}

	async function sendTestEmail() {
		if (!notificationEmail) {
			testEmailStatus = 'error';
			testEmailMessage = 'Please enter an email address first';
			setTimeout(() => {
				testEmailStatus = 'idle';
				testEmailMessage = '';
			}, 3000);
			return;
		}

		testEmailStatus = 'sending';
		testEmailMessage = '';

		try {
			const result = await testEmailAction({
				recipientEmail: notificationEmail,
				testType: 'down'
			});

			if (result.success) {
				testEmailStatus = 'success';
				testEmailMessage = 'Test email sent! Check your inbox (and spam folder).';
			} else {
				testEmailStatus = 'error';
				testEmailMessage = `Failed: ${result.error || 'Unknown error'}`;
			}
		} catch (error) {
			testEmailStatus = 'error';
			testEmailMessage = `Error: ${error instanceof Error ? error.message : String(error)}`;
			console.error('[sendTestEmail] Error:', error);
		}

		setTimeout(() => {
			testEmailStatus = 'idle';
			testEmailMessage = '';
		}, 5000);
	}

	function closeServiceModal() {
		showServiceModal = false;
		editingService = null;
	}

	function closeDeviceModal() {
		showDeviceModal = false;
		editingDevice = null;
	}

	function handleShowDetails(urlId: Id<'serviceUrls'>, label: string) {
		selectedUrlId = urlId;
		selectedUrlLabel = label;
		showUptimeDetails = true;
	}

	function closeUptimeDetails() {
		showUptimeDetails = false;
		selectedUrlId = null;
		selectedUrlLabel = '';
	}

	function toggleDeviceFilter(deviceId: Id<'devices'>) {
		// Toggle device selection - click again to deselect
		selectedDeviceId = selectedDeviceId === deviceId ? null : deviceId;
	}

	// Drag and drop state
	let draggedServiceId = $state<Id<'services'> | null>(null);
	let dragOverServiceId = $state<Id<'services'> | null>(null);
	let liveReorderedServices = $state<any[]>([]);

	// Compute display order (live preview during drag or normal order)
	let displayServices = $derived.by(() => {
		if (draggedServiceId && liveReorderedServices.length > 0) {
			return liveReorderedServices;
		}
		return filteredServices;
	});

	function handleDragStart(serviceId: Id<'services'>) {
		return (e: DragEvent) => {
			draggedServiceId = serviceId;
			liveReorderedServices = [...filteredServices];
			if (e.dataTransfer) {
				e.dataTransfer.effectAllowed = 'move';
				e.dataTransfer.setDragImage(new Image(), 0, 0); // Hide default ghost image
			}
		};
	}

	function handleDragOver(serviceId: Id<'services'>) {
		return (e: DragEvent) => {
			e.preventDefault();

			if (!draggedServiceId || draggedServiceId === serviceId) {
				return;
			}

			dragOverServiceId = serviceId;

			// Live reorder for visual feedback
			const currentServices = [...liveReorderedServices];
			const draggedIndex = currentServices.findIndex(s => s._id === draggedServiceId);
			const targetIndex = currentServices.findIndex(s => s._id === serviceId);

			if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
				const [draggedItem] = currentServices.splice(draggedIndex, 1);
				currentServices.splice(targetIndex, 0, draggedItem);
				liveReorderedServices = currentServices;
			}
		};
	}

	function handleDrop(serviceId: Id<'services'>) {
		return async (e: DragEvent) => {
			e.preventDefault();

			if (!draggedServiceId || !currentUser) {
				draggedServiceId = null;
				dragOverServiceId = null;
				liveReorderedServices = [];
				return;
			}

			// Use the live reordered array for final save
			const finalOrder = liveReorderedServices.length > 0 ? liveReorderedServices : filteredServices;

			// Update layoutOrder for all services
			const updates = finalOrder.map((service, index) => ({
				id: service._id,
				layoutOrder: index
			}));

			// Batch update
			await batchUpdateServiceLayout({
				userId: currentUser._id,
				updates
			});

			draggedServiceId = null;
			dragOverServiceId = null;
			liveReorderedServices = [];
		};
	}

	function handleDragEnd() {
		draggedServiceId = null;
		dragOverServiceId = null;
		liveReorderedServices = [];
	}

	// Filter services based on selected device and sort by layoutOrder
	let filteredServices = $derived.by(() => {
		if (!services.data) return [];
		let filtered = !selectedDeviceId
			? services.data
			: services.data.filter(service => service.deviceId === selectedDeviceId);

		// Sort by layoutOrder
		return [...filtered].sort((a, b) => {
			const orderA = a.layoutOrder ?? 999999;
			const orderB = b.layoutOrder ?? 999999;
			return orderA - orderB;
		});
	});

	// Check if current user is demo user
	let isDemoUser = $derived(currentUser?.email === 'demo@selfhost-monitor.app');

	// Debug effect to log background changes
	$effect(() => {
		console.log('[Background Debug] currentBackground:', currentBackground);
		console.log('[Background Debug] currentBackgroundImage:', currentBackgroundImage);
		console.log('[Background Debug] userPreferences.data:', userPreferences.data);
	});

	// Handle scroll for header styling
	$effect(() => {
		const handleScroll = () => {
			isScrolled = window.scrollY > 20;
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});
</script>

<div
	class="container"
	class:startpage-mode={startpageMode}
	style:background-color={currentBackgroundImage ? 'transparent' : currentBackground}
	style:background-image={currentBackgroundImage ? `url(${currentBackgroundImage})` : 'none'}
	style:background-size={currentBackgroundImage ? 'cover' : 'auto'}
	style:background-position={currentBackgroundImage ? 'center' : 'initial'}
	style:background-attachment={currentBackgroundImage ? 'fixed' : 'scroll'}
	style:--tile-opacity={currentTileOpacity}
>
	{#if !startpageMode}
		<header
			class:scrolled={isScrolled || !!currentBackgroundImage}
			style:background={currentBackgroundImage ? `rgba(30, 35, 41, ${currentTileOpacity * 0.85})` : ''}
		>
			<div class="header-content">
				<a href="/" class="logo-link">
					<img src={favicon} alt="SelfHost Monitor" class="header-logo" />
					<h1>Service Monitor</h1>
				</a>
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

										<div class="settings-divider"></div>

										<div class="settings-option">
											<div class="settings-label">Background</div>
											<div class="color-grid">
												{#each backgroundColors as color}
													<button
														class="color-option"
														class:selected={currentBackground === color.value && !currentBackgroundImage}
														style="background-color: {color.value}"
														onclick={() => changeBackground(color.value)}
														title={color.name}
													>
														{#if currentBackground === color.value && !currentBackgroundImage}
															<svg width="12" height="12" viewBox="0 0 12 12" fill="white">
																<path d="M10 3L4.5 8.5L2 6" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
															</svg>
														{/if}
													</button>
												{/each}
												<label class="color-option custom-color-picker" title="Custom Color">
													<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
														<circle cx="12" cy="12" r="10" stroke-width="2"/>
														<path d="M12 2v20M2 12h20" stroke-width="2"/>
													</svg>
													<input type="color" onchange={(e) => changeBackground((e.target as HTMLInputElement).value)} style="display: none;" />
												</label>
											</div>

											<label class="upload-btn">
												<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
													<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
													<polyline points="17 8 12 3 7 8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
													<line x1="12" y1="3" x2="12" y2="15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
												</svg>
												Upload Image
												<input type="file" accept="image/*" onchange={handleImageUpload} style="display: none;" />
											</label>

											{#if currentBackgroundImage || currentBackground !== '#0a0e12'}
												<button class="reset-btn" onclick={clearBackground}>
													Reset to Default
												</button>
											{/if}
										</div>

										<div class="settings-divider"></div>

										<div class="settings-option">
											<div class="settings-label">Tile Transparency</div>
											<div class="opacity-slider-container">
												<input
													type="range"
													min="0.1"
													max="1"
													step="0.05"
													value={currentTileOpacity}
													oninput={(e) => changeTileOpacity(parseFloat((e.target as HTMLInputElement).value))}
													class="opacity-slider"
												/>
												<div class="opacity-value">{Math.round(currentTileOpacity * 100)}%</div>
											</div>
										</div>

										<div class="settings-divider"></div>

										<div class="settings-option">
											<div class="settings-label">Email Notifications</div>
											<label class="toggle-label">
												<span>Enable Alerts</span>
												<input
													type="checkbox"
													checked={emailNotificationsEnabled}
													onchange={toggleEmailNotifications}
													class="toggle-checkbox"
												/>
												<span class="toggle-switch"></span>
											</label>
											<div class="email-input-container">
												<input
													type="email"
													placeholder="your@email.com"
													value={notificationEmail}
													oninput={(e) => updateNotificationEmail((e.target as HTMLInputElement).value)}
													class="email-input"
												/>
												<div class="email-hint">Receive down alerts for your monitored services</div>
												<button
													onclick={sendTestEmail}
													disabled={testEmailStatus === 'sending' || !notificationEmail}
													class="test-email-btn"
													class:sending={testEmailStatus === 'sending'}
													class:success={testEmailStatus === 'success'}
													class:error={testEmailStatus === 'error'}
												>
													{#if testEmailStatus === 'sending'}
														Sending...
													{:else if testEmailStatus === 'success'}
														✓ Sent!
													{:else if testEmailStatus === 'error'}
														✗ Failed
													{:else}
														Send Test Email
													{/if}
												</button>
												{#if testEmailMessage}
													<div class="test-email-message" class:success={testEmailStatus === 'success'} class:error={testEmailStatus === 'error'}>
														{testEmailMessage}
													</div>
												{/if}
											</div>
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
				<a href="/" class="startpage-logo-link">
					<img src={favicon} alt="SelfHost Monitor" class="startpage-logo" />
				</a>
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

									<div class="settings-divider"></div>

									<div class="settings-option">
										<div class="settings-label">Background</div>
										<div class="color-grid">
											{#each backgroundColors as color}
												<button
													class="color-option"
													class:selected={currentBackground === color.value && !currentBackgroundImage}
													style="background-color: {color.value}"
													onclick={() => changeBackground(color.value)}
													title={color.name}
												>
													{#if currentBackground === color.value && !currentBackgroundImage}
														<svg width="12" height="12" viewBox="0 0 12 12" fill="white">
															<path d="M10 3L4.5 8.5L2 6" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
														</svg>
													{/if}
												</button>
											{/each}
											<label class="color-option custom-color-picker" title="Custom Color">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
													<circle cx="12" cy="12" r="10" stroke-width="2"/>
													<path d="M12 2v20M2 12h20" stroke-width="2"/>
												</svg>
												<input type="color" onchange={(e) => changeBackground((e.target as HTMLInputElement).value)} style="display: none;" />
											</label>
										</div>

										<label class="upload-btn">
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
												<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
												<polyline points="17 8 12 3 7 8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
												<line x1="12" y1="3" x2="12" y2="15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
											</svg>
											Upload Image
											<input type="file" accept="image/*" onchange={handleImageUpload} style="display: none;" />
										</label>

										{#if currentBackgroundImage || currentBackground !== '#0a0e12'}
											<button class="reset-btn" onclick={clearBackground}>
												Reset to Default
											</button>
										{/if}
									</div>

									<div class="settings-divider"></div>

									<div class="settings-option">
										<div class="settings-label">Tile Transparency</div>
										<div class="opacity-slider-container">
											<input
												type="range"
												min="0.1"
												max="1"
												step="0.05"
												value={currentTileOpacity}
												oninput={(e) => changeTileOpacity(parseFloat((e.target as HTMLInputElement).value))}
												class="opacity-slider"
											/>
											<div class="opacity-value">{Math.round(currentTileOpacity * 100)}%</div>
										</div>
									</div>

									<div class="settings-divider"></div>

									<div class="settings-option">
										<div class="settings-label">Email Notifications</div>
										<label class="toggle-label">
											<span>Enable Alerts</span>
											<input
												type="checkbox"
												checked={emailNotificationsEnabled}
												onchange={toggleEmailNotifications}
												class="toggle-checkbox"
											/>
											<span class="toggle-switch"></span>
										</label>
										<div class="email-input-container">
											<input
												type="email"
												placeholder="your@email.com"
												value={notificationEmail}
												oninput={(e) => updateNotificationEmail((e.target as HTMLInputElement).value)}
												class="email-input"
											/>
											<div class="email-hint">Receive down alerts for your monitored services</div>
											<button
												onclick={sendTestEmail}
												disabled={testEmailStatus === 'sending' || !notificationEmail}
												class="test-email-btn"
												class:sending={testEmailStatus === 'sending'}
												class:success={testEmailStatus === 'success'}
												class:error={testEmailStatus === 'error'}
											>
												{#if testEmailStatus === 'sending'}
													Sending...
												{:else if testEmailStatus === 'success'}
													✓ Sent!
												{:else if testEmailStatus === 'error'}
													✗ Failed
												{:else}
													Send Test Email
												{/if}
											</button>
											{#if testEmailMessage}
												<div class="test-email-message" class:success={testEmailStatus === 'success'} class:error={testEmailStatus === 'error'}>
													{testEmailMessage}
												</div>
											{/if}
										</div>
									</div>

									<div class="settings-divider"></div>

									<div class="settings-option">
										<button onclick={handleLogout} class="logout-btn-small">Logout</button>
									</div>
								</div>
							{/if}
						</div>
					{/if}
				</div>

				<form class="search-box" method="get" action="https://duckduckgo.com/" target="_blank">
					<svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						<circle cx="11" cy="11" r="8" stroke-width="2"/>
						<path d="m21 21-4.35-4.35" stroke-width="2" stroke-linecap="round"/>
					</svg>
					<input
						type="text"
						name="q"
						bind:value={searchQuery}
						placeholder="Search the web"
						class="search-input"
						autocomplete="off"
					/>
					<input type="hidden" name="kae" value="d" />
					<input type="hidden" name="k7" value="1e2329" />
					<input type="hidden" name="kj" value="0a0e12" />
					<input type="hidden" name="k8" value="e8eaed" />
					<input type="hidden" name="k9" value="d35400" />
					<input type="hidden" name="kx" value="d35400" />
				</form>
			</div>

			{#if isDemoUser}
				<DemoBanner />
			{/if}

			<!-- Services in Startpage Mode -->
			{#if services.data === undefined}
				<div class="loading">Loading services...</div>
			{:else if displayServices.length === 0 && selectedDeviceId}
				<div class="empty-state-startpage">
					<div class="empty-icon">📊</div>
					<p>No services on this device</p>
					<button onclick={() => selectedDeviceId = null} class="clear-filter-btn">Show all services</button>
				</div>
			{:else if services.data.length === 0}
				<div class="empty-state-startpage">
					<div class="empty-icon">📊</div>
					<p>No services yet</p>
				</div>
			{:else}
				<div class="startpage-section">
					<h2>
						Services
						{#if selectedDeviceId}
							<button onclick={() => selectedDeviceId = null} class="clear-filter-btn-inline">
								(Clear filter)
							</button>
						{/if}
					</h2>
					<div class="startpage-grid" class:dragging={draggedServiceId !== null}>
						{#each displayServices as service (service._id)}
							<ServiceCard
								{service}
								onEdit={() => openEditService(service)}
								onDelete={() => handleDeleteService(service._id)}
								onShowDetails={handleShowDetails}
								draggable={true}
								onDragStart={handleDragStart(service._id)}
								onDragOver={handleDragOver(service._id)}
								onDrop={handleDrop(service._id)}
								onDragEnd={handleDragEnd}
								isDraggedOver={dragOverServiceId === service._id}
								isBeingDragged={draggedServiceId === service._id}
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
							<div class="device-item" class:selected={selectedDeviceId === device._id} onclick={() => toggleDeviceFilter(device._id)}>
								<div class="device-info">
									<div class="device-name">{device.name}</div>
									{#if device.description}
										<div class="device-description">{device.description}</div>
									{/if}
								</div>
								<div class="device-actions">
									<button onclick={(e) => { e.stopPropagation(); openEditDevice(device); }} class="icon-btn" aria-label="Edit">
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
										onclick={(e) => { e.stopPropagation(); handleDeleteDevice(device._id); }}
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
							<div class="device-item" class:selected={selectedDeviceId === device._id} onclick={() => toggleDeviceFilter(device._id)}>
								<div class="device-info">
									<div class="device-name">{device.name}</div>
									{#if device.description}
										<div class="device-description">{device.description}</div>
									{/if}
								</div>
								<div class="device-actions">
									<button onclick={(e) => { e.stopPropagation(); openEditDevice(device); }} class="icon-btn" aria-label="Edit">
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
										onclick={(e) => { e.stopPropagation(); handleDeleteDevice(device._id); }}
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
				{:else if displayServices.length === 0 && selectedDeviceId}
					<div class="empty-state">
						<div class="empty-icon">📊</div>
						<h3>No services on this device</h3>
						<p>This device doesn't have any services assigned to it</p>
						<button onclick={() => selectedDeviceId = null} class="primary-btn">Show all services</button>
					</div>
				{:else if services.data.length === 0}
					<div class="empty-state">
						<div class="empty-icon">📊</div>
						<h3>No services yet</h3>
						<p>Get started by adding your first service</p>
						<button onclick={openAddService} class="primary-btn">+ Add Service</button>
					</div>
				{:else}
					{#if selectedDeviceId}
						<div class="filter-indicator">
							Showing services for selected device
							<button onclick={() => selectedDeviceId = null} class="clear-filter-btn-inline">Clear filter</button>
						</div>
					{/if}
					<div class="services-grid" class:dragging={draggedServiceId !== null}>
						{#each displayServices as service (service._id)}
							<ServiceCard
								{service}
								onEdit={() => openEditService(service)}
								onDelete={() => handleDeleteService(service._id)}
								onShowDetails={handleShowDetails}
								draggable={true}
								onDragStart={handleDragStart(service._id)}
								onDragOver={handleDragOver(service._id)}
								onDrop={handleDrop(service._id)}
								onDragEnd={handleDragEnd}
								isDraggedOver={dragOverServiceId === service._id}
								isBeingDragged={draggedServiceId === service._id}
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
<UptimeDetailsModal isOpen={showUptimeDetails} onClose={closeUptimeDetails} serviceUrlId={selectedUrlId} urlLabel={selectedUrlLabel} />

<style>
	.container {
		min-height: 100vh;
		padding: 0;
		margin: 0;
		width: 100%;
	}

	header {
		background: linear-gradient(145deg, #1e2329 0%, #0a0e12 100%);
		border-bottom: 1px solid #3a3f47;
		padding: 16px 24px;
		position: sticky;
		top: 0;
		z-index: 100;
		backdrop-filter: blur(10px);
		transition: all 0.3s ease;
	}

	header.scrolled {
		background: rgba(30, 35, 41, 0.85);
		backdrop-filter: blur(20px);
		border-bottom: 1px solid rgba(58, 63, 71, 0.5);
		padding: 12px 24px;
		margin: 12px;
		border-radius: 24px;
		top: 12px;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
	}

	header.scrolled .header-content {
		gap: 12px;
	}

	header.scrolled h1 {
		font-size: 22px;
	}

	header.scrolled .header-logo {
		width: 28px;
		height: 28px;
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

	.logo-link {
		display: flex;
		align-items: center;
		gap: 12px;
		text-decoration: none;
		transition: opacity 0.2s;
	}

	.logo-link:hover {
		opacity: 0.8;
	}

	.header-logo {
		width: 32px;
		height: 32px;
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
		min-width: 240px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
		z-index: 1000;
	}

	.settings-option {
		padding: 8px 0;
	}

	.settings-divider {
		height: 1px;
		background: #3a3f47;
		margin: 8px 0;
	}

	.settings-label {
		font-size: 13px;
		color: #a0a4a8;
		margin-bottom: 10px;
		font-weight: 500;
	}

	.color-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 8px;
		margin-bottom: 10px;
	}

	.color-option {
		width: 32px;
		height: 32px;
		border-radius: 6px;
		border: 2px solid transparent;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
	}

	.color-option:hover {
		border-color: #6c757d;
	}

	.color-option.selected {
		border-color: #d35400;
		box-shadow: 0 0 0 2px rgba(211, 84, 0, 0.2);
	}

	.custom-color-picker {
		background: linear-gradient(135deg,
			#ff0000 0%, #ff7f00 16.66%, #ffff00 33.33%,
			#00ff00 50%, #0000ff 66.66%, #8b00ff 83.33%, #ff0000 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		position: relative;
		border: 2px solid #3a3f47 !important;
	}

	.custom-color-picker svg {
		filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.8));
		color: white;
	}

	.custom-color-picker:hover {
		border-color: #6c757d !important;
	}

	.upload-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 8px 12px;
		background: transparent;
		border: 1px solid #3a3f47;
		border-radius: 6px;
		color: #a0a4a8;
		font-size: 13px;
		cursor: pointer;
		transition: all 0.2s;
		margin-bottom: 8px;
	}

	.upload-btn:hover {
		background: #2d3339;
		border-color: #d35400;
		color: #e8eaed;
	}

	.reset-btn {
		width: 100%;
		padding: 8px;
		background: transparent;
		border: 1px solid #3a3f47;
		border-radius: 6px;
		color: #a0a4a8;
		font-size: 13px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.reset-btn:hover {
		background: rgba(192, 57, 43, 0.15);
		border-color: #c0392b;
		color: #c0392b;
	}

	.opacity-slider-container {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-top: 8px;
	}

	.opacity-slider {
		flex: 1;
		-webkit-appearance: none;
		appearance: none;
		height: 6px;
		background: #3a3f47;
		border-radius: 3px;
		outline: none;
		cursor: pointer;
	}

	.opacity-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 18px;
		height: 18px;
		background: linear-gradient(135deg, #d35400 0%, #c54d00 100%);
		border-radius: 50%;
		cursor: pointer;
		transition: all 0.2s;
	}

	.opacity-slider::-webkit-slider-thumb:hover {
		transform: scale(1.2);
		box-shadow: 0 0 8px rgba(211, 84, 0, 0.6);
	}

	.opacity-slider::-moz-range-thumb {
		width: 18px;
		height: 18px;
		background: linear-gradient(135deg, #d35400 0%, #c54d00 100%);
		border: none;
		border-radius: 50%;
		cursor: pointer;
		transition: all 0.2s;
	}

	.opacity-slider::-moz-range-thumb:hover {
		transform: scale(1.2);
		box-shadow: 0 0 8px rgba(211, 84, 0, 0.6);
	}

	.opacity-value {
		min-width: 45px;
		text-align: right;
		font-size: 13px;
		color: #e8eaed;
		font-weight: 500;
	}

	.email-input-container {
		margin-top: 12px;
	}

	.email-input {
		width: 100%;
		padding: 10px 12px;
		background: #0a0e12;
		border: 1px solid #3a3f47;
		border-radius: 6px;
		color: #e8eaed;
		font-size: 14px;
		transition: all 0.2s;
		box-sizing: border-box;
	}

	.email-input:focus {
		outline: none;
		border-color: #d35400;
		box-shadow: 0 0 0 3px rgba(211, 84, 0, 0.1);
	}

	.email-input::placeholder {
		color: #6c757d;
	}

	.email-hint {
		margin-top: 6px;
		font-size: 12px;
		color: #6c757d;
		line-height: 1.4;
	}

	.test-email-btn {
		margin-top: 12px;
		width: 100%;
		padding: 10px 16px;
		background: linear-gradient(135deg, #d35400 0%, #c54d00 100%);
		border: none;
		border-radius: 6px;
		color: white;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 2px 8px rgba(211, 84, 0, 0.3);
	}

	.test-email-btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(211, 84, 0, 0.4);
	}

	.test-email-btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.test-email-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.test-email-btn.sending {
		background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
	}

	.test-email-btn.success {
		background: linear-gradient(135deg, #229954 0%, #1e8449 100%);
	}

	.test-email-btn.error {
		background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
	}

	.test-email-message {
		margin-top: 8px;
		padding: 8px 12px;
		border-radius: 6px;
		font-size: 13px;
		line-height: 1.4;
	}

	.test-email-message.success {
		background: rgba(34, 153, 84, 0.1);
		border: 1px solid rgba(34, 153, 84, 0.3);
		color: #229954;
	}

	.test-email-message.error {
		background: rgba(192, 57, 43, 0.1);
		border: 1px solid rgba(192, 57, 43, 0.3);
		color: #c0392b;
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
		background: rgba(45, 51, 57, var(--tile-opacity, 1));
		border: 1px solid rgba(58, 63, 71, var(--tile-opacity, 1));
		border-radius: 12px;
		padding: 16px 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: all 0.2s;
		cursor: pointer;
		backdrop-filter: blur(10px);
	}

	.device-item:hover {
		border-color: #d35400;
		background: #343a41;
		box-shadow: 0 0 12px rgba(211, 84, 0, 0.3);
	}

	.device-item.selected {
		border-color: #d35400;
		background: linear-gradient(145deg, #343a41 0%, #2d3339 100%);
		box-shadow: 0 0 20px rgba(211, 84, 0, 0.4);
	}

	.device-item.selected .device-name {
		color: #d35400;
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

	.services-grid :global(.service-card) {
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.services-grid.dragging :global(.service-card:not(:active)) {
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Startpage Mode Styles */

	.startpage-wrapper {
		max-width: 1400px;
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

	.startpage-logo-link {
		position: absolute;
		top: 24px;
		left: 24px;
		transition: opacity 0.2s;
	}

	.startpage-logo-link:hover {
		opacity: 0.8;
	}

	.startpage-logo {
		width: 40px;
		height: 40px;
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
		justify-content: center;
	}

	.search-icon {
		position: absolute;
		left: 24px;
		color: #6c757d;
		pointer-events: none;
		z-index: 1;
	}

	.search-input {
		width: 100%;
		padding: 18px 24px 18px 56px;
		background: rgba(45, 51, 57, 0.8);
		backdrop-filter: blur(10px);
		border: 2px solid #3a3f47;
		border-radius: 32px;
		color: #e8eaed;
		font-size: 16px;
		transition: all 0.3s;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
	}

	.search-input:hover {
		border-color: #4a5059;
		background: rgba(45, 51, 57, 0.9);
	}

	.search-input:focus {
		outline: none;
		border-color: #d35400;
		background: rgba(45, 51, 57, 0.95);
		box-shadow: 0 8px 32px rgba(211, 84, 0, 0.3);
	}

	.search-input::placeholder {
		color: #6c757d;
	}

	.startpage-section {
		margin-bottom: 32px;
	}

	.startpage-section h2 {
		margin: 0 0 16px 0;
		font-size: 20px;
		font-weight: 600;
		color: #e8eaed;
	}

	.startpage-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 24px;
	}

	.startpage-grid :global(.service-card) {
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.startpage-grid.dragging :global(.service-card:not(:active)) {
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.startpage-devices-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 16px;
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

	.filter-indicator {
		background: rgba(211, 84, 0, 0.1);
		border: 1px solid #d35400;
		border-radius: 8px;
		padding: 12px 16px;
		margin-bottom: 16px;
		color: #e8eaed;
		font-size: 14px;
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.clear-filter-btn,
	.clear-filter-btn-inline {
		background: transparent;
		border: 1px solid #3a3f47;
		border-radius: 6px;
		padding: 8px 16px;
		color: #a0a4a8;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.clear-filter-btn-inline {
		padding: 4px 12px;
		font-size: 13px;
		margin-left: 8px;
	}

	.clear-filter-btn:hover,
	.clear-filter-btn-inline:hover {
		background: #2d3339;
		border-color: #d35400;
		color: #d35400;
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

		.startpage-logo-link {
			top: 16px;
			left: 16px;
		}

		.startpage-logo {
			width: 36px;
			height: 36px;
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

		.search-icon {
			left: 20px;
		}

		.startpage-grid {
			grid-template-columns: 1fr;
		}

		.startpage-devices-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
