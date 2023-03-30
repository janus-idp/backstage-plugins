import React, { useEffect } from 'react';
import { useStore } from '../stores/workflowStore/workflowStore';
import { useBackendUrl } from './api/useBackendUrl';
import { PluginRouter } from './PluginRouter';
import { Progress } from '@backstage/core-components';
import { fetchApiRef, identityApiRef, useApi } from '@backstage/core-plugin-api';

export const App = () => {
  const backendUrl = useBackendUrl();
  const setBaseUrl = useStore(state => state.setBaseUrl);
  const fetchProjects = useStore(state => state.fetchProjects);
  const fetchDefinitions = useStore(state => state.fetchDefinitions);
  const loading = useStore(state => state.loading());
  const all = useApi(fetchApiRef);
  const identity = useApi(identityApiRef);

  console.log(all, identity)

  useEffect(() => {
    setBaseUrl(backendUrl);

    async function initialiseStore() {
      await Promise.all([fetchProjects(all.fetch), fetchDefinitions(all.fetch)]);
    }

    initialiseStore();
  }, [backendUrl, fetchDefinitions, fetchProjects, setBaseUrl]);

  return loading ? <Progress /> : <PluginRouter />;
};
