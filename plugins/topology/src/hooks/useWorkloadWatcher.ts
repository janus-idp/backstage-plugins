import * as React from 'react';
import { useDebounceCallback } from './debounce';
import { updateTopologyDataModel } from '../data-transforms/updateTopologyDataModel';
import { useDeepCompareMemoize } from './useDeepCompareMemoize';
import { Model } from '@patternfly/react-topology';
import { K8sResourcesContext } from './K8sResourcesContext';

export const useWorkloadsWatcher = (): {
  loaded: boolean;
  dataModel: any;
} => {
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const [dataModel, setDataModel] = React.useState<Model | null>(null);
  const k8sResponseData = React.useContext(K8sResourcesContext);

  const updateResults = React.useCallback(
    async ({ watchResourcesData, loading, responseError }) => {
      if (!responseError && !loading) {
        const dataModelRes = await updateTopologyDataModel(watchResourcesData);
        if (dataModelRes.model) {
          setDataModel(dataModelRes.model);
          setLoaded(true);
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
