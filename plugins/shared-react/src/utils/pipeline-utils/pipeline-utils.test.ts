import { ComputedStatus } from '../../types';
import { getRunStatusColor } from './pipeline-utils';

describe('getRunStatusColor should handle ComputedStatus values', () => {
  it('should expect all but PipelineNotStarted to produce a non-default result', () => {
    // Verify that we cover colour states for all the ComputedStatus values
    const failCase = 'PipelineNotStarted';
    const defaultCase = getRunStatusColor(ComputedStatus[failCase]);
    const allOtherStatuses = Object.keys(ComputedStatus)
      .filter(
        status =>
          status !== failCase &&
          ComputedStatus[status as keyof typeof ComputedStatus] !==
            ComputedStatus.Other,
      )
      .map(status => ComputedStatus[status as keyof typeof ComputedStatus]);

    expect(allOtherStatuses).not.toHaveLength(0);
    allOtherStatuses.forEach(statusValue => {
      const { message } = getRunStatusColor(statusValue);

      expect(defaultCase.message).not.toEqual(message);
    });
  });

  it('should expect all status colors to return visible text to show as a descriptor of the color', () => {
    let status = getRunStatusColor(ComputedStatus.Succeeded);
    expect(status.message).toBe('Succeeded');
    status = getRunStatusColor(ComputedStatus.FailedToStart);
    expect(status.message).toBe('PipelineRun failed to start');
    status = getRunStatusColor('xyz');
    expect(status.message).toBe('PipelineRun not started yet');
  });
});
