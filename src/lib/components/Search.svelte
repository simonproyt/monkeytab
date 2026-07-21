<script lang="ts">
	let searchQuery = $state('');

	function handleSearch(event: Event) {
		event.preventDefault();
		if (!searchQuery.trim()) return;

		// Defaulting to Google search as requested
		const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
		window.location.href = searchUrl;
	}
</script>

<form
	onsubmit={handleSearch}
	class="glass-panel group flex w-full max-w-2xl items-center gap-4 rounded-full px-6 py-4 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-500/50 hover:bg-white/10"
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		class="h-6 w-6 text-slate-400 transition-colors group-focus-within:text-indigo-400"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		stroke-width="2"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
		/>
	</svg>

	<input
		type="text"
		bind:value={searchQuery}
		placeholder="Search the web..."
		class="w-full border-none bg-transparent text-lg font-medium text-slate-100 placeholder:text-slate-400 focus:ring-0 focus:outline-none"
		autocomplete="off"
		autofocus
	/>
</form>
