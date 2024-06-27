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
import { getEntityNs, nsEqual } from '../../helpers/namespaces';
import { getErrorString, kialiApiRef } from '../../services/Api';
import { KialiAppState, KialiContext } from '../../store';
import { baseStyle } from '../../styles/StyleUtils';
import { ServiceHealth } from '../../types/Health';
import { validationKey } from '../../types/IstioConfigList';
import { ObjectValidation, Validations } from '../../types/IstioObjects';
import { ServiceList, ServiceListItem } from '../../types/ServiceList';
import { ENTITY } from '../../types/types';
import { sortIstioReferences } from '../AppList/FiltersAndSorts';
import { NamespaceInfo } from '../Overview/NamespaceInfo';
import { getNamespaces } from '../Overview/OverviewPage';

export const ServiceListPage = (props: {
  view?: string;
  entity?: Entity;
}): React.JSX.Element => {
  const kialiClient = useApi(kialiApiRef);
  const [namespaces, setNamespaces] = React.useState<NamespaceInfo[]>([]);
  const [allServices, setServices] = React.useState<ServiceListItem[]>([]);
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
        id="service-list-duration-dropdown"
        disabled={false}
        duration={duration.toString()}
        setDuration={setDuration}
        label="From:"
      />,
    );
    return elements;
  };

  const getServiceValidation = (
    name: string,
    namespace: string,
    validations: Validations,
  ): ObjectValidation | undefined => {
    const type = 'service'; // Using 'service' directly is disallowed

    if (
      validations[type] &&
      validations[type][validationKey(name, namespace)]
    ) {
      return validations[type][validationKey(name, namespace)];
    }

    return undefined;
  };

  const getServiceItem = (
    data: ServiceList,
    rateInterval: number,
  ): ServiceListItem[] => {
    if (data.services) {
      return data.services.map(service => ({
        name: service.name,
        istioSidecar: service.istioSidecar,
        istioAmbient: service.istioAmbient,
        namespace: service.namespace,
        cluster: service.cluster,
        health: ServiceHealth.fromJson(
          service.namespace,
          service.name,
          service.health,
          {
            rateInterval: rateInterval,
            hasSidecar: service.istioSidecar,
            hasAmbient: service.istioAmbient,
          },
        ),
        validation: getServiceValidation(
          service.name,
          service.namespace,
          data.validations,
        ),
        additionalDetailSample: service.additionalDetailSample,
        labels: service.labels ?? {},
        ports: service.ports ?? {},
        istioReferences: sortIstioReferences(service.istioReferences, true),
        kialiWizard: service.kialiWizard,
        serviceRegistry: service.serviceRegistry,
      }));
    }

    return [];
  };

  const fetchServices = async (
    clusters: string[],
    timeDuration: number,
  ): Promise<void> => {
    const health = 'true';
    const istioResources = 'true';
    const onlyDefinitions = 'false';
    return Promise.all(
      clusters.map(async cluster => {
        return await kialiClient.getClustersServices(
          activeNs.map(ns => ns).join(','),
          {
            rateInterval: `${String(timeDuration)}s`,
            health: health,
            istioResources: istioResources,
            onlyDefinitions: onlyDefinitions,
          },
          cluster,
        );
      }),
    )
      .then(results => {
        let serviceListItems: ServiceListItem[] = [];

        results.forEach(response => {
          serviceListItems = serviceListItems.concat(
            getServiceItem(response, duration),
          );
        });
        setServices(serviceListItems);
      })
      .catch(err =>
        kialiState.alertUtils?.add(
          `Could not fetch services: ${getErrorString(err)}`,
        ),
      );
  };

  const load = async () => {
    const serverConfig = await kialiClient.getServerConfig();

    const uniqueClusters = new Set<string>();
    Object.keys(serverConfig.clusters).forEach(cluster => {
      uniqueClusters.add(cluster);
    });
    kialiClient.getNamespaces().then(namespacesResponse => {
      const allNamespaces: NamespaceInfo[] = getNamespaces(
        namespacesResponse,
        namespaces,
      );
      const nsl = allNamespaces.filter(ns => activeNs.includes(ns.name));
      setNamespaces(nsl);
      fetchServices(Array.from(uniqueClusters), duration);
    });
    setTimeout(() => {
      setLoading(false);
    }, 400);
  };

  React.useEffect(() => {
    if (
      duration !== prevDuration.current ||
      !nsEqual(activeNs, prevActiveNs.current)
    ) {
      setLoading(true);
      load();
      prevDuration.current = duration;
      prevActiveNs.current = activeNs;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNs, duration]);

  const [{ loading }, refresh] = useAsyncFn(
    async () => {
      // Check if the config is loaded
      await load();
    },
    [],
    { loading: true },
  );
  useDebounce(refresh, 10);

  if (loading) {
    return <CircularProgress />;
  }

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
          rows={allServices}
          type="services"
          hiddenColumns={hiddenColumns}
          view={props.view}
          loading={loadingD}
        />
      </Content>
    </div>
  );
};
