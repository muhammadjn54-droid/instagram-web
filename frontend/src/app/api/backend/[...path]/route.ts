import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { API_BASE_URL } from '@/lib/api/serverApi';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/lib/auth/cookies';

/**
 * BFF proxy — the only bridge between the browser and the NestJS backend.
 *
 * The browser never talks to NestJS directly: it calls `/api/backend/**` on
 * the Next.js origin, this handler forwards the call and attaches the
 * `Authorization: Bearer` header built from the httpOnly session cookie.
 * The JWT therefore never becomes reachable for JavaScript.
 *
 * Every HTTP verb is proxied 1:1, including `multipart/form-data` uploads
 * (the raw body and the original `Content-Type`, with its boundary, are
 * forwarded untouched).
 */

const METHODS_WITHOUT_BODY = ['GET', 'HEAD'] as const;

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await context.params;

  const search = request.nextUrl.search;
  const target = `${API_BASE_URL}/${path.map(encodeURIComponent).join('/')}${search}`;

  const headers = new Headers();

  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);

  const accept = request.headers.get('accept');
  if (accept) headers.set('accept', accept);

  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  if (token) headers.set('authorization', `Bearer ${token}`);

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (refreshToken) headers.set('x-refresh-token', refreshToken);

  let body: BodyInit | undefined;

  if (!METHODS_WITHOUT_BODY.includes(request.method as (typeof METHODS_WITHOUT_BODY)[number])) {
    const buffer = await request.arrayBuffer();
    if (buffer.byteLength > 0) body = buffer;
  }

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
      redirect: 'manual',
    });

    const responseHeaders = new Headers();

    const upstreamType = upstream.headers.get('content-type');
    if (upstreamType) responseHeaders.set('content-type', upstreamType);

    const disposition = upstream.headers.get('content-disposition');
    if (disposition) responseHeaders.set('content-disposition', disposition);

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      {
        statusCode: 502,
        data: null,
        errors: ['Backend недоступен. Проверьте, что NestJS запущен на порту 3000.'],
      },
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;
