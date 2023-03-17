import type { StateCreator } from 'zustand';
import type {
  ProjectsSlice,
  State,
  StateMiddleware,
} from '../types';
import * as urls from '../../urls';

export const createProjectsSlice: StateCreator<
  State,
  StateMiddleware,
  [],
  ProjectsSlice
> = (set, get) => ({
  projects: [],
  async fetch() {
    const response = await fetch(`${get().baseUrl}${urls.Projects}`);
    const projects = await response.json();

    set(state => {
      state.projects = projects;
    });
  },
});
