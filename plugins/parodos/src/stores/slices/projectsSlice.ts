import type { StateCreator } from 'zustand';
import type { ProjectsSlice, State, StateMiddleware } from '../types';
import * as urls from '../../urls';
import { unstable_batchedUpdates } from 'react-dom';

export const createProjectsSlice: StateCreator<
  State,
  StateMiddleware,
  [],
  ProjectsSlice
> = (set, get) => ({
  projectsLoading: false,
  projectsError: undefined,
  hasProjects() {
    return get().projects.length > 0;
  },
  projects: [],
  async fetchProjects() {
    set(state => {
      state.workflowLoading = true;
    });

    try {
      const response = await fetch(`${get().baseUrl}${urls.Projects}`);
      const projects = await response.json();

      set(state => {
        unstable_batchedUpdates(() => {
          state.projects = projects;
          state.projectsLoading = false;
        });
      });
    } catch (e) {
      set(state => {
        state.workflowError = e;
      });
    }
  },
  addProject(project) {
    set(state => {
      state.projects.push(project);
    });
  },
});
