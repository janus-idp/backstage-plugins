import type { StateCreator } from 'zustand';
import type {
  UISlice,
  StateMiddleware,
  State,
} from '../types';

export const createUISlice: StateCreator<
  State,
  StateMiddleware,
  [],
  UISlice
> = set => ({
  baseUrl: '',
  setBaseUrl(url) {
    set(state => {
      state.baseUrl = url;
    });
  },
});
