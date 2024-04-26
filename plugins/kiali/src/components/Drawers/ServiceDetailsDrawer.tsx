import * as React from 'react';
import { useAsyncFn, useDebounce } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';

import { CircularProgress } from '@material-ui/core';

import { HistoryManager } from '../../app/History';
import { ServiceInfo } from '../../pages/ServiceDetails/ServiceInfo';
import { kialiApiRef } from '../../services/Api';
import {
  Gateway,
  K8sGateway,
  PeerAuthentication,
  Validations,
} from '../../types/IstioObjects';
import { ServiceDetailsInfo } from '../../types/ServiceInfo';
import { ENTITY } from '../../types/types';

type Props = {
  namespace: string;
  service: string;
};
export const ServiceDetailsDrawer = (props: Props) => {
  const kialiClient = useApi(kialiApiRef);
  const [serviceItem, setServiceItem] = React.useState<ServiceDetailsInfo>();
  const cluster = HistoryManager.getClusterName();
  const [validations, setValidations] = React.useState<Validations>();
  const [gateways, setGateways] = React.useState<Gateway[]>([]);
  const [k8sGateways, setK8sGateways] = React.useState<K8sGateway[]>([]);
  const [peerAuthentication, setPeerAuthentication] = React.useState<
    PeerAuthentication[]
  >([]);

  const fetchIstioObjects = async () => {
    kialiClient
      .getAllIstioConfigs(
        [props.namespace],
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
        // eslint-disable-next-line no-console
        console.error(gwError);
      });
  };

  const fetchService = async () => {
    kialiClient
      .getServiceDetail(props.namespace, props.service, true, cluster, 60)
      .then((serviceResponse: ServiceDetailsInfo) => {
        setServiceItem(serviceResponse);
        setValidations(serviceResponse.validations);
        fetchIstioObjects();
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log(err);
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

  return (
    <>
      {serviceItem && (
        <ServiceInfo
          service={props.service}
          duration={60}
          namespace={props.namespace}
          validations={validations ? validations : {}}
          cluster={cluster}
          serviceDetails={serviceItem}
          gateways={gateways}
          k8sGateways={k8sGateways}
          peerAuthentications={peerAuthentication}
          istioAPIEnabled
          view={ENTITY}
        />
      )}
    </>
  );
};
