import { CatalogClient } from '@backstage/catalog-client';
import { Entity } from '@backstage/catalog-model';
import {
  ActionContext,
  createTemplateAction,
} from '@backstage/plugin-scaffolder-node';

import {
  CoreV1Api,
  HttpError,
  KubeConfig,
  V1Namespace,
} from '@kubernetes/client-node';

const KUBERNETES_API_URL_ANNOTATION = 'kubernetes.io/api-server';
const KUBERNETES_CLUSTER_TYPE = 'kubernetes-cluster';

export interface HttpErrorBody {
  kind: string;
  apiVersion: string;
  metadata: Object;
  status: string;
  message: string;
  reason: string;
  details: { name: string; kind: string };
  code: number;
}

type TemplateActionParameters = {
  namespace: string;
  clusterRef?: string;
  url?: string;
  token: string;
  skipTLSVerify?: boolean;
  caData?: string;
};

const getUrlFromClusterRef = async (
  ctx: ActionContext<TemplateActionParameters>,
  catalogClient: CatalogClient,
  clusterRef: string,
): Promise<string> => {
  const isResource = clusterRef.startsWith('resource:');
  if (!isResource) {
    ctx.logger.warn(
      'Cluster reference in the wrong format, attempting to fix it',
    );
  }
  const catalogEntity: Entity | undefined = await catalogClient.getEntityByRef(
    isResource ? clusterRef : `resource:${clusterRef}`,
  );
  if (!catalogEntity) {
    throw new Error('Resource not found');
  }
  if (catalogEntity.spec?.type !== KUBERNETES_CLUSTER_TYPE) {
    ctx.logger.warn(`Resource is not of ${KUBERNETES_CLUSTER_TYPE} type`);
  }
  const apiUrl =
    catalogEntity.metadata?.annotations?.[KUBERNETES_API_URL_ANNOTATION];
  if (!apiUrl) {
    throw new Error(
      `Cluster resource is missing ${KUBERNETES_API_URL_ANNOTATION} annotation`,
    );
  }
  return apiUrl;
};

const validateUrl = (url: string | undefined = '') => {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
  } catch (error) {
    throw new Error(`"${url}" is an invalid url`);
  }
};

export function createKubernetesNamespaceAction(catalogClient: CatalogClient) {
  return createTemplateAction<TemplateActionParameters>({
    id: 'kubernetes:create-namespace',
    description: 'Creates a kubernetes namespace',
    schema: {
      input: {
        type: 'object',
        oneOf: [
          { required: ['namespace', 'token', 'url'] },
          { required: ['namespace', 'token', 'clusterRef'] },
        ],
        properties: {
          namespace: {
            title: 'Namespace name',
            description: 'Name of the namespace to be created',
            type: 'string',
          },
          clusterRef: {
            title: 'Cluster entity reference',
            description: 'Cluster resource entity reference from the catalog',
            type: 'string',
          },
          url: {
            title: 'Url',
            description:
              'Url of the kubernetes API, will be used if clusterRef is not provided',
            type: 'string',
          },
          token: {
            title: 'Token',
            description: 'Bearer token to authenticate with',
            type: 'string',
          },
          skipTLSVerify: {
            title: 'Skip TLS verification',
            description:
              'Skip TLS certificate verification, not recommended to use in production environment, defaults to false',
            type: 'boolean',
          },
          caData: {
            title: 'CA Data',
            description: 'Certificate Authority base64 encoded certificate',
            type: 'string',
          },
        },
      },
    },
    async handler(ctx) {
      const { namespace, clusterRef, token, url, skipTLSVerify, caData } =
        ctx.input;
      const kubeConfig = new KubeConfig();
      const name = 'backstage';
      const cluster = {
        server: '',
        name,
        serviceAccountToken: token,
        skipTLSVerify: skipTLSVerify || false,
        caData,
      };

      if (clusterRef && url) {
        throw new Error(
          "Cluster reference and url can't be specified at the same time",
        );
      }

      if (!clusterRef && !url) {
        throw new Error('Cluster reference or url are required');
      }

      if (clusterRef) {
        cluster.server = await getUrlFromClusterRef(
          ctx,
          catalogClient,
          clusterRef,
        );
      } else {
        validateUrl(url);
        cluster.server = url!;
      }

      kubeConfig.loadFromOptions({
        clusters: [cluster],
        users: [{ name, token }],
        contexts: [
          {
            name,
            user: name,
            cluster: name,
          },
        ],
        currentContext: name,
      });

      const api = kubeConfig.makeApiClient(CoreV1Api);
      const k8sNamespace: V1Namespace = {
        metadata: {
          name: namespace,
        },
      };
      await api.createNamespace(k8sNamespace).catch((e: HttpError) => {
        const errorBody = e.body as HttpErrorBody;
        const statusCode = errorBody?.code || e.statusCode;
        const message = errorBody?.message || e.message;
        throw new Error(
          `Failed to create kubernetes namespace, ${statusCode} -- ${message}`,
        );
      });
    },
  });
}
