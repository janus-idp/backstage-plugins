import React from 'react';

import { Grid } from '@material-ui/core';

import { IstioConfigCard } from '../../components/IstioConfigCard/IstioConfigCard';
import { DurationInSeconds } from '../../types/Common';
import {
  drToIstioItems,
  gwToIstioItems,
  k8sGwToIstioItems,
  k8sHTTPRouteToIstioItems,
  seToIstioItems,
  validationKey,
  vsToIstioItems,
} from '../../types/IstioConfigList';
import {
  Gateway,
  K8sGateway,
  ObjectValidation,
  PeerAuthentication,
  Validations,
} from '../../types/IstioObjects';
import { ServiceId } from '../../types/ServiceId';
import { ServiceDetailsInfo } from '../../types/ServiceInfo';
import { ENTITY } from '../../types/types';
import { ServiceDescription } from './ServiceDescription';
import { ServiceNetwork } from './ServiceNetwork';

interface Props extends ServiceId {
  cluster?: string;
  duration: DurationInSeconds;
  serviceDetails?: ServiceDetailsInfo;
  gateways: Gateway[];
  k8sGateways: K8sGateway[];
  peerAuthentications: PeerAuthentication[];
  validations: Validations;
  istioAPIEnabled: boolean;
  view?: string;
}

export const ServiceInfo = (serviceProps: Props) => {
  const getServiceValidation = (): ObjectValidation | undefined => {
    if (
      serviceProps.validations &&
      serviceProps.validations.service &&
      serviceProps.serviceDetails
    ) {
      return serviceProps.validations.service[
        validationKey(
          serviceProps.serviceDetails.service.name,
          serviceProps.namespace,
        )
      ];
    }
    return undefined;
  };

  const vsIstioConfigItems = serviceProps.serviceDetails?.virtualServices
    ? vsToIstioItems(
        serviceProps.serviceDetails.virtualServices,
        serviceProps.serviceDetails.validations,
        serviceProps.cluster,
      )
    : [];
  const drIstioConfigItems = serviceProps.serviceDetails?.destinationRules
    ? drToIstioItems(
        serviceProps.serviceDetails.destinationRules,
        serviceProps.serviceDetails.validations,
        serviceProps.cluster,
      )
    : [];
  const gwIstioConfigItems =
    serviceProps?.gateways && serviceProps.serviceDetails?.virtualServices
      ? gwToIstioItems(
          serviceProps?.gateways,
          serviceProps.serviceDetails.virtualServices,
          serviceProps.serviceDetails.validations,
          serviceProps.cluster,
        )
      : [];
  const k8sGwIstioConfigItems =
    serviceProps?.k8sGateways && serviceProps.serviceDetails?.k8sHTTPRoutes
      ? k8sGwToIstioItems(
          serviceProps?.k8sGateways,
          serviceProps.serviceDetails.k8sHTTPRoutes,
          serviceProps.serviceDetails.validations,
          serviceProps.cluster,
        )
      : [];
  const seIstioConfigItems = serviceProps.serviceDetails?.serviceEntries
    ? seToIstioItems(
        serviceProps.serviceDetails.serviceEntries,
        serviceProps.serviceDetails.validations,
        serviceProps.cluster,
      )
    : [];
  const k8sHTTPRouteIstioConfigItems = serviceProps.serviceDetails
    ?.k8sHTTPRoutes
    ? k8sHTTPRouteToIstioItems(
        serviceProps.serviceDetails.k8sHTTPRoutes,
        serviceProps.serviceDetails.validations,
        serviceProps.cluster,
      )
    : [];
  const istioConfigItems = seIstioConfigItems.concat(
    gwIstioConfigItems.concat(
      k8sGwIstioConfigItems.concat(
        vsIstioConfigItems.concat(
          drIstioConfigItems.concat(k8sHTTPRouteIstioConfigItems),
        ),
      ),
    ),
  );

  const size = serviceProps.view === ENTITY ? 12 : 4;
  return (
    <>
      {serviceProps.serviceDetails && (
        <Grid container spacing={1} style={{ paddingTop: '20px' }}>
          <Grid key={`Card_${serviceProps.service}`} item xs={size}>
            <ServiceDescription
              namespace={serviceProps.namespace}
              serviceDetails={serviceProps.serviceDetails}
            />
          </Grid>
          {serviceProps.view !== ENTITY && (
            <>
              <Grid key={`Card_${serviceProps.service}`} item xs={4}>
                <ServiceNetwork
                  serviceDetails={serviceProps.serviceDetails}
                  gateways={serviceProps.gateways}
                  validations={getServiceValidation()}
                />
              </Grid>
              <Grid key={`Card_${serviceProps.service}`} item xs={4}>
                <IstioConfigCard
                  name={serviceProps.service}
                  items={istioConfigItems}
                />
              </Grid>
            </>
          )}
        </Grid>
      )}
    </>
  );
};
