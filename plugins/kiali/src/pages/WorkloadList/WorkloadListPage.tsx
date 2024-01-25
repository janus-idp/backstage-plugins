import * as React from 'react';
import { useAsyncFn, useDebounce } from 'react-use';

import { Content, Page } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import { CircularProgress } from '@material-ui/core';

import { VirtualList } from '../../components/VirtualList/VirtualList';
import { getErrorString, kialiApiRef } from '../../services/Api';
import { KialiAppState, KialiContext } from '../../store';
import { WorkloadListItem } from '../../types/Workload';
import { NamespaceInfo } from '../Overview/NamespaceInfo';

export const WorkloadListPage = () => {
  const kialiClient = useApi(kialiApiRef);
  kialiClient.setEntity(useEntity().entity);

  const [namespaces, setNamespaces] = React.useState<NamespaceInfo[]>([]);
  const [allWorkloads, setWorkloads] = React.useState<WorkloadListItem[]>([]);
  const kialiState = React.useContext(KialiContext) as KialiAppState;

  const fetchWorkloads = (nss: NamespaceInfo[]): Promise<void> => {
    return Promise.all(
      nss.map(nsInfo => {
        return kialiClient.getWorkloads(nsInfo.name).then(workloadsResponse => {
          return workloadsResponse;
        });
      }),
    )
      .then(results => {
        let wkList: WorkloadListItem[] = [];
        results.forEach(result => {
          wkList = Array.from(wkList).concat(result);
        });
        setWorkloads(wkList);
      })
      .catch(err =>
        kialiState.alertUtils!.add(
          `Could not fetch workloads: ${getErrorString(err)}`,
        ),
      );
  };

  const load = async () => {
    kialiClient.getNamespaces().then(namespacesResponse => {
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

      setNamespaces(allNamespaces);
      fetchWorkloads(allNamespaces);
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
        <VirtualList
          activeNamespaces={namespaces}
          rows={allWorkloads}
          type="workloads"
        />
      </Content>
    </Page>
  );
};
