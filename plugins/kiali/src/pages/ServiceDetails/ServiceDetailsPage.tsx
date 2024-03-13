import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useAsyncFn, useDebounce } from 'react-use';

import {
  CardTab,
  Content,
  EmptyState,
  TabbedCard,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { CircularProgress } from '@material-ui/core';

import { HistoryManager } from '../../app/History';
import { BreadcrumbView } from '../../components/BreadcrumbView/BreadcrumbView';
import { DefaultSecondaryMasthead } from '../../components/DefaultSecondaryMasthead/DefaultSecondaryMasthead';
import * as FilterHelper from '../../components/FilterList/FilterHelper';
import { IstioMetrics } from '../../components/Metrics/IstioMetrics';
import { TimeDurationComponent } from '../../components/Time/TimeDurationComponent';
import { getErrorString, kialiApiRef } from '../../services/Api';
import { KialiContext } from '../../store';
import { KialiAppState } from '../../store/Store';
import { baseStyle } from '../../styles/StyleUtils';
import {
  Gateway,
  K8sGateway,
  PeerAuthentication,
  Validations,
} from '../../types/IstioObjects';
import { MetricsObjectTypes } from '../../types/Metrics';
import { ServiceDetailsInfo } from '../../types/ServiceInfo';
import { ServiceInfo } from './ServiceInfo';

export const ServiceDetailsPage = () => {
  const { namespace, service } = useParams();
  const kialiClient = useApi(kialiApiRef);
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const [serviceItem, setServiceItem] = React.useState<ServiceDetailsInfo>();
  const [duration, setDuration] = React.useState<number>(
    FilterHelper.currentDuration(),
  );
  const cluster = HistoryManager.getClusterName();
  const [validations, setValidations] = React.useState<Validations>();
  const [gateways, setGateways] = React.useState<Gateway[]>([]);
  const [k8sGateways, setK8sGateways] = React.useState<K8sGateway[]>([]);
  const [error, setError] = React.useState<string>();
  const [peerAuthentication, setPeerAuthentication] = React.useState<
    PeerAuthentication[]
  >([]);

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

  const fetchIstioObjects = async () => {
    kialiClient
      .getAllIstioConfigs(
        [namespace ? namespace : ''],
        ['gateways', 'k8sgateways', 'peerauthentications'],
        false,
        '',
        '',
        cluster,
      )
      .then(response => {
        const gws: Gateway[] = [];
        const k8sGws: K8sGateway[] = [];
        const peer: PeerAuthentication[] = [];
        Object.values(response.data).forEach(item => {
          gws.push(...item.gateways);
          k8sGws.push(...item.k8sGateways);
          peer.push(...item.peerAuthentication);
        });
        setGateways(gws);
        setK8sGateways(k8sGws);
        setPeerAuthentication(peer);
      })
      .catch(gwError => {
        kialiState.alertUtils!.add(
          `Could not fetch Gateways list: ${getErrorString(gwError)}`,
        );
      });
  };

  const fetchService = async () => {
    if (!namespace || !service) {
      setError(`Could not fetch service: Empty namespace or service name`);
      kialiState.alertUtils?.add(
        `Could not fetch service: Empty namespace or service name`,
      );
      return;
    }

    kialiClient
      .getServiceDetail(
        namespace ? namespace : '',
        service ? service : '',
        true,
        cluster,
        duration,
      )
      .then((serviceResponse: ServiceDetailsInfo) => {
        setServiceItem(serviceResponse);
        setValidations(serviceResponse.validations);
        fetchIstioObjects();
      })
      .catch(err => {
        setError(`Could not fetch service: ${getErrorString(err)}`);
        kialiState.alertUtils!.add(
          `Could not fetch service: ${getErrorString(err)}`,
        );
      });
  };

  const [{ loading }, refresh] = useAsyncFn(
    async () => {
      // Check if the config is loaded
      await fetchService();
    },
    [],
    { loading: true },
  );
  useDebounce(refresh, 10);

  if (loading) {
    return <CircularProgress />;
  }

  const overviewTab = (): React.ReactElement => {
    return (
      <>
        {serviceItem && (
          <ServiceInfo
            service={service ? service : ''}
            duration={duration}
            namespace={namespace ? namespace : ''}
            validations={validations ? validations : {}}
            cluster={cluster}
            serviceDetails={serviceItem}
            gateways={gateways}
            k8sGateways={k8sGateways}
            peerAuthentications={peerAuthentication}
            istioAPIEnabled
          />
        )}
      </>
    );
  };

  const inboundTab = (): React.ReactElement => {
    return (
      <>
        {namespace && service && (
          <IstioMetrics
            data-test="inbound-metrics-component"
            lastRefreshAt={duration}
            namespace={namespace}
            object={service}
            cluster={serviceItem?.cluster}
            objectType={MetricsObjectTypes.SERVICE}
            direction="inbound"
          />
        )}
      </>
    );
  };

  const outboundTab = (): React.ReactElement => {
    return (
      <>
        {namespace && service && (
          <IstioMetrics
            data-test="outbound-metrics-component"
            lastRefreshAt={duration}
            namespace={namespace}
            object={service}
            cluster={serviceItem?.cluster}
            objectType={MetricsObjectTypes.SERVICE}
            direction="outbound"
          />
        )}
      </>
    );
  };

  return (
    <div className={baseStyle}>
      <Content>
        <BreadcrumbView />
        <DefaultSecondaryMasthead
          elements={grids()}
          onRefresh={() => fetchService()}
        />
        {error !== undefined && (
          <EmptyState
            missing="content"
            title="Service details"
            description={<div>No Service found </div>}
          />
        )}
        <div style={{ marginTop: '20px' }}>
          <TabbedCard>
            <CardTab label="Overview">{overviewTab()}</CardTab>
            <CardTab label="Inbound Metrics">{inboundTab()}</CardTab>
            <CardTab label="Outbound Metrics">{outboundTab()}</CardTab>
          </TabbedCard>
        </div>
      </Content>
    </div>
  );
};
