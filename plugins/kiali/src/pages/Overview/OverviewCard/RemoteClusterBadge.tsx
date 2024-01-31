import * as React from 'react';

import { Chip } from '@material-ui/core';

export const RemoteClusterBadge = (): React.JSX.Element => {
  return (
    <Chip
      label="Remote Cluster"
      size="small"
      style={{ marginLeft: 5 }}
      color="default"
      variant="outlined"
    />
  );
};
