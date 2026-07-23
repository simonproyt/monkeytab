<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { settingsState } from '$lib/state.svelte';

	let time = $state(new Date());
	let interval: ReturnType<typeof setInterval>;

	let container: HTMLDivElement;

	// Mouse coordinates relative to global screen
	let mouseX = $state(-9999);
	let mouseY = $state(-9999);

	let formattedTime = $derived.by(() => {
		let hours = time.getHours();
		let minutes = time.getMinutes();
		let isPM = hours >= 12;

		if (settingsState.clockFormat === '12h') {
			hours = hours % 12 || 12;
		}

		const hStr = hours.toString().padStart(settingsState.clockFormat === '24h' ? 2 : 1, '0');
		const mStr = minutes.toString().padStart(2, '0');

		return {
			h1: hStr.length > 1 ? hStr[0] : '',
			h2: hStr.length > 1 ? hStr[1] : hStr[0],
			colon: ':',
			m1: mStr[0],
			m2: mStr[1],
			ampm: settingsState.clockFormat === '12h' ? (isPM ? 'PM' : 'AM') : '',
			date: new Intl.DateTimeFormat('en-US', {
				weekday: 'short',
				month: 'short',
				day: 'numeric'
			}).format(time)
		};
	});

	let digitElements: (HTMLDivElement | null)[] = $state([null, null, null, null, null]);

	// Reactive physics values per digit card
	let physics = $state([
		{ rotX: 0, rotY: 0, z: 0, scale: 1, spotX: 50, spotY: 50, hover: false },
		{ rotX: 0, rotY: 0, z: 0, scale: 1, spotX: 50, spotY: 50, hover: false },
		{ rotX: 0, rotY: 0, z: 0, scale: 1, spotX: 50, spotY: 50, hover: false },
		{ rotX: 0, rotY: 0, z: 0, scale: 1, spotX: 50, spotY: 50, hover: false },
		{ rotX: 0, rotY: 0, z: 0, scale: 1, spotX: 50, spotY: 50, hover: false }
	]);

	let animationFrameId: number;

	function updatePhysics() {
		digitElements.forEach((el, i) => {
			if (!el) return;

			const rect = el.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;

			const dist = Math.hypot(mouseX - centerX, mouseY - centerY);
			const maxDist = 200; // Hover interaction radius

			if (dist < maxDist) {
				const normX = (mouseX - rect.left) / rect.width;
				const normY = (mouseY - rect.top) / rect.height;

				const inf = Math.pow(1 - dist / maxDist, 1.5);

				const targetRotY = (normX - 0.5) * 35 * inf;
				const targetRotX = -(normY - 0.5) * 35 * inf;
				const targetZ = 24 * inf;
				const targetScale = 1 + 0.08 * inf;

				physics[i].rotX += (targetRotX - physics[i].rotX) * 0.15;
				physics[i].rotY += (targetRotY - physics[i].rotY) * 0.15;
				physics[i].z += (targetZ - physics[i].z) * 0.15;
				physics[i].scale += (targetScale - physics[i].scale) * 0.15;
				physics[i].spotX = normX * 100;
				physics[i].spotY = normY * 100;
				physics[i].hover = true;
			} else {
				physics[i].rotX += (0 - physics[i].rotX) * 0.1;
				physics[i].rotY += (0 - physics[i].rotY) * 0.1;
				physics[i].z += (0 - physics[i].z) * 0.1;
				physics[i].scale += (1 - physics[i].scale) * 0.1;
				physics[i].hover = false;
			}
		});

		animationFrameId = requestAnimationFrame(updatePhysics);
	}

	function handleGlobalMouseMove(e: MouseEvent) {
		mouseX = e.clientX;
		mouseY = e.clientY;
	}

	function handleGlobalMouseLeave() {
		mouseX = -9999;
		mouseY = -9999;
	}

	onMount(() => {
		interval = setInterval(() => {
			time = new Date();
		}, 1000);

		window.addEventListener('mousemove', handleGlobalMouseMove);
		window.addEventListener('mouseleave', handleGlobalMouseLeave);

		updatePhysics();
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
		if (animationFrameId) cancelAnimationFrame(animationFrameId);
		if (typeof window !== 'undefined') {
			window.removeEventListener('mousemove', handleGlobalMouseMove);
			window.removeEventListener('mouseleave', handleGlobalMouseLeave);
		}
	});

	const digitItems = $derived([
		{ char: formattedTime.h1, isColon: false },
		{ char: formattedTime.h2, isColon: false },
		{ char: ':', isColon: true },
		{ char: formattedTime.m1, isColon: false },
		{ char: formattedTime.m2, isColon: false }
	]);
</script>

<div bind:this={container} class="mb-6 flex flex-col items-center justify-center select-none">
	<!-- Date Header (Positioned above clock) -->
	<div
		class="mb-4 flex items-center gap-2 text-xl font-medium tracking-wide text-white/80 drop-shadow-md"
	>
		<span>{formattedTime.date}</span>
		{#if formattedTime.ampm}
			<span class="text-white/40">•</span>
			<span class="text-base font-semibold text-[var(--theme-accent)] uppercase"
				>{formattedTime.ampm}</span
			>
		{/if}
	</div>

	<!-- 5 Individual 3D Liquid Glass Digit Cards -->
	<div class="perspective-1000 flex items-center justify-center gap-3 py-4">
		{#each digitItems as item, i}
			{#if item.char}
				<div
					bind:this={digitElements[i]}
					class="glass-panel ultra-premium-glass relative flex items-center justify-center rounded-2xl border border-white/20 transition-shadow duration-300 {item.isColon
						? 'h-28 w-14 rounded-xl'
						: 'h-36 w-24'} {physics[i].hover
						? 'shadow-[var(--theme-accent)]/20 shadow-2xl'
						: 'shadow-lg'}"
					style="
						transform: perspective(1000px) rotateX({physics[i].rotX}deg) rotateY({physics[i]
						.rotY}deg) translateZ({physics[i].z}px) scale({physics[i].scale});
						transform-style: preserve-3d;
					"
				>
					<!-- Dynamic Mouse Spotlight Glow per digit -->
					<div
						class="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
						style="
							opacity: {physics[i].hover ? '0.6' : '0'};
							background: radial-gradient(circle 90px at {physics[i].spotX}% {physics[i]
							.spotY}%, color-mix(in srgb, var(--theme-accent) 40%, white), transparent 70%);
						"
					></div>

					<!-- Crisp iOS Liquid Tube Digit Text -->
					<span
						class="glass-digit-text relative z-10 font-bold tracking-tight text-white drop-shadow-md {item.isColon
							? 'animate-pulse text-5xl text-[var(--theme-accent)]'
							: 'text-7xl'}"
					>
						{item.char}
					</span>
				</div>
			{/if}
		{/each}
	</div>
</div>

<style>
	.perspective-1000 {
		perspective: 1000px;
	}

	.glass-digit-text {
		color: rgba(255, 255, 255, 0.95);
		-webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.7);
		text-shadow:
			0 4px 12px rgba(0, 0, 0, 0.5),
			0 1px 3px rgba(255, 255, 255, 0.4);
	}
</style>
