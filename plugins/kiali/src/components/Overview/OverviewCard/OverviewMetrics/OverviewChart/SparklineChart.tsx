import * as React from 'react';

import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartLabel,
  ChartLegend,
  ChartProps,
  ChartScatter,
  ChartThreshold,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';

import {
  addLegendEvent,
  RichDataPoint,
  VCDataPoint,
  VCEvent,
  VCLines,
} from '@janus-idp/backstage-plugin-kiali-common';

import { CustomTooltip } from './CustomTooltip';

type Props = ChartProps & {
  labelName: string;
  name: string;
  series: VCLines<RichDataPoint>;
  showLegend?: boolean;
  showXAxisValues?: boolean;
  showYAxis?: boolean;
  tooltipFormat?: (dp: VCDataPoint) => string;
  thresholds?: VCLines<RichDataPoint>;
};

type State = {
  width: number;
  hiddenSeries: Set<number>;
};

export const INTERPOLATION_STRATEGY = 'monotoneX';

export class SparklineChart extends React.Component<Props, State> {
  containerRef?: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);
    if (props.width === undefined) {
      this.containerRef = React.createRef<HTMLDivElement>();
    }
    this.state = { width: props.width || 1, hiddenSeries: new Set() };
  }

  componentDidMount() {
    if (this.containerRef) {
      setTimeout(() => {
        this.handleResize();
        window.addEventListener('resize', this.handleResize);
      });
    }
  }

  componentWillUnmount() {
    if (this.containerRef) {
      window.removeEventListener('resize', this.handleResize);
    }
  }

  private handleResize = () => {
    if (this.containerRef?.current) {
      this.setState({ width: this.containerRef.current.clientWidth });
    }
  };

  private renderChart() {
    const legendHeight = 30;
    let height = this.props.height || 300;
    let padding = { top: 0, bottom: 0, left: 0, right: 0 };
    if (this.props.padding) {
      const p = this.props.padding as number;
      if (Number.isFinite(p)) {
        padding = { top: p, bottom: p, left: p, right: p };
      } else {
        padding = { ...padding, ...(this.props.padding as object) };
      }
    }
    const events: VCEvent[] = [];
    if (this.props.showLegend) {
      padding.bottom += legendHeight;
      height += legendHeight;
      this.props.series.forEach((_, idx) => {
        addLegendEvent(events, {
          legendName: `${this.props.name}-legend`,
          idx: idx,
          serieID: [`${this.props.name}-area-${idx}`],
          onClick: () => {
            if (!this.state.hiddenSeries.delete(idx)) {
              // Was not already hidden => add to set
              this.state.hiddenSeries.add(idx);
            }
            this.setState({ hiddenSeries: new Set(this.state.hiddenSeries) });
            return null;
          },
          onMouseOver: props => {
            return {
              style: { ...props.style, strokeWidth: 4, fillOpacity: 0.5 },
            };
          },
        });
      });
    }

    const container = (
      <ChartVoronoiContainer
        labels={obj =>
          this.props.tooltipFormat
            ? this.props.tooltipFormat(obj.datum)
            : obj.datum.y
        }
        labelComponent={<CustomTooltip />}
        voronoiBlacklist={this.props.series.map(
          (_, idx) => `${this.props.name}-scatter-${idx}`,
        )}
      />
    );
    const hiddenAxisStyle = {
      axis: { stroke: 'none' },
      ticks: { stroke: 'none' },
      tickLabels: { stroke: 'none', fill: 'none' },
    };

    return (
      <Chart
        {...this.props}
        height={height}
        width={this.state.width}
        padding={padding}
        events={events as any[]}
        containerComponent={container}
        // Hack: 1 pxl on Y domain padding to prevent harsh clipping (https://github.com/kiali/kiali/issues/2069)
        domainPadding={{ y: 1 }}
      >
        {this.props.showXAxisValues ? (
          <ChartAxis
            tickValues={this.props.series[0].datapoints.map(dp => dp.x)}
            tickFormat={x =>
              (x as Date).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            }
            tickCount={2}
          />
        ) : (
          <ChartAxis tickCount={15} style={hiddenAxisStyle} />
        )}
        {this.props.showYAxis ? (
          <ChartAxis
            label={this.props.labelName}
            axisLabelComponent={
              <ChartLabel y={-5} x={15} angle={0} renderInPortal />
            }
            tickCount={2}
            dependentAxis
          />
        ) : (
          <ChartAxis dependentAxis style={hiddenAxisStyle} />
        )}
        {this.props.series.map((serie, idx) => {
          if (this.state.hiddenSeries.has(idx)) {
            return undefined;
          }
          return (
            <ChartScatter
              name={`${this.props.name}-scatter-${idx}`}
              key={`${this.props.name}-scatter-${idx}`}
              data={serie.datapoints}
              style={{ data: { fill: serie.color } }}
              size={({ active }) => (active ? 5 : 2)}
            />
          );
        })}
        {this.props.series.map((serie, idx) => {
          if (this.state.hiddenSeries.has(idx)) {
            return undefined;
          }
          return (
            <ChartArea
              name={`${this.props.name}-area-${idx}`}
              key={`${this.props.name}-area-${idx}`}
              data={serie.datapoints}
              style={{
                data: {
                  fill: serie.color,
                  fillOpacity: 0.2,
                  stroke: serie.color,
                  strokeWidth: 2,
                },
              }}
              interpolation={INTERPOLATION_STRATEGY}
            />
          );
        })}
        {this.props.showLegend && (
          <ChartLegend
            name={`${this.props.name}-legend`}
            data={this.props.series.map((s, idx) => {
              if (this.state.hiddenSeries.has(idx)) {
                return { ...s.legendItem, symbol: { fill: '#72767b' } };
              }
              return s.legendItem;
            })}
            y={height - legendHeight}
            height={legendHeight}
            width={this.state.width}
          />
        )}

        {this.props.thresholds &&
          this.props.thresholds.map((serie, idx) => {
            if (this.state.hiddenSeries.has(idx)) {
              return undefined;
            }
            return (
              <ChartThreshold
                data={serie.datapoints}
                key={`Chart_${idx.toString}`}
                style={{
                  data: { stroke: serie.color },
                }}
              />
            );
          })}
      </Chart>
    );
  }

  render() {
    if (this.containerRef) {
      return <div ref={this.containerRef}>{this.renderChart()}</div>;
    }
    return this.renderChart();
  }
}
