import * as React from 'react';

import { ListItem, ListItemText } from '@material-ui/core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  MinusCircleIcon,
} from '@patternfly/react-icons';
import { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';

import { ComponentStatus, Status } from '../../types/IstioStatus';
import { PFColors } from '../Pf/PfColors';

type Props = {
  componentStatus: ComponentStatus;
};

export type ComponentIcon = {
  color: string;
  icon: React.ComponentClass<SVGIconProps>;
};

const ErrorCoreComponent: ComponentIcon = {
  color: PFColors.Danger,
  icon: ExclamationCircleIcon,
};

const ErrorAddonComponent: ComponentIcon = {
  color: PFColors.Warning,
  icon: ExclamationTriangleIcon,
};

const NotReadyComponent: ComponentIcon = {
  color: PFColors.Info,
  icon: MinusCircleIcon,
};

const SuccessComponent: ComponentIcon = {
  color: PFColors.Success,
  icon: CheckCircleIcon,
};

// Mapping Valid-Core to Icon representation.
const validToIcon: { [valid: string]: ComponentIcon } = {
  'false-false': ErrorAddonComponent,
  'false-true': ErrorCoreComponent,
  'true-false': SuccessComponent,
  'true-true': SuccessComponent,
};

const statusMsg = {
  [Status.NotFound]: 'Not found',
  [Status.NotReady]: 'Not ready',
  [Status.Unhealthy]: 'Not healthy',
  [Status.Unreachable]: 'Unreachable',
  [Status.Healthy]: 'Healthy',
};

export const IstioComponentStatus = (props: Props): JSX.Element => {
  const renderIcon = (status: Status, isCore: boolean) => {
    let compIcon = validToIcon[`${status === Status.Healthy}-${isCore}`];
    if (status === Status.NotReady) {
      compIcon = NotReadyComponent;
    }
    const IconComponent = compIcon.icon;
    return <IconComponent style={{ color: compIcon.color, marginTop: 5 }} />;
  };

  const comp = props.componentStatus;
  const state = statusMsg[comp.status];
  return (
    <ListItem>
      <ListItemText
        primary={
          <>
            <span>
              {renderIcon(
                props.componentStatus.status,
                props.componentStatus.is_core,
              )}
            </span>
            <span style={{ marginLeft: '10px', marginRight: '10px' }}>
              {comp.name}
            </span>
            {state && <>{state}</>}
          </>
        }
      />
    </ListItem>
  );
};
