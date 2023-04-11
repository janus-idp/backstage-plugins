import type { StateCreator } from 'zustand';
import { unstable_batchedUpdates } from 'react-dom';
import { FetchApi } from '@backstage/core-plugin-api';
import type {
  ParodosError,
  ProjectsSlice,
  State,
  StateMiddleware,
} from '../types';
import { type Project, projectSchema } from '../../models/project';
import * as urls from '../../urls';
import { checkFetchError } from './checkFetchError';

export const createProjectsSlice: StateCreator<
  State,
  StateMiddleware,
  [],
  ProjectsSlice
> = (set, get) => ({
  projectsLoading: true,
  projectsError: undefined,
  hasProjects() {
    return get().projects.length > 0;
  },
  projects: [],
  async fetchProjects(fetch: FetchApi['fetch']) {
    set(state => {
      state.projectsLoading = true;
    });

    try {
      const response = await fetch(`${get().baseUrl}${urls.Projects}`);
      checkFetchError(response);

      const projectsResponse = await response.json();
      const projects = projectsResponse.map(projectSchema.parse) as Project[];

      set(state => {
        unstable_batchedUpdates(() => {
          state.projects = projects;
          state.projectsLoading = false;
        });
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('fetchProjects error: ', e);
      set(state => {
        state.projectsError = e as ParodosError;
      });
    } finally {
      set(state => {
        state.projectsLoading = false;
      });
    }
  },
  addProject(project) {
    set(state => {
      state.projects.push(project);
    });
  },
});
