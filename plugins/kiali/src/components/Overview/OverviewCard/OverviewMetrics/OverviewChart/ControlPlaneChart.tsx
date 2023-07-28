import React from 'react';

import { Card, CardContent, Grid, Tooltip } from '@material-ui/core';

import {
  ComputedServerConfig,
  Datapoint,
  getName,
  IstiodResourceThresholds,
  Metric,
  RichDataPoint,
  toLocaleStringWithConditionalDate,
  toVCLine,
  VCLine,
} from '@janus-idp/backstage-plugin-kiali-common';

import { createIcon, InfoIcon } from '../../../../Icons';
import { SparklineChart } from './SparklineChart';

import './Charts.css';

type ControlPlaneCharts = {
  pilotLatency?: Metric[];
  istiodMemory?: Metric[];
  istiodCpu?: Metric[];
  duration: number;
  istiodResourceThresholds?: IstiodResourceThresholds;
  config: ComputedServerConfig;
};

const showMetrics = (metrics: Metric[] | undefined): boolean => {
  // show metrics if metrics exists and some values at least are not zero
  if (
    metrics &&
    metrics.length > 0 &&
    metrics[0].datapoints.length > 0 &&
    metrics[0].datapoints.some(dp => Number(dp[1]) !== 0)
  ) {
    return true;
  }

  return false;
};

export const ControlPlaneChart = (props: ControlPlaneCharts) => {
  const memorySeries: VCLine<RichDataPoint>[] = [];
  const cpuSeries: VCLine<RichDataPoint>[] = [];
  const memoryThresholds: VCLine<RichDataPoint>[] = [];
  const cpuThresholds: VCLine<RichDataPoint>[] = [];
  if (showMetrics(props.istiodMemory)) {
    if (props.istiodMemory && props.istiodMemory?.length > 0) {
      const data = toVCLine(props.istiodMemory[0].datapoints, 'Mb', '#38812F');

      if (props.istiodResourceThresholds?.memory) {
        const datapoint0: Datapoint = [
          props.istiodMemory[0].datapoints[0][0],
          props.istiodMemory[0].datapoints[0][1],
        ];
        datapoint0[1] = props.istiodResourceThresholds?.memory;
        const datapointn: Datapoint = [
          props.istiodMemory[0].datapoints[
            props.istiodMemory[0].datapoints.length - 1
          ][0],
          props.istiodMemory[0].datapoints[
            props.istiodMemory[0].datapoints.length - 1
          ][0],
        ];
        datapointn[1] = props.istiodResourceThresholds?.memory;
        const dataThre = toVCLine(
          [datapoint0, datapointn],
          'Mb (Threshold)',
          '#4CB140',
        );
        memoryThresholds.push(dataThre);
      }

      memorySeries.push(data);
    }
  }

  if (showMetrics(props.istiodCpu)) {
    if (props.istiodCpu && props.istiodCpu?.length > 0) {
      const data = toVCLine(props.istiodCpu[0].datapoints, 'cores', '#38812F');

      if (props.istiodResourceThresholds?.cpu) {
        const datapoint0: Datapoint = [
          props.istiodCpu[0].datapoints[0][0],
          props.istiodCpu[0].datapoints[0][1],
        ];
        datapoint0[1] = props.istiodResourceThresholds?.cpu;
        const datapointn: Datapoint = [
          props.istiodCpu[0].datapoints[
            props.istiodCpu[0].datapoints.length - 1
          ][0],
          props.istiodCpu[0].datapoints[
            props.istiodCpu[0].datapoints.length - 1
          ][0],
        ];
        datapointn[1] = props.istiodResourceThresholds?.cpu;
        const dataThre = toVCLine([datapoint0, datapointn], 'cores', '#4CB140');
        cpuThresholds.push(dataThre);
      }

      cpuSeries.push(data);
    }
  }
  return (
    <div style={{ textAlign: 'center' }}>
      <div>
        <div
          style={{
            display: 'inline-block',
            width: '125px',
            whiteSpace: 'nowrap',
          }}
        >
          Control plane metrics
        </div>
      </div>
      <div
        style={{
          width: '100%',
          verticalAlign: 'top',
        }}
      >
        <Card style={{ height: '300px', border: 'none', boxShadow: 'none' }}>
          <CardContent>
            <Grid container style={{ paddingTop: 10 }}>
              {showMetrics(props.istiodMemory) && (
                <>
                  <Grid item xs={2} style={{ paddingTop: 40 }}>
                    <Grid container spacing={0}>
                      <Grid item xs={12}>
                        <b>Memory</b>
                      </Grid>
                      <Grid item xs={12}>
                        {getName(props.config, props.duration).toLowerCase()}
                        <Tooltip
                          placement="right"
                          title="This values represents the memory of the istiod process"
                        >
                          {createIcon(InfoIcon, { fontSize: 'small' })}
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={10}>
                    <SparklineChart
                      ariaTitle="Memory"
                      name="memory"
                      height={85}
                      showLegend={false}
                      showYAxis
                      padding={{ top: 25, left: 70, right: 60, bottom: 0 }}
                      tooltipFormat={dp =>
                        `${toLocaleStringWithConditionalDate(
                          dp.x as Date,
                        )}\n${dp.y.toFixed(2)} ${dp.name}`
                      }
                      series={memorySeries}
                      labelName="mb"
                      thresholds={memoryThresholds}
                    />
                  </Grid>
                </>
              )}
              {showMetrics(props.istiodCpu) && (
                <>
                  <Grid item xs={2} style={{ paddingTop: 40 }}>
                    <Grid container spacing={0}>
                      <Grid item xs={12}>
                        <b>CPU</b>
                      </Grid>
                      <Grid item xs={12}>
                        {getName(props.config, props.duration).toLowerCase()}
                        <Tooltip
                          placement="right"
                          title="This values represents cpu of the istiod process"
                        >
                          {createIcon(InfoIcon, { fontSize: 'small' })}
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={10} style={{ paddingTop: 30 }}>
                    <SparklineChart
                      name="cpu"
                      height={125}
                      showLegend={false}
                      showYAxis
                      showXAxisValues
                      padding={{ top: 50, left: 70, right: 60, bottom: 30 }}
                      tooltipFormat={dp =>
                        `${toLocaleStringWithConditionalDate(
                          dp.x as Date,
                        )}\n${dp.y.toFixed(2)} ${dp.name}`
                      }
                      series={cpuSeries}
                      labelName="cores"
                      thresholds={cpuThresholds}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
