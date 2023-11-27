import React from 'react';

import { CardHeader, Chip } from '@material-ui/core';

import { serverConfig } from '../../../config';
import { CanaryUpgradeStatus } from '../../../types/IstioObjects';
import { ComponentStatus } from '../../../types/IstioStatus';
import { NamespaceInfo } from '../NamespaceInfo';
import { ControlPlaneBadge } from './ControlPlaneBadge';
import { ControlPlaneVersionBadge } from './ControlPlaneVersionBadge';

type NamespaceHeaderProps = {
  namespace: NamespaceInfo;
  istioAPIEnabled?: boolean;
  canaryUpgradeStatus?: CanaryUpgradeStatus;
  istioStatus: ComponentStatus[];
};

export const NamespaceHeader = (props: NamespaceHeaderProps) => {
  const isIstioSystem = serverConfig.istioNamespace === props.namespace.name;

  const hasCanaryUpgradeConfigured = (): boolean => {
    return props.canaryUpgradeStatus
      ? props.canaryUpgradeStatus.pendingNamespaces.length > 0 ||
          props.canaryUpgradeStatus.migratedNamespaces.length > 0
      : false;
  };
  return (
    <CardHeader
      title={
        <>
          {props.namespace.name}
          {isIstioSystem && (
            <ControlPlaneBadge
              cluster={props.namespace.cluster}
              annotations={props.namespace.annotations}
              status={props.istioStatus}
            />
          )}
          {!props.istioAPIEnabled && (
            <Chip
              label="Istio API disabled"
              style={{ color: 'orange', marginLeft: 10 }}
              size="small"
            />
          )}
        </>
      }
      subheader={
        <>
          {props.namespace.name !== serverConfig.istioNamespace &&
            hasCanaryUpgradeConfigured() &&
            props.canaryUpgradeStatus?.migratedNamespaces.includes(
              props.namespace.name,
            ) && (
              <ControlPlaneVersionBadge
                version={props.canaryUpgradeStatus.upgradeVersion}
                isCanary
              />
            )}
          {props.namespace.name !== serverConfig.istioNamespace &&
            hasCanaryUpgradeConfigured() &&
            props.canaryUpgradeStatus?.pendingNamespaces.includes(
              props.namespace.name,
            ) && (
              <ControlPlaneVersionBadge
                version={props.canaryUpgradeStatus.currentVersion}
                isCanary={false}
              />
            )}
          {props.namespace.name === serverConfig.istioNamespace &&
            !props.istioAPIEnabled && (
              <Chip
                label="Istio API disabled"
                style={{ color: 'orange', marginLeft: 10 }}
                size="small"
              />
            )}
        </>
      }
    />
  );
};
