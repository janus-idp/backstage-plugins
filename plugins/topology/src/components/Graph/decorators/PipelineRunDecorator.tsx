import React from 'react';

import { Tooltip, TooltipPosition } from '@patternfly/react-core';

import {
  getLatestPipelineRun,
  getTaskRunsForPipelineRun,
  pipelineRunStatus,
} from '@janus-idp/shared-react';

import Status from '../../../common/components/Status';
import { PipelinesData } from '../../../types/pipeline';
import PipelineDecoratorBubble from './PipelineDecoratorBubble';
import PipelineRunDecoratorTooltip from './PipelineRunDecoratorTooltip';

export const PipelineRunDecorator = ({
  pipelinesData,
  radius,
  x,
  y,
}: {
  pipelinesData: PipelinesData;
  radius: number;
  x: number;
  y: number;
}) => {
  const decoratorRef = React.useRef<SVGGElement | null>(null);

  const latestPipelineRun = getLatestPipelineRun(
    pipelinesData.pipelineRuns,
    'creationTimestamp',
  );

  const taskRuns = getTaskRunsForPipelineRun(
    latestPipelineRun,
    pipelinesData.taskRuns,
  );

  const status = pipelineRunStatus(latestPipelineRun);
  const statusIcon = <Status status={status} iconOnly />;

  const ariaLabel = `PipelineRun status is ${status}`;
  const tooltipContent = (
    <PipelineRunDecoratorTooltip
      pipelineRun={latestPipelineRun}
      status={status}
      taskRuns={taskRuns}
    />
  );

  const decoratorContent = (
    <PipelineDecoratorBubble x={x} y={y} radius={radius} ariaLabel={ariaLabel}>
      {statusIcon}
    </PipelineDecoratorBubble>
  );

  return (
    <Tooltip
      id="pipeline-run-decorator"
      content={tooltipContent}
      position={TooltipPosition.left}
      triggerRef={decoratorRef}
    >
      <g ref={decoratorRef}>{decoratorContent}</g>
    </Tooltip>
  );
};
