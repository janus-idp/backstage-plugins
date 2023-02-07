import * as React from 'react';
import {
  getPodsDataForResource,
  getResourcesToWatchForPods,
} from '../utils/pod-resource-utils';
import { PodRCData } from '../types/pods';
import { useDeepCompareMemoize } from './useDeepCompareMemoize';
import { useDebounceCallback } from './debounce';
import { K8sResourceKind } from '../types/types';
import { useAllWatchResources } from './useAllWatchResources';

/**
 * Watches for all Pods for a kind and namespace.
 * Kind and namespace is used from the given `resource` and can be overridden
 * with the `kind` and `namespace` parameters.
 */
export const usePodsWatcher = (
  resource: K8sResourceKind,
  kind?: string,
  namespace?: string,
): { loaded: boolean; loadError: string; podData: any } => {
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const [loadError, setLoadError] = React.useState<string>('');
  const [podData, setPodData] = React.useState<PodRCData | undefined>(
    undefined,
  );
  const watchKind = kind || resource?.kind;
  const watchNS = namespace || resource?.metadata?.namespace;
  const watchedResources = React.useMemo(
    () =>
      watchKind ? getResourcesToWatchForPods(watchKind, watchNS as string) : {},
    [watchKind, watchNS],
  );

  // TODO: watch for resources when avialable
  // const resources = useK8sWatchResources(watchedResources);
  const resources = useAllWatchResources(watchedResources);

  const updateResults = React.useCallback(
    (watchedResource, updatedResources) => {
      const errorKey = Object.keys(updatedResources).find(
        key => updatedResources[key].loadError,
      );
      if (errorKey) {
        setLoadError(updatedResources[errorKey].loadError);
        return;
      }
      setLoadError('');
      if (
        Object.keys(updatedResources).length > 0 &&
        Object.keys(updatedResources).every(key => updatedResources[key].loaded)
      ) {
        const updatedPods = getPodsDataForResource(
          watchedResource,
          watchKind,
          updatedResources,
        );
        setPodData(updatedPods as PodRCData);
        setLoaded(true);
      }
    },
    [setLoadError, setLoaded, setPodData, watchKind],
  );

  const debouncedUpdateResources = useDebounceCallback(updateResults, 250);

  React.useEffect(() => {
    debouncedUpdateResources(resource, resources);
  }, [debouncedUpdateResources, resources, resource]);

  return useDeepCompareMemoize({ loaded, loadError, podData });
};
