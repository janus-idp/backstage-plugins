import React, { createContext, useContext, useMemo } from 'react';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import useDebounce from 'react-use/lib/useDebounce';

import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import { KUBERNETES_NAMESPACE } from '../components/Router';
import { NamespaceInfo } from '../pages/Overview/NamespaceInfo';
import { getNamespaces } from '../pages/Overview/OverviewPage';
import { kialiApiRef } from '../services/Api';

type KialiEntityContextType = {
  data: NamespaceInfo[] | null;
  loading: boolean;
  error: Error | null;
};

const KialiEntityContext = createContext<KialiEntityContextType>(
  {} as KialiEntityContextType,
);

export const KialiContextProvider = (props: any) => {
  const { entity } = useEntity();
  const kialiClient = useApi(kialiApiRef);

  const [{ value: namespace, loading, error: asyncError }, refresh] =
    useAsyncFn(
      async () => {
        const annotations = entity?.metadata?.annotations || undefined;
        let ns: string[];
        if (!annotations) {
          ns = [];
        } else {
          const ant = decodeURIComponent(annotations[KUBERNETES_NAMESPACE]);
          if (ant) {
            ns = ant.split(',');
          }
          ns = [];
        }
        const filteredNs = await kialiClient
          .getNamespaces()
          .then(namespacesResponse => {
            const allNamespaces: NamespaceInfo[] = getNamespaces(
              namespacesResponse,
              [],
            );
            const namespaceInfos = allNamespaces.filter(nsInfo =>
              ns.includes(nsInfo.name),
            );
            return namespaceInfos;
          });
        return filteredNs;
      },
      [],
      { loading: true },
    );
  useDebounce(refresh, 10);
  const isError = Boolean(asyncError);
  const error = isError ? asyncError || Object.assign(new Error()) : null;

  const value = useMemo(
    () => ({
      data: isError || loading ? null : (namespace as NamespaceInfo[]),
      loading,
      error,
    }),
    [namespace, isError, loading, error],
  );

  return (
    <KialiEntityContext.Provider value={value}>
      {props.children}
    </KialiEntityContext.Provider>
  );
};
export const useKialiEntityContext = () => useContext(KialiEntityContext);
