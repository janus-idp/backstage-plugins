import * as React from 'react';

import { Chip, Tooltip } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';

import { KialiIcon } from '../../../config/KialiIcon';
import { getChipStyle } from '../../../styles/StyleUtils';
import { OutboundTrafficPolicy } from '../../../types/IstioObjects';
import { NamespaceInfo } from '../NamespaceInfo';
import { infoStyle } from './OverviewCardControlPlaneNamespace';

type Props = {
  namespace: NamespaceInfo;
  outboundTrafficPolicy?: OutboundTrafficPolicy;
};

export const ControlPlaneNamespaceStatus = (props: Props) => {
  const theme = useTheme();
  const chipStyle = getChipStyle(theme);

  let maxProxyPushTime: number | undefined = undefined;
  if (
    props.namespace.controlPlaneMetrics &&
    props.namespace.controlPlaneMetrics.istiod_proxy_time
  ) {
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
            placement="right"
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
          >
            <Chip
              size="small"
              style={chipStyle}
              label={
                <>
                  {props.outboundTrafficPolicy.mode}
                  <KialiIcon.Info className={infoStyle} />
                </>
              }
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
              size="small"
              color="primary"
              variant="outlined"
              label={
                <>
                  {maxProxyPushTime?.toFixed(2)} ms
                  <KialiIcon.Info className={infoStyle} />
                </>
              }
            />
          </Tooltip>
        </div>
      )}
    </div>
  );
};
