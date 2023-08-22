import React from 'react';

import {
  ComputedServerConfig,
  DirectionType,
  getName,
  Metric,
  RichDataPoint,
  toLocaleStringWithConditionalDate,
  toVCLine,
  VCLine,
} from '@janus-idp/backstage-plugin-kiali-common';

import { SparklineChart } from './SparklineChart';

import './Charts.css';

type DataPlaneChartProps = {
  metrics?: Metric[];
  errorMetrics?: Metric[];
  duration: number;
  direction: DirectionType;
  config: ComputedServerConfig;
  width?: string;
};

const showMetrics = (metrics: Metric[] | undefined): boolean => {
  // show metrics if metrics exists and some values at least are not zero
  if (
    metrics &&
    metrics.length > 0 &&
    metrics[0].datapoints.some(dp => Number(dp[1]) !== 0)
  ) {
    return true;
  }

  return false;
};

export const DataPlaneChart = (props: DataPlaneChartProps) => {
  const series: VCLine<RichDataPoint>[] = [];

  if (showMetrics(props.metrics)) {
    if (props.metrics && props.metrics.length > 0) {
      const data = toVCLine(props.metrics[0].datapoints, 'ops (Total)', '#06c');
      series.push(data);
    }

    if (props.errorMetrics && props.errorMetrics.length > 0) {
      const dataErrors = toVCLine(
        props.errorMetrics[0].datapoints,
        'ops (4xx+5xx)',
        '#c9190b',
      );
      series.push(dataErrors);
    }
  }
  return (
    <div
      style={{
        width: '100%',
        height: 150,
        verticalAlign: 'top',
        marginBottom: '10px',
      }}
    >
      {series.length > 0 && (
        <>
          <div
            style={{ paddingBottom: 20 }}
            data-test={`sparkline-${props.direction.toLowerCase()}-duration-${getName(
              props.config,
              props.duration,
            ).toLowerCase()}`}
          >
            {`${props.direction} traffic, ${getName(
              props.config,
              props.duration,
            ).toLowerCase()}`}
          </div>
          <SparklineChart
            name="traffics"
            height={135}
            showLegend={false}
            showYAxis
            showXAxisValues
            padding={{ top: 50, left: 70, right: 70, bottom: 30 }}
            tooltipFormat={(dp: any) =>
              `${toLocaleStringWithConditionalDate(
                dp.x as Date,
              )}\n${dp.y.toFixed(2)} ${dp.name}`
            }
            series={series}
            labelName="ops"
          />
        </>
      )}
      {series.length === 0 && (
        <div style={{ paddingTop: '40px' }}>
          No {props.direction.toLowerCase()} traffic
        </div>
      )}
    </div>
  );
};
