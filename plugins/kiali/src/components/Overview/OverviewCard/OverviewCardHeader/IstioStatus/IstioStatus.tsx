import * as React from 'react';

import { Tooltip } from '@material-ui/core';
import WarningRounded from '@material-ui/icons/WarningRounded';

import {
  ComponentStatus,
  IStatus,
} from '@janus-idp/backstage-plugin-kiali-common';

import { Colors } from '../../../../Icons';
import { IstioStatusList } from './IstioStatusList';

type Props = {
  istioStatus: ComponentStatus[];
};

const ValidToColor = {
  'true-true-true': { color: Colors.error },
  'true-true-false': { color: Colors.error },
  'true-false-true': { color: Colors.error },
  'true-false-false': { color: Colors.error },
  'false-true-true': { htmlColor: Colors.warning },
  'false-true-false': { htmlColor: Colors.warning },
  'false-false-true': { color: Colors.info },
  'false-false-false': { htmlColor: Colors.ok },
};

export const IstioStatus = (props: Props) => {
  const tooltipContent = () => {
    return <IstioStatusList status={props.istioStatus} />;
  };

  const tooltipColor = (): { [key: string]: string } => {
    let coreUnhealthy: boolean = false;
    let addonUnhealthy: boolean = false;
    let notReady: boolean = false;

    Object.keys(props.istioStatus || {}).forEach((compKey: string) => {
      const { status, is_core } = props.istioStatus[compKey as any];
      const isNotReady: boolean = status === IStatus.NotReady;
      const isUnhealthy: boolean = status !== IStatus.Healthy && !isNotReady;

      if (is_core) {
        coreUnhealthy = coreUnhealthy || isUnhealthy;
      } else {
        addonUnhealthy = addonUnhealthy || isUnhealthy;
      }

      notReady = notReady || isNotReady;
    });

    return ValidToColor[`${coreUnhealthy}-${addonUnhealthy}-${notReady}`];
  };

  const healthyComponents = () => {
    return props.istioStatus.reduce(
      (healthy: boolean, compStatus: ComponentStatus) => {
        return healthy && compStatus.status === IStatus.Healthy;
      },
      true,
    );
  };

  return !healthyComponents() ? (
    <Tooltip placement="right" title={tooltipContent()}>
      <div>
        <WarningRounded {...tooltipColor()} style={{ marginRight: -8 }} />
      </div>
    </Tooltip>
  ) : null;
};

export default IstioStatus;
