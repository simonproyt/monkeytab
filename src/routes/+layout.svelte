<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>New Tab</title>
</svelte:head>

<!-- Animated Background Gradient Base -->
<div
	class="relative min-h-screen w-full overflow-hidden bg-slate-950 font-sans text-slate-100 selection:bg-indigo-500/30"
>
	<!-- Dynamic Ambient Glows -->
	<div class="pointer-events-none absolute inset-0 overflow-hidden">
		<div
			class="absolute -top-[40%] -left-[20%] h-[100%] w-[100%] rounded-full bg-indigo-600/10 mix-blend-screen blur-[120px]"
		></div>
		<div
			class="absolute -right-[20%] -bottom-[40%] h-[100%] w-[100%] rounded-full bg-purple-600/10 mix-blend-screen blur-[120px]"
		></div>
	</div>

	<!-- Main Content Area -->
	<main class="relative z-10 flex min-h-screen flex-col">
		{@render children()}
	</main>
</div>
