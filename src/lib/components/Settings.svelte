<script lang="ts">
	import { settingsState, saveSettings } from '$lib/state.svelte';
	import { fade, fly } from 'svelte/transition';

	let { isOpen = $bindable(false) } = $props();

	function close() {
		isOpen = false;
	}

	function handleTypeChange(type: string) {
		settingsState.backgroundType = type;
		saveSettings();
	}

	function handleColorChange(event: Event) {
		const target = event.target as HTMLInputElement;
		settingsState.solidColor = target.value;
		saveSettings();
	}

	let geocodeLoading = $state(false);
	let geocodeError = $state('');

	async function searchLocation() {
		if (!settingsState.weatherManualCity) return;
		geocodeLoading = true;
		geocodeError = '';
		try {
			const res = await fetch(
				`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(settingsState.weatherManualCity)}&count=1`
			);
			const data = await res.json();
			if (data.results && data.results.length > 0) {
				const loc = data.results[0];
				settingsState.weatherManualCity = `${loc.name}, ${loc.country}`;
				settingsState.weatherManualLat = loc.latitude;
				settingsState.weatherManualLon = loc.longitude;
				saveSettings();
			} else {
				geocodeError = 'City not found';
			}
		} catch (err) {
			geocodeError = 'Search failed';
		} finally {
			geocodeLoading = false;
		}
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex justify-end">
		<!-- Backdrop -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="absolute inset-0 bg-black/40 backdrop-blur-sm"
			transition:fade={{ duration: 200 }}
			onclick={close}
		></div>

		<!-- Side Panel -->
		<div
			class="glass-panel custom-scrollbar relative h-full max-h-screen w-full max-w-sm overflow-y-auto rounded-none rounded-l-2xl border-y-0 border-r-0 p-6 pb-20 shadow-2xl"
			transition:fly={{ x: 300, duration: 300, opacity: 1 }}
			role="dialog"
			aria-modal="true"
		>
			<button
				class="absolute top-4 right-4 text-slate-400 transition-colors hover:text-white"
				onclick={close}
				aria-label="Close settings"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"
					></line></svg
				>
			</button>

			<h2 class="mb-6 text-xl font-semibold text-white">Settings</h2>

			<div class="space-y-6">
				<!-- Search Engine -->
				<div class="space-y-4 border-b border-white/10 pb-4">
					<div>
						<h3 class="text-sm font-medium text-slate-200">Search Engine</h3>
						<p class="mt-1 text-xs text-slate-400">Choose your default search provider.</p>
					</div>

					<div class="grid grid-cols-2 gap-2">
						<button
							class="rounded-lg border px-3 py-2 text-sm font-medium transition-colors {settingsState.searchEngine ===
							'google'
								? '!border-[var(--theme-accent)] text-white'
								: 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}"
							style={settingsState.searchEngine === 'google'
								? 'background-color: color-mix(in srgb, var(--theme-accent) 20%, transparent);'
								: ''}
							onclick={() => {
								settingsState.searchEngine = 'google';
								saveSettings();
							}}
						>
							Google
						</button>
						<button
							class="rounded-lg border px-3 py-2 text-sm font-medium transition-colors {settingsState.searchEngine ===
							'duckduckgo'
								? '!border-[var(--theme-accent)] text-white'
								: 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}"
							style={settingsState.searchEngine === 'duckduckgo'
								? 'background-color: color-mix(in srgb, var(--theme-accent) 20%, transparent);'
								: ''}
							onclick={() => {
								settingsState.searchEngine = 'duckduckgo';
								saveSettings();
							}}
						>
							DuckDuckGo
						</button>
						<button
							class="rounded-lg border px-3 py-2 text-sm font-medium transition-colors {settingsState.searchEngine ===
							'bing'
								? '!border-[var(--theme-accent)] text-white'
								: 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}"
							style={settingsState.searchEngine === 'bing'
								? 'background-color: color-mix(in srgb, var(--theme-accent) 20%, transparent);'
								: ''}
							onclick={() => {
								settingsState.searchEngine = 'bing';
								saveSettings();
							}}
						>
							Bing
						</button>
						<button
							class="rounded-lg border px-3 py-2 text-sm font-medium transition-colors {settingsState.searchEngine ===
							'brave'
								? '!border-[var(--theme-accent)] text-white'
								: 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}"
							style={settingsState.searchEngine === 'brave'
								? 'background-color: color-mix(in srgb, var(--theme-accent) 20%, transparent);'
								: ''}
							onclick={() => {
								settingsState.searchEngine = 'brave';
								saveSettings();
							}}
						>
							Brave
						</button>
					</div>

					<button
						class="w-full rounded-lg border px-3 py-2 text-sm font-medium transition-colors {settingsState.searchEngine ===
						'custom'
							? '!border-[var(--theme-accent)] text-white'
							: 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}"
						style={settingsState.searchEngine === 'custom'
							? 'background-color: color-mix(in srgb, var(--theme-accent) 20%, transparent);'
							: ''}
						onclick={() => {
							settingsState.searchEngine = 'custom';
							saveSettings();
						}}
					>
						{settingsState.customSearchName || 'Custom Provider'}
					</button>

					{#if settingsState.searchEngine === 'custom'}
						<div class="animate-in fade-in slide-in-from-top-2 space-y-3 pt-1">
							<div class="space-y-1">
								<label for="customSearchName" class="block text-xs text-slate-400"
									>Provider Name (e.g. Kagi, Ecosia)</label
								>
								<input
									id="customSearchName"
									type="text"
									placeholder="Kagi"
									bind:value={settingsState.customSearchName}
									onchange={saveSettings}
									class="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-[var(--theme-accent)] focus:outline-none"
								/>
							</div>

							<div class="space-y-1">
								<label for="customSearchUrl" class="block text-xs text-slate-400"
									>Search URL (use %s for query)</label
								>
								<input
									id="customSearchUrl"
									type="text"
									placeholder="https://kagi.com/search?q=%s"
									bind:value={settingsState.customSearchUrl}
									onchange={saveSettings}
									class="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-[var(--theme-accent)] focus:outline-none"
								/>
							</div>
						</div>
					{/if}
				</div>

				<!-- Widgets -->
				<div class="space-y-4 border-b border-white/10 pb-4">
					<div>
						<h3 class="text-sm font-medium text-slate-200">Widgets</h3>
						<p class="mt-1 text-xs text-slate-400">Enable and configure your dashboard widgets.</p>
					</div>

					<!-- Show Clock Toggle -->
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium text-slate-300">Show Clock</span>
						<button
							class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {settingsState.showClock
								? 'bg-[var(--theme-accent)]'
								: 'bg-white/10'}"
							onclick={() => {
								settingsState.showClock = !settingsState.showClock;
								saveSettings();
							}}
						>
							<span
								class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {settingsState.showClock
									? 'translate-x-6'
									: 'translate-x-1'}"
							></span>
						</button>
					</div>

					<!-- Clock Format (12h vs 24h) -->
					{#if settingsState.showClock}
						<div
							class="animate-in fade-in slide-in-from-top-2 flex items-center justify-between pt-2"
						>
							<span class="text-sm font-medium text-slate-300">Time Format</span>
							<div class="flex space-x-1 rounded-lg border border-white/10 bg-black/20 p-1">
								<button
									class="rounded-md px-3 py-1 text-xs font-medium transition-colors {settingsState.clockFormat ===
									'12h'
										? 'bg-[var(--theme-accent)] text-white shadow'
										: 'text-slate-400 hover:text-white'}"
									onclick={() => {
										settingsState.clockFormat = '12h';
										saveSettings();
									}}
								>
									12h
								</button>
								<button
									class="rounded-md px-3 py-1 text-xs font-medium transition-colors {settingsState.clockFormat ===
									'24h'
										? 'bg-[var(--theme-accent)] text-white shadow'
										: 'text-slate-400 hover:text-white'}"
									onclick={() => {
										settingsState.clockFormat = '24h';
										saveSettings();
									}}
								>
									24h
								</button>
							</div>
						</div>
					{/if}

					<!-- Show Weather Toggle -->
					<div class="flex items-center justify-between pt-2">
						<span class="text-sm font-medium text-slate-300">Show Weather</span>
						<button
							class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors {settingsState.showWeather
								? 'bg-[var(--theme-accent)]'
								: 'bg-white/10'}"
							onclick={() => {
								settingsState.showWeather = !settingsState.showWeather;
								saveSettings();
							}}
						>
							<span
								class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {settingsState.showWeather
									? 'translate-x-6'
									: 'translate-x-1'}"
							></span>
						</button>
					</div>

					{#if settingsState.showWeather}
						<!-- Weather Unit -->
						<div
							class="animate-in fade-in slide-in-from-top-2 flex items-center justify-between pt-2"
						>
							<span class="text-sm font-medium text-slate-300">Unit</span>
							<div class="flex space-x-1 rounded-lg border border-white/10 bg-black/20 p-1">
								<button
									class="rounded-md px-3 py-1 text-xs font-medium transition-colors {settingsState.weatherUnit ===
									'celsius'
										? 'bg-[var(--theme-accent)] text-white shadow'
										: 'text-slate-400 hover:text-white'}"
									onclick={() => {
										settingsState.weatherUnit = 'celsius';
										saveSettings();
									}}
								>
									°C
								</button>
								<button
									class="rounded-md px-3 py-1 text-xs font-medium transition-colors {settingsState.weatherUnit ===
									'fahrenheit'
										? 'bg-[var(--theme-accent)] text-white shadow'
										: 'text-slate-400 hover:text-white'}"
									onclick={() => {
										settingsState.weatherUnit = 'fahrenheit';
										saveSettings();
									}}
								>
									°F
								</button>
							</div>
						</div>

						<!-- Location Mode -->
						<div class="animate-in fade-in slide-in-from-top-2 space-y-2 pt-2">
							<span class="text-sm font-medium text-slate-300">Location Mode</span>
							<div class="grid grid-cols-2 gap-2">
								<button
									class="rounded-lg border px-3 py-2 text-sm font-medium transition-colors {settingsState.weatherLocationMode ===
									'auto'
										? '!border-[var(--theme-accent)] text-white'
										: 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}"
									style={settingsState.weatherLocationMode === 'auto'
										? 'background-color: color-mix(in srgb, var(--theme-accent) 20%, transparent);'
										: ''}
									onclick={() => {
										settingsState.weatherLocationMode = 'auto';
										saveSettings();
									}}
								>
									Auto (GPS)
								</button>
								<button
									class="rounded-lg border px-3 py-2 text-sm font-medium transition-colors {settingsState.weatherLocationMode ===
									'manual'
										? '!border-[var(--theme-accent)] text-white'
										: 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}"
									style={settingsState.weatherLocationMode === 'manual'
										? 'background-color: color-mix(in srgb, var(--theme-accent) 20%, transparent);'
										: ''}
									onclick={() => {
										settingsState.weatherLocationMode = 'manual';
										saveSettings();
									}}
								>
									Manual
								</button>
							</div>
						</div>

						{#if settingsState.weatherLocationMode === 'manual'}
							<div class="animate-in fade-in slide-in-from-top-2 space-y-2 pt-1">
								<label for="weatherCity" class="block text-xs text-slate-400">Search City</label>
								<div class="flex gap-2">
									<input
										id="weatherCity"
										type="text"
										placeholder="London, UK"
										bind:value={settingsState.weatherManualCity}
										onkeydown={(e) => e.key === 'Enter' && searchLocation()}
										class="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-[var(--theme-accent)] focus:outline-none"
									/>
									<button
										class="rounded-lg bg-[var(--theme-accent)] px-3 py-1.5 text-xs font-medium text-white shadow hover:opacity-90 disabled:opacity-50"
										onclick={searchLocation}
										disabled={geocodeLoading}
									>
										{geocodeLoading ? '...' : 'Search'}
									</button>
								</div>
								{#if geocodeError}
									<p class="text-xs text-red-400">{geocodeError}</p>
								{:else if settingsState.weatherManualLat && !geocodeLoading}
									<p class="text-xs text-green-400">
										Location set to {settingsState.weatherManualCity}
									</p>
								{/if}
							</div>
						{/if}
					{/if}
				</div>

				<!-- Background Type -->
				<div class="space-y-3">
					<h3 class="text-sm font-medium text-slate-300">Background Style</h3>
					<div class="grid grid-cols-2 gap-2">
						<button
							class="rounded-lg border px-3 py-2 text-sm font-medium transition-colors {settingsState.backgroundType ===
							'gradient'
								? '!border-[var(--theme-accent)] text-white'
								: 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}"
							style={settingsState.backgroundType === 'gradient'
								? 'background-color: color-mix(in srgb, var(--theme-accent) 20%, transparent);'
								: ''}
							onclick={() => handleTypeChange('gradient')}
						>
							Pulse Gradient
						</button>
						<button
							class="rounded-lg border px-3 py-2 text-sm font-medium transition-colors {settingsState.backgroundType ===
							'solid'
								? '!border-[var(--theme-accent)] text-white'
								: 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}"
							style={settingsState.backgroundType === 'solid'
								? 'background-color: color-mix(in srgb, var(--theme-accent) 20%, transparent);'
								: ''}
							onclick={() => handleTypeChange('solid')}
						>
							Solid Color
						</button>
						<button
							class="rounded-lg border px-3 py-2 text-sm font-medium transition-colors {settingsState.backgroundType ===
							'picsum'
								? '!border-[var(--theme-accent)] text-white'
								: 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}"
							style={settingsState.backgroundType === 'picsum'
								? 'background-color: color-mix(in srgb, var(--theme-accent) 20%, transparent);'
								: ''}
							onclick={() => handleTypeChange('picsum')}
						>
							Picsum
						</button>
						<button
							class="rounded-lg border px-3 py-2 text-sm font-medium transition-colors {settingsState.backgroundType ===
							'apod'
								? '!border-[var(--theme-accent)] text-white'
								: 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}"
							style={settingsState.backgroundType === 'apod'
								? 'background-color: color-mix(in srgb, var(--theme-accent) 20%, transparent);'
								: ''}
							onclick={() => handleTypeChange('apod')}
						>
							NASA APOD
						</button>
					</div>
				</div>

				<!-- Color Picker (Visible only if Solid Color is selected) -->
				{#if settingsState.backgroundType === 'solid'}
					<div class="animate-in fade-in slide-in-from-top-2 space-y-3">
						<h3 class="text-sm font-medium text-slate-300">Choose Color</h3>
						<div class="flex items-center gap-3">
							<input
								type="color"
								value={settingsState.solidColor}
								oninput={handleColorChange}
								class="h-10 w-20 cursor-pointer rounded border-none bg-transparent p-0"
							/>
							<span class="font-mono text-sm text-slate-400">{settingsState.solidColor}</span>
						</div>
					</div>
				{/if}

				<!-- Theme Accent Color -->
				<div class="space-y-4 border-t border-white/10 pt-4">
					<div>
						<h3 class="text-sm font-medium text-slate-200">Theme Accent Color</h3>
						<p class="mt-1 text-xs text-slate-400">
							Extract colors from your background automatically or set a custom accent.
						</p>
					</div>
					<div class="space-y-3">
						<div class="grid grid-cols-2 gap-2">
							<button
								class="rounded-lg border px-3 py-2 text-sm font-medium transition-colors {settingsState.themeAccentMode ===
								'auto'
									? '!border-[var(--theme-accent)] text-white'
									: 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}"
								style={settingsState.themeAccentMode === 'auto'
									? 'background-color: color-mix(in srgb, var(--theme-accent) 20%, transparent);'
									: ''}
								onclick={() => {
									settingsState.themeAccentMode = 'auto';
									saveSettings();
								}}
							>
								Auto Extract
							</button>
							<button
								class="rounded-lg border px-3 py-2 text-sm font-medium transition-colors {settingsState.themeAccentMode ===
								'custom'
									? '!border-[var(--theme-accent)] text-white'
									: 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}"
								style={settingsState.themeAccentMode === 'custom'
									? 'background-color: color-mix(in srgb, var(--theme-accent) 20%, transparent);'
									: ''}
								onclick={() => {
									settingsState.themeAccentMode = 'custom';
									saveSettings();
								}}
							>
								Custom Color
							</button>
						</div>

						{#if settingsState.themeAccentMode === 'custom'}
							<div class="animate-in fade-in slide-in-from-top-2 flex items-center space-x-3">
								<input
									type="color"
									bind:value={settingsState.customThemeAccent}
									oninput={saveSettings}
									class="h-8 w-14 cursor-pointer rounded border border-white/20 bg-transparent p-0.5"
								/>
								<span class="font-mono text-sm text-slate-300"
									>{settingsState.customThemeAccent}</span
								>
							</div>
						{/if}
					</div>
				</div>

				<!-- Glass Appearance -->
				<div class="space-y-4 border-t border-white/10 pt-4">
					<div>
						<h3 class="text-sm font-medium text-slate-200">Glass Appearance</h3>
						<p class="mt-1 text-xs text-slate-400">
							Configure transparency, blur, and tint for glass panels.
						</p>
					</div>

					<!-- Opacity Slider -->
					<div class="space-y-2">
						<div class="flex justify-between text-xs text-slate-300">
							<span>Opacity</span>
							<span>{settingsState.glassOpacity}%</span>
						</div>
						<input
							type="range"
							min="0"
							max="100"
							bind:value={settingsState.glassOpacity}
							oninput={saveSettings}
							class="w-full accent-[var(--theme-accent)]"
						/>
					</div>

					<!-- Blur Slider -->
					<div class="space-y-2">
						<div class="flex justify-between text-xs text-slate-300">
							<span>Blur</span>
							<span>{settingsState.glassBlur}px</span>
						</div>
						<input
							type="range"
							min="0"
							max="100"
							bind:value={settingsState.glassBlur}
							oninput={saveSettings}
							class="w-full accent-[var(--theme-accent)]"
						/>
					</div>

					<!-- Tint Control -->
					<div class="space-y-3 pt-2">
						<div class="grid grid-cols-2 gap-2">
							<button
								class="rounded-lg border px-3 py-2 text-sm font-medium transition-colors {settingsState.glassTintMode ===
								'theme'
									? '!border-[var(--theme-accent)] text-white'
									: 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}"
								style={settingsState.glassTintMode === 'theme'
									? 'background-color: color-mix(in srgb, var(--theme-accent) 20%, transparent);'
									: ''}
								onclick={() => {
									settingsState.glassTintMode = 'theme';
									saveSettings();
								}}
							>
								Match Accent
							</button>
							<button
								class="rounded-lg border px-3 py-2 text-sm font-medium transition-colors {settingsState.glassTintMode ===
								'custom'
									? '!border-[var(--theme-accent)] text-white'
									: 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}"
								style={settingsState.glassTintMode === 'custom'
									? 'background-color: color-mix(in srgb, var(--theme-accent) 20%, transparent);'
									: ''}
								onclick={() => {
									settingsState.glassTintMode = 'custom';
									saveSettings();
								}}
							>
								Custom Tint
							</button>
						</div>

						{#if settingsState.glassTintMode === 'custom'}
							<div class="animate-in fade-in slide-in-from-top-2 flex items-center space-x-3">
								<input
									type="color"
									bind:value={settingsState.customGlassTint}
									oninput={saveSettings}
									class="h-8 w-14 cursor-pointer rounded border border-white/20 bg-transparent p-0.5"
								/>
								<span class="font-mono text-sm text-slate-300">{settingsState.customGlassTint}</span
								>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
