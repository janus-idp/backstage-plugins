import React from 'react';

import { Chip, Tooltip } from '@material-ui/core';
import InfoOutlined from '@material-ui/icons/InfoOutlined';

import {
  NamespaceInfo,
  OutboundTrafficPolicy,
} from '@janus-idp/backstage-plugin-kiali-common';

type ControlPlaneNamespaceStatusProps = {
  namespace: NamespaceInfo;
  outboundTrafficPolicy?: OutboundTrafficPolicy;
};

const getContentLabel = (mode?: string) => {
  return (
    <div>
      {mode} <InfoOutlined style={{ fontSize: 20, color: '#2b9af3' }} />
    </div>
  );
};
export const ControlPlaneNamespaceStatus = (
  props: ControlPlaneNamespaceStatusProps,
) => {
  let maxProxyPushTime: number | undefined = undefined;
  if (props.namespace.controlPlaneMetrics?.istiod_proxy_time) {
    maxProxyPushTime =
      props.namespace.controlPlaneMetrics?.istiod_proxy_time[0].datapoints.reduce(
        (a, b) => (a[1] < b[1] ? a : b),
      )[1] * 1000;
  }
  let showProxyPushTime = false;
  if (maxProxyPushTime && !isNaN(maxProxyPushTime)) {
    showProxyPushTime = true;
  }

  return (
    <div style={{ textAlign: 'left' }}>
      {props.outboundTrafficPolicy && (
        <div>
          <div
            style={{
              display: 'inline-block',
              width: '125px',
              whiteSpace: 'nowrap',
            }}
          >
            Outbound policy
          </div>
          <Tooltip
            title={
              <div style={{ textAlign: 'left' }}>
                This value represents the meshConfig.outboundTrafficPolicy.mode,
                that configures the sidecar handling of external services, that
                is, those services that are not defined in Istio’s internal
                service registry. If this option is set to ALLOW_ANY, the Istio
                proxy lets calls to unknown services pass through. If the option
                is set to REGISTRY_ONLY, then the Istio proxy blocks any host
                without an HTTP service or service entry defined within the mesh
              </div>
            }
            placement="right"
          >
            <Chip
              label={getContentLabel(props.outboundTrafficPolicy.mode)}
              style={{ color: '#002952', backgroundColor: '#e7f1fa' }}
              size="small"
            />
          </Tooltip>
        </div>
      )}
      {showProxyPushTime && (
        <div>
          <div
            style={{
              display: 'inline-block',
              width: '125px',
              whiteSpace: 'nowrap',
            }}
          >
            Proxy push time
          </div>
          <Tooltip
            placement="right"
            title={
              <div style={{ textAlign: 'left' }}>
                This value represents the delay in seconds between config change
                and a proxy receiving all required configuration.
              </div>
            }
          >
            <Chip
              label={`${maxProxyPushTime?.toFixed(2)} ms`}
              icon={<InfoOutlined />}
              style={{ color: '#002952', backgroundColor: '#e7f1fa' }}
            />
          </Tooltip>
        </div>
      )}
    </div>
  );
};
