import { useSyncExternalStore } from 'react';
import type { AppState } from './types';
import { getState, subscribe } from './storage';

/**
 * Subscribe a component to the persisted app state.
 * Re-renders whenever setState() runs anywhere in the app.
 */
export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getState, getState);
}
