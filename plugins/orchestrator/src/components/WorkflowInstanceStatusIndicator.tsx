import React from 'react';

import { Link } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';

import DotIcon from '@material-ui/icons/FiberManualRecord';

import {
  capitalize,
  ProcessInstanceStatusDTO,
  WorkflowResultDTOCompletedWithEnum,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { VALUE_UNAVAILABLE } from '../constants';
import { useWorkflowInstanceStateColors } from '../hooks/useWorkflowInstanceStatusColors';
import { workflowInstanceRouteRef } from '../routes';

export const WorkflowInstanceStatusIndicator = ({
  status,
  lastRunId,
  completedWith,
}: {
  status?: ProcessInstanceStatusDTO;
  lastRunId?: string;
  completedWith?: WorkflowResultDTOCompletedWithEnum;
}) => {
  const iconColor = useWorkflowInstanceStateColors(
    status === ProcessInstanceStatusDTO.Completed && completedWith === 'error'
      ? ProcessInstanceStatusDTO.Error
      : status,
  );
  const workflowInstanceLink = useRouteRef(workflowInstanceRouteRef);

  if (!status) {
    return VALUE_UNAVAILABLE;
  }

  let statusText: string = status;
  if (
    status === ProcessInstanceStatusDTO.Completed &&
    completedWith === 'error'
  ) {
    statusText = 'Completed with error';
  }

  return (
    <>
      <DotIcon style={{ fontSize: '0.75rem' }} className={iconColor} />{' '}
      {lastRunId ? (
        <Link to={workflowInstanceLink({ instanceId: lastRunId })}>
          {capitalize(statusText)}
        </Link>
      ) : (
        <>{capitalize(statusText)}</>
      )}
    </>
  );
};
