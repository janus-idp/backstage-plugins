import React from 'react';

import { Grid, Tooltip } from '@material-ui/core';

import {
  CanaryUpgradeStatus,
  ComponentStatus,
  IstiodResourceThresholds,
  KialiConfigT,
  NamespaceInfo,
  OutboundTrafficPolicy,
  OverviewType,
} from '@janus-idp/backstage-plugin-kiali-common';

import { DirectionTypeOptions } from '../OverviewCard';
import { ControlPlaneNamespaceStatus } from './ControlPlaneNamespaceStatus';
import { IstioConfigStatus } from './IstioConfigStatus';
import { NamespaceMTLSStatus } from './NamespaceMTLSStatus';
import { NamespaceStatuses } from './NamespaceStatuses';
import { TLSInfo } from './TLSInfo';

type OverviewCardBodyProps = {
  canaryStatus?: CanaryUpgradeStatus;
  canaryUpgrade?: boolean;
  direction: DirectionTypeOptions;
  duration: number;
  ns: NamespaceInfo;
  outboundTrafficPolicy: OutboundTrafficPolicy;
  istioAPIEnabled?: boolean;
  istiodResourceThresholds?: IstiodResourceThresholds;
  istioStatus?: ComponentStatus[];
  kialiConfig: KialiConfigT;
  type: OverviewType;
};

const render_labels = (labels: { [key: string]: string } | undefined) => {
  const labelsLength = labels ? `${Object.entries(labels).length}` : 'No';
  const labelContent = labels ? (
    <Tooltip
      placement="right"
      title={
        <ul style={{ listStyle: 'none' }}>
          {Object.entries(labels || []).map(([key, value]) => (
            <li key={key}>
              {key}={value}
            </li>
          ))}
        </ul>
      }
    >
      <div
        id="labels_info"
        style={{ display: 'inline', cursor: 'pointer', color: '#06c' }}
      >
        {labelsLength} label{labelsLength !== '1' ? 's' : ''}
      </div>
    </Tooltip>
  ) : (
    <div style={{ textAlign: 'left' }}>No labels</div>
  );

  return labelContent;
};

export const OverviewCardBody = (props: OverviewCardBodyProps) => {
  const isIstioNs = props.kialiConfig.server.istioNamespace === props.ns.name;
  return (
    <Grid container spacing={0} direction="column">
      <Grid item md={props.istioAPIEnabled || props.canaryUpgrade ? 6 : 12}>
        {render_labels(props.ns.labels)}
        <div style={{ textAlign: 'left' }}>
          <div style={{ display: 'inline-block', width: '125px' }}>
            Istio config
          </div>
          {props.ns.tlsStatus && (
            <span>
              <NamespaceMTLSStatus status={props.ns.tlsStatus.status} />
            </span>
          )}
          {props.istioAPIEnabled && (
            <IstioConfigStatus
              ns={props.ns}
              kialiConsole={props.kialiConfig.kialiConsole}
            />
          )}
        </div>
        {props.ns.status && (
          <NamespaceStatuses ns={props.ns} type={props.type} />
        )}
        {isIstioNs && (
          <>
            <ControlPlaneNamespaceStatus
              outboundTrafficPolicy={props.outboundTrafficPolicy}
              namespace={props.ns}
            />
            <TLSInfo
              certificatesInformationIndicators={
                props.kialiConfig.server.kialiFeatureFlags
                  .certificatesInformationIndicators.enabled
              }
              version={props.kialiConfig.meshTLSStatus?.minTLS}
              certsInfo={props.kialiConfig.istioCerts}
            />
          </>
        )}
      </Grid>
    </Grid>
  );
};
