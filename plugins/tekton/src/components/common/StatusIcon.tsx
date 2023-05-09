import React from 'react';
import classNames from 'classnames';
import {
  AngleDoubleRightIcon,
  CheckCircleIcon,
  CircleIcon,
  ExclamationCircleIcon,
  HourglassHalfIcon,
  SyncAltIcon,
} from '@patternfly/react-icons';
import { YellowExclamationTriangleIcon } from './icons';
import { ComputedStatus } from '../../types/computedStatus';

interface StatusIconProps {
  status: string;
  height?: number;
  width?: number;
  disableSpin?: boolean;
}

export const StatusIcon: React.FC<StatusIconProps> = ({
  status,
  disableSpin,
  ...props
}) => {
  switch (status) {
    case ComputedStatus['In Progress']:
    case ComputedStatus.Running:
      return (
        <SyncAltIcon
          {...props}
          style={{ color: 'var(--pf-global--palette--white)' }}
          className={classNames({
            'pf-topology-pipelines__pill-status pf-m-running pf-m-spin':
              !disableSpin,
          })}
        />
      );

    case ComputedStatus.Succeeded:
      return <CheckCircleIcon {...props} />;

    case ComputedStatus.Failed:
      return <ExclamationCircleIcon {...props} />;

    case ComputedStatus.Idle:
    case ComputedStatus.Pending:
      return <HourglassHalfIcon {...props} />;

    case ComputedStatus.Cancelled:
      return <YellowExclamationTriangleIcon {...props} />;

    case ComputedStatus.Skipped:
      return <AngleDoubleRightIcon {...props} />;

    default:
      return <CircleIcon {...props} />;
  }
};
