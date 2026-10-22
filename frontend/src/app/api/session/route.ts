import { NextResponse } from 'next/server';

import { API_ROUTES } from '@/lib/api/endpoints';
import { backendRequest, BackendError } from '@/lib/api/serverApi';
import { clearSession, readSession, writeSession } from '@/lib/auth/session';
import type { AuthResponse, SessionResponse } from '@/types';

/**
 * Session endpoints (Next.js origin).
 *
 * `POST   /api/session`          — sign in, stores the httpOnly cookies
 * `DELETE /api/session`          — sign out, clears the cookies
 * `GET    /api/session`          — returns the current session, if any
 *
 * These routes are the only place where the session cookie is written; the
 * browser never sees the JWT itself.
 */

export async function GET() {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ user: null, expiresAt: null }, { status: 200 });
  }

  const payload: SessionResponse = {
    user: {
      id: session.id,
      userName: session.userName,
      fullName: session.fullName,
      email: session.email,
      avatar: session.avatar,
    },
    expiresAt: session.expiresAt,
  };

  return NextResponse.json(payload);
}

export async function POST(request: Request) {
  let body: { userName?: string; password?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { statusCode: 400, data: null, errors: ['Некорректное тело запроса'] },
      { status: 400 },
    );
  }

  if (!body.userName || !body.password) {
    return NextResponse.json(
      { statusCode: 400, data: null, errors: ['Укажите имя пользователя и пароль'] },
      { status: 400 },
    );
  }

  try {
    const auth = await backendRequest<AuthResponse>(API_ROUTES.account.login, {
      method: 'POST',
      body: { userName: body.userName, password: body.password },
      withAuth: false,
    });

    await writeSession(auth);

    const payload: SessionResponse = {
      user: {
        id: auth.user.id,
        userName: auth.user.userName,
        fullName: auth.user.fullName,
        email: auth.user.email,
        avatar: auth.user.avatar ?? '',
      },
      expiresAt: auth.expiresAt,
    };

    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(
        { statusCode: error.status, data: null, errors: error.errors },
        { status: error.status || 500 },
      );
    }

    return NextResponse.json(
      { statusCode: 500, data: null, errors: ['Не удалось выполнить вход'] },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    await backendRequest<string>(API_ROUTES.account.logout, { method: 'POST' });
  } catch {
    // The local session is cleared even when the backend call fails.
  }

  await clearSession();

  return NextResponse.json({ statusCode: 200, data: null, errors: null });
}
