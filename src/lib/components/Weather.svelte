<script lang="ts">
	import { settingsState, saveSettings } from '$lib/state.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { 
		Sun, 
		Moon, 
		Cloud, 
		CloudSun, 
		CloudFog, 
		CloudRain, 
		Snowflake, 
		CloudLightning, 
		Thermometer,
		Calendar,
		ChevronDown,
		Droplets
	} from '@lucide/svelte';

	let loading = $state(true);
	let errorMsg = $state('');
	let weatherData = $state<{
		current_weather: {
			temperature: number;
			weathercode: number;
			is_day: number;
		};
		daily: {
			time: string[];
			weathercode: number[];
			temperature_2m_max: number[];
			temperature_2m_min: number[];
			precipitation_probability_max: number[];
		};
		hourly: {
			time: string[];
			temperature_2m: number[];
			weathercode: number[];
			precipitation_probability: number[];
		};
	} | null>(null);

	let cacheKey = 'monkeytab_weather_cache';

	// Helper to interpret WMO weather codes
	// Codes: https://open-meteo.com/en/docs
	function getWeatherDetails(code: number, isDay: number) {
		let Icon;
		let description = '';
		let color = '';
		let iconColor = '';

		if (code === 0) {
			description = 'Clear';
			Icon = isDay ? Sun : Moon;
			iconColor = isDay ? 'text-yellow-400' : 'text-indigo-200';
			color = isDay ? 'rgba(255, 200, 0, 0.2)' : 'rgba(100, 150, 255, 0.2)';
		} else if (code >= 1 && code <= 3) {
			description = 'Cloudy';
			Icon = isDay ? CloudSun : Cloud;
			iconColor = isDay ? 'text-slate-200' : 'text-slate-300';
			color = 'rgba(200, 200, 200, 0.15)';
		} else if (code === 45 || code === 48) {
			description = 'Fog';
			Icon = CloudFog;
			iconColor = 'text-slate-400';
			color = 'rgba(180, 180, 180, 0.15)';
		} else if (
			(code >= 51 && code <= 55) ||
			(code >= 61 && code <= 65) ||
			(code >= 80 && code <= 82)
		) {
			description = 'Rain';
			Icon = CloudRain;
			iconColor = 'text-blue-300';
			color = 'rgba(50, 150, 255, 0.2)';
		} else if ((code >= 71 && code <= 75) || code === 77 || code === 85 || code === 86) {
			description = 'Snow';
			Icon = Snowflake;
			iconColor = 'text-sky-200';
			color = 'rgba(200, 240, 255, 0.25)';
		} else if (code >= 95 && code <= 99) {
			description = 'Storm';
			Icon = CloudLightning;
			iconColor = 'text-purple-300';
			color = 'rgba(150, 50, 255, 0.2)';
		} else {
			description = 'Unknown';
			Icon = Thermometer;
			iconColor = 'text-slate-300';
			color = 'rgba(150, 150, 150, 0.1)';
		}

		return { Icon, description, color, iconColor };
	}

	let weatherInfo = $derived(
		weatherData ? getWeatherDetails(weatherData.current_weather.weathercode, weatherData.current_weather.is_day) : null
	);

	function getCachedWeather() {
		const cached = localStorage.getItem(cacheKey);
		if (cached) {
			try {
				const parsed = JSON.parse(cached);
				// Cache valid for 30 minutes
				if (
					Date.now() - parsed.timestamp < 30 * 60 * 1000 &&
					parsed.unit === settingsState.weatherUnit &&
					parsed.mode === settingsState.weatherLocationMode &&
					parsed.data && parsed.data.daily && parsed.data.hourly &&
					parsed.data.hourly.precipitation_probability &&
					(settingsState.weatherLocationMode === 'auto' ||
						(parsed.lat === settingsState.weatherManualLat &&
							parsed.lon === settingsState.weatherManualLon))
				) {
					return parsed.data;
				}
			} catch (e) {
				console.error(e);
			}
		}
		return null;
	}

	async function fetchWeather(lat: number, lon: number) {
		try {
			const res = await fetch(
				`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&hourly=temperature_2m,weathercode,precipitation_probability&timezone=auto&temperature_unit=${settingsState.weatherUnit}`
			);
			if (!res.ok) throw new Error('Failed to fetch');
			const data = await res.json();
			weatherData = data;
			localStorage.setItem(
				cacheKey,
				JSON.stringify({
					data: weatherData,
					timestamp: Date.now(),
					unit: settingsState.weatherUnit,
					mode: settingsState.weatherLocationMode,
					lat,
					lon
				})
			);
			errorMsg = '';
		} catch (err) {
			console.error(err);
			errorMsg = 'Failed to load weather';
		} finally {
			loading = false;
		}
	}

	function loadWeather() {
		if (typeof window === 'undefined') return;
		loading = true;
		errorMsg = '';

		const cached = getCachedWeather();
		if (cached) {
			weatherData = cached;
			loading = false;
			return;
		}

		if (settingsState.weatherLocationMode === 'manual') {
			if (settingsState.weatherManualLat && settingsState.weatherManualLon) {
				fetchWeather(settingsState.weatherManualLat, settingsState.weatherManualLon);
			} else {
				errorMsg = 'Set location in settings';
				loading = false;
			}
		} else {
			// Auto location
			if ('geolocation' in navigator) {
				navigator.geolocation.getCurrentPosition(
					(position) => {
						fetchWeather(position.coords.latitude, position.coords.longitude);
					},
					(err) => {
						console.error(err);
						errorMsg = 'Location access denied';
						loading = false;
					},
					{ timeout: 10000 }
				);
			} else {
				errorMsg = 'Geolocation not supported';
				loading = false;
			}
		}
	}

	$effect(() => {
		// Reload weather if settings change
		const _unit = settingsState.weatherUnit;
		const _mode = settingsState.weatherLocationMode;
		const _lat = settingsState.weatherManualLat;
		const _lon = settingsState.weatherManualLon;

		// Only run in browser
		if (typeof window !== 'undefined') {
			loadWeather();
		}
	});

	import { slide, fade, fly } from 'svelte/transition';

	// Physics state for hover sheen
	let isHovered = $state(false);
	let mouseX = $state(0);
	let mouseY = $state(0);
	let container: HTMLDivElement | null = $state(null);
	let buttonRef: HTMLButtonElement | null = $state(null);
	
	let isPopoverOpen = $state(false);
	let expandedDay: number | null = $state(null);

	let scrollContainer: HTMLDivElement | null = $state(null);
	let canScrollLeft = $state(false);
	let canScrollRight = $state(true);

	function updateScrollState() {
		if (scrollContainer) {
			canScrollLeft = scrollContainer.scrollLeft > 0;
			canScrollRight = scrollContainer.scrollLeft < scrollContainer.scrollWidth - scrollContainer.clientWidth - 1;
		}
	}

	$effect(() => {
		// When expanded day changes, check scroll state
		if (expandedDay !== null && scrollContainer) {
			// small delay to let DOM render
			setTimeout(updateScrollState, 50);
		}
	});

	function togglePopover() {
		if (weatherData) {
			isPopoverOpen = !isPopoverOpen;
		}
	}

	function closePopover(e: MouseEvent) {
		if (isPopoverOpen && container && !container.contains(e.target as Node)) {
			isPopoverOpen = false;
			expandedDay = null;
		}
	}

	function handlePointerMove(e: PointerEvent) {
		if (!buttonRef) return;
		const rect = buttonRef.getBoundingClientRect();
		mouseX = e.clientX - rect.left;
		mouseY = e.clientY - rect.top;
	}
</script>

<svelte:window onclick={closePopover} />

{#if settingsState.showWeather}
	<div bind:this={container} class="relative mb-6 flex flex-col items-center">
		<button
			type="button"
			bind:this={buttonRef}
			onpointermove={handlePointerMove}
			onpointerenter={() => (isHovered = true)}
			onpointerleave={() => (isHovered = false)}
			onclick={togglePopover}
			class="glass-panel ultra-premium-glass variable-blur-mask group relative flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-shadow duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/20"
		>
			<!-- Sub-surface Noise -->
			<div class="glass-noise rounded-full"></div>

			<!-- Subtle Dynamic Weather Glow -->
			{#if weatherInfo}
				<div
					class="pointer-events-none absolute inset-0 rounded-full transition-colors duration-1000"
					style="background: {weatherInfo.color}; mix-blend-mode: soft-light;"
				></div>
			{/if}

			<!-- Mouse Spotlight Glow -->
			<div
				class="pointer-events-none absolute inset-0 rounded-full transition-opacity duration-300"
				style="
					opacity: {isHovered ? '0.5' : '0'};
					background: radial-gradient(circle 60px at {mouseX}px {mouseY}px, color-mix(in srgb, var(--theme-accent) 40%, white), transparent 70%);
				"
			></div>

			<div class="relative z-10 flex items-center gap-2 text-white/90" style="text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
				{#if loading}
					<span class="animate-pulse text-white/50">Loading...</span>
				{:else if errorMsg}
					<span class="text-xs text-white/50">{errorMsg}</span>
				{:else if weatherData && weatherInfo}
					<div class="flex items-center {weatherInfo.iconColor}">
						<svelte:component this={weatherInfo.Icon} size={18} strokeWidth={2.5} />
					</div>
					<span class="tracking-wide"
						>{Math.round(weatherData.current_weather.temperature)}°{settingsState.weatherUnit === 'celsius'
							? 'C'
							: 'F'}</span
					>
					<span class="ml-1 text-xs text-white/60">{weatherInfo.description}</span>
					<ChevronDown size={14} class="ml-1 text-white/50 transition-transform duration-300 {isPopoverOpen ? 'rotate-180' : ''}" />
				{/if}
			</div>
		</button>

		<!-- Weekly Forecast Popover -->
		{#if isPopoverOpen && weatherData}
			<div 
				transition:fly={{ y: -10, duration: 300 }}
				class="absolute top-full mt-3 w-64 rounded-2xl glass-panel ultra-premium-glass variable-blur-mask p-4 shadow-xl z-50 flex flex-col gap-3 origin-top"
			>
				<div class="glass-noise rounded-2xl"></div>
				<div class="pointer-events-none absolute inset-0 rounded-2xl bg-white/5"></div>
				
				<div class="relative z-10 flex items-center gap-2 mb-1 pb-2 border-b border-white/10 text-white/90">
					<Calendar size={14} class="text-white/60" />
					<span class="text-xs font-medium uppercase tracking-wider text-white/60">7-Day Forecast</span>
				</div>
				
				<div class="relative z-10 flex flex-col gap-2 text-sm text-white/90">
					{#each weatherData.daily.time as timeStr, i}
						{@const date = new Date(timeStr)}
						{@const isToday = i === 0}
						{@const dayName = isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })}
						{@const details = getWeatherDetails(weatherData.daily.weathercode[i], 1)}
						<div class="flex flex-col">
							<button 
								class="flex items-center justify-between w-full hover:bg-white/5 rounded-lg p-1.5 transition-colors focus:outline-none"
								onclick={(e) => { e.stopPropagation(); expandedDay = expandedDay === i ? null : i; }}
							>
								<div class="flex items-center gap-2">
									<ChevronDown size={12} class="text-white/30 transition-transform duration-200 {expandedDay === i ? 'rotate-180' : ''}" />
									<span class="w-10 text-left font-medium {isToday ? 'text-white' : 'text-white/70'}">{dayName}</span>
								</div>
								<div class="flex items-center justify-center {details.iconColor} w-6">
									<svelte:component this={details.Icon} size={16} strokeWidth={2.5} />
								</div>
								<div class="flex items-center gap-2 w-20 justify-end font-medium">
									<span class="text-white/60">{Math.round(weatherData.daily.temperature_2m_min[i])}°</span>
									<div class="h-[2px] w-4 rounded-full bg-white/20"></div>
									<span class="text-white/90">{Math.round(weatherData.daily.temperature_2m_max[i])}°</span>
								</div>
							</button>

							{#if expandedDay === i}
								{@const currentHour = new Date().getHours()}
								{@const startIndex = i * 24}
								<div transition:slide={{ duration: 300 }} class="relative mt-1 group">
									{#if canScrollLeft}
									<!-- Left Arrow -->
									<button 
										transition:fade={{ duration: 150 }}
										class="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md shadow-lg opacity-0 group-hover:opacity-100"
										onclick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											if (scrollContainer) scrollContainer.scrollBy({ left: -150, behavior: 'smooth' });
										}}
									>
										<ChevronDown size={14} class="rotate-90" />
									</button>
									{/if}

									{#if canScrollRight}
									<!-- Right Arrow -->
									<button 
										transition:fade={{ duration: 150 }}
										class="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md shadow-lg opacity-80 hover:opacity-100"
										onclick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											if (scrollContainer) scrollContainer.scrollBy({ left: 150, behavior: 'smooth' });
										}}
									>
										<ChevronDown size={14} class="-rotate-90" />
									</button>
									{/if}

									<div 
										bind:this={scrollContainer}
										onscroll={updateScrollState}
										class="hourly-scroll-container flex gap-3 overflow-x-auto pb-2 pt-2 px-4" 
										style="scrollbar-width: none; -ms-overflow-style: none; mask-image: linear-gradient(to right, transparent, black 15px, black calc(100% - 15px), transparent);"
									>
										{#each Array.from({ length: 24 }) as _, h}
											{#if !isToday || h >= currentHour}
												{@const hourIndex = startIndex + h}
												{@const hourDetails = getWeatherDetails(weatherData.hourly.weathercode[hourIndex], 1)}
												{@const hourDate = new Date(weatherData.hourly.time[hourIndex])}
												<div class="flex flex-col items-center gap-1.5 min-w-[3.5rem]">
													<span class="text-[10px] text-white/50 whitespace-nowrap">{hourDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}</span>
													<div class="flex items-center justify-center {hourDetails.iconColor}">
														<svelte:component this={hourDetails.Icon} size={16} strokeWidth={2.5} />
													</div>
													<span class="text-xs text-white/80 font-medium">{Math.round(weatherData.hourly.temperature_2m[hourIndex])}°</span>
													<div class="flex items-center gap-0.5 text-blue-300/70">
														<Droplets size={10} />
														<span class="text-[10px] font-medium">{weatherData.hourly.precipitation_probability[hourIndex]}%</span>
													</div>
												</div>
											{/if}
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}
</div>
{/if}
