import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';

// Whitelisted top-level folders under public/
const ALLOWED_PREFIXES = new Set([
	'banners',
	'haberler',
	'projeler',
	'hafriyat',
	'media', // e.g., media/projeler
]);

export async function GET(request: NextRequest, context: { params: { path: string[] } }) {
	try {
		const parts = context.params.path || [];
		if (parts.length === 0) {
			return new NextResponse('Not Found', { status: 404 });
		}

		const prefix = parts[0];
		if (!ALLOWED_PREFIXES.has(prefix)) {
			return new NextResponse('Forbidden', { status: 403 });
		}

		// Construct a normalized absolute path inside public/
		const publicRoot = path.join(process.cwd(), 'public');
		const requestedPath = path.join(publicRoot, ...parts);
		const normalized = path.normalize(requestedPath);
		if (!normalized.startsWith(publicRoot)) {
			return new NextResponse('Forbidden', { status: 403 });
		}

		if (!existsSync(normalized)) {
			return new NextResponse('File not found', { status: 404 });
		}

		const data = await readFile(normalized);
		const ext = path.extname(normalized).toLowerCase();
		let contentType = 'application/octet-stream';
		switch (ext) {
			case '.jpg':
			case '.jpeg':
				contentType = 'image/jpeg';
				break;
			case '.png':
				contentType = 'image/png';
				break;
			case '.gif':
				contentType = 'image/gif';
				break;
			case '.webp':
				contentType = 'image/webp';
				break;
			case '.avif':
				contentType = 'image/avif';
				break;
			default:
				contentType = 'application/octet-stream';
		}

		return new NextResponse(data, {
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=31536000',
			}
		});
	} catch (error) {
		console.error('[STATIC_API] Error:', error);
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
