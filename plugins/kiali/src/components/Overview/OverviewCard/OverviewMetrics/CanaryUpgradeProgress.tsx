import React from 'react';

import { Tooltip } from '@material-ui/core';
import InfoRounded from '@material-ui/icons/InfoRounded';
import {
  ChartDonutUtilization,
  ChartThemeColor,
} from '@patternfly/react-charts';

import { CanaryUpgradeStatus } from '@janus-idp/backstage-plugin-kiali-common';

type CanaryUpgradeProgressProps = {
  canaryUpgradeStatus: CanaryUpgradeStatus;
};
export const CanaryUpgradeProgress = (props: CanaryUpgradeProgressProps) => {
  const total =
    props.canaryUpgradeStatus.migratedNamespaces.length +
    props.canaryUpgradeStatus.pendingNamespaces.length;
  const migrated =
    total > 0
      ? (props.canaryUpgradeStatus.migratedNamespaces.length * 100) / total
      : 0;

  return (
    <div style={{ textAlign: 'center' }} data-test="canary-upgrade">
      <>
        <>
          Canary upgrade status
          <Tooltip
            aria-label="mTLS status"
            title={`There is an in progress canary upgrade from version "${props.canaryUpgradeStatus.currentVersion}" to version "${props.canaryUpgradeStatus.upgradeVersion}"`}
            placement="right"
          >
            <InfoRounded />
          </Tooltip>
        </>
        <div style={{ height: 180 }}>
          <ChartDonutUtilization
            ariaDesc="Canary upgrade status"
            ariaTitle="Canary upgrade status"
            constrainToVisibleArea
            data={{ x: 'Migrated namespaces', y: migrated }}
            labels={({ datum }) =>
              datum.x ? `${datum.x}: ${datum.y.toFixed(2)}%` : null
            }
            invert
            title={`${migrated.toFixed(2)}%`}
            height={170}
            themeColor={ChartThemeColor.green}
          />
        </div>
        <>
          <p>{`${props.canaryUpgradeStatus.migratedNamespaces.length} of ${total} namespaces migrated`}</p>
        </>
      </>
    </div>
  );
};
