import { NextResponse } from 'next/server';

import { API_ROUTES } from '@/lib/api/endpoints';
import { backendRequest, BackendError } from '@/lib/api/serverApi';
import { writeSession } from '@/lib/auth/session';
import type { AuthResponse, RegisterInput, SessionResponse } from '@/types';

/**
 * Registration endpoint (Next.js origin).
 *
 * The backend `POST /account/register` answers with a plain string and no
 * token, therefore the route registers the account and immediately signs the
 * new user in — the browser receives a ready-to-use session cookie.
 */
export async function POST(request: Request) {
  let body: RegisterInput;

  try {
    body = (await request.json()) as RegisterInput;
  } catch {
    return NextResponse.json(
      { statusCode: 400, data: null, errors: ['Некорректное тело запроса'] },
      { status: 400 },
    );
  }

  const missing = (['userName', 'fullName', 'email', 'password', 'confirmPassword'] as const)
    .filter((key) => !body[key])
    .map((key) => `Поле «${key}» обязательно`);

  if (missing.length > 0) {
    return NextResponse.json(
      { statusCode: 400, data: null, errors: missing },
      { status: 400 },
    );
  }

  try {
    await backendRequest<string>(API_ROUTES.account.register, {
      method: 'POST',
      body,
      withAuth: false,
    });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(
        { statusCode: error.status, data: null, errors: error.errors },
        { status: error.status || 500 },
      );
    }

    return NextResponse.json(
      { statusCode: 500, data: null, errors: ['Не удалось создать аккаунт'] },
      { status: 500 },
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

    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    if (error instanceof BackendError) {
      return NextResponse.json(
        {
          statusCode: error.status,
          data: null,
          errors: [
            ...error.errors,
            'Аккаунт создан, но автоматический вход не выполнен. Войдите вручную.',
          ],
        },
        { status: error.status || 500 },
      );
    }

    return NextResponse.json(
      { statusCode: 500, data: null, errors: ['Аккаунт создан, но вход не выполнен'] },
      { status: 500 },
    );
  }
}
