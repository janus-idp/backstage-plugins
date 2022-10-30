import React, { createContext, useContext, useState } from 'react';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import useDebounce from 'react-use/lib/useDebounce';
import { ClusterDetails } from '@internal/backstage-plugin-rhacm-common';
import { getClusterByName } from '../../helpers/apiClient';

const defaultClusterDetails: ClusterDetails = {
  status: {
    available: false,
    reason: 'Loading',
  },
};

const ClusterContext = createContext({
  // Have to put a default cluster details since it has to have a status by definition
  data: defaultClusterDetails,
  loading: true,
  error: false,
});

export const ClusterContextProvider = (props: any) => {
  const { entity } = useEntity();
  const configApi = useApi(configApiRef);
  const [cluster, setCluster] = useState<ClusterDetails>(defaultClusterDetails);
  const [{ loading, error }, refresh] = useAsyncFn(
    async () => {
      setCluster(await getClusterByName(configApi, entity.metadata.name));
    },
    [],
    { loading: true },
  );
  useDebounce(refresh, 10);

  let errorBool = false;
  /*
  Error can either be undefined or Error(), if its undefined, no error happended
  if cluster has some 'error' key, it means the API sent back an error response
  */
  if (error instanceof Error || 'error' in cluster) {
    errorBool = true;
  }

  return (
    <ClusterContext.Provider
      value={{ data: cluster, loading, error: errorBool }}
    >
      {props.children}
    </ClusterContext.Provider>
  );
};
export const useCluster = () => useContext(ClusterContext);
