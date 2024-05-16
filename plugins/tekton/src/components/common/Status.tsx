import React from 'react';

import {
  AngleDoubleRightIcon,
  BanIcon,
  CheckCircleIcon,
  ClipboardListIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  HourglassHalfIcon,
  HourglassStartIcon,
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
  status: string;
  height?: number;
  width?: number;
  spin?: boolean;
};

const DASH = '-';

/**
 * Component for displaying a status message
 * @param {string} status - type of status to be displayed
 * @param {boolean} [iconOnly] - (optional) if true, only displays icon
 * @param {string} [className] - (optional) additional class name for the component
 * @param {ReactNode} [children] - (optional) children for the component
 * @param {number} [height] - (optional) height of the status icon
 * @param {number} [width] - (optional) width of the status icon
 * @param {boolean} [spin] - (optional)

 * @example
 * ```tsx
 * <Status status='Warning' />
 * ```
 */
export const Status = ({
  status,
  iconOnly,
  className,
  height,
  width,
  spin,
}: React.PropsWithChildren<StatusProps>): React.ReactElement => {
  const statusProps = {
    title: status ?? '',
    iconOnly,
    className,
    spin,
  };

  const iconProps = {
    height,
    width,
  };
  switch (status) {
    case 'New':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<HourglassStartIcon {...iconProps} />}
        />
      );

    case 'Idle':
    case 'Pending':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<HourglassHalfIcon {...iconProps} />}
        />
      );

    case 'Planning':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<ClipboardListIcon {...iconProps} />}
        />
      );

    case 'In Progress':
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
          icon={
            <SyncAltIcon
              {...iconProps}
              className={classNames({
                'pf-topology-pipelines__pill-status pf-m-running pf-m-spin':
                  spin,
                'bs-tkn-status__alt-icon': spin,
              })}
            />
          }
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
        <StatusIconAndText {...statusProps} icon={<BanIcon {...iconProps} />} />
      );

    case 'Warning':
    case 'RequiresApproval':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={
            <ExclamationTriangleIcon
              {...iconProps}
              className="bs-tkn-status__yellow-exclamation-icon"
            />
          }
        />
      );

    case 'Error':
    case 'Failed':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={
            <ExclamationCircleIcon
              {...iconProps}
              className="bs-tkn-status__red-exclamation-icon"
            />
          }
        />
      );

    case 'Completed':
    case 'Succeeded':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={
            <CheckCircleIcon
              {...iconProps}
              className="bs-tkn-status__green-check-icon"
            />
          }
        />
      );

    case 'Skipped':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<AngleDoubleRightIcon {...iconProps} />}
        />
      );

    case 'Unknown':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<UnknownIcon {...iconProps} />}
        />
      );

    case 'PipelineNotStarted':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<NotStartedIcon {...iconProps} />}
        />
      );

    default:
      return <>{status || DASH}</>;
  }
};
