import React, { useEffect } from 'react';
import { useStore } from '../stores/workflowStore/workflowStore';
import { useBackendUrl } from './api/useBackendUrl';
import { PluginRouter } from './PluginRouter';
import { Progress } from '@backstage/core-components';

export const App = () => {
  const backendUrl = useBackendUrl();
  const setBaseUrl = useStore(state => state.setBaseUrl);
  const fetchProjects = useStore(state => state.fetchProjects);
  const fetchDefinitions = useStore(state => state.fetchDefinitions);
  const loading = useStore(state => state.loading());

  useEffect(() => {
    setBaseUrl(backendUrl);

    async function initialiseStore() {
      await Promise.all([fetchProjects(), fetchDefinitions()]);
    }

    initialiseStore();
  }, [backendUrl, fetchDefinitions, fetchProjects, setBaseUrl]);

  return loading ? <Progress /> : <PluginRouter />;
};
