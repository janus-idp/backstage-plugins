import { chart_color_black_400 as skippedColor } from '@patternfly/react-tokens/dist/js/chart_color_black_400';
import { chart_color_black_500 as cancelledColor } from '@patternfly/react-tokens/dist/js/chart_color_black_500';
import { chart_color_blue_100 as pendingColor } from '@patternfly/react-tokens/dist/js/chart_color_blue_100';
import { chart_color_blue_300 as runningColor } from '@patternfly/react-tokens/dist/js/chart_color_blue_300';
import { chart_color_green_400 as successColor } from '@patternfly/react-tokens/dist/js/chart_color_green_400';
import { global_danger_color_100 as failureColor } from '@patternfly/react-tokens/dist/js/global_danger_color_100';

import { ComputedStatus, StatusMessage } from '../types/computedStatus';

export const getRunStatusColor = (status: string): StatusMessage => {
  switch (status) {
    case ComputedStatus.Succeeded:
      return { message: 'Succeeded', pftoken: successColor };
    case ComputedStatus.Failed:
      return { message: 'Failed', pftoken: failureColor };
    case ComputedStatus.FailedToStart:
      return {
        message: 'PipelineRun failed to start',
        pftoken: failureColor,
      };
    case ComputedStatus.Running:
    case ComputedStatus['In Progress']:
      return { message: 'Running', pftoken: runningColor };

    case ComputedStatus.Skipped:
      return { message: 'Skipped', pftoken: skippedColor };
    case ComputedStatus.Cancelled:
      return { message: 'Cancelled', pftoken: cancelledColor };
    case ComputedStatus.Cancelling:
      return { message: 'Cancelling', pftoken: cancelledColor };
    case ComputedStatus.Idle:
    case ComputedStatus.Pending:
      return { message: 'Pending', pftoken: pendingColor };
    default:
      return {
        message: 'PipelineRun not started yet',
        pftoken: pendingColor,
      };
  }
};
