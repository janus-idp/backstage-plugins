import * as React from 'react';

import {
  ChartCursorFlyout,
  ChartLabel,
  ChartPoint,
} from '@patternfly/react-charts';

import {
  toLocaleStringWithConditionalDate,
  VCDataPoint,
} from '@janus-idp/backstage-plugin-kiali-common';

import { HookedChartTooltip, HookedTooltipProps } from './HookedChartTooltip';

const dy = 15;
const headSizeDefault = 2 * dy;
const yMargin = 8;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const canvasContext: any = document.createElement('canvas').getContext('2d');
canvasContext.font = '14px overpass';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomLabel = (props: any) => {
  const x = props.x - 11 - props.textWidth / 2;
  const textsWithHead = props.head
    ? [props.head, ' '].concat(props.text)
    : props.text;
  const headSize = props.head ? headSizeDefault : 0;
  const startY = yMargin + props.y - (textsWithHead.length * dy) / 2 + headSize;

  return (
    <>
      {props.activePoints
        ?.filter((pt: any) => pt.color && !pt.hideLabel)
        .map((pt: any, idx: number) => {
          const symbol = pt.symbol || 'square';
          return (
            <ChartPoint
              key={`item-${pt.color}-${pt.hideLabel}`}
              style={{ fill: pt.color, type: symbol }}
              x={x}
              y={startY + dy * idx}
              symbol={symbol}
              size={5.5}
            />
          );
        })}
      <ChartLabel {...props} text={textsWithHead} />
    </>
  );
};

const getHeader = (activePoints?: VCDataPoint[]): string | undefined => {
  if (activePoints && activePoints.length > 0) {
    const x = activePoints[0].x;
    if (typeof x === 'object') {
      // Assume date
      return toLocaleStringWithConditionalDate(x);
    }
  }
  return undefined;
};

type Props = HookedTooltipProps<{}> & {
  showTime?: boolean;
};

type State = {
  texts: string[];
  head?: string;
  textWidth: number;
  width: number;
  height: number;
};

export class CustomTooltip extends React.Component<Props, State> {
  static getDerivedStateFromProps(props: Props): State {
    const head = props.showTime ? getHeader(props.activePoints) : undefined;
    const texts: string[] = [];
    if (props.text) {
      if (Array.isArray(props.text)) {
        texts.push(...(props.text as string[]));
      } else {
        texts.push(props.text as string);
      }
    }
    let height = texts.length * dy + 2 * yMargin;
    if (head) {
      height += headSizeDefault;
    }
    const textWidth = Math.max(
      ...texts.map(t => canvasContext.measureText(t).width),
    );
    const width =
      50 +
      (head
        ? Math.max(textWidth, canvasContext.measureText(head).width)
        : textWidth);
    return {
      head: head,
      texts: texts,
      textWidth: textWidth,
      width: width,
      height: height,
    };
  }

  constructor(p: Props) {
    super(p);
    this.state = CustomTooltip.getDerivedStateFromProps(p);
  }

  render() {
    return (
      <HookedChartTooltip
        {...this.props}
        text={this.state.texts}
        flyoutWidth={this.state.width}
        flyoutHeight={this.state.height}
        flyoutComponent={
          <ChartCursorFlyout style={{ stroke: 'none', fillOpacity: 0.6 }} />
        }
        labelComponent={
          <CustomLabel
            head={this.state.head}
            textWidth={this.state.textWidth}
          />
        }
      />
    );
  }
}
