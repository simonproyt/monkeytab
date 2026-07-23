<script lang="ts">
	import Search from '$lib/components/Search.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import Clock from '$lib/components/Clock.svelte';
	import Weather from '$lib/components/Weather.svelte';
	import { settingsState } from '$lib/state.svelte';

	let isSettingsOpen = $state(false);
</script>

<div class="relative flex h-full w-full flex-1 flex-col items-center justify-center p-8">
	<div class="flex w-full max-w-2xl translate-y-[-10vh] flex-col items-center justify-center">
		{#if settingsState.showClock}
			<div class="animate-in fade-in zoom-in-95 mb-4 duration-1000">
				<Clock />
			</div>
		{/if}

		<div class="relative z-20 animate-in fade-in slide-in-from-bottom-2 delay-100 duration-1000">
			<Weather />
		</div>

		<div class="relative z-10 animate-in fade-in slide-in-from-bottom-4 w-full delay-150 duration-1000">
			<Search />
		</div>
	</div>

	<!-- Settings Button -->
	<button
		class="glass-panel fixed right-8 bottom-8 flex items-center justify-center rounded-full p-3 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
		aria-label="Settings"
		onclick={() => (isSettingsOpen = true)}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="h-6 w-6 transition-transform duration-500 hover:rotate-90"
		>
			<path
				d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
			/>
			<circle cx="12" cy="12" r="3" />
		</svg>
	</button>
</div>

<Settings bind:isOpen={isSettingsOpen} />
