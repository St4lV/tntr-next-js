// middleware.js
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const url = new URL(req.url);

  // On intercepte le path frontend
  if (url.pathname.startsWith('/ap1/v1/')) {
    // On remplace /ap1/v1 par /api/v1 pour le backend
    const backendPath = url.pathname.replace('/ap1/v1', '/api/v1');
    const backendUrl = `http://${process.env.BACKEND_ADRESS}:3001${backendPath}${url.search}`;

    const res = await fetch(backendUrl, {
      method: req.method,
      headers: req.headers, // transmet tous les headers
      body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.clone().arrayBuffer() : undefined,
    });

    return new Response(res.body, {
      status: res.status,
      headers: res.headers,
    });
  }

  return NextResponse.next();
}
