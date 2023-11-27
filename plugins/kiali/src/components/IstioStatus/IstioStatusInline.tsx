import * as React from 'react';

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  MinusCircleIcon,
} from '@patternfly/react-icons';

import { ComponentStatus } from '../../types/IstioStatus';
import { IstioStatus } from './IstioStatus';

type Props = {
  status: ComponentStatus[];
  cluster?: string;
};

export const IstioStatusInline = (props: Props): React.JSX.Element => {
  return (
    <IstioStatus
      {...props}
      icons={{
        ErrorIcon: ExclamationCircleIcon,
        HealthyIcon: CheckCircleIcon,
        InfoIcon: MinusCircleIcon,
        WarningIcon: ExclamationTriangleIcon,
      }}
    />
  );
};
