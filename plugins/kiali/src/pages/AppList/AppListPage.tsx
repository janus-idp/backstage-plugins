import * as React from 'react';
import { useRef } from 'react';
import { useAsyncFn, useDebounce } from 'react-use';

import { Content } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { CircularProgress } from '@material-ui/core';

import { DefaultSecondaryMasthead } from '../../components/DefaultSecondaryMasthead/DefaultSecondaryMasthead';
import * as FilterHelper from '../../components/FilterList/FilterHelper';
import { TimeDurationComponent } from '../../components/Time/TimeDurationComponent';
import { VirtualList } from '../../components/VirtualList/VirtualList';
import { isMultiCluster } from '../../config';
import { nsEqual } from '../../helpers/namespaces';
import { getErrorString, kialiApiRef } from '../../services/Api';
import { KialiAppState, KialiContext } from '../../store';
import { baseStyle } from '../../styles/StyleUtils';
import { AppListItem } from '../../types/AppList';
import { NamespaceInfo } from '../Overview/NamespaceInfo';
import { getNamespaces } from '../Overview/OverviewPage';
import * as AppListClass from './AppListClass';

export const AppListPage = (): React.JSX.Element => {
  const kialiClient = useApi(kialiApiRef);
  const [namespaces, setNamespaces] = React.useState<NamespaceInfo[]>([]);
  const [allApps, setApps] = React.useState<AppListItem[]>([]);
  const [duration, setDuration] = React.useState<number>(
    FilterHelper.currentDuration(),
  );
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const activeNs = kialiState.namespaces.activeNamespaces.map(ns => ns.name);
  const prevActiveNs = useRef(activeNs);
  const prevDuration = useRef(duration);

  const hiddenColumns = isMultiCluster ? [] : ['cluster'];

  const grids = () => {
    const elements = [];
    elements.push(
      <TimeDurationComponent
        key="DurationDropdown"
        id="app-list-duration-dropdown"
        disabled={false}
        duration={duration.toString()}
        setDuration={setDuration}
        label="From:"
      />,
    );
    return elements;
  };

  const fetchApps = async (
    nss: NamespaceInfo[],
    timeDuration: number,
  ): Promise<void> => {
    const health = 'true';
    const istioResources = 'true';
    return Promise.all(
      nss.map(async nsInfo => {
        return await kialiClient.getApps(nsInfo.name, {
          rateInterval: `${String(timeDuration)}s`,
          health: health,
          istioResources: istioResources,
        });
      }),
    )
      .then(results => {
        let appListItems: AppListItem[] = [];

        results.forEach(response => {
          appListItems = appListItems.concat(
            AppListClass.getAppItems(response, timeDuration),
          );
        });
        setApps(appListItems);
      })
      .catch(err =>
        kialiState.alertUtils!.add(
          `Could not fetch services: ${getErrorString(err)}`,
        ),
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
      fetchApps(nsl, duration);
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
  }, [activeNs, duration]);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div className={baseStyle}>
      <Content>
        <DefaultSecondaryMasthead elements={grids()} onRefresh={() => load()} />
        <VirtualList
          activeNamespaces={namespaces}
          rows={allApps}
          type="applications"
          hiddenColumns={hiddenColumns}
        />
      </Content>
    </div>
  );
};
