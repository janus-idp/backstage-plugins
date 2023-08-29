import React from 'react';

import { Grid } from '@material-ui/core';

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
import { CanaryUpgradeProgress } from './CanaryUpgradeProgress';
import { OverviewChart } from './OverviewChart';

type OverviewMetricsProps = {
  canaryStatus?: CanaryUpgradeStatus;
  canaryUpgrade?: boolean;
  direction: DirectionTypeOptions;
  duration: number;
  ns: NamespaceInfo;
  outboundTrafficPolicy: OutboundTrafficPolicy;
  isIstioNs?: boolean;
  istioAPIEnabled?: boolean;
  istiodResourceThresholds?: IstiodResourceThresholds;
  istioStatus?: ComponentStatus[];
  kialiConfig: KialiConfigT;
  type: OverviewType;
};

export const OverviewMetrics = (props: OverviewMetricsProps) => {
  return (
    <Grid container>
      {props.isIstioNs && props.istioAPIEnabled ? (
        <Grid item md={12}>
          <Grid container>
            {props.canaryUpgrade && props.canaryStatus && (
              <Grid item md={props.istioAPIEnabled ? 4 : 9}>
                <CanaryUpgradeProgress
                  canaryUpgradeStatus={props.canaryStatus}
                />
              </Grid>
            )}
            <Grid item md={props.canaryUpgrade ? 8 : 12}>
              <OverviewChart
                metrics={props.ns.metrics}
                errorMetrics={props.ns.errorMetrics}
                duration={props.duration}
                direction={props.direction}
                config={props.kialiConfig.server}
                isIstioNamespace={props.isIstioNs}
                istioAPIEnabled
                controlPlaneMetrics={props.ns.controlPlaneMetrics}
                istiodResourceThresholds={props.istiodResourceThresholds}
              />
            </Grid>
          </Grid>
        </Grid>
      ) : (
        <Grid item md={12}>
          <OverviewChart
            metrics={props.ns.metrics}
            errorMetrics={props.ns.errorMetrics}
            duration={props.duration}
            direction={props.direction}
            config={props.kialiConfig.server}
            isIstioNamespace={props.isIstioNs}
            istioAPIEnabled
          />
        </Grid>
      )}
    </Grid>
  );
};
