import * as React from 'react';
import { useRef } from 'react';
import { useAsyncFn, useDebounce } from 'react-use';

import { Content, Page } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import {
  CircularProgress,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from '@material-ui/core';
import FilterListIcon from '@material-ui/icons/FilterList';

import { DefaultSecondaryMasthead } from '../../components/DefaultSecondaryMasthead/DefaultSecondaryMasthead';
import * as FilterHelper from '../../components/FilterList/FilterHelper';
import { TimeDurationComponent } from '../../components/Time/TimeDurationComponent';
import { VirtualList } from '../../components/VirtualList/VirtualList';
import { getErrorString, kialiApiRef } from '../../services/Api';
import { KialiAppState, KialiContext } from '../../store';
import { WorkloadListItem } from '../../types/Workload';
import { NamespaceInfo } from '../Overview/NamespaceInfo';
import { getNamespaces } from '../Overview/OverviewPage';

export const WorkloadListPage = () => {
  const kialiClient = useApi(kialiApiRef);
  kialiClient.setEntity(useEntity().entity);
  const [namespaces, setNamespaces] = React.useState<NamespaceInfo[]>([]);
  const [allWorkloads, setWorkloads] = React.useState<WorkloadListItem[]>([]);
  const [duration, setDuration] = React.useState<number>(
    FilterHelper.currentDuration(),
  );
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const activeNs = kialiState.namespaces.activeNamespaces.map(ns => ns.name);
  const prevActiveNs = useRef(activeNs);
  const prevDuration = useRef(duration);

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
      fetchWorkloads(nsl, duration);
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
    if (
      duration !== prevDuration.current ||
      !nsEqual(activeNs, prevActiveNs.current)
    ) {
      load();
      prevDuration.current = duration;
      prevActiveNs.current = activeNs;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, activeNs]);

  if (loading) {
    return <CircularProgress />;
  }

  const grids = () => {
    const elements = [];
    elements.push(
      <TimeDurationComponent
        key="DurationDropdown"
        id="workload-list-duration-dropdown"
        disabled={false}
        duration={duration.toString()}
        setDuration={setDuration}
        label="From:"
      />,
    );
    return elements;
  };

  const tableToolbarStyle = {
    backgroundColor: 'white',
  };

  const tableToolbar = () => {
    return (
      <Toolbar style={tableToolbarStyle}>
        <Typography variant="h6" id="tableTitle" component="div">
          Workloads
        </Typography>
        <Tooltip title="Filter list">
          <IconButton aria-label="filter list">
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    );
  };

  return (
    <Page themeId="tool">
      <Content>
        <DefaultSecondaryMasthead elements={grids()} onRefresh={() => load()} />
        <VirtualList
          tableToolbar={tableToolbar()}
          activeNamespaces={namespaces}
          rows={allWorkloads}
          type="workloads"
        />
      </Content>
    </Page>
  );
};
