import {
  BanIcon,
  HourglassHalfIcon,
  SyncAltIcon,
  UnknownIcon,
} from '@patternfly/react-icons';
import * as React from 'react';
import StatusIconAndText from './StatusIconAndText';
import { GreenCheckCircleIcon, RedExclamationCircleIcon } from './icons';

type StatusProps = {
  status: string;
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
const Status = ({ status }: StatusProps) => {
  const statusProps = {
    title: status,
  };
  switch (status) {
    case 'Pending':
      return (
        <StatusIconAndText {...statusProps} icon={<HourglassHalfIcon />} />
      );

    case 'Running':
      return <StatusIconAndText {...statusProps} icon={<SyncAltIcon />} />;

    case 'Not Ready':
    case 'Terminating':
      return <StatusIconAndText {...statusProps} icon={<BanIcon />} />;

    case 'CrashLoopBackOff':
    case 'ErrImagePull':
    case 'Failed':
    case 'ImagePullBackOff':
      return (
        <StatusIconAndText
          {...statusProps}
          icon={<RedExclamationCircleIcon />}
        />
      );

    case 'Succeeded':
      return (
        <StatusIconAndText {...statusProps} icon={<GreenCheckCircleIcon />} />
      );

    case 'Unknown':
      return <StatusIconAndText {...statusProps} icon={<UnknownIcon />} />;

    default:
      return <>{status || DASH}</>;
  }
};

export default Status;
