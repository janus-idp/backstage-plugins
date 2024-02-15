import * as React from 'react';

import { Tooltip } from '@material-ui/core';

import { icons } from '../../config/Icons';
import { KialiIcon } from '../../config/KialiIcon';
import { serverConfig } from '../../config/ServerConfig';
import { kialiStyle } from '../../styles/StyleUtils';
import { PFBadge } from '../Pf/PfBadges';

type MissingLabelProps = {
  className?: string;
  missingApp: boolean;
  missingVersion: boolean;
  tooltip: boolean;
};

const infoStyle = kialiStyle({
  marginLeft: '0.5rem',
});

export const MissingLabel: React.FC<MissingLabelProps> = (
  props: MissingLabelProps,
) => {
  const appLabel = serverConfig.istioLabels.appLabelName;
  const versionLabel = serverConfig.istioLabels.versionLabelName;
  const icon = icons.istio.missingLabel.icon;
  const color = icons.istio.missingLabel.color;

  const tooltipContent = (
    <div style={{ textAlign: 'left' }}>
      {props.missingApp && (
        <>
          <div>
            <PFBadge
              badge={{ badge: appLabel }}
              isRead
              style={{ marginRight: 0 }}
            />{' '}
            label is missing. <br />
          </div>
          <div>This workload won't be linked with an application.</div>
        </>
      )}

      {props.missingVersion && (
        <>
          <div>
            <PFBadge
              badge={{ badge: versionLabel }}
              isRead
              style={{ marginRight: 0 }}
            />{' '}
            label is missing. <br />
          </div>
          <div>The label is recommended as it affects telemetry.</div>
        </>
      )}

      <div>
        Missing labels may impact telemetry reported by the Istio proxy.
      </div>
    </div>
  );

  const iconComponent = (
    <span className={props.className}>
      {React.createElement(icon, { style: { color: color } })}

      {!props.tooltip && (
        <span style={{ marginLeft: '0.5rem' }}>
          {/* eslint-disable-next-line no-nested-ternary */}
          Missing{' '}
          {props.missingApp
            ? 'App'
            : props.missingVersion
            ? 'Version'
            : 'Label'}
          <Tooltip key="tooltip_missing_label" title={tooltipContent}>
            <div className={props.className}>
              <KialiIcon.Info className={infoStyle} />
            </div>
          </Tooltip>
        </span>
      )}
    </span>
  );

  return props.tooltip ? (
    <Tooltip key="tooltip_missing_label" title={tooltipContent}>
      <div className={props.className}>{iconComponent}</div>
    </Tooltip>
  ) : (
    iconComponent
  );
};
