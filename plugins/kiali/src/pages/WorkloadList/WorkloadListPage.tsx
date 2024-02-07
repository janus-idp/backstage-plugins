import * as React from 'react';
import { useRef } from 'react';
import { useAsyncFn, useDebounce } from 'react-use';

import { Content, Page } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { CircularProgress, Toolbar, Typography } from '@material-ui/core';

import { VirtualList } from '../../components/VirtualList/VirtualList';
import { isMultiCluster } from '../../config';
import { getErrorString, kialiApiRef } from '../../services/Api';
import { KialiAppState, KialiContext } from '../../store';
import { WorkloadListItem } from '../../types/Workload';
import { NamespaceInfo } from '../Overview/NamespaceInfo';
import { getNamespaces } from '../Overview/OverviewPage';

export const WorkloadListPage = () => {
  const kialiClient = useApi(kialiApiRef);
  const [namespaces, setNamespaces] = React.useState<NamespaceInfo[]>([]);
  const [allWorkloads, setWorkloads] = React.useState<WorkloadListItem[]>([]);
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const activeNs = kialiState.namespaces.activeNamespaces.map(ns => ns.name);
  const prevActiveNs = useRef(activeNs);

  const fetchWorkloads = (
    nss: NamespaceInfo[],
    timeDuration: number,
  ): Promise<void> => {
    return Promise.all(
      nss.map(nsInfo => {
        return kialiClient
          .getWorkloads(nsInfo.name, timeDuration)
          .then(workloadsResponse => {
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

  const nsEqual = (ns: string[], ns2: string[]): boolean => {
    return (
      ns.length === ns2.length &&
      ns.every((value: any, index: number) => value === ns2[index])
    );
  };

  const load = async () => {
    kialiClient.getNamespaces().then(namespacesResponse => {
      const allNamespaces: NamespaceInfo[] = getNamespaces(
        namespacesResponse,
        namespaces,
      );
      const nsl = allNamespaces.filter(ns => activeNs.includes(ns.name));
      setNamespaces(nsl);
      fetchWorkloads(nsl, 60);
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
    if (!nsEqual(activeNs, prevActiveNs.current)) {
      load();
      prevActiveNs.current = activeNs;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNs]);

  if (loading) {
    return <CircularProgress />;
  }

  const hiddenColumns = isMultiCluster ? [] : ['cluster'];

  const tableToolbarStyle = {
    backgroundColor: 'white',
  };

  const tableToolbar = () => {
    return (
      <Toolbar style={tableToolbarStyle}>
        <Typography variant="h6" id="tableTitle" component="div">
          Workloads
        </Typography>
      </Toolbar>
    );
  };

  return (
    <Page themeId="tool">
      <Content>
        <VirtualList
          tableToolbar={tableToolbar()}
          activeNamespaces={namespaces}
          rows={allWorkloads}
          type="workloads"
          hiddenColumns={hiddenColumns}
        />
      </Content>
    </Page>
  );
};
