import { browser } from '$app/environment';

export const settingsState = $state({
	backgroundType: 'gradient', // 'gradient' | 'solid' | 'picsum' | 'apod'
	solidColor: '#0f172a',
	themeAccentMode: 'auto', // 'auto' | 'custom'
	customThemeAccent: '#6366f1', // indigo-500
	apodCache: { date: '', url: '', color: '' },
	glassOpacity: 5, // 0 to 100 percentage
	glassBlur: 24, // 0 to 100 pixels
	glassTintMode: 'theme', // 'theme' | 'custom'
	customGlassTint: '#ffffff',
	showClock: true,
	clockFormat: '12h' // '12h' | '24h'
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
			if (parsed.glassOpacity !== undefined) settingsState.glassOpacity = parsed.glassOpacity;
			if (parsed.glassBlur !== undefined) settingsState.glassBlur = parsed.glassBlur;
			if (parsed.glassTintMode) settingsState.glassTintMode = parsed.glassTintMode;
			if (parsed.customGlassTint) settingsState.customGlassTint = parsed.customGlassTint;
			if (parsed.showClock !== undefined) settingsState.showClock = parsed.showClock;
			if (parsed.clockFormat) settingsState.clockFormat = parsed.clockFormat;
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
			apodCache: settingsState.apodCache,
			glassOpacity: settingsState.glassOpacity,
			glassBlur: settingsState.glassBlur,
			glassTintMode: settingsState.glassTintMode,
			customGlassTint: settingsState.customGlassTint,
			showClock: settingsState.showClock,
			clockFormat: settingsState.clockFormat
		})
	);
}
