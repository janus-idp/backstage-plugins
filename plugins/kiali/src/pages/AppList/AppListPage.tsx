import * as React from 'react';
import { useRef } from 'react';
import { useAsyncFn, useDebounce } from 'react-use';

import { Entity } from '@backstage/catalog-model';
import { Content } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { DefaultSecondaryMasthead } from '../../components/DefaultSecondaryMasthead/DefaultSecondaryMasthead';
import * as FilterHelper from '../../components/FilterList/FilterHelper';
import { TimeDurationComponent } from '../../components/Time/TimeDurationComponent';
import { VirtualList } from '../../components/VirtualList/VirtualList';
import { isMultiCluster } from '../../config';
import { getEntityNs, nsEqual } from '../../helpers/namespaces';
import { getErrorString, kialiApiRef } from '../../services/Api';
import { KialiAppState, KialiContext } from '../../store';
import { baseStyle } from '../../styles/StyleUtils';
import { AppListItem } from '../../types/AppList';
import { ENTITY } from '../../types/types';
import { NamespaceInfo } from '../Overview/NamespaceInfo';
import { getNamespaces } from '../Overview/OverviewPage';
import * as AppListClass from './AppListClass';

export const AppListPage = (props: {
  view?: string;
  entity?: Entity;
}): React.JSX.Element => {
  const kialiClient = useApi(kialiApiRef);
  const [namespaces, setNamespaces] = React.useState<NamespaceInfo[]>([]);
  const [allApps, setApps] = React.useState<AppListItem[]>([]);
  const [duration, setDuration] = React.useState<number>(
    FilterHelper.currentDuration(),
  );
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const activeNs = props.entity
    ? getEntityNs(props.entity)
    : kialiState.namespaces.activeNamespaces.map(ns => ns.name);
  const prevActiveNs = useRef(activeNs);
  const prevDuration = useRef(duration);
  const [loadingD, setLoading] = React.useState<boolean>(true);

  const hiddenColumns = isMultiCluster ? [] : ['cluster'];
  if (props.view === ENTITY) {
    hiddenColumns.push('details');
  }

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
        kialiState.alertUtils?.add(
          `Could not fetch services: ${getErrorString(err)}`,
        ),
      );
  };

  const getNS = async () => {
    kialiClient.getNamespaces().then(namespacesResponse => {
      const allNamespaces: NamespaceInfo[] = getNamespaces(
        namespacesResponse,
        namespaces,
      );
      const namespaceInfos = allNamespaces.filter(ns =>
        activeNs.includes(ns.name),
      );
      setNamespaces(namespaceInfos);
      fetchApps(namespaceInfos, duration);
    });
    setTimeout(() => {
      setLoading(false);
    }, 400);
  };

  const [_, refresh] = useAsyncFn(
    async () => {
      await getNS();
    },
    [],
    { loading: true },
  );
  useDebounce(refresh, 5);

  React.useEffect(() => {
    if (
      duration !== prevDuration.current ||
      !nsEqual(activeNs, prevActiveNs.current)
    ) {
      setLoading(true);
      getNS();
      prevDuration.current = duration;
      prevActiveNs.current = activeNs;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNs, duration]);

  return (
    <div className={baseStyle}>
      <Content>
        {props.view !== ENTITY && (
          <DefaultSecondaryMasthead
            elements={grids()}
            onRefresh={() => getNS()}
          />
        )}
        <VirtualList
          activeNamespaces={namespaces}
          rows={allApps}
          type="applications"
          hiddenColumns={hiddenColumns}
          view={props.view}
          loading={loadingD}
        />
      </Content>
    </div>
  );
};
