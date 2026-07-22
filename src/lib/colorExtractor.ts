export function extractDominantColor(imgEl: HTMLImageElement): string | null {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	if (!ctx) return null;

	// Downscale aggressively for performance
	canvas.width = 50;
	canvas.height = (imgEl.naturalHeight / imgEl.naturalWidth) * 50 || 50;

	try {
		ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);

		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const data = imageData.data;

		let r = 0,
			g = 0,
			b = 0,
			count = 0;

		// Sample every 4th pixel for speed
		for (let i = 0; i < data.length; i += 16) {
			r += data[i];
			g += data[i + 1];
			b += data[i + 2];
			count++;
		}

		if (count === 0) return null;

		r = Math.floor(r / count);
		g = Math.floor(g / count);
		b = Math.floor(b / count);

		// Boost saturation slightly so it doesn't look too muddy
		const max = Math.max(r, g, b);
		if (max > 0) {
			const multiplier = Math.min(255 / max, 1.2);
			r = Math.min(255, Math.floor(r * multiplier));
			g = Math.min(255, Math.floor(g * multiplier));
			b = Math.min(255, Math.floor(b * multiplier));
		}

		const toHex = (n: number) => n.toString(16).padStart(2, '0');
		return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
	} catch (e) {
		console.error('Failed to extract color (likely CORS issue):', e);
		return null;
	}
}
