import type { StateCreator } from 'zustand';
import type { StateMiddleware, WorkflowSlice, State } from '../types';
import * as urls from '../../urls';
import { unstable_batchedUpdates } from 'react-dom';

export const createWorkflowSlice: StateCreator<
  State,
  StateMiddleware,
  [],
  WorkflowSlice
> = (set, get) => ({
  workflowDefinitions: [],
  workflowLoading: false,
  workflowError: undefined,
  async fetchDefinitions() {
    set(state => {
      state.workflowLoading = true;
    });

    try {
      const response = await fetch(
        `${get().baseUrl}${urls.WorkflowDefinitions}`,
      );
      const definitions = await response.json();

      set(state => {
        unstable_batchedUpdates(() => {
          state.workflowDefinitions = definitions;
          state.workflowLoading = false;
        });
      });
    } catch (e) {
      set(state => {
        state.workflowError = e;
      });
    }
  },
});
