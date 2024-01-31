import React from 'react';

import { Tooltip } from '@material-ui/core';

import { PFColors } from '../../../components/Pf/PfColors';

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
    <Tooltip title={tooltipTitle} placement="right">
      <div id="labels_info" style={{ display: 'inline', color: PFColors.Link }}>
        {labelsLength} label{labelsLength !== '1' ? 's' : ''}
      </div>
    </Tooltip>
  ) : (
    <div style={{ textAlign: 'left' }}>No labels</div>
  );
};
