import React from 'react';

import {
  StatusClassKey,
  StatusError,
  StatusOK,
  StatusPending,
  StatusRunning,
  StatusWarning,
} from '@backstage/core-components';

import { makeStyles } from '@material-ui/core';
import OffIcon from '@mui/icons-material/DoNotDisturbOnOutlined';
import UnknownIcon from '@mui/icons-material/HelpOutline';
import AngleDoubleRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import BanIcon from '@mui/icons-material/NotInterestedOutlined';
import PauseIcon from '@mui/icons-material/PauseCircleOutlineOutlined';

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

const useStatusStyles = makeStyles(theme => ({
  success: {
    '& svg': {
      fill: theme.palette.status.ok,
    },
  },
  running: {
    '& svg': {
      fill: theme.palette.status.running,
    },
  },
  pending: {
    '& svg': {
      fill: theme.palette.status.pending,
    },
  },
  warning: {
    '& svg': {
      fill: theme.palette.status.warning,
    },
  },
  error: {
    '& svg': {
      fill: theme.palette.status.error,
    },
  },
}));

const StatusIcon = ({ statusKey }: { statusKey: StatusClassKey }) => {
  const statusStyles = useStatusStyles();

  switch (statusKey) {
    case 'ok':
      return (
        <g className={statusStyles.success}>
          <StatusOK />{' '}
        </g>
      );
    case 'pending':
      return (
        <g className={statusStyles.pending}>
          <StatusPending />{' '}
        </g>
      );
    case 'running':
      return (
        <g className={statusStyles.running}>
          <StatusRunning />{' '}
        </g>
      );
    case 'warning':
      return (
        <g className={statusStyles.warning}>
          <StatusWarning />{' '}
        </g>
      );
    case 'error':
      return (
        <g className={statusStyles.error}>
          <StatusError />{' '}
        </g>
      );
    default:
      return null;
  }
};

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
  displayStatusText,
}: {
  status: string | null;
  displayStatusText?: string;
  iconOnly?: boolean;
  className?: string;
}): React.ReactElement => {
  const classes = useStyles();
  const statusProps = {
    title: displayStatusText || status || '',
    iconOnly,
    className,
  };

  switch (status) {
    case 'New':
    case 'Idle':
    case 'Pending':
    case 'PipelineNotStarted':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<StatusIcon statusKey="pending" />}
        />
      );

    case 'In Progress':
    case 'Progress':
    case 'Installing':
    case 'InstallReady':
    case 'Replacing':
    case 'Running':
    case 'Updating':
    case 'Upgrading':
    case 'PendingInstall':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<StatusIcon statusKey="running" />}
        />
      );

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
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<StatusIcon statusKey="warning" />}
        />
      );

    case 'ImagePullBackOff':
    case 'Error':
    case 'Failed':
    case 'CrashLoopBackOff':
    case 'ErrImagePull':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<StatusIcon statusKey="error" />}
        />
      );

    case 'Completed':
    case 'Succeeded':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<StatusIcon statusKey="ok" />}
        />
      );

    case 'Skipped':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<AngleDoubleRightIcon className={classes.iconStyles} />}
        />
      );
    case 'Paused':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<PauseIcon className={classes.iconStyles} />}
        />
      );
    case 'Stopped':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<OffIcon className={classes.iconStyles} />}
        />
      );

    case 'Unknown':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<UnknownIcon className={classes.iconStyles} />}
        />
      );

    default:
      return <>{status || DASH}</>;
  }
};
