<script lang="ts">
	let searchQuery = $state('');

	// Interactive 3D Tracking State
	let container: HTMLFormElement | null = $state(null);
	let isHovered = $state(false);
	let mouseX = $state(0);
	let mouseY = $state(0);
	let rotateX = $state(0);
	let rotateY = $state(0);
	let shadowX = $state(0);
	let shadowY = $state(24);

	// Derived specular intensity based on the severity of the tilt
	let specularOpacity = $derived(
		isHovered ? Math.min(Math.abs(rotateX) / 10 + Math.abs(rotateY) / 10, 1) : 0
	);

	function handleSearch(event: Event) {
		event.preventDefault();
		if (!searchQuery.trim()) return;

		// Defaulting to Google search as requested
		const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
		window.location.href = searchUrl;
	}

	function handlePointerMove(e: PointerEvent) {
		if (!container) return;
		const rect = container.getBoundingClientRect();

		mouseX = e.clientX - rect.left;
		mouseY = e.clientY - rect.top;

		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		const deltaX = mouseX - centerX;
		const deltaY = mouseY - centerY;

		// Map position to a subtle rotation (max 6deg left/right, 10deg up/down)
		rotateY = (deltaX / centerX) * 6;
		rotateX = -(deltaY / centerY) * 10;

		// Dynamic drop shadow offset (inverts the mouse position)
		shadowX = -(deltaX / centerX) * 20;
		shadowY = 24 - (deltaY / centerY) * 15;
	}

	function handlePointerLeave() {
		isHovered = false;
		rotateX = 0;
		rotateY = 0;
		shadowX = 0;
		shadowY = 8;
	}

	function handlePointerEnter() {
		isHovered = true;
	}
</script>

<form
	bind:this={container}
	onsubmit={handleSearch}
	onpointermove={handlePointerMove}
	onpointerleave={handlePointerLeave}
	onpointerenter={handlePointerEnter}
	class="glass-panel ultra-premium-glass group relative flex w-full max-w-2xl items-center gap-4 rounded-full px-6 py-4 focus-within:ring-2 focus-within:ring-[var(--theme-accent)]"
	style="
		--mouse-x: {mouseX}px; 
		--mouse-y: {mouseY}px; 
		--rotate-x: {rotateX}deg; 
		--rotate-y: {rotateY}deg;
		--shadow-x: {shadowX}px;
		--shadow-y: {shadowY}px;
	"
>
	<!-- SVG Noise Grain Overlay -->
	<svg
		class="pointer-events-none absolute inset-0 h-full w-full opacity-[0.25] mix-blend-overlay"
		style="border-radius: inherit;"
	>
		<filter id="noiseFilter">
			<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
		</filter>
		<rect width="100%" height="100%" filter="url(#noiseFilter)" />
	</svg>



	<!-- Mouse-Tracking Liquid Spotlight -->
	<div
		class="pointer-events-none absolute inset-0 transition-opacity duration-500"
		style="
			border-radius: inherit;
			background: radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), color-mix(in srgb, var(--theme-accent) 25%, rgba(255,255,255,0.25)), transparent 60%);
			opacity: {isHovered ? '1' : '0'};
			mix-blend-mode: overlay;
			z-index: 5;
		"
	></div>

	<!-- Specular Edge Highlight (Glint) -->
	<div
		class="pointer-events-none absolute inset-0 transition-opacity duration-100"
		style="
			border-radius: inherit;
			box-shadow: inset 0 3px 6px 0 rgba(255,255,255,0.5), inset 0 0 10px 0 rgba(255,255,255,0.2);
			opacity: {specularOpacity};
			mix-blend-mode: soft-light;
			z-index: 6;
		"
	></div>

	<svg
		xmlns="http://www.w3.org/2000/svg"
		class="relative z-10 h-6 w-6 text-slate-400 transition-colors"
		style="color: inherit;"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		stroke-width="2"
	>
		<!-- svelte-ignore element_invalid_style_directive -->
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
			class="group-focus-within:!stroke-[var(--theme-accent)]"
		/>
	</svg>

	<!-- svelte-ignore a11y_autofocus -->
	<input
		type="text"
		bind:value={searchQuery}
		placeholder="Search the web..."
		class="relative z-10 w-full border-none bg-transparent text-lg font-medium text-slate-100 placeholder:text-slate-400 focus:ring-0 focus:outline-none"
		autocomplete="off"
		autofocus
	/>
</form>
