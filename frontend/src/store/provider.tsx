'use client';

import { useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';

import { makeStore } from './index';

/**
 * Redux provider.
 *
 * The store is created once per browser session and reused across renders.
 * On the server a fresh store is created for every request so that no state
 * leaks between users.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => makeStore());

  return <Provider store={store}>{children}</Provider>;
}
