import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export async function GET() {
	const apiKey = env.NASA_API_KEY || 'DEMO_KEY';

	try {
		const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`, {
			cache: 'no-store',
			headers: { 'Cache-Control': 'no-cache' }
		});
		if (!res.ok) {
			return json({ error: 'Failed to fetch APOD' }, { status: res.status });
		}
		const data = (await res.json()) as { hdurl?: string; url?: string };
		return json(
			{ url: data.hdurl || data.url },
			{
				headers: { 'Cache-Control': 'no-store, max-age=0' }
			}
		);
	} catch (error) {
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
