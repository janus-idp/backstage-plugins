import { cloneDeep, forIn } from 'lodash';

import { mockKubernetesPlrResponse } from '../__fixtures__/1-pipelinesData';
import {
  ComputedStatus,
  SucceedConditionReason,
} from '../types/computedStatus';
import { PLRTaskRuns } from '../types/pipelineRun';
import { TaskRunKind } from '../types/taskRun';
import {
  appendPipelineRunStatus,
  calculateDuration,
  getPLRTaskRuns,
} from './pipelineRun-utils';

describe('pipelineRun-utils', () => {
  it('should return definite duration', () => {
    let duration = calculateDuration(
      '2020-05-22T11:57:53Z',
      '2020-05-22T11:57:57Z',
    );
    expect(duration).toEqual('4s');
    duration = calculateDuration(
      '2020-05-22T11:57:53Z',
      '2020-05-22T11:57:57Z',
      true,
    );
    expect(duration).toEqual('4 second');
    duration = calculateDuration(
      '2020-05-22T11:57:53Z',
      '2020-05-22T12:02:20Z',
    );
    expect(duration).toBe('4m 27s');
    duration = calculateDuration(
      '2020-05-22T11:57:53Z',
      '2020-05-22T12:02:20Z',
      true,
    );
    expect(duration).toBe('4 minute 27 second');
    duration = calculateDuration(
      '2020-05-22T10:57:53Z',
      '2020-05-22T12:57:57Z',
    );
    expect(duration).toBe('2h 4s');
  });

  it('should append Pending status if a taskrun status reason is missing', () => {
    const pipelineRun = mockKubernetesPlrResponse.pipelineruns[0];
    const pipelineRunWithoutStatus = cloneDeep(pipelineRun);
    const plrTaskRuns = getPLRTaskRuns(
      mockKubernetesPlrResponse.taskruns,
      mockKubernetesPlrResponse.pipelineruns[0].metadata.name,
    );
    forIn(pipelineRunWithoutStatus.status.taskRuns, (taskRun: PLRTaskRuns) => {
      delete taskRun.status;
    });
    const taskList = appendPipelineRunStatus(
      pipelineRunWithoutStatus,
      plrTaskRuns,
    );
    expect(
      taskList.filter(t => t?.status.reason === ComputedStatus.Pending),
    ).toHaveLength(2);
  });

  it('should append pipelineRun running status for all the tasks', () => {
    const plrTaskRuns = getPLRTaskRuns(
      mockKubernetesPlrResponse.taskruns,
      mockKubernetesPlrResponse.pipelineruns[0].metadata.name,
    );

    const taskList = appendPipelineRunStatus(
      mockKubernetesPlrResponse.pipelineruns[0],
      plrTaskRuns,
    );
    expect(
      taskList.filter(t => t.status.reason === ComputedStatus.Running),
    ).toHaveLength(1);
  });

  it('should append pipelineRun pending status for all the tasks if taskruns are not present and pipelinerun status is PipelineRunPending', () => {
    const pipelineRun = cloneDeep(mockKubernetesPlrResponse.pipelineruns[0]);
    pipelineRun.status.conditions[0] = {
      ...pipelineRun.status.conditions[0],
      reason: SucceedConditionReason.PipelineRunPending,
    };
    const taskList = appendPipelineRunStatus(pipelineRun, {});
    expect(
      taskList.filter(t => t.status.reason === ComputedStatus.Idle),
    ).toHaveLength(pipelineRun.status.pipelineSpec.tasks.length);
  });

  it('should append pipelineRun cancelled status for all the tasks if taskruns are not present and pipelinerun status is PipelineRunCancelled', () => {
    const pipelineRun = cloneDeep(mockKubernetesPlrResponse.pipelineruns[0]);
    pipelineRun.status.conditions[0] = {
      ...pipelineRun.status.conditions[0],
      reason: SucceedConditionReason.PipelineRunCancelled,
    };
    const taskList = appendPipelineRunStatus(pipelineRun, {});
    expect(
      taskList.filter(t => t.status.reason === ComputedStatus.Cancelled),
    ).toHaveLength(pipelineRun.status.pipelineSpec.tasks.length);
  });

  it('should append status to only pipeline tasks if isFinallyTasks is false', () => {
    const pipelineRun = cloneDeep(mockKubernetesPlrResponse.pipelineruns[1]);
    const plrTaskRuns = getPLRTaskRuns(
      mockKubernetesPlrResponse.taskruns,
      pipelineRun.metadata.name,
    );
    const taskList = appendPipelineRunStatus(pipelineRun, plrTaskRuns);
    expect(taskList).toHaveLength(3);
  });

  it('should append status to only finally tasks if isFinallyTasks is true', () => {
    const pipelineRun = cloneDeep(mockKubernetesPlrResponse.pipelineruns[1]);
    const plrTaskRuns = getPLRTaskRuns(
      mockKubernetesPlrResponse.taskruns,
      pipelineRun.metadata.name,
    );
    const taskList = appendPipelineRunStatus(pipelineRun, plrTaskRuns, true);
    expect(taskList).toHaveLength(1);
  });

  it('should return empty array if there are no finally tasks but isFinallyTasks is true', () => {
    const pipelineRun = cloneDeep(mockKubernetesPlrResponse.pipelineruns[0]);
    const plrTaskRuns = getPLRTaskRuns(
      mockKubernetesPlrResponse.taskruns as TaskRunKind[],
      pipelineRun.metadata.name,
    );
    const taskList = appendPipelineRunStatus(pipelineRun, plrTaskRuns, true);
    expect(taskList).toHaveLength(0);
  });
});
