import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { createProjectsSlice } from '../slices/projectsSlice';
import { State } from '../types';
import { createUISlice } from '../slices/uiSlice';
import { createWorkflowSlice } from '../slices/workflowSlice';
import { createNotificationsSlice } from '../slices/notificationsSlice';

export const useStore = create<State>()(
  devtools(
    immer((...args) => ({
      ...createUISlice(...args),
      ...createProjectsSlice(...args),
      ...createWorkflowSlice(...args),
      ...createNotificationsSlice(...args),
    })),
  ),
);
