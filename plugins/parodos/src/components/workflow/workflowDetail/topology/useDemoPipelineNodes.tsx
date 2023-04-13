import * as React from 'react';
import {
  DEFAULT_TASK_NODE_TYPE,
  PipelineNodeModel,
  RunStatus,
  WhenStatus,
} from '@patternfly/react-topology';
import '@patternfly/react-styles/css/components/Topology/topology-components.css';
import LockIcon from '@material-ui/icons/Lock';
import { WorkflowTask } from '../../../../models/workflowTaskSchema';

export const NODE_PADDING_VERTICAL = 15;
export const NODE_PADDING_HORIZONTAL = 10;

export const DEFAULT_TASK_WIDTH = 200;
export const DEFAULT_TASK_HEIGHT = 30;

export function useDemoPipelineNodes(
  workflowTasks: WorkflowTask[],
): PipelineNodeModel[] {
  const getStatus = (status: WorkflowTask['status']) => {
    if (status.toUpperCase() === 'COMPLETED') return RunStatus.Succeeded;
    else if (status.toUpperCase() === 'IN_PROGRESS')
      return RunStatus.InProgress;
    else if (status.toUpperCase() === 'FAILED') return RunStatus.Failed;
    return RunStatus.Pending;
  };

  const getConditionMet: any = (status: RunStatus) => {
    if (status === RunStatus.Succeeded) return WhenStatus.Met;
    else if (status === RunStatus.InProgress) return WhenStatus.InProgress;
    return WhenStatus.Unmet;
  };

  const tasks = workflowTasks.map(workFlowTask => {
    const task: PipelineNodeModel = {
      id: workFlowTask.id,
      type: DEFAULT_TASK_NODE_TYPE,
      label: workFlowTask.label,
      width: DEFAULT_TASK_WIDTH,
      height: DEFAULT_TASK_HEIGHT,
      style: {
        padding: [NODE_PADDING_VERTICAL, NODE_PADDING_HORIZONTAL + 25],
      },
      runAfterTasks: workFlowTask.runAfterTasks,
    };

    task.data = {
      status: getStatus(workFlowTask.status),
      taskIcon: workFlowTask.locked ? <LockIcon color="error" /> : null,
    };

    return task;
  });

  const whenTasks = tasks.filter((_task, index) => index !== 0);
  whenTasks.forEach(task => {
    task.data.whenStatus = getConditionMet(task.data.status);
  });

  return tasks;
}
