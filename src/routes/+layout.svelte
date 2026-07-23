<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { settingsState, initSettings, saveSettings } from '$lib/state.svelte';
	import { extractDominantColor } from '$lib/colorExtractor';
	import { fade } from 'svelte/transition';

	let { children } = $props();

	let apodUrl = $state('');
	let extractedAccent = $state<string | null>(null);
	let fullImageLoaded = $state(false);

	let currentThemeAccent = $derived(
		settingsState.themeAccentMode === 'custom'
			? settingsState.customThemeAccent
			: extractedAccent || settingsState.customThemeAccent
	);

	let currentGlassTint = $derived(
		settingsState.glassTintMode === 'theme' ? currentThemeAccent : settingsState.customGlassTint
	);

	$effect(() => {
		// Reset loaded state when background changes
		const _ = settingsState.backgroundType;
		fullImageLoaded = false;

		if (settingsState.backgroundType === 'apod') {
			const today = new Date().toISOString().split('T')[0];

			// 1. Immediately load cached APOD to prevent flashing
			if (settingsState.apodCache.date === today && settingsState.apodCache.url) {
				apodUrl = settingsState.apodCache.url;
				if (settingsState.apodCache.color) extractedAccent = settingsState.apodCache.color;
			} else {
				extractedAccent = null;
			}

			// 2. Always revalidate in the background (Stale-While-Revalidate)
			fetch('/api/apod?t=' + Date.now(), { cache: 'no-store' })
				.then((res) => res.json() as Promise<{ url?: string }>)
				.then((data) => {
					if (data.url && data.url !== settingsState.apodCache.url) {
						apodUrl = data.url;
						extractedAccent = null; // Reset so image load triggers re-extract
						settingsState.apodCache = { date: today, url: data.url, color: '' };
						saveSettings();
					}
				})
				.catch(console.error);
		} else if (settingsState.backgroundType === 'picsum') {
			// For Picsum, we re-extract color each time since it's random
			extractedAccent = null;
		}
	});

	function handleThumbLoad(event: Event) {
		if (settingsState.themeAccentMode !== 'auto') return;
		if (settingsState.backgroundType === 'apod' && settingsState.apodCache.color) {
			extractedAccent = settingsState.apodCache.color;
			return; // Already cached
		}

		const img = event.target as HTMLImageElement;
		const color = extractDominantColor(img);
		if (color) {
			extractedAccent = color;
			if (settingsState.backgroundType === 'apod') {
				settingsState.apodCache.color = color;
				saveSettings();
			}
		}
	}

	function handleFullLoad(event: Event) {
		fullImageLoaded = true;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>New Tab</title>
</svelte:head>

<!-- Animated Background Gradient Base or Solid Color -->
<div
	class="relative min-h-screen w-full overflow-hidden font-sans text-slate-100 transition-colors duration-1000 selection:bg-indigo-500/30"
	style="background-color: {settingsState.backgroundType === 'solid'
		? settingsState.solidColor
		: '#050505'}; --theme-accent: {currentThemeAccent}; --glass-tint: {currentGlassTint}; --glass-opacity: {settingsState.glassOpacity}%; --glass-blur: {settingsState.glassBlur}px;"
>
	<!-- Dynamic Ambient Glows (used for gradient mode OR as a fallback during loading) -->
	{#if settingsState.backgroundType === 'gradient' || (settingsState.backgroundType !== 'solid' && !fullImageLoaded)}
		<div
			class="pointer-events-none absolute inset-0 overflow-hidden"
			transition:fade={{ duration: 500 }}
		>
			<div
				class="absolute -top-[40%] -left-[20%] h-[100%] w-[100%] rounded-full mix-blend-screen blur-[120px]"
				style="background-color: {currentThemeAccent}22;"
			></div>
			<div
				class="absolute -right-[20%] -bottom-[40%] h-[100%] w-[100%] rounded-full bg-purple-600/10 mix-blend-screen blur-[120px]"
			></div>
		</div>
	{/if}

	<!-- Picsum Background -->
	{#if settingsState.backgroundType === 'picsum'}
		<!-- Low-res blurred placeholder (Direct fetch for speed) -->
		<img
			src="https://picsum.photos/192/108?blur=2"
			alt=""
			crossorigin="anonymous"
			class="absolute inset-0 h-full w-full scale-105 object-cover opacity-60 blur-md"
			onload={handleThumbLoad}
		/>
		<!-- High-res full image (Loaded directly, no proxy overhead) -->
		<img
			src="https://picsum.photos/1920/1080"
			alt="Random background"
			class="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out {fullImageLoaded
				? 'opacity-60'
				: 'opacity-0'}"
			onload={handleFullLoad}
		/>
	{/if}

	<!-- NASA APOD Background -->
	{#if settingsState.backgroundType === 'apod' && apodUrl}
		<!-- Low-res blurred placeholder (Direct fetch via wsrv.nl for speed) -->
		<img
			src={`https://wsrv.nl/?url=${encodeURIComponent(apodUrl)}&w=100&blur=5`}
			alt=""
			crossorigin="anonymous"
			class="absolute inset-0 h-full w-full scale-105 object-cover opacity-60 blur-md"
			onload={handleThumbLoad}
		/>
		<!-- High-res full image (Loaded directly, no proxy overhead) -->
		<img
			src={apodUrl}
			alt="NASA Astronomy Picture of the Day"
			class="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out {fullImageLoaded
				? 'opacity-60'
				: 'opacity-0'}"
			onload={handleFullLoad}
		/>
	{/if}

	<!-- Main Content Area -->
	<main class="relative z-10 flex min-h-screen flex-col">
		{@render children()}
	</main>

	<!-- Global SVG Filters for Liquid Distortion -->
	<svg class="pointer-events-none absolute h-0 w-0" aria-hidden="true">
		<defs>
			<filter id="liquid-distortion">
				<feTurbulence type="fractalNoise" baseFrequency="0.005" numOctaves="3" result="noise" />
				<feDisplacementMap
					in="SourceGraphic"
					in2="noise"
					scale="1.5"
					xChannelSelector="R"
					yChannelSelector="G"
				/>
			</filter>
		</defs>
	</svg>
</div>
