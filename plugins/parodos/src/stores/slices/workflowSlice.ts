import type { StateCreator } from 'zustand';
import {
  type StateMiddleware,
  type WorkflowSlice,
  type State,
  predicates,
} from '../types';
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
  getWorkDefinitionBy(filterBy, value) {
    const workflowDefinition = get().workflowDefinitions.find(
      def => predicates[filterBy](def) === value,
    );

    return workflowDefinition;
  },
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
