import {
  V1CronJob,
  V1DaemonSet,
  V1Deployment,
  V1Ingress,
  V1Job,
  V1Pod,
  V1PodTemplate,
  V1Service,
  V1StatefulSet,
} from '@kubernetes/client-node';
import { OverviewItem } from '../types/topology-types';
import {
  IngressRule,
  K8sResponseData,
  K8sWorkloadResource,
} from '../types/types';
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
  !job.metadata?.ownerReferences?.find(owner => owner.kind === 'CronJob');

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

const getPodTemplate = (
  resource: K8sWorkloadResource,
): V1PodTemplate | undefined => {
  switch (resource.kind) {
    case 'Pod':
      return resource as V1PodTemplate;
    case 'Deployment':
      return (resource as V1Deployment).spec?.template;
    case 'StatefulSet':
      return (resource as V1StatefulSet).spec?.template;
    case 'Job':
      return (resource as V1Job).spec?.template;
    case 'CronJob':
      return (resource as V1CronJob).spec?.jobTemplate?.spec?.template;
    case 'DaemonSet':
      return (resource as V1DaemonSet).spec?.template;
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

export const getIngressWebURL = (
  ingressRule: IngressRule,
): string | undefined => {
  const schema = ingressRule.schema;
  const { host, http } = ingressRule.rules?.[0] || {};
  if (!host || host.includes('*')) {
    // return if host doesn't exist or is a wildcard
    return undefined;
  }
  let url = `${schema}://${host}`;
  if (http?.paths && http.paths.length > 0) {
    url += http.paths[0].path;
  }
  return url;
};

export const getIngressesURL = (
  ingressesData: any = [],
): string | undefined => {
  const [ingressData] = ingressesData;
  return ingressData?.url;
};

const validUrl = (url?: string | null) =>
  url?.startsWith('http://') || url?.startsWith('https://');

export const getIngressesDataForResourceServices = (
  resources: K8sResponseData,
  resource: K8sWorkloadResource,
) => {
  const services = getServicesForResource(
    resource,
    resources.services?.data as V1Service[],
  );
  const servicesNames = services.map((s: V1Service) => s.metadata?.name ?? '');

  const ingressesData = (
    (resources.ingresses?.data as V1Ingress[]) ?? []
  ).reduce((acc, ingress) => {
    const rules = ingress.spec?.rules?.filter(rule => {
      return rule.http?.paths?.some(path => {
        return (
          path.backend?.service?.name &&
          servicesNames.includes(path.backend.service.name)
        );
      });
    });
    if (rules?.length) {
      const ingressURL = getIngressWebURL({
        schema: ingress.spec?.tls ? 'https' : 'http',
        rules,
      });
      acc.push({
        ingress,
        url: validUrl(ingressURL) ? ingressURL : undefined,
      });
    }
    return acc;
  }, [] as { ingress: V1Ingress; url: string | undefined }[]);

  return ingressesData;
};

export const getIngressURLForResource = (
  resources: K8sResponseData,
  resource: K8sWorkloadResource,
): string | undefined => {
  if (!resources.ingresses?.data) {
    return undefined;
  }
  const ingressesData = getIngressesDataForResourceServices(
    resources,
    resource,
  );

  return getIngressesURL(ingressesData);
};
