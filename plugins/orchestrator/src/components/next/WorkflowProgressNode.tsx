import React from 'react';
import Moment from 'react-moment';

import { Tooltip } from '@material-ui/core';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';

import { VALUE_UNAVAILABLE } from '../../constants';
import { Paragraph } from '../Paragraph/Paragraph';
import { useWorkflowInstanceStateColors } from './hooks/useWorkflowInstanceStatusColors';
import { WorkflowProgressNodeModel } from './WorkflowProgressNodeModel';

const WorkflowProgressNodeIcon: React.FC<{
  status: WorkflowProgressNodeModel['status'];
  error?: WorkflowProgressNodeModel['error'];
}> = ({ status, error }) => {
  const color = useWorkflowInstanceStateColors(status);
  switch (status) {
    case 'ERROR': {
      return (
        <Tooltip
          title={
            error?.message ??
            'Additional details about this error are not available'
          }
        >
          <ErrorIcon className={color} />
        </Tooltip>
      );
    }
    case 'COMPLETED': {
      return (
        <Tooltip title="Completed">
          <CheckCircleIcon className={color} />
        </Tooltip>
      );
    }
    case 'ACTIVE': {
      return (
        <Tooltip title="Active">
          <HourglassTopIcon className={color} />
        </Tooltip>
      );
    }
    case 'ABORTED': {
      return (
        <Tooltip title="Aborted">
          <CancelIcon className={color} />
        </Tooltip>
      );
    }
    case 'SUSPENDED': {
      return (
        <Tooltip title="Suspended">
          <PauseCircleIcon className={color} />
        </Tooltip>
      );
    }
    default:
      return null;
  }
};
WorkflowProgressNodeIcon.displayName = 'WorkflowProgressNodeIcon';

export const WorkflowProgressNode: React.FC<{
  model: WorkflowProgressNodeModel;
}> = ({ model }) => (
  <Paragraph>
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <WorkflowProgressNodeIcon status={model.status} error={model.error} />
      <span style={{ paddingLeft: '8px' }}>{model.name}</span>
    </span>
    <small style={{ paddingLeft: '32px', color: 'grey' }}>
      {!model.exit ? (
        VALUE_UNAVAILABLE
      ) : (
        <Moment fromNow>{new Date(`${model.exit}`)}</Moment>
      )}
    </small>
  </Paragraph>
);
WorkflowProgressNode.displayName = 'WorkflowProgressNode';
