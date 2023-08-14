import React from 'react';

import {
  AngleDoubleRightIcon,
  CheckCircleIcon,
  CircleIcon,
  ExclamationCircleIcon,
  HourglassHalfIcon,
  SyncAltIcon,
} from '@patternfly/react-icons';
import classNames from 'classnames';

import { ComputedStatus } from '@janus-idp/shared-react';

import { YellowExclamationTriangleIcon } from './icons';

interface StatusIconProps {
  status: string;
  height?: number;
  width?: number;
  disableSpin?: boolean;
}

export const StatusIcon = ({
  status,
  disableSpin,
  ...props
}: StatusIconProps) => {
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
      return <YellowExclamationTriangleIcon />;

    case ComputedStatus.Skipped:
      return <AngleDoubleRightIcon {...props} />;

    default:
      return <CircleIcon {...props} />;
  }
};
