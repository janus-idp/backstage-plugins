import React from 'react';
import { useParams } from 'react-router-dom';

import { useEntity } from '@backstage/plugin-catalog-react';
import { useKubernetesObjects } from '@backstage/plugin-kubernetes';

import { isEqual } from 'lodash';

import { TektonResourcesContextData, TektonResponseData } from '../types/types';
import { useDebounceCallback } from './debounce';
import { useAllWatchResources } from './useAllWatchResources';
import { useDeepCompareMemoize } from './useDeepCompareMemoize';
import { useResourcesClusters } from './useResourcesClusters';

export const useTektonObjectsResponse = (
  watchedResource: string[],
): TektonResourcesContextData => {
  const { entity } = useEntity();
  const { clusterName } = useParams();
  const { kubernetesObjects, loading, error } = useKubernetesObjects(entity);
  const [selectedCluster, setSelectedCluster] = React.useState<number>(0);
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const [errorState, setErrorState] = React.useState<string>();
  const [pipelinesData, setPipelinesData] = React.useState<
    TektonResponseData | undefined
  >();

  const mounted = React.useRef(false);

  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const watchResourcesData = useAllWatchResources(
    { kubernetesObjects, loading, error },
    selectedCluster,
    watchedResource,
  );
  const { clusters, errors: clusterErrors } = useResourcesClusters({
    kubernetesObjects,
    loading,
    error,
  });

  React.useEffect(() => {
    if (
      clusterName &&
      clusters?.length > 0 &&
      clusters.indexOf(clusterName) > 0
    ) {
      setSelectedCluster(clusters.indexOf(clusterName));
    } else {
      setSelectedCluster(0);
    }
  }, [clusters, clusterName]);

  const updateResults = React.useCallback(
    (resData, isLoading, errorData) => {
      if (!isLoading && !errorData && mounted.current) {
        setLoaded(true);
        setPipelinesData(prevPipelinesData => {
          if (isEqual(prevPipelinesData, resData)) {
            return prevPipelinesData;
          }
          return resData;
        });
      } else if (errorData && mounted.current) {
        setLoaded(true);
        setErrorState(errorData);
      }
    },
    [setLoaded, setPipelinesData, setErrorState],
  );

  const debouncedUpdateResources = useDebounceCallback(updateResults, 250);

  React.useEffect(() => {
    debouncedUpdateResources(watchResourcesData, loading, error);
  }, [debouncedUpdateResources, watchResourcesData, loading, error]);

  return useDeepCompareMemoize({
    watchResourcesData: pipelinesData,
    loaded,
    responseError: errorState,
    selectedClusterErrors: clusterErrors?.[selectedCluster] ?? [],
    clusters,
    selectedCluster,
    setSelectedCluster,
  });
};
