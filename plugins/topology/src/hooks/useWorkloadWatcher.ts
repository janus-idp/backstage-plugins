import React from 'react';

import { Model } from '@patternfly/react-topology';

import { updateTopologyDataModel } from '../data-transforms/updateTopologyDataModel';
import { useDebounceCallback } from './debounce';
import { K8sResourcesContext } from './K8sResourcesContext';
import { useDeepCompareMemoize } from './useDeepCompareMemoize';

export const useWorkloadsWatcher = (): {
  loaded: boolean;
  dataModel: any;
} => {
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const [dataModel, setDataModel] = React.useState<Model | null>(null);
  const k8sResponseData = React.useContext(K8sResourcesContext);

  const updateResults = React.useCallback(
    async ({ watchResourcesData, loading, responseError }) => {
      if (!loading) {
        setLoaded(true);
        if (!responseError) {
          const dataModelRes =
            await updateTopologyDataModel(watchResourcesData);
          if (dataModelRes.model) {
            setDataModel(dataModelRes.model);
          }
        }
      }
    },
    [setLoaded, setDataModel],
  );

  const debouncedUpdateResources = useDebounceCallback(updateResults, 250);

  React.useEffect(() => {
    debouncedUpdateResources(k8sResponseData);
  }, [debouncedUpdateResources, k8sResponseData]);

  return useDeepCompareMemoize({ loaded, dataModel });
};
