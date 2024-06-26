import * as React from 'react';
import { useRef } from 'react';
import { useAsyncFn, useDebounce } from 'react-use';

import { Entity } from '@backstage/catalog-model';
import { Content } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { CircularProgress } from '@material-ui/core';

import { DefaultSecondaryMasthead } from '../../components/DefaultSecondaryMasthead/DefaultSecondaryMasthead';
import * as FilterHelper from '../../components/FilterList/FilterHelper';
import { TimeDurationComponent } from '../../components/Time/TimeDurationComponent';
import { VirtualList } from '../../components/VirtualList/VirtualList';
import { isMultiCluster } from '../../config';
import { useKialiEntityContext } from '../../dynamic/KialiContext';
import { getEntityNs, nsEqual } from '../../helpers/namespaces';
import { getErrorString, kialiApiRef } from '../../services/Api';
import { KialiAppState, KialiContext } from '../../store';
import { baseStyle } from '../../styles/StyleUtils';
import { WorkloadHealth } from '../../types/Health';
import { validationKey } from '../../types/IstioConfigList';
import { ENTITY } from '../../types/types';
import {
  ClusterWorkloadsResponse,
  WorkloadListItem,
} from '../../types/Workload';
import { hasMissingAuthPolicy } from '../../utils/IstioConfigUtils';
import { sortIstioReferences } from '../AppList/FiltersAndSorts';
import { NamespaceInfo } from '../Overview/NamespaceInfo';
import { getNamespaces } from '../Overview/OverviewPage';

export const WorkloadListPage = (props: { view?: string; entity?: Entity }) => {
  const kialiClient = useApi(kialiApiRef);
  const [namespaces, setNamespaces] = React.useState<NamespaceInfo[]>([]);
  const [allWorkloads, setWorkloads] = React.useState<WorkloadListItem[]>([]);
  const [duration, setDuration] = React.useState<number>(
    FilterHelper.currentDuration(),
  );
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const kialiContext = useKialiEntityContext();

  const activeNs = props.entity
    ? getEntityNs(props.entity)
    : kialiState.namespaces.activeNamespaces.map(ns => ns.name);
  const prevActiveNs = useRef(activeNs);
  const prevDuration = useRef(duration);
  const [loadingData, setLoadingData] = React.useState<boolean>(true);

  const getDeploymentItems = (
    data: ClusterWorkloadsResponse,
  ): WorkloadListItem[] => {
    if (data.workloads) {
      return data.workloads.map(deployment => ({
        cluster: deployment.cluster,
        namespace: deployment.namespace,
        name: deployment.name,
        type: deployment.type,
        appLabel: deployment.appLabel,
        versionLabel: deployment.versionLabel,
        istioSidecar: deployment.istioSidecar,
        istioAmbient: deployment.istioAmbient,
        additionalDetailSample: deployment.additionalDetailSample,
        health: WorkloadHealth.fromJson(
          deployment.namespace,
          deployment.name,
          deployment.health,
          {
            rateInterval: duration,
            hasSidecar: deployment.istioSidecar,
            hasAmbient: deployment.istioAmbient,
          },
        ),
        labels: deployment.labels,
        istioReferences: sortIstioReferences(deployment.istioReferences, true),
        notCoveredAuthPolicy: hasMissingAuthPolicy(
          validationKey(deployment.name, deployment.namespace),
          data.validations,
        ),
      }));
    }

    return [];
  };

  const fetchWorkloads = (
    clusters: string[],
    timeDuration: number,
  ): Promise<void> => {
    return Promise.all(
      clusters.map(cluster => {
        return kialiClient
          .getClustersWorkloads(
            activeNs.map(nss => nss).join(','),
            {
              health: 'true',
              istioResources: 'true',
              rateInterval: `${String(timeDuration)}s`,
            },
            cluster,
          )
          .then(workloadsResponse => {
            return workloadsResponse;
          });
      }),
    )
      .then(results => {
        let workloadsItems: WorkloadListItem[] = [];
        results.forEach(response => {
          workloadsItems = workloadsItems.concat(getDeploymentItems(response));
        });
        setWorkloads(workloadsItems);
      })
      .catch(err => {
        kialiState.alertUtils?.add(
          `Could not fetch workloads: ${getErrorString(err)}`,
        );
      });
  };

  const load = async () => {
    const uniqueClusters = new Set<string>();
    const serverConfig = await kialiClient.getServerConfig();

    Object.keys(serverConfig.clusters).forEach(cluster => {
      uniqueClusters.add(cluster);
    });

    if (kialiContext.data) {
      setNamespaces(kialiContext.data);
      await fetchWorkloads(Array.from(uniqueClusters), duration);
    } else {
      kialiClient.getNamespaces().then(namespacesResponse => {
        const allNamespaces: NamespaceInfo[] = getNamespaces(
          namespacesResponse,
          namespaces,
        );
        const nsl = allNamespaces.filter(ns => activeNs.includes(ns.name));
        setNamespaces(nsl);
        fetchWorkloads(Array.from(uniqueClusters), duration);
      });
    }

    // Add a delay so it doesn't look like a flash
    setTimeout(() => {
      setLoadingData(false);
    }, 400);
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
      setLoadingData(true);
      load();
      prevDuration.current = duration;
      prevActiveNs.current = activeNs;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNs, duration]);

  if (loading) {
    return <CircularProgress />;
  }

  const hiddenColumns = isMultiCluster ? [] : ['cluster'];
  if (props.view === ENTITY) {
    hiddenColumns.push('details');
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

  return (
    <div className={baseStyle}>
      <Content>
        {props.view !== ENTITY && (
          <DefaultSecondaryMasthead
            elements={grids()}
            onRefresh={() => load()}
          />
        )}
        <VirtualList
          activeNamespaces={namespaces}
          rows={allWorkloads}
          type="workloads"
          hiddenColumns={hiddenColumns}
          view={props.view}
          loading={loadingData}
          data-test="virtual-list"
        />
      </Content>
    </div>
  );
};
