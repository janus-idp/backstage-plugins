//

// ******************************************************************
// * THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY. *
// ******************************************************************
import { createValidatedOpenApiRouter } from '@backstage/backend-openapi-utils';

export const spec = {
  openapi: '3.0.0',
  info: {
    title: 'OCM Plugin API',
    version: 'latest',
    description:
      'The Open Cluster Management (OCM) plugin integrates your Backstage instance with OCM.',
  },
  paths: {
    '/status/{providerId}/{clusterName}': {
      get: {
        summary: 'Get the status of a specific cluster',
        description:
          'Retrieve the status of a specific cluster on a given hub.',
        parameters: [
          {
            name: 'providerId',
            in: 'path',
            required: true,
            description: 'The ID of the OCM provider',
            schema: {
              type: 'string',
            },
          },
          {
            name: 'clusterName',
            in: 'path',
            required: true,
            description: 'The name of the cluster',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Cluster status retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Cluster',
                },
              },
            },
          },
          '403': {
            description: 'Unauthorized',
          },
          '404': {
            description: 'Hub not found',
          },
        },
        security: [
          {},
          {
            JWT: [],
          },
        ],
      },
    },
    '/status': {
      get: {
        summary: 'Get the status of all clusters',
        description: 'Retrieve the status of all clusters across all hubs.',
        responses: {
          '200': {
            description: 'Clusters status retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/ClusterOverview',
                  },
                },
              },
            },
          },
          '403': {
            description: 'Unauthorized',
          },
        },
        security: [
          {},
          {
            JWT: [],
          },
        ],
      },
    },
  },
  components: {
    schemas: {
      ClusterStatus: {
        type: 'object',
        properties: {
          available: {
            type: 'boolean',
            description: 'Indicates if the cluster is available',
          },
          reason: {
            type: 'string',
            description:
              'Optional reason why the cluster is not available or as problems',
          },
        },
        required: ['available'],
      },
      ClusterUpdate: {
        type: 'object',
        properties: {
          available: {
            type: 'boolean',
            description: 'Indicates if an update is available',
          },
          version: {
            type: 'string',
            description: 'Version of the available update',
          },
          url: {
            type: 'string',
            description: 'URL for the update',
          },
        },
      },
      ClusterNodesStatus: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description: 'Status of the node',
          },
          type: {
            type: 'string',
            description: 'Type of the node',
          },
        },
      },
      ClusterDetails: {
        type: 'object',
        properties: {
          consoleUrl: {
            type: 'string',
            description: 'URL for the cluster console',
          },
          kubernetesVersion: {
            type: 'string',
            description: 'Version of Kubernetes',
          },
          oauthUrl: {
            type: 'string',
            description: 'OAuth URL for the cluster',
          },
          openshiftId: {
            type: 'string',
            description: 'ID of the OpenShift cluster',
          },
          openshiftVersion: {
            type: 'string',
            description: 'Version of OpenShift running in the cluster',
          },
          platform: {
            type: 'string',
            description: 'Platform of the cluster',
          },
          region: {
            type: 'string',
            description: 'Region where the cluster is located',
          },
          allocatableResources: {
            type: 'object',
            description: 'Resources that are allocatable in the cluster',
            properties: {
              cpuCores: {
                type: 'number',
                description: 'Number of CPU cores allocatable',
              },
              memorySize: {
                type: 'string',
                description: 'Size of allocatable memory',
              },
              numberOfPods: {
                type: 'number',
                description: 'Number of allocatable pods',
              },
            },
          },
          availableResources: {
            type: 'object',
            description: 'Resources that are available in the cluster',
            properties: {
              cpuCores: {
                type: 'number',
                description: 'Number of CPU cores available',
              },
              memorySize: {
                type: 'string',
                description: 'Size of available memory',
              },
              numberOfPods: {
                type: 'number',
                description: 'Number of available pods',
              },
            },
          },
          update: {
            $ref: '#/components/schemas/ClusterUpdate',
          },
          status: {
            $ref: '#/components/schemas/ClusterStatus',
          },
        },
      },
      Cluster: {
        allOf: [
          {
            $ref: '#/components/schemas/ClusterBase',
          },
          {
            $ref: '#/components/schemas/ClusterDetails',
          },
        ],
      },
      ClusterBase: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The name of the cluster',
          },
        },
      },
      ClusterOverview: {
        allOf: [
          {
            $ref: '#/components/schemas/ClusterBase',
          },
          {
            type: 'object',
            properties: {
              status: {
                $ref: '#/components/schemas/ClusterStatus',
              },
              update: {
                $ref: '#/components/schemas/ClusterUpdate',
              },
              platform: {
                type: 'string',
                description: 'Platform of the cluster',
              },
              openshiftVersion: {
                type: 'string',
                description: 'Version of OpenShift running in the cluster',
              },
              nodes: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/ClusterNodesStatus',
                },
              },
            },
          },
        ],
      },
    },
    securitySchemes: {
      JWT: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Backstage Permissions Framework JWT',
      },
    },
  },
} as const;
export const createOpenApiRouter = async (
  options?: Parameters<typeof createValidatedOpenApiRouter>['1'],
) => createValidatedOpenApiRouter<typeof spec>(spec, options);
