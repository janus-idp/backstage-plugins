// This file is a replica of useKubernetesObjects.ts & auth.ts from the Backstage upstream, created to address the issue https://issues.redhat.com/browse/RHIDP-3126

import { useCallback } from 'react';
import useAsyncRetry from 'react-use/esm/useAsyncRetry';
import useInterval from 'react-use/esm/useInterval';

import { Entity } from '@backstage/catalog-model';
import { ApiRef, useApi } from '@backstage/core-plugin-api';
import {
  KubernetesRequestBody,
  ObjectsByEntityResponse,
} from '@backstage/plugin-kubernetes-common';
import {
  KubernetesApi,
  KubernetesAuthProvidersApi,
} from '@backstage/plugin-kubernetes-react';

/**
 *
 * @public
 */
export interface KubernetesObjects {
  kubernetesObjects?: ObjectsByEntityResponse;
  loading: boolean;
  error?: string;
}

const generateAuth = async (
  entity: Entity,
  kubernetesApi: KubernetesApi,
  kubernetesAuthProvidersApi: KubernetesAuthProvidersApi,
) => {
  const clusters = await kubernetesApi.getClusters();

  const authProviders: string[] = [
    ...new Set(
      clusters.map(
        c =>
          `${c.authProvider}${
            c.oidcTokenProvider ? `.${c.oidcTokenProvider}` : ''
          }`,
      ),
    ),
  ];

  let requestBody: KubernetesRequestBody = {
    entity,
  };
  for (const authProviderStr of authProviders) {
    requestBody = await kubernetesAuthProvidersApi.decorateRequestBodyForAuth(
      authProviderStr,
      requestBody,
    );
  }
  return requestBody.auth ?? {};
};

/**
 *
 * @public
 */
export const useKubernetesObjects = (
  entity: Entity,
  kubernetesApiRef: ApiRef<KubernetesApi>,
  kubernetesAuthProvidersApiRef: ApiRef<KubernetesAuthProvidersApi>,
  intervalMs: number = 10000,
): KubernetesObjects => {
  const kubernetesApi = useApi(kubernetesApiRef);
  const kubernetesAuthProvidersApi = useApi(kubernetesAuthProvidersApiRef);
  const getObjects = useCallback(async (): Promise<ObjectsByEntityResponse> => {
    const auth = await generateAuth(
      entity,
      kubernetesApi,
      kubernetesAuthProvidersApi,
    );
    return await kubernetesApi.getObjectsByEntity({
      auth,
      entity,
    });
  }, [kubernetesApi, entity, kubernetesAuthProvidersApi]);

  const { value, loading, error, retry } = useAsyncRetry(
    () => getObjects(),
    [getObjects],
  );

  useInterval(() => retry(), intervalMs);

  return {
    kubernetesObjects: value,
    loading,
    error: error?.message,
  };
};
