import React, { createContext, useContext, useState } from 'react';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import useDebounce from 'react-use/lib/useDebounce';

import { useApi } from '@backstage/core-plugin-api';
import { ErrorResponseBody } from '@backstage/errors';
import { useEntity } from '@backstage/plugin-catalog-react';

import { ANNOTATION_PROVIDER_ID, Cluster } from '@janus-idp/backstage-plugin-ocm-common';

import { OcmApiRef } from '../../api';

type ClusterContextType = {
  data: Cluster | null;
  loading: boolean;
  error: Error | null;
};

const ClusterContext = createContext<ClusterContextType>({} as ClusterContextType);

export const ClusterContextProvider = (props: any) => {
  const { entity } = useEntity();
  const ocmApi = useApi(OcmApiRef);
  const [cluster, setCluster] = useState({} as Cluster | ErrorResponseBody);
  const [{ loading, error: asyncError }, refresh] = useAsyncFn(
    async () => {
      const providerId = entity.metadata.annotations![ANNOTATION_PROVIDER_ID];
      const cl = await ocmApi.getClusterByName(providerId, entity.metadata.name);
      setCluster(cl);
    },
    [],
    { loading: true },
  );
  useDebounce(refresh, 10);
  const isError = Boolean(asyncError || 'error' in cluster);
  const error = isError
    ? asyncError ||
      Object.assign(new Error((cluster as ErrorResponseBody)?.error?.message), {
        ...(cluster as ErrorResponseBody)?.error,
      })
    : null;

  return (
    <ClusterContext.Provider
      value={{
        data: isError || loading ? null : (cluster as Cluster),
        loading,
        error,
      }}
    >
      {props.children}
    </ClusterContext.Provider>
  );
};
export const useCluster = () => useContext(ClusterContext);
