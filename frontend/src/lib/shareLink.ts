/**
 * Sharing a post in a chat.
 *
 * The backend message has only `text` and an uploaded `file`, so a shared post
 * travels as its link inside the text (`<note>\n<origin>/post/<id>`). The chat
 * recognises the link and renders a preview card instead of a bare URL.
 */
const POST_LINK = /https?:\/\/[^\s/]+\/post\/(\d+)\S*/;

/** Absolute link to a post page. Browser only. */
export function buildPostLink(postId: number): string {
  return `${window.location.origin}/post/${postId}`;
}

/** Message text for a shared post, with an optional note above the link. */
export function buildShareText(postId: number, note?: string): string {
  const trimmed = note?.trim();
  const link = buildPostLink(postId);
  return trimmed ? `${trimmed}\n${link}` : link;
}

export interface SharedPost {
  postId: number | null;
  /** The message text without the link. */
  note: string;
}

/** Splits a message into its shared post (if any) and the remaining text. */
export function parseSharedPost(text?: string | null): SharedPost {
  if (!text) return { postId: null, note: '' };

  const match = text.match(POST_LINK);
  if (!match) return { postId: null, note: text };

  return { postId: Number(match[1]), note: text.replace(match[0], '').trim() };
}
