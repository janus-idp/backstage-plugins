import React from 'react';

import {
  BanIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  HourglassHalfIcon,
  NotStartedIcon,
  SyncAltIcon,
  UnknownIcon,
} from '@patternfly/react-icons';

import { StatusIconAndText } from '@janus-idp/shared-react';

import './Status.css';

export type StatusComponentProps = {
  title?: string;
  iconOnly?: boolean;
  noTooltip?: boolean;
  className?: string;
  popoverTitle?: string;
};

type StatusProps = StatusComponentProps & {
  status: string | null;
};

const DASH = '-';

/**
 * Component for displaying a status message
 * @param {string} status - type of status to be displayed
 * @example
 * ```tsx
 * <Status status='Warning' />
 * ```
 */
const Status = ({ status, noTooltip, iconOnly }: StatusProps) => {
  const statusProps = {
    title: status ?? '',
    iconOnly,
    noTooltip,
  };
  switch (status) {
    case 'Pending':
      return (
        <StatusIconAndText {...statusProps} icon={<HourglassHalfIcon />} />
      );

    case 'Running':
    case 'In Progress':
      return <StatusIconAndText {...statusProps} icon={<SyncAltIcon />} />;

    case 'Not Ready':
    case 'Cancelled':
    case 'Terminating':
    case 'Cancelling':
      return <StatusIconAndText {...statusProps} icon={<BanIcon />} />;

    case 'CrashLoopBackOff':
    case 'ErrImagePull':
    case 'Failed':
    case 'ImagePullBackOff':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={
            <ExclamationCircleIcon className="bs-topology-status__red-exclamation-icon" />
          }
        />
      );

    case 'Succeeded':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={
            <CheckCircleIcon className="bs-topology-status__green-check-icon" />
          }
        />
      );

    case 'PipelineNotStarted':
      return <StatusIconAndText {...statusProps} icon={<NotStartedIcon />} />;

    case 'Unknown':
      return <StatusIconAndText {...statusProps} icon={<UnknownIcon />} />;

    default:
      return <>{status || DASH}</>;
  }
};

export default Status;
