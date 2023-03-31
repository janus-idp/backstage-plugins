import React, { useEffect } from 'react';
import { useStore } from '../stores/workflowStore/workflowStore';
import { useBackendUrl } from './api/useBackendUrl';
import { PluginRouter } from './PluginRouter';
import { Progress } from '@backstage/core-components';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';

export const App = () => {
  const backendUrl = useBackendUrl();
  const setBaseUrl = useStore(state => state.setBaseUrl);
  const fetchProjects = useStore(state => state.fetchProjects);
  const fetchDefinitions = useStore(state => state.fetchDefinitions);
  const loading = useStore(state => state.loading());
  const { fetch } = useApi(fetchApiRef);

  useEffect(() => {
    setBaseUrl(backendUrl);

    async function initialiseStore() {
      await Promise.all([fetchProjects(fetch), fetchDefinitions(fetch)]);
    }

    initialiseStore();
  }, [backendUrl, fetch, fetchDefinitions, fetchProjects, setBaseUrl]);

  return loading ? <Progress /> : <PluginRouter />;
};
