import * as React from 'react';
import { useAsyncFn, useDebounce } from 'react-use';

import { Content, Page } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import { CircularProgress } from '@material-ui/core';

import { kialiApiRef } from '../../services/Api';

export const WorkloadListPage = () => {
  const kialiClient = useApi(kialiApiRef);
  kialiClient.setEntity(useEntity().entity);

  const load = async () => {
    kialiClient.getNamespaces().then(() => {
      /*
            const allNamespaces: NamespaceInfo[] = namespacesResponse.map(ns => {
                const previous = namespaces.find(prev => prev.name === ns.name);
                return {
                    name: ns.name,
                    cluster: ns.cluster,
                    isAmbient: ns.isAmbient,
                    status: previous ? previous.status : undefined,
                    tlsStatus: previous ? previous.tlsStatus : undefined,
                    metrics: previous ? previous.metrics : undefined,
                    errorMetrics: previous ? previous.errorMetrics : undefined,
                    validations: previous ? previous.validations : undefined,
                    labels: ns.labels,
                    annotations: ns.annotations,
                    controlPlaneMetrics: previous
                        ? previous.controlPlaneMetrics
                        : undefined,
                };
            });
            */
    });
  };

  const [{ loading }, refresh] = useAsyncFn(
    async () => {
      // Check if the config is loaded
      await load();
    },
    [],
    { loading: true },
  );
  useDebounce(refresh, 10);

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Page themeId="tool">
      <Content>
        <VirtualList></VirtualList>
      </Content>
    </Page>
  );
};
