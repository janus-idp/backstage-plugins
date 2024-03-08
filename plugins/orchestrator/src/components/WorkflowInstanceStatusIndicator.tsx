import React from 'react';

import DotIcon from '@material-ui/icons/FiberManualRecord';

import {
  capitalize,
  ProcessInstanceStateValues,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { VALUE_UNAVAILABLE } from '../constants';
import { useWorkflowInstanceStateColors } from '../hooks/useWorkflowInstanceStatusColors';

export const WorkflowInstanceStatusIndicator = ({
  status,
}: {
  status?: ProcessInstanceStateValues;
}) => {
  const iconColor = useWorkflowInstanceStateColors(status);

  if (!status) {
    return VALUE_UNAVAILABLE;
  }

  return (
    <>
      <DotIcon style={{ fontSize: '0.75rem' }} className={iconColor} />{' '}
      {capitalize(status)}
    </>
  );
};
