import * as React from 'react';

import {
  ComponentStatus,
  IStatus,
} from '@janus-idp/backstage-plugin-kiali-common';

import { IstioComponentStatus } from './IstioComponentStatus';

type Props = {
  status: ComponentStatus[];
};

export const IstioStatusList = (props: Props) => {
  const nonhealthyComponents = () => {
    return props.status.filter(
      (c: ComponentStatus) => c.status !== IStatus.Healthy,
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
      groups[group]().map(status => (
        <IstioComponentStatus
          key={`status-${group}-${status.name}`}
          componentStatus={status}
        />
      )),
    );
  };

  return (
    <div>
      <h4>Istio Components Status</h4>
      <ul style={{ listStyleType: 'none', marginLeft: -40 }}>
        {renderComponentList()}
      </ul>
    </div>
  );
};
