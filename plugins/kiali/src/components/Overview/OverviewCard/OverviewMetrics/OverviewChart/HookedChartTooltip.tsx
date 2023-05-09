import * as React from 'react';

import { ChartTooltip, ChartTooltipProps } from '@patternfly/react-charts';

import { VCDataPoint } from '@janus-idp/backstage-plugin-kiali-common';

export type HookedTooltipProps<T> = ChartTooltipProps & {
  activePoints?: (VCDataPoint & T)[];
  onOpen?: (items: VCDataPoint[]) => void;
  onClose?: () => void;
};

export class HookedChartTooltip<T> extends React.Component<
  HookedTooltipProps<T>
> {
  componentDidMount() {
    if (this.props.onOpen && this.props.activePoints) {
      this.props.onOpen(this.props.activePoints);
    }
  }

  componentWillUnmount() {
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  render() {
    return <ChartTooltip {...this.props} />;
  }
}
