import * as React from 'react';
import { K8sWorkloadResource } from '../types/types';
import { getRoutesURL } from '../utils/resource-utils';
import { useIngressesWatcher } from './useIngressesWatcher';

export const useIngressURL = (resource: K8sWorkloadResource): string | null => {
  const ingressResources = useIngressesWatcher(resource);
  const ingresses = React.useMemo(() => {
    if (!ingressResources.loaded || ingressResources.loadError) {
      return [];
    }
    return ingressResources.ingresses;
  }, [ingressResources]);

  const watchedURL = React.useMemo(() => getRoutesURL(ingresses), [ingresses]);
  const url = watchedURL;
  if (!url || !(url.startsWith('http://') || url.startsWith('https://'))) {
    return null;
  }
  return url;
};
