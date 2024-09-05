import * as React from 'react';

import { HourglassHalfIcon } from '@patternfly/react-icons/dist/esm/icons/hourglass-half-icon';
import { InProgressIcon } from '@patternfly/react-icons/dist/esm/icons/in-progress-icon';
import { OffIcon } from '@patternfly/react-icons/dist/esm/icons/off-icon';
import { PausedIcon } from '@patternfly/react-icons/dist/esm/icons/paused-icon';
import { SyncAltIcon } from '@patternfly/react-icons/dist/esm/icons/sync-alt-icon';
import { UnknownIcon } from '@patternfly/react-icons/dist/esm/icons/unknown-icon';

import { StatusIconAndText } from '@janus-idp/shared-react';

import { VMStatusEnum } from '../../vm-const';
import RedExclamationCircleIcon from './RedExclamationCircleIcon';

type VMStatusIconProps = {
  status: VMStatusEnum;
};

const VMStatusIcon = ({ status }: VMStatusIconProps) => {
  switch (status) {
    case VMStatusEnum.PAUSED:
      return (
        <StatusIconAndText icon={<PausedIcon />} iconOnly title="status" />
      );
    case VMStatusEnum.RUNNING:
      return (
        <StatusIconAndText icon={<SyncAltIcon />} iconOnly title="status" />
      );
    case VMStatusEnum.STOPPED:
      return <StatusIconAndText icon={<OffIcon />} iconOnly title="status" />;
    case VMStatusEnum.ERROR:
      return (
        <StatusIconAndText
          icon={<RedExclamationCircleIcon />}
          iconOnly
          title="status"
        />
      );
    case VMStatusEnum.IN_PROGRESS:
      return (
        <StatusIconAndText
          icon={<InProgressIcon />}
          iconOnly
          title="status"
          spin
        />
      );
    case VMStatusEnum.PENDING:
      return (
        <StatusIconAndText
          icon={<HourglassHalfIcon />}
          iconOnly
          title="status"
        />
      );
    default:
      return (
        <StatusIconAndText icon={<UnknownIcon />} iconOnly title="status" />
      );
  }
};

export default VMStatusIcon;
