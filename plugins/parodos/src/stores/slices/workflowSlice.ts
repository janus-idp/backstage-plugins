import type { StateCreator } from 'zustand';
import type {
  StateMiddleware,
  WorkflowSlice,
  State,
} from '../types';
import * as urls from '../../urls';

export const createWorkflowSlice: StateCreator<
  State,
  StateMiddleware,
  [],
  WorkflowSlice
> = (set, get) => ({
  workflowDefinitions: [],
  async fetch() {
    const response = await fetch(`${get().baseUrl}${urls.Projects}`);
    const projects = await response.json();

    set(state => {
      state.projects = projects;
    });
  },
});
