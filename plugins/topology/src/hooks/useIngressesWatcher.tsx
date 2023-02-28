import { V1Ingress, V1Service } from '@kubernetes/client-node';
import * as React from 'react';
import { K8sWorkloadResource } from '../types/types';
import { getIngressesForServices } from '../utils/resource-utils';
import { K8sResourcesContext } from './K8sResourcesContext';
import { useServicesWatcher } from './useServicesWatcher';

export const useIngressesWatcher = (
  resource: K8sWorkloadResource,
): { loaded: boolean; loadError: string; ingresses: V1Ingress[] } => {
  const watchedServices = useServicesWatcher(resource);
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const [loadError, setLoadError] = React.useState<string>('');
  const [ingressData, setIngressesData] = React.useState<
    V1Ingress[] | undefined
  >(undefined);
  const { watchResourcesData, loading, error } =
    React.useContext(K8sResourcesContext);

  React.useEffect(() => {
    if (error) {
      setLoadError(error);
      return;
    }
    if (!loading) {
      const ingressResp = watchResourcesData?.ingresses?.data;
      setIngressesData(ingressResp as V1Ingress[]);
      setLoaded(true);
    }
  }, [error, loading, watchResourcesData]);

  const servicesNames = React.useMemo(
    () =>
      !watchedServices.loadError && watchedServices.loaded
        ? watchedServices.services.map((s: V1Service) => s.metadata?.name)
        : [],
    [
      watchedServices.loadError,
      watchedServices.loaded,
      watchedServices.services,
    ],
  );

  const ingresses = React.useMemo(
    () => getIngressesForServices(servicesNames, ingressData as V1Ingress[]),
    [servicesNames, ingressData],
  );

  return {
    loaded: loaded && watchedServices.loaded,
    loadError: loadError || watchedServices.loadError,
    ingresses,
  };
};
