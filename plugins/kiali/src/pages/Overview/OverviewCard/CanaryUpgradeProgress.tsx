import * as React from 'react';

import { Tooltip } from '@material-ui/core';
import {
  ChartDonutUtilization,
  ChartThemeColor,
} from '@patternfly/react-charts';

import { KialiIcon } from '../../../config/KialiIcon';
import { kialiStyle } from '../../../styles/StyleUtils';
import { CanaryUpgradeStatus } from '../../../types/IstioObjects';

type Props = {
  canaryUpgradeStatus: CanaryUpgradeStatus;
};

export const infoStyle = kialiStyle({
  margin: '0px 0px -1px 4px',
});

export const CanaryUpgradeProgress = (props: Props) => {
  const total =
    props.canaryUpgradeStatus.migratedNamespaces.length +
    props.canaryUpgradeStatus.pendingNamespaces.length;
  const migrated =
    total > 0
      ? (props.canaryUpgradeStatus.migratedNamespaces.length * 100) / total
      : 0;
  return (
    <div
      style={{ textAlign: 'center', paddingTop: '10px' }}
      data-test="canary-upgrade"
    >
      <div>
        <div>
          Canary upgrade status
          <Tooltip
            placement="right"
            title={`There is an in progress canary upgrade from version "${props.canaryUpgradeStatus.currentVersion}" to version "${props.canaryUpgradeStatus.upgradeVersion}"`}
          >
            <span>
              <KialiIcon.Info className={infoStyle} />
            </span>
          </Tooltip>
        </div>
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
        <div>
          <p>{`${props.canaryUpgradeStatus.migratedNamespaces.length} of ${total} namespaces migrated`}</p>
        </div>
      </div>
    </div>
  );
};
