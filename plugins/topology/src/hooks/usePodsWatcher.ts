import * as React from 'react';
import { getPodsDataForResource } from '../utils/pod-resource-utils';
import { PodRCData } from '../types/pods';
import { useDeepCompareMemoize } from './useDeepCompareMemoize';
import { useDebounceCallback } from './debounce';
import { K8sWorkloadResource } from '../types/types';
import { K8sResourcesContext } from './K8sResourcesContext';

export const usePodsWatcher = (
  resource: K8sWorkloadResource,
): { loaded: boolean; loadError: string; podData: any } => {
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const [loadError, setLoadError] = React.useState<string>('');
  const [podData, setPodData] = React.useState<PodRCData | undefined>(
    undefined,
  );
  const watchKind = resource.kind;
  const k8sResponse = React.useContext(K8sResourcesContext);

  const updateResults = React.useCallback(
    (watchedResource, { watchResourcesData, loading, error }) => {
      if (error) {
        setLoadError(error);
        return;
      }
      if (!loading && Object.keys(watchResourcesData).length > 0) {
        const updatedPods =
          watchKind &&
          getPodsDataForResource(
            watchedResource,
            watchKind,
            watchResourcesData,
          );
        setPodData(updatedPods as PodRCData);
        setLoaded(true);
      }
    },
    [setLoadError, setLoaded, setPodData, watchKind],
  );

  const debouncedUpdateResources = useDebounceCallback(updateResults, 250);

  React.useEffect(() => {
    debouncedUpdateResources(resource, k8sResponse);
  }, [debouncedUpdateResources, k8sResponse, resource]);

  return useDeepCompareMemoize({ loaded, loadError, podData });
};
