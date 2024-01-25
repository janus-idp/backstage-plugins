import { isMultiCluster, Paths } from '../../config';
import { IstioTypes } from '../VirtualList/Config';

export const getIstioObjectUrl = (
  name: string,
  namespace: string,
  type: string,
  cluster?: string,
  query?: string,
): string => {
  const istioType = IstioTypes[type];
  let to = `/namespaces/${namespace}/${Paths.ISTIO}`;

  to = `${to}/${istioType.url}/${name}`;

  if (cluster && isMultiCluster) {
    to = `${to}?clusterName=${cluster}`;
  }

  if (!!query) {
    if (to.includes('?')) {
      to = `${to}&${query}`;
    } else {
      to = `${to}?${query}`;
    }
  }

  return to;
};
