import React from 'react';

import DotIcon from '@material-ui/icons/FiberManualRecord';

import { ProcessInstanceStateValues } from '@janus-idp/backstage-plugin-orchestrator-common';

import { useWorkflowInstanceStateColors } from '../hooks/useWorkflowInstanceStatusColors';
import { capitalize } from '../utils/StringUtils';

export const WorkflowInstanceStatusIndicator = ({
  status,
}: {
  status: ProcessInstanceStateValues;
}) => {
  const iconColor = useWorkflowInstanceStateColors(status);

  return (
    <>
      <DotIcon style={{ fontSize: '0.75rem' }} className={iconColor} />{' '}
      {capitalize(status)}
    </>
  );
};
