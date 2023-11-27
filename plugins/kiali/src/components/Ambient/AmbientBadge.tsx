import * as React from 'react';

import { Chip, Tooltip } from '@material-ui/core';

type AmbientLabelProps = {
  style?: React.CSSProperties;
  tooltip: string;
};

export const AmbientBadge = (props: AmbientLabelProps) => {
  const iconComponent = (
    <span style={props.style}>
      <Chip label="Ambient" size="small" color="primary" />
    </span>
  );
  return (
    <Tooltip
      key="tooltip_ambient_label"
      placement="bottom"
      title={props.tooltip}
    >
      {iconComponent}
    </Tooltip>
  );
};
