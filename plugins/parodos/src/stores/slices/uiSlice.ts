import type { StateCreator } from 'zustand';
import type { UISlice, StateMiddleware, State } from '../types';

export const createUISlice: StateCreator<
  State,
  StateMiddleware,
  [],
  UISlice
> = (set, get) => ({
  baseUrl: '',
  getApiUrl(url: string) {
    return `${get().baseUrl}${url}`;
  },
  setBaseUrl(url) {
    set(state => {
      state.baseUrl = url;
    }, false);
  },
  loading() {
    return get().projectsLoading || get().workflowLoading;
  },
  error() {
    return get().workflowError ?? get().projectsError;
  },
});
