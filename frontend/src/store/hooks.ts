'use client';

import { useDispatch, useSelector, useStore } from 'react-redux';

import type { AppDispatch, AppStore, RootState } from './index';

/** Typed `useDispatch` — accepts thunks and RTK Query actions. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/** Typed `useSelector`. */
export const useAppSelector = useSelector.withTypes<RootState>();

/** Typed `useStore`, useful outside of React components. */
export const useAppStore = useStore.withTypes<AppStore>();
