import { configureStore } from '@reduxjs/toolkit';

import { igApi } from './api/baseApi';

/**
 * Application store.
 *
 * The store holds **server data only** — it is the cache that RTK Query
 * manages. Ephemeral UI state (open dialog, active tab, draft text) stays in
 * the component that owns it; see `specs/STATE_MANAGEMENT.md`.
 */
export function makeStore() {
  return configureStore({
    reducer: {
      [igApi.reducerPath]: igApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // RTK Query stores `Date` objects only when a query returns them
          // as-is; the backend always sends ISO strings, so the default
          // check is kept as-is.
        },
      }).concat(igApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
