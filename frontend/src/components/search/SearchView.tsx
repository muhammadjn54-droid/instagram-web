'use client';

import { ExploreView } from '@/components/feed/ExploreView';

/**
 * `/search`: the Explore screen with the search field already active.
 * (Search and Explore share one design, see `ExploreView`.)
 */
export function SearchView() {
  return <ExploreView startInSearch />;
}
