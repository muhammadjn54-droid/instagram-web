/**
 * Resolution of backend media paths.
 *
 * The backend stores uploaded files on disk and returns a relative path such
 * as `/uploads/1712345678.jpg`. The browser has to prepend the backend
 * origin to render it.
 *
 * `NEXT_PUBLIC_API_URL` is public on purpose: media files are static assets
 * without any authentication. It is **never** used for API calls — those go
 * through the Next.js proxy.
 */
export const MEDIA_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

/** Returns the absolute URL of a backend media path, or `null` when absent. */
export function getMediaUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('data:')) return path;
  return `${MEDIA_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Same as {@link getMediaUrl} but always returns a string.
 * Use with `<img src>`; components that need to know whether an image exists
 * should use {@link getMediaUrl}.
 */
export function getMediaSrc(path?: string | null): string {
  return getMediaUrl(path) ?? '';
}
