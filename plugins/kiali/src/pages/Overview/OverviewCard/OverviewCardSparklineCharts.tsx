import * as React from 'react';

import { serverConfig } from '../../../config';
import { DurationInSeconds } from '../../../types/Common';
import { IstiodResourceThresholds } from '../../../types/IstioStatus';
import { ControlPlaneMetricsMap, Metric } from '../../../types/Metrics';
import { DirectionType } from '../OverviewToolbar';
import {
  isRemoteCluster,
  OverviewCardControlPlaneNamespace,
} from './OverviewCardControlPlaneNamespace';
import { OverviewCardDataPlaneNamespace } from './OverviewCardDataPlaneNamespace';

type Props = {
  name: string;
  annotations?: { [key: string]: string };
  duration: DurationInSeconds;
  direction: DirectionType;
  metrics?: Metric[];
  istioAPIEnabled: boolean;
  errorMetrics?: Metric[];
  controlPlaneMetrics?: ControlPlaneMetricsMap;
  istiodResourceThresholds?: IstiodResourceThresholds;
};

export const OverviewCardSparklineCharts = (props: Props) => {
  return (
    <>
      {props.name !== serverConfig.istioNamespace && (
        <OverviewCardDataPlaneNamespace
          metrics={props.metrics}
          errorMetrics={props.errorMetrics}
          duration={props.duration}
          direction={props.direction}
        />
      )}
      {props.name === serverConfig.istioNamespace &&
        props.istioAPIEnabled &&
        !isRemoteCluster(props.annotations) && (
          <OverviewCardControlPlaneNamespace
            pilotLatency={props.controlPlaneMetrics?.istiod_proxy_time}
            istiodContainerMemory={
              props.controlPlaneMetrics?.istiod_container_mem
            }
            istiodContainerCpu={props.controlPlaneMetrics?.istiod_container_cpu}
            istiodProcessMemory={props.controlPlaneMetrics?.istiod_process_mem}
            istiodProcessCpu={props.controlPlaneMetrics?.istiod_process_cpu}
            duration={props.duration}
            istiodResourceThresholds={props.istiodResourceThresholds}
          />
        )}
    </>
  );
};
