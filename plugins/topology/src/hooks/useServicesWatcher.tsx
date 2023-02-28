import * as React from 'react';
import { K8sResourcesContext } from './K8sResourcesContext';
import { useDebounceCallback } from './debounce';
import { useDeepCompareMemoize } from './useDeepCompareMemoize';
import { K8sWorkloadResource } from '../types/types';
import { getServicesForResource } from '../utils/resource-utils';
import { V1Service } from '@kubernetes/client-node';

export const useServicesWatcher = (
  resource: K8sWorkloadResource,
): { loaded: boolean; loadError: string; services: any } => {
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const [loadError, setLoadError] = React.useState<string>('');
  const [services, setServices] = React.useState<V1Service[] | undefined>();
  const k8sResponse = React.useContext(K8sResourcesContext);

  const updateResults = React.useCallback(
    (watchedResource, { watchResourcesData, loading, error }) => {
      if (error) {
        setLoadError(error);
        return;
      }
      if (!loading) {
        const servicesData = getServicesForResource(
          watchedResource,
          watchResourcesData.services?.data,
        );
        setServices(servicesData);
        setLoaded(true);
      }
    },
    [setLoadError, setLoaded, setServices],
  );

  const debouncedUpdateResources = useDebounceCallback(updateResults, 250);

  React.useEffect(() => {
    debouncedUpdateResources(resource, k8sResponse);
  }, [debouncedUpdateResources, k8sResponse, resource]);

  return useDeepCompareMemoize({ loaded, loadError, services });
};
