import React from 'react';

import {
  ComputedServerConfig,
  ControlPlaneMetricsMap,
  DirectionType,
  DurationInSeconds,
  IstiodResourceThresholds,
  Metric,
} from '@janus-idp/backstage-plugin-kiali-common';

import { ControlPlaneChart } from './ControlPlaneChart';
import { DataPlaneChart } from './DataPlaneChart';

type OverviewChartProps = {
  metrics?: Metric[];
  errorMetrics?: Metric[];
  controlPlaneMetrics?: ControlPlaneMetricsMap;
  istiodResourceThresholds?: IstiodResourceThresholds;
  duration: DurationInSeconds;
  direction: DirectionType;
  config: ComputedServerConfig;
  isIstioNamespace?: boolean;
  istioAPIEnabled?: boolean;
};

export const OverviewChart = (props: OverviewChartProps) => {
  return (
    <>
      {(!props.isIstioNamespace || !props.istioAPIEnabled) && (
        <DataPlaneChart {...props} />
      )}
      {props.isIstioNamespace && props.istioAPIEnabled && (
        <ControlPlaneChart
          pilotLatency={props.controlPlaneMetrics?.istiod_proxy_time}
          istiodMemory={props.controlPlaneMetrics?.istiod_mem}
          istiodCpu={props.controlPlaneMetrics?.istiod_cpu}
          duration={props.duration}
          istiodResourceThresholds={props.istiodResourceThresholds}
          config={props.config}
        />
      )}
    </>
  );
};
