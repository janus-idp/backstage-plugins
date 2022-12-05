import React, { createContext, useContext, useState } from 'react';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import useDebounce from 'react-use/lib/useDebounce';
import { ClusterDetails } from '@janus-idp/backstage-plugin-ocm-common';
import { getClusterByName } from '../../helpers/apiClient';
import { ErrorResponseBody } from '@backstage/errors';

type ClusterContextType = {
  data: ClusterDetails | null;
  loading: boolean;
  error: Error | null;
};

const ClusterContext = createContext<ClusterContextType>(
  {} as ClusterContextType,
);

export const ClusterContextProvider = (props: any) => {
  const { entity } = useEntity();
  const configApi = useApi(configApiRef);
  const [cluster, setCluster] = useState(
    {} as ClusterDetails | ErrorResponseBody,
  );
  const [{ loading, error: asyncError }, refresh] = useAsyncFn(
    async () => {
      setCluster(await getClusterByName(configApi, entity.metadata.name));
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
        data: isError || loading ? null : (cluster as ClusterDetails),
        loading,
        error,
      }}
    >
      {props.children}
    </ClusterContext.Provider>
  );
};
export const useCluster = () => useContext(ClusterContext);
