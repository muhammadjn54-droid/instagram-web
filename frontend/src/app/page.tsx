import { redirect } from 'next/navigation';

/**
 * Entry point of the application.
 *
 * The root URL only redirects: the feed is the real home of the product.
 */
export default function HomePage() {
  redirect('/feed');
}
