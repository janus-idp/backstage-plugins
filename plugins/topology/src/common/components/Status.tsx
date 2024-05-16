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
import classNames from 'classnames';

import { StatusIconAndText } from '@janus-idp/shared-react';

import './Status.css';

export type StatusProps = {
  iconOnly?: boolean;
  className?: string;
  status: string | null;
  height?: number;
  width?: number;
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
const Status = ({
  status,
  iconOnly,
}: React.PropsWithChildren<StatusProps>): React.ReactElement => {
  const statusProps = {
    title: status ?? '',
    iconOnly,
  };

  switch (status) {
    case 'Pending':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<HourglassHalfIcon className="bs-topology-status" />}
        />
      );

    case 'Running':
    case 'In Progress':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<SyncAltIcon className="bs-topology-status" />}
        />
      );

    case 'Not Ready':
    case 'Cancelled':
    case 'Terminating':
    case 'Cancelling':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<BanIcon className="bs-topology-status" />}
        />
      );

    case 'CrashLoopBackOff':
    case 'ErrImagePull':
    case 'Failed':
    case 'ImagePullBackOff':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={
            <ExclamationCircleIcon
              className={classNames(
                'bs-topology-status__red-exclamation-icon',
                'bs-topology-status',
              )}
            />
          }
        />
      );

    case 'Succeeded':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={
            <CheckCircleIcon
              className={classNames(
                'bs-topology-status__green-check-icon',
                'bs-topology-status',
              )}
            />
          }
        />
      );

    case 'PipelineNotStarted':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<NotStartedIcon className="bs-topology-status" />}
        />
      );

    case 'Unknown':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<UnknownIcon className="bs-topology-status" />}
        />
      );

    default:
      return <>{status || DASH}</>;
  }
};

export default Status;
