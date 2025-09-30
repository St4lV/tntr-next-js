import { NextResponse } from 'next/server';

export async function middleware(req) {
	const url = new URL(req.url);

	//PROXY API
	if (url.pathname.startsWith('/ap1/v1/')) {
		const backendPath = url.pathname.replace('/ap1/v1', '/api/v1');
		const backendUrl = `http://${process.env.BACKEND_ADRESS}:${process.env.BACKEND_PORT}${backendPath}${url.search}`;

		const res = await fetch(backendUrl, {
			method: req.method,
			headers: req.headers,
			body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.clone().arrayBuffer() : undefined,
		});

		return new Response(res.body, {

		});
	}

	//Content Security Policy (CSP)
	if (process.env.NODE_ENV === 'production') {
		const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
		const cspHeader = `
		default-src 'self';
		script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
		style-src 'self' 'nonce-${nonce}' 'unsafe-inline';
		img-src 'self' blob: data:;
		font-src 'self';
		object-src 'none';
		base-uri 'self';
		form-action 'self';
		frame-ancestors 'none';
		connect-src 'self';
		upgrade-insecure-requests;
		`;

		const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, ' ').trim();

		const requestHeaders = new Headers(req.headers);
		requestHeaders.set('x-nonce', nonce);

		const response = NextResponse.next({
			request: {headers: requestHeaders},
		});

		response.headers.set('Content-Security-Policy',contentSecurityPolicyHeaderValue);
		return response;
	}

	return NextResponse.next();
	}

	export const config = {
	matcher: [
		{
			source: '/((?!_next/static|_next/image|favicon.ico).*)',
			missing: [
				{ type: 'header', key: 'next-router-prefetch' },
				{ type: 'header', key: 'purpose', value: 'prefetch' },
			],
		},
	],
};