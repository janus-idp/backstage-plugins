import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware/devtools';
import { createProjectsSlice } from '../slices/projectsSlice';
import { State } from '../types';
import { createUISlice } from '../slices/uiSlice';
import { createWorkflowSlice } from '../slices/workflowSlice';

export const useStore = create<State>()(
  devtools(
    immer((...args) => ({
      ...createUISlice(...args),
      ...createProjectsSlice(...args),
      ...createWorkflowSlice(...args),
    })),
  ),
);
