import React from 'react';

import { Grid, IconButton, Tooltip } from '@material-ui/core';
import Refresh from '@material-ui/icons/Refresh';

type Props = {
  hideNamespaceSelector?: boolean;
  elements?: JSX.Element[];
  showClusterSelector?: boolean;
  onRefresh: () => void;
};

export const DefaultSecondaryMasthead: React.FC<Props> = (props: Props) => {
  const refresh = (
    <Tooltip title="Refresh" style={{ marginTop: '25px', float: 'left' }}>
      <IconButton
        color="primary"
        aria-label="upload picture"
        component="label"
        onClick={props.onRefresh}
      >
        <Refresh />
      </IconButton>
    </Tooltip>
  );

  return (
    <Grid container spacing={1} direction="row">
      {props.elements?.map(element => {
        return element;
      })}
      <Grid item xs={1}>
        {refresh}
      </Grid>
    </Grid>
  );
};
