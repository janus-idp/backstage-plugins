import React from 'react';

import {
  StatusError,
  StatusOK,
  StatusPending,
  StatusRunning,
  StatusWarning,
} from '@backstage/core-components';

import { makeStyles } from '@material-ui/core';
import UnknownIcon from '@mui/icons-material/HelpOutline';
import AngleDoubleRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import BanIcon from '@mui/icons-material/NotInterestedOutlined';

import { StatusIconAndText } from './StatusIconAndText';

const useStyles = makeStyles({
  iconStyles: {
    height: '0.8em',
    width: '0.8em',
    top: '0.125em',
    position: 'relative',
    flexShrink: 0,
    marginRight: '8px',
  },
});

const DASH = '-';

/**
 * Component for displaying a status message
 * @param {string} status - type of status to be displayed
 * @param {boolean} [iconOnly] - (optional) if true, only displays icon
 * @param {string} [className] - (optional) additional class name for the component

 * @example
 * ```tsx
 * <Status status='Warning' />
 * ```
 */
export const Status = ({
  status,
  iconOnly,
  className,
}: {
  iconOnly?: boolean;
  className?: string;
  status: string | null;
}): React.ReactElement => {
  const classes = useStyles();
  const statusProps = {
    title: status ?? '',
    iconOnly,
    className,
  };

  switch (status) {
    case 'New':
    case 'Idle':
    case 'Pending':
    case 'PipelineNotStarted':
      return <StatusIconAndText {...statusProps} icon={<StatusPending />} />;

    case 'In Progress':
    case 'Installing':
    case 'InstallReady':
    case 'Replacing':
    case 'Running':
    case 'Updating':
    case 'Upgrading':
    case 'PendingInstall':
      return <StatusIconAndText {...statusProps} icon={<StatusRunning />} />;

    case 'Cancelled':
    case 'Deleting':
    case 'Expired':
    case 'Not Ready':
    case 'Cancelling':
    case 'Terminating':
    case 'Superseded':
    case 'Uninstalling':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<BanIcon className={classes.iconStyles} />}
        />
      );

    case 'Warning':
    case 'RequiresApproval':
      return <StatusIconAndText {...statusProps} icon={<StatusWarning />} />;

    case 'ImagePullBackOff':
    case 'Error':
    case 'Failed':
    case 'CrashLoopBackOff':
    case 'ErrImagePull':
      return <StatusIconAndText {...statusProps} icon={<StatusError />} />;

    case 'Completed':
    case 'Succeeded':
      return <StatusIconAndText {...statusProps} icon={<StatusOK />} />;

    case 'Skipped':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<AngleDoubleRightIcon className={classes.iconStyles} />}
        />
      );

    case 'Unknown':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<UnknownIcon className={classes.iconStyles} />} // check the alignment
        />
      );

    default:
      return <>{status || DASH}</>;
  }
};
