import {
  mockK8sResourcesData,
  mockKubernetesResponse,
} from '../__fixtures__/1-deployments';
import {
  getIngressesRulesForServices,
  getIngressURLForResource,
  getIngressWebURL,
  getServicesForResource,
} from './resource-utils';

describe('ResourceUtils:: ingress', () => {
  it('should return ingresses for associated service names', () => {
    const mockIngressData = [
      {
        ...mockKubernetesResponse.ingresses[0],
        spec: {
          ...mockKubernetesResponse.ingresses[0].spec,
          rules: [
            ...mockKubernetesResponse.ingresses[0].spec.rules,
            {
              host: 'hello-world-app.info',
              http: {
                paths: [
                  {
                    path: '/',
                    pathType: 'Prefix',
                    backend: {
                      service: {
                        name: 'hello-world-new',
                        port: {
                          number: 8080,
                        },
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        apiVersion: 'networking.k8s.io/v1',
        kind: 'Ingress',
        metadata: {
          name: 'ingress-resource-backend',
        },
        spec: {
          defaultBackend: {
            resource: {
              apiGroup: 'k8s.example.com',
              kind: 'StorageBucket',
              name: 'static-assets',
            },
          },
        },
      },
    ];

    const ingressesRulesData = getIngressesRulesForServices(
      ['hello-world', 'hello-app'],
      mockIngressData as any,
    );
    expect(ingressesRulesData).toHaveLength(1);
    expect(ingressesRulesData).toEqual([
      { schema: 'http', rules: mockKubernetesResponse.ingresses[0].spec.rules },
    ]);
  });

  it('should return no ingresses for associated service name for no match', () => {
    const ingressesRulesData = getIngressesRulesForServices(
      ['hello-world-123'],
      mockKubernetesResponse.ingresses as any,
    );
    expect(ingressesRulesData).toEqual([]);
  });

  it('should return services for associated resource', () => {
    const servicesData = getServicesForResource(
      mockKubernetesResponse.deployments[0] as any,
      mockKubernetesResponse.services as any,
    );
    expect(servicesData).toHaveLength(1);
    expect(servicesData).toEqual(mockKubernetesResponse.services);
  });

  it('should not return services for associated resource if no services exits', () => {
    const servicesData = getServicesForResource(
      mockKubernetesResponse.deployments[0] as any,
      [],
    );
    expect(servicesData).toHaveLength(0);
    expect(servicesData).toEqual([]);
  });

  it('should not return services for invalid resource', () => {
    const servicesData = getServicesForResource(
      {} as any,
      mockKubernetesResponse.services as any,
    );
    expect(servicesData).toHaveLength(0);
    expect(servicesData).toEqual([]);
  });

  it('should not return services for resource if no associated services found', () => {
    const servicesData = getServicesForResource(
      mockKubernetesResponse.deployments[2] as any,
      mockKubernetesResponse.services as any,
    );
    expect(servicesData).toHaveLength(0);
    expect(servicesData).toEqual([]);
  });

  it('should return URL for provided ingress', () => {
    const mockIngressRule = {
      schema: 'http',
      rules: mockKubernetesResponse.ingresses[0].spec.rules,
    };
    const ingressData = getIngressWebURL(mockIngressRule as any);
    expect(ingressData).toEqual('http://hello-world-app.info/');
  });

  it('should not return URL for provided ingress if host does not exist', () => {
    const mockIngressRule = {
      schema: '',
      rules: [],
    };
    const ingressData = getIngressWebURL(mockIngressRule as any);
    expect(ingressData).toBeNull();
  });

  it('should not return URL for provided ingress if host has wildcards', () => {
    const mockIngressRule = {
      schema: 'http',
      rules: [
        {
          host: '*.hello-world-app.info',
          http: mockKubernetesResponse.ingresses[0].spec.rules[0].http,
        },
      ],
    };
    const ingressData = getIngressWebURL(mockIngressRule as any);
    expect(ingressData).toBeNull();
  });

  it('should return URL for provided ingress with https', () => {
    const mockIngressRule = {
      schema: 'https',
      rules: mockKubernetesResponse.ingresses[0].spec.rules,
    };

    const ingressData = getIngressWebURL(mockIngressRule as any);
    expect(ingressData).toEqual('https://hello-world-app.info/');
  });

  it('should not return URL for provided ingress if does not exists', () => {
    const ingressData = getIngressWebURL({} as any);
    expect(ingressData).toBeNull();
  });

  it('should return URL for provided resource', () => {
    const url = getIngressURLForResource(
      mockK8sResourcesData.watchResourcesData as any,
      mockKubernetesResponse.deployments[0] as any,
    );
    expect(url).toEqual('http://hello-world-app.info/');
  });

  it('should not return URL for provided resource', () => {
    const url = getIngressURLForResource(
      mockK8sResourcesData.watchResourcesData as any,
      mockKubernetesResponse.deployments[2] as any,
    );
    expect(url).toBeUndefined();
  });
});
