import * as React from 'react';

import { SparklineChart } from '../../../components/Charts/SparklineChart';
import { PFColors } from '../../../components/Pf/PfColors';
import { DurationInSeconds } from '../../../types/Common';
import { Metric } from '../../../types/Metrics';
import { RichDataPoint, VCLine } from '../../../types/VictoryChartInfo';
import { toLocaleStringWithConditionalDate } from '../../../utils/Date';
import { getName } from '../../../utils/RateIntervals';
import { toVCLine } from '../../../utils/VictoryChartsUtils';
import { DirectionType } from '../OverviewToolbar';

type Props = {
  metrics?: Metric[];
  errorMetrics?: Metric[];
  duration: DurationInSeconds;
  direction: DirectionType;
};

function showMetrics(metrics: Metric[] | undefined): boolean {
  // show metrics if metrics exists and some values at least are not zero
  if (
    metrics &&
    metrics.length > 0 &&
    metrics[0].datapoints.some(dp => Number(dp[1]) !== 0)
  ) {
    return true;
  }

  return false;
}

export class OverviewCardDataPlaneNamespace extends React.Component<Props, {}> {
  render() {
    const series: VCLine<RichDataPoint>[] = [];

    if (showMetrics(this.props.metrics)) {
      if (this.props.metrics && this.props.metrics.length > 0) {
        const data = toVCLine(
          this.props.metrics[0].datapoints,
          'ops (Total)',
          PFColors.Info,
        );
        series.push(data);
      }

      if (this.props.errorMetrics && this.props.errorMetrics.length > 0) {
        const dataErrors = toVCLine(
          this.props.errorMetrics[0].datapoints,
          'ops (4xx+5xx)',
          PFColors.Danger,
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
        }}
      >
        <div>
          <></>
        </div>
        {series.length > 0 && (
          <>
            <div
              style={{ paddingTop: 10, textAlign: 'center' }}
              data-test={`sparkline-${this.props.direction.toLowerCase()}-duration-${getName(
                this.props.duration,
              ).toLowerCase()}`}
            >
              {`${this.props.direction} traffic, ${getName(
                this.props.duration,
              ).toLowerCase()}`}
            </div>
            <SparklineChart
              name="traffics"
              height={150}
              showLegend={false}
              showYAxis
              showXAxisValues
              padding={{ top: 60, left: 40, right: 40, bottom: 30 }}
              tooltipFormat={dp =>
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
          <div style={{ paddingTop: '40px', textAlign: 'center' }}>
            No {this.props.direction.toLowerCase()} traffic
          </div>
        )}
      </div>
    );
  }
}
