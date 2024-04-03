import React from 'react';

import { Tooltip } from '@material-ui/core';

import { KialiIcon } from '../../../config';
import { infoStyle } from './CanaryUpgradeProgress';

type NamespaceLabelsprops = {
  labels?: { [key: string]: string };
};
export const NamespaceLabels = (props: NamespaceLabelsprops) => {
  const labelsLength = props.labels
    ? `${Object.entries(props.labels).length}`
    : 'No';
  const tooltipTitle = (
    <ul>
      {Object.entries(props.labels || []).map(([key, value]) => (
        <li key={key}>
          {key}={value}
        </li>
      ))}
    </ul>
  );
  return props.labels ? (
    <>
      <div id="labels_info" style={{ display: 'inline' }}>
        {labelsLength} label{labelsLength !== '1' ? 's' : ''}
      </div>
      <Tooltip title={tooltipTitle} placement="right">
        <span>
          <KialiIcon.Info className={infoStyle} />
        </span>
      </Tooltip>
    </>
  ) : (
    <div style={{ textAlign: 'left' }}>No labels</div>
  );
};
