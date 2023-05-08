import React from 'react';
import {
  BanIcon,
  ClipboardListIcon,
  HourglassHalfIcon,
  HourglassStartIcon,
  NotStartedIcon,
  SyncAltIcon,
  UnknownIcon,
} from '@patternfly/react-icons';
import StatusIconAndText from './StatusIconAndText';
import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from './icons';

export type StatusComponentProps = {
  title?: string;
  iconOnly?: boolean;
  noTooltip?: boolean;
  className?: string;
  popoverTitle?: string;
};

export type StatusProps = StatusComponentProps & {
  status: string;
  children?: React.ReactNode;
};

const DASH = '-';

/**
 * Component for displaying a status message
 * @param {string} status - type of status to be displayed
 * @param {string} [title] - (optional) status text
 * @param {boolean} [iconOnly] - (optional) if true, only displays icon
 * @param {boolean} [noTooltip] - (optional) if true, tooltip won't be displayed
 * @param {string} [className] - (optional) additional class name for the component
 * @param {string} [popoverTitle] - (optional) title for popover
 * @param {ReactNode} [children] - (optional) children for the component
 * @example
 * ```tsx
 * <Status status='Warning' />
 * ```
 */
export const Status: React.FC<StatusProps> = ({
  status,
  title,
  iconOnly,
  noTooltip,
  className,
}) => {
  const statusProps = {
    title: title || status,
    iconOnly,
    noTooltip,
    className,
  };
  switch (status) {
    case 'New':
      return (
        <StatusIconAndText {...statusProps} icon={<HourglassStartIcon />} />
      );

    case 'Pending':
      return (
        <StatusIconAndText {...statusProps} icon={<HourglassHalfIcon />} />
      );

    case 'Planning':
      return (
        <StatusIconAndText {...statusProps} icon={<ClipboardListIcon />} />
      );

    case 'In Progress':
    case 'Installing':
    case 'InstallReady':
    case 'Replacing':
    case 'Running':
    case 'Updating':
    case 'Upgrading':
    case 'PendingInstall':
      return <StatusIconAndText {...statusProps} icon={<SyncAltIcon />} />;

    case 'Cancelled':
    case 'Deleting':
    case 'Expired':
    case 'Not Ready':
    case 'Cancelling':
    case 'Terminating':
    case 'Superseded':
    case 'Uninstalling':
      return <StatusIconAndText {...statusProps} icon={<BanIcon />} />;

    case 'Warning':
    case 'RequiresApproval':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<YellowExclamationTriangleIcon />}
        />
      );

    case 'Error':
    case 'Failed':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<RedExclamationCircleIcon />}
        />
      );

    case 'Completed':
    case 'Succeeded':
      return (
        <StatusIconAndText {...statusProps} icon={<GreenCheckCircleIcon />} />
      );

    case 'Unknown':
      return <StatusIconAndText {...statusProps} icon={<UnknownIcon />} />;

    case 'PipelineNotStarted':
      return <StatusIconAndText {...statusProps} icon={<NotStartedIcon />} />;

    default:
      return <>{status || DASH}</>;
  }
};
