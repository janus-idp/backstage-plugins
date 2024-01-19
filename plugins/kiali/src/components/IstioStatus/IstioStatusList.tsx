import * as React from 'react';

import { List, Typography } from '@material-ui/core';

import { ComponentStatus, Status } from '../../types/IstioStatus';
import { IstioComponentStatus } from './IstioComponentStatus';

type Props = {
  status: ComponentStatus[];
};

export const IstioStatusList = (props: Props) => {
  const nonhealthyComponents = () => {
    return props.status.filter(
      (c: ComponentStatus) => c.status !== Status.Healthy,
    );
  };

  const coreComponentsStatus = () => {
    return nonhealthyComponents().filter((s: ComponentStatus) => s.is_core);
  };

  const addonComponentsStatus = () => {
    return nonhealthyComponents().filter((s: ComponentStatus) => !s.is_core);
  };

  const renderComponentList = () => {
    const groups = {
      core: coreComponentsStatus,
      addon: addonComponentsStatus,
    };

    return ['core', 'addon'].map((group: string) =>
      // @ts-expect-error
      groups[group]().map((status: ComponentStatus) => (
        <IstioComponentStatus
          key={`status-${group}-${status.name}`}
          componentStatus={status}
        />
      )),
    );
  };

  return (
    <div style={{ color: 'white', backgroundColor: 'black' }}>
      <Typography variant="h6">Istio Components Status</Typography>
      <List dense id="istio-status" aria-label="Istio Component List">
        {renderComponentList()}
      </List>
    </div>
  );
};
