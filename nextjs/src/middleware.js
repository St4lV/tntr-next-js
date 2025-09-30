import { NextResponse } from 'next/server';

export async function middleware(req) {
    const url = new URL(req.url);
   
    //API PROXY
    if (url.pathname.startsWith('/ap1/v1/')) {
        const backendPath = url.pathname.replace('/ap1/v1', '/api/v1');
        const backendUrl = `http://${process.env.BACKEND_ADRESS}:${process.env.BACKEND_PORT}${backendPath}${url.search}`;
   
        const res = await fetch(backendUrl, {
            method: req.method,
            headers: req.headers,
            body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.clone().arrayBuffer() : undefined,
        });
   
        return new Response(res.body, {
            status: res.status,
            headers: res.headers,
        });
    }
   
    //Content Security Policy (CSP)
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    
    let cspHeader;
    
    if (process.env.NODE_ENV === 'production') {
        cspHeader = `
            default-src 'self';
            script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
            style-src 'self' 'nonce-${nonce}' 'unsafe-inline' 'unsafe-hashes' https://fonts.googleapis.com;
            img-src 'self' blob: data:;
            font-src 'self' https://fonts.gstatic.com;
            object-src 'none';
            base-uri 'self';
            form-action 'self';
            frame-ancestors 'none';
            connect-src 'self';
            upgrade-insecure-requests;
        `;
    } else {
        cspHeader = `
            default-src 'self';
            script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval';
            style-src 'self' 'nonce-${nonce}' 'unsafe-inline' 'unsafe-hashes' https://fonts.googleapis.com;
            img-src 'self' blob: data:;
            font-src 'self' https://fonts.gstatic.com;
            object-src 'none';
            base-uri 'self';
            form-action 'self';
            frame-ancestors 'none';
            connect-src 'self' ws: wss:;
        `;
    }
   
    const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, ' ').trim();
   
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-nonce', nonce);
   
    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
   
    response.headers.set(
        'Content-Security-Policy',
        contentSecurityPolicyHeaderValue
    );
   
    return response;
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