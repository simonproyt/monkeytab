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
			class="glass-panel relative h-full w-full max-w-sm overflow-y-auto rounded-none rounded-l-2xl border-y-0 border-r-0 p-6 shadow-2xl"
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
				<div class="space-y-3 border-t border-white/10 pt-4">
					<h3 class="text-sm font-medium text-slate-300">Theme Accent Color</h3>
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
				</div>

				<!-- Custom Accent Color Picker -->
				{#if settingsState.themeAccentMode === 'custom'}
					<div class="animate-in fade-in slide-in-from-top-2 space-y-3">
						<div class="flex items-center gap-3">
							<input
								type="color"
								value={settingsState.customThemeAccent}
								oninput={(e) => {
									settingsState.customThemeAccent = (e.target as HTMLInputElement).value;
									saveSettings();
								}}
								class="h-10 w-20 cursor-pointer rounded border-none bg-transparent p-0"
							/>
							<span class="font-mono text-sm text-slate-400">{settingsState.customThemeAccent}</span
							>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
