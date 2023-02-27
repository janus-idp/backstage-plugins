import * as React from 'react';
import {
  PipelineNodeModel,
  RunStatus,
  WhenStatus,
} from '@patternfly/react-topology';
import '@patternfly/react-styles/css/components/Topology/topology-components.css';
import { mockTasks } from './mock/mockTasks';
import LockIcon from '@material-ui/icons/Lock';
import './TopologyComponent.css';

export const NODE_PADDING_VERTICAL = 15;
export const NODE_PADDING_HORIZONTAL = 10;

export const DEFAULT_TASK_WIDTH = 200;
export const DEFAULT_TASK_HEIGHT = 30;

export const useDemoPipelineNodes = (
  showContextMenu: boolean,
  showBadges: boolean,
  showIcons: boolean,
  badgeTooltips: boolean,
): PipelineNodeModel[] =>
  React.useMemo(() => {
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
    const tasks = mockTasks.map(workFlowTask => {
      // Set all the standard fields
      const task: PipelineNodeModel = {
        id: workFlowTask.id,
        type: workFlowTask.type,
        label: workFlowTask.label,
        width:
          DEFAULT_TASK_WIDTH +
          (showContextMenu ? 10 : 0) +
          (showBadges ? 40 : 0),
        height: DEFAULT_TASK_HEIGHT,
        style: {
          padding: [
            NODE_PADDING_VERTICAL,
            NODE_PADDING_HORIZONTAL + (showIcons ? 25 : 0),
          ],
        },
        runAfterTasks: workFlowTask.runAfterTasks,
      };

      // put options in data, our DEMO task node will pass them along to the TaskNode
      task.data = {
        status: getStatus(workFlowTask.status),
        badge: showBadges ? '3/4' : undefined,
        badgeTooltips,
        taskIcon: workFlowTask.locked ? <LockIcon color="error" /> : null,
        taskIconTooltip: showIcons ? 'Environment' : undefined,
        showContextMenu,
        // columnGroup: index % STATUS_PER_ROW
      };

      return task;
    });

    // Add when tasks to the nodes that are not first in the row
    const whenTasks = tasks.filter((_task, index) => index !== 0);
    whenTasks.forEach(task => {
      task.data.whenStatus = getConditionMet(task.data.status);
    });

    return [...tasks]; // , ...finallyNodes, finallyGroup];
  }, [badgeTooltips, showBadges, showContextMenu, showIcons]);
