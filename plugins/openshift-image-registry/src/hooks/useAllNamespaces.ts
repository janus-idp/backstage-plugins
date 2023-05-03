import * as React from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';
import { openshiftImageRegistryApiRef } from '../api';

export const useAllNamespaces = () => {
  const client = useApi(openshiftImageRegistryApiRef);
  const [namespaces, setNamespaces] = React.useState([]);

  const { loading } = useAsync(async () => {
    const ns = await client.getNamespaces();
    setNamespaces(ns);
  });

  const namespacesData = React.useMemo(() => {
    if (namespaces?.length) {
      return namespaces.map((ns: any) => ({
        label: ns.metadata.name,
        value: ns.metadata.name,
      }));
    }
    return [];
  }, [namespaces]);

  return { loading, namespacesData };
};
