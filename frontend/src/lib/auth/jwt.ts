import 'server-only';

/**
 * Decoding of the NestJS access token.
 *
 * The token is a standard JWT signed by the backend (`JwtStrategy`). Decoding
 * here is only used to render the session banner — it is **not** an
 * authorization decision. Every real permission check happens on the backend,
 * which validates the same token on every request.
 */
export interface JwtPayload {
  sub: number;
  userName: string;
  email: string;
  exp: number;
}

export function decodeJwt(token: string | undefined): JwtPayload | null {
  if (!token) return null;

  const segments = token.split('.');
  if (segments.length < 2) return null;

  try {
    const json = Buffer.from(segments[1], 'base64url').toString('utf8');
    const parsed: unknown = JSON.parse(json);

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      typeof (parsed as JwtPayload).sub !== 'number'
    ) {
      return null;
    }

    return parsed as JwtPayload;
  } catch {
    return null;
  }
}
