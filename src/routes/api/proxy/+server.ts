import { error } from '@sveltejs/kit';

export async function GET({ url }) {
	const targetUrl = url.searchParams.get('url');

	if (!targetUrl) {
		throw error(400, 'Missing url parameter');
	}

	try {
		const parsedUrl = new URL(targetUrl);
		const allowedDomains = ['picsum.photos', 'apod.nasa.gov', 'wsrv.nl'];

		if (!allowedDomains.includes(parsedUrl.hostname)) {
			throw error(403, 'Domain not allowed');
		}

		const res = await fetch(targetUrl);

		if (!res.ok) {
			throw error(res.status, 'Failed to fetch image');
		}

		// Ensure we set CORS headers allowing the client to draw this image to a canvas
		return new Response(res.body, {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Content-Type': res.headers.get('Content-Type') || 'image/jpeg',
				'Cache-Control': 'public, max-age=3600'
			}
		});
	} catch (e) {
		console.error('Proxy error:', e);
		throw error(500, 'Failed to proxy image');
	}
}
