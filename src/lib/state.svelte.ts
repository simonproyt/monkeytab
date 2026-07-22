import { browser } from '$app/environment';

export const settingsState = $state({
	backgroundType: 'gradient', // 'gradient' | 'solid' | 'picsum' | 'apod'
	solidColor: '#0f172a',
	themeAccentMode: 'auto', // 'auto' | 'custom'
	customThemeAccent: '#6366f1', // indigo-500
	apodCache: { date: '', url: '', color: '' }
});

export function initSettings() {
	if (!browser) return;
	const saved = localStorage.getItem('monkeytab_settings');
	if (saved) {
		try {
			const parsed = JSON.parse(saved);
			if (parsed.backgroundType) settingsState.backgroundType = parsed.backgroundType;
			if (parsed.solidColor) settingsState.solidColor = parsed.solidColor;
			if (parsed.themeAccentMode) settingsState.themeAccentMode = parsed.themeAccentMode;
			if (parsed.customThemeAccent) settingsState.customThemeAccent = parsed.customThemeAccent;
			if (parsed.apodCache) settingsState.apodCache = parsed.apodCache;
		} catch (e) {
			console.error('Failed to parse settings', e);
		}
	}
}

export function saveSettings() {
	if (!browser) return;
	localStorage.setItem(
		'monkeytab_settings',
		JSON.stringify({
			backgroundType: settingsState.backgroundType,
			solidColor: settingsState.solidColor,
			themeAccentMode: settingsState.themeAccentMode,
			customThemeAccent: settingsState.customThemeAccent,
			apodCache: settingsState.apodCache
		})
	);
}
