import {
  V1Deployment,
  V1Ingress,
  V1Pod,
  V1PodTemplate,
  V1Service,
} from '@kubernetes/client-node';
import { OverviewItem } from '../types/topology-types';
import { K8sWorkloadResource } from '../types/types';
import { WORKLOAD_TYPES } from './topology-utils';
import { LabelSelector } from './label-selector';

const validPod = (pod: V1Pod) => {
  const owners = pod?.metadata?.ownerReferences;
  const phase = pod?.status?.phase;
  return (
    (!owners || Object.keys(owners).length === 0) &&
    phase !== 'Succeeded' &&
    phase !== 'Failed'
  );
};

const isStandaloneJob = (job: K8sWorkloadResource) =>
  job.metadata?.ownerReferences?.find(owner => owner.kind === 'CronJob');

export const createOverviewItemForType = (
  type: string,
  resource: K8sWorkloadResource,
): OverviewItem | undefined => {
  if (!WORKLOAD_TYPES.includes(type)) {
    return undefined;
  }
  switch (type) {
    case 'jobs':
      return isStandaloneJob(resource)
        ? {
            obj: resource as K8sWorkloadResource,
          }
        : undefined;
    case 'pods':
      return validPod(resource as V1Pod)
        ? {
            obj: resource as K8sWorkloadResource,
          }
        : undefined;
    default:
      return {
        obj: resource as K8sWorkloadResource,
      };
  }
};

export const getIngressesForServices = (
  services: string[],
  ingresses: V1Ingress[],
): V1Ingress[] => {
  if (!services?.length || !ingresses?.length) {
    return [];
  }
  return ingresses.filter(ingress => {
    return ingress.spec?.rules?.some(rule => {
      return rule.http?.paths?.some(path => {
        return (
          path.backend?.service?.name &&
          services.includes(path.backend?.service?.name)
        );
      });
    });
  });
};

const getPodTemplate = (
  resource: K8sWorkloadResource,
): V1PodTemplate | undefined => {
  switch (resource.kind) {
    case 'Pod':
      return resource as V1PodTemplate;
    case 'Deployment':
      return (resource as V1Deployment).spec?.template;
    default:
      return undefined;
  }
};

export const getServicesForResource = (
  resource: K8sWorkloadResource,
  services: V1Service[],
): V1Service[] => {
  if (!resource || !services) {
    return [];
  }
  const template = getPodTemplate(resource);
  return services.filter((service: V1Service) => {
    const specSelector = service.spec?.selector || {};
    const selector = new LabelSelector(specSelector);
    return selector.matches(template);
  });
};

export const getIngressWebURL = (ingress: V1Ingress): string => {
  const scheme = ingress.spec?.tls ? 'https' : 'http';
  const { host, http } = ingress.spec?.rules?.[0] || {};
  let url = `${scheme}://${host}`;
  if (http?.paths && http?.paths?.length > 0) {
    url += http?.paths[0]?.path;
  }
  return url;
};

export const getIngressesURL = (ingresses: V1Ingress[] = []): string | null => {
  const [ingress] = ingresses;
  if (ingress && ingress.spec?.rules) {
    return getIngressWebURL(ingress);
  }
  return null;
};
