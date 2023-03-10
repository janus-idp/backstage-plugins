import * as React from 'react';
import {
  DEFAULT_TASK_NODE_TYPE,
  PipelineNodeModel,
  RunStatus,
  WhenStatus,
} from '@patternfly/react-topology';
import '@patternfly/react-styles/css/components/Topology/topology-components.css';
import LockIcon from '@material-ui/icons/Lock';
import { WorkFlowTask } from './type/WorkFlowTask';

export const NODE_PADDING_VERTICAL = 15;
export const NODE_PADDING_HORIZONTAL = 10;

export const DEFAULT_TASK_WIDTH = 200;
export const DEFAULT_TASK_HEIGHT = 30;

export function useDemoPipelineNodes(
  workflowTasks: WorkFlowTask[],
): PipelineNodeModel[] {
  // React.useMemo(() => {
  const getStatus: any = (status: string) => {
    if (status === 'completed') return RunStatus.Succeeded;
    else if (status === 'in_progress') return RunStatus.InProgress;
    return RunStatus.Pending;
  };

  const getConditionMet: any = (status: RunStatus) => {
    if (status === RunStatus.Succeeded) return WhenStatus.Met;
    else if (status === RunStatus.InProgress) return WhenStatus.InProgress;
    return WhenStatus.Unmet;
  };

  // Create a task node for each task status
  const tasks = workflowTasks.map(workFlowTask => {
    // Set all the standard fields
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

    // put options in data, our DEMO task node will pass them along to the TaskNode
    task.data = {
      status: getStatus(workFlowTask.status),
      taskIcon: workFlowTask.locked ? <LockIcon color="error" /> : null,
    };

    return task;
  });

  // Add when tasks to the nodes that are not first in the row
  const whenTasks = tasks.filter((_task, index) => index !== 0);
  whenTasks.forEach(task => {
    task.data.whenStatus = getConditionMet(task.data.status);
  });

  return tasks;
} // , [workflowTasks]);
