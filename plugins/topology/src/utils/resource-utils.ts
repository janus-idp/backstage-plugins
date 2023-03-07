import {
  V1Deployment,
  V1Ingress,
  V1Pod,
  V1PodTemplate,
  V1Service,
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

export const getIngressesRulesForServices = (
  serviceNames: string[],
  ingresses: V1Ingress[],
): IngressRule[] => {
  if (!serviceNames?.length || !ingresses?.length) {
    return [];
  }
  const ingressRules = ingresses.reduce((acc, ingress) => {
    const rules = ingress.spec?.rules?.filter(rule => {
      return rule.http?.paths?.some(path => {
        return (
          path.backend?.service?.name &&
          serviceNames.includes(path.backend?.service?.name)
        );
      });
    });
    if (rules?.length) {
      acc.push({ schema: ingress.spec?.tls ? 'https' : 'http', rules });
    }
    return acc;
  }, [] as IngressRule[]);
  return ingressRules;
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

export const getIngressWebURL = (ingressRule: IngressRule): string | null => {
  const schema = ingressRule.schema;
  const { host, http } = ingressRule.rules?.[0] || {};
  if (!host || host.includes('*')) {
    // return if host doesn't exist or is a wildcard
    return null;
  }
  let url = `${schema}://${host}`;
  if (http?.paths && http.paths.length > 0) {
    url += http.paths[0].path;
  }
  return url;
};

export const getIngressesURL = (
  ingressRules: IngressRule[] = [],
): string | null => {
  const [rule] = ingressRules;
  if (rule) {
    return getIngressWebURL(rule);
  }
  return null;
};

const validUrl = (url?: string | null) =>
  url?.startsWith('http://') || url?.startsWith('https://');

export const getIngressURLForResource = (
  resources: K8sResponseData,
  resource: K8sWorkloadResource,
): string | undefined => {
  if (!resources.ingresses?.data) {
    return undefined;
  }
  const services = getServicesForResource(
    resource,
    resources.services?.data as V1Service[],
  );
  const servicesNames = services.map((s: V1Service) => s.metadata?.name ?? '');
  const ingressRules = getIngressesRulesForServices(
    servicesNames,
    resources.ingresses.data as V1Ingress[],
  );
  const ingressURL = getIngressesURL(ingressRules) || undefined;
  return validUrl(ingressURL) ? ingressURL : undefined;
};
