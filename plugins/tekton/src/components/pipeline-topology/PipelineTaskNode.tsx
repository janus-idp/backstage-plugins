import * as React from 'react';
// eslint-disable-next-line @backstage/no-undeclared-imports
import { observer } from 'mobx-react';
import { Tooltip } from '@patternfly/react-core';
import {
  DEFAULT_LAYER,
  DEFAULT_WHEN_OFFSET,
  Layer,
  Node,
  ScaleDetailsLevel,
  TaskNode,
  TOP_LAYER,
  useDetailsLevel,
  useHover,
  WhenDecorator,
  WithContextMenuProps,
  WithSelectionProps,
  GraphElement,
  RunStatus,
} from '@patternfly/react-topology';
import { PipelineTaskWithStatus } from '../../types/pipelineRun';
import { StepStatus } from '../../types/taskRun';
import { getTaskStatus } from '../../utils/pipelineRun-utils';
import { PipelineVisualizationStepList } from './PipelineVisualizationStepList';
import { createStepStatus } from '../../utils/pipeline-step-utils';
import { NodeType } from '../../consts/pipeline-topology-const';

import './PipelineTaskNode.css';

type PipelineTaskNodeProps = {
  element: Node;
} & WithContextMenuProps &
  WithSelectionProps &
  GraphElement;

const PipelineTaskNode: React.FunctionComponent<PipelineTaskNodeProps> = ({
  element,
  onContextMenu,
  contextMenuOpen,
  ...rest
}) => {
  const data = element.getData();
  const [hover, hoverRef] = useHover();
  const detailsLevel = useDetailsLevel();
  const isFinallyTask = element.getType() === NodeType.FINALLY_NODE;

  const computedTask: PipelineTaskWithStatus = data.task;
  const stepList =
    computedTask?.status?.steps || computedTask?.taskSpec?.steps || [];

  const taskStatus = getTaskStatus(data.pipelineRun, data.task);

  const stepStatusList: StepStatus[] = stepList.map(step =>
    createStepStatus(step, taskStatus),
  );
  const succeededStepsCount = stepStatusList.filter(
    ({ status }) => status === RunStatus.Succeeded,
  ).length;

  const badge =
    stepStatusList.length > 0 && data.status
      ? `${succeededStepsCount}/${stepStatusList.length}`
      : null;

  const passedData = React.useMemo(() => {
    const newData = { ...data };
    Object.keys(newData).forEach(key => {
      if (newData[key] === undefined) {
        delete newData[key];
      }
    });
    return newData;
  }, [data]);

  const hasTaskIcon = !!(data.taskIconClass || data.taskIcon);
  const whenDecorator = data.whenStatus ? (
    <WhenDecorator
      element={element}
      status={data.whenStatus}
      leftOffset={
        hasTaskIcon
          ? DEFAULT_WHEN_OFFSET + (element.getBounds().height - 4) * 0.75
          : DEFAULT_WHEN_OFFSET
      }
    />
  ) : null;

  const taskNode = (
    <TaskNode
      className="bs-tkn-pipeline-task-node"
      element={element}
      onContextMenu={data.showContextMenu ? onContextMenu : undefined}
      contextMenuOpen={contextMenuOpen}
      scaleNode={
        (hover || contextMenuOpen) && detailsLevel !== ScaleDetailsLevel.high
      }
      hideDetailsAtMedium
      {...passedData}
      {...rest}
      badge={badge}
      truncateLength={element.getData()?.label?.length}
    >
      {whenDecorator}
    </TaskNode>
  );

  return (
    <Layer
      id={
        detailsLevel !== ScaleDetailsLevel.high && (hover || contextMenuOpen)
          ? TOP_LAYER
          : DEFAULT_LAYER
      }
    >
      <g
        data-test={`task ${element.getLabel()}`}
        className="bs-tkn-pipeline-task-node"
        ref={hoverRef as React.LegacyRef<SVGGElement>}
      >
        <Tooltip
          position="bottom"
          enableFlip={false}
          content={
            <PipelineVisualizationStepList
              isSpecOverview={!data.status}
              taskName={element.getLabel()}
              steps={stepStatusList}
              isFinallyTask={isFinallyTask}
            />
          }
        >
          {taskNode}
        </Tooltip>
      </g>
    </Layer>
  );
};

export default React.memo(observer(PipelineTaskNode));
